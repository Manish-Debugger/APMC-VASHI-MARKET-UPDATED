import React, { createContext, useContext, useState, useEffect } from 'react';
import { Crop } from '../types/apmc';

export type Language = 'en' | 'mr' | 'hi';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  getCropName: (crop: Crop) => string;
  getCategoryName: (category: string) => string;
}

const STORAGE_KEY = 'apmc_language_v1';

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Brand & Header
    'brand.title': 'Navi Mumbai APMC',
    'brand.subtitle': 'Vashi Wholesale Market • Price & Trend Intelligence',
    'topbar.location': 'Navi Mumbai APMC (Vashi)',
    'topbar.bulletin': 'Daily Wholesale Agricultural Commodity Price Bulletin',
    'topbar.verified': 'Verified Vashi Historical Records',
    'topbar.dbSettings': 'DB Settings',
    'topbar.feedback': 'Feedback',
    'topbar.askMai': 'Ask MAI (AI)',

    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.dailyPrices': 'Daily Prices',
    'nav.historical': 'Price History',
    'nav.comparison': 'Comparison',
    'nav.calculator': 'Calculator',
    'nav.insights': 'Trends',
    'nav.about': 'About Vashi',
    'nav.admin': 'Admin',
    'nav.login': 'Login / Account',
    'nav.feedback': 'Feedback',

    // Dashboard Hero & Metrics
    'hero.badge': 'LIVE VASHI MANDI AUCTION BULLETIN',
    'hero.title': 'Daily Agricultural Commodity Intelligence',
    'hero.desc': 'Official wholesale spot rates, auction clearance volumes, and price analytics for Navi Mumbai APMC (Vashi) Market Yards 1 & 2.',
    'hero.todayDate': "Today's Mandi Session",
    'hero.totalCommodities': 'Tracked Commodities',
    'hero.avgModalRate': 'Avg Modal Rate',
    'hero.dailyArrivals': 'Daily Market Arrivals',
    'hero.simulate': 'Simulate Live Auction Tick',
    'hero.viewDaily': 'View Full Daily Table',
    'hero.compare': 'Compare Commodities',

    // Sections
    'section.staples': 'Vashi Mandi Essential Commodities',
    'section.staplesSub': 'Live modal wholesale auction rates for high-volume fruit & vegetable arrivals',
    'section.gainers': 'Top Weekly Gainers',
    'section.gainersSub': 'Commodities with strongest price appreciation over the last 7 days',
    'section.losers': 'Weekly Price Dips / Supply Influx',
    'section.losersSub': 'Cooling prices reflecting heavy arrivals and improved seasonal harvest',
    'section.quickTools': 'Farmer & Trader Action Hub',

    // Labels & Common
    'label.modal': 'Modal Price',
    'label.minMax': 'Min / Max',
    'label.arrivals': 'Arrivals',
    'label.category': 'Category',
    'label.vegetables': 'Vegetables',
    'label.fruits': 'Fruits',
    'label.all': 'All Commodities',
    'label.search': 'Search crop, variety or grade...',
    'label.viewHistory': 'Analyze Trend',
    'label.unit': 'Unit',
    'label.date': 'Date',
    'label.status': 'Status',
    'label.actions': 'Actions',
    'label.logout': 'Sign Out',
    'label.farmer': 'Farmer',
    'label.seller': 'Seller / Trader',
    'label.admin': 'APMC Admin',

    // Feedback
    'feedback.title': 'Farmer & Trader Feedback',
    'feedback.sub': 'Your feedback helps improve transparent pricing and market facilities at Vashi APMC.',
    'feedback.give': 'Share Feedback',
    'feedback.recent': 'Recent Community Feedback',

    // AI Assistant MAI
    'mai.name': 'MAI',
    'mai.title': 'MAI — Vashi Mandi & Krishi AI',
    'mai.tagline': 'Your 24/7 Smart Agricultural Market Intelligence Companion',
    'mai.status': 'Online • Live Vashi Mandi Data',
    'mai.placeholder': 'Ask MAI about mandi rates, selling advice, or market rules...',
    'mai.send': 'Send',
    'mai.suggested': 'Common Farmer Questions:',
  },

  mr: {
    // Brand & Header
    'brand.title': 'नवी मुंबई एपीएमसी',
    'brand.subtitle': 'वाशी घाऊक बाजार • कृषी उत्पन्न भाव व कल विश्लेषण',
    'topbar.location': 'नवी मुंबई एपीएमसी (वाशी)',
    'topbar.bulletin': 'दैनंदिन घाऊक कृषी उत्पन्न बाजारभाव बुलेटिन',
    'topbar.verified': 'प्रमाणित वाशी बाजार आकडेवारी',
    'topbar.dbSettings': 'डेटाबेस सेटिंग्ज',
    'topbar.feedback': 'अभिप्राय',
    'topbar.askMai': "'माई' AI सहाय्यक",

    // Navigation
    'nav.dashboard': 'डॅशबोर्ड',
    'nav.dailyPrices': 'दैनंदिन दर',
    'nav.historical': 'दर इतिहास',
    'nav.comparison': 'तुलना',
    'nav.calculator': 'नफा गणक',
    'nav.insights': 'बाजार ट्रेंड',
    'nav.about': 'वाशी विषयी',
    'nav.admin': 'प्रशासन',
    'nav.login': 'लॉगिन / खाते',
    'nav.feedback': 'अभिप्राय',

    // Dashboard Hero & Metrics
    'hero.badge': 'थेट वाशी बाजार लिलाव बुलेटिन',
    'hero.title': 'दैनंदिन कृषी उत्पन्न व बाजारभाव माहिती',
    'hero.desc': 'नवी मुंबई एपीएमसी (वाशी) मार्केट यार्ड १ व २ चे अधिकृत घाऊक लिलाव भाव, आवक आणि बाजार विश्लेषण.',
    'hero.todayDate': 'आजचे बाजार सत्र',
    'hero.totalCommodities': 'नोंदणीकृत शेतमाल',
    'hero.avgModalRate': 'सरासरी मोडल भाव',
    'hero.dailyArrivals': 'आजची एकूण आवक',
    'hero.simulate': 'थेट लिलाव सिम्युलेटर',
    'hero.viewDaily': 'सर्व दैनंदिन दर पहा',
    'hero.compare': 'भावांची तुलना करा',

    // Sections
    'section.staples': 'वाशी बाजारातील प्रमुख शेतीमाल',
    'section.staplesSub': 'मोठ्या प्रमाणावर आवक होणाऱ्या भाजीपाला व फळांचे थेट घाऊक लिलाव भाव',
    'section.gainers': 'या आठवड्यातील तेजीतील पिके (Gainers)',
    'section.gainersSub': 'गेल्या ७ दिवसांत सर्वाधिक भाववाढ झालेला शेतीमाल',
    'section.losers': 'या आठवड्यातील मंदी / आवक वाढलेली पिके',
    'section.losersSub': 'आवक वाढल्याने दर थोडे उतरलेले शेतीमाल',
    'section.quickTools': 'शेतकरी व व्यापारी उपयुक्त साधने',

    // Labels & Common
    'label.modal': 'मोडल (सरासरी) भाव',
    'label.minMax': 'किमान / कमाल',
    'label.arrivals': 'आवक',
    'label.category': 'विभाग',
    'label.vegetables': 'भाजीपाला',
    'label.fruits': 'फळे',
    'label.all': 'सर्व शेतीमाल',
    'label.search': 'पीक, जात किंवा प्रत शोधा...',
    'label.viewHistory': 'भाव इतिहास पहा',
    'label.unit': 'एकक',
    'label.date': 'तारीख',
    'label.status': 'स्थिती',
    'label.actions': 'कृती',
    'label.logout': 'बाहेर पडा',
    'label.farmer': 'शेतकरी',
    'label.seller': 'अडत्या / व्यापारी',
    'label.admin': 'एपीएमसी प्रशासक',

    // Feedback
    'feedback.title': 'शेतकरी व व्यापारी अभिप्राय',
    'feedback.sub': 'आपल्या अभिप्रायामुळे वाशी बाजारातील पारदर्शकता आणि शेतकरी सुविधा वाढवण्यास मदत होते.',
    'feedback.give': 'अभिप्राय नोंदवा',
    'feedback.recent': 'शेतकऱ्यांचे ताजे अभिप्राय',

    // AI Assistant MAI
    'mai.name': 'माई (MAI)',
    'mai.title': "'माई' — वाशी कृषी व बाजार AI",
    'mai.tagline': 'तुमची २४/७ स्मार्ट शेती व बाजारभाव मार्गदर्शक',
    'mai.status': 'सक्रिय • थेट वाशी बाजार माहिती',
    'mai.placeholder': 'बाजारभाव, माल विक्रीचा सल्ला किंवा नियमांबद्दल विचारा...',
    'mai.send': 'विचारा',
    'mai.suggested': 'शेतकऱ्यांचे नेहमीचे प्रश्न:',
  },

  hi: {
    // Brand & Header
    'brand.title': 'नवी मुंबई एपीएमसी',
    'brand.subtitle': 'वाशी थोक बाज़ार • कृषि जिंस भाव व रुझान',
    'topbar.location': 'नवी मुंबई एपीएमसी (वाशी)',
    'topbar.bulletin': 'दैनिक थोक कृषि जिंस मंडी भाव बुलेटिन',
    'topbar.verified': 'प्रमाणित वाशी मंडी रिकॉर्ड',
    'topbar.dbSettings': 'डेटाबेस सेटिंग्स',
    'topbar.feedback': 'प्रतिक्रिया',
    'topbar.askMai': "'माई' AI सहायक",

    // Navigation
    'nav.dashboard': 'डैशबोर्ड',
    'nav.dailyPrices': 'दैनिक भाव',
    'nav.historical': 'भाव इतिहास',
    'nav.comparison': 'तुलना',
    'nav.calculator': 'मुनाफा कैलकुलेटर',
    'nav.insights': 'बाज़ार रुझान',
    'nav.about': 'वाशी के बारे में',
    'nav.admin': 'प्रशासन',
    'nav.login': 'लॉगिन / खाता',
    'nav.feedback': 'प्रतिक्रिया',

    // Dashboard Hero & Metrics
    'hero.badge': 'लाइव वाशी मंडी नीलामी बुलेटिन',
    'hero.title': 'दैनिक कृषि उपज व थोक मंडी भाव',
    'hero.desc': 'नवी मुंबई एपीएमसी (वाशी) मंडी यार्ड १ व २ के आधिकारिक थोक नीलामी भाव, आवक और बाज़ार विश्लेषण।',
    'hero.todayDate': 'आज का मंडी सत्र',
    'hero.totalCommodities': 'दर्ज कृषि फसलें',
    'hero.avgModalRate': 'औसत मोडल भाव',
    'hero.dailyArrivals': 'आज की कुल आवक',
    'hero.simulate': 'लाइव नीलामी सिम्युलेटर',
    'hero.viewDaily': 'सभी दैनिक भाव देखें',
    'hero.compare': 'भावों की तुलना करें',

    // Sections
    'section.staples': 'वाशी मंडी की प्रमुख फसलें',
    'section.staplesSub': 'भारी मात्रा में आने वाली फल व सब्जियों के लाइव थोक नीलामी भाव',
    'section.gainers': 'इस सप्ताह सबसे तेज़ी वाली फसलें',
    'section.gainersSub': 'पिछले ७ दिनों में सबसे ज्यादा भाव वृद्धि वाली फसलें',
    'section.losers': 'इस सप्ताह आवक बढ़ने से सस्ती फसलें',
    'section.losersSub': 'भारी आवक के कारण किसानों के लिए खरीदारी या भंडारण के संकेत',
    'section.quickTools': 'किसान एवं व्यापारी उपयोगी टूल्स',

    // Labels & Common
    'label.modal': 'मोडल (औसत) भाव',
    'label.minMax': 'न्यूनतम / अधिकतम',
    'label.arrivals': 'आवक',
    'label.category': 'श्रेणी',
    'label.vegetables': 'सब्जियाँ',
    'label.fruits': 'फल',
    'label.all': 'सभी फसलें',
    'label.search': 'फसल, किस्म या ग्रेड खोजें...',
    'label.viewHistory': 'भाव इतिहास देखें',
    'label.unit': 'इकाई',
    'label.date': 'तारीख',
    'label.status': 'स्थिति',
    'label.actions': 'क्रियाएँ',
    'label.logout': 'लॉगआउट',
    'label.farmer': 'किसान',
    'label.seller': 'व्यापारी / आढ़तिया',
    'label.admin': 'मंडी प्रशासक',

    // Feedback
    'feedback.title': 'किसान एवं व्यापारी प्रतिक्रिया',
    'feedback.sub': 'आपकी प्रतिक्रिया वाशी मंडी की पारदर्शी व्यवस्था और किसान सुविधाओं को बेहतर बनाने में सहायक है।',
    'feedback.give': 'प्रतिक्रिया दें',
    'feedback.recent': 'किसानों की हालिया प्रतिक्रियाएँ',

    // AI Assistant MAI
    'mai.name': 'माई (MAI)',
    'mai.title': "'माई' — वाशी कृषि व मंडी AI",
    'mai.tagline': 'आपकी २४/७ स्मार्ट कृषि व मंडी भाव सहायक',
    'mai.status': 'सक्रिय • लाइव वाशी मंडी डेटा',
    'mai.placeholder': 'मंडी भाव, फसल बेचने की सलाह या मंडी नियमों के बारे में पूछें...',
    'mai.send': 'पूछें',
    'mai.suggested': 'किसानों के आम सवाल:',
  }
};

