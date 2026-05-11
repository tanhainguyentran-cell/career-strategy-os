import React, { useState, useEffect } from 'react';
import { 
  Radar, Dna, Target, Map, Sparkles, Save, 
  ChevronRight, LogOut, Mail, Lock, User, AlertCircle, CheckCircle2, Loader2, Plus, Check, Briefcase, Calendar, Upload, FileText, FileDown, Zap, Database
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, signOut, signInAnonymously, signInWithCustomToken
} from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// --- FIREBASE INITIALIZATION ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'career-strategy-app';

// --- CATALOG MÔ HÌNH 5 BƯỚC NGUYÊN BẢN (KÈM SUB-FIELDS) ---
const MODELS_CATALOG = {
  step1: [ // Bước 1: Quét Radar Môi trường
    { 
      id: 'pestle', name: 'PESTLE (Môi trường Vĩ mô)', 
      subFields: [
        { id: 'p', label: 'Chính trị & Pháp lý' },
        { id: 'e', label: 'Kinh tế' },
        { id: 's', label: 'Xã hội' },
        { id: 't', label: 'Công nghệ' },
        { id: 'env', label: 'Môi trường (ESG)' }
      ]
    },
    { 
      id: 'porter', name: 'Porter\'s 5 Forces', 
      subFields: [
        { id: 'rivalry', label: 'Cạnh tranh nội bộ ngành' },
        { id: 'entrants', label: 'Nguy cơ từ đối thủ mới' },
        { id: 'substitutes', label: 'Sản phẩm/Dịch vụ thay thế' },
        { id: 'suppliers', label: 'Quyền lực nhà cung cấp' },
        { id: 'buyers', label: 'Quyền lực khách hàng' }
      ]
    },
    { 
      id: '3c', name: 'Mô hình 3C (Mở rộng)', 
      subFields: [
        { id: 'company', label: 'Company (Công ty)' },
        { id: 'customer', label: 'Customer (Khách hàng)' },
        { id: 'competitor', label: 'Competitor (Đối thủ)' }
      ]
    }
  ],
  step2: [ // Bước 2: Giải phẫu DNA Doanh nghiệp
    { 
      id: 'rbv', name: 'Thuyết Nguồn lực (RBV)', 
      subFields: [
        { id: 'tangible', label: 'Tài sản hữu hình (Vốn, Mạng lưới)' },
        { id: 'intangible', label: 'Tài sản vô hình (Dữ liệu, Thương hiệu)' },
        { id: 'capabilities', label: 'Năng lực cốt lõi (Tech, Văn hóa)' }
      ]
    },
    { 
      id: 'finance', name: 'Minh chứng Tài chính & Hoạt động', 
      subFields: [
        { id: 'revenue', label: 'Doanh thu & Lợi nhuận' },
        { id: 'risk', label: 'Tỷ lệ an toàn (VD: Nợ xấu, CIR)' },
        { id: 'investment', label: 'Đầu tư công nghệ / R&D' }
      ]
    },
    { 
      id: 'value_chain', name: 'Chuỗi Giá trị (Value Chain)', 
      subFields: [
        { id: 'primary', label: 'Hoạt động chính (Inbound, Sales, Service...)' },
        { id: 'support', label: 'Hoạt động hỗ trợ (HR, Tech, Procurement...)' }
      ]
    }
  ],
  step3: [ // Bước 3: Khung Năng lực & Văn hóa
    { 
      id: 'competency', name: 'Khung Năng Lực (Từ JD)', 
      subFields: [
        { id: 'core', label: 'Năng lực lõi (Phù hợp văn hóa)' },
        { id: 'hard', label: 'Năng lực chuyên môn (Hard Skills)' },
        { id: 'soft', label: 'Năng lực mềm & Thái độ (Soft Skills)' }
      ]
    },
    { 
      id: 'agile', name: 'Văn hóa & Tổ chức (VD: Agile)', 
      subFields: [
        { id: 'structure', label: 'Cơ cấu tổ chức (Truyền thống vs Squad/Tribe)' },
        { id: 'style', label: 'Phong cách làm việc & Tốc độ' }
      ]
    },
    { 
      id: 'mckinsey_7s', name: 'McKinsey 7S', 
      subFields: [
        { id: 'hard_s', label: 'Strategy, Structure, Systems' },
        { id: 'soft_s', label: 'Shared Values, Style, Staff, Skills' }
      ]
    }
  ],
  step4: [ // Bước 4: Chiến lược Cá nhân (SWOT/TOWS)
    { 
      id: 'swot', name: 'Phân tích SWOT', 
      subFields: [
        { id: 's', label: 'Strengths (Điểm mạnh cốt lõi)' },
        { id: 'w', label: 'Weaknesses (Điểm yếu chí mạng)' },
        { id: 'o', label: 'Opportunities (Cơ hội ngành)' },
        { id: 't', label: 'Threats (Thách thức cạnh tranh)' }
      ]
    },
    { 
      id: 'tows', name: 'Ma trận Chiến lược TOWS', 
      subFields: [
        { id: 'so', label: 'Chiến lược S-O (Tấn công chớp cơ hội)' },
        { id: 'wt', label: 'Chiến lược W-T (Phòng thủ vá lỗ hổng)' },
        { id: 'st', label: 'Chiến lược S-T (Khác biệt hóa)' },
        { id: 'wo', label: 'Chiến lược W-O (Bổ khuyết đón đầu)' }
      ]
    }
  ],
  step5: [ // Bước 5: Lộ trình SMART
    { 
      id: 'smart', name: 'Lộ trình SMART', 
      subFields: [
        { id: 's', label: 'Mục tiêu Cụ thể (Specific)' },
        { id: 'm', label: 'Đo lường được (Measurable)' },
        { id: 't', label: 'Thời hạn (Time-bound)' }
      ]
    },
    { 
      id: 'okr', name: 'Hệ thống OKR', 
      subFields: [
        { id: 'o', label: 'Mục tiêu lớn (Objective)' },
        { id: 'kr', label: 'Các kết quả then chốt (Key Results 1,2,3...)' }
      ]
    }
  ]
};

