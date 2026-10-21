import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Crop, Market, CropPrice, User, UserFeedback } from '../types/apmc';
import { INITIAL_CROPS, INITIAL_MARKETS, INITIAL_PRICES, generateSeedCropPrices } from '../data/seedData';

// Local storage keys
const STORAGE_KEYS = {
  CROPS: 'apmc_crops_v1',
  MARKETS: 'apmc_markets_v1',
  PRICES: 'apmc_prices_v1',
  CONFIG: 'apmc_supabase_config_v1',
  DEMO_AUTH: 'apmc_demo_auth_user_v1',
  FEEDBACKS: 'apmc_feedbacks_v1',
};

// Check if user has saved credentials in localStorage or Vite env
const savedConfigStr = localStorage.getItem(STORAGE_KEYS.CONFIG);
const savedConfig = savedConfigStr ? JSON.parse(savedConfigStr) : null;

export const SUPABASE_URL = savedConfig?.url || (import.meta as any).env?.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = savedConfig?.anonKey || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  SUPABASE_URL.startsWith('http') && 
  !SUPABASE_URL.includes('your-project')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// ============================================================================
// Local Storage Persistence Helpers (Fallback & Offline Resilient Storage)
// ============================================================================

export function getStoredCrops(): Crop[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CROPS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CROPS, JSON.stringify(INITIAL_CROPS));
      return INITIAL_CROPS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading crops from storage', e);
    return INITIAL_CROPS;
  }
}

export function saveStoredCrops(crops: Crop[]): void {
  localStorage.setItem(STORAGE_KEYS.CROPS, JSON.stringify(crops));
}

export function getStoredMarkets(): Market[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MARKETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MARKETS, JSON.stringify(INITIAL_MARKETS));
      return INITIAL_MARKETS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading markets from storage', e);
    return INITIAL_MARKETS;
  }
}

export function saveStoredMarkets(markets: Market[]): void {
  localStorage.setItem(STORAGE_KEYS.MARKETS, JSON.stringify(markets));
}

export function getStoredPrices(): CropPrice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRICES);
    
    // Determine the expected latest auction trading date
    const today = new Date();
    // If today is Sunday (day 0), APMC Vashi is closed, so latest session is Saturday
    const targetDate = new Date(today);
    if (targetDate.getDay() === 0) {
      targetDate.setDate(targetDate.getDate() - 1);
    }
    const targetDateStr = targetDate.toISOString().split('T')[0];

    if (!raw) {
      const fresh = generateSeedCropPrices();
      localStorage.setItem(STORAGE_KEYS.PRICES, JSON.stringify(fresh));
      return fresh;
    }

    const parsed: CropPrice[] = JSON.parse(raw);
    
    // Check if the stored prices have records up to the latest date
    const hasLatest = parsed.some(p => p.date === targetDateStr);
    if (!hasLatest) {
      // Regenerate with current latest prices to guarantee up-to-date mandi rates
      const fresh = generateSeedCropPrices();
      localStorage.setItem(STORAGE_KEYS.PRICES, JSON.stringify(fresh));
      return fresh;
    }

    return parsed;
  } catch (e) {
    console.error('Error reading prices from storage', e);
    const fresh = generateSeedCropPrices();
    return fresh;
  }
}

export function saveStoredPrices(prices: CropPrice[]): void {
  localStorage.setItem(STORAGE_KEYS.PRICES, JSON.stringify(prices));
}

export function resetToSeedData(): { crops: Crop[]; markets: Market[]; prices: CropPrice[] } {
  localStorage.setItem(STORAGE_KEYS.CROPS, JSON.stringify(INITIAL_CROPS));
  localStorage.setItem(STORAGE_KEYS.MARKETS, JSON.stringify(INITIAL_MARKETS));
  localStorage.setItem(STORAGE_KEYS.PRICES, JSON.stringify(INITIAL_PRICES));
  return {
    crops: INITIAL_CROPS,
    markets: INITIAL_MARKETS,
    prices: INITIAL_PRICES,
  };
}

// ============================================================================
// Unified Database Operations (Supabase with Local Resilient Fallback)
// ============================================================================

export async function fetchCrops(): Promise<Crop[]> {
  if (supabase && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('crops').select('*').order('name');
      if (!error && data && data.length > 0) {
        return data as Crop[];
      }
    } catch (err) {
      console.warn('Supabase fetch crops failed, using local storage fallback:', err);
    }
  }
  return getStoredCrops();
}

export async function fetchMarkets(): Promise<Market[]> {
  if (supabase && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('markets').select('*').order('is_primary', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as Market[];
      }
    } catch (err) {
      console.warn('Supabase fetch markets failed, using local storage fallback:', err);
    }
  }
  return getStoredMarkets();
}

