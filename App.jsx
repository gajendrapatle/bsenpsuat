import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import {
  CreditCard, User, FileText, CheckCircle, AlertCircle,
  ChevronRight, ChevronLeft, Building, Users,
  ShieldCheck, Wallet, RefreshCw, Download, LogOut, Menu, X,
  MapPin, Briefcase, Heart, Info, Filter, PieChart, TrendingUp,
  Settings, IndianRupee, Plus, Trash2, Edit, Users2, Printer, Lock,
  Key, Search, Landmark, Smartphone, ArrowRight, UserCheck, Clock, BarChart3, Globe
} from 'lucide-react';

// --- MOCK API & UTILS ---
const simulateApiCall = (duration = 1500) => new Promise(resolve => setTimeout(resolve, duration));
const generateRefId = () => `BSE-NPS-${Math.floor(1000 + Math.random() * 9000)}`;
// Swap with the official BSE STAR NPS logo asset when available.
const BSE_LOGO_URL = '/bse_logo.png';
const CAPTCHA_DEMO_URL = '/captcha_demo.png';
const BSE_COLORS = {
  blue: '#0B2D5C',
  orangeLight: '#F5A623',
  orangeDark: '#F05A28'
};

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return `₹ ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const mockApi = {
  sendOtp: () => simulateApiCall(800),
  verifyOtp: () => simulateApiCall(800),
  checkPanWithCra: () => simulateApiCall(1200),
  validateMobileWithCra: () => simulateApiCall(1200)
};

const decidePanMobileFlow = ({ pan, mobile }) => {
  const panLast = String(pan || '').slice(-1).toUpperCase();
  const mobileLast = String(mobile || '').slice(-1);

  if (panLast === 'E') return { flow: 'EXISTING_PRAN' };
  if (panLast === 'C' && mobileLast === '1') return { flow: 'CKYC' };
  if (panLast === 'D' && mobileLast === '1') return { flow: 'DIGILOCKER' };
  if (panLast === 'P' || !['C', 'D', 'E'].includes(panLast)) return { flow: 'CONTRIBUTION' };
  return { flow: 'CONTRIBUTION' };
};

// --- PINCODE LOOKUP (MOCK) ---
const PINCODE_DIRECTORY = {
  '400001': { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
  '110001': { city: 'New Delhi', state: 'Delhi', country: 'India' },
  '560001': { city: 'Bengaluru', state: 'Karnataka', country: 'India' },
  '600001': { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
  '700001': { city: 'Kolkata', state: 'West Bengal', country: 'India' },
  '500001': { city: 'Hyderabad', state: 'Telangana', country: 'India' },
  '411001': { city: 'Pune', state: 'Maharashtra', country: 'India' },
  '302001': { city: 'Jaipur', state: 'Rajasthan', country: 'India' }
};

const lookupPincode = (pin) => {
  const clean = String(pin || '').replace(/\D/g, '').slice(0, 6);
  if (clean.length !== 6) return { valid: false };
  const details = PINCODE_DIRECTORY[clean];
  if (details) return { valid: true, found: true, ...details };
  return { valid: true, found: false, country: 'India' };
};

const UPI_QR_URL = 'https://chart.googleapis.com/chart?cht=qr&chs=180x180&chl=BSE%20STAR%20NPS%20UPI';

// --- PFM DATA ---
const PFM_LIST = [
  { id: 'SBI', name: 'SBI Pension Fund', logo: 'SBI', minAmt: '500', schemes: ['E', 'C', 'G', 'A'], risk: 'PFM Code : SBI' },
  { id: 'LIC', name: 'LIC Pension Fund', logo: 'LIC', minAmt: '500', schemes: ['E', 'C', 'G'], risk: 'PFM Code :LIC' },
  { id: 'UTI', name: 'UTI Retirement Solutions', logo: 'UTI', minAmt: '500', schemes: ['E', 'C', 'G', 'A'], risk: 'PFM Code : UTI' },
  { id: 'HDFC', name: 'HDFC Pension Fund', logo: 'HDFC', minAmt: '500', schemes: ['E', 'C', 'G', 'A'], risk: 'PFM Code : HDFC' },
  { id: 'ICICI', name: 'ICICI Pru Pension Fund', logo: 'ICICI', minAmt: '500', schemes: ['E', 'C', 'G', 'A'], risk: 'PFM Code : ICI' },
  { id: 'KOTAK', name: 'Kotak Pension Fund', logo: 'KOTAK', minAmt: '500', schemes: ['E', 'C', 'G', 'A'], risk: 'PFM Code : KTK' },
  { id: 'ADITYA', name: 'Aditya Birla Sun Life', logo: 'ABSL', minAmt: '500', schemes: ['E', 'C', 'G', 'A'], risk: 'PFM Code : ADI' },
  { id: 'TATA', name: 'Tata Pension Management', logo: 'TATA', minAmt: '500', schemes: ['E', 'C', 'G', 'A'], risk: 'PFM Code : TAT' },
  { id: 'MAX', name: 'Max Life Pension Fund', logo: 'MAX', minAmt: '500', schemes: ['E', 'C', 'G'], risk: 'PFM Code : MAX' },
  { id: 'AXIS', name: 'Axis Pension Fund', logo: 'AXIS', minAmt: '500', schemes: ['E', 'C', 'G', 'A'], risk: 'PFM Code : AXI' }
];

const SCHEME_DETAILS = [
  { id: 'E', name: 'Scheme E (Equity)', risk: 'AGGRESSIVE', perf: '14.2%', min: 500, max: 'No Limit', logo: '📈' },
  { id: 'C', name: 'Scheme C (Corp Debt)', risk: 'MEDIUM', perf: '9.8%', min: 500, max: 'No Limit', logo: '🏢' },
  { id: 'G', name: 'Scheme G (Govt Sec)', risk: 'CONSERVATIVE', perf: '8.1%', min: 500, max: 'No Limit', logo: '🏛️' },
  { id: 'A', name: 'Scheme A (Alt Asset)', risk: 'AGGRESSIVE', perf: '11.5%', min: 500, max: '5%', logo: '💎' },
];

const steps = [
  'Basic Details',
  'Personal Details',
  'FATCA Declaration',
  'Account Type',
  'Scheme',
  'Bank Details',
  'Nominee Details',
  'Review',
  'Payment'
];

const contributionSteps = [
  'Basic Details',
  'Review',
  'Payment'
];

const RequiredMark = () => <span className="text-red-500 ml-0.5">*</span>;

// --- COMPONENT: HEADER ---
const Header = ({ onToggleSidebar, username, isAuthenticated }) => (
  <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${BSE_COLORS.orangeDark}, ${BSE_COLORS.orangeLight})` }} />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src={BSE_LOGO_URL} alt="BSE Logo" className="h-9 w-auto" />
        <div className="flex flex-col">
          <span className="font-bold text-[17px] leading-tight" style={{ color: BSE_COLORS.blue }}>BSE STAR NPS</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-3 text-[11px] text-gray-700 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: BSE_COLORS.blue, color: 'white' }}>
              <User size={14} />
            </div>
            <span className="font-medium">
              Welcome, {username || 'User'} – You are logged in..
            </span>
          </div>
        )}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          aria-label="Toggle menu"
          type="button"
        >
          <Menu size={20} />
        </button>
      </div>
    </div>
  </header>
);

// --- COMPONENT: STEPPER ---
const Stepper = ({ currentStep, steps }) => {
  return (
    <div className="w-full py-4 bg-gray-50 border-b border-gray-200 overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4 flex items-center min-w-max">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={index} className="flex items-center">
              <div className={`flex items-center gap-2 ${isCurrent ? 'text-blue-700' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs
                  ${isCurrent ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}
                `}>
                  {isCompleted ? <CheckCircle size={16} /> : index + 1}
                </div>
                <span className={`text-sm font-medium whitespace-nowrap ${isCurrent ? 'text-blue-800' : ''}`}>
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-3 ${isCompleted ? 'bg-green-200' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- NEW AUTH COMPONENTS ---

// --- ENCRYPTION & CAPTCHA UTILS ---
const arrayBufferToHex = (buffer) => {
  const byteArray = new Uint8Array(buffer);
  let hexString = "";
  byteArray.forEach((byte) => {
    hexString += byte.toString(16).padStart(2, "0");
  });
  return hexString;
};

const encryptDataAES = async (data) => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(JSON.stringify(data));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = new Uint8Array(16); // All zeros
  const password = "secretPassword";

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  const encryptedData = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    dataBuffer
  );

  return {
    data: arrayBufferToHex(encryptedData),
    s: arrayBufferToHex(salt),
    iv: arrayBufferToHex(iv),
  };
};

// --- NEW AUTH COMPONENTS ---

const LoginScreen = ({ onProceed, loginData, setLoginData }) => {
  const [captchaImage, setCaptchaImage] = useState(CAPTCHA_DEMO_URL);
  const [captchaSecret, setCaptchaSecret] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getCaptcha = async () => {
    // Simulate captcha refresh with the same demo image
    setCaptchaImage(''); // flicker effect
    setTimeout(() => setCaptchaImage(CAPTCHA_DEMO_URL), 100);
  };

  useEffect(() => {
    // Initial fetch is just setting the static image
    setCaptchaImage(CAPTCHA_DEMO_URL);
    // Clear local storage as per original code
    localStorage.clear();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!loginData.username || !loginData.password || !loginData.captcha) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      // Create combined username as per original logic
      const combinedUsername = `${loginData.role}/${loginData.memberCode || ''}/${loginData.username}`;

      const formDataToEncrypt = {
        username: combinedUsername,
        password: loginData.password,
        user_captcha: loginData.captcha,
        captcha_secret: captchaSecret || loginData.captcha_secret,
      };

      const encrypted = await encryptDataAES(formDataToEncrypt);

      // console.log("Encrypted Data:", encrypted); 
      // In a real app, you would now POST `encrypted.data` and `encrypted.s` to your login API
      // Since we are mocking the backend response in this demo app:

      await simulateApiCall(1000);
      onProceed(); // Proceed to OTP screen

    } catch (err) {
      console.error("Login processing failed", err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-white rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.05)] p-8 border border-gray-100 space-y-6">
        {/* Logo Section */}
        <div className="flex justify-center mb-4">
          {/* Fallback to text if logo url is also broken, but trying to use the constant now */}
          <img src={BSE_LOGO_URL} alt="BSE StAR MF" className="h-12 w-auto" />
        </div>

        <div className="text-center mb-6">
          <h2 className="text-[#0B2D5C] font-bold text-lg">Login To BSE STAR NPS Account</h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-4" id="loginForm">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100 flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* User Type / Entity */}
          <div className="relative">
            <select
              id="userType"
              className="w-full h-11 px-4 bg-white border border-gray-200 rounded text-gray-700 text-sm focus:outline-none focus:border-blue-500 appearance-none shadow-sm"
              value={loginData.role}
              onChange={(e) => setLoginData({ ...loginData, role: e.target.value })}
            >
              <option value="">--Select Entity--</option>
              <option value="MEMBER">POP</option>
              <option value="AMC">RA</option>
              {/* <option value="EXCHANGE">Exchange</option>
              <option value="DEPOSITORY">Depository</option> */}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronRight className="rotate-90" size={16} />
            </div>
          </div>

          {/* Entity Code */}
          <div>
            <input
              id="usercode"
              type="text"
              placeholder="Enter Entity Code"
              className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              value={loginData.memberCode || ''}
              onChange={(e) => setLoginData({ ...loginData, memberCode: e.target.value })}
            />
          </div>

          {/* User ID */}
          <div>
            <input
              id="userId"
              type="text"
              placeholder="Enter User ID"
              className="w-full h-11 px-4 bg-[#E8F0FE] border border-transparent rounded text-gray-900 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-500 font-medium"
              value={loginData.username}
              onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full h-11 px-4 bg-[#E8F0FE] border border-transparent rounded text-gray-900 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-500 font-medium tracking-widest"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <X size={20} /> : <div className="rounded-full border-2 border-current w-5 h-5 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-current"></div></div>}
            </button>
          </div>

          {/* Captcha */}
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded p-1">
              <div className="flex-1 flex justify-center bg-white rounded overflow-hidden h-10 mx-1">
                {captchaImage && <img src={captchaImage} alt="Captcha" className="h-full object-contain" id="captchaImage" />}
              </div>
              <button
                type="button"
                onClick={getCaptcha}
                className="text-gray-500 hover:text-gray-700 p-2 ml-2 bg-white rounded shadow-sm border border-gray-200"
                title="Refresh Captcha"
              >
                <RefreshCw size={18} />
              </button>
            </div>

            <input
              id="user_captcha"
              type="text"
              placeholder="Enter Captcha"
              className="w-full h-11 px-4 bg-white border border-gray-200 rounded text-gray-900 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              value={loginData.captcha}
              onChange={(e) => setLoginData({ ...loginData, captcha: e.target.value })}
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-sm pt-1">
            <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              Remember me
            </label>
            <button type="button" className="text-blue-600 hover:underline font-medium">
              Forgot Password?
            </button>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium rounded transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : 'Sign In'}
          </button>
        </form>

      </div>

      <div className="text-center space-y-3 mt-8">
        <p className="text-[10px] text-gray-600 uppercase tracking-wide">Powered by BSE © 2026</p>
        <p className="text-[10px] text-gray-500 leading-relaxed max-w-md mx-auto">
          You are trying to access the system restricted to authorized users. If you are not the owner of this login or have not been authorized to access this system, please log out immediately.
          <br />
          If any unauthorized attempt to use the system is detected, appropriate action will be taken against the person accessing the system.
        </p>
      </div>
    </div>
  );
};