// --- HELPER: Parse JSON from AI ---
const parseAIJson = (text) => {
  try {
    let cleanText = text;
    if (cleanText.includes('```')) {
      const parts = cleanText.split('```');
      if (parts.length >= 3) {
        cleanText = parts[1].replace(/^json\n/i, '');
      }
    }
    return JSON.parse(cleanText.trim());
  } catch (e) {
    console.error("Failed to parse JSON:", text);
    throw new Error("AI trả về sai định dạng. Vui lòng thử lại.");
  }
};

// --- GEMINI AI API CORE FUNCTIONS ---

const callGeminiJson = async (prompt) => {
  const apiKey = ""; 
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  };
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const data = await response.json();
  return parseAIJson(data.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
};

const suggestRolesAI = async (industry, company) => {
  const prompt = `Tôi muốn ứng tuyển vào ngành "${industry}" tại công ty "${company}". 
Hãy trả về JSON danh sách 4-5 vị trí công việc phổ biến. Format JSON: { "roles": ["Vị trí A", "Vị trí B"] }`;
  return await callGeminiJson(prompt);
};

const suggestModelsAI = async (profile, rawDoc) => {
  const prompt = `Khách hàng ứng tuyển: ${profile.targetRole} tại ${profile.targetCompany}. Kinh nghiệm: ${profile.experience}.
Hãy chọn các model ID phù hợp nhất từ danh sách để họ phân tích:
- step1 (Thị trường): pestle, porter, 3c
- step2 (DNA): rbv, finance, value_chain
- step3 (Năng lực): competency, agile, mckinsey_7s
- step4 (Cá nhân): swot, tows
- step5 (Lộ trình): smart, okr
Format JSON: { "step1": ["id"], "step2": ["id"], "step3": ["id"], "step4": ["id"], "step5": ["id"] }`;
  return await callGeminiJson(prompt);
};