export async function fetchCropPrices(): Promise<CropPrice[]> {
  if (supabase && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('crop_prices')
        .select(`
          id,
          crop_id,
          market_id,
          date,
          min_price,
          max_price,
          modal_price,
          unit,
          arrivals_quintal,
          source,
          data_type,
          crops (name, category),
          markets (name)
        `)
        .order('date', { ascending: false });

      if (!error && data && data.length > 0) {
        // Map joined relation to flat CropPrice shape
        return data.map((item: any) => ({
          id: item.id,
          crop_id: item.crop_id,
          crop_name: item.crops?.name || 'Unknown Crop',
          category: item.crops?.category || 'vegetables',
          market_id: item.market_id,
          market_name: item.markets?.name || 'Navi Mumbai APMC',
          date: item.date,
          min_price: Number(item.min_price),
          max_price: Number(item.max_price),
          modal_price: Number(item.modal_price),
          unit: item.unit,
          arrivals_quintal: item.arrivals_quintal ? Number(item.arrivals_quintal) : undefined,
          source: item.source,
          data_type: item.data_type,
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch prices failed, using local storage fallback:', err);
    }
  }
  return getStoredPrices();
}

export async function insertCropPrice(price: Omit<CropPrice, 'id'>): Promise<CropPrice> {
  const newPrice: CropPrice = {
    ...price,
    id: `price-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
  };

  if (supabase && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('crop_prices').insert([
        {
          crop_id: price.crop_id,
          market_id: price.market_id,
          date: price.date,
          min_price: price.min_price,
          max_price: price.max_price,
          modal_price: price.modal_price,
          unit: price.unit,
          arrivals_quintal: price.arrivals_quintal || 0,
          source: price.source,
          data_type: price.data_type,
        }
      ]).select().single();

      if (!error && data) {
        newPrice.id = data.id;
      }
    } catch (err) {
      console.warn('Supabase insert failed, storing locally:', err);
    }
  }

  // Also update local storage cache
  const current = getStoredPrices();
  const existingIndex = current.findIndex(
    p => p.crop_id === newPrice.crop_id && p.market_id === newPrice.market_id && p.date === newPrice.date
  );
  
  let updated: CropPrice[];
  if (existingIndex !== -1) {
    // If a record exists for this crop, market, and date, update it with the user's new rates
    updated = [...current];
    updated[existingIndex] = {
      ...updated[existingIndex],
      ...newPrice,
      id: updated[existingIndex].id,
      updated_at: new Date().toISOString(),
    };
  } else {
    updated = [newPrice, ...current];
  }

  saveStoredPrices(updated);
  return newPrice;
}

export async function updateCropPrice(id: string, updates: Partial<CropPrice>): Promise<void> {
  if (supabase && isSupabaseConfigured) {
    try {
      await supabase.from('crop_prices').update(updates).eq('id', id);
    } catch (err) {
      console.warn('Supabase update failed:', err);
    }
  }

  const current = getStoredPrices();
  const index = current.findIndex(p => p.id === id);
  if (index !== -1) {
    current[index] = { ...current[index], ...updates, updated_at: new Date().toISOString() };
    saveStoredPrices(current);
  }
}

export async function deleteCropPrice(id: string): Promise<void> {
  if (supabase && isSupabaseConfigured) {
    try {
      await supabase.from('crop_prices').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete failed:', err);
    }
  }

  const current = getStoredPrices();
  const filtered = current.filter(p => p.id !== id);
  saveStoredPrices(filtered);
}

export async function insertCrop(crop: Omit<Crop, 'id'>): Promise<Crop> {
  const newCrop: Crop = {
    ...crop,
    id: `crop-${crop.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
  };

  if (supabase && isSupabaseConfigured) {
    try {
      await supabase.from('crops').insert([newCrop]);
    } catch (e) {
      console.warn('Supabase crop insert failed:', e);
    }
  }

  const current = getStoredCrops();
  if (current.some(c => c.name.toLowerCase() === newCrop.name.toLowerCase())) {
    throw new Error(`Crop with name "${newCrop.name}" already exists.`);
  }

  const updated = [...current, newCrop];
  saveStoredCrops(updated);
  return newCrop;
}

export async function insertMarket(market: Omit<Market, 'id'>): Promise<Market> {
  const newMarket: Market = {
    ...market,
    id: `mkt-${market.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
  };

  if (supabase && isSupabaseConfigured) {
    try {
      await supabase.from('markets').insert([newMarket]);
    } catch (e) {
      console.warn('Supabase market insert failed:', e);
    }
  }

  const current = getStoredMarkets();
  if (current.some(m => m.name.toLowerCase() === newMarket.name.toLowerCase())) {
    throw new Error(`Market with name "${newMarket.name}" already exists.`);
  }

  const updated = [...current, newMarket];
  saveStoredMarkets(updated);
  return newMarket;
}

// ============================================================================
// Authentication & Admin Access
// ============================================================================

export function getActiveUser(): User | null {
  const demoAuth = localStorage.getItem(STORAGE_KEYS.DEMO_AUTH);
  if (demoAuth) {
    try {
      return JSON.parse(demoAuth);
    } catch (e) {
      return null;
    }
  }
  return null;
}

export function loginDemoAdmin(): User {
  const adminUser: User = {
    id: 'admin-vashi-01',
    name: 'APMC Market Superintendent',
    email: 'admin@apmc-vashi.org',
    role: 'admin',
    district: 'Thane / Navi Mumbai',
    state: 'Maharashtra',
  };
  localStorage.setItem(STORAGE_KEYS.DEMO_AUTH, JSON.stringify(adminUser));
  return adminUser;
}

export function loginDemoFarmer(): User {
  const farmerUser: User = {
    id: 'farmer-mh-2026-982',
    name: 'Ramesh Balasaheb Patil',
    email: 'ramesh.patil.farmer@kisanmail.in',
    phone: '+91 98223 45120',
    role: 'farmer',
    district: 'Nashik',
    state: 'Maharashtra',
    cropsGrown: ['Onion', 'Tomato', 'Pomegranate'],
    farmSizeAcres: 6.5,
  };
  localStorage.setItem(STORAGE_KEYS.DEMO_AUTH, JSON.stringify(farmerUser));
  return farmerUser;
}

export function loginDemoSeller(): User {
  const sellerUser: User = {
    id: 'trader-vashi-g42',
    name: 'Suresh Agarwal',
    email: 'agarwal.traders.vashi@apmc.org',
    phone: '+91 98201 88432',
    role: 'seller',
    district: 'Navi Mumbai',
    state: 'Maharashtra',
    firmName: 'Shree Ganesh Agro Commodity Traders',
    licenseNo: 'MH-APMC-VSH-2018-0442',
    galaNo: 'Gala No. 42, Market-1 (Onion & Potato Yard)',
  };
  localStorage.setItem(STORAGE_KEYS.DEMO_AUTH, JSON.stringify(sellerUser));
  return sellerUser;
}

export function loginCustomUser(user: User): User {
  localStorage.setItem(STORAGE_KEYS.DEMO_AUTH, JSON.stringify(user));
  return user;
}

export function logoutUser(): void {
  localStorage.removeItem(STORAGE_KEYS.DEMO_AUTH);
  if (supabase) {
    supabase.auth.signOut().catch(() => {});
  }
}

// ============================================================================
// Farmer & Trader Feedback System
// ============================================================================

const DEFAULT_FEEDBACKS: UserFeedback[] = [
  {
    id: 'fb-seed-1',
    userRole: 'farmer',
    userName: 'Vitthal Jadhav',
    district: 'Narayangaon, Pune',
    phone: '+91 98231 ••••',
    rating: 5,
    category: 'price_accuracy',
    message: 'वाशी मार्केटचे टोमॅटोचे दर एकदम अचूक आहेत. सकाळी १० वाजताच आजचा लिलाव भाव समजल्यामुळे आम्हाला माल पाठवण्याचा योग्य निर्णय घेता आला. अतिशय उपयुक्त पोर्टल!',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'fb-seed-2',
    userRole: 'trader',
    userName: 'Mahesh Kulkarni',
    district: 'Navi Mumbai',
    rating: 5,
    category: 'mandi_facilities',
    message: 'The electronic display and daily arrival bulletin in Vashi APMC has brought real transparency between buyers and farmers. Very good digital initiative.',
    createdAt: new Date(Date.now() - 3600000 * 42).toISOString(),
  },
  {
    id: 'fb-seed-3',
    userRole: 'farmer',
    userName: 'सुनील शिंदे',
    district: 'Lasalgaon, Nashik',
    phone: '+91 94222 ••••',
    rating: 4,
    category: 'ease_of_use',
    message: 'मराठी भाषेचा पर्याय दिल्याबद्दल खूप धन्यवाद. कांदा आणि लसणाचे दर सहज समजतात. नफा कॅल्क्युलेटर खूप फायदेशीर आहे.',
    createdAt: new Date(Date.now() - 3600000 * 70).toISOString(),
  }
];

export function getStoredFeedbacks(): UserFeedback[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FEEDBACKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(DEFAULT_FEEDBACKS));
      return DEFAULT_FEEDBACKS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading feedbacks from storage', e);
    return DEFAULT_FEEDBACKS;
  }
}

export function saveFeedback(feedbackData: Omit<UserFeedback, 'id' | 'createdAt'>): UserFeedback {
  const current = getStoredFeedbacks();
  const newFeedback: UserFeedback = {
    ...feedbackData,
    id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };

  const updated = [newFeedback, ...current];
  localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(updated));
  return newFeedback;
}

export function saveCustomSupabaseConfig(url: string, anonKey: string): void {
  localStorage.setItem(
    STORAGE_KEYS.CONFIG,
    JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() })
  );
  window.location.reload();
}

export function clearCustomSupabaseConfig(): void {
  localStorage.removeItem(STORAGE_KEYS.CONFIG);
  window.location.reload();
}