const LoginOTP = ({ onVerify, onBack, loginData }) => {
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(54);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp) return;

    setLoading(true);
    await simulateApiCall(1000);
    setLoading(false);
    await Promise.resolve(onVerify?.());
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-white rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.05)] p-8 border border-gray-100 text-center animate-in fade-in zoom-in duration-300">

        <div className="mb-6 flex justify-center flex-col items-center gap-4">
          {/* Dynamic user profile link display */}
          <div className="text-xs font-semibold text-gray-800 uppercase">
            {(() => {
              const entityMap = { 'MEMBER': 'POP', 'AMC': 'RA' };
              const displayEntity = entityMap[loginData?.role] || loginData?.role || 'User';
              const displayCode = loginData?.memberCode || '';
              const displayUser = loginData?.username || '';
              return `${displayEntity} / ${displayCode} / ${displayUser}`;
            })()}
            <a href="#" className="text-blue-600 ml-1">🔗</a>
          </div>

          <img src={BSE_LOGO_URL} alt="BSE StAR MF" className="h-12 w-auto" />
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            placeholder="OTP"
            className="w-full h-11 px-4 bg-white border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-center tracking-widest"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            autoFocus
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-white border border-blue-400 text-blue-600 hover:bg-blue-50 font-medium rounded transition-colors text-sm"
          >
            {loading ? 'Verifying...' : 'Submit'}
          </button>

          <button
            type="button"
            disabled={timer > 0}
            className={`w-full h-11 rounded font-medium text-sm transition-colors ${timer > 0 ? 'bg-blue-400 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            onClick={() => setTimer(60)} // Resend logic mock
          >
            {timer > 0 ? `Resend OTP (${timer}s)` : 'Resend OTP'}
          </button>
        </form>

        <div className="mt-6 text-xs text-gray-500">
          You should receive otp on the registered email ID or registered mobile number.
        </div>

      </div>

      <div className="text-center space-y-3 mt-8">
        <p className="text-[10px] text-gray-500 uppercase tracking-wide">Powered by BSE © 2026</p>
        <p className="text-[10px] text-gray-400 leading-relaxed max-w-md mx-auto">
          You are trying to access the system restricted to authorized users.
        </p>
      </div>
    </div>
  );
};

// --- NEW SIDEBAR COMPONENT ---
const Sidebar = ({ setFlow, setAppId, currentFlow, setAuthStep, setCurrentStep, isOpen, onToggle, setContributionStep, setContributionNotice }) => {
  const menuItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: PieChart, action: () => { setAppId(null); setFlow('DASHBOARD'); } },
    { id: 'REGISTRATION', label: 'New PRAN Registration', icon: User, action: () => { setAppId(generateRefId()); setFlow('REGISTRATION'); setCurrentStep(0); } },
    { id: 'CONTRIBUTION', label: 'Make Contribution', icon: CreditCard, action: () => { setAppId(generateRefId()); setContributionNotice(''); setFlow('CONTRIBUTION'); setContributionStep(0); } },
    { id: 'REPORTS', label: 'Reports', icon: FileText, action: () => { setAppId(null); setFlow('REPORTS'); } },
  ];

  return (
    <div className={`h-[calc(100vh-64px)] hidden md:flex flex-col sticky top-16 self-start overflow-y-auto transition-all duration-300 transform ${isOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full'} ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} style={{ backgroundColor: BSE_COLORS.blue }}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onToggle} className="text-xs font-semibold uppercase tracking-wider text-white/70 hover:text-white" type="button">
            Menu
          </button>
          <button onClick={onToggle} className="p-1 rounded hover:bg-white/10 text-white" type="button" aria-label="Toggle menu">
            <Menu size={16} />
          </button>
        </div>
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={item.action}
              className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-colors
                ${(currentFlow === item.id)
                  ? 'bg-white text-gray-900'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-white/10">
        <button
          onClick={() => {
            setAuthStep('LOGIN');
            setFlow(null);
            setAppId(null);
            setCurrentStep(0);
            setContributionStep(0);
            setContributionNotice('');
          }}
          className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-white/80 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

// --- EXISTING APP COMPONENTS ---

const Dashboard = ({ onStartRegistration, onStartContribution }) => {
  const [activeTab, setActiveTab] = useState('REGISTRATION'); // 'REGISTRATION' | 'CONTRIBUTION'
  const [timeFilter, setTimeFilter] = useState('All'); // 'All' | 'Today' | 'Monthly' | 'Custom'
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [geoView, setGeoView] = useState('STATE'); // 'STATE' | 'CITY'

  // --- MOCK DATA GENERATOR ---
  const getDashboardData = (tab, filter) => {
    const isReg = tab === 'REGISTRATION';
    // Multiplier logic
    let multiplier = 1;
    if (filter === 'Today') multiplier = 0.05;
    if (filter === 'Custom') multiplier = 0.6; // Randomish for custom
    if (filter === 'All') multiplier = 1.2;

    // Stats Cards (6 items now)
    const stats = isReg ? [
      { label: 'Total PRANs Generated', value: Math.floor(12543 * multiplier).toLocaleString(), trend: '+12.5%', icon: UserCheck, color: 'blue' },
      { label: 'Pending Authorizations', value: Math.floor(45 * multiplier), trend: '-2.1%', icon: Clock, color: 'orange' },
      { label: 'Rejected Applications', value: Math.floor(128 * multiplier), trend: '+0.5%', icon: AlertCircle, color: 'red' },
      // New Card
      { label: 'CRA & Mobile Unvarified', value: Math.floor(12 * multiplier), trend: '-5.4%', icon: Smartphone, color: 'red' },
      { label: 'Opted for Tier I', value: Math.floor(8200 * multiplier).toLocaleString(), trend: '+8.2%', icon: CheckCircle, color: 'green' },
      { label: 'Opted for Tier I & II', value: Math.floor(4343 * multiplier).toLocaleString(), trend: '+4.3%', icon: UserCheck, color: 'purple' },
    ] : [
      { label: 'Total Contribution Vol', value: `₹ ${(2450.5 * multiplier).toFixed(2)} Cr`, trend: '+18.2%', icon: BarChart3, color: 'green' },
      { label: 'SIP Transactions', value: Math.floor(8500 * multiplier).toLocaleString(), trend: '+5.4%', icon: TrendingUp, color: 'blue' },
      { label: 'Lumpsum Transactions', value: Math.floor(3200 * multiplier).toLocaleString(), trend: '+12.1%', icon: Wallet, color: 'orange' },
      // New Cards
      { label: 'Failed Transactions', value: Math.floor(154 * multiplier), trend: '-1.2%', icon: AlertCircle, color: 'red' },
      { label: 'Tier I Vol', value: `₹ ${(1800.2 * multiplier).toFixed(2)} Cr`, trend: '+15.2%', icon: BarChart3, color: 'blue' },
      { label: 'Tier II Vol', value: `₹ ${(650.3 * multiplier).toFixed(2)} Cr`, trend: '+9.8%', icon: BarChart3, color: 'purple' },
    ];

    // Bar Chart Data
    const baseLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const barData = baseLabels.map((label, i) => ({
      label,
      value: isReg
        ? Math.floor((Math.random() * 40 + 60) * multiplier * (filter === 'Today' ? 20 : 1))
        : Math.floor((Math.random() * 30 + 70) * multiplier * (filter === 'Today' ? 20 : 1)),
    }));

    // Geo Data
    const geoData = geoView === 'STATE' ? [
      { name: 'Maharashtra', val: 35 },
      { name: 'Gujarat', val: 25 },
      { name: 'Karnataka', val: 15 },
      { name: 'Delhi', val: 12 },
      { name: 'Tamil Nadu', val: 8 },
    ] : [
      { name: 'Mumbai', val: 28 },
      { name: 'Pune', val: 12 },
      { name: 'Ahmedabad', val: 18 },
      { name: 'Bengaluru', val: 15 },
      { name: 'New Delhi', val: 14 },
    ];

    return { stats, barData, geoData };
  };

  const { stats, barData, geoData } = getDashboardData(activeTab, timeFilter);

  const handleFilterClick = (f) => {
    if (f === 'Custom') {
      setShowDatePicker(true);
    } else {
      setTimeFilter(f);
    }
  };

  const applyCustomDate = () => {
    setTimeFilter('Custom');
    setShowDatePicker(false);
  };

  // Helper for card colors
  const getIconBg = (color) => {
    switch (color) {
      case 'blue': return { bg: '#EFF6FF', text: '#2563EB' };
      case 'orange': return { bg: '#FFF7ED', text: '#EA580C' };
      case 'red': return { bg: '#FEF2F2', text: '#DC2626' };
      case 'green': return { bg: '#F0FDF4', text: '#16A34A' };
      case 'purple': return { bg: '#FAF5FF', text: '#9333EA' };
      default: return { bg: '#F3F4F6', text: '#4B5563' };
    }
  };

  return (
    <div className="bg-gray-50 min-h-full relative">
      {/* Date Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Select Date Range</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Start Date</label>
                <input type="date" className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">End Date</label>
                <input type="date" className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowDatePicker(false)} className="flex-1 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button onClick={applyCustomDate} className="flex-1 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-colors">Apply Filter</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">BSE STAR NPS Overview - {activeTab === 'REGISTRATION' ? 'Registration' : 'Contribution'}</p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            {/* Time Filters */}
            <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
              {['All', 'Today', 'Monthly', 'Custom'].map(f => (
                <button
                  key={f}
                  onClick={() => handleFilterClick(f)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${timeFilter === f ? 'bg-gray-800 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {f === 'Custom' ? <span className="flex items-center gap-1">Custom <Filter size={10} /></span> : f}
                </button>
              ))}
            </div>

            {/* Toggle Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('REGISTRATION')}
                className={`px-4 py-2 rounded-lg font-bold shadow-md transition-all flex items-center gap-2 ${activeTab === 'REGISTRATION' ? 'ring-2 ring-offset-2 ring-blue-600' : 'opacity-80 hover:opacity-100'}`}
                style={{ backgroundColor: BSE_COLORS.blue, color: 'white' }}
              >
                Registration
              </button>
              <button
                onClick={() => setActiveTab('CONTRIBUTION')}
                className={`px-4 py-2 rounded-lg font-bold shadow-md transition-all flex items-center gap-2 ${activeTab === 'CONTRIBUTION' ? 'ring-2 ring-offset-2 ring-orange-500' : 'opacity-80 hover:opacity-100'}`}
                style={{ backgroundColor: BSE_COLORS.orangeDark, color: 'white' }}
              >
                Contribution
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards - Grid of 3 cols */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {stats.map((item, idx) => {
            const style = getIconBg(item.color);
            return (
              <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: style.bg, color: style.text }}>
                  <item.icon size={22} />
                </div>
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold truncate">{item.label}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-gray-900">{item.value}</span>
                    <span className={`text-xs font-semibold ${item.trend.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>{item.trend}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-gray-800">
                {activeTab === 'REGISTRATION' ? 'Monthly Registration Trend' : 'Monthly Contribution Trend'}
              </h3>
              <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Last 6 Months</span>
            </div>

            {/* Chart Container with Y-Axis */}
            <div className="relative h-64 pl-8 mb-4">
              {/* Y-Axis Grid */}
              <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-300 pointer-events-none">
                {[100, 75, 50, 25, 0].map(val => (
                  <div key={val} className="relative w-full border-b border-gray-100 last:border-0 border-dashed">
                    <span className="absolute -left-8 -top-2 text-gray-400 font-medium w-6 text-right">{val}</span>
                  </div>
                ))}
              </div>

              {/* Bars */}
              <div className="absolute inset-0 flex items-end justify-between gap-4 pt-4 px-2">
                {barData.map((bar, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end">
                    {/* Tooltip/Value Label */}
                    <span className="text-xs font-bold text-gray-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6">
                      {bar.value}
                    </span>

                    <div className="w-full rounded-t-sm bg-gray-50 relative overflow-hidden flex items-end shadow-sm hover:shadow-md transition-all duration-300" style={{ height: `${Math.min(bar.value, 100)}%` }}>
                      <div
                        className={`w-full h-full transition-all duration-700 ease-out ${activeTab === 'REGISTRATION' ? 'bg-blue-600' : 'bg-orange-500'}`}
                        style={{ opacity: 0.8 + (idx / 10) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* X-Axis Labels */}
            <div className="flex items-center justify-between pl-8 px-2">
              {barData.map((bar, idx) => (
                <span key={idx} className="flex-1 text-center text-xs font-bold text-gray-400">{bar.label}</span>
              ))}
            </div>
          </div>

          {/* Pie Chart / Distribution */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">
                {activeTab === 'REGISTRATION' ? 'KYC Source Split' : 'Payment Mode Split'}
              </h3>
              <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Current</span>
            </div>
            <div className="flex items-center justify-center py-4">
              <div
                className="w-40 h-40 rounded-full transition-all duration-500"
                style={{
                  background: activeTab === 'REGISTRATION'
                    ? `conic-gradient(${BSE_COLORS.blue} 0 64%, ${BSE_COLORS.orangeDark} 64% 100%)`
                    : `conic-gradient(#10B981 0 55%, ${BSE_COLORS.blue} 55% 85%, ${BSE_COLORS.orangeDark} 85% 100%)`
                }}
              />
            </div>

            <div className="space-y-2 text-sm">
              {activeTab === 'REGISTRATION' ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: BSE_COLORS.blue }} />
                      CKYC
                    </span>
                    <span className="font-semibold text-gray-700">64%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: BSE_COLORS.orangeDark }} />
                      DigiLocker
                    </span>
                    <span className="font-semibold text-gray-700">36%</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500" />
                      Net Banking
                    </span>
                    <span className="font-semibold text-gray-700">55%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: BSE_COLORS.blue }} />
                      UPI
                    </span>
                    <span className="font-semibold text-gray-700">30%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: BSE_COLORS.orangeDark }} />
                      UPI QR
                    </span>
                    <span className="font-semibold text-gray-700">15%</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">India Distribution Snapshot</h3>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${geoView === 'STATE' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`} onClick={() => setGeoView('STATE')}>STATE</button>
              <button className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${geoView === 'CITY' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`} onClick={() => setGeoView('CITY')}>CITY</button>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <div className="space-y-4">
              {geoData.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                    <span>{item.name}</span>
                    <span>{item.val}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${item.val}%`, backgroundColor: activeTab === 'REGISTRATION' ? BSE_COLORS.blue : BSE_COLORS.orangeDark }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportsModule = () => {
  const reportOptions = [
    { id: 'CKYC', label: 'CKYC User List' },
    { id: 'DIGI', label: 'DigiLocker User List' },
    { id: 'CONTRIB', label: 'Contribution Data' },
    { id: 'PRAN', label: 'New PRAN Data' }
  ];

  const reportData = {
    CKYC: [
      { name: 'Rajesh Kumar', pan: 'ABCDE1234C', mobile: '9876543210', status: 'Verified', date: '02-Feb-2026' },
      { name: 'Anita Sharma', pan: 'PQRSX9876C', mobile: '9123456780', status: 'Verified', date: '02-Feb-2026' }
    ],
    DIGI: [
      { name: 'Vikram Singh', pan: 'LMNOP4567D', mobile: '9988776655', status: 'Verified', date: '01-Feb-2026' },
      { name: 'Neha Jain', pan: 'RSTUV1234D', mobile: '9810011223', status: 'Verified', date: '01-Feb-2026' }
    ],
    CONTRIB: [
      { pran: '110012341234', amount: '₹ 2,000', mode: 'UPI', status: 'SUCCESS', date: '02-Feb-2026' },
      { pran: '110045671234', amount: '₹ 5,500', mode: 'Net Banking', status: 'FAILED', date: '01-Feb-2026' }
    ],
    PRAN: [
      { appId: 'BSE-NPS-4321', pran: '110012341234', tier: 'Tier I', status: 'Created', date: '02-Feb-2026' },
      { appId: 'BSE-NPS-7788', pran: '110098761234', tier: 'Tier I & II', status: 'Created', date: '01-Feb-2026' }
    ]
  };

  const [selectedReport, setSelectedReport] = useState('CKYC');

  const handleExport = () => {
    const rows = reportData[selectedReport] || [];
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(','),
      ...rows.map(row => headers.map(h => `"${String(row[h]).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedReport}-report.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const rows = reportData[selectedReport] || [];
  const headers = rows.length ? Object.keys(rows[0]) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500">Exportable operational reports</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleExport} className="px-4 py-2 rounded-lg border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50">
            Export Excel
          </button>
          <button onClick={() => window.print()} className="px-4 py-2 rounded-lg border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50">
            Print
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-wrap gap-2">
          {reportOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedReport(opt.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${selectedReport === opt.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm table-auto">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-widest">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Report Name</th>
                <th className="px-4 py-3 text-left font-semibold">Report Type</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Customer Filter</th>
                <th className="px-4 py-3 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, idx) => (
                <tr key={idx} className="text-gray-700">
                  <td className="px-4 py-3">{row.name || row.appId || 'Report'}</td>
                  <td className="px-4 py-3">{selectedReport}</td>
                  <td className="px-4 py-3">{row.date}</td>
                  <td className="px-4 py-3">{row.pan || row.pran || row.mobile || '-'}</td>
                  <td className="px-4 py-3"><button className="text-blue-600 underline text-sm">Download</button></td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const PanMobileChecker = ({ onComplete }) => {
  const [panDone, setPanDone] = useState(false);
  const [mobileDone, setMobileDone] = useState(false);

  useEffect(() => {
    setPanDone(false);
    setMobileDone(false);

    const t1 = setTimeout(() => {
      setPanDone(true);
    }, 2000);

    const t2 = setTimeout(() => {
      setMobileDone(true);
      if (onComplete) onComplete();
    }, 2000 + 3000);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  return (
    <div className="text-center">
      <div className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-3">
          {!panDone ? <RefreshCw size={20} className="text-blue-600 animate-spin" /> : <CheckCircle size={20} className="text-green-600" />}
          <p className="text-sm text-gray-700">Checking PAN with associated existing CRAs</p>
        </div>
        <div className="flex items-center gap-3">
          {!mobileDone ? <RefreshCw size={20} className="text-blue-600 animate-spin" /> : <CheckCircle size={20} className="text-green-600" />}
          <p className="text-sm text-gray-700">Validating mobile number with associated existing CRAs</p>
        </div>
      </div>
    </div>
  );
};

const BasicDetails = ({ formData, handleInputChange, setCurrentStep, setFlow, showNotification, setFormData, setContributionStep, setContributionNotice, setAppId }) => {
  const [stage, setStage] = useState('FORM'); // FORM | OTP | LOADER | CKYC_OTP | DIGI_OTP
  const [activeFlow, setActiveFlow] = useState(null); // CKYC | DIGI
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(''));
  const [kycDigits, setKycDigits] = useState(Array(6).fill(''));
  const [existingPranModal, setExistingPranModal] = useState({ status: 'idle' });
  const [ckycFailed, setCkycFailed] = useState(false);

  // Mobile inline verification state
  const [mobileVerified, setMobileVerified] = useState(false);
  const [mobileDisabled, setMobileDisabled] = useState(false);
  const [showMobileOtp, setShowMobileOtp] = useState(false);
  const [mobileOtpDigits, setMobileOtpDigits] = useState(Array(6).fill(''));
  const [mobileOtpTimer, setMobileOtpTimer] = useState(180);
  const [mobileResendEnabled, setMobileResendEnabled] = useState(false);

  const resetGate = () => {
    setStage('FORM');
    setActiveFlow(null);
    setOtpDigits(Array(6).fill(''));
    setKycDigits(Array(6).fill(''));
    setCkycFailed(false);
  };

  const redirectToContribution = (message) => {
    setAppId?.(generateRefId());
    setContributionNotice(message || 'Based on PAN/Mobile rules, you are being redirected to the Contribution flow.');
    setFlow('CONTRIBUTION');
    setContributionStep(0);
  };

  const startFlow = async () => {
    if (!formData.panName || formData.pan.length !== 10 || formData.mobile.length !== 10 || !formData.email || !formData.dob) {
      showNotification('Please fill Name, PAN, DOB, Mobile and Email', 'error');
      return;
    }

    const decision = decidePanMobileFlow({ pan: formData.pan, mobile: formData.mobile });

    if (decision.flow === 'EXISTING_PRAN') {
      // show standard pan/mobile checker, then show existing PRAN modal when complete
      setExistingPranModal({ status: 'checking' });
      return;
    }

    if (decision.flow === 'CKYC') {
      setActiveFlow('CKYC');
      // show unified loader with two-step checks
      setStage('LOADER');
      return;
    }

    if (decision.flow === 'DIGILOCKER') {
      setActiveFlow('DIGI');
      // show unified loader with two-step checks
      setStage('LOADER');
      return;
    }

    redirectToContribution();
  };

  useEffect(() => {
    if (stage !== 'LOADER') return;
    let isActive = true;

    const run = async () => {
      const startedAt = Date.now();
      await Promise.all([
        mockApi.checkPanWithCra(),
        mockApi.validateMobileWithCra()
      ]);
      const elapsed = Date.now() - startedAt;
      const remaining = 6000 - elapsed;
      if (remaining > 0) {
        await simulateApiCall(remaining);
      }
      if (!isActive) return;

      if (activeFlow === 'CKYC') {
        setStage('CKYC_OTP');
        return;
      }

      setCkycFailed(true);
      setStage('DIGI_OTP');
    };

    run();
    return () => { isActive = false; };
  }, [stage, activeFlow]);

  const updateDigits = (setter, index, value) => {
    setter(prev => {
      const next = [...prev];
      next[index] = value.replace(/\D/g, '').slice(0, 1);
      return next;
    });
  };

  // --- Mobile OTP helpers ---
  const startMobileOtpFlow = () => {
    setShowMobileOtp(true);
    setMobileResendEnabled(false);
    setMobileOtpTimer(180);
    setMobileOtpDigits(Array(6).fill(''));
    mockApi.sendOtp();
  };

  useEffect(() => {
    if (!showMobileOtp) return undefined;
    const tick = setInterval(() => {
      setMobileOtpTimer(t => {
        if (t <= 1) {
          setMobileResendEnabled(true);
          clearInterval(tick);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(tick);
  }, [showMobileOtp]);

  const resendMobileOtp = async () => {
    if (!mobileResendEnabled) return;
    setMobileResendEnabled(false);
    setMobileOtpTimer(180);
    await mockApi.sendOtp();
  };

  const verifyMobileOtp = async () => {
    const otp = mobileOtpDigits.join('');
    if (otp.length !== 6) {
      showNotification('Please enter the 6-digit OTP', 'error');
      return;
    }
    await mockApi.verifyOtp();
    setMobileVerified(true);
    setMobileDisabled(true);
    setShowMobileOtp(false);
    showNotification('Mobile verified successfully', 'success');
  };

  const handlePrimaryOtpVerify = async () => {
    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      showNotification('Please enter the 6-digit OTP', 'error');
      return;
    }
    await mockApi.verifyOtp();
    setStage('LOADER');
  };

  const applyKycSuccess = (source) => {
    const nameParts = (formData.panName || '').trim().split(/\s+/);
    const firstName = nameParts[0] || 'RAJESH';
    const middleName = nameParts.length > 1 ? nameParts[1] : '';
    const lastName = nameParts.length > 2 ? nameParts.slice(2).join(' ') : '';

    setFormData(prev => ({
      ...prev,
      firstName,
      middleName,
      lastName,
      residentStatus: 'Resident Indian',
      birthCountry: 'India',
      birthCity: 'Mumbai',
      nationality: 'Indian',
      addressLine1: '123, Gandhi Nagar',
      addressLine2: 'Near Central Park',
      addressLine3: 'Worli',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India',
      permAddressLine1: '123, Gandhi Nagar',
      permAddressLine2: 'Near Central Park',
      permAddressLine3: 'Worli',
      permCity: 'Mumbai',
      permState: 'Maharashtra',
      permPincode: '400001',
      permCountry: 'India',
      kycVerified: true,
      kycSource: source
    }));
    resetGate();
    setCurrentStep(1);
  };

  const handleKycOtpVerify = () => {
    const otp = kycDigits.join('');
    if (otp.length !== 6) {
      showNotification('Please enter the 6-digit OTP', 'error');
      return;
    }
    if (activeFlow === 'DIGI' && otp === '12345') {
      showNotification('DigiLocker OTP failed. Please retry from Basic Details.', 'error');
      resetGate();
      return;
    }
    applyKycSuccess(activeFlow === 'DIGI' ? 'DIGILOCKER' : 'CKYC');
  };

  const handleExistingCreate = () => {
    const mobileLast = String(formData.mobile || '').slice(-1);
    setExistingPranModal({ status: 'idle' });
    if (mobileLast === '1') {
      setActiveFlow('CKYC');
      setStage('OTP');
      return;
    }
    if (mobileLast === '2') {
      setActiveFlow('DIGI');
      setStage('OTP');
      return;
    }
    redirectToContribution('Existing PRAN detected. Redirecting to Contribution flow.');
  };

  const handleExistingContribute = () => {
    setExistingPranModal({ status: 'idle' });
    redirectToContribution('Existing PRAN detected. Redirecting to Contribution flow.');
  };

  if (stage === 'OTP') {
    return (
      <div className="max-w-md mx-auto space-y-6 text-center">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">OTP Verification</h2>
          <p className="text-gray-500 mb-6">Enter the OTP sent to your registered mobile number.</p>

          <div className="my-6 flex justify-center gap-2">
            {otpDigits.map((digit, i) => (
              <input
                key={i}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => updateDigits(setOtpDigits, i, e.target.value)}
                className="w-10 h-10 text-center border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            ))}
          </div>

          <button onClick={handlePrimaryOtpVerify} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
            Verify OTP
          </button>
        </div>

        {showMobileOtp && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[125] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Mobile Verification</h3>
              <p className="text-sm text-gray-500 mb-4">Enter the 6-digit OTP sent to {formData.mobile}</p>
              <div className="my-4 flex justify-center gap-2">
                {mobileOtpDigits.map((d, i) => (
                  <input key={i} value={d} onChange={(e) => updateDigits(setMobileOtpDigits, i, e.target.value)} maxLength={1} className="w-10 h-10 text-center border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                ))}
              </div>
              <div className="flex items-center justify-center gap-3 mb-4">
                <button onClick={verifyMobileOtp} className="px-4 py-2 bg-blue-600 text-white rounded-md">Verify OTP</button>
                <button onClick={() => setShowMobileOtp(false)} className="px-4 py-2 bg-gray-100 rounded-md">Cancel</button>
              </div>
              <div className="text-xs text-gray-500">
                {mobileOtpTimer > 0 ? (
                  <span>Resend available in {Math.floor(mobileOtpTimer / 60)}:{String(mobileOtpTimer % 60).padStart(2, '0')}</span>
                ) : (
                  <button onClick={resendMobileOtp} className="text-blue-600 underline text-xs">Resend OTP</button>
                )}
              </div>
            </div>
          </div>
        )}

        <button onClick={resetGate} className="text-gray-600 flex items-center gap-2 mx-auto px-4 py-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft size={20} /> Back
        </button>
      </div>
    );
  }



  return (
    <div className="max-w-2xl mx-auto space-y-6 relative">
      {existingPranModal.status !== 'idle' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[120] p-4">
          {existingPranModal.status === 'checking' ? (
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300 text-center">
              <PanMobileChecker onComplete={() => setExistingPranModal({ status: 'existing' })} />
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-3 text-blue-900 mb-4">
                <AlertCircle size={32} />
                <h3 className="text-xl font-bold">Existing PRAN Found</h3>
              </div>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                A PRAN is already associated with this PAN. How would you like to proceed?
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleExistingCreate}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                  Create New PRAN Anyway
                </button>
                <button
                  onClick={handleExistingContribute}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                >
                  Contribute to Existing PRAN
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {stage === 'LOADER' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300 text-center">
            <PanMobileChecker onComplete={() => {
              if (activeFlow === 'CKYC') {
                setStage('CKYC_OTP');
                return;
              }
              if (activeFlow === 'DIGI') {
                setCkycFailed(true);
                setStage('DIGI_OTP');
                return;
              }
              // default fallback: if decision did not set a flow, redirect to contribution
              redirectToContribution();
            }} />
          </div>
        </div>
      )}

      <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Basic Details</h3>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Name as per PAN <RequiredMark /></label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg p-3 uppercase focus:ring-2 focus:ring-blue-500"
            placeholder="As mentioned on your PAN"
            value={formData.panName}
            onChange={(e) => handleInputChange('panName', e.target.value.toUpperCase())}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">PAN <RequiredMark /></label>
          <input
            type="text"
            maxLength={10}
            className="w-full border border-gray-300 rounded-lg p-3 uppercase focus:ring-2 focus:ring-blue-500"
            placeholder="ABCDE1234F"
            value={formData.pan}
            onChange={(e) => handleInputChange('pan', e.target.value.toUpperCase())}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth <RequiredMark /></label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            value={formData.dob}
            onChange={(e) => handleInputChange('dob', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number <RequiredMark /></label>
          <div className="relative">
            <input
              type="tel"
              maxLength={10}
              disabled={mobileDisabled}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
              placeholder="9876543210"
              value={formData.mobile}
              onChange={(e) => handleInputChange('mobile', e.target.value.replace(/\D/g, ''))}
            />
            {mobileVerified ? (
              <span className="absolute right-3 top-3 flex items-center gap-1 text-green-600 text-xs font-semibold">
                <CheckCircle size={14} /> Verified
              </span>
            ) : (
              String(formData.mobile || '').length === 10 && (
                <button type="button" onClick={startMobileOtpFlow} className="absolute right-3 top-2 bg-blue-600 text-white text-xs px-3 py-1 rounded-md">Verify</button>
              )
            )}
          </div>

          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input type="radio" checked readOnly className="w-4 h-4 text-blue-600" />
              <label className="text-sm text-gray-700 whitespace-nowrap">Resident Individual</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked readOnly className="w-4 h-4 text-blue-600" />
              <label className="text-sm text-gray-700 whitespace-nowrap">Provided details are correct and I accept the terms and condition to process ahead</label>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email ID <RequiredMark /></label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={() => setFlow('DASHBOARD')} className="text-gray-600 flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft size={20} /> Back
        </button>
        <button
          onClick={startFlow}
          disabled={!mobileVerified}
          className={`px-8 py-3 rounded-lg font-medium flex items-center gap-2 ${mobileVerified ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        >
          Next <ChevronRight size={20} />
        </button>
      </div>

      {showMobileOtp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[125] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Mobile Verification</h3>
            <p className="text-sm text-gray-500 mb-4">Enter the 6-digit OTP sent to {formData.mobile}</p>
            <div className="my-4 flex justify-center gap-2">
              {mobileOtpDigits.map((d, i) => (
                <input key={i} value={d} onChange={(e) => updateDigits(setMobileOtpDigits, i, e.target.value)} maxLength={1} className="w-10 h-10 text-center border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              ))}
            </div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <button onClick={verifyMobileOtp} className="px-4 py-2 bg-blue-600 text-white rounded-md">Verify OTP</button>
              <button onClick={() => setShowMobileOtp(false)} className="px-4 py-2 bg-gray-100 rounded-md">Cancel</button>
            </div>
            <div className="text-xs text-gray-500">
              {mobileOtpTimer > 0 ? (
                <span>Resend available in {Math.floor(mobileOtpTimer / 60)}:{String(mobileOtpTimer % 60).padStart(2, '0')}</span>
              ) : (
                <button onClick={resendMobileOtp} className="text-blue-600 underline text-xs">Resend OTP</button>
              )}
            </div>
          </div>
        </div>
      )}

      {(stage === 'CKYC_OTP' || stage === 'DIGI_OTP') && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[130] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center animate-in fade-in zoom-in duration-300">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {stage === 'DIGI_OTP' ? 'DigiLocker OTP Verification' : 'CKYC OTP Verification'}
            </h2>
            <p className="text-gray-500 mb-4">
              {stage === 'DIGI_OTP' ? 'Enter the OTP sent to your Aadhaar-linked mobile number.' : 'Enter the OTP sent for CKYC verification.'}
            </p>
            {ckycFailed && stage === 'DIGI_OTP' && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm p-3 rounded-lg mb-4">
                <p className="font-semibold">CKYC could not be completed for provided details.</p>
                <p className="mt-1">You will be redirected to DigiLocker to proceed.</p>
                <div className="mt-3">
                  <button onClick={() => { applyKycSuccess('DIGILOCKER'); setCurrentStep(1); }} className="px-4 py-2 bg-blue-600 text-white rounded-md">Proceed to DigiLocker</button>
                </div>
              </div>
            )}

            <div className="my-6 flex justify-center gap-2">
              {kycDigits.map((digit, i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => updateDigits(setKycDigits, i, e.target.value)}
                  className="w-10 h-10 text-center border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              ))}
            </div>

            <button onClick={handleKycOtpVerify} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
              Submit OTP
            </button>
            {stage === 'DIGI_OTP' && (
              <p className="text-[10px] text-gray-400 mt-2">Dummy OTP 12345 will fail and return to Basic Details.</p>
            )}
            <button onClick={resetGate} className="text-gray-600 flex items-center gap-2 mx-auto px-4 py-2 hover:bg-gray-100 rounded-lg mt-4 justify-center">
              <ChevronLeft size={20} /> Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const PersonalAndAddress = ({ formData, handleInputChange, setCurrentStep }) => {
  const [isSameAddress, setIsSameAddress] = useState(true);

  useEffect(() => {
    if (formData.addressLine1 || formData.city || formData.state || formData.pincode) return;
    const pins = Object.keys(PINCODE_DIRECTORY);
    if (!pins.length) return;
    const randomPin = pins[Math.floor(Math.random() * pins.length)];
    const info = PINCODE_DIRECTORY[randomPin];
    if (!info) return;
    const houseNo = Math.floor(10 + Math.random() * 90);
    handleInputChange('pincode', randomPin);
    handleInputChange('city', info.city);
    handleInputChange('state', info.state);
    handleInputChange('country', info.country || 'India');
    handleInputChange('addressLine1', `${houseNo}, ${info.city} Central Park`);
  }, []);

  useEffect(() => {
    if (isSameAddress) {
      handleInputChange('addressLine1', formData.permAddressLine1 || '');
      handleInputChange('addressLine2', formData.permAddressLine2 || '');
      handleInputChange('addressLine3', formData.permAddressLine3 || '');
      handleInputChange('city', formData.permCity || '');
      handleInputChange('state', formData.permState || '');
      handleInputChange('pincode', formData.permPincode || '');
      handleInputChange('country', formData.permCountry || '');
    }
  }, [isSameAddress, formData.permAddressLine1, formData.permAddressLine2, formData.permAddressLine3, formData.permCity, formData.permState, formData.permPincode, formData.permCountry]);

  const applyPincode = (pin, target, syncPermanent = isSameAddress) => {
    const info = lookupPincode(pin);
    if (!info.valid) return;
    const houseNo = Math.floor(10 + Math.random() * 90);

    const applyCityState = (cityField, stateField) => {
      if (info.found) {
        handleInputChange(cityField, info.city);
        handleInputChange(stateField, info.state);
      }
    };

    const applyAddressLine = (lineField, currentValue) => {
      const autoFilled = currentValue && currentValue.includes('Central Park');
      if (info.found && (!currentValue || autoFilled)) {
        handleInputChange(lineField, `${houseNo}, ${info.city} Central Park`);
      }
    };

    if (target === 'resident') {
      applyCityState('city', 'state');
      if (info.country) handleInputChange('country', info.country);
      applyAddressLine('addressLine1', formData.addressLine1);
      if (syncPermanent) {
        applyCityState('permCity', 'permState');
        if (info.country) handleInputChange('permCountry', info.country);
        applyAddressLine('permAddressLine1', formData.permAddressLine1);
      }
    } else {
      applyCityState('permCity', 'permState');
      if (info.country) handleInputChange('permCountry', info.country);
      applyAddressLine('permAddressLine1', formData.permAddressLine1);
    }
  };

  const toggleAddressSync = (checked) => {
    setIsSameAddress(checked);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <User size={20} className="text-blue-600" /> Basic Details
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700">Name <RequiredMark /></label>
              {formData.kycSource === 'DIGILOCKER' && (
                <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                  <ShieldCheck size={12} /> Verified via DigiLocker
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Title</label>
                <select value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} className="border border-gray-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>Mr</option>
                  <option>Mrs</option>
                  <option>Smt</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">First Name</label>
                <input disabled={formData.kycVerified} value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} className={`border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none ${formData.kycVerified ? 'bg-gray-100' : ''}`} placeholder="First Name" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Middle Name</label>
                <input disabled={formData.kycVerified} value={formData.middleName} onChange={(e) => handleInputChange('middleName', e.target.value)} className={`border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none ${formData.kycVerified ? 'bg-gray-100' : ''}`} placeholder="Middle Name" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Last Name</label>
                <input disabled={formData.kycVerified} value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} className={`border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none ${formData.kycVerified ? 'bg-gray-100' : ''}`} placeholder="Last Name" />
              </div>
            </div>
          </div>
          <div><label className="text-sm font-medium text-gray-700 mb-1 block">PAN  <RequiredMark /></label><input disabled value={formData.pan} className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 text-gray-500" /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1 block">Date of Birth <RequiredMark /></label><input disabled value={formData.dob} className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 text-gray-500" /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1 block">Mobile Number <RequiredMark /></label><input disabled value={formData.mobile} className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 text-gray-500" /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1 block">Email ID <RequiredMark /></label><input disabled value={formData.email} className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 text-gray-500" /></div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Resident Status <RequiredMark /></label>
            <select disabled={formData.kycVerified} className={`w-full border border-gray-300 rounded-lg p-3 ${formData.kycVerified ? 'bg-gray-100 text-gray-500' : ''}`} value={formData.residentStatus} onChange={e => handleInputChange('residentStatus', e.target.value)}>
              <option value="Resident Indian">Resident Indian</option>
              <option value="Not a Resident Indian">Not a Resident Indian</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Gender <RequiredMark /></label>
            <select className="w-full border border-gray-300 rounded-lg p-3" value={formData.gender} onChange={e => handleInputChange('gender', e.target.value)}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Others">Others</option>
            </select>
          </div>
          <div><label className="text-sm font-medium text-gray-700 mb-1 block">Birth Country <RequiredMark /></label><input disabled={formData.kycVerified} className={`w-full border border-gray-300 rounded-lg p-3 ${formData.kycVerified ? 'bg-gray-100 text-gray-500' : ''}`} placeholder="Country of Birth" value={formData.birthCountry} onChange={e => handleInputChange('birthCountry', e.target.value)} /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1 block">Birth City <RequiredMark /></label><input disabled={formData.kycVerified} className={`w-full border border-gray-300 rounded-lg p-3 ${formData.kycVerified ? 'bg-gray-100 text-gray-500' : ''}`} placeholder="City of Birth" value={formData.birthCity} onChange={e => handleInputChange('birthCity', e.target.value)} /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1 block">Nationality <RequiredMark /></label><input disabled={formData.kycVerified} className={`w-full border border-gray-300 rounded-lg p-3 ${formData.kycVerified ? 'bg-gray-100 text-gray-500' : ''}`} placeholder="Nationality" value={formData.nationality} onChange={e => handleInputChange('nationality', e.target.value)} /></div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Marital Status <RequiredMark /></label>
            <select className="w-full border border-gray-300 rounded-lg p-3" value={formData.maritalStatus} onChange={e => handleInputChange('maritalStatus', e.target.value)}>
              <option value="">Select</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Father's Name <RequiredMark /></label>
            <div className="grid grid-cols-4 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Title</label>
                <select value={formData.fatherTitle} onChange={(e) => handleInputChange('fatherTitle', e.target.value)} className="border border-gray-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>Mr</option>
                  <option>Shri</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">First Name</label>
                <input value={formData.fatherFirstName} onChange={(e) => handleInputChange('fatherFirstName', e.target.value)} className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="First Name" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Middle Name</label>
                <input value={formData.fatherMiddleName} onChange={(e) => handleInputChange('fatherMiddleName', e.target.value)} className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Middle Name" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Last Name</label>
                <input value={formData.fatherLastName} onChange={(e) => handleInputChange('fatherLastName', e.target.value)} className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Last Name" />
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Mother's Name <RequiredMark /></label>
            <div className="grid grid-cols-4 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Title</label>
                <select value={formData.motherTitle} onChange={(e) => handleInputChange('motherTitle', e.target.value)} className="border border-gray-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>Mrs</option>
                  <option>Smt</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">First Name</label>
                <input value={formData.motherFirstName} onChange={(e) => handleInputChange('motherFirstName', e.target.value)} className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="First Name" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Middle Name</label>
                <input value={formData.motherMiddleName} onChange={(e) => handleInputChange('motherMiddleName', e.target.value)} className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Middle Name" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Last Name</label>
                <input value={formData.motherLastName} onChange={(e) => handleInputChange('motherLastName', e.target.value)} className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Last Name" />
              </div>
            </div>
          </div>
        </div>
      </div>



      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <MapPin size={20} className="text-blue-600" /> Address Details (Resident)
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Address Line 1 <RequiredMark /></label>
            <input disabled={isSameAddress} value={formData.addressLine1} onChange={e => {
              handleInputChange('addressLine1', e.target.value);
            }} className={`w-full border border-gray-300 rounded-lg p-3 ${isSameAddress ? 'bg-gray-100 text-gray-500' : ''}`} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Address Line 2</label>
            <input disabled={isSameAddress} value={formData.addressLine2} onChange={e => {
              handleInputChange('addressLine2', e.target.value);
            }} className={`w-full border border-gray-300 rounded-lg p-3 ${isSameAddress ? 'bg-gray-100 text-gray-500' : ''}`} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Address Line 3</label>
            <input disabled={isSameAddress} value={formData.addressLine3} onChange={e => {
              handleInputChange('addressLine3', e.target.value);
            }} className={`w-full border border-gray-300 rounded-lg p-3 ${isSameAddress ? 'bg-gray-100 text-gray-500' : ''}`} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">City <RequiredMark /></label>
            <input disabled={isSameAddress} value={formData.city} onChange={e => {
              handleInputChange('city', e.target.value);
            }} className={`w-full border border-gray-300 rounded-lg p-3 ${isSameAddress ? 'bg-gray-100 text-gray-500' : ''}`} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">State <RequiredMark /></label>
            <input disabled={isSameAddress} value={formData.state} onChange={e => {
              handleInputChange('state', e.target.value);
            }} className={`w-full border border-gray-300 rounded-lg p-3 ${isSameAddress ? 'bg-gray-100 text-gray-500' : ''}`} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Pin <RequiredMark /></label>
            <input disabled={isSameAddress} value={formData.pincode} onChange={e => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 6);
              handleInputChange('pincode', val);
              applyPincode(val, 'resident', isSameAddress);
            }} className={`w-full border border-gray-300 rounded-lg p-3 ${isSameAddress ? 'bg-gray-100 text-gray-500' : ''}`} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Country <RequiredMark /></label>
            <input disabled={isSameAddress} value={formData.country} onChange={e => {
              handleInputChange('country', e.target.value);
            }} className={`w-full border border-gray-300 rounded-lg p-3 ${isSameAddress ? 'bg-gray-100 text-gray-500' : ''}`} />
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-3">
          <input
            type="checkbox"
            id="sameAddress"
            checked={isSameAddress}
            onChange={(e) => toggleAddressSync(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded"
          />
          <label htmlFor="sameAddress" className="text-sm font-medium text-gray-700">Residential Address same as Permanent Address</label>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <MapPin size={20} className="text-blue-600" /> Address Details (Permanent)
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Address Line 1 <RequiredMark /></label>
            <input disabled={isSameAddress || formData.kycVerified} value={formData.permAddressLine1} onChange={e => handleInputChange('permAddressLine1', e.target.value)} className={`w-full border border-gray-300 rounded-lg p-3 ${(isSameAddress || formData.kycVerified) ? 'bg-gray-100' : ''}`} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Address Line 2</label>
            <input disabled={isSameAddress || formData.kycVerified} value={formData.permAddressLine2} onChange={e => handleInputChange('permAddressLine2', e.target.value)} className={`w-full border border-gray-300 rounded-lg p-3 ${(isSameAddress || formData.kycVerified) ? 'bg-gray-100' : ''}`} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Address Line 3</label>
            <input disabled={isSameAddress || formData.kycVerified} value={formData.permAddressLine3} onChange={e => handleInputChange('permAddressLine3', e.target.value)} className={`w-full border border-gray-300 rounded-lg p-3 ${(isSameAddress || formData.kycVerified) ? 'bg-gray-100' : ''}`} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">City <RequiredMark /></label>
            <input disabled={isSameAddress || formData.kycVerified} value={formData.permCity} onChange={e => handleInputChange('permCity', e.target.value)} className={`w-full border border-gray-300 rounded-lg p-3 ${(isSameAddress || formData.kycVerified) ? 'bg-gray-100' : ''}`} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">State <RequiredMark /></label>
            <input disabled={isSameAddress || formData.kycVerified} value={formData.permState} onChange={e => handleInputChange('permState', e.target.value)} className={`w-full border border-gray-300 rounded-lg p-3 ${(isSameAddress || formData.kycVerified) ? 'bg-gray-100' : ''}`} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Pin <RequiredMark /></label>
            <input disabled={isSameAddress || formData.kycVerified} value={formData.permPincode} onChange={e => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 6);
              handleInputChange('permPincode', val);
              applyPincode(val, 'permanent', false);
            }} className={`w-full border border-gray-300 rounded-lg p-3 ${(isSameAddress || formData.kycVerified) ? 'bg-gray-100' : ''}`} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Country <RequiredMark /></label>
            <input disabled={isSameAddress || formData.kycVerified} value={formData.permCountry} onChange={e => handleInputChange('permCountry', e.target.value)} className={`w-full border border-gray-300 rounded-lg p-3 ${(isSameAddress || formData.kycVerified) ? 'bg-gray-100' : ''}`} />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Briefcase size={20} className="text-blue-600" /> Additional Details
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Occupation Details <RequiredMark /></label>
            <select className="w-full border border-gray-300 rounded-lg p-3" value={formData.occupation} onChange={e => handleInputChange('occupation', e.target.value)}>
              <option value="">Select Occupation</option>
              <option value="Salaried">Salaried</option>
              <option value="Self Employed">Self Employed</option>
              <option value="Professional">Professional</option>
              <option value="Student">Student</option>
              <option value="Housewife">Housewife</option>
              <option value="Others">Others</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Income Slab / Range <RequiredMark /></label>
            <select className="w-full border border-gray-300 rounded-lg p-3" value={formData.incomeRange} onChange={e => handleInputChange('incomeRange', e.target.value)}>
              <option value="">Select Range</option>
              <option value="Upto 5 Lakhs">Upto 5 Lakhs</option>
              <option value="5-10 Lakhs">5-10 Lakhs</option>
              <option value="10-25 Lakhs">10-25 Lakhs</option>
              <option value="Above 25 Lakhs">Above 25 Lakhs</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Politically Exposed Person (PEP) <RequiredMark /></label>
            <select className="w-full border border-gray-300 rounded-lg p-3" value={formData.pepStatus} onChange={e => handleInputChange('pepStatus', e.target.value)}>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Related to any Politically Exposed Person <RequiredMark /></label>
            <select className="w-full border border-gray-300 rounded-lg p-3" value={formData.pepRelated} onChange={e => handleInputChange('pepRelated', e.target.value)}>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={() => setCurrentStep(0)} className="text-gray-600 flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft size={20} /> Back
        </button>
        <button onClick={() => setCurrentStep(2)} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700">Next</button>
      </div>
    </div>
  );
};

const FatcaDeclaration = ({ formData, handleInputChange, setCurrentStep, showNotification }) => {
  // Sync FATCA fields with Permanent Address & Defaults
  useEffect(() => {
    // 1. Force FATCA defaults
    if (formData.isUSPerson !== 'No') handleInputChange('isUSPerson', 'No');
    if (formData.taxResidency !== 'India') handleInputChange('taxResidency', 'India');

    // 2. Sync Address from Permanent Address
    // We only need to ensure the underlying state for validation is present.
    // The UI will display the permanent address fields directly to be 100% sure it matches.
    // However, for data consistency in the backend/final submission, we should copy the values.

    // Construct the single fatcaAddressLine from the 3 permanent lines for storage
    const combinedAddress = [
      formData.permAddressLine1,
      formData.permAddressLine2,
      formData.permAddressLine3
    ].filter(Boolean).join(', ');

    if (formData.fatcaAddressLine !== combinedAddress) handleInputChange('fatcaAddressLine', combinedAddress);
    if (formData.fatcaCity !== formData.permCity) handleInputChange('fatcaCity', formData.permCity);
    if (formData.fatcaState !== formData.permState) handleInputChange('fatcaState', formData.permState);
    if (formData.fatcaPin !== formData.permPincode) handleInputChange('fatcaPin', formData.permPincode);
    if (formData.fatcaCountry !== formData.permCountry) handleInputChange('fatcaCountry', formData.permCountry);

  }, [
    formData.permAddressLine1, formData.permAddressLine2, formData.permAddressLine3,
    formData.permCity, formData.permState, formData.permPincode, formData.permCountry,
    formData.isUSPerson, formData.taxResidency,
    formData.fatcaAddressLine, formData.fatcaCity, formData.fatcaState, formData.fatcaPin, formData.fatcaCountry
  ]);

  const requiresTin = formData.residentStatus !== 'Resident Indian' || formData.taxResidency !== 'India';

  const handleProceed = () => {
    // Validation is against the SYNCED values
    if (!formData.fatcaAddressLine || !formData.fatcaCity || !formData.fatcaState || !formData.fatcaPin || !formData.fatcaCountry) {
      showNotification("FATCA address details are missing (check Permanent Address)", "error");
      return;
    }
    if (formData.fatcaPin.length !== 6) {
      showNotification("Invalid FATCA pin code (check Permanent Address)", "error");
      return;
    }
    // US Person / Tax Residency are fixed to No/India, so requiresTin should be false for standard flow
    if (requiresTin && !formData.tin) {
      showNotification("Please enter TIN for NRI tax residency", "error");
      return;
    }
    if (formData.fatcaDeclared) {
      setCurrentStep(3);
    } else {
      showNotification("Please accept the FATCA declaration", "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Building size={20} className="text-blue-600" /> FATCA / CRS Declaration
        </h3>

        {/* SECTION 2: FATCA / CRS Declaration - FROZEN FIELDS */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">US Person (Yes/No) <RequiredMark /></label>
            <select
              disabled
              className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 text-gray-500 cursor-not-allowed"
              value="No" // Hardcoded display
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
            <p className="text-[10px] text-gray-400 mt-1">Default: No (Not editable)</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Country of Tax Residency <RequiredMark /></label>
            <select
              disabled
              className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 text-gray-500 cursor-not-allowed"
              value="India" // Hardcoded display
            >
              <option value="India">India</option>
              <option value="Other">Other</option>
            </select>
            <p className="text-[10px] text-gray-400 mt-1">Default: India (Not editable)</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Additional Category</label>
            <select className="w-full border border-gray-300 rounded-lg p-3" value={formData.additionalCategory} onChange={e => handleInputChange('additionalCategory', e.target.value)}>
              <option value="">Select Category</option>
              <option value="Individual">Individual</option>
              <option value="Business">Business</option>
              <option value="Trust">Trust</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">PAN </label>
            <input disabled value={formData.pan} className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 text-gray-500 uppercase" />
          </div>

          {requiresTin && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">TIN <RequiredMark /></label>
              <input
                type="text"
                maxLength={20}
                value={formData.tin}
                onChange={(e) => handleInputChange('tin', e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3"
                placeholder="Enter Tax Identification Number"
              />
            </div>
          )}
        </div>

        {/* SECTION 1: FATCA Address Details - AUTO-FETCHED & FROZEN */}
        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-blue-600" /> FATCA Address Details <RequiredMark />
          </h4>
          <p className="text-xs text-gray-500 mb-4 bg-yellow-50 p-2 rounded border border-yellow-100">
            Address details are auto-fetched from your Permanent Address and cannot be modified here.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Address Line 1</label>
              <input
                disabled
                className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 text-gray-500 cursor-not-allowed"
                value={formData.permAddressLine1 || ''}
                readOnly
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Address Line 2</label>
              <input
                disabled
                className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 text-gray-500 cursor-not-allowed"
                value={formData.permAddressLine2 || ''}
                readOnly
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Address Line 3</label>
              <input
                disabled
                className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 text-gray-500 cursor-not-allowed"
                value={formData.permAddressLine3 || ''}
                readOnly
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">City</label>
              <input
                disabled
                className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 text-gray-500 cursor-not-allowed"
                value={formData.permCity || ''}
                readOnly
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">State</label>
              <input
                disabled
                className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 text-gray-500 cursor-not-allowed"
                value={formData.permState || ''}
                readOnly
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Pin Code</label>
              <input
                disabled
                className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 text-gray-500 cursor-not-allowed"
                value={formData.permPincode || ''}
                readOnly
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Country</label>
              <input
                disabled
                className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 text-gray-500 cursor-not-allowed"
                value={formData.permCountry || 'India'}
                readOnly
              />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 flex gap-4 items-start">
          <input type="checkbox" className="mt-1.5 w-5 h-5 text-blue-600 rounded cursor-pointer" checked={formData.fatcaDeclared} onChange={(e) => handleInputChange('fatcaDeclared', e.target.checked)} />
          <div className="text-xs text-gray-700 leading-relaxed space-y-2">
            <p className="font-bold text-blue-900 uppercase tracking-tight">FATCA / CRS / Self-Declaration <RequiredMark /></p>
            <p>I hereby declare that the information provided in this form is true, correct, and complete. I confirm that I am a tax resident of the country/countries mentioned above and am not a tax resident of any other country. </p>
            <p>I agree to inform BSE STAR NPS immediately if there is any change in my tax residency status or the information provided above.</p>
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-6">
        <button onClick={() => setCurrentStep(1)} className="text-gray-600 flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft size={20} /> Back
        </button>
        <button
          onClick={handleProceed}
          className={`bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-colors ${!formData.fatcaDeclared ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

const AccountTypeStep = ({ formData, handleInputChange, setCurrentStep }) => {
  const [riskFilter, setRiskFilter] = useState('All');
  const filteredPFMs = riskFilter === 'All' ? PFM_LIST : PFM_LIST.filter(p => p.risk.includes(riskFilter));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">Account Type <RequiredMark /></h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div
            onClick={() => handleInputChange('selectedTier', 'Tier I')}
            className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${formData.selectedTier === 'Tier I' ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:border-blue-200'}`}
          >
            <div className="flex justify-between mb-4">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Mandatory</span>
              {formData.selectedTier === 'Tier I' && <CheckCircle className="text-blue-600" />}
            </div>
            <h4 className="text-xl font-bold text-gray-900">TIER I Account</h4>
            <p className="text-sm text-gray-600 mt-2">Primary retirement account with tax benefits. Withdrawal restrictions apply.</p>
          </div>

          <div
            onClick={() => handleInputChange('selectedTier', 'Tier II')}
            className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${formData.selectedTier === 'Tier II' ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:border-blue-200'}`}
          >
            <div className="flex justify-between mb-4">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Optional</span>
              {formData.selectedTier === 'Tier II' && <CheckCircle className="text-blue-600" />}
            </div>
            <h4 className="text-xl font-bold text-gray-900">TIER I & II Account</h4>
            <p className="text-sm text-gray-600 mt-2">Voluntary saving account. Freedom to withdraw anytime. No TAX benefitsThis includes TIER I and TIER II</p>
          </div>
        </div>
      </div>

      {formData.selectedTier && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Select Pension Fund Manager (PFM) <RequiredMark /></h3>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {['All', 'Growth', 'Moderate', 'Conservative'].map(f => (
                <button key={f} onClick={() => setRiskFilter(f)} className={`px-3 py-1 rounded-md text-[10px] font-medium transition-all ${riskFilter === f ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>{f}</button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPFMs.map(pfm => {
              const name = pfm.name.toUpperCase();

              // Default (Gray/Blue)
              let colors = {
                bg: 'bg-white hover:bg-gray-50',
                border: 'border-gray-200 hover:border-blue-300',
                text: 'text-gray-900',
                logo: 'text-gray-600',
                risk: 'text-gray-600',
                active: {
                  bg: 'bg-blue-50',
                  border: 'border-blue-600',
                  text: 'text-blue-900',
                  logo: 'text-blue-700',
                  risk: 'text-blue-700'
                }
              };

              if (name.includes('SBI')) {
                colors = {
                  bg: 'bg-blue-50/50 hover:bg-blue-50',
                  border: 'border-blue-100 hover:border-blue-300',
                  text: 'text-blue-900',
                  logo: 'text-blue-700',
                  risk: 'text-blue-600',
                  active: {
                    bg: 'bg-blue-100',
                    border: 'border-blue-600',
                    text: 'text-blue-950',
                    logo: 'text-blue-800',
                    risk: 'text-blue-800'
                  }
                };
              } else if (name.includes('HDFC')) {
                colors = {
                  bg: 'bg-red-50/50 hover:bg-red-50',
                  border: 'border-red-100 hover:border-red-300',
                  text: 'text-red-900',
                  logo: 'text-red-700',
                  risk: 'text-red-600',
                  active: {
                    bg: 'bg-red-100',
                    border: 'border-red-600',
                    text: 'text-red-950',
                    logo: 'text-red-800',
                    risk: 'text-red-800'
                  }
                };
              } else if (name.includes('ICICI')) {
                colors = {
                  bg: 'bg-orange-50/50 hover:bg-orange-50',
                  border: 'border-orange-100 hover:border-orange-300',
                  text: 'text-orange-900',
                  logo: 'text-orange-700',
                  risk: 'text-orange-600',
                  active: {
                    bg: 'bg-orange-100',
                    border: 'border-orange-600',
                    text: 'text-orange-950',
                    logo: 'text-orange-800',
                    risk: 'text-orange-800'
                  }
                };
              } else if (name.includes('UTI')) {
                colors = {
                  bg: 'bg-teal-50/50 hover:bg-teal-50',
                  border: 'border-teal-100 hover:border-teal-300',
                  text: 'text-teal-900',
                  logo: 'text-teal-700',
                  risk: 'text-teal-600',
                  active: {
                    bg: 'bg-teal-100',
                    border: 'border-teal-600',
                    text: 'text-teal-950',
                    logo: 'text-teal-800',
                    risk: 'text-teal-800'
                  }
                };
              } else if (name.includes('KOTAK')) {
                colors = {
                  bg: 'bg-purple-50/50 hover:bg-purple-50',
                  border: 'border-purple-100 hover:border-purple-300',
                  text: 'text-purple-900',
                  logo: 'text-purple-700',
                  risk: 'text-purple-600',
                  active: {
                    bg: 'bg-purple-100',
                    border: 'border-purple-600',
                    text: 'text-purple-950',
                    logo: 'text-purple-800',
                    risk: 'text-purple-800'
                  }
                };
              } else if (name.includes('LIC')) {
                colors = {
                  bg: 'bg-yellow-50/50 hover:bg-yellow-50',
                  border: 'border-yellow-200 hover:border-yellow-400',
                  text: 'text-yellow-900',
                  logo: 'text-yellow-700',
                  risk: 'text-yellow-700',
                  active: {
                    bg: 'bg-yellow-100',
                    border: 'border-yellow-600',
                    text: 'text-yellow-950',
                    logo: 'text-yellow-800',
                    risk: 'text-yellow-800'
                  }
                };
              } else if (name.includes('ADITYA') || name.includes('BIRLA')) {
                colors = {
                  bg: 'bg-amber-50/50 hover:bg-amber-50',
                  border: 'border-amber-100 hover:border-amber-300',
                  text: 'text-amber-900',
                  logo: 'text-amber-700',
                  risk: 'text-amber-600',
                  active: {
                    bg: 'bg-amber-100',
                    border: 'border-amber-600',
                    text: 'text-amber-950',
                    logo: 'text-amber-800',
                    risk: 'text-amber-800'
                  }
                };
              } else if (name.includes('TATA')) {
                colors = {
                  bg: 'bg-cyan-50/50 hover:bg-cyan-50',
                  border: 'border-cyan-100 hover:border-cyan-300',
                  text: 'text-cyan-900',
                  logo: 'text-cyan-700',
                  risk: 'text-cyan-600',
                  active: {
                    bg: 'bg-cyan-100',
                    border: 'border-cyan-600',
                    text: 'text-cyan-950',
                    logo: 'text-cyan-800',
                    risk: 'text-cyan-800'
                  }
                };
              } else if (name.includes('MAX')) {
                colors = {
                  bg: 'bg-indigo-50/50 hover:bg-indigo-50',
                  border: 'border-indigo-100 hover:border-indigo-300',
                  text: 'text-indigo-900',
                  logo: 'text-indigo-700',
                  risk: 'text-indigo-600',
                  active: {
                    bg: 'bg-indigo-100',
                    border: 'border-indigo-600',
                    text: 'text-indigo-950',
                    logo: 'text-indigo-800',
                    risk: 'text-indigo-800'
                  }
                };
              } else if (name.includes('AXIS')) {
                colors = {
                  bg: 'bg-rose-50/50 hover:bg-rose-50',
                  border: 'border-rose-100 hover:border-rose-300',
                  text: 'text-rose-900',
                  logo: 'text-rose-700',
                  risk: 'text-rose-600',
                  active: {
                    bg: 'bg-rose-100',
                    border: 'border-rose-600',
                    text: 'text-rose-950',
                    logo: 'text-rose-800',
                    risk: 'text-rose-800'
                  }
                };
              }

              const isSelected = formData.pfm === pfm.id;
              const currentColors = isSelected ? colors.active : colors;
              // Combine active specific classes with base structure
              // If selected, use active props. If not, use base props.
              // Note: active props completely override because we switch the object.

              const cardClass = `p-4 rounded-xl border-2 transition-all cursor-pointer ${isSelected ? `${colors.active.bg} ${colors.active.border} shadow-md` : `${colors.bg} ${colors.border}`}`;

              return (
                <div
                  key={pfm.id}
                  onClick={() => handleInputChange('pfm', pfm.id)}
                  className={cardClass}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 bg-white border border-gray-100 rounded flex items-center justify-center font-bold ${isSelected ? colors.active.logo : colors.logo}`}>{pfm.logo}</div>
                    <h5 className={`font-bold text-sm ${isSelected ? colors.active.text : colors.text}`}>{pfm.name}</h5>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className={`${isSelected ? colors.active.risk : colors.risk} font-bold uppercase`}>{(function (r) { const map = { 'High': 'Aggressive', 'High Growth': 'Aggressive', 'Very High': 'Aggressive', 'Low': 'Conservative', 'Conservative': 'Conservative', 'Moderate': 'Moderate', 'Growth': 'Moderate' }; return map[r] || r; })(pfm.risk)}</span>
                    <span className="text-gray-500">Min: ₹{pfm.minAmt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button onClick={() => setCurrentStep(2)} className="text-gray-600 flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft size={20} /> Back
        </button>
        <button
          disabled={!formData.selectedTier || !formData.pfm}
          onClick={() => setCurrentStep(4)}
          className={`bg-blue-600 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 ${(!formData.selectedTier || !formData.pfm) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
        >
          Next <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};
// Helper Component for Rendering a Scheme Block
const SchemeSelectionBlock = ({
  tierLabel,
  tierType,
  formData,
  handleInputChange,
  pfmData,
  totalTier1Alloc,
  totalTier2Alloc,
  sameAsTier1,
  setSameAsTier1,
  readOnly = false,
  isTier2 = false
}) => {
  const fieldPrefix = isTier2 ? 'tier2' : '';

  // Helper to get field name: e.g. 'choice' or 'tier2Choice'
  const getField = (name) => isTier2 ? `${fieldPrefix}${name.charAt(0).toUpperCase() + name.slice(1)}` : name;

  const choice = formData[getField('choice')];
  const selectedSchemeId = formData[getField('selectedSchemeId')];
  const amountField = isTier2 ? 'tier2Amount' : 'tier1Amount';
  const amountValue = formData[amountField];
  const totalAlloc = isTier2 ? totalTier2Alloc : totalTier1Alloc;

  return (
    <div className="space-y-6 pt-6 border-t first:border-t-0 first:pt-0">
      {/* Header Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-8">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Investment Choice for {tierLabel} <RequiredMark /></h3>
          {isTier2 && (
            <label className="flex items-center gap-2 cursor-pointer bg-blue-50 px-3 py-1 rounded-md border border-blue-100">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded"
                checked={sameAsTier1}
                onChange={(e) => setSameAsTier1(e.target.checked)}
              />
              <span className="text-xs font-bold text-blue-800">Use same scheme as Tier I</span>
            </label>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <label className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${choice === 'Auto' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-blue-200'} ${readOnly ? 'opacity-70 pointer-events-none' : ''}`}>
            <input
              type="radio"
              name={`choice_${tierType}`}
              className="mt-1 w-5 h-5 text-blue-600"
              checked={choice === 'Auto'}
              onChange={() => !readOnly && handleInputChange(getField('choice'), 'Auto')}
              disabled={readOnly}
            />
            <div>
              <span className="font-bold text-gray-900 block text-lg">Auto Choice</span>
              <p className="text-sm text-gray-600 mt-2">Lifecycle based asset allocation with automated risk balancing.</p>
            </div>
          </label>

          <label className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${choice === 'Active' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-blue-200'} ${readOnly ? 'opacity-70 pointer-events-none' : ''}`}>
            <input
              type="radio"
              name={`choice_${tierType}`}
              className="mt-1 w-5 h-5 text-blue-600"
              checked={choice === 'Active'}
              onChange={() => !readOnly && handleInputChange(getField('choice'), 'Active')}
              disabled={readOnly}
            />
            <div>
              <span className="font-bold text-gray-900 block text-lg">Active Choice</span>
              <p className="text-sm text-gray-600 mt-2">You decide your asset allocation between Equity, Corporate, and Govt Securities.</p>
            </div>
          </label>
        </div>
      </div>

      {/* Available Schemes */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-600" /> Available Schemes (PFM: {pfmData.name}) <RequiredMark />
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {SCHEME_DETAILS.map((scheme) => {
            const isSelected = selectedSchemeId === scheme.id;
            return (
              <div
                key={scheme.id}
                onClick={() => !readOnly && handleInputChange(getField('selectedSchemeId'), scheme.id)}
                className={`p-4 border-2 rounded-xl transition-all cursor-pointer flex gap-4 ${isSelected ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-100 hover:border-blue-200'} ${readOnly ? 'pointer-events-none opacity-80' : ''}`}
              >
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-2xl border border-gray-100 shadow-sm">
                  {scheme.logo}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm text-gray-900">{scheme.name}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${scheme.risk.includes('AGGRESSIVE') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {scheme.risk} Risk
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
                    <div><span className="text-gray-500 uppercase">Performance:</span> <span className="font-bold text-green-600">{scheme.perf}</span></div>
                    <div><span className="text-gray-500 uppercase">Min Amt:</span> <span className="font-bold text-gray-700">₹{scheme.min}</span></div>
                    <div><span className="text-gray-500 uppercase">Max Limit:</span> <span className="font-bold text-gray-700">{scheme.max}</span></div>
                  </div>
                </div>
                {isSelected && <CheckCircle size={18} className="text-blue-600" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Initial Contribution Amount */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4 uppercase tracking-wider text-sm">Initial Contribution Amount</h3>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
            {tierLabel} Contribution (Mandatory) <RequiredMark />
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-400 font-bold">₹</span>
            <input
              type="number"
              className="w-full p-3 pl-8 border border-gray-300 rounded-lg font-bold text-lg focus:ring-2 focus:ring-blue-500"
              value={amountValue}
              onChange={(e) => handleInputChange(amountField, e.target.value)}
              placeholder={isTier2 ? "Min 1000" : "Min 500"}
            />
          </div>
          <div className="mt-2 text-right">
            <span className="text-xs font-bold text-gray-400 uppercase">Total:</span> <span className="text-sm font-black text-gray-900">₹ {Number(amountValue || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Scheme Allocation Details */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Scheme Allocation Details <RequiredMark /></h3>
            <p className="text-xs text-gray-500">PFM: {pfmData.name} | Mode: {choice} Choice</p>
          </div>
          <div className="text-right">
            <span className={`text-xl font-black ${totalAlloc === 100 ? 'text-green-600' : 'text-red-600'}`}>
              {totalAlloc}%
            </span>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Total Allocated</div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-4">
          {[
            { key: 'equity', label: 'Equity (E)', desc: 'Investment in Stocks', limit: 75 },
            { key: 'corpDebt', label: 'Corp Debt (C)', desc: 'Corporate Bonds', limit: 100 },
            { key: 'govtSec', label: 'Govt Sec (G)', desc: 'Govt Bonds', limit: 100 },
            { key: 'altAssets', label: 'Alt Assets (A)', desc: 'Alternative Inv', limit: 5 }
          ].map(asset => {
            const isAvailable = pfmData.schemes.includes(asset.key === 'altAssets' ? 'A' : asset.label[0]);
            if (!isAvailable) return null;

            const assetKey = getField(asset.key);

            return (
              <div key={assetKey} className={`p-4 rounded-xl border ${!isAvailable ? 'bg-gray-50 opacity-50' : 'bg-white'}`}>
                <label className="text-xs font-bold text-gray-600 block mb-2">{asset.label}</label>
                <div className="relative">
                  <input
                    type="number"
                    disabled={choice === 'Auto' || !isAvailable || readOnly}
                    value={formData[assetKey]}
                    onChange={(e) => !readOnly && handleInputChange(assetKey, Number(e.target.value))}
                    className={`w-full p-3 pr-8 border border-gray-300 rounded-lg font-bold text-lg ${choice === 'Auto' || readOnly ? 'bg-gray-50 text-gray-500' : 'focus:ring-2 focus:ring-blue-500'}`}
                  />
                  <span className="absolute right-3 top-3.5 text-gray-400 font-bold">%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
const SchemeStep = ({ formData, handleInputChange, setCurrentStep, showNotification }) => {
  const pfmData = PFM_LIST.find(p => p.id === formData.pfm) || PFM_LIST[0];
  const [sameAsTier1, setSameAsTier1] = useState(false);

  // Initialize Tier 2 defaults if not present
  useEffect(() => {
    if (formData.selectedTier === 'Tier II') {
      if (!formData.tier2Choice) handleInputChange('tier2Choice', 'Auto');
      if (!formData.tier2Equity) handleInputChange('tier2Equity', 50);
      if (!formData.tier2CorpDebt) handleInputChange('tier2CorpDebt', 25);
      if (!formData.tier2GovtSec) handleInputChange('tier2GovtSec', 25);
      if (!formData.tier2AltAssets) handleInputChange('tier2AltAssets', 0);
    }
  }, [formData.selectedTier]);


  // Sync Tier 2 with Tier 1 if "Same as Tier 1" is checked
  useEffect(() => {
    if (sameAsTier1 && formData.selectedTier === 'Tier II') {
      handleInputChange('tier2Choice', formData.choice);
      handleInputChange('tier2SelectedSchemeId', formData.selectedSchemeId);
      handleInputChange('tier2Equity', formData.equity);
      handleInputChange('tier2CorpDebt', formData.corpDebt);
      handleInputChange('tier2GovtSec', formData.govtSec);
      handleInputChange('tier2AltAssets', formData.altAssets);
    }
  }, [sameAsTier1, formData.choice, formData.selectedSchemeId, formData.equity, formData.corpDebt, formData.govtSec, formData.altAssets]);

  // Auto-set allocation for Auto Choice (Tier 1)
  useEffect(() => {
    if (formData.choice === 'Auto') {
      handleInputChange('equity', 50);
      handleInputChange('corpDebt', 25);
      handleInputChange('govtSec', 25);
      handleInputChange('altAssets', 0);
    }
  }, [formData.choice]);

  // Auto-set allocation for Auto Choice (Tier 2)
  useEffect(() => {
    if (formData.tier2Choice === 'Auto' && !sameAsTier1) {
      handleInputChange('tier2Equity', 50);
      handleInputChange('tier2CorpDebt', 25);
      handleInputChange('tier2GovtSec', 25);
      handleInputChange('tier2AltAssets', 0);
    }
  }, [formData.tier2Choice, sameAsTier1]);


  const totalTier1Alloc = (Number(formData.equity) || 0) + (Number(formData.corpDebt) || 0) + (Number(formData.govtSec) || 0) + (Number(formData.altAssets) || 0);
  const totalTier2Alloc = (Number(formData.tier2Equity) || 0) + (Number(formData.tier2CorpDebt) || 0) + (Number(formData.tier2GovtSec) || 0) + (Number(formData.tier2AltAssets) || 0);

  const validateAndProceed = () => {
    // Validate Tier 1
    if (!formData.selectedSchemeId) {
      showNotification("Please select a scheme for Tier I", "error");
      return;
    }
    if (totalTier1Alloc !== 100) {
      showNotification("Tier I allocation must be exactly 100%", "error");
      return;
    }
    if ((Number(formData.tier1Amount) || 0) < 500) {
      showNotification("Minimum Tier I contribution is ₹500", "error");
      return;
    }

    // Validate Tier 2 if selected
    if (formData.selectedTier === 'Tier II') {
      if (!formData.tier2SelectedSchemeId) {
        showNotification("Please select a scheme for Tier II", "error");
        return;
      }
      if (totalTier2Alloc !== 100) {
        showNotification("Tier II allocation must be exactly 100%", "error");
        return;
      }
      if ((Number(formData.tier2Amount) || 0) < 1000) {
        showNotification("Minimum Tier II contribution is ₹1000", "error");
        return;
      }
    }

    if (!formData.schemeAgreed) {
      showNotification("Please accept the terms and conditions", "error");
      return;
    }
    setCurrentStep(5);
  };

  // Helper Component for Rendering a Scheme Block
  const _UnusedSchemeSelectionBlock = ({ tierLabel, tierType, readOnly = false, isTier2 = false }) => {
    const fieldPrefix = isTier2 ? 'tier2' : '';

    // Helper to get field name: e.g. 'choice' or 'tier2Choice'
    const getField = (name) => isTier2 ? `${fieldPrefix}${name.charAt(0).toUpperCase() + name.slice(1)}` : name;

    const choice = formData[getField('choice')];
    const selectedSchemeId = formData[getField('selectedSchemeId')];
    const amountField = isTier2 ? 'tier2Amount' : 'tier1Amount';
    const amountValue = formData[amountField];
    const totalAlloc = isTier2 ? totalTier2Alloc : totalTier1Alloc;

    return (
      <div className="space-y-6 pt-6 border-t first:border-t-0 first:pt-0">
        {/* Header Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Investment Choice for {tierLabel} <RequiredMark /></h3>
            {isTier2 && (
              <label className="flex items-center gap-2 cursor-pointer bg-blue-50 px-3 py-1 rounded-md border border-blue-100">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded"
                  checked={sameAsTier1}
                  onChange={(e) => setSameAsTier1(e.target.checked)}
                />
                <span className="text-xs font-bold text-blue-800">Use same scheme as Tier I</span>
              </label>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <label className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${choice === 'Auto' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-blue-200'} ${readOnly ? 'opacity-70 pointer-events-none' : ''}`}>
              <input
                type="radio"
                name={`choice_${tierType}`}
                className="mt-1 w-5 h-5 text-blue-600"
                checked={choice === 'Auto'}
                onChange={() => !readOnly && handleInputChange(getField('choice'), 'Auto')}
                disabled={readOnly}
              />
              <div>
                <span className="font-bold text-gray-900 block text-lg">Auto Choice</span>
                <p className="text-sm text-gray-600 mt-2">Lifecycle based asset allocation with automated risk balancing.</p>
              </div>
            </label>

            <label className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${choice === 'Active' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-blue-200'} ${readOnly ? 'opacity-70 pointer-events-none' : ''}`}>
              <input
                type="radio"
                name={`choice_${tierType}`}
                className="mt-1 w-5 h-5 text-blue-600"
                checked={choice === 'Active'}
                onChange={() => !readOnly && handleInputChange(getField('choice'), 'Active')}
                disabled={readOnly}
              />
              <div>
                <span className="font-bold text-gray-900 block text-lg">Active Choice</span>
                <p className="text-sm text-gray-600 mt-2">You decide your asset allocation between Equity, Corporate, and Govt Securities.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Available Schemes */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" /> Available Schemes (PFM: {pfmData.name}) <RequiredMark />
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {SCHEME_DETAILS.map((scheme) => {
              const isSelected = selectedSchemeId === scheme.id;
              return (
                <div
                  key={scheme.id}
                  onClick={() => !readOnly && handleInputChange(getField('selectedSchemeId'), scheme.id)}
                  className={`p-4 border-2 rounded-xl transition-all cursor-pointer flex gap-4 ${isSelected ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-100 hover:border-blue-200'} ${readOnly ? 'pointer-events-none opacity-80' : ''}`}
                >
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-2xl border border-gray-100 shadow-sm">
                    {scheme.logo}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm text-gray-900">{scheme.name}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${scheme.risk.includes('AGGRESSIVE') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {scheme.risk} Risk
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
                      <div><span className="text-gray-500 uppercase">Performance:</span> <span className="font-bold text-green-600">{scheme.perf}</span></div>
                      <div><span className="text-gray-500 uppercase">Min Amt:</span> <span className="font-bold text-gray-700">₹{scheme.min}</span></div>
                      <div><span className="text-gray-500 uppercase">Max Limit:</span> <span className="font-bold text-gray-700">{scheme.max}</span></div>
                    </div>
                  </div>
                  {isSelected && <CheckCircle size={18} className="text-blue-600" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Initial Contribution Amount */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4 uppercase tracking-wider text-sm">Initial Contribution Amount</h3>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
              {tierLabel} Contribution (Mandatory) <RequiredMark />
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400 font-bold">₹</span>
              <input
                type="number"
                className="w-full p-3 pl-8 border border-gray-300 rounded-lg font-bold text-lg focus:ring-2 focus:ring-blue-500"
                value={amountValue}
                onChange={(e) => handleInputChange(amountField, e.target.value)}
                placeholder={isTier2 ? "Min 1000" : "Min 500"}
              />
            </div>
            <div className="mt-2 text-right">
              <span className="text-xs font-bold text-gray-400 uppercase">Total:</span> <span className="text-sm font-black text-gray-900">₹ {Number(amountValue || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Scheme Allocation Details */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Scheme Allocation Details <RequiredMark /></h3>
              <p className="text-xs text-gray-500">PFM: {pfmData.name} | Mode: {choice} Choice</p>
            </div>
            <div className="text-right">
              <span className={`text-xl font-black ${totalAlloc === 100 ? 'text-green-600' : 'text-red-600'}`}>
                {totalAlloc}%
              </span>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Total Allocated</div>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-4">
            {[
              { key: 'equity', label: 'Equity (E)', desc: 'Investment in Stocks', limit: 75 },
              { key: 'corpDebt', label: 'Corp Debt (C)', desc: 'Corporate Bonds', limit: 100 },
              { key: 'govtSec', label: 'Govt Sec (G)', desc: 'Govt Bonds', limit: 100 },
              { key: 'altAssets', label: 'Alt Assets (A)', desc: 'Alternative Inv', limit: 5 }
            ].map(asset => {
              const isAvailable = pfmData.schemes.includes(asset.key === 'altAssets' ? 'A' : asset.label[0]);
              if (!isAvailable) return null;

              const assetKey = getField(asset.key);

              return (
                <div key={assetKey} className={`p-4 rounded-xl border ${!isAvailable ? 'bg-gray-50 opacity-50' : 'bg-white'}`}>
                  <label className="text-xs font-bold text-gray-600 block mb-2">{asset.label}</label>
                  <div className="relative">
                    <input
                      type="number"
                      disabled={choice === 'Auto' || !isAvailable || readOnly}
                      value={formData[assetKey]}
                      onChange={(e) => !readOnly && handleInputChange(assetKey, Number(e.target.value))}
                      className={`w-full p-3 pr-8 border border-gray-300 rounded-lg font-bold text-lg ${choice === 'Auto' || readOnly ? 'bg-gray-50 text-gray-500' : 'focus:ring-2 focus:ring-blue-500'}`}
                    />
                    <span className="absolute right-3 top-3.5 text-gray-400 font-bold">%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const totalContributionAmount = (Number(formData.tier1Amount) || 0) + (Number(formData.tier2Amount) || 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* SECTION A: TIER I (Always Visible) */}
      <SchemeSelectionBlock
        tierLabel="Tier I"
        tierType="tier1"
        formData={formData}
        handleInputChange={handleInputChange}
        pfmData={pfmData}
        totalTier1Alloc={totalTier1Alloc}
        totalTier2Alloc={totalTier2Alloc}
        sameAsTier1={sameAsTier1}
        setSameAsTier1={setSameAsTier1}
      />

      {/* SECTION B: TIER II (Visible only if Tier II is selected) */}
      {formData.selectedTier === 'Tier II' && (
        <SchemeSelectionBlock
          tierLabel="Tier II"
          tierType="tier2"
          isTier2={true}
          readOnly={sameAsTier1}
          formData={formData}
          handleInputChange={handleInputChange}
          pfmData={pfmData}
          totalTier1Alloc={totalTier1Alloc}
          totalTier2Alloc={totalTier2Alloc}
          sameAsTier1={sameAsTier1}
          setSameAsTier1={setSameAsTier1}
        />
      )}

      {/* TOTAL SUMMARY */}
      <div className="mt-6 flex justify-between items-center bg-blue-900 text-white p-6 rounded-xl shadow-lg">
        <span className="font-bold text-sm uppercase tracking-widest">Total Contribution Amount (Tier I + Tier II)</span>
        <span className="text-3xl font-black">₹ {totalContributionAmount.toLocaleString()}</span>
      </div>

      <div className="bg-orange-50 p-5 rounded-lg border border-orange-200 flex gap-4 items-start">
        <input
          type="checkbox"
          className="mt-1 w-5 h-5 text-blue-600 rounded cursor-pointer"
          checked={formData.schemeAgreed}
          onChange={(e) => handleInputChange('schemeAgreed', e.target.checked)}
        />
        <div className="text-[11px] text-orange-900 leading-relaxed font-medium">
          I hereby declare that I have read and understood the terms and conditions for selection of Pension Fund Manager (PFM) and Investment Scheme. I understand that the Tier I account is mandatory and Tier II is optional. The contribution details provided above are correct to the best of my knowledge. <RequiredMark />
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={() => setCurrentStep(3)} className="text-gray-600 flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft size={20} /> Back
        </button>
        <button
          onClick={validateAndProceed}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
        >
          Next <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

const BankAndNominee = ({ formData, handleInputChange, setCurrentStep, showNotification, setFormData }) => {
  const [sameBank, setSameBank] = useState(true);

  const handleIfscChange = (index, val) => {
    const updatedBanks = [...formData.bankAccounts];
    updatedBanks[index].ifsc = val.toUpperCase();

    if (val.length >= 4) {
      const bankCode = val.substring(0, 4).toUpperCase();
      const mockBanks = {
        'HDFC': 'HDFC BANK LIMITED',
        'ICIC': 'ICICI BANK LIMITED',
        'SBIN': 'STATE BANK OF INDIA',
        'UTIB': 'AXIS BANK LIMITED',
        'BARB': 'BANK OF BARODA'
      };
      updatedBanks[index].bankName = mockBanks[bankCode] || "FOUND BANK " + bankCode;
    } else {
      updatedBanks[index].bankName = "";
    }

    if (sameBank && index === 0) {
      setFormData(prev => ({
        ...prev,
        bankAccounts: updatedBanks.map(b => ({ ...updatedBanks[0] }))
      }));
    } else {
      setFormData(prev => ({ ...prev, bankAccounts: updatedBanks }));
    }
  };

  const updateBankField = (index, field, val) => {
    const updatedBanks = [...formData.bankAccounts];
    updatedBanks[index][field] = val;

    if (sameBank && index === 0) {
      setFormData(prev => ({
        ...prev,
        bankAccounts: updatedBanks.map(b => ({ ...updatedBanks[0] }))
      }));
    } else {
      setFormData(prev => ({ ...prev, bankAccounts: updatedBanks }));
    }
  };

  const addBankAccount = () => {
    if (formData.bankAccounts.length >= 3) {
      showNotification("Maximum 3 bank accounts allowed", "error");
      return;
    }
    setFormData(prev => ({
      ...prev,
      bankAccounts: [...prev.bankAccounts, { ifsc: '', bankName: '', accountNo: '', accountType: 'Savings' }]
    }));
    setSameBank(false);
  };

  const removeBankAccount = (index) => {
    if (formData.bankAccounts.length <= 1) return;
    const filtered = formData.bankAccounts.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, bankAccounts: filtered }));
  };

  const toggleSameBank = (checked) => {
    setSameBank(checked);
    if (checked) {
      setFormData(prev => ({
        ...prev,
        bankAccounts: [prev.bankAccounts[0], { ...prev.bankAccounts[0] }].slice(0, 2)
      }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Bank Account Details</h3>
            <p className="text-xs text-gray-500">(Optional)</p>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
            <input
              type="checkbox"
              id="sameBank"
              checked={sameBank}
              onChange={(e) => toggleSameBank(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="sameBank" className="text-xs font-bold text-blue-900 cursor-pointer">Use same account for Tier I & II</label>
          </div>
        </div>

        <div className="space-y-8">
          {formData.bankAccounts.map((account, index) => (
            <div key={index} className={`p-5 rounded-xl border-2 ${index === 0 ? 'border-blue-100 bg-blue-50/30' : 'border-gray-100'}`}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Account {index + 1} {index === 0 ? '(Primary / Tier I)' : index === 1 ? '(Tier II)' : ''}
                </span>
                {index > 0 && (
                  <button onClick={() => removeBankAccount(index)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">IFSC Code</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg p-3 uppercase font-mono focus:ring-2 focus:ring-blue-500 bg-white"
                    placeholder="HDFC0001234"
                    value={account.ifsc}
                    onChange={e => handleIfscChange(index, e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Bank Name (Autopopulated)</label>
                  <input
                    disabled
                    className="w-full border border-gray-200 rounded-lg p-3 bg-gray-50 text-gray-700 font-medium"
                    value={account.bankName}
                    placeholder="Enter IFSC to fetch Bank"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Account Number</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 bg-white"
                    value={account.accountNo}
                    onChange={e => updateBankField(index, 'accountNo', e.target.value)}
                    placeholder="000000000000"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Account Type</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 bg-white"
                    value={account.accountType}
                    onChange={e => updateBankField(index, 'accountType', e.target.value)}
                  >
                    <option value="Savings">Savings Account</option>
                    <option value="Current">Current Account</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          {!sameBank && formData.bankAccounts.length < 3 && (
            <button
              onClick={addBankAccount}
              className="w-full border-2 border-dashed border-gray-300 p-4 rounded-xl text-gray-500 font-bold text-sm hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Add Another Bank Account
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={() => setCurrentStep(4)} className="text-gray-600 flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg font-medium">
          <ChevronLeft size={20} /> Back
        </button>
        <button
          onClick={() => {
            const allComplete = formData.bankAccounts.every(acc => {
              const any = acc.ifsc || acc.accountNo;
              return !any || (acc.ifsc && acc.accountNo);
            });
            if (!allComplete) {
              showNotification("Please complete IFSC and Account Number for any bank account you started", "error");
              return;
            }
            setCurrentStep(6);
          }}
          className="bg-blue-600 text-white px-10 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
        >
          Next <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

const NomineeDetailsStep = ({ formData, setCurrentStep, showNotification, setFormData }) => {
  const [sameAsTier1Nominee, setSameAsTier1Nominee] = useState(false);

  // Sync Nominee 2 & 3 with Nominee 1 if "Same as Tier 1" is checked
  useEffect(() => {
    if (sameAsTier1Nominee && formData.nominees.length > 0) {
      const mainNominee = formData.nominees[0];
      const updatedNominees = formData.nominees.map((nominee, index) => {
        if (index === 0) return nominee; // Skip Nominee 1
        return {
          ...nominee,
          title: mainNominee.title,
          firstName: mainNominee.firstName,
          middleName: mainNominee.middleName,
          lastName: mainNominee.lastName,
          name: mainNominee.name, // Sync full name string
          relation: mainNominee.relation,
          dob: mainNominee.dob,
        };
      });

      // Only update if there are actual changes to avoid loops
      if (JSON.stringify(updatedNominees) !== JSON.stringify(formData.nominees)) {
        setFormData(prev => ({ ...prev, nominees: updatedNominees }));
      }
    }
  }, [sameAsTier1Nominee, formData.nominees, setFormData]);

  const calculateAge = (dob) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const addNominee = () => {
    if (formData.nominees.length >= 3) {
      showNotification("Maximum 3 nominees allowed", "error");
      return;
    }
    const newNominee = {
      title: '', firstName: '', middleName: '', lastName: '', name: '',
      relation: '', dob: '', share: 0
    };

    // If sync is enabled, auto-fill the new nominee immediately
    if (sameAsTier1Nominee && formData.nominees.length > 0) {
      const main = formData.nominees[0];
      newNominee.title = main.title;
      newNominee.firstName = main.firstName;
      newNominee.middleName = main.middleName;
      newNominee.lastName = main.lastName;
      newNominee.name = main.name;
      newNominee.relation = main.relation;
      newNominee.dob = main.dob;
    }

    setFormData(prev => ({
      ...prev,
      nominees: [...prev.nominees, newNominee]
    }));
  };

  const removeNominee = (index) => {
    if (formData.nominees.length <= 1) return;
    const updated = formData.nominees.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, nominees: updated }));
  };

  const updateNominee = (index, field, val) => {
    const updated = [...formData.nominees];
    updated[index][field] = val;

    // Construct full name if any name part changes
    if (['title', 'firstName', 'middleName', 'lastName'].includes(field)) {
      const n = updated[index];
      const fullName = [n.title, n.firstName, n.middleName, n.lastName].filter(Boolean).join(' ');
      updated[index].name = fullName;
    }

    setFormData(prev => ({ ...prev, nominees: updated }));
  };

  const validateAndProceed = () => {
    const totalShare = formData.nominees.reduce((sum, n) => sum + (Number(n.share) || 0), 0);
    const filledAny = formData.nominees.some(n => n.name || n.relation || n.dob || n.share);
    const isValidDetails = formData.nominees.every(n => n.name && n.relation && n.dob && n.share > 0);

    // If Tier I is selected, nominee details are mandatory
    if (formData.selectedTier === 'Tier I') {
      if (!isValidDetails) {
        showNotification("Please fill all nominee details correctly", "error");
        return;
      }
      if (totalShare !== 100) {
        showNotification(`Total allocation must be 100%. Current: ${totalShare}%`, "error");
        return;
      }
      setCurrentStep(7);
      return;
    }

    // For other tiers: if user provided any nominee info, validate it; otherwise allow proceed
    if (filledAny) {
      if (!isValidDetails) {
        showNotification("Please fill all nominee details correctly", "error");
        return;
      }
      if (totalShare !== 100) {
        showNotification(`Total allocation must be 100%. Current: ${totalShare}%`, "error");
        return;
      }
    }

    setCurrentStep(7);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Users2 size={20} className="text-blue-600" /> Nominee Details
          </h3>

          {/* Tier II Checkbox - Moved Inline */}
          {formData.selectedTier === 'Tier II' && (
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
              <input
                type="checkbox"
                id="sameNomineeTier2"
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                checked={sameAsTier1Nominee}
                onChange={(e) => setSameAsTier1Nominee(e.target.checked)}
              />
              <label htmlFor="sameNomineeTier2" className="text-sm font-bold text-blue-900 cursor-pointer">
                Use same Nominee for TIER II
              </label>
            </div>
          )}

          <div className="text-right">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Total Allocation</span>
            <span className={`text-xl font-black ${formData.nominees.reduce((sum, n) => sum + (Number(n.share) || 0), 0) === 100 ? 'text-green-600' : 'text-red-600'}`}>
              {formData.nominees.reduce((sum, n) => sum + (Number(n.share) || 0), 0)}%
            </span>
          </div>
        </div>

        <div className="space-y-8">
          {formData.nominees.map((nominee, index) => {
            const isReadOnly = sameAsTier1Nominee && index > 0;
            return (
              <div key={index} className={`p-5 rounded-xl border-2 relative ${index === 0 ? 'border-blue-100 bg-blue-50/10' : 'border-gray-100'}`}>
                {index > 0 && (
                  <button onClick={() => removeNominee(index)} className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
                  {index === 0 ? 'Nominee 1 (Primary / Tier I)' : `Nominee ${index + 1}`}
                </h4>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Name Split Fields */}
                  <div className="md:col-span-2 grid grid-cols-12 gap-4">
                    <div className="col-span-12 sm:col-span-2">
                      <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Title <RequiredMark /></label>
                      <select
                        className={`w-full border border-gray-300 rounded-lg p-3 bg-white ${isReadOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                        value={nominee.title || ''}
                        onChange={e => !isReadOnly && updateNominee(index, 'title', e.target.value)}
                        disabled={isReadOnly}
                      >
                        <option value="">Title</option>
                        <option value="Mr">Mr</option>
                        <option value="Ms">Ms</option>
                        <option value="Mrs">Mrs</option>
                        <option value="Dr">Dr</option>
                      </select>
                    </div>
                    <div className="col-span-12 sm:col-span-4">
                      <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">First Name <RequiredMark /></label>
                      <input
                        className={`w-full border border-gray-300 rounded-lg p-3 ${isReadOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                        value={nominee.firstName || ''}
                        onChange={e => !isReadOnly && updateNominee(index, 'firstName', e.target.value)}
                        placeholder="First Name"
                        disabled={isReadOnly}
                      />
                    </div>
                    <div className="col-span-12 sm:col-span-3">
                      <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Middle Name</label>
                      <input
                        className={`w-full border border-gray-300 rounded-lg p-3 ${isReadOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                        value={nominee.middleName || ''}
                        onChange={e => !isReadOnly && updateNominee(index, 'middleName', e.target.value)}
                        placeholder="Middle Name"
                        disabled={isReadOnly}
                      />
                    </div>
                    <div className="col-span-12 sm:col-span-3">
                      <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Last Name <RequiredMark /></label>
                      <input
                        className={`w-full border border-gray-300 rounded-lg p-3 ${isReadOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                        value={nominee.lastName || ''}
                        onChange={e => !isReadOnly && updateNominee(index, 'lastName', e.target.value)}
                        placeholder="Last Name"
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Relationship <RequiredMark /></label>
                    <select
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 bg-white"
                      value={nominee.relation}
                      onChange={e => updateNominee(index, 'relation', e.target.value)}
                    >
                      <option value="">Select Relation</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Brother">Brother</option>
                      <option value="Sister">Sister</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Date of Birth <RequiredMark /></label>
                    <div className="flex gap-4">
                      <input
                        type="date"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                        value={nominee.dob}
                        onChange={e => updateNominee(index, 'dob', e.target.value)}
                      />
                      <div className="w-24 bg-gray-50 border border-gray-200 rounded-lg flex flex-col justify-center items-center">
                        <span className="text-[10px] uppercase text-gray-400 font-bold">Age</span>
                        <span className="font-bold text-gray-700">{calculateAge(nominee.dob)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Share (%) <RequiredMark /></label>
                    <div className="relative">
                      <input
                        type="number"
                        className="w-full border border-gray-300 rounded-lg p-3 pr-8 focus:ring-2 focus:ring-blue-500 font-bold"
                        value={nominee.share}
                        onChange={e => updateNominee(index, 'share', Number(e.target.value))}
                        placeholder="0"
                      />
                      <span className="absolute right-3 top-3.5 text-gray-400 font-bold">%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {formData.nominees.length < 3 && (
            <button
              onClick={addNominee}
              className="w-full border-2 border-dashed border-gray-300 p-4 rounded-xl text-gray-500 font-bold text-sm hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Add Another Nominee
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={() => setCurrentStep(5)} className="text-gray-600 flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg font-medium">
          <ChevronLeft size={20} /> Back
        </button>
        <button
          onClick={validateAndProceed}
          className="bg-blue-600 text-white px-10 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
        >
          Review Application
        </button>
      </div>
    </div>
  );
};

const ReviewApplication = ({ formData, setCurrentStep, appId, setLatestPaymentRef, latestPaymentRef }) => {
  const [isDeclared, setIsDeclared] = useState(false);
  const [showPaymentNotice, setShowPaymentNotice] = useState(false);

  const totalAmount = Number(formData.tier1Amount || 0) + Number(formData.tier2Amount || 0);

  const handlePayment = () => {
    const ref = generateRefId();
    setLatestPaymentRef(ref);
    setShowPaymentNotice(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Personal Details</h3>
          <button
            onClick={() => setCurrentStep(1)}
            className="text-blue-600 text-sm font-bold hover:text-blue-800 flex items-center gap-1"
          >
            <Edit size={14} /> Edit
          </button>
        </div>
        <div className="grid grid-cols-2 gap-6 text-sm mb-6 border-b pb-6">
          <div><span className="text-gray-500 block">PAN Name</span><span className="font-bold">{formData.panName}</span></div>
          <div><span className="text-gray-500 block">PAN</span><span className="font-bold">{formData.pan}</span></div>
          <div><span className="text-gray-500 block">Mobile</span><span className="font-bold">{formData.mobile}</span></div>
          <div><span className="text-gray-500 block">Email</span><span className="font-bold">{formData.email}</span></div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">FATCA / CRS Details</h3>
          <button
            onClick={() => setCurrentStep(2)}
            className="text-blue-600 text-sm font-bold hover:text-blue-800 flex items-center gap-1"
          >
            <Edit size={14} /> Edit
          </button>
        </div>
        <div className="grid grid-cols-2 gap-6 text-sm mb-6 border-b pb-6">
          <div><span className="text-gray-500 block">US Person</span><span className="font-bold">{formData.isUSPerson}</span></div>
          <div><span className="text-gray-500 block">Tax Residency</span><span className="font-bold">{formData.taxResidency}</span></div>
          <div><span className="text-gray-500 block">Additional Category</span><span className="font-bold">{formData.additionalCategory || '-'}</span></div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Investment Details</h3>
          <button
            onClick={() => setCurrentStep(3)}
            className="text-blue-600 text-sm font-bold hover:text-blue-800 flex items-center gap-1"
          >
            <Edit size={14} /> Edit
          </button>
        </div>
        <div className="grid grid-cols-2 gap-6 text-sm mb-6 border-b pb-6">
          <div><span className="text-gray-500 block">Account Type</span><span className="font-bold text-blue-600">{formData.selectedTier}</span></div>
          <div><span className="text-gray-500 block">PFM</span><span className="font-bold text-blue-600">{formData.pfm}</span></div>
          <div><span className="text-gray-500 block">Investment Choice</span><span className="font-bold">{formData.choice}</span></div>
          <div><span className="text-gray-500 block">Tier I Contrib.</span><span className="font-bold text-green-600">₹{formData.tier1Amount}</span></div>
          <div><span className="text-gray-500 block">Tier II Contrib.</span><span className="font-bold text-green-600">₹{formData.tier2Amount}</span></div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Bank Accounts</h4>
          <button
            onClick={() => setCurrentStep(5)}
            className="text-blue-600 text-sm font-bold hover:text-blue-800 flex items-center gap-1"
          >
            <Edit size={14} /> Edit
          </button>
        </div>
        <div className="space-y-4 mb-6 border-b pb-6">
          {formData.bankAccounts.map((acc, i) => (
            <div key={i} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
              <div>
                <span className="text-xs font-bold text-blue-600 block">{acc.bankName}</span>
                <span className="text-sm font-black text-gray-800 tracking-wider">A/C: ****{acc.accountNo.slice(-4)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase text-gray-400 block">{acc.accountType}</span>
                <span className="text-xs font-bold text-gray-600">{acc.ifsc}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Nominee Details</h4>
          <button
            onClick={() => setCurrentStep(6)}
            className="text-blue-600 text-sm font-bold hover:text-blue-800 flex items-center gap-1"
          >
            <Edit size={14} /> Edit
          </button>
        </div>
        <div className="space-y-3 mb-6 border-b pb-6">
          {formData.nominees.map((nom, i) => (
            <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded text-sm">
              <div className="font-medium text-gray-800">{nom.name} <span className="text-gray-500 text-xs">({nom.relation})</span></div>
              <div className="font-bold text-blue-600">{nom.share}%</div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Asset Allocation</h4>
          <button
            onClick={() => setCurrentStep(4)}
            className="text-blue-600 text-sm font-bold hover:text-blue-800 flex items-center gap-1"
          >
            <Edit size={14} /> Edit
          </button>
        </div>
        <div className="flex gap-4">
          <div className="flex-1 bg-gray-50 p-3 rounded text-center"><span className="block text-lg font-black text-gray-800">{formData.equity}%</span><span className="text-[10px] text-gray-500 uppercase font-bold">Equity</span></div>
          <div className="flex-1 bg-gray-50 p-3 rounded text-center"><span className="block text-lg font-black text-gray-800">{formData.corpDebt}%</span><span className="text-[10px] text-gray-500 uppercase font-bold">Corp Debt</span></div>
          <div className="flex-1 bg-gray-50 p-3 rounded text-center"><span className="block text-lg font-black text-gray-800">{formData.govtSec}%</span><span className="text-[10px] text-gray-500 uppercase font-bold">Govt Sec</span></div>
          <div className="flex-1 bg-gray-50 p-3 rounded text-center"><span className="block text-lg font-black text-gray-800">{formData.altAssets}%</span><span className="text-[10px] text-gray-500 uppercase font-bold">Alt Assets</span></div>
        </div>
      </div>

      <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Wallet size={20} className="text-blue-600" /> Payment Summary
        </h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm mb-6 border-b pb-6">
          <div>
            <span className="text-gray-500 block">Total Amount to Pay</span>
            <span className="font-bold text-green-600">₹ {totalAmount.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Application Number</span>
            <span className="font-bold">{appId || 'Auto-generated'}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Payment Opted for</span>
            <span className="font-bold">{formData.selectedTier || 'Tier I'}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Date & Time</span>
            <span className="font-bold">{new Date().toLocaleString()}</span>
          </div>
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText size={20} className="text-blue-600" /> Declaration & Payment <RequiredMark />
        </h3>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4 text-sm text-blue-900">
          <Info size={16} className="inline mr-2 mb-1" />
          <strong>Payment Redirect Notice:</strong> You will be redirected to the payment gateway to complete your contribution. A transaction link will also be sent to your registered Mobile (+91 {formData.mobile}) and Email.
        </div>

        <div className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg border border-gray-200">
          <input
            type="checkbox"
            id="finalDec"
            className="mt-1 w-5 h-5 text-blue-600 rounded cursor-pointer shrink-0"
            checked={isDeclared}
            onChange={(e) => setIsDeclared(e.target.checked)}
          />
          <label htmlFor="finalDec" className="text-xs text-gray-600 leading-relaxed block">
            {/* <p className="mb-3">
              I hereby declare that the details furnished above are true and correct to the best of my knowledge and belief and I undertake to inform you immediately in case of any changes. If any information provided is found to be false, incorrect, misleading or misrepresented, I understand that I may be held liable. I authorize the CRA to verify or update my details from the KYC/CKYC database. I confirm that I am a tax resident of India. I understand that Tier I account is mandatory and details once submitted cannot be modified
            </p> */}

            <ul className="list-disc pl-5 mb-3 space-y-1">
              <li>I will make payment from the NRE / NRO account mentioned in my bank details. I understand that if the contribution is not paid from the mentioned NRE / NRO account, my account may be frozen.</li>
              <li>I hereby declare that I am the bonafide subscriber of NPS and the contribution made in this transaction belongs to my PRAN. I further confirm that the payment will be made from my own bank account.</li>
            </ul>

            <h5 className="font-bold mb-2">Declaration under the Prevention of Money Laundering Act, 2002</h5>

            <ul className="list-disc pl-5 mb-3 space-y-1">
              <li>I hereby declare that the contribution paid by me/on my behalf has been derived from legally declared and assessed sources of income.</li>
              <li>I understand that NPS Trust has the right to review my financial profile or share the information with government authorities.</li>
              <li>I further agree that NPS Trust has the right to close my PRAN if I am found violating provisions of any applicable law.</li>
            </ul>

            <p className="font-bold text-red-600">
              Note: Please mention "NPS Contribution" as remark while making the payment on your banking portal.
            </p>
          </label>
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={() => setCurrentStep(6)} className="text-gray-600 flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg font-medium">
          <ChevronLeft size={20} /> Back
        </button>
        <button
          disabled={!isDeclared}
          onClick={handlePayment}
          className={`px-10 py-3 rounded-lg font-bold shadow-lg shadow-green-100 transition-all ${isDeclared ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        >
          Confirm & Pay
        </button>
      </div>

      {showPaymentNotice && (
        <div className="fixed inset-0 z-[140] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center animate-in fade-in zoom-in duration-300">
            <Info size={36} className="mx-auto text-blue-600 mb-3" />
            <h4 className="text-lg font-bold text-gray-800 mb-2">Payment Link Shared</h4>
            <p className="text-sm text-gray-600 mb-2">
              Payment link has been shared via Email and SMS. No actual payment is processed here.
            </p>
            <p className="text-sm text-gray-500 mb-4">Reference ID: <strong>{latestPaymentRef || 'BSE-NPS-XXXXXX'}</strong></p>
            <button
              onClick={() => { const ref = generateRefId(); setLatestPaymentRef(ref); setShowPaymentNotice(false); setCurrentStep(8); }}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              OK Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- CONTRIBUTION FLOW COMPONENTS ---

const ContributionBasicDetails = ({ formData, handleInputChange, setContributionStep, showNotification, setFlow, notice }) => {
  const [showPranError, setShowPranError] = useState(false);

  // Mobile inline verification state
  const [mobileVerified, setMobileVerified] = useState(false);
  const [mobileDisabled, setMobileDisabled] = useState(false);
  const [showMobileOtp, setShowMobileOtp] = useState(false);
  const [mobileOtpDigits, setMobileOtpDigits] = useState(Array(6).fill(''));
  const [mobileOtpTimer, setMobileOtpTimer] = useState(180);
  const [mobileResendEnabled, setMobileResendEnabled] = useState(false);

  // --- Mobile OTP helpers ---
  const updateDigits = (setter, index, value) => {
    setter(prev => {
      const next = [...prev];
      next[index] = value.replace(/\D/g, '').slice(0, 1);
      return next;
    });
  };

  const startMobileOtpFlow = () => {
    setShowMobileOtp(true);
    setMobileResendEnabled(false);
    setMobileOtpTimer(180);
    setMobileOtpDigits(Array(6).fill(''));
    mockApi.sendOtp();
  };

  useEffect(() => {
    if (!showMobileOtp) return undefined;
    const tick = setInterval(() => {
      setMobileOtpTimer(t => {
        if (t <= 1) {
          setMobileResendEnabled(true);
          clearInterval(tick);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [showMobileOtp]);

  const resendMobileOtp = async () => {
    if (!mobileResendEnabled) return;
    setMobileResendEnabled(false);
    setMobileOtpTimer(180);
    await mockApi.sendOtp();
  };

  const verifyMobileOtp = async () => {
    const otp = mobileOtpDigits.join('');
    if (otp.length !== 6) {
      showNotification('Please enter the 6-digit OTP', 'error');
      return;
    }
    await mockApi.verifyOtp();
    setMobileVerified(true);
    setMobileDisabled(true);
    setShowMobileOtp(false);
    showNotification('Mobile verified successfully', 'success');
  };

  const handleContinue = async () => {
    const pranValid = /^\d{12}$/.test(formData.contributionPran || '');
    const mobileValid = String(formData.contributionMobile || '').length === 10;
    const dobValid = Boolean(formData.contributionDob);

    if (!pranValid || !mobileValid || !dobValid) {
      showNotification('Please enter valid PRAN, DOB, and 10-digit mobile number', 'error');
      return;
    }
    if (String(formData.contributionPran || '').endsWith('1111')) {
      // Allow 1111 to proceed without mobile check override? 
      // Requirement says "Mobile OTP Verification" is part of Basic Details for ALL.
      // The "Condition" is for the PAYMENT flow later.
      // But wait, "Step 1: Basic Details ... If PRAN number ends with "1111" -> Continue existing current payment journey."
      // Does that mean we skip mobile verification for 1111?
      // Request says: "For normal PRAN: Basic Details (PRAN + DOB + Mobile OTP Verify) -> Review -> ..."
      // "If PRAN number ends with '1111' -> Continue existing current payment journey. Do NOT change anything in that flow."
      // This likely implies 1111 acts as a "Legacy/Test" user. 
      // However, the prompt also says "Mobile OTP Verification... logic used in New PRAN Registration".
      // And "Below this [Basic Details], add Mobile Verification section".
      // It seems the "Basic Details" page ITSELF needs this change.
      // Let's assume validation applies to everyone on this page, but the *Navigation* after Review changes.
      // Prompt: "Mobile OTP Behavior... After successful OTP verification... User clicks 'Next' -> Navigate to existing Review Page"
      // Prompt: "Only for PRAN ending with 1111, old payment flow must remain unchanged." implies the *payment* part.
      // I will enforce mobile verification for everyone here as it is a UI change on the first step.
    }

    if (!mobileVerified) {
      showNotification('Please verify your mobile number first', 'error');
      return;
    }

    // Special check for 1111 is handled in Navigation/Payment steps, not necessarily blocking here?
    // Actually, if I block here, I might break 1111 if they can't verify?
    // I'll assume mock verification works for everyone.

    if (!formData.contributionConsent) {
      showNotification('Please accept the consent to proceed', 'error');
      return;
    }
    // Skip CKYC OTP step (index 1), go straight to Review (index 2 in old, index 1 in new?)
    // Wait, I need to update the steps text array in the main component first to know the indices.
    // If I remove CKYC step, 'Review' will be index 1.
    setContributionStep(1);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {showPranError && (
        <div className="fixed inset-0 z-[120] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in duration-300">
            <AlertCircle size={36} className="mx-auto text-red-600 mb-3" />
            <p className="text-sm font-bold text-gray-800 mb-4">Please enter correct PRAN details</p>
            <button
              onClick={() => setShowPranError(false)}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              Okay
            </button>
          </div>
        </div>
      )}
      {notice && (
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-900 flex items-start gap-3">
          <Info size={16} className="mt-0.5 shrink-0" />
          <span>{notice}</span>
        </div>
      )}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Basic Details</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PRAN Number <RequiredMark /></label>
            <input
              type="text"
              maxLength={12}
              value={formData.contributionPran}
              onChange={(e) => handleInputChange('contributionPran', e.target.value.replace(/\D/g, '').slice(0, 12))}
              placeholder="12-digit PRAN"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth (DOB) <RequiredMark /></label>
            <input
              type="date"
              value={formData.contributionDob}
              onChange={(e) => handleInputChange('contributionDob', e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number <RequiredMark /></label>
            <div className="relative">
              <input
                type="tel"
                maxLength={10}
                disabled={mobileDisabled}
                className={`w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 ${mobileDisabled ? 'bg-gray-100 text-gray-500' : ''}`}
                placeholder="9876543210"
                value={formData.contributionMobile}
                onChange={(e) => handleInputChange('contributionMobile', e.target.value.replace(/\D/g, ''))}
              />
              {mobileVerified ? (
                <span className="absolute right-3 top-3 flex items-center gap-1 text-green-600 text-xs font-semibold">
                  <CheckCircle size={14} /> Verified
                </span>
              ) : (
                String(formData.contributionMobile || '').length === 10 && (
                  <button type="button" onClick={startMobileOtpFlow} className="absolute right-3 top-2 bg-blue-600 text-white text-xs px-3 py-1 rounded-md">Verify</button>
                )
              )}
            </div>
          </div>

        </div>

        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4 text-xs text-blue-900 flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-0.5 w-4 h-4 text-blue-600 rounded cursor-pointer"
            checked={formData.contributionConsent}
            onChange={(e) => handleInputChange('contributionConsent', e.target.checked)}
          />
          <p>I hereby confirm that the provided details are correct as per the PRAN details available with CRA (CAMS / KFin / Protean).</p>
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={() => setFlow('DASHBOARD')} className="text-gray-600 flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft size={20} /> Back
        </button>
        <button
          onClick={handleContinue}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
        >
          Next  <ChevronRight size={20} />
        </button>
      </div>

      {showMobileOtp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[125] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Mobile Verification</h3>
            <p className="text-sm text-gray-600 mb-4">Enter the 6-digit OTP sent to {formData.contributionMobile}</p>
            <div className="my-4 flex justify-center gap-2">
              {mobileOtpDigits.map((d, i) => (
                <input key={i} value={d} onChange={(e) => updateDigits(setMobileOtpDigits, i, e.target.value)} maxLength={1} className="w-10 h-10 text-center border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              ))}
            </div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <button onClick={verifyMobileOtp} className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">Verify OTP</button>
              <button onClick={() => setShowMobileOtp(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
            </div>
            <div className="text-xs text-gray-500">
              {mobileOtpTimer > 0 ? (
                <span>Resend available in {Math.floor(mobileOtpTimer / 60)}:{String(mobileOtpTimer % 60).padStart(2, '0')}</span>
              ) : (
                <button onClick={resendMobileOtp} className="text-blue-600 underline text-xs font-semibold">Resend OTP</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ContributionOTP = ({ setContributionStep, showNotification, onVerify }) => {
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(''));

  const updateDigit = (index, value) => {
    const next = [...otpDigits];
    next[index] = value.replace(/\D/g, '').slice(0, 1);
    setOtpDigits(next);
  };

  const handleVerify = async () => {
    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      showNotification('Please enter the 6-digit OTP', 'error');
      return;
    }
    const result = await Promise.resolve(onVerify?.());
    if (result === false) return;
    setContributionStep(2);
  };

  return (
    <div className="max-w-md mx-auto space-y-6 text-center">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">CKYC OTP Verification</h2>
        <p className="text-gray-500 mb-6">Enter the OTP sent to your registered mobile number.</p>

        <div className="my-6 flex justify-center gap-2">
          {otpDigits.map((digit, i) => (
            <input
              key={i}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => updateDigit(i, e.target.value)}
              className="w-10 h-10 text-center border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
        >
          Verify OTP
        </button>
      </div>
      <button onClick={() => setContributionStep(0)} className="text-gray-600 flex items-center gap-2 mx-auto px-4 py-2 hover:bg-gray-100 rounded-lg">
        <ChevronLeft size={20} /> Back
      </button>
    </div>
  );
};

const ContributionReview = ({ formData, handleInputChange, setContributionStep, showNotification, setLatestPaymentRef }) => {
  const [isDeclared, setIsDeclared] = useState(false);
  const [showPaymentNotice, setShowPaymentNotice] = useState(false);

  const amount = Number(formData.contributionAmount || 0);

  const handleConfirm = () => {
    const pranValid = /^\d{12}$/.test(formData.contributionPran || '');
    const mobileValid = String(formData.contributionMobile || '').length === 10;
    const dobValid = Boolean(formData.contributionDob);

    if (!pranValid || !mobileValid || !dobValid) {
      showNotification('Please re-check PRAN, DOB and mobile number', 'error');
      return;
    }
    if (!amount || amount <= 0) {
      showNotification('Please enter a valid investment amount', 'error');
      return;
    }
    if (!isDeclared) {
      showNotification('Please accept the declaration to proceed', 'error');
      return;
    }

    // Save amount to main form data for consistency
    handleInputChange('tier1Amount', amount);
    handleInputChange('tier2Amount', 0);

    // Conditional Flow
    if (String(formData.contributionPran || '').endsWith('1111')) {
      // Legacy flow -> Go to PaymentJourney (Step 2)
      setContributionStep(2);
    } else {
      // New flow -> Show Payment Link Shared popup
      setShowPaymentNotice(true);
    }
  };

  const handlePopupContinue = () => {
    const ref = generateRefId();
    setLatestPaymentRef?.(ref);
    setShowPaymentNotice(false);
    setContributionStep(2); // Go to PaymentStatusPage (Step 2)
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Subscriber Details</h3>
          <button
            onClick={() => setContributionStep(0)}
            className="text-blue-600 text-sm font-bold hover:text-blue-800 flex items-center gap-1"
          >
            <Edit size={14} /> Edit
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 text-sm mb-6 border-b pb-6">
          <div><span className="text-gray-500 block">PRAN</span><span className="font-bold">{formData.contributionPran}</span></div>
          <div><span className="text-gray-500 block">Date of Birth</span><span className="font-bold">{formData.contributionDob}</span></div>
          <div><span className="text-gray-500 block">Registered Mobile</span><span className="font-bold">{formData.contributionMobile}</span></div>
          <div><span className="text-gray-500 block">Subscriber Name</span><span className="font-bold">RAJESH KUMAR</span></div>
        </div>

        <h3 className="text-lg font-bold mb-4">Investment Details</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Investment Amount <RequiredMark /></label>
          <div className="relative max-w-xs">
            <span className="absolute left-3 top-3 text-gray-400 font-bold">₹</span>
            <input
              type="number"
              className="w-full p-3 pl-8 border border-gray-300 rounded-lg font-bold text-lg focus:ring-2 focus:ring-blue-500"
              value={formData.contributionAmount}
              onChange={(e) => handleInputChange('contributionAmount', e.target.value)}
              placeholder="Enter amount"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText size={20} className="text-blue-600" /> Declaration <RequiredMark />
        </h3>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4 text-sm text-blue-900">
          <Info size={16} className="inline mr-2 mb-1" />
          <strong>Payment Redirect Notice:</strong> You will be redirected to the payment gateway to complete your contribution. A transaction link will also be sent to your registered Mobile (+91 {formData.contributionMobile}) and Email.
        </div>

        <div className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg border border-gray-200">
          <input
            type="checkbox"
            id="contributionDec"
            className="mt-1 w-5 h-5 text-blue-600 rounded cursor-pointer shrink-0"
            checked={isDeclared}
            onChange={(e) => setIsDeclared(e.target.checked)}
          />
          <label htmlFor="contributionDec" className="text-xs text-gray-600 leading-relaxed block">
            <ul className="list-disc pl-5 mb-3 space-y-1">
              <li>I will make payment from the NRE / NRO account mentioned in my bank details. I understand that if the contribution is not paid from the mentioned NRE / NRO account, my account may be frozen.</li>
              <li>I hereby declare that I am the bonafide subscriber of NPS and the contribution made in this transaction belongs to my PRAN. I further confirm that the payment will be made from my own bank account.</li>
            </ul>

            <h5 className="font-bold mb-2">Declaration under the Prevention of Money Laundering Act, 2002</h5>

            <ul className="list-disc pl-5 mb-3 space-y-1">
              <li>I hereby declare that the contribution paid by me/on my behalf has been derived from legally declared and assessed sources of income.</li>
              <li>I understand that NPS Trust has the right to review my financial profile or share the information with government authorities.</li>
              <li>I further agree that NPS Trust has the right to close my PRAN if I am found violating provisions of any applicable law.</li>
            </ul>

            <p className="font-bold text-red-600">
              Note: Please mention "NPS Contribution" as remark while making the payment on your banking portal.
            </p>
          </label>
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={() => setContributionStep(0)} className="text-gray-600 flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg font-medium">
          <ChevronLeft size={20} /> Back
        </button>
        <button
          onClick={handleConfirm}
          disabled={!isDeclared}
          className={`px-10 py-3 rounded-lg font-bold shadow-lg transition-all ${isDeclared ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        >
          Confirm & Pay
        </button>
      </div>

      {showPaymentNotice && (
        <div className="fixed inset-0 z-[140] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center animate-in fade-in zoom-in duration-300">
            <Info size={36} className="mx-auto text-blue-600 mb-3" />
            <h4 className="text-lg font-bold text-gray-800 mb-2">Payment Link Shared</h4>
            <p className="text-sm text-gray-600 mb-4">
              BSE Reference ID - <strong>{generateRefId()}</strong><br />
              Payment link has been shared on Email/SMS.
            </p>
            <button
              onClick={handlePopupContinue}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- NEW PAYMENT STATUS COMPONENT ---
const PaymentStatusPage = ({ latestPaymentRef, formData, resetApp, onViewJourney }) => {
  const [status, setStatus] = useState('Initiated');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-change status to Success after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus('Success');
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setStatus('Pending');
    // Simulate API check delay
    setTimeout(() => {
      setStatus('Success');
      setIsRefreshing(false);
    }, 3000);
  };

  const isSuccess = status === 'Success';

  // Calculate total amount
  const totalAmount = Number(formData.tier1Amount || 0) + Number(formData.tier2Amount || 0);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 animate-in fade-in zoom-in duration-300">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

        {/* Header */}
        <div className={`p-6 text-center border-b ${isSuccess ? 'bg-green-50 border-green-100' : 'bg-blue-50 border-blue-100'}`}>
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
            {isSuccess ? <CheckCircle size={32} /> : <RefreshCw size={32} className={status === 'Pending' ? 'animate-spin' : ''} />}
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">{isSuccess ? 'Payment Successful' : 'Payment Processing'}</h2>
          <p className="text-gray-500 text-sm">Your transaction is currently <strong>{status}</strong></p>
        </div>

        {/* Details Body */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Payment ID</span>
              <span className="block text-gray-800 font-bold">{`PAY${Math.floor(100000 + Math.random() * 900000)}`}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">BSE Reference No</span>
              <span className="block text-gray-800 font-bold">{latestPaymentRef}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date & Time</span>
              <span className="block text-gray-800 font-bold">{new Date().toLocaleString()}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Amount</span>
              <span className="block text-gray-800 font-bold text-lg">₹ {totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-200">
            <div>
              <span className="block text-xs font-bold text-gray-500 uppercase">Payment Status</span>
              <span className={`text-lg font-black ${isSuccess ? 'text-green-600' : 'text-blue-600'}`}>{status}</span>
            </div>
            {!isSuccess && (
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-4 py-2 bg-white border border-gray-300 shadow-sm rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} /> Refresh Status
              </button>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 flex flex-col sm:flex-row gap-3 border-t border-gray-100">
          <button
            onClick={() => window.print()}
            className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            Download Receipt
          </button>
          <button
            onClick={resetApp}
            className="flex-1 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg shadow-gray-200"
          >
            Go to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};

// --- NEW PAYMENT JOURNEY COMPONENT ---
const PaymentJourney = ({ formData, appId, resetApp, showNotification, amountOverride, selectedTierOverride, successCtaLabel, onSuccess, showPranGeneration = true }) => {
  // Stages: SUMMARY, MODE, CONFIRM, GATEWAY, PROCESSING, RESULT
  const [stage, setStage] = useState('SUMMARY');
  const [paymentMode, setPaymentMode] = useState(''); // UPI, NET_BANKING
  const [gatewayStep, setGatewayStep] = useState('LANDING'); // For NetBanking: LANDING, LOGIN, REVIEW, OTP
  const [txnStatus, setTxnStatus] = useState('PENDING'); // SUCCESS, FAILED
  const [upiId, setUpiId] = useState('');
  const [otp, setOtp] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [processing, setProcessing] = useState(false);
  const [billDeskTxnId, setBillDeskTxnId] = useState('');
  const [bankRefNo, setBankRefNo] = useState('');
  const [pran, setPran] = useState('');
  const [pendingPran, setPendingPran] = useState('');
  const [showPranPopup, setShowPranPopup] = useState(false);
  const [pranReady, setPranReady] = useState(false);

  const baseAmount = typeof amountOverride === 'number' ? amountOverride : Number(formData.tier1Amount) + Number(formData.tier2Amount);
  const totalAmount = baseAmount;
  const convFee = 5.90; // Mock convenience fee
  const gst = 1.06; // Mock GST
  const finalAmount = totalAmount + convFee + gst;
  const displayTier = selectedTierOverride || formData.selectedTier || 'Tier I';
  const primarySuccessLabel = successCtaLabel || 'Create New Application';
  const handlePrimarySuccess = () => {
    if (onSuccess) {
      onSuccess();
      return;
    }
    resetApp?.();
  };

  useEffect(() => {
    if (showPranGeneration && txnStatus === 'SUCCESS' && stage === 'RESULT' && showPranPopup && !pranReady) {
      const timer = setTimeout(() => {
        setPran(pendingPran);
        setPranReady(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [txnStatus, stage, showPranPopup, pranReady, pendingPran]);

  // -- HANDLERS --

  const initiatePayment = () => {
    if (!paymentMode) {
      showNotification("Please select a payment mode", "error");
      return;
    }
    setStage('CONFIRM');
  };

  const confirmAndRedirect = async () => {
    setProcessing(true);
    await simulateApiCall(1000); // Simulate redirect delay
    setProcessing(false);
    setStage('GATEWAY');
    if (paymentMode === 'NET_BANKING') {
      setGatewayStep('LANDING');
    }
  };

  const handleUpiPayment = async () => {
    if (!upiId.includes('@')) {
      showNotification("Invalid UPI ID", "error");
      return;
    }
    setProcessing(true);
    await simulateApiCall(2000); // Verify VPA

    // TEST LOGIC
    if (upiId === 'fail@upi') {
      setTxnStatus('FAILED');
      setShowPranPopup(false);
      setPendingPran('');
      setPran('');
      setPranReady(false);
    } else {
      if (upiId !== 'success@upi') {
        showNotification('Demo tip: use success@upi or fail@upi to force outcome.', 'info');
      }
      setTxnStatus('SUCCESS');
      if (showPranGeneration) {
        const generatedPran = `1100${Math.floor(10000000 + Math.random() * 90000000)}`;
        setPendingPran(generatedPran);
        setPran('');
        setPranReady(false);
        setShowPranPopup(true);
      } else {
        setPendingPran('');
        setPran('');
        setPranReady(false);
        setShowPranPopup(false);
      }
    }
    setBillDeskTxnId(`BD${Date.now()}`);
    setBankRefNo(`BNK${Math.floor(100000 + Math.random() * 900000)}`);
    setStage('RESULT');
    setProcessing(false);
  };

  const handleBankLogin = async () => {
    setProcessing(true);
    await simulateApiCall(1500);
    setProcessing(false);
    setGatewayStep('REVIEW');
  };

  const handleNetBankingOtp = async () => {
    setProcessing(true);
    await simulateApiCall(2000);

    // TEST LOGIC
    if (otp === '12345') {
      setTxnStatus('FAILED');
      setShowPranPopup(false);
      setPendingPran('');
      setPran('');
      setPranReady(false);
    } else {
      setTxnStatus('SUCCESS');
      if (showPranGeneration) {
        const generatedPran = `1100${Math.floor(10000000 + Math.random() * 90000000)}`;
        setPendingPran(generatedPran);
        setPran('');
        setPranReady(false);
        setShowPranPopup(true);
      } else {
        setPendingPran('');
        setPran('');
        setPranReady(false);
        setShowPranPopup(false);
      }
    }
    setBillDeskTxnId(`BD${Date.now()}`);
    setBankRefNo(`BNK${Math.floor(100000 + Math.random() * 900000)}`);
    setStage('RESULT');
    setProcessing(false);
  };

  // --- RENDERERS ---

  if (stage === 'SUMMARY') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gray-100 p-5 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">BillDesk Payment Summary</h2>
            <p className="text-xs text-gray-500">Application Reference: {appId}</p>
          </div>
          <div className="p-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Contribution Amount</span>
              <span className="font-semibold text-gray-900">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Convenience Fee</span>
              <span className="font-semibold text-gray-900">{formatCurrency(convFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">GST</span>
              <span className="font-semibold text-gray-900">{formatCurrency(gst)}</span>
            </div>
            <div className="border-t border-dashed border-gray-300 pt-3 flex justify-between items-center">
              <span className="font-bold text-gray-800">Total Payable</span>
              <span className="font-black text-xl text-gray-900">{formatCurrency(finalAmount)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Selected Tier</span>
              <span className="font-semibold text-gray-700">{displayTier}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Date & Time</span>
              <span className="font-semibold text-gray-700">{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setStage('MODE')}
          className="w-full py-4 rounded-xl font-bold text-lg shadow-md transition-all bg-gray-900 text-white hover:bg-black"
        >
          OK Continue
        </button>
      </div>
    );
  }

  if (stage === 'MODE') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">Select Payment Mode <span className="text-xs font-normal text-gray-500">(Secured by BillDesk)</span></h3>
          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={() => setPaymentMode('UPI')}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${paymentMode === 'UPI' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}
            >
              <Smartphone size={32} className={paymentMode === 'UPI' ? 'text-gray-900' : 'text-gray-400'} />
              <span className="font-bold text-sm">UPI / QR</span>
            </div>
            <div
              onClick={() => setPaymentMode('NET_BANKING')}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${paymentMode === 'NET_BANKING' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}
            >
              <Landmark size={32} className={paymentMode === 'NET_BANKING' ? 'text-gray-900' : 'text-gray-400'} />
              <span className="font-bold text-sm">Net Banking</span>
            </div>
          </div>
        </div>

        <button
          onClick={initiatePayment}
          disabled={!paymentMode}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-md transition-all ${paymentMode ? 'bg-gray-900 text-white hover:bg-black' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          Proceed to Pay
        </button>
      </div>
    );
  }

  if (stage === 'CONFIRM') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Confirm Payment Details</h3>
            <button onClick={() => setStage('MODE')} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Contribution Amount</span>
              <span className="font-medium">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Convenience Fee</span>
              <span className="font-medium">{formatCurrency(convFee)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">GST (18%)</span>
              <span className="font-medium">{formatCurrency(gst)}</span>
            </div>
            <div className="border-t border-dashed border-gray-300 my-2 pt-2 flex justify-between items-center">
              <span className="font-bold text-gray-900">Total Payable</span>
              <span className="font-black text-xl text-gray-900">{formatCurrency(finalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Selected Payment Mode</span>
              <span className="font-medium">{paymentMode === 'UPI' ? 'UPI' : 'Net Banking'}</span>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg text-xs text-gray-700 mt-4 flex items-center gap-2">
              <Info size={14} /> Paying via {paymentMode === 'UPI' ? 'UPI' : 'Net Banking'}
            </div>
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-3">
            <button onClick={() => setStage('MODE')} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-200 rounded-lg">Cancel</button>
            <button
              onClick={confirmAndRedirect}
              disabled={processing}
              className="flex-1 py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-black flex items-center justify-center gap-2"
            >
              {processing ? <RefreshCw className="animate-spin" size={18} /> : 'Confirm & Continue'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'GATEWAY') {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-300 overflow-hidden">
          {/* Fake Browser Header */}
          <div className="bg-gray-800 text-white p-3 flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <Lock size={12} className="text-green-400" />
              <span className="text-gray-300">https://secure.billdesk.com/pg/v2/payment</span>
            </div>
            <span className="font-bold tracking-widest text-gray-400">PG PAYMENT PAGE</span>
          </div>

          {/* Gateway Content */}
          <div className="p-8">
            {paymentMode === 'UPI' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800">UPI Payment</h2>
                <div className="flex justify-center my-6">
                  <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400">
                    <img src={UPI_QR_URL} alt="UPI QR Code" className="w-full h-full object-contain" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500">Enter UPI ID</label>
                  <input
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@bank"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  <p className="text-[10px] text-gray-400">Test: use 'success@upi' for SUCCESS, 'fail@upi' for FAILED</p>
                </div>
                <button
                  onClick={handleUpiPayment}
                  disabled={processing}
                  className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-black flex justify-center items-center gap-2"
                >
                  {processing ? 'Verifying...' : 'Make Payment'}
                </button>
              </div>
            )}

            {paymentMode === 'NET_BANKING' && (
              <div className="space-y-6">
                {gatewayStep === 'LANDING' && (
                  <>
                    <h2 className="text-xl font-bold text-gray-800">Select Bank</h2>
                    <div className="grid grid-cols-3 gap-3">
                      {['SBI', 'HDFC', 'ICICI', 'AXIS', 'KOTAK'].map(bank => (
                        <button
                          key={bank}
                          onClick={() => { setSelectedBank(bank); setGatewayStep('REDIRECT_POPUP'); }}
                          className="p-3 border rounded-lg hover:border-blue-500 font-bold text-sm text-gray-700"
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                    <select className="w-full p-3 border border-gray-300 rounded-lg mt-2 text-sm text-gray-600">
                      <option>Select from All Other Available Banks</option>
                      <option>Bank of Baroda</option>
                      <option>Canara Bank</option>
                      <option>Union Bank of India</option>
                      <option>Indian Bank</option>
                      <option>Central Bank of India</option>
                      <option>Bank of India</option>
                      <option>UCO Bank</option>
                      <option>Indian Overseas Bank</option>
                      <option>Punjab & Sind Bank</option>
                      <option>IDBI Bank</option>
                      <option>Yes Bank</option>
                      <option>IndusInd Bank</option>
                      <option>Federal Bank</option>
                      <option>South Indian Bank</option>
                      <option>Karur Vysya Bank</option>
                      <option>RBL Bank</option>
                      <option>City Union Bank</option>
                      <option>DCB Bank</option>
                      <option>Jammu & Kashmir Bank</option>
                      <option>Bandhan Bank</option>
                      <option>AU Small Finance Bank</option>
                      <option>Ujjivan Small Finance Bank</option>
                      <option>Equitas Small Finance Bank</option>
                    </select>
                  </>
                )}

                {gatewayStep === 'REDIRECT_POPUP' && (
                  <div className="text-center space-y-4">
                    <RefreshCw size={40} className="mx-auto text-gray-700 animate-spin" />
                    <p className="font-medium text-gray-800">Redirecting to {selectedBank} secure login...</p>
                    <button onClick={() => setGatewayStep('LOGIN')} className="text-gray-700 text-sm font-bold underline">Proceed (Simulate)</button>
                  </div>
                )}

                {gatewayStep === 'LOGIN' && (
                  <div className="space-y-4">
                    <div className="text-center border-b pb-4 mb-4">
                      <h3 className="font-bold text-lg">{selectedBank} Retail Login</h3>
                    </div>
                    <input placeholder="User ID / Customer ID" className="w-full p-3 border rounded" />
                    <input type="password" placeholder="Password" className="w-full p-3 border rounded" />
                    <button onClick={handleBankLogin} disabled={processing} className="w-full bg-gray-900 text-white py-3 rounded font-bold">
                      {processing ? 'Logging in...' : 'Login'}
                    </button>
                  </div>
                )}

                {gatewayStep === 'REVIEW' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg border-b pb-2">Transaction Review</h3>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between"><span>Merchant:</span><span className="font-bold">BSE STAR NPS</span></div>
                      <div className="flex justify-between"><span>Amount:</span><span className="font-bold">₹ {finalAmount.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>App ID:</span><span className="font-bold">{appId}</span></div>
                    </div>
                    <button onClick={() => setGatewayStep('OTP')} className="w-full bg-gray-900 text-white py-3 rounded font-bold mt-4">Confirm Transaction</button>
                  </div>
                )}

                {gatewayStep === 'OTP' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg">Enter High Security Password (OTP)</h3>
                    <p className="text-xs text-gray-500">OTP sent to mobile ending **9899</p>
                    <input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP"
                      className="w-full p-3 border rounded text-center tracking-widest font-bold text-xl"
                    />
                    <p className="text-[10px] text-gray-400 text-center">Test: '12345' to fail</p>
                    <button onClick={handleNetBankingOtp} disabled={processing} className="w-full bg-gray-900 text-white py-3 rounded font-bold">
                      {processing ? 'Verifying...' : 'Submit OTP'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- RESULT PAGE ---
  if (stage === 'RESULT') {
    const isSuccess = txnStatus === 'SUCCESS';
    const statusLabel = isSuccess ? 'SUCCESS' : 'FAILED';
    const paymentModeLabel = paymentMode === 'UPI' ? 'UPI' : 'Net Banking';

    const handleDownloadReceipt = () => {
      const lines = [
        `Application ID: ${appId}`,
        `PRAN: ${pran || 'NA'}`,
        `Payment Mode: ${paymentModeLabel}`,
        `Transaction ID: ${billDeskTxnId || 'NA'}`,
        `Bank Ref No: ${bankRefNo || 'NA'}`,
        `Amount: ${formatCurrency(finalAmount)}`,
        `Status: ${statusLabel}`,
        `Date & Time: ${new Date().toLocaleString()}`
      ];
      const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `BSE-NPS-Receipt-${appId || 'payment'}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    };
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6 py-6 animate-in fade-in zoom-in duration-300">
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={BSE_LOGO_URL} alt="BSE" className="h-6 w-auto" />
            <div className="text-left">
              <p className="text-xs uppercase tracking-widest text-gray-400">BSE Payment Status</p>
              <p className="text-sm font-bold text-gray-800">BSE STAR NPS Platform</p>
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {statusLabel}
          </span>
        </div>
        <div className={`p-8 rounded-full inline-block mb-2 shadow-lg ${isSuccess ? 'bg-green-50 shadow-green-100' : 'bg-red-50 shadow-red-100'}`}>
          {isSuccess ? <CheckCircle size={80} className="text-green-600" /> : <AlertCircle size={80} className="text-red-600" />}
        </div>

        <div className="space-y-2">
          <h2 className={`text-3xl font-black tracking-tight ${isSuccess ? 'text-gray-900' : 'text-red-700'}`}>
            {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
          </h2>
          <p className="text-gray-500">
            {isSuccess ? 'Your application has been successfully submitted to KFintech / Protean CRA.' : 'The transaction was declined by your bank.'}
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl text-left space-y-6">
          {isSuccess && pran && (
            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-gray-500 font-bold uppercase text-xs tracking-wider">PRAN Generated</span>
              <span className="text-2xl font-black text-blue-700">{pran}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-gray-500 text-xs font-bold uppercase mb-1">Status</span>
              <span className="font-bold text-gray-800">{statusLabel}</span>
            </div>
            <div>
              <span className="block text-gray-500 text-xs font-bold uppercase mb-1">Payment Mode</span>
              <span className="font-bold text-gray-800">{paymentModeLabel}</span>
            </div>
            <div>
              <span className="block text-gray-500 text-xs font-bold uppercase mb-1">Application ID</span>
              <span className="font-bold text-gray-800">{appId}</span>
            </div>
            <div>
              <span className="block text-gray-500 text-xs font-bold uppercase mb-1">BillDesk Transaction ID</span>
              <span className="font-bold text-gray-800">{billDeskTxnId}</span>
            </div>
            <div>
              <span className="block text-gray-500 text-xs font-bold uppercase mb-1">Bank Ref No</span>
              <span className="font-bold text-gray-800">{bankRefNo}</span>
            </div>
            <div>
              <span className="block text-gray-500 text-xs font-bold uppercase mb-1">Amount</span>
              <span className="font-bold text-gray-800">{formatCurrency(finalAmount)}</span>
            </div>
            <div>
              <span className="block text-gray-500 text-xs font-bold uppercase mb-1">Date & Time</span>
              <span className="font-bold text-gray-800">{new Date().toLocaleString()}</span>
            </div>
          </div>

        </div>

        <div className="flex flex-col gap-4">
          <button onClick={handleDownloadReceipt} className="w-full bg-white border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition-all">
            <Printer size={20} /> Download Receipt / Acknowledgement
          </button>

          {isSuccess ? (
            <button onClick={handlePrimarySuccess} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
              {primarySuccessLabel}
            </button>
          ) : (
            <>
              <button onClick={() => setStage('SUMMARY')} className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200">
                Retry Payment
              </button>
              <button onClick={() => resetApp?.()} className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-black transition-all">
                Go to Dashboard
              </button>
            </>
          )}
        </div>
        {isSuccess && showPranPopup && (
          <div className="fixed inset-0 z-[140] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300 text-center">
              {!pranReady ? (
                <>
                  <RefreshCw size={36} className="mx-auto text-blue-600 animate-spin mb-4" />
                  <p className="text-sm font-bold text-gray-700">
                    YOUR REQUEST IS IN PROGRESS FOR PRAN CREATION.
                  </p>
                  <p className="text-sm font-bold text-gray-700">
                    PLEASE KEEP CHECKING STATUS IF PRAN IS NOT GENERATED.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Proceeding...</p>
                </>
              ) : (
                <>
                  <CheckCircle size={36} className="mx-auto text-green-600 mb-3" />
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-2">PRAN Generated</p>
                  <div className="text-2xl font-black text-blue-700 mb-4">{pran}</div>
                  <button
                    onClick={() => setShowPranPopup(false)}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                  >
                    Continue
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

// --- MAIN APP WRAPPER ---

const NPSPlatformApp = () => {
  const [authStep, setAuthStep] = useState('LOGIN');
  const [loginData, setLoginData] = useState({ role: '', username: '', password: '', captcha: '' });

  const [appId, setAppId] = useState(null);
  const [flow, setFlow] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [contributionStep, setContributionStep] = useState(0);
  const [toast, setToast] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [contributionNotice, setContributionNotice] = useState('');
  const [latestPaymentRef, setLatestPaymentRef] = useState(null);

  const initialFormData = {
    panName: '',
    pan: '',
    dob: '',
    mobile: '',
    email: '',
    contributionPran: '',
    contributionDob: '',
    contributionMobile: '',
    contributionAmount: 500,
    contributionConsent: false,
    residentStatus: 'Resident Indian',
    gender: '',
    birthCountry: '',
    birthCity: '',
    nationality: 'Indian',
    maritalStatus: '',
    fatherName: '',
    motherName: '',
    pranStatus: 'NEW',
    existingPran: '',
    title: 'Mr',
    firstName: '',
    middleName: '',
    lastName: '',
    occupation: '',
    incomeRange: '',
    pepStatus: 'No',
    pepRelated: 'No',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    permAddressLine1: '',
    permAddressLine2: '',
    permAddressLine3: '',
    permCity: '',
    permState: '',
    permPincode: '',
    permCountry: 'India',
    fatcaAddressLine: '',
    fatcaCity: '',
    fatcaState: '',
    fatcaPin: '',
    fatcaCountry: 'India',
    tin: '',
    taxResidency: 'India',
    isUSPerson: 'No',
    additionalCategory: '',
    fatcaDeclared: false,
    selectedTier: '',
    pfm: '',
    choice: 'Auto',
    selectedSchemeId: '',
    tier1Amount: 500,
    tier2Amount: 0,
    schemeAgreed: false,
    equity: 50,
    corpDebt: 25,
    govtSec: 25,
    altAssets: 0,
    bankAccounts: [
      { ifsc: '', bankName: '', accountNo: '', accountType: 'Savings' }
    ],
    nominees: [{ name: '', relation: '', dob: '', share: 100 }],
    kycSource: 'CKYC',
    fatherTitle: 'Mr',
    fatherFirstName: '',
    fatherMiddleName: '',
    fatherLastName: '',
    motherTitle: 'Mrs',
    motherFirstName: '',
    motherMiddleName: '',
    motherLastName: ''
  };

  const [formData, setFormData] = useState(initialFormData);

  const showNotification = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resetApp = () => {
    setFormData(initialFormData);
    setCurrentStep(0);
    setContributionStep(0);
    setAppId(null);
    setFlow('DASHBOARD');
    setContributionNotice('');
  };

  const resetContributionFlow = () => {
    setContributionStep(0);
    setContributionNotice('');
    setFlow('CONTRIBUTION');
    setAppId(generateRefId());
    setFormData(prev => ({
      ...prev,
      contributionPran: '',
      contributionDob: '',
      contributionMobile: '',
      contributionAmount: 500,
      contributionConsent: false
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLoginSubmit = () => setAuthStep('OTP');
  const handleOtpVerify = async () => {
    setAuthStep('LOGGED_IN');
    setFlow('DASHBOARD');
  };

  const renderMainContent = () => {
    if (authStep === 'LOGIN') {
      return <LoginScreen onProceed={handleLoginSubmit} loginData={loginData} setLoginData={setLoginData} />;
    }

    if (authStep === 'OTP') {
      return <LoginOTP onVerify={handleOtpVerify} onBack={() => setAuthStep('LOGIN')} loginData={loginData} />;
    }

    return (
      <div className="flex bg-gray-50 min-h-[calc(100vh-64px)]">
        <Sidebar
          setFlow={setFlow}
          setAppId={setAppId}
          currentFlow={flow}
          setAuthStep={setAuthStep}
          setCurrentStep={setCurrentStep}
          setContributionStep={setContributionStep}
          setContributionNotice={setContributionNotice}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((open) => !open)}
        />

        <div className="flex-1 overflow-y-auto h-[calc(100vh-64px)] w-full">
          {!flow || flow === 'DASHBOARD' ? (
            <Dashboard
              onStartRegistration={() => { setAppId(generateRefId()); setFlow('REGISTRATION'); setCurrentStep(0); }}
              onStartContribution={() => { setAppId(generateRefId()); setFlow('CONTRIBUTION'); setContributionStep(0); setContributionNotice(''); }}
            />
          ) : flow === 'REPORTS' ? (
            <ReportsModule />
          ) : flow === 'CONTRIBUTION' ? (
            <>
              <Stepper currentStep={contributionStep} steps={contributionSteps} />
              <div className="max-w-7xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">{contributionSteps[contributionStep]}</h1>

                {contributionStep === 0 && (
                  <ContributionBasicDetails
                    formData={formData}
                    handleInputChange={handleInputChange}
                    setContributionStep={setContributionStep}
                    showNotification={showNotification}
                    setFlow={setFlow}
                    notice={contributionNotice}
                  />
                )}

                {contributionStep === 1 && (
                  <ContributionReview
                    formData={formData}
                    handleInputChange={handleInputChange}
                    setContributionStep={setContributionStep}
                    showNotification={showNotification}
                    setLatestPaymentRef={setLatestPaymentRef}
                  />
                )}
                {contributionStep === 2 && (
                  String(formData.contributionPran || '').endsWith('1111') ? (
                    <PaymentJourney
                      formData={formData}
                      appId={appId}
                      resetApp={resetApp}
                      showNotification={showNotification}
                      amountOverride={Number(formData.contributionAmount || 0)}
                      selectedTierOverride="Tier I"
                      successCtaLabel="Make Another Contribution"
                      onSuccess={resetContributionFlow}
                      showPranGeneration={false}
                    />
                  ) : (
                    <PaymentStatusPage
                      latestPaymentRef={latestPaymentRef}
                      formData={{
                        ...formData,
                        tier1Amount: formData.contributionAmount,
                        tier2Amount: 0
                      }}
                      resetApp={resetContributionFlow}
                      onViewJourney={() => { }}
                    />
                  )
                )}
              </div>
            </>
          ) : (
            <>
              <Stepper currentStep={currentStep} steps={steps} />

              <div className="max-w-7xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">{steps[currentStep]}</h1>

                {currentStep === 0 && (
                  <BasicDetails
                    formData={formData}
                    handleInputChange={handleInputChange}
                    setCurrentStep={setCurrentStep}
                    setFlow={setFlow}
                    showNotification={showNotification}
                    setFormData={setFormData}
                    setContributionStep={setContributionStep}
                    setContributionNotice={setContributionNotice}
                    setAppId={setAppId}
                  />
                )}
                {currentStep === 1 && <PersonalAndAddress formData={formData} handleInputChange={handleInputChange} setCurrentStep={setCurrentStep} />}
                {currentStep === 2 && <FatcaDeclaration formData={formData} handleInputChange={handleInputChange} setCurrentStep={setCurrentStep} showNotification={showNotification} />}
                {currentStep === 3 && <AccountTypeStep formData={formData} handleInputChange={handleInputChange} setCurrentStep={setCurrentStep} />}
                {currentStep === 4 && <SchemeStep formData={formData} handleInputChange={handleInputChange} setCurrentStep={setCurrentStep} showNotification={showNotification} />}
                {currentStep === 5 && <BankAndNominee formData={formData} handleInputChange={handleInputChange} setCurrentStep={setCurrentStep} showNotification={showNotification} setFormData={setFormData} />}
                {currentStep === 6 && <NomineeDetailsStep formData={formData} setCurrentStep={setCurrentStep} showNotification={showNotification} setFormData={setFormData} />}
                {currentStep === 7 && <ReviewApplication formData={formData} setCurrentStep={setCurrentStep} appId={appId} setLatestPaymentRef={setLatestPaymentRef} latestPaymentRef={latestPaymentRef} />}
                {currentStep === 8 && (
                  latestPaymentRef
                    ? <PaymentStatusPage latestPaymentRef={latestPaymentRef} formData={formData} resetApp={resetApp} onViewJourney={() => setLatestPaymentRef(null)} />
                    : <PaymentJourney formData={formData} appId={appId} resetApp={resetApp} showNotification={showNotification} />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const toastClass = toast?.type === 'error'
    ? 'bg-red-50 text-red-700 border border-red-200'
    : toast?.type === 'info'
      ? 'bg-blue-50 text-blue-700 border border-blue-200'
      : 'bg-green-50 text-green-700 border border-green-200';

  const toastIcon = toast?.type === 'error'
    ? <AlertCircle size={20} />
    : toast?.type === 'info'
      ? <Info size={20} />
      : <CheckCircle size={20} />;

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-gray-50">
      {authStep === 'LOGGED_IN' && (
        <Header
          onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
          username={loginData.username}
          isAuthenticated={authStep === 'LOGGED_IN'}
        />
      )}

      {toast && (
        <div className={`fixed top-20 right-6 px-6 py-4 rounded-xl shadow-2xl z-[100] animate-in slide-in-from-right duration-300 flex items-center gap-3 ${toastClass}`}>
          {toastIcon}
          <span className="font-medium">{toast.msg}</span>
        </div>
      )}

      {renderMainContent()}
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <NPSPlatformApp />
    </React.StrictMode>
  );
}

export default NPSPlatformApp;