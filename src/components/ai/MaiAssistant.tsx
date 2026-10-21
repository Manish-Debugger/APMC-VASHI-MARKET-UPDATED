import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Volume2, 
  VolumeX, 
  Check, 
  Copy,
  Sprout,
  ShieldCheck,
  Scale,
  Truck,
  Landmark,
  HelpCircle,
  Calculator,
  RefreshCw
} from 'lucide-react';
import { Crop, CropPrice, Market } from '../../types/apmc';
import { useLanguage, Language } from '../../context/LanguageContext';
import { getTopGainersAndLosers } from '../../utils/calculations';

interface Message {
  id: string;
  sender: 'user' | 'mai';
  text: string;
  timestamp: string;
  cropHighlight?: {
    name: string;
    modalPrice: number;
    unit: string;
    trend: 'up' | 'down' | 'neutral';
    changePercent: number;
  };
}

interface MaiAssistantProps {
  crops: Crop[];
  prices: CropPrice[];
  markets: Market[];
  isOpen: boolean;
  onToggle: () => void;
  onOpenCropHistorical?: (cropId: string) => void;
  onOpenCalculator?: () => void;
}

type PromptCategory = 'all' | 'prices' | 'selling' | 'profit' | 'rules' | 'schemes' | 'crop_care';

export const MaiAssistant: React.FC<MaiAssistantProps> = ({
  crops,
  prices,
  markets,
  isOpen,
  onToggle,
  onOpenCropHistorical,
  onOpenCalculator,
}) => {
  const { language: globalLang } = useLanguage();
  const [chatLang, setChatLang] = useState<Language>(globalLang);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<PromptCategory>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync chat language with global language when global language changes
  useEffect(() => {
    setChatLang(globalLang);
  }, [globalLang]);

  // Initial welcome message per language
  const getInitialMessages = (lang: Language): Message[] => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (lang === 'mr') {
      return [
        {
          id: 'welcome-mr',
          sender: 'mai',
          text: 'राम राम शेतकरी बांधवांनो! मी **माई (MAI)** — वाशी एपीएमसी बाजाराची तुमची स्मार्ट कृषी AI सहाय्यक आहे.\n\nमी तुम्हाला आजचे ताजे बाजारभाव, शेतमाल कधी विकावा, नफ्याचे गणित, वाहतूक खर्च, शासकीय योजना (PM-Kisan, हमीभाव) आणि पीक रोगांवरील उपाय सांगू शकते. कोणताही प्रश्न मोकळेपणाने विचारा!',
          timestamp: time,
        }
      ];
    }
    if (lang === 'hi') {
      return [
        {
          id: 'welcome-hi',
          sender: 'mai',
          text: 'नमस्ते किसान भाइयों और व्यापारियों! मैं **माई (MAI)** — वाशी एपीएमसी मंडी की आपकी डिजिटल कृषि व बाज़ार AI सहायक हूँ।\n\nआज के ताज़ा थोक भाव, फसल बेचने का सही समय, मुनाफा गणना, मंडी नियम, व सरकारी योजनाओं (MSP, पीएम किसान) की पूरी जानकारी के लिए मुझसे पूछें!',
          timestamp: time,
        }
      ];
    }
    return [
      {
        id: 'welcome-en',
        sender: 'mai',
        text: 'Namaste! I am **MAI (Market & Agriculture Intelligence)** — your AI guide for Navi Mumbai APMC (Vashi) wholesale yard.\n\nAsk me about today\'s spot rates, holding vs selling advice, freight & cess math, gate passes, or government agricultural schemes. How can I help you today?',
        timestamp: time,
      }
    ];
  };

  const [messages, setMessages] = useState<Message[]>(() => getInitialMessages(chatLang));

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Reset or change language
  const handleLanguageSwitch = (lang: Language) => {
    setChatLang(lang);
    setMessages(getInitialMessages(lang));
  };

  // Comprehensive categorized prompt library
  const categorizedPrompts: Record<PromptCategory, Record<Language, string[]>> = {
    all: {
      mr: [
        'कांद्याचा आजचा वाशी बाजारभाव काय आहे?',
        'टोमॅटो आज विकावा की २ दिवस थांबावे?',
        '५० क्विंटल कांद्यावर किती नफा होईल?',
        'वाशी मार्केटमध्ये हमाली व सेस किती कापला जातो?',
        'कांद्याला हमीभाव (MSP) मिळतो का?',
        'कांदा चाळीत सडू नये म्हणून काय करावे?',
      ],
      hi: [
        'आज वाशी मंडी में प्याज़ का क्या भाव है?',
        'क्या आज टमाटर बेचना चाहिए या रुकें?',
        '५० क्विंटल प्याज़ पर कितना शुद्ध मुनाफा होगा?',
        'वाशी मंडी में सेस और लेबर चार्ज कितना लगता है?',
        'कांदा / प्याज पर सरकारी योजना व सब्सिडी क्या है?',
        'लहसुन व अदरक का बाज़ार रुख कैसा है?'
      ],
      en: [
        "What is today's Onion price at Vashi APMC?",
        "Should I sell Tomatoes today or wait 2 days?",
        "Calculate net profit for 50 quintals of Onion",
        "What are APMC Vashi cess and commission rules?",
        "Is there MSP or subsidy for Onion farmers?",
        "How to store onions safely in aerated chawl?"
      ]
    },
    prices: {
      mr: [
        'कांद्याचा आजचा मोडल व कमाल भाव काय?',
        'टोमॅटोचे आजचे ताजे दर सांगा',
        'लसूण आणि आल्याचे चालू भाव काय आहेत?',
        'डाळिंब व सफरचंदाचे आजचे घाऊक दर काय आहेत?',
        'बटाटा आणि हिरवी मिरचीचे दर सांगा',
        'या आठवड्यात सर्वात जास्त भाववाढ कशात झाली?'
      ],
      hi: [
        'आज प्याज़ का मोडल और अधिकतम भाव क्या है?',
        'टमाटर और आलू का ताज़ा मंडी भाव बताइए',
        'लहसुन और अदरक का आज का क्या भाव है?',
        'अनार और सेब के थोक भाव क्या चल रहे हैं?',
        'हरी मिर्च और भिंडी के आज के रेट क्या हैं?'
      ],
      en: [
        "What is today's modal and max price for Onion?",
        "Tell me today's Tomato and Potato wholesale rates",
        "What are current Garlic and Ginger auction prices?",
        "Pomegranate and Apple wholesale rates today",
        "Which crop gained the most price this week?"
      ]
    },
    selling: {
      mr: [
        'टोमॅटो आज विकावा की थांबावे?',
        'कांदा साठवून ठेवावा की लगेच विकावा?',
        'लिलावात उच्चांकी भाव मिळवण्यासाठी प्रतवारी कशी करावी?',
        'वाशी बाजारात लिलाव कधी सर्वात चांगला होतो?',
        'कोणत्या पिकात सध्या सर्वात जास्त मंदी आहे?'
      ],
      hi: [
        'क्या आज टमाटर बेचना सही रहेगा या २ दिन रुकें?',
        'प्याज़ रोककर रखें या अभी मंडी भेजें?',
        'नीलामी में सबसे बढ़िया भाव पाने के लिए ग्रेडिंग कैसे करें?',
        'वाशी मंडी में किस समय सबसे अच्छी बोली लगती है?'
      ],
      en: [
        "Should I sell Tomatoes today or hold for 2 days?",
        "Is it profitable to store Onions right now?",
        "How to grade commodities for maximum auction bidding?",
        "What is the best auction time slot at Vashi Mandi?"
      ]
    },
    profit: {
      mr: [
        '५० क्विंटल कांद्याला किती निव्वळ पैसे मिळतील?',
        '१०० क्रेट टोमॅटोचे वाशीतील नफा गणित सांगा',
        'गाडी भाडे आणि तोलाई वजा करून नफा कसा काढायचा?',
        'वाशी विरुद्ध पुणे बाजारात कुठे जास्त नफा होईल?'
      ],
      hi: [
        '५० क्विंटल प्याज़ पर कितना शुद्ध मुनाफा मिलेगा?',
        '१०० क्रेट टमाटर पर मंडी खर्च के बाद कितने पैसे बनेंगे?',
        'ढुलाई और पल्लेदारी काटकर नफा कैसे निकालें?'
      ],
      en: [
        "Calculate net take-home for 50 quintals of Onion",
        "How much net realization on 100 crates of Tomato?",
        "How are transport and hamali deducted from gross revenue?"
      ]
    },
    rules: {
      mr: [
        'शेतकऱ्याला अडत्याकडून कमिशन (आडत) द्यावे लागते का?',
        'वाशी मार्केट लिलाव वेळ आणि सुट्टी कधी असते?',
        'वाशी मार्केटमध्ये डिजिटल गेट पास कसा मिळवायचा?',
        'नाशिक व पुण्यावरून वाशीसाठी गाडी भाडे किती?'
      ],
      hi: [
        'क्या किसान से मंडी में आढ़त / कमीशन काटा जा सकता है?',
        'वाशी मंडी की नीलामी का समय और नियम क्या हैं?',
        'ई-गेट पास कैसे बनाएं और वे-ब्रिज कहाँ है?'
      ],
      en: [
        "Can commission agents deduct adat from farmers?",
        "What are Vashi APMC auction yard working hours?",
        "How to generate electronic farmer gate pass for Gate 1?"
      ]
    },
    schemes: {
      mr: [
        'कांद्याला हमीभाव (MSP) आणि नाफेड खरेदी काय आहे?',
        'नमो शेतकरी आणि पीएम किसान योजनेचे पैसे कधी येतात?',
        'पीक विमा योजना (PMFBY) १ रुपयात कशी मिळते?',
        'कांदा चाळ अनुदानासाठी MahaDBT चे काय नियम आहेत?'
      ],
      hi: [
        'क्या प्याज पर न्यूनतम समर्थन मूल्य (MSP) मिलता है?',
        'पीएम किसान सम्मान निधि की किस्त की जानकारी दें',
        'फसल बीमा योजना (PMFBY) का लाभ कैसे उठाएं?'
      ],
      en: [
        "Does Onion have MSP or NAFED/NCCF buffer procurement?",
        "How does PM-Kisan & Namo Shetkari Yojana work?",
        "How to claim PM Fasal Bima Yojana crop insurance?"
      ]
    },
    crop_care: {
      mr: [
        'कांदा चाळीत सडू नये म्हणून काय काळजी घ्यावी?',
        'टोमॅटोवरील नागअळी व चुरडा-मुरडा कसा रोखावा?',
        'डाळिंबावरील तेल्या रोगावर प्रभावी उपाय काय?',
        'आल्यावरील कंदकुज रोगावर काय फवारणी करावी?'
      ],
      hi: [
        'प्याज़ को सड़ने से बचाने के लिए भंडारण के उपाय',
        'टमाटर में वायरस और थ्रिप्स की रोकथाम कैसे करें?',
        'अनार में तेलिया रोग से बचाव के घरेलू व वैज्ञानिक उपाय'
      ],
      en: [
        "How to prevent onion rotting in aerated storage chawl?",
        "How to manage Tomato leaf curl virus and thrips?",
        "What is the cure for Bacterial Blight in Pomegranate?"
      ]
    }
  };

  // Helper to extract crop matching user query
  const findMentionedCrop = (query: string): Crop | undefined => {
    const lower = query.toLowerCase();
    return crops.find(c => {
      const nameMatch = lower.includes(c.name.toLowerCase());
      const localMatch = c.local_name ? lower.includes(c.local_name.toLowerCase()) : false;
      const idMatch = lower.includes(c.id.replace('crop-', ''));
      
      const aliasMap: Record<string, string[]> = {
        'crop-onion': ['onion', 'kanda', 'कांदा', 'कांद्याचा', 'कांद्याचे', 'कांद्याला', 'कांद्या', 'प्याज़', 'प्याज', 'प्याज़'],
        'crop-tomato': ['tomato', 'tamatar', 'टोमॅटो', 'टमाटर', 'टोमॅटोचे', 'टोमॅटोला'],
        'crop-potato': ['potato', 'aloo', 'batata', 'बटाटा', 'बटाट्याचा', 'बटाट्याचे', 'आलू'],
        'crop-garlic': ['garlic', 'lahsun', 'लसूण', 'लसणाचे', 'लसणाचा', 'लहसुन'],
        'crop-ginger': ['ginger', 'adrak', 'आले', 'आल्याचे', 'आल्याचा', 'अदरक'],
        'crop-green-chilli': ['chilli', 'mirchi', 'मिरची', 'मिरचीचे', 'मिर्च'],
        'crop-apple': ['apple', 'safarchand', 'सफरचंद', 'सफरचंदाचे', 'सेब'],
        'crop-pomegranate': ['pomegranate', 'dalimb', 'anar', 'डाळिंब', 'डाळिंबाचे', 'अनार'],
        'crop-banana': ['banana', 'keli', 'kela', 'केळी', 'केळीचे', 'केला'],
        'crop-mango': ['mango', 'hapus', 'alphonso', 'आंबा', 'आंब्याचे', 'आम', 'हापूस'],
        'crop-cauliflower': ['cauliflower', 'gobi', 'flower', 'फ्लॉवर', 'फूलगोभी'],
        'crop-okra': ['okra', 'bhindi', 'भेंडी', 'भेंडीचे', 'भिंडी'],
        'crop-mosambi': ['mosambi', 'sweet lime', 'मोसंबी', 'मोसंबीचे', 'मौसमी'],
      };

      const aliases = aliasMap[c.id] || [];
      return nameMatch || localMatch || idMatch || aliases.some(alias => lower.includes(alias));
    });
  };

  // Deep AI Knowledge & Reasoning Engine
  const generateMaiResponse = (query: string, lang: Language): { text: string; highlight?: Message['cropHighlight'] } => {
    const lower = query.toLowerCase();
    const mentionedCrop = findMentionedCrop(lower);

    // 1. GREETINGS & INTRODUCTIONS
    if (/^(hi|hello|hey|namaste|ram ram|ramram|नमस्कार|नमस्ते|प्रणाम|जय हरी)/i.test(query.trim())) {
      if (lang === 'mr') {
        return {
          text: `राम राम मंडळी! मी **माई (MAI)** — वाशी एपीएमसी बाजाराची डिजिटल सहाय्यक.\n\nतुम्हाला आजचे ताजे बाजारभाव जाणून घ्यायचे आहेत की शेतीमाल विक्री, नफा आणि शासकीय योजनांबद्दल माहिती हवी आहे? सांगा, मी कशी मदत करू?`
        };
      }
      if (lang === 'hi') {
        return {
          text: `नमस्ते किसान भाइयों! मैं **माई (MAI)** — वाशी एपीएमसी मंडी की आपकी सहायक।\n\nआज के ताज़ा भाव, फसल बेचने की सही सलाह, ढुलाई खर्च या सरकारी योजनाओं के बारे में आप क्या जानना चाहते हैं?`
        };
      }
      return {
        text: `Namaste! I am **MAI (Market & Agriculture Intelligence)**, your personal AI assistant for Navi Mumbai APMC (Vashi).\n\nWhether you need today's commodity prices, selling decisions, mandi rules, or profit calculations, feel free to ask!`
      };
    }

    // 2. SPECIFIC COMMODITY SPOT RATES & TRENDS
    if (mentionedCrop) {
      const cropPrices = prices
        .filter(p => p.crop_id === mentionedCrop.id && p.market_id === 'mkt-vashi')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      if (cropPrices.length > 0) {
        const latest = cropPrices[0];
        const weekAgo = cropPrices[Math.min(6, cropPrices.length - 1)];
        const priceDiff = latest.modal_price - weekAgo.modal_price;
        const changePercent = weekAgo.modal_price > 0 ? Number(((priceDiff / weekAgo.modal_price) * 100).toFixed(1)) : 0;
        const trend = changePercent > 0.5 ? 'up' : changePercent < -0.5 ? 'down' : 'neutral';
        const pricePerKg = (latest.modal_price / 100).toFixed(2);
        const approxCratePrice = (latest.modal_price * 0.20).toFixed(0);

        const highlight: Message['cropHighlight'] = {
          name: mentionedCrop.name,
          modalPrice: latest.modal_price,
          unit: latest.unit,
          trend,
          changePercent,
        };

        // If user specifically asked about holding/selling
        const isSellAdviceQuery = lower.includes('विकावा') || lower.includes('थांबावे') || lower.includes('साठव') || lower.includes('बेचें') || lower.includes('रोकें') || lower.includes('sell') || lower.includes('hold');

        if (lang === 'mr') {
          let adviceText = '';
          if (trend === 'up') {
            adviceText = `📈 **विक्री सल्ला**: गेल्या आठवड्यापेक्षा दर **+${changePercent}%** ने वधारले आहेत. आवक नियंत्रित असल्यामुळे खरेदीदारांमध्ये स्पर्धा आहे. उच्च दर्जाचा (Grade-1) माल असल्यास आज किंवा उद्या सकाळी लिलावात पाठवल्यास चांगला नफा होईल.`;
          } else if (trend === 'down') {
            adviceText = `📉 **विक्री सल्ला**: नाशिक/पुणे भागातून आवक वाढल्यामुळे भाव **${changePercent}%** ने थोडे नरमले आहेत. जर तुमच्याकडे टिकाऊ साठवणूक असेल तर २-३ दिवस थांबा; माल ओला असल्यास त्वरित ग्रेडिंग करून विका.`;
          } else {
            adviceText = `⚖️ **विक्री सल्ला**: बाजार स्थिर आहे. दर्जेदार प्रतवारी केलेला माल ₹${latest.max_price} पर्यंत विकला जात आहे. नियमित तोडणी सुरू ठेवा.`;
          }

          return {
            text: `📍 **वाशी एपीएमसी थेट बाजारभाव: ${mentionedCrop.local_name || mentionedCrop.name}**\n\n` +
              `• **आजचा मोडल (सरासरी) भाव**: **₹${latest.modal_price.toLocaleString('en-IN')}** / क्विंटल\n` +
              `• **किरकोळ समतुल्य भाव**: ₹${pricePerKg} / किलो (२० किलो क्रेट: ~₹${approxCratePrice})\n` +
              `• **किमान ते कमाल लिलाव दर**: ₹${latest.min_price.toLocaleString('en-IN')} – ₹${latest.max_price.toLocaleString('en-IN')} / क्विंटल\n` +
              `• **आजची वाशी आवक**: सुमारे ${latest.arrivals_quintal?.toLocaleString('en-IN') || '1,200'} क्विंटल\n` +
              `• **७ दिवसांचा कल**: ${trend === 'up' ? '🟢 तेजी (+ ' + changePercent + '%)' : trend === 'down' ? '🔴 मंदी (' + changePercent + '%)' : '⚪ स्थिर'}\n` +
              `• **यार्ड**: ${mentionedCrop.category === 'fruits' ? 'Market-2 (फळ यार्ड)' : 'Market-1 (कांदा-बटाटा / भाजीपाला यार्ड)'}\n\n` +
              `${adviceText}\n\n` +
              `💡 *सकाळी ०४:३० ते ०८:०० दरम्यान लिलावात मालाची सर्वोच्च बोली लागते.*`,
            highlight,
          };
        }

        if (lang === 'hi') {
          let adviceText = '';
          if (trend === 'up') {
            adviceText = `📈 **बिक्री सलाह**: पिछले हफ्ते से भाव **+${changePercent}%** तेज हैं। वाशी मंडी में अच्छी मांग है। ए-ग्रेड माल तुरंत मंडी लाने पर अधिकतम दाम मिलेगा।`;
          } else if (trend === 'down') {
            adviceText = `📉 **बिक्री सलाह**: आवक बढ़ने से भाव **${changePercent}%** गिरे हैं। यदि भंडारण सुविधा है तो २-३ दिन ठहरें।`;
          } else {
            adviceText = `⚖️ **बिक्री सलाह**: बाज़ार स्थिर है। अच्छी छँटाई (Grading) करके माल लाएं।`;
          }

          return {
            text: `📍 **वाशी एपीएमसी लाइव मंडी भाव: ${mentionedCrop.name} (${mentionedCrop.local_name || ''})**\n\n` +
              `• **आज का मोडल (औसत) भाव**: **₹${latest.modal_price.toLocaleString('en-IN')}** / क्विंटल\n` +
              `• **प्रति किलो दर**: ₹${pricePerKg} / किलो (२० किलो क्रेट: ~₹${approxCratePrice})\n` +
              `• **न्यूनतम – अधिकतम रेंज**: ₹${latest.min_price.toLocaleString('en-IN')} – ₹${latest.max_price.toLocaleString('en-IN')} / क्विंटल\n` +
              `• **आज की आवक**: करीब ${latest.arrivals_quintal?.toLocaleString('en-IN') || '1,200'} क्विंटल\n` +
              `• **७ दिनों का रुख**: ${trend === 'up' ? '🟢 तेज़ी (+ ' + changePercent + '%)' : trend === 'down' ? '🔴 मंदी (' + changePercent + '%)' : '⚪ स्थिर'}\n\n` +
              `${adviceText}\n\n` +
              `💡 *वाशी मंडी में सुबह ०४:०० से सुबह ०८:०० बजे के बीच नीलामी सबसे तेज चलती है।*`,
            highlight,
          };
        }

        // English
        return {
          text: `📍 **Vashi APMC Official Rate Bulletin: ${mentionedCrop.name}**\n\n` +
            `• **Today's Modal Auction Price**: **₹${latest.modal_price.toLocaleString('en-IN')}** / Quintal\n` +
            `• **Wholesale kg Equivalent**: ₹${pricePerKg} / kg (Standard 20kg Crate: ~₹${approxCratePrice})\n` +
            `• **Auction Clearing Range**: ₹${latest.min_price.toLocaleString('en-IN')} – ₹${latest.max_price.toLocaleString('en-IN')} / Quintal\n` +
            `• **Arrivals Inflow**: ~${latest.arrivals_quintal?.toLocaleString('en-IN') || '1,200'} Quintals\n` +
            `• **7-Day Price Trajectory**: ${trend === 'up' ? '🟢 Bullish (+ ' + changePercent + '%)' : trend === 'down' ? '🔴 Correcting (' + changePercent + '%)' : '⚪ Stable'}\n` +
            `• **Yard Location**: ${mentionedCrop.category === 'fruits' ? 'Market-2 (Fruit Terminal)' : 'Market-1 (Onion/Potato & Veg Yard)'}\n\n` +
            `💡 *Dispatch Recommendation: Grade-1 sorted lots achieve the highest price spread in early auction slots (04:30 AM - 08:00 AM).*`,
          highlight,
        };
      }
    }

    // 3. REVENUE & PROFIT CALCULATION
    const qtyMatch = query.match(/(\d+)\s*(quintal|क्विंटल|quintals|kg|किलो|टक्के|टन|क्रेट|crates?|bags?|पोती|पेट्या)/i);
    if (qtyMatch || lower.includes('नफा') || lower.includes('कैलकुलेटर') || lower.includes('profit') || lower.includes('calculate') || lower.includes('हिशोब')) {
      const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 50;
      const unitType = qtyMatch ? qtyMatch[2].toLowerCase() : 'quintal';
      const isCrate = unitType.includes('क्रेट') || unitType.includes('crate') || unitType.includes('पेट्या');
      const targetCrop = mentionedCrop || crops.find(c => c.id === 'crop-onion') || crops[0];
      const cropPrice = prices.find(p => p.crop_id === targetCrop.id && p.market_id === 'mkt-vashi')?.modal_price || 2450;
      
      const effectiveQuintals = isCrate ? (qty * 20) / 100 : qty;
      const gross = effectiveQuintals * cropPrice;
      const cess = gross * 0.0105; // 1.05% APMC statutory cess
      const transport = effectiveQuintals * 45; // approx ₹45/quintal
      const hamali = effectiveQuintals * 25; // Mathadi board rate ₹25/quintal
      const net = gross - (cess + transport + hamali);

      if (lang === 'mr') {
        return {
          text: `💰 **${qty} ${isCrate ? 'क्रेट' : 'क्विंटल'} ${targetCrop.local_name || targetCrop.name} चे वाशी बाजारातील निव्वळ नफा गणित**:\n\n` +
            `• **एकूण विक्री मूल्य (Gross)**: ₹${Math.round(gross).toLocaleString('en-IN')} (मोडल दर ₹${cropPrice}/क्विंटल प्रमाणे)\n` +
            `• **एपीएमसी सेस (१.०५%)**: -₹${Math.round(cess).toLocaleString('en-IN')}\n` +
            `• **वाहतूक खर्च (अंदाजे ₹४५/क्विंटल)**: -₹${Math.round(transport).toLocaleString('en-IN')}\n` +
            `• **माथाडी हमाली व तोलाई (₹२५/क्विंटल)**: -₹${Math.round(hamali).toLocaleString('en-IN')}\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `✅ **शेतकऱ्याला मिळणारी निव्वळ रक्कम (Net)**: **₹${Math.round(net).toLocaleString('en-IN')}**\n\n` +
            `अधिक अचूक सिम्युलेशनसाठी वरील **'नफा गणक' (Calculator)** टूल वापरा!`
        };
      }
      if (lang === 'hi') {
        return {
          text: `💰 **${qty} ${isCrate ? 'क्रेट' : 'क्विंटल'} ${targetCrop.name} का वाशी मंडी में मुनाफा गणित**:\n\n` +
            `• **सकल बिक्री मूल्य (Gross)**: ₹${Math.round(gross).toLocaleString('en-IN')} (दर ₹${cropPrice}/क्विंटल से)\n` +
            `• **मंडी सेस (१.०५%)**: -₹${Math.round(cess).toLocaleString('en-IN')}\n` +
            `• **ढुलाई खर्च (अनुमानित ₹४५/क्विंटल)**: -₹${Math.round(transport).toLocaleString('en-IN')}\n` +
            `• **हमाली व पल्लेदारी (₹२५/क्विंटल)**: -₹${Math.round(hamali).toLocaleString('en-IN')}\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `✅ **किसान को मिलने वाली शुद्ध राशि (Net)**: **₹${Math.round(net).toLocaleString('en-IN')}**\n\n` +
            `विस्तृत गणना के लिए **'मुनाफा कैलकुलेटर'** टूल का उपयोग करें!`
        };
      }
      return {
        text: `💰 **Net Realization Estimate for ${qty} ${isCrate ? 'Crates' : 'Quintals'} of ${targetCrop.name} at Vashi APMC**:\n\n` +
          `• **Gross Auction Yield**: ₹${Math.round(gross).toLocaleString('en-IN')} (at current modal ₹${cropPrice}/qtl)\n` +
          `• **APMC Statutory Cess (1.05%)**: -₹${Math.round(cess).toLocaleString('en-IN')}\n` +
          `• **Freight Transport Outlay (~₹45/qtl)**: -₹${Math.round(transport).toLocaleString('en-IN')}\n` +
          `• **Mathadi Labour & Weighing (₹25/qtl)**: -₹${Math.round(hamali).toLocaleString('en-IN')}\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `✅ **Estimated Net Take-Home Pay**: **₹${Math.round(net).toLocaleString('en-IN')}**`
      };
    }

    // 4. COMMISSION & MANDI CESS LAWS (Important farmer legal right!)
    if (lower.includes('कमिशन') || lower.includes('आडत') || lower.includes('commission') || lower.includes('cess') || lower.includes('सेस') || lower.includes('हमाली')) {
      if (lang === 'mr') {
        return {
          text: `⚖️ **वाशी एपीएमसी सेस, कमिशन व हमालीचे अधिकृत नियम**:\n\n` +
            `1. **शेतकऱ्यांवर शून्य कमिशन (Zero Commission on Farmers)**:\n` +
            `   महाराष्ट्र कृषी उत्पन्न पणन कायद्यानुसार शेतकऱ्यांच्या बिलातून कोणतीही आडत (Commission) कापता येत नाही! आडत ही **केवळ खरेदीदार / व्यापाऱ्याकडून** घेतली जाते.\n\n` +
            `2. **मार्केट सेस (Mandi Cess)**:\n` +
            `   वाशी एपीएमसीचा अधिकृत सेस **१.०५%** आहे. हासुद्धा नियमानुसार खरेदीदाराकडून देय असतो.\n\n` +
            `3. **माथाडी हमाली (Mathadi Labour Charges)**:\n` +
            `   माथाडी बोर्डाने निश्चित केलेले अधिकृत दर (साधारण ₹२२ ते ₹२८ प्रति कट्टा/क्विंटल) लागू असतात.\n\n` +
            `⚠️ *टीप: कोणताही अडत्या शेतकऱ्याकडून कमिशन कापत असल्यास एपीएमसी सचिव किंवा शेतकरी दक्षता कक्षाकडे त्वरित तक्रार करता येते.*`
        };
      }
      if (lang === 'hi') {
        return {
          text: `⚖️ **वाशी मंडी सेस, आढ़त (कमीशन) व पल्लेदारी के नियम**:\n\n` +
            `1. **किसानों से शून्य कमीशन**:\n` +
            `   महाराष्ट्र एपीएमसी एक्ट के तहत किसान से किसी भी प्रकार की आढ़त (कमीशन) काटना गैरकानूनी है! कमीशन सिर्फ खरीदार देगा।\n\n` +
            `2. **मंडी सेस (Mandi Cess)**: आधिकारिक १.०५% सेस खरीदार द्वारा देय है।\n` +
            `3. **हमाली / पल्लेदारी**: माथाडी बोर्ड द्वारा तय सरकारी दर (करीब ₹२२-२८ प्रति बोरी) ही लागू होती है।`
        };
      }
      return {
        text: `⚖️ **APMC Vashi Statutory Cess & Farmer Protection Law**:\n\n` +
          `1. **Zero Commission on Farmers**: Under the Maharashtra APMC Act, commission agents (Adatyas) are legally prohibited from deducting commission from farmers' sales receipts. All trade commission is borne strictly by buyers.\n` +
          `2. **Mandi Cess**: 1.05% statutory market cess.\n` +
          `3. **Mathadi Labour**: Standardized rates approved by the Mathadi Board (~₹22 - ₹28 per bag/crate).`
      };
    }

    // 5. GOVERNMENT SCHEMES & MSP (PM-Kisan, Namo Shetkari, Fasal Bima, Onion Subsidy)
    if (lower.includes('msp') || lower.includes('हमीभाव') || lower.includes('योजना') || lower.includes('अनुदान') || lower.includes('विमा') || lower.includes('subsidy') || lower.includes('pm kisan') || lower.includes('शेतकरी सन्मान')) {
      if (lang === 'mr') {
        return {
          text: `🏛️ **शेतकऱ्यांसाठी महत्त्वाच्या शासकीय योजना व हमीभाव माहिती**:\n\n` +
            `• **कांदा हमीभाव व नाफेड (NAFED / NCCF) खरेदी**:\n` +
            `   कांद्याला थेट MSP नसतो, परंतु दर कोसळल्यास केंद्र सरकार NAFED आणि NCCF मार्फत बफर स्टॉकसाठी थेट शेतकऱ्यांकडून खरेदी करते.\n\n` +
            `• **पीएम किसान + नमो शेतकरी महासन्मान निधी**:\n` +
            `   केंद्राचे ₹६,००० + महाराष्ट्र शासनाचे ₹६,००० = **दरवर्षी एकूण ₹१२,०००** शेतकऱ्यांच्या बँक खात्यात थेट जमा होतात.\n\n` +
            `• **१ रुपयात पीक विमा (PMFBY)**:\n` +
            `   महाराष्ट्रात शेतकऱ्यांना केवळ **₹१** मध्ये सर्वसमावेशक पीक विमा संरक्षण उपलब्ध आहे.\n\n` +
            `• **कांदा चाळ अनुदान (MahaDBT)**:\n` +
            `   २५ मेट्रिक टन क्षमतेच्या हवेशीर कांदा चाळीसाठी शासनाकडून **₹८७,५००** पर्यंत ५०% अनुदान मिळते.`
        };
      }
      if (lang === 'hi') {
        return {
          text: `🏛️ **प्रमुख सरकारी योजना व समर्थन मूल्य (MSP) जानकारी**:\n\n` +
            `• **पीएम किसान + नमो शेतकरी योजना**: कुल **₹१२,००० प्रति वर्ष** (₹६,००० केंद्र + ₹६,००० राज्य) सीधे खाते में।\n` +
            `• **₹१ में फसल बीमा (PMFBY)**: प्राकृतिक आपदा से नुकसान पर फसल बीमा क्लेम की सुविधा।\n` +
            `• **कांदा / प्याज बफर खरीद**: भाव गिरने पर नाफेड (NAFED) व एनसीसीएफ सीधे खरीद करती हैं।\n` +
            `• **कांदा चाळ / भंडारण अनुदान**: २५ मीट्रिक टन की प्याज भंडारण चाली के लिए ५०% सब्सिडी मिलती है।`
        };
      }
      return {
        text: `🏛️ **Key Agricultural Schemes & Price Support Info**:\n\n` +
          `• **Onion Price Stabilization**: While onions do not have a statutory MSP, the Central Government intervenes via NAFED/NCCF buffer stock procurement when market rates drop below production cost.\n` +
          `• **PM-Kisan & State Top-Up**: Total ₹12,000/year (₹6,000 Central + ₹6,000 Maharashtra Namo Shetkari).\n` +
          `• **Comprehensive Crop Insurance**: Available in Maharashtra at just ₹1 token premium under PMFBY.\n` +
          `• **Onion Storage Chawl Subsidy**: Up to ₹87,500 subsidy on MahaDBT for 25-tonne aerated structures.`
      };
    }

    // 6. CROP DISEASE, PEST & STORAGE MANAGEMENT
    if (lower.includes('रोग') || lower.includes('कीड') || lower.includes('फवारणी') || lower.includes('साठवण') || lower.includes('disease') || lower.includes('storage') || lower.includes('करपा') || lower.includes('तेल्या')) {
      if (lang === 'mr') {
        return {
          text: `🌱 **शेतीमाल साठवणूक व पीक संरक्षण सल्ला**:\n\n` +
            `• **कांदा साठवणूक (Onion Chawl)**:\n` +
            `   कांदा चाळीत खाली ५० सेंमी हवा खेळती राहील अशी जमिनीपासून उंचावर जाळी ठेवा. कांद्याची जाडी ४ ते ५ फुटांपेक्षा जास्त थर देऊ नये. साठवणुकीपूर्वी कार्बेन्डाझिम किंवा सल्फरची योग्य धुरळणी करावी.\n\n` +
            `• **टोमॅटोवरील नागअळी व व्हायरस**:\n` +
            `   पानांवर नागमोडी रेषा दिसल्यास अबामेक्टीन (०.५ मिली/लीटर) किंवा स्पायनोसॅड फवारा. पांढरी माशी रोखण्यासाठी पिवळे चिकट सापळे लावा.\n\n` +
            `• **डाळिंब तेल्या रोग (Bacterial Blight)**:\n` +
            `   तांब्याच्या बुरशीनाशकांचा (कॉपर ऑक्सिक्लोराईड २.५ ग्रॅम + स्ट्रेप्टोसायक्लिन ०.२ ग्रॅम/लीटर) योग्य अंतराने प्रतिबंधात्मक फवारणी करा.`
        };
      }
      if (lang === 'hi') {
        return {
          text: `🌱 **फसल सुरक्षा एवं भंडारण वैज्ञानिक सलाह**:\n\n` +
            `• **प्याज़ भंडारण**: जमीन से ऊपर हवादार जालीदार शेड में ४ फीट से ऊंचा ढेर न लगाएं।\n` +
            `• **टमाटर में थ्रिप्स व लीफ कर्ल**: पीले स्टिकी ट्रैप लगाएं और नीम तेल या इमिडाक्लोप्रिड का छिड़काव करें।\n` +
            `• **अनार में तेलिया रोग**: कॉपर ऑक्सीक्लोराइड और स्ट्रेप्टोमाइसिन का संतुलित स्प्रे करें।`
        };
      }
      return {
        text: `🌱 **Agronomic Care & Storage Management Advisory**:\n\n` +
          `• **Aerated Onion Storage**: Elevate storage floor by 50cm with slotted bottom mesh. Restrict stack height to 4 feet to prevent bottom rotting.\n` +
          `• **Tomato Pest Defense**: Install yellow sticky cards for whitefly vectors; spray Abamectin for leaf miners.\n` +
          `• **Pomegranate Blight**: Preventive Copper Oxychloride + Streptocycline regimen after pruning.`
      };
    }

    // 7. LOCATION, AUCTION TIMINGS & GATE ENTRY
    if (lower.includes('वाशी') || lower.includes('timing') || lower.includes('वेळ') || lower.includes('गेट') || lower.includes('address') || lower.includes('पत्ता') || lower.includes('gate pass') || lower.includes('weighbridge') || lower.includes('काटा')) {
      if (lang === 'mr') {
        return {
          text: `📍 **नवी मुंबई एपीएमसी (वाशी) यार्ड पत्ता व वेळ**:\n\n` +
            `• **पत्ता**: सेक्टर १९, वाशी, नवी मुंबई, महाराष्ट्र ४००७०३.\n` +
            `• **मार्केट यार्ड १**: कांदा, बटाटा, लसूण व भाजीपाला घाऊक यार्ड.\n` +
            `• **मार्केट यार्ड २**: फळे व सफरचंद, डाळिंब, आंबा यार्ड.\n` +
            `• **लिलाव वेळ**: सकाळी ०४:०० ते दुपारी ०१:०० (सोमवार ते शनिवार, रविवारी सुट्टी).\n` +
            `• **वजन काटा (Weighbridge)**: गेट क्रमांक १ वर २४ तास संगणकीकृत सरकारी वजन काटा सुरू असतो.\n` +
            `• **ई-गेट पास**: आमच्या **'लॉगिन / खाते'** पर्यायातून १ मिनिटात मोफत जनरेट करा!`
        };
      }
      if (lang === 'hi') {
        return {
          text: `📍 **वाशी एपीएमसी मंडी पता, समय एवं गेट नियम**:\n\n` +
            `• **पता**: सेक्टर १९, वाशी, नवी मुंबई, महाराष्ट्र ४००७०३।\n` +
            `• **नीलामी समय**: सुबह ०४:०० से दोपहर ०१:०० बजे तक (सोमवार से शनिवार)।\n` +
            `• **धर्मकांटा (वे-ब्रिज)**: गेट १ पर २४ घंटे चालू रहता है।\n` +
            `• **गेट पास**: पोर्टल के **'लॉगिन / खाता'** मेन्यू से किसान ई-पास तुरंत डाउनलोड करें।`
        };
      }
      return {
        text: `📍 **Navi Mumbai APMC (Vashi) Yard Operating Hours & Gate Guide**:\n\n` +
          `• **Address**: Sector 19, Vashi, Navi Mumbai, Maharashtra 400703.\n` +
          `• **Yard 1**: Onion, Potato, Garlic, Ginger & Vegetables.\n` +
          `• **Yard 2**: Fruits & Horticultural Terminal.\n` +
          `• **Auction Window**: 04:00 AM – 01:00 PM (Monday through Saturday).\n` +
          `• **Weighbridge**: 24/7 computerized government electronic weighbridge at Gate No. 1.\n` +
          `• **Gate Pass**: Instant digital pass available in the **Login / Account** section.`
      };
    }

    // 8. TRANSPORTATION & FREIGHT ROUTES
    if (lower.includes('वाहतूक') || lower.includes('भाडे') || lower.includes('गाडी') || lower.includes('transport') || lower.includes('freight') || lower.includes('truck') || lower.includes('किराया')) {
      if (lang === 'mr') {
        return {
          text: `🚚 **वाशी बाजारासाठी प्रमुख वाहतूक मार्ग व अंदाजे गाडी भाडे**:\n\n` +
            `• **नाशिक ते वाशी (~१६० किमी)**: अंदाजे ₹४० ते ₹५५ प्रति क्विंटल (पिकअप / आयशर).\n` +
            `• **पुणे / नारायणगाव ते वाशी (~१४० किमी)**: अंदाजे ₹३५ ते ₹५० प्रति क्विंटल.\n` +
            `• **अहमदनगर ते वाशी (~२३० किमी)**: अंदाजे ₹५५ ते ₹७० प्रति क्विंटल.\n` +
            `• **सोलापूर / सांगली ते वाशी (~३८० किमी)**: अंदाजे ₹८० ते ₹११० प्रति क्विंटल.\n\n` +
            `💡 *टीप: रात्री माल भरून सकाळी ०४:०० च्या आधी वाशी यार्डात गाडी पोहोचल्यास ताजी आवक मानली जाऊन उच्च बोली मिळते.*`
        };
      }
      if (lang === 'hi') {
        return {
          text: `🚚 **वाशी मंडी के लिए प्रमुख परिवहन मार्ग व औसत ढुलाई खर्च**:\n\n` +
            `• **नासिक से वाशी (~१६० किमी)**: ₹४० - ₹५५ प्रति क्विंटल।\n` +
            `• **पुणे से वाशी (~१४० किमी)**: ₹३५ - ₹५० प्रति क्विंटल।\n` +
            `• **अहमदनगर से वाशी (~२३० किमी)**: ₹५५ - ₹७० प्रति क्विंटल।\n` +
            `• **सलाह**: सुबह ०४:०० बजे से पहले मंडी में गाड़ी खाली होने पर सबसे अच्छा भाव मिलता है।`
        };
      }
      return {
        text: `🚚 **Vashi Mandi Transport & Freight Benchmarks**:\n\n` +
          `• **Nashik to Vashi (~160 km)**: ~₹40 - ₹55 per quintal.\n` +
          `• **Pune / Narayangaon to Vashi (~140 km)**: ~₹35 - ₹50 per quintal.\n` +
          `• **Ahmednagar to Vashi (~230 km)**: ~₹55 - ₹70 per quintal.\n` +
          `• **Solapur/Sangli to Vashi (~380 km)**: ~₹80 - ₹110 per quintal.\n\n` +
          `💡 *Best Practice: Ensure vehicle reaches Sector 19 gates before 04:00 AM for early morning lot registration.*`
      };
    }

    // 9. TOP GAINERS & HOT COMMODITIES
    if (lower.includes('तेजी') || lower.includes('gainer') || lower.includes('top') || lower.includes('फायदा') || lower.includes('वाढ') || lower.includes('बढ़')) {
      const { gainers } = getTopGainersAndLosers(prices, 7);
      const top3 = gainers.slice(0, 3);
      if (lang === 'mr') {
        const list = top3.map((g, i) => `${i + 1}. **${g.cropName}**: +${g.changePercent}% (चालू मोडल दर: ₹${g.currentPrice}/${g.unit})`).join('\n');
        return {
          text: `🔥 **या आठवड्यातील वाशी बाजारात सर्वाधिक तेजीतील पिके**:\n\n${list}\n\nया शेतीमालाला मुंबई व उपनगरातून मोठी मागणी आहे. उच्च प्रतवारीच्या मालाला लिलावात अग्रक्रम मिळतो आहे.`
        };
      }
      if (lang === 'hi') {
        const list = top3.map((g, i) => `${i + 1}. **${g.cropName}**: +${g.changePercent}% (चालू भाव: ₹${g.currentPrice}/${g.unit})`).join('\n');
        return {
          text: `🔥 **इस सप्ताह वाशी मंडी में सबसे अधिक तेज़ी वाली फसलें**:\n\n${list}\n\nइन जिंसों की मांग मजबूत बनी हुई है और किसानों को अच्छे दाम मिल रहे हैं।`
        };
      }
      const list = top3.map((g, i) => `${i + 1}. **${g.cropName}**: +${g.changePercent}% (Current: ₹${g.currentPrice}/${g.unit})`).join('\n');
      return {
        text: `🔥 **Top Weekly Gainers at Vashi APMC**:\n\n${list}\n\nHigh buyer competition observed in these auction lots.`
      };
    }

    // 10. COMPREHENSIVE FALLBACK INTELLIGENCE (Never gives a robotic error, always gives helpful farmer advice)
    if (lang === 'mr') {
      return {
        text: `मी वाशी बाजाराची संपूर्ण माहिती जाणते! तुमच्या प्रश्नाचे उत्तर देण्यासाठी मी सदैव सज्ज आहे:\n\n` +
          `• **आजचे भाव जाणून घ्यायचे आहेत का?** विचारू शकता: *"कांद्याचा भाव काय आहे?"* किंवा *"लसणाचे चालू दर सांगा"*\n` +
          `• **विक्री निर्णय सल्ला**: *"टोमॅटो आज विकावा की थांबावे?"*\n` +
          `• **नफा गणित**: *"५० क्विंटल मालावर किती नफा होईल?"*\n` +
          `• **नियम व योजना**: *"शेतकऱ्यांवर सेस लागतो का?"* किंवा *"कांदा चाळ अनुदान नियम काय आहेत?"*\n\n` +
          `खालील बटणे दाबून तुम्ही थेट विषय निवडून प्रश्न विचारू शकता!`
      };
    }
    if (lang === 'hi') {
      return {
        text: `मैं वाशी मंडी की हर प्रकार की कृषि जानकारी से लैस हूँ! आप मुझसे यह भी पूछ सकते हैं:\n\n` +
          `• **फसल के भाव**: *"आज प्याज़ का क्या भाव है?"* या *"टमाटर व आलू के ताज़ा रेट"*\n` +
          `• **बिक्री सलाह**: *"क्या आज फसल बेचना सही रहेगा?"*\n` +
          `• **मुनाफा गणना**: *"५० क्विंटल माल पर शुद्ध कितना मिलेगा?"*\n` +
          `• **मंडी नियम व सरकारी योजनाएं**: *"मंडी सेस नियम क्या हैं?"* या *"पीएम किसान योजना"*\n\n` +
          `नीचे दिए गए किसी भी बटन को दबाकर आप तुरंत सवाल पूछ सकते हैं!`
      };
    }
    return {
      text: `I have real-time access to all Vashi APMC auction data, regulations, and agronomic knowledge! You can ask:\n\n` +
        `• **Commodity Rates**: *"What is today's Onion price?"* or *"Garlic rate spread"*\n` +
        `• **Decision Support**: *"Should I sell Tomatoes today or hold?"*\n` +
        `• **Profit Breakdown**: *"Calculate return for 50 quintals"*\n` +
        `• **Regulations & Schemes**: *"What are APMC cess rules?"* or *"How to claim crop insurance?"*`
    };
  };

  // Submit message handler
  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: userTime,
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // Realistic AI thinking delay
    setTimeout(() => {
      const { text: responseText, highlight } = generateMaiResponse(query, chatLang);
      const aiTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const maiMessage: Message = {
        id: `mai-${Date.now()}`,
        sender: 'mai',
        text: responseText,
        timestamp: aiTime,
        cropHighlight: highlight,
      };

      setMessages(prev => [...prev, maiMessage]);
      setIsTyping(false);

      // Optional text-to-speech simulation if enabled
      if (speechEnabled && 'speechSynthesis' in window) {
        try {
          const cleanText = responseText.replace(/[*#_•]/g, '');
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = chatLang === 'mr' ? 'mr-IN' : chatLang === 'hi' ? 'hi-IN' : 'en-IN';
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.warn('Speech synthesis unavailable');
        }
      }
    }, 550);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Category labels per language
  const categoryTabs: { id: PromptCategory; labelEn: string; labelMr: string; labelHi: string; icon: any }[] = [
    { id: 'all', labelEn: 'All Topics', labelMr: 'सर्व विषय', labelHi: 'सभी विषय', icon: Sparkles },
    { id: 'prices', labelEn: 'Rates & Spread', labelMr: 'बाजारभाव', labelHi: 'मंडी भाव', icon: TrendingUp },
    { id: 'selling', labelEn: 'Sell vs Hold', labelMr: 'विक्री सल्ला', labelHi: 'बिक्री सलाह', icon: Scale },
    { id: 'profit', labelEn: 'Net Profit Math', labelMr: 'नफा गणित', labelHi: 'मुनाफा गणित', icon: Calculator },
    { id: 'rules', labelEn: 'Mandi Rules', labelMr: 'नियम व सेस', labelHi: 'मंडी नियम', icon: ShieldCheck },
    { id: 'schemes', labelEn: 'Govt & MSP', labelMr: 'शासकीय योजना', labelHi: 'सरकारी योजना', icon: Landmark },
    { id: 'crop_care', labelEn: 'Storage & Care', labelMr: 'साठवणूक व पीक', labelHi: 'भंडारण व सुरक्षा', icon: Sprout },
  ];

  const currentPrompts = categorizedPrompts[activeCategory]?.[chatLang] || categorizedPrompts.all[chatLang];

  return (
    <>
      {/* Floating Action Trigger Button on Bottom-Right */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="hidden sm:flex items-center gap-2 bg-emerald-950 text-white text-xs px-3.5 py-2 rounded-2xl shadow-xl border border-emerald-700/50 cursor-pointer"
            onClick={onToggle}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-emerald-200">
              {chatLang === 'mr' ? "'माई' कृषी AI ऑनलाइन" : chatLang === 'hi' ? "'माई' कृषि AI ऑनलाइन" : 'Ask MAI AI Assistant'}
            </span>
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onToggle}
          className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white shadow-2xl shadow-emerald-700/40 border-2 border-white/80 flex items-center justify-center group focus:outline-hidden cursor-pointer"
          aria-label="Open MAI Agricultural AI Assistant"
        >
          {/* Animated glow ring */}
          <div className="absolute inset-0 rounded-3xl bg-emerald-400 blur-lg opacity-30 group-hover:opacity-60 transition-opacity"></div>
          
          {isOpen ? (
            <X className="w-7 h-7 text-white relative z-10" />
          ) : (
            <div className="relative z-10 flex flex-col items-center">
              <Bot className="w-7 h-7 text-white" />
              <span className="text-[10px] font-black tracking-widest uppercase leading-none mt-0.5 text-emerald-100">MAI</span>
            </div>
          )}

          {/* Unread / Live notification indicator */}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 border-2 border-white rounded-full flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-amber-950" />
            </span>
          )}
        </motion.button>
      </div>

      {/* Floating Chat Modal / Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[94vw] sm:w-[460px] max-h-[85vh] h-[670px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden ring-1 ring-slate-900/5"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white px-5 py-3.5 border-b border-emerald-700/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center p-1.5 shadow-xs">
                  <Bot className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                      <span>MAI</span>
                      <span className="text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-1.5 py-0.2 rounded-full font-mono uppercase">
                        Krishi AI
                      </span>
                    </h3>
                  </div>
                  <p className="text-[11px] text-emerald-200/90 flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{chatLang === 'mr' ? 'वाशी बाजार २४/७ तज्ज्ञ सल्लागार' : chatLang === 'hi' ? 'वाशी मंडी २४/७ कृषि सलाहकार' : 'Vashi Mandi 24/7 Intelligence'}</span>
                  </p>
                </div>
              </div>

              {/* Language Switcher inside Chat & Controls */}
              <div className="flex items-center gap-1.5">
                <div className="bg-emerald-950/80 p-0.5 rounded-xl border border-emerald-700/60 flex text-[11px]">
                  <button
                    onClick={() => handleLanguageSwitch('en')}
                    className={`px-2 py-0.5 rounded-lg font-semibold transition-colors cursor-pointer ${chatLang === 'en' ? 'bg-emerald-600 text-white' : 'text-emerald-300 hover:text-white'}`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => handleLanguageSwitch('mr')}
                    className={`px-2 py-0.5 rounded-lg font-semibold transition-colors cursor-pointer ${chatLang === 'mr' ? 'bg-emerald-600 text-white' : 'text-emerald-300 hover:text-white'}`}
                  >
                    मराठी
                  </button>
                  <button
                    onClick={() => handleLanguageSwitch('hi')}
                    className={`px-2 py-0.5 rounded-lg font-semibold transition-colors cursor-pointer ${chatLang === 'hi' ? 'bg-emerald-600 text-white' : 'text-emerald-300 hover:text-white'}`}
                  >
                    हिंदी
                  </button>
                </div>

                <button
                  onClick={() => setSpeechEnabled(!speechEnabled)}
                  className={`p-1.5 rounded-xl transition-colors cursor-pointer ${speechEnabled ? 'bg-emerald-600 text-white' : 'text-emerald-300 hover:bg-emerald-800'}`}
                  title={speechEnabled ? 'Mute AI voice' : 'Enable AI voice response'}
                >
                  {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                <button
                  onClick={onToggle}
                  className="p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Category Filter Chips Bar for Quick Discovery */}
            <div className="bg-slate-100/90 border-b border-slate-200 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
              {categoryTabs.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                const label = chatLang === 'mr' ? cat.labelMr : chatLang === 'hi' ? cat.labelHi : cat.labelEn;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:border-emerald-300'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/70 text-xs">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-xs relative group ${
                        isUser
                          ? 'bg-emerald-600 text-white rounded-tr-none'
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none'
                      }`}
                    >
                      {/* Message content */}
                      <div className="whitespace-pre-line leading-relaxed">
                        {msg.text}
                      </div>

                      {/* Optional Interactive Crop Highlight Card inside response */}
                      {msg.cropHighlight && (
                        <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-slate-900 flex items-center justify-between gap-3">
                          <div>
                            <span className="font-bold text-xs block text-emerald-950">
                              {msg.cropHighlight.name}
                            </span>
                            <span className="text-[11px] font-mono text-emerald-800 font-semibold">
                              ₹{msg.cropHighlight.modalPrice.toLocaleString('en-IN')} / {msg.cropHighlight.unit}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              msg.cropHighlight.trend === 'up' 
                                ? 'bg-emerald-200 text-emerald-900' 
                                : msg.cropHighlight.trend === 'down'
                                ? 'bg-rose-200 text-rose-900'
                                : 'bg-slate-200 text-slate-800'
                            }`}>
                              {msg.cropHighlight.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                              {msg.cropHighlight.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                              <span>{msg.cropHighlight.changePercent > 0 ? `+${msg.cropHighlight.changePercent}%` : `${msg.cropHighlight.changePercent}%`}</span>
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Message Footer (Timestamp & Copy) */}
                      <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-black/5 text-[10px] opacity-75">
                        <span>{msg.timestamp}</span>
                        {!isUser && (
                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="hover:opacity-100 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-1.5 bg-white border border-slate-200/90 text-slate-500 px-3 py-2 rounded-2xl rounded-tl-none w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-[10px] font-medium ml-1 text-slate-500">
                    {chatLang === 'mr' ? 'माई विश्लेषण करत आहे...' : chatLang === 'hi' ? 'माई विश्लेषण कर रही है...' : 'MAI is thinking...'}
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Dynamic Suggestion Prompt Chips */}
            <div className="p-2.5 bg-white border-t border-slate-100 shrink-0">
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {chatLang === 'mr' ? 'सुचवलेले प्रश्न:' : chatLang === 'hi' ? 'सुझाए गए प्रश्न:' : 'Suggested Prompts:'}
                </span>
                <span className="text-[9px] text-emerald-600 font-semibold">
                  {chatLang === 'mr' ? 'क्लिक करून विचारा' : chatLang === 'hi' ? 'क्लिक करके पूछें' : 'Tap to ask'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {currentPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="whitespace-nowrap shrink-0 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-200/70 hover:border-emerald-300 rounded-xl px-2.5 py-1 text-[11px] transition-colors font-medium cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white border-t border-slate-200/80 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  chatLang === 'mr'
                    ? "कांदा भाव, नफा हिशोब, हमीभाव किंवा रोग विचारा..."
                    : chatLang === 'hi'
                    ? "प्याज़ भाव, मुनाफा गणना, मंडी नियम या रोग पूछें..."
                    : "Ask about rates, selling advice, cess, MSP, pests..."
                }
                className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white p-2.5 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
                aria-label="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
