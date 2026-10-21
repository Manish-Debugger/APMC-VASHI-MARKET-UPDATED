import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sprout, 
  Store, 
  ShieldCheck, 
  UserCheck, 
  ArrowRight, 
  LogOut, 
  FileText, 
  QrCode, 
  CheckCircle2, 
  Sparkles, 
  Phone, 
  MapPin, 
  Layers, 
  Calendar,
  AlertCircle,
  Truck,
  Printer,
  PlusCircle,
  TrendingUp,
  Tag,
  Scale,
  Coins,
  Clock,
  User as UserIcon,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { User, UserRole, Crop, Market, CropPrice, PriceUnit } from '../../types/apmc';
import { loginDemoFarmer, loginDemoSeller, loginCustomUser, logoutUser, insertCropPrice } from '../../lib/supabase';
import { useLanguage } from '../../context/LanguageContext';

interface LoginPageProps {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  crops: Crop[];
  markets: Market[];
  prices: CropPrice[];
  setActiveTab: (tab: string) => void;
  onRefreshData?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  currentUser,
  setCurrentUser,
  crops,
  markets,
  prices,
  setActiveTab,
  onRefreshData,
}) => {
  const { language, t, getCropName } = useLanguage();
  
  // Auth view mode: 'login' or 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeRole, setActiveRole] = useState<'farmer' | 'seller'>('farmer');

  // Login form state
  const [loginPhoneOrEmail, setLoginPhoneOrEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDistrict, setRegDistrict] = useState('Nashik');
  const [regFarmSize, setRegFarmSize] = useState('5');
  const [regCrops, setRegCrops] = useState<string[]>(['Onion', 'Tomato']);
  const [regFirmName, setRegFirmName] = useState('');
  const [regGalaNo, setRegGalaNo] = useState('');

  // Add Price Form State (FOR LOGGED-IN USERS: FARMERS & TRADERS)
  const [selectedCropId, setSelectedCropId] = useState<string>(crops[0]?.id || 'crop-onion');
  const [selectedMarketId, setSelectedMarketId] = useState<string>(markets[0]?.id || 'mkt-vashi');
  const [priceDate, setPriceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [modalPrice, setModalPrice] = useState<string>('2450');
  const [minPrice, setMinPrice] = useState<string>('2100');
  const [maxPrice, setMaxPrice] = useState<string>('2800');
  const [unit, setUnit] = useState<PriceUnit>('₹/Quintal');
  const [arrivals, setArrivals] = useState<string>('150');
  const [lotGrade, setLotGrade] = useState<string>('Grade-1 Super / Export Quality');
  const [isSubmittingPrice, setIsSubmittingPrice] = useState(false);
  const [priceNotice, setPriceNotice] = useState<string | null>(null);

  // User submitted prices history
  const [userAddedPrices, setUserAddedPrices] = useState<CropPrice[]>([]);

  // Gate pass printed notice
  const [gatePassNotice, setGatePassNotice] = useState(false);

  const districts = [
    'Nashik', 'Pune', 'Ahmednagar', 'Satara', 'Sangli', 
    'Solapur', 'Kolhapur', 'Jalgaon', 'Nagpur', 'Aurangabad / Chh. Sambhajinagar', 'Navi Mumbai / Thane'
  ];

  // Auto-fill min and max prices when modal price changes
  const handleModalPriceChange = (val: string) => {
    setModalPrice(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setMinPrice((Math.round((num * 0.88) / 10) * 10).toString());
      setMaxPrice((Math.round((num * 1.15) / 10) * 10).toString());
    }
  };

  // Handle user crop price submission
  const handleUserAddPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalPrice || !selectedCropId) return;

    try {
      setIsSubmittingPrice(true);
      const crop = crops.find(c => c.id === selectedCropId);
      const market = markets.find(m => m.id === selectedMarketId);

      const newPriceRecord = await insertCropPrice({
        crop_id: selectedCropId,
        crop_name: crop?.name || 'Custom Crop',
        category: crop?.category || 'vegetables',
        market_id: selectedMarketId,
        market_name: market?.name || 'Navi Mumbai APMC (Vashi)',
        date: priceDate,
        modal_price: parseFloat(modalPrice),
        min_price: parseFloat(minPrice) || parseFloat(modalPrice) * 0.9,
        max_price: parseFloat(maxPrice) || parseFloat(modalPrice) * 1.1,
        unit: unit,
        arrivals_quintal: parseFloat(arrivals) || 100,
        source: currentUser 
          ? `${currentUser.role === 'farmer' ? '🌾 Farmer Direct Lot' : '💼 Trader Yard Quote'} (${currentUser.name})` 
          : 'Verified Producer Quote',
        data_type: 'official',
        submitted_by: currentUser?.name || 'Registered User',
        lot_grade: lotGrade,
      });

      setUserAddedPrices(prev => [newPriceRecord, ...prev]);
      onRefreshData?.();

      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#059669', '#34d399', '#f59e0b']
      });

      setPriceNotice(`Success! Your price for ${crop?.name} (₹${modalPrice}/${unit.replace('₹/', '')}) has been added to today's APMC Vashi bulletin!`);
      setTimeout(() => setPriceNotice(null), 6000);
    } catch (err: any) {
      console.error(err);
      setPriceNotice(`Notice: ${err.message || 'Price updated in bulletin.'}`);
    } finally {
      setIsSubmittingPrice(false);
    }
  };

  // Sign In submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhoneOrEmail.trim()) return;

    const user: User = {
      id: `usr-${Date.now()}`,
      name: loginPhoneOrEmail.includes('@') ? loginPhoneOrEmail.split('@')[0] : 'Kisan Member',
      email: loginPhoneOrEmail.includes('@') ? loginPhoneOrEmail : `${loginPhoneOrEmail}@kisan.in`,
      phone: loginPhoneOrEmail.includes('@') ? '+91 98223 45120' : loginPhoneOrEmail,
      role: activeRole,
      district: 'Nashik',
      state: 'Maharashtra',
      cropsGrown: ['Onion', 'Tomato'],
      farmSizeAcres: 5,
      firmName: activeRole === 'seller' ? 'Shree Ganesh Agro Traders' : undefined,
      galaNo: activeRole === 'seller' ? 'Gala No. 42, Market-1 Yard' : undefined,
    };

    loginCustomUser(user);
    setCurrentUser(user);
    confetti({ particleCount: 45, spread: 60, origin: { y: 0.6 } });
  };

  // Registration submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) return;

    const user: User = {
      id: `usr-${Date.now()}`,
      name: regName.trim(),
      email: `${regName.toLowerCase().replace(/\s+/g, '.')}.${activeRole}@apmc-user.in`,
      phone: regPhone.trim() || '+91 98XXX XXXXX',
      role: activeRole,
      district: regDistrict,
      state: 'Maharashtra',
      cropsGrown: regCrops,
      farmSizeAcres: parseFloat(regFarmSize) || 4,
      firmName: activeRole === 'seller' ? (regFirmName || `${regName} Trading Co.`) : undefined,
      galaNo: activeRole === 'seller' ? (regGalaNo || 'Gala No. 18, Vashi') : undefined,
    };

    loginCustomUser(user);
    setCurrentUser(user);
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
  };

  const handleQuickFarmer = () => {
    const user = loginDemoFarmer();
    setCurrentUser(user);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
  };

  const handleQuickTrader = () => {
    const user = loginDemoSeller();
    setCurrentUser(user);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
  };

  const handleSignOut = () => {
    logoutUser();
    setCurrentUser(null);
  };

  const toggleCrop = (cropName: string) => {
    if (regCrops.includes(cropName)) {
      setRegCrops(regCrops.filter(c => c !== cropName));
    } else {
      setRegCrops([...regCrops, cropName]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* =========================================================================
          LOGGED IN USER DASHBOARD (WITH PRICE ADDING TOOL & GATE PASS)
         ========================================================================= */}
      {currentUser ? (
        <div className="space-y-6">
          {/* User Welcome Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-700/50">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center p-2 text-3xl shadow-inner shrink-0">
                  {currentUser.role === 'farmer' ? '🌾' : '💼'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 uppercase tracking-wider">
                      {currentUser.role === 'farmer' 
                        ? (language === 'mr' ? 'नोंदणीकृत शेतकरी खाते' : language === 'hi' ? 'पंजीकृत किसान खाता' : 'Registered Farmer Account')
                        : (language === 'mr' ? 'नोंदणीकृत व्यापारी खाते' : language === 'hi' ? 'पंजीकृत व्यापारी खाता' : 'Registered Trader Account')}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-emerald-300 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{language === 'mr' ? 'सक्रिय युजर' : language === 'hi' ? 'सक्रिय सदस्य' : 'Active User'}</span>
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                    {currentUser.name}
                  </h1>
                  <p className="text-xs text-emerald-200/90 mt-0.5 flex flex-wrap items-center gap-3">
                    {currentUser.district && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                        <span>{currentUser.district}, {currentUser.state || 'Maharashtra'}</span>
                      </span>
                    )}
                    {currentUser.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-300" />
                        <span>{currentUser.phone}</span>
                      </span>
                    )}
                    {currentUser.firmName && (
                      <span className="flex items-center gap-1">
                        <Store className="w-3.5 h-3.5 text-emerald-300" />
                        <span>{currentUser.firmName} ({currentUser.galaNo})</span>
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSignOut}
                  className="bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-white/20 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{language === 'mr' ? 'बाहेर पडा (Sign Out)' : language === 'hi' ? 'लॉगआउट' : 'Sign Out'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* PRIMARY FEATURE: USER CAN DIRECTLY ADD & REPORT TODAY'S COMMODITY PRICES */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/40 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center p-2 shadow-md shadow-emerald-600/30">
                  <PlusCircle className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {language === 'mr' ? 'शेतकरी व व्यापारी थेट भाव नोंदणी' : language === 'hi' ? 'किसान व व्यापारी लाइव भाव प्रविष्टि' : 'User Commodity Price Entry'}
                  </span>
                  <h2 className="text-xl font-black text-slate-900 mt-1">
                    {language === 'mr' ? 'आजचा शेतीमाल भाव जोडा / अपडेट करा' : language === 'hi' ? 'आज का मंडी भाव दर्ज करें' : 'Post / Add Today\'s Commodity Price'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {language === 'mr' 
                      ? 'तुम्ही आज वाशी बाजारात विकलेला किंवा मिळालेला प्रत्यक्ष भाव जोडा. हा दर संपूर्ण पोर्टलवर लाइव्ह अपडेट होईल.' 
                      : language === 'hi' 
                      ? 'आज वाशी मंडी में अपनी फसल का वास्तविक बिका हुआ भाव दर्ज करें। यह पोर्टल पर तुरंत लाइव होगा।' 
                      : 'As a verified user, you can post your today\'s cleared spot rate. It will immediately reflect in the Daily Prices table, charts, and MAI AI!'}
                  </p>
                </div>
              </div>
            </div>

            {/* Price Feedback Alert */}
            <AnimatePresence>
              {priceNotice && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2.5 shadow-sm"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{priceNotice}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* User Add Price Form */}
            <form onSubmit={handleUserAddPrice} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Crop Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'mr' ? 'शेतमाल निवडा *' : language === 'hi' ? 'फसल चुनें *' : 'Select Commodity *'}</span>
                  </label>
                  <select
                    value={selectedCropId}
                    onChange={(e) => setSelectedCropId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    {crops.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon || '🌾'} {c.name} {c.local_name ? `(${c.local_name})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Market Yard Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'mr' ? 'बाजार यार्ड' : language === 'hi' ? 'मंडी यार्ड' : 'Market Yard'}</span>
                  </label>
                  <select
                    value={selectedMarketId}
                    onChange={(e) => setSelectedMarketId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    {markets.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Trading Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'mr' ? 'तारीख' : language === 'hi' ? 'तारीख' : 'Trading Date'}</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={priceDate}
                    onChange={(e) => setPriceDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Price Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                <div>
                  <label className="block text-xs font-black text-emerald-950 mb-1">
                    {language === 'mr' ? 'मोडल (सरासरी) भाव *' : language === 'hi' ? 'मोडल (औसत) भाव *' : 'Modal Price *'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">₹</span>
                    <input
                      type="number"
                      required
                      value={modalPrice}
                      onChange={(e) => handleModalPriceChange(e.target.value)}
                      placeholder="2450"
                      className="w-full bg-white border border-emerald-300 rounded-xl pl-7 pr-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden shadow-xs"
                    />
                  </div>
                  <span className="text-[10px] text-emerald-700 mt-1 block">
                    ~₹{(parseFloat(modalPrice || '0') / 100).toFixed(2)}/kg
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'mr' ? 'किमान भाव (Min)' : language === 'hi' ? 'न्यूनतम भाव' : 'Min Price'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="2100"
                      className="w-full bg-white border border-slate-200 rounded-xl pl-7 pr-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'mr' ? 'कमाल भाव (Max)' : language === 'hi' ? 'अधिकतम भाव' : 'Max Price'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="2800"
                      className="w-full bg-white border border-slate-200 rounded-xl pl-7 pr-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'mr' ? 'एकक (Unit)' : language === 'hi' ? 'इकाई (Unit)' : 'Unit'}
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="₹/Quintal">₹ / Quintal (१०० किलो)</option>
                    <option value="₹/Kg">₹ / Kg (१ किलो)</option>
                    <option value="₹/Crate">₹ / Crate (२० किलो)</option>
                    <option value="₹/Dozen">₹ / Dozen</option>
                  </select>
                </div>
              </div>

              {/* Lot Details: Quantity & Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'mr' ? 'आवक / लॉट प्रमाण (क्विंटल)' : language === 'hi' ? 'आवक / मात्रा (क्विंटल)' : 'Lot Quantity / Arrivals (Quintals)'}</span>
                  </label>
                  <input
                    type="number"
                    value={arrivals}
                    onChange={(e) => setArrivals(e.target.value)}
                    placeholder="150"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'mr' ? 'प्रत / लॉट व्हरायटी' : language === 'hi' ? 'क्वालिटी / लॉट ग्रेड' : 'Lot Grade / Variety'}</span>
                  </label>
                  <input
                    type="text"
                    value={lotGrade}
                    onChange={(e) => setLotGrade(e.target.value)}
                    placeholder="Grade-1 Super / Nashik Big / Export Size"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Submit Price Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>
                    {language === 'mr' ? 'नोंदणीकृत युजरद्वारे थेट पडताळणी' : language === 'hi' ? 'सत्यापित उपयोगकर्ता द्वारा प्रविष्टि' : 'Verified by Active User'}
                  </span>
                </span>

                <button
                  type="submit"
                  disabled={isSubmittingPrice || !modalPrice}
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold px-6 py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>
                    {isSubmittingPrice
                      ? 'Updating...'
                      : language === 'mr'
                      ? 'आजचा भाव जोडा व बुलेटिन अपडेट करा'
                      : language === 'hi'
                      ? 'भाव दर्ज करें और अपडेट करें'
                      : 'Publish & Update Today\'s Price'}
                  </span>
                </button>
              </div>
            </form>

            {/* List of User's Recently Added Prices */}
            {userAddedPrices.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'mr' ? 'तुम्ही जोडलेले ताजे भाव:' : language === 'hi' ? 'आपके द्वारा जोड़े गए ताज़ा भाव:' : 'Prices Added by You Today:'}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {userAddedPrices.map((p) => (
                    <div key={p.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block">{p.crop_name}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{p.date} • {p.market_name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-emerald-700 text-sm block">₹{p.modal_price}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{p.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ELECTRONIC MANDI GATE PASS FOR FARMERS */}
          {currentUser.role === 'farmer' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center p-2 text-emerald-700">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {language === 'mr' ? 'वाशी मार्केट यार्ड शेतकरी ई-गेट पास' : language === 'hi' ? 'वाशी मंडी किसान ई-गेट पास' : 'Vashi Mandi Farmer Electronic Entry Pass'}
                    </h3>
                    <p className="text-[11px] text-slate-500">Gate No. 1 Computerized Weighbridge Access</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setGatePassNotice(true);
                    setTimeout(() => setGatePassNotice(false), 4000);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>Download Pass</span>
                </button>
              </div>

              {gatePassNotice && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Gate Pass ready! Authorized for Gate No. 1 entry.</span>
                </div>
              )}

              {/* Pass Card Preview */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-white border-2 border-dashed border-emerald-300 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                <div className="sm:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">शेतकरी नाव / Name</span>
                    <span className="font-bold text-slate-900">{currentUser.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">जिल्हा / District</span>
                    <span className="font-bold text-slate-900">{currentUser.district}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">दिनांक / Date</span>
                    <span className="font-bold text-slate-900">{new Date().toISOString().split('T')[0]}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">पिके / Crops</span>
                    <span className="font-bold text-emerald-700">{currentUser.cropsGrown?.join(', ') || 'Onion'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">यार्ड / Yard</span>
                    <span className="font-bold text-slate-900">Sector 19, Yard 1 & 2</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">सेस सवलत / Cess Rule</span>
                    <span className="font-bold text-emerald-600">0% Commission on Farmer</span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
                  <div className="w-20 h-20 bg-slate-100 rounded-lg p-1.5 border border-slate-200 flex items-center justify-center">
                    <QrCode className="w-full h-full text-slate-800" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-1 font-semibold">
                    APMC-{Math.floor(100000 + Math.random() * 900000)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* =========================================================================
            USER AUTHENTICATION FORM (SIGN IN & REGISTER - FOR REGULAR USERS)
           ========================================================================= */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 p-6 sm:p-8 text-white relative">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 uppercase tracking-wider">
                {language === 'mr' ? 'शेतकरी व व्यापारी खाते' : language === 'hi' ? 'किसान व व्यापारी खाता' : 'User Portal (Farmers & Sellers)'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">
                {authMode === 'login' 
                  ? (language === 'mr' ? 'युजर लॉगिन करा आणि भाव जोडा' : language === 'hi' ? 'यूज़र लॉगिन करें और भाव जोड़ें' : 'User Sign In & Price Submission')
                  : (language === 'mr' ? 'नवीन युजर नोंदणी करा' : language === 'hi' ? 'नया यूज़र रजिस्ट्रेशन' : 'Create Your User Account')}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 leading-relaxed">
                {language === 'mr'
                  ? 'शेतकरी आणि व्यापाऱ्यांना दैनंदिन लिलाव भाव थेट पोर्टलवर जोडण्याची, ई-गेट पास मिळवण्याची आणि नफा मोजण्याची सुविधा.'
                  : language === 'hi'
                  ? 'किसानों और व्यापारियों के लिए मंडी में ताज़ा भाव दर्ज करने, ई-गेट पास प्राप्त करने और सीधे सौदे करने की सुविधा।'
                  : 'Empowering growers and wholesale merchants to submit spot prices, track auction clearing, and generate instant mandi passes.'}
              </p>
            </div>

            {/* Quick 1-Click Demo Logins */}
            <div className="mt-6 pt-4 border-t border-emerald-800/80 flex flex-wrap items-center gap-2.5">
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider mr-1">
                {language === 'mr' ? 'झटपट डेमो लॉगिन:' : language === 'hi' ? 'त्वरित डेमो लॉगिन:' : '1-Click Fast Login:'}
              </span>
              <button
                type="button"
                onClick={handleQuickFarmer}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>🌾 {language === 'mr' ? 'शेतकरी (Ramesh Patil)' : language === 'hi' ? 'किसान (Ramesh Patil)' : 'Farmer (Ramesh Patil)'}</span>
              </button>
              <button
                type="button"
                onClick={handleQuickTrader}
                className="bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>💼 {language === 'mr' ? 'व्यापारी (Suresh Agarwal)' : language === 'hi' ? 'व्यापारी (Suresh Agarwal)' : 'Trader (Suresh Agarwal)'}</span>
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {/* Mode Switcher: Sign In vs Register */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`text-sm font-bold pb-2 border-b-2 transition-all cursor-pointer ${
                    authMode === 'login'
                      ? 'border-emerald-600 text-emerald-800'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {language === 'mr' ? 'खाते लॉगिन (Sign In)' : language === 'hi' ? 'साइन इन (Login)' : 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`text-sm font-bold pb-2 border-b-2 transition-all cursor-pointer ${
                    authMode === 'register'
                      ? 'border-emerald-600 text-emerald-800'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {language === 'mr' ? 'नवीन खाते नोंदणी (Sign Up)' : language === 'hi' ? 'नया खाता बनाएं (Register)' : 'New User Registration'}
                </button>
              </div>

              {/* Role selector tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveRole('farmer')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeRole === 'farmer' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  🌾 {language === 'mr' ? 'शेतकरी' : language === 'hi' ? 'किसान' : 'Farmer'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRole('seller')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeRole === 'seller' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  💼 {language === 'mr' ? 'व्यापारी' : language === 'hi' ? 'व्यापारी' : 'Trader'}
                </button>
              </div>
            </div>

            {/* LOGIN FORM */}
            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'mr' ? 'मोबाईल नंबर किंवा ईमेल *' : language === 'hi' ? 'मोबाइल नंबर या ईमेल *' : 'Mobile Number or Email *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={loginPhoneOrEmail}
                    onChange={(e) => setLoginPhoneOrEmail(e.target.value)}
                    placeholder={activeRole === 'farmer' ? 'उदा. 9822345120 किंवा ramesh@kisan.in' : 'उदा. trader@vashi.org'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'mr' ? 'पासवर्ड / पिन *' : language === 'hi' ? 'पासवर्ड / पिन *' : 'Password / PIN *'}
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 transition-all cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>
                      {activeRole === 'farmer' 
                        ? (language === 'mr' ? 'शेतकरी म्हणून लॉगिन करा व भाव जोडा' : language === 'hi' ? 'किसान लॉगिन करें व भाव जोड़ें' : 'Login as Farmer & Add Prices')
                        : (language === 'mr' ? 'व्यापारी म्हणून लॉगिन करा' : language === 'hi' ? 'व्यापारी लॉगिन करें' : 'Login as Trader & Add Prices')}
                    </span>
                  </button>
                </div>
              </form>
            ) : (
              /* REGISTRATION FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-4 max-w-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'mr' ? 'पूर्ण नाव *' : language === 'hi' ? 'पूरा नाम *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Ramesh Patil"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'mr' ? 'मोबाईल नंबर *' : language === 'hi' ? 'मोबाइल नंबर *' : 'Mobile Number *'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 98XXX XXXXX"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'mr' ? 'जिल्हा' : language === 'hi' ? 'ज़िला' : 'District'}
                    </label>
                    <select
                      value={regDistrict}
                      onChange={(e) => setRegDistrict(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      {districts.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  {activeRole === 'farmer' ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {language === 'mr' ? 'शेती क्षेत्र (एकर)' : language === 'hi' ? 'खेत का आकार (एकड़)' : 'Farm Size (Acres)'}
                      </label>
                      <input
                        type="number"
                        value={regFarmSize}
                        onChange={(e) => setRegFarmSize(e.target.value)}
                        placeholder="5"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {language === 'mr' ? 'फर्मचे नाव / गाळा नंबर' : language === 'hi' ? 'फर्म नाम / गाला नंबर' : 'Firm Name / Gala No.'}
                      </label>
                      <input
                        type="text"
                        value={regFirmName}
                        onChange={(e) => setRegFirmName(e.target.value)}
                        placeholder="e.g. Shree Ganesh Agro / Gala #24"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  )}
                </div>

                {activeRole === 'farmer' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {language === 'mr' ? 'तुम्ही पिकवणारी मुख्य पिके निवडा:' : language === 'hi' ? 'अपनी प्रमुख फसलें चुनें:' : 'Select Your Harvested Crops:'}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Onion', 'Tomato', 'Potato', 'Green Chilli', 'Ginger', 'Garlic', 'Pomegranate', 'Apple'].map((crop) => {
                        const isSelected = regCrops.includes(crop);
                        return (
                          <button
                            type="button"
                            key={crop}
                            onClick={() => toggleCrop(crop)}
                            className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-300'
                            }`}
                          >
                            {crop}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 transition-all cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>
                      {language === 'mr' ? 'खाते तयार करा आणि भाव जोडा' : language === 'hi' ? 'खाता बनाएं और भाव दर्ज करें' : 'Create Account & Start Posting Prices'}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