const generateGuidingQuestionsAI = async (modelId, profile) => {
  const model = [...MODELS_CATALOG.step1, ...MODELS_CATALOG.step2, ...MODELS_CATALOG.step3, ...MODELS_CATALOG.step4, ...MODELS_CATALOG.step5].find(m => m.id === modelId);
  if (!model) return {};
  const subFieldIds = model.subFields.map(sf => sf.id).join(', ');
  const prompt = `Ứng viên vị trí ${profile.targetRole} tại ${profile.targetCompany}. 
Mô hình ${model.name}. Tạo CÂU HỎI GỢI Ý ngắn (1 câu) cho từng mục (${subFieldIds}).
Format JSON: { "subfield_id": "Câu hỏi gợi ý..." }`;
  return await callGeminiJson(prompt);
};

const extractDocToSubfieldsAI = async (modelId, rawDoc, profile) => {
  const model = [...MODELS_CATALOG.step1, ...MODELS_CATALOG.step2, ...MODELS_CATALOG.step3, ...MODELS_CATALOG.step4].find(m => m.id === modelId);
  if (!model) return {};
  const subFieldIds = model.subFields.map(sf => sf.id).join(', ');
  const prompt = `Dựa vào tài liệu: """${rawDoc.substring(0, 3000)}"""
Trích xuất thông tin trọng tâm điền vào các mục (${subFieldIds}) của mô hình ${model.name}.
Ghi "Tài liệu không đề cập" nếu không có. Format JSON: { "subfield_id": "Nội dung phân tích..." }`;
  return await callGeminiJson(prompt);
};

const generateRoadmapAI = async (fullData) => {
  const step5Models = fullData.selectedModels.step5 || [];
  if (step5Models.length === 0) return null;
  const prompt = `Phân tích dữ liệu JSON (Vĩ mô, Vi mô, SWOT) sau để tạo Lộ Trình Hành Động cụ thể cho các mô hình (${step5Models.join(', ')}):
${JSON.stringify({
    profile: fullData.profile,
    market: fullData.analyses.step1,
    dna: fullData.analyses.step2,
    competency: fullData.analyses.step3,
    strategy: fullData.analyses.step4
  }).substring(0, 5000)}
Lập kế hoạch khắc phục điểm yếu, bám sát JD. Đưa ra lịch trình rõ ràng.
Format JSON: { "model_id": { "subfield_id": "Nội dung hành động chi tiết..." } }`;
  return await callGeminiJson(prompt);
};

// --- AUTHENTICATION SCREEN ---
function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message.includes('auth/') ? 'Email hoặc mật khẩu không hợp lệ.' : 'Đã có lỗi xảy ra.');
      if (err.message.includes('configuration')) {
        try { await signInAnonymously(auth); } catch(fallbackErr) { setError('Không thể kết nối máy chủ xác thực.'); }
      }
    }
    setLoading(false);
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try { await signInAnonymously(auth); } catch (err) { setError('Lỗi đăng nhập khách.'); }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        <div className="text-center mb-8">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Recruitment OS</h1>
          <p className="text-slate-500 text-sm mt-2">Hệ Thống Phân Tích & Chiến Lược Cá Nhân</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 flex items-center"><AlertCircle className="w-4 h-4 mr-2" />{error}</div>}
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute inset-y-3 left-3 h-5 w-5 text-slate-400 pointer-events-none" />
              <input type="email" required className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute inset-y-3 left-3 h-5 w-5 text-slate-400 pointer-events-none" />
              <input type="password" required className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm transition-colors flex justify-center">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Đăng nhập' : 'Tạo tài khoản')}
          </button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="mt-4 w-full text-sm text-indigo-600 font-medium">{isLogin ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}</button>
        <div className="my-6 border-t border-slate-200 relative"><span className="absolute top-[-10px] left-1/2 bg-white px-2 text-xs text-slate-400 -translate-x-1/2">Hoặc</span></div>
        <button onClick={handleGuestLogin} className="w-full py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Trải nghiệm ngay (Khách)</button>
      </div>
    </div>
  );
}