const CROP_LOCAL_NAMES: Record<string, { mr: string; hi: string }> = {
  'crop-onion': { mr: 'कांदा (Onion)', hi: 'प्याज़ (Onion)' },
  'crop-tomato': { mr: 'टोमॅटो (Tomato)', hi: 'टमाटर (Tomato)' },
  'crop-potato': { mr: 'बटाटा (Potato)', hi: 'आलू (Potato)' },
  'crop-green-chilli': { mr: 'हिरवी मिरची', hi: 'हरी मिर्च' },
  'crop-ginger': { mr: 'आले (Adrak)', hi: 'अदरक (Ginger)' },
  'crop-garlic': { mr: 'लसूण (Garlic)', hi: 'लहसुन (Garlic)' },
  'crop-cauliflower': { mr: 'फ्लॉवर (Gobi)', hi: 'फूलगोभी (Cauliflower)' },
  'crop-okra': { mr: 'भेंडी (Bhindi)', hi: 'भिंडी (Okra)' },
  'crop-apple': { mr: 'सफरचंद (Apple)', hi: 'सेब (Apple)' },
  'crop-pomegranate': { mr: 'डाळिंब (Anar)', hi: 'अनार (Pomegranate)' },
  'crop-banana': { mr: 'केळी (Banana)', hi: 'केला (Banana)' },
  'crop-mango': { mr: 'हापूस आंबा (Alphonso)', hi: 'हापुस आम (Alphonso)' },
  'crop-mosambi': { mr: 'मोसंबी (Mosambi)', hi: 'मौसमी (Sweet Lime)' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language;
      if (saved && (saved === 'en' || saved === 'mr' || saved === 'hi')) {
        return saved;
      }
    } catch (e) {
      // Default to English as requested
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      console.warn('Could not save language to storage');
    }
  };

  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || key;
  };

  const getCropName = (crop: Crop): string => {
    if (language === 'en') {
      return crop.name;
    }
    const localized = CROP_LOCAL_NAMES[crop.id]?.[language];
    if (localized) {
      return localized;
    }
    return crop.local_name || crop.name;
  };

  const getCategoryName = (category: string): string => {
    if (category === 'vegetables') {
      return t('label.vegetables');
    }
    if (category === 'fruits') {
      return t('label.fruits');
    }
    return category;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getCropName, getCategoryName }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
