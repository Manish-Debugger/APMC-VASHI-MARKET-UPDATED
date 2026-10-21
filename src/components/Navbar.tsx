import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sprout, 
  TrendingUp, 
  Table, 
  GitCompare, 
  Calculator, 
  BarChart3, 
  Info, 
  ShieldCheck, 
  Database, 
  Menu, 
  X,
  Lock,
  UserCheck,
  Bot,
  MessageSquare,
  Globe,
  Sparkles,
  User as UserIcon
} from 'lucide-react';
import { User } from '../types/apmc';
import { isSupabaseConfigured } from '../lib/supabase';
import { useLanguage, Language } from '../context/LanguageContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onOpenConfigModal: () => void;
  onOpenDataStatusModal: () => void;
  onOpenFeedbackModal: () => void;
  onOpenMaiAssistant: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenConfigModal,
  onOpenDataStatusModal,
  onOpenFeedbackModal,
  onOpenMaiAssistant,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: Sprout },
    { id: 'daily-prices', label: t('nav.dailyPrices'), icon: Table },
    { id: 'historical', label: t('nav.historical'), icon: TrendingUp },
    { id: 'comparison', label: t('nav.comparison'), icon: GitCompare },
    { id: 'calculator', label: t('nav.calculator'), icon: Calculator },
    { id: 'insights', label: t('nav.insights'), icon: BarChart3 },
    { id: 'about', label: t('nav.about'), icon: Info },
    { 
      id: 'login', 
      label: currentUser 
        ? (currentUser.role === 'farmer' ? `🌾 ${currentUser.name.split(' ')[0]}` : currentUser.role === 'seller' || currentUser.role === 'trader' ? `💼 ${currentUser.name.split(' ')[0]}` : `🏛️ Admin`) 
        : (language === 'mr' ? 'लॉगिन' : language === 'hi' ? 'लॉगिन' : 'Login'), 
      icon: currentUser ? UserCheck : UserIcon 
    },
    { id: 'admin', label: t('nav.admin'), icon: currentUser?.role === 'admin' ? ShieldCheck : Lock },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Context Notification Bar with Language Switcher */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-1.5 px-4 sm:px-8 border-b border-emerald-900/50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Market Status and Title */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-emerald-200">{t('topbar.location')}</span>
            <span className="hidden sm:inline text-emerald-600">|</span>
            <span className="hidden sm:inline text-emerald-300">{t('topbar.bulletin')}</span>
          </div>
          
          {/* Controls: Language Switcher, Feedback, Data Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Multi-Language Selector (English / मराठी / हिंदी) */}
            <div className="flex items-center bg-emerald-900/90 rounded-lg p-0.5 border border-emerald-700/60 text-[11px]">
              <Globe className="w-3 h-3 text-emerald-300 ml-1.5 mr-1" />
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                  language === 'en'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-emerald-300 hover:text-white'
                }`}
                title="Switch to English"
              >
                English
              </button>
              <button
                onClick={() => setLanguage('mr')}
                className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                  language === 'mr'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-emerald-300 hover:text-white'
                }`}
                title="मराठीत बदला (Switch to Marathi)"
              >
                मराठी
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                  language === 'hi'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-emerald-300 hover:text-white'
                }`}
                title="हिंदी में बदलें (Switch to Hindi)"
              >
                हिंदी
              </button>
            </div>

            {/* Feedback Button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenFeedbackModal}
              className="text-emerald-300 hover:text-white flex items-center gap-1.5 transition-colors px-2 py-0.5 rounded-md hover:bg-emerald-900/60 border border-emerald-800/80 cursor-pointer"
              title="Share Feedback / अभिप्राय"
            >
              <MessageSquare className="w-3 h-3 text-emerald-400" />
              <span className="font-semibold">{t('topbar.feedback')}</span>
            </motion.button>

            {/* Quick Login in Top Bar */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleNavClick('login')}
              className="text-emerald-200 hover:text-white flex items-center gap-1.5 transition-colors px-2.5 py-0.5 rounded-md bg-emerald-900/80 hover:bg-emerald-800/80 border border-emerald-700/60 cursor-pointer text-[11px] font-bold"
            >
              <UserCheck className="w-3 h-3 text-amber-400" />
              <span>
                {currentUser 
                  ? currentUser.name.split(' ')[0] 
                  : (language === 'mr' ? 'शेतकरी लॉगिन' : language === 'hi' ? 'किसान लॉगिन' : 'Farmer Login')}
              </span>
            </motion.button>

            {/* DB Settings */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenConfigModal}
              className="text-emerald-300 hover:text-white hidden md:flex items-center gap-1 transition-colors px-2 py-0.5 rounded-md hover:bg-emerald-900/60 cursor-pointer"
              title="Database & Supabase Settings"
            >
              <Database className="w-3 h-3" />
              <span className="font-mono text-[11px]">{t('topbar.dbSettings')}</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Spacious Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Brand - Big, Crisp, and Spacious */}
          <div className="flex items-center gap-3 shrink-0">
            <motion.div 
              className="flex items-center gap-3 cursor-pointer select-none"
              onClick={() => handleNavClick('dashboard')}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {/* Logo Emblem Container - strictly constrained size */}
              <div 
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white p-1 border border-slate-200 shadow-md shadow-emerald-950/10 flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-emerald-500/20"
                style={{ width: '56px', height: '56px', minWidth: '56px', minHeight: '56px', maxWidth: '56px', maxHeight: '56px' }}
              >
                <img 
                  src="/apmc-logo.png" 
                  alt="Navi Mumbai APMC Vashi Emblem" 
                  className="w-full h-full object-contain filter drop-shadow-xs hover:scale-105 transition-transform" 
                  style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </div>

              {/* Clean Brand Typography */}
              <div className="shrink-0">
                <span className="text-base sm:text-xl font-black text-slate-900 tracking-tight leading-none font-sans block">
                  {t('brand.title')}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-emerald-700 tracking-wide block mt-0.5">
                  {t('brand.subtitle')}
                </span>
              </div>
            </motion.div>

            {/* Prominent MAI AI Assistant Pill Near Name */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenMaiAssistant}
              className="hidden xl:flex items-center gap-1.5 ml-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md shadow-emerald-700/20 hover:from-emerald-700 hover:to-teal-700 transition-all border border-emerald-400/30 cursor-pointer"
              title="Open MAI Agricultural AI Assistant"
            >
              <Bot className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
              <span>{language === 'mr' ? "🤖 'माई' कृषी AI" : language === 'hi' ? "🤖 'माई' कृषि AI" : '🤖 Ask MAI (AI)'}</span>
              <Sparkles className="w-3 h-3 text-amber-300" />
            </motion.button>
          </div>

          {/* Desktop Nav Links & High-Visibility Login Action */}
          <div className="hidden lg:flex items-center gap-2">
            <nav className="flex items-center gap-0.5 xl:gap-1 relative bg-slate-100/80 p-1 rounded-2xl border border-slate-200/80 shadow-xs">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`relative flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-xl text-xs font-semibold transition-colors duration-150 z-10 cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {/* Sliding Animated Active Pill Background */}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavPill"
                        className="absolute inset-0 bg-emerald-600 rounded-xl shadow-md shadow-emerald-600/30 -z-10"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      />
                    )}

                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Standalone Highlighted Login / Profile Portal Button */}
            {currentUser ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleNavClick('login')}
                className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{currentUser.role === 'farmer' ? `🌾 ${currentUser.name.split(' ')[0]}` : currentUser.role === 'seller' || currentUser.role === 'trader' ? `💼 ${currentUser.name.split(' ')[0]}` : `🏛️ Admin`}</span>
                <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-md uppercase font-mono">
                  {language === 'mr' ? 'खाते' : language === 'hi' ? 'खाता' : 'Account'}
                </span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleNavClick('login')}
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-700/20 cursor-pointer whitespace-nowrap border border-emerald-400/40"
              >
                <UserCheck className="w-4 h-4 text-amber-300" />
                <span>{language === 'mr' ? '🌾 शेतकरी / व्यापारी लॉगिन' : language === 'hi' ? '🌾 किसान / व्यापारी लॉगिन' : '🌾 Farmer & Trader Login'}</span>
              </motion.button>
            )}
          </div>

          {/* Mobile Right Controls: Login, MAI trigger & Hamburger */}
          <div className="lg:hidden flex items-center gap-1.5">
            <button
              onClick={() => handleNavClick('login')}
              className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{currentUser ? 'खाते' : (language === 'mr' ? 'लॉगिन' : language === 'hi' ? 'लॉगिन' : 'Login')}</span>
            </button>

            <button
              onClick={onOpenMaiAssistant}
              className="bg-emerald-600 text-white p-2 rounded-xl flex items-center gap-1 text-xs font-bold shadow-xs cursor-pointer"
              title="Open MAI"
            >
              <Bot className="w-4 h-4" />
              <span className="text-[10px]">MAI</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer with AnimatePresence */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-xl overflow-hidden"
          >
            {/* Mobile Language Switcher Row */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 mb-2">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span>भाषा / Language:</span>
              </span>
              <div className="flex items-center gap-1">
                {(['en', 'mr', 'hi'] as Language[]).map((lng) => (
                  <button
                    key={lng}
                    onClick={() => setLanguage(lng)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      language === lng
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    {lng === 'en' ? 'EN' : lng === 'mr' ? 'मराठी' : 'हिंदी'}
                  </button>
                ))}
              </div>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Mobile Feedback & MAI shortcut in drawer */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenFeedbackModal();
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold hover:bg-slate-200 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>{t('topbar.feedback')}</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenMaiAssistant();
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700 transition-colors"
              >
                <Bot className="w-4 h-4 text-emerald-200" />
                <span>{language === 'mr' ? "'माई' AI" : language === 'hi' ? "'माई' AI" : 'Ask MAI'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