// --- MAIN APP COMPONENT ---
export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        try { await signInWithCustomToken(auth, __initial_auth_token); } catch (e) {}
      } else {
        try { await signInAnonymously(auth); } catch(e) {}
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  
  // Guard the rendering of MainDashboard so it only renders if user exists.
  return <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">{!user ? <AuthScreen /> : <MainDashboard user={user} />}</div>;
}

// --- MAIN DASHBOARD ---
const STEPS = [
  { id: 0, name: 'Trạm Dữ Liệu & Hồ Sơ', icon: Database },
  { id: 1, name: 'Bước 1: Quét Radar Thị Trường', icon: Radar },
  { id: 2, name: 'Bước 2: Giải Phẫu DNA Doanh Nghiệp', icon: Dna },
  { id: 3, name: 'Bước 3: Khung Năng Lực & Văn Hóa', icon: Briefcase },
  { id: 4, name: 'Bước 4: Chiến Lược Cá Nhân', icon: Target },
  { id: 5, name: 'Bước 5: Lộ Trình Hành Động', icon: Map },
];

const INITIAL_DATA = {
  profile: { 
    industry: '', targetCompany: '', targetRole: '', 
    education: '', hardSkills: '', softSkills: '', coreValues: '', experience: 'fresher' 
  },
  rawDocument: '',
  selectedModels: { 
    step1: ['pestle', 'porter'], 
    step2: ['rbv', 'finance'], 
    step3: ['competency', 'agile'], 
    step4: ['swot', 'tows'], 
    step5: ['smart'] 
  },
  analyses: { step1: {}, step2: {}, step3: {}, step4: {}, step5: {} },
  placeholders: { step1: {}, step2: {}, step3: {}, step4: {}, step5: {} }
};

