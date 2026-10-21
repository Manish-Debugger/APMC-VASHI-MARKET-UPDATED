import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Star, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  User as UserIcon, 
  MapPin, 
  Phone, 
  ThumbsUp, 
  Heart, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserFeedback } from '../../types/apmc';
import { saveFeedback, getStoredFeedbacks } from '../../lib/supabase';
import { useLanguage } from '../../context/LanguageContext';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [userRole, setUserRole] = useState<UserFeedback['userRole']>('farmer');
  const [userName, setUserName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [category, setCategory] = useState<UserFeedback['category']>('price_accuracy');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'recent'>('form');

  const [recentFeedbacks, setRecentFeedbacks] = useState<UserFeedback[]>(() => getStoredFeedbacks());

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !message.trim()) return;

    const newFb = saveFeedback({
      userRole,
      userName: userName.trim(),
      phone: phone.trim() || undefined,
      district: district.trim() || undefined,
      rating,
      category,
      message: message.trim(),
    });

    setRecentFeedbacks(getStoredFeedbacks());
    setIsSubmitted(true);

    // Fire festive celebration confetti
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#059669', '#34d399', '#f59e0b']
    });
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setMessage('');
    setRating(5);
  };

  const categories = [
    { id: 'price_accuracy', labelEn: 'Mandi Rate Accuracy', labelMr: 'बाजारभाव अचूकता', labelHi: 'मंडी भाव सटीकता' },
    { id: 'ease_of_use', labelEn: 'Ease of Use & Language', labelMr: 'सुलभता व भाषा पर्याय', labelHi: 'उपयोगिता और भाषा' },
    { id: 'new_crop', labelEn: 'Suggest New Crop / Mandi', labelMr: 'नवीन पीक / बाजार जोडा', labelHi: 'नई फसल / मंडी जोड़ें' },
    { id: 'mandi_facilities', labelEn: 'Vashi Yard Facilities & Weighbridge', labelMr: 'वाशी मार्केट यार्ड व वजन काटा', labelHi: 'मंडी सुविधाएं व वे-ब्रिज' },
    { id: 'other', labelEn: 'Other Suggestions', labelMr: 'इतर उपयुक्त सूचना', labelHi: 'अन्य सुझाव' },
  ];

  const ratingDescriptions = [
    { stars: 1, labelEn: 'Needs Major Improvement', labelMr: 'खूप सुधारणा हवी', labelHi: 'काफी सुधार की जरूरत' },
    { stars: 2, labelEn: 'Fair', labelMr: 'साधारण', labelHi: 'सामान्य' },
    { stars: 3, labelEn: 'Good', labelMr: 'चांगले', labelHi: 'अच्छा' },
    { stars: 4, labelEn: 'Very Helpful', labelMr: 'खूप उपयुक्त', labelHi: 'काफी उपयोगी' },
    { stars: 5, labelEn: 'Excellent & Accurate!', labelMr: 'अतिशय उत्कृष्ट व अचूक!', labelHi: 'अति उत्तम व सटीक!' },
  ];

  const currentRatingDesc = ratingDescriptions.find(r => r.stars === (hoverRating || rating));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-emerald-200 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <MessageSquare className="w-4 h-4" />
            <span>
              {language === 'mr' ? 'शेतकरी व ग्राहक संवाद कक्ष' : language === 'hi' ? 'किसान एवं उपभोक्ता संवाद' : 'Farmer & Stakeholder Voice'}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {language === 'mr' ? 'आपला अभिप्राय नोंदवा' : language === 'hi' ? 'अपनी प्रतिक्रिया साझा करें' : 'Share Your Feedback'}
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1 max-w-md">
            {language === 'mr'
              ? 'वाशी एपीएमसी पोर्टल सुधारण्यासाठी आणि शेतकऱ्यांना पारदर्शक भाव मिळवून देण्यासाठी आपल्या सूचना अत्यंत मोलाच्या आहेत.'
              : language === 'hi'
              ? 'वाशी मंडी पोर्टल को अधिक उपयोगी और पारदर्शी बनाने के लिए आपके सुझाव हमारे लिए महत्वपूर्ण हैं।'
              : 'Help us improve daily spot rate transparency and grower facilities across Navi Mumbai APMC (Vashi).'}
          </p>

          {/* Tab selector: Form vs Recent Feedbacks */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-emerald-700/50">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'form' ? 'bg-white text-emerald-950 shadow-xs' : 'text-emerald-200 hover:text-white'
              }`}
            >
              {language === 'mr' ? 'अभिप्राय फॉर्म' : language === 'hi' ? 'प्रतिक्रिया फॉर्म' : 'Feedback Form'}
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'recent' ? 'bg-white text-emerald-950 shadow-xs' : 'text-emerald-200 hover:text-white'
              }`}
            >
              <span>{language === 'mr' ? 'इतर शेतकऱ्यांचे अभिप्राय' : language === 'hi' ? 'हालिया समीक्षाएं' : 'Recent Reviews'}</span>
              <span className="bg-emerald-500/30 text-emerald-200 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {recentFeedbacks.length}
              </span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {activeTab === 'recent' ? (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {recentFeedbacks.map((fb) => (
                <div key={fb.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{fb.userName}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        fb.userRole === 'farmer' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {fb.userRole === 'farmer' ? '🌾 शेतकरी' : fb.userRole === 'trader' ? '💼 व्यापारी' : '👤 युजर'}
                      </span>
                    </div>
                    <div className="flex items-center text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < fb.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      ))}
                    </div>
                  </div>
                  {fb.district && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{fb.district}</span>
                    </div>
                  )}
                  <p className="text-slate-700 leading-relaxed pt-1">{fb.message}</p>
                </div>
              ))}
            </div>
          ) : isSubmitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {language === 'mr' ? 'आपला अभिप्राय यशस्वीरीत्या स्वीकारला गेला!' : language === 'hi' ? 'आपकी प्रतिक्रिया सफलतापूर्वक प्राप्त हुई!' : 'Thank You! Feedback Recorded'}
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                {language === 'mr'
                  ? 'शेतकरी हितासाठी आम्ही आपल्या अभिप्रायाची नोंद घेतली आहे. आपले मोलाचे सहकार्य वाशी बाजाराला अधिक पारदर्शक बनवेल.'
                  : language === 'hi'
                  ? 'वाशी मंडी परिवार आपके सुझाव की कद्र करता है। यह किसानों के लिए बाज़ार व्यवस्था को और बेहतर बनाएगा।'
                  : 'Your submission has been catalogued in our feedback registry. Thank you for contributing to transparent mandi commerce.'}
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  {language === 'mr' ? 'आणखी एक अभिप्राय द्या' : language === 'hi' ? 'एक और प्रतिक्रिया दें' : 'Submit Another'}
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                >
                  {language === 'mr' ? 'पूर्ण झाले' : language === 'hi' ? 'समाप्त' : 'Done & Close'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'mr' ? 'तुमची भूमिका निवडा:' : language === 'hi' ? 'अपनी भूमिका चुनें:' : 'I am a:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'farmer', labelEn: '🌾 Farmer', labelMr: '🌾 शेतकरी', labelHi: '🌾 किसान' },
                    { id: 'seller', labelEn: '💼 Seller/Trader', labelMr: '💼 अडत्या/व्यापारी', labelHi: '💼 व्यापारी' },
                    { id: 'transporter', labelEn: '🚚 Transporter', labelMr: '🚚 वाहतूकदार', labelHi: '🚚 ट्रांसपोर्टर' },
                    { id: 'consumer', labelEn: '🛒 Consumer', labelMr: '🛒 ग्राहक', labelHi: '🛒 उपभोक्ता' },
                  ].map((role) => (
                    <button
                      type="button"
                      key={role.id}
                      onClick={() => setUserRole(role.id as any)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                        userRole === role.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      {language === 'mr' ? role.labelMr : language === 'hi' ? role.labelHi : role.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'mr' ? 'वाशी बाजार माहिती पोर्टल रेटिंग:' : language === 'hi' ? 'पोर्टल रेटिंग दें:' : 'Overall Satisfaction:'}
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 focus:outline-hidden transform hover:scale-115 transition-transform"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= (hoverRating || rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {currentRatingDesc && (
                    <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg ml-2">
                      {language === 'mr' ? currentRatingDesc.labelMr : language === 'hi' ? currentRatingDesc.labelHi : currentRatingDesc.labelEn}
                    </span>
                  )}
                </div>
              </div>

              {/* Feedback Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'mr' ? 'अभिप्राय विषय:' : language === 'hi' ? 'विषय चुनें:' : 'Feedback Category:'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {language === 'mr' ? c.labelMr : language === 'hi' ? c.labelHi : c.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* User Name & District / Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {language === 'mr' ? 'आपले नाव *' : language === 'hi' ? 'आपका नाम *' : 'Your Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder={language === 'mr' ? 'उदा. रमेश पाटील' : language === 'hi' ? 'उदा. राजेश कुमार' : 'e.g. Ramesh Patil'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {language === 'mr' ? 'जिल्हा / तालुका (ऐच्छिक)' : language === 'hi' ? 'ज़िला / क्षेत्र' : 'District / Market'}
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder={language === 'mr' ? 'उदा. नाशिक, पुणे' : language === 'hi' ? 'उदा. नासिक, पुणे' : 'e.g. Nashik, Navi Mumbai'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  {language === 'mr' ? 'आपला संदेश / सूचना *' : language === 'hi' ? 'अपनी राय / सुझाव लिखें *' : 'Your Detailed Feedback *'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    language === 'mr'
                      ? 'उदा. कांद्याचे दर वेळेवर उपलब्ध होतात. लिलाव यार्डात वजन काटा अधिक वाढवल्यास शेतकऱ्यांचा वेळ वाचेल...'
                      : language === 'hi'
                      ? 'उदा. मंडी के दैनिक भाव सटीक हैं। यार्ड में किसानों के ठहरने की सुविधा पर ध्यान दें...'
                      : 'Share your suggestions regarding rate updates, weighbridges, auctions, or portal features...'
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!userName.trim() || !message.trim()}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 text-xs transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {language === 'mr' ? 'अभिप्राय पाठवा' : language === 'hi' ? 'प्रतिक्रिया सबमिट करें' : 'Submit Feedback'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
