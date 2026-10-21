import React from 'react';
import { Sprout, ExternalLink, MapPin, Clock, Phone, AlertCircle, MessageSquare, Bot, UserCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  onOpenDataStatusModal: () => void;
  onOpenFeedbackModal: () => void;
  onOpenMaiAssistant: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  setActiveTab, 
  onOpenDataStatusModal,
  onOpenFeedbackModal,
  onOpenMaiAssistant,
}) => {
  const { language, t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-400 mt-16 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Market Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <div 
                className="w-8 h-8 rounded-lg bg-white p-0.5 flex items-center justify-center overflow-hidden shrink-0"
                style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px' }}
              >
                <img src="/apmc-logo.png" alt="APMC Logo" className="w-full h-full object-contain" style={{ maxWidth: '100%', maxHeight: '100%' }} />
              </div>
              <span>{t('brand.title')}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'mr'
                ? 'कृषी उत्पन्न बाजार समिती (APMC) नवी मुंबई (वाशी) घाऊक बाजारभाव आणि शेतीमाल कल विश्लेषण पोर्टल.'
                : language === 'hi'
                ? 'कृषि उपज मंडी समिति (APMC) नवी मुंबई (वाशी) थोक मंडी भाव एवं कृषि जिंस विश्लेषण पोर्टल।'
                : 'Agricultural Produce Market Committee (APMC) Crop Price Information and Trend Analysis System, focused on Navi Mumbai APMC, Vashi.'}
            </p>
            <div className="text-xs space-y-1.5 pt-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Sector 19, Vashi, Navi Mumbai, Maharashtra 400703</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Auction Yards: 04:00 AM – 01:00 PM (Mon–Sat)</span>
              </div>
            </div>
          </div>

          {/* Quick Modules */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">
              {language === 'mr' ? 'प्रमुख विभाग' : language === 'hi' ? 'मुख्य मॉड्यूल' : 'Core Modules'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setActiveTab('daily-prices')} className="hover:text-emerald-400 transition-colors">
                  {t('nav.dailyPrices')}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('historical')} className="hover:text-emerald-400 transition-colors">
                  {t('nav.historical')}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('comparison')} className="hover:text-emerald-400 transition-colors">
                  {t('nav.comparison')}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('calculator')} className="hover:text-emerald-400 transition-colors">
                  {t('nav.calculator')}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('insights')} className="hover:text-emerald-400 transition-colors">
                  {t('nav.insights')}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('login')} className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <span>{language === 'mr' ? '🌾 शेतकरी व व्यापारी लॉगिन' : language === 'hi' ? '🌾 किसान व व्यापारी लॉगिन' : '🌾 Farmer & Trader Portal'}</span>
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('admin')} className="hover:text-emerald-400 transition-colors">
                  {t('nav.admin')}
                </button>
              </li>
            </ul>
          </div>

          {/* Farmer & Trader Services & Feedback */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">
              {language === 'mr' ? 'शेतकरी सेवा व संवाद' : language === 'hi' ? 'किसान सेवा एवं सहायता' : 'Grower Services & Support'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={onOpenFeedbackModal}
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors font-medium"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === 'mr' ? 'शेतकरी अभिप्राय नोंदवा' : language === 'hi' ? 'किसान प्रतिक्रिया दर्ज करें' : 'Farmer & Trader Feedback'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenMaiAssistant}
                  className="text-teal-400 hover:text-teal-300 flex items-center gap-1.5 transition-colors font-medium"
                >
                  <Bot className="w-3.5 h-3.5 text-teal-400" />
                  <span>{language === 'mr' ? "'माई' कृषी AI शी बोला" : language === 'hi' ? "'माई' कृषि AI से पूछें" : 'Talk to MAI (Krishi AI)'}</span>
                </button>
              </li>
              <li>
                <a 
                  href="https://agmarknet.gov.in" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-emerald-400 flex items-center gap-1 transition-colors"
                >
                  <span>AGMARKNET (DMI, GoI)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.msamb.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-emerald-400 flex items-center gap-1 transition-colors"
                >
                  <span>MSAMB (Maharashtra State Ag Marketing)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <button 
                  onClick={onOpenDataStatusModal} 
                  className="text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>Data Integrity & Methodology</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Statutory Disclaimer */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{language === 'mr' ? 'बाजार माहिती सूचना' : language === 'hi' ? 'मंडी परामर्श सूचना' : 'Market Advisory Notice'}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {language === 'mr'
                ? 'हे दर नवी मुंबई एपीएमसी (वाशी) मार्केट यार्डातील प्रत्यक्ष लिलाव व्यवहार व मोडल भावांवर आधारित आहेत. मालाची प्रतवारी, आर्द्रता व आवक यानुसार भावात चढ-उतार होतात. माल पाठवण्यापूर्वी आजचे स्पॉट दर नक्की तपासा.'
                : language === 'hi'
                ? 'यह भाव नवी मुंबई एपीएमसी (वाशी) थोक नीलामी यार्ड के वास्तविक मोडल सौदों पर आधारित हैं। माल की गुणवत्ता और दैनिक आवक के आधार पर उतार-चढ़ाव संभव है।'
                : 'Price reports represent modal transactions recorded in the wholesale yards of Navi Mumbai APMC, Vashi. Prices fluctuate daily based on lot grade, arrival volumes, moisture, and bidding.'}
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} APMC Crop Price Information & Trend Analysis System. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('about')} className="hover:text-slate-300">About Vashi Mandi</button>
            <span>•</span>
            <button onClick={onOpenFeedbackModal} className="hover:text-emerald-400 font-semibold">{t('topbar.feedback')}</button>
            <span>•</span>
            <button onClick={onOpenDataStatusModal} className="hover:text-slate-300">Data Transparency</button>
            <span>•</span>
            <span>Navi Mumbai, India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