function MainDashboard({ user }) {
  const [activeStep, setActiveStep] = useState(0); 
  const [data, setData] = useState(INITIAL_DATA);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  
  // UI States
  const [suggestedRoles, setSuggestedRoles] = useState([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isSuggestingModels, setIsSuggestingModels] = useState(false);
  const [isGeneratingStep5, setIsGeneratingStep5] = useState(false);

  // Fetch Data
  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'strategy_data', 'v3_profile_5steps');
    const unsubscribe = onSnapshot(docRef, (document) => {
      if (document.exists()) setData({ ...INITIAL_DATA, ...document.data() });
    });
    return () => unsubscribe();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'strategy_data', 'v3_profile_5steps'), data, { merge: true });
      setSaveStatus('Đã lưu thành công!'); setTimeout(() => setSaveStatus(''), 3000);
    } catch (e) { setSaveStatus('Lỗi lưu dữ liệu'); }
    setSaving(false);
  };

  // State Updaters
  const updateProfile = (field, value) => setData(prev => ({ ...prev, profile: { ...prev.profile, [field]: value } }));
  const updateAnalysis = (step, modelId, subFieldId, value) => {
    setData(prev => {
      const stepData = prev.analyses[step] || {};
      const modelData = stepData[modelId] || {};
      return { ...prev, analyses: { ...prev.analyses, [step]: { ...stepData, [modelId]: { ...modelData, [subFieldId]: value } } } };
    });
  };
  const toggleModel = (stepKey, modelId) => {
    setData(prev => {
      const current = prev.selectedModels[stepKey] || [];
      const newSelection = current.includes(modelId) ? current.filter(id => id !== modelId) : [...current, modelId];
      return { ...prev, selectedModels: { ...prev.selectedModels, [stepKey]: newSelection } };
    });
  };

  // --- ACTIONS ---
  const handleSuggestRoles = async () => {
    if (!data.profile.industry || !data.profile.targetCompany) return alert('Vui lòng nhập Ngành nghề và Công ty trước!');
    setIsLoadingRoles(true);
    try {
      const res = await suggestRolesAI(data.profile.industry, data.profile.targetCompany);
      if (res && Array.isArray(res.roles)) {
        setSuggestedRoles(res.roles);
      } else {
        setSuggestedRoles([]);
      }
    } catch (e) { alert(e.message); }
    setIsLoadingRoles(false);
  };

  const handleSuggestModels = async () => {
    setIsSuggestingModels(true);
    try {
      const res = await suggestModelsAI(data.profile, data.rawDocument);
      setData(prev => ({ ...prev, selectedModels: { 
        step1: res.step1 || prev.selectedModels.step1,
        step2: res.step2 || prev.selectedModels.step2,
        step3: res.step3 || prev.selectedModels.step3, 
        step4: res.step4 || prev.selectedModels.step4, 
        step5: res.step5 || prev.selectedModels.step5 
      } }));
      alert("Đã phân tích Profile và chọn các mô hình phù hợp cho 5 Bước!");
      setActiveStep(1); 
    } catch (e) { alert(e.message); }
    setIsSuggestingModels(false);
  };

  const handleAutoGenerateStep5 = async () => {
    setIsGeneratingStep5(true);
    try {
      const res = await generateRoadmapAI(data);
      if (res) {
        setData(prev => {
          const newAnalysesStep5 = { ...prev.analyses.step5 };
          Object.keys(res).forEach(modelId => { newAnalysesStep5[modelId] = res[modelId]; });
          return { ...prev, analyses: { ...prev.analyses, step5: newAnalysesStep5 } };
        });
      }
    } catch (e) { alert(e.message); }
    setIsGeneratingStep5(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setData(prev => ({ ...prev, rawDocument: prev.rawDocument + '\n' + evt.target.result }));
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* SIDEBAR NAVIGATION */}
      <div className="w-72 bg-slate-900 text-slate-300 flex flex-col transition-all">
        <div className="p-4 bg-slate-950 flex items-center space-x-3">
          <div className="bg-indigo-500 p-2 rounded-lg"><Target className="w-5 h-5 text-white" /></div>
          <span className="text-white font-bold tracking-wide">Recruitment OS</span>
        </div>
        <div className="flex-1 py-4 overflow-y-auto">
          <nav className="space-y-1 px-3">
            {STEPS.map((step) => {
              const isActive = activeStep === step.id;
              const isSetupStep = step.id === 0;
              return (
                <div key={step.id}>
                  {step.id === 1 && <div className="mt-4 mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Hệ Thống 5 Bước</div>}
                  <button
                    onClick={() => setActiveStep(step.id)}
                    className={`w-full flex items-center px-3 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? (isSetupStep ? 'bg-slate-700 text-white' : 'bg-indigo-600 text-white shadow-md') 
                        : 'hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <step.icon className={`w-5 h-5 mr-3 ${isActive ? (isSetupStep ? 'text-slate-300' : 'text-indigo-200') : 'text-slate-400'}`} />
                    <span className={`text-sm text-left flex-1 ${isActive ? 'font-bold' : 'font-medium'}`}>{step.name}</span>
                    {isActive && <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              );
            })}
          </nav>
        </div>
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center flex justify-between items-center">
          <div className="text-xs text-slate-500 truncate flex-1 text-left"><User className="w-3 h-3 inline mr-1"/>{user.email || 'Khách'}</div>
          <button onClick={() => signOut(auth)} className="text-xs text-slate-400 hover:text-white p-1"><LogOut className="w-4 h-4" /></button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between z-10 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 flex items-center">{STEPS.find(s => s.id === activeStep)?.name}</h2>
          <div className="flex items-center space-x-4">
            {saveStatus && <span className="text-sm text-emerald-600 font-medium"><CheckCircle2 className="w-4 h-4 inline mr-1" /> {saveStatus}</span>}
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 inline animate-spin" /> : <Save className="w-4 h-4 inline mr-1" />} Lưu Kế Hoạch
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          <div className="max-w-4xl mx-auto pb-24 space-y-8">
            
            {/* STEP 0: TRẠM DỮ LIỆU & HỒ SƠ (SETUP) */}
            {activeStep === 0 && (
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Thông Tin Định Vị</h3>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Ngành nghề</label>
                      <input type="text" className="w-full px-4 py-2 border rounded-lg bg-slate-50" placeholder="VD: Ngân hàng, FMCG..." value={data.profile.industry} onChange={(e) => updateProfile('industry', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Công ty mục tiêu</label>
                      <input type="text" className="w-full px-4 py-2 border rounded-lg bg-slate-50" placeholder="VD: BIDV, Vietcombank..." value={data.profile.targetCompany} onChange={(e) => updateProfile('targetCompany', e.target.value)} />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex justify-between items-end">
                      Vị trí ứng tuyển
                      <button onClick={handleSuggestRoles} disabled={isLoadingRoles} className="text-indigo-600 text-xs font-bold bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 flex items-center">
                        {isLoadingRoles ? <Loader2 className="w-3 h-3 mr-1 animate-spin"/> : <Sparkles className="w-3 h-3 mr-1"/>} Gợi ý vị trí
                      </button>
                    </label>
                    {suggestedRoles.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {suggestedRoles.map((role, idx) => {
                          const roleStr = typeof role === 'string' ? role : (role.name || JSON.stringify(role));
                          return (
                            <span key={idx} onClick={() => updateProfile('targetRole', roleStr)} className="cursor-pointer px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-sm hover:bg-indigo-600 hover:text-white transition-colors">
                              {roleStr}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <input type="text" className="w-full px-4 py-2 border rounded-lg bg-slate-50" placeholder="VD: Chuyên viên Khách hàng Doanh nghiệp..." value={data.profile.targetRole} onChange={(e) => updateProfile('targetRole', e.target.value)} />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Mức độ kinh nghiệm</label>
                    <div className="flex space-x-4">
                      {[{ id: 'fresher', label: 'Fresher (< 1 năm)' }, { id: 'junior', label: 'Junior (1-3 năm)' }, { id: 'senior', label: 'Senior (> 3 năm)' }].map(exp => (
                        <label key={exp.id} className={`flex-1 text-center p-2 border rounded-lg cursor-pointer ${data.profile.experience === exp.id ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold' : 'bg-white text-slate-600'}`}>
                          <input type="radio" className="hidden" checked={data.profile.experience === exp.id} onChange={() => updateProfile('experience', exp.id)} /> {exp.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Kỹ năng Cứng (Hard Skills)</label>
                      <textarea className="w-full h-20 p-3 border rounded-lg bg-slate-50" placeholder="Python, Phân tích tài chính..." value={data.profile.hardSkills} onChange={(e) => updateProfile('hardSkills', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Kỹ năng Mềm (Soft Skills)</label>
                      <textarea className="w-full h-20 p-3 border rounded-lg bg-slate-50" placeholder="Giao tiếp, Đàm phán..." value={data.profile.softSkills} onChange={(e) => updateProfile('softSkills', e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800 p-8 rounded-xl shadow-lg text-white">
                  <h3 className="text-xl font-bold flex items-center mb-2"><Database className="w-5 h-5 mr-2"/> Nạp Dữ Liệu Nguồn (JD / Báo cáo)</h3>
                  <p className="text-slate-300 mb-4 text-sm">Nạp Mô tả công việc (JD) hoặc Báo cáo thường niên để AI ngầm hiểu và tự động phân tích ở 5 bước sau.</p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-400">Dán Text hoặc Tải file (.txt)</span>
                    <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-sm flex items-center transition-colors">
                      <Upload className="w-4 h-4 mr-2" /> Chọn file .txt
                      <input type="file" accept=".txt" className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>
                  <textarea 
                    className="w-full h-48 p-4 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 placeholder-slate-600 mb-4"
                    placeholder="Paste JD hoặc Báo cáo vào đây..."
                    value={data.rawDocument} onChange={(e) => setData(prev => ({...prev, rawDocument: e.target.value}))}
                  />
                  <button 
                    onClick={handleSuggestModels} disabled={isSuggestingModels}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow flex justify-center items-center"
                  >
                    {isSuggestingModels ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> : <Zap className="w-5 h-5 mr-2"/>}
                    Lưu Profile & Setup Mô hình cho 5 Bước
                  </button>
                </div>
              </div>
            )}

            {/* STEPS 1 TO 5: THE CORE ANALYTICAL FRAMEWORK */}
            {activeStep >= 1 && activeStep <= 5 && (
              <div className="space-y-8">
                
                {/* ĐẶC QUYỀN BƯỚC 5: MASTER AI GENERATOR */}
                {activeStep === 5 && (
                  <div className="bg-indigo-600 p-8 rounded-xl shadow-lg text-white mb-8">
                     <h3 className="text-2xl font-bold mb-2 flex items-center"><Map className="w-6 h-6 mr-2" /> AI Sinh Lộ Trình Tự Động</h3>
                     <p className="text-indigo-100 mb-6">AI sẽ ngầm đọc lại Vĩ mô (Bước 1), Vi mô (Bước 2,3) và SWOT (Bước 4) của bạn để viết Lộ trình lấp lỗ hổng chuyên môn.</p>
                     <button onClick={handleAutoGenerateStep5} disabled={isGeneratingStep5} className="bg-white text-indigo-700 px-6 py-3 rounded-lg font-bold hover:bg-indigo-50 flex items-center disabled:opacity-80">
                        {isGeneratingStep5 ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />} Sinh Lộ Trình Lập Tức
                     </button>
                  </div>
                )}

                {/* Model Toggle Bar */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 uppercase mb-4">Mô hình phân tích (Tùy chọn)</h3>
                  <div className="flex flex-wrap gap-3">
                    {MODELS_CATALOG[`step${activeStep}`]?.map(model => {
                      const isSelected = data.selectedModels[`step${activeStep}`]?.includes(model.id);
                      return (
                        <button key={model.id} onClick={() => toggleModel(`step${activeStep}`, model.id)}
                          className={`flex items-center px-4 py-1.5 rounded-full text-sm font-medium border ${isSelected ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-500'}`}
                        >
                          {isSelected ? <Check className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />} {model.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Render Selected Models with Breakdown */}
                {data.selectedModels[`step${activeStep}`]?.map(modelId => {
                  const modelInfo = MODELS_CATALOG[`step${activeStep}`].find(m => m.id === modelId);
                  if (!modelInfo) return null;
                  
                  return (
                    <ModelBreakdownBlock 
                      key={modelId}
                      stepKey={`step${activeStep}`}
                      modelInfo={modelInfo}
                      profile={data.profile}
                      rawDocument={data.rawDocument}
                      modelData={data.analyses[`step${activeStep}`]?.[modelId] || {}}
                      placeholders={data.placeholders[`step${activeStep}`]?.[modelId] || {}}
                      updateAnalysis={(subFieldId, val) => updateAnalysis(`step${activeStep}`, modelId, subFieldId, val)}
                      updatePlaceholders={(phData) => setData(prev => ({
                        ...prev, placeholders: { ...prev.placeholders, [`step${activeStep}`]: { ...prev.placeholders[`step${activeStep}`], [modelId]: phData } }
                      }))}
                    />
                  );
                })}

                {(!data.selectedModels[`step${activeStep}`] || data.selectedModels[`step${activeStep}`].length === 0) && (
                  <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                    <p>Chưa chọn mô hình nào cho bước này.</p>
                  </div>
                )}
              </div>
            )}

            {/* ĐIỀU HƯỚNG TỚI/LUI */}
            <div className="flex justify-between mt-12 pt-6 border-t border-slate-200">
              <button onClick={() => setActiveStep(prev => Math.max(0, prev - 1))} disabled={activeStep === 0} className="px-6 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg disabled:opacity-0 hover:bg-slate-50">
                Quay lại
              </button>
              <button onClick={() => { if (activeStep < 5) setActiveStep(prev => prev + 1); else handleSave(); }} className="px-6 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 flex items-center shadow-md">
                {activeStep < 5 ? (activeStep === 0 ? 'Vào Phân tích 5 Bước' : 'Bước Tiếp Theo') : 'Hoàn thành & Lưu'} <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: MODEL BREAKDOWN BLOCK (WITH AI AUTO-FILL & AI GUIDANCE) ---
function ModelBreakdownBlock({ stepKey, modelInfo, profile, rawDocument, modelData, placeholders, updateAnalysis, updatePlaceholders }) {
  const [isGettingHints, setIsGettingHints] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleGetHints = async () => {
    setIsGettingHints(true);
    try {
      const hints = await generateGuidingQuestionsAI(modelInfo.id, profile);
      updatePlaceholders(hints);
    } catch(e) { alert(e.message); }
    setIsGettingHints(false);
  };

  const handleExtract = async () => {
    if (!rawDocument || rawDocument.length < 50) return alert('Trạm Dữ liệu đang trống. Vui lòng quay lại Trạm Dữ Liệu để nạp JD/Báo cáo trước!');
    setIsExtracting(true);
    try {
      const extracted = await extractDocToSubfieldsAI(modelInfo.id, rawDocument, profile);
      Object.keys(extracted).forEach(subId => {
        if (extracted[subId]) {
          const valStr = typeof extracted[subId] === 'string' ? extracted[subId] : JSON.stringify(extracted[subId]);
          updateAnalysis(subId, valStr);
        }
      });
    } catch(e) { alert(e.message); }
    setIsExtracting(false);
  };

  const calendarLink = (stepKey === 'step5') ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`[Mục tiêu] ${modelInfo.name}`)}&details=${encodeURIComponent(JSON.stringify(modelData, null, 2))}` : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h3 className="text-lg font-bold text-slate-800">{modelInfo.name}</h3>
        <div className="flex flex-wrap gap-2">
          {stepKey !== 'step5' && (
            <>
              <button onClick={handleGetHints} disabled={isGettingHints} className="px-3 py-1.5 bg-white border border-slate-300 text-slate-600 rounded text-sm font-medium hover:bg-slate-50 flex items-center">
                {isGettingHints ? <Loader2 className="w-3 h-3 mr-1 animate-spin"/> : <Sparkles className="w-3 h-3 mr-1 text-amber-500"/>} Gợi ý cách viết
              </button>
              <button onClick={handleExtract} disabled={isExtracting} className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded text-sm font-medium hover:bg-indigo-100 flex items-center shadow-sm">
                {isExtracting ? <Loader2 className="w-3 h-3 mr-1 animate-spin"/> : <FileDown className="w-3 h-3 mr-1"/>} Phân tích tự động từ Data
              </button>
            </>
          )}
          {calendarLink && (
             <a href={calendarLink} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded text-sm font-medium border border-emerald-200 flex items-center shadow-sm hover:bg-emerald-100"><Calendar className="w-4 h-4 mr-1"/> Đưa vào Google Calendar</a>
          )}
        </div>
      </div>
      
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {modelInfo.subFields.map((sf, idx) => {
          const phVal = placeholders[sf.id];
          const placeholderText = typeof phVal === 'string' ? phVal : (phVal ? JSON.stringify(phVal) : `Phân tích ${sf.label}... (Hoặc bấm "Phân tích tự động" ở trên để AI lấy từ JD điền vào đây)`);
          
          const mdVal = modelData[sf.id];
          const valueText = typeof mdVal === 'string' ? mdVal : (mdVal ? JSON.stringify(mdVal) : '');
          
          return (
            <div key={sf.id} className={`bg-slate-50 p-4 rounded-lg border border-slate-100 ${modelInfo.subFields.length % 2 !== 0 && idx === modelInfo.subFields.length - 1 ? 'md:col-span-2' : ''}`}>
              <label className="block text-sm font-bold text-slate-700 mb-2">{sf.label}</label>
              <textarea
                className="w-full min-h-[120px] p-3 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 bg-white text-sm leading-relaxed placeholder-slate-400"
                placeholder={placeholderText}
                value={valueText}
                onChange={(e) => updateAnalysis(sf.id, e.target.value)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}