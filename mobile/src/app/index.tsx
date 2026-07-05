import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Modal,
  Switch,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import {
  Home,
  PlusCircle,
  TrendingUp,
  Wallet,
  ArrowRight,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Phone,
  Shield,
  MessageSquare,
  CheckCircle2,
  ChevronRight,
  Copy,
  Upload,
  Clock,
  LogOut,
  Building,
  Send,
  FileText,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react-native';

import api from '@/lib/axios';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Circular Progress Component for Countdown
function ProgressRing({ pct = 0, size = 60, stroke = 5, fillColor = '#de1f25', trackColor = 'rgba(0,0,0,0.1)' }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View style={[styles.progressCircle, { width: size, height: size, borderRadius: size / 2, borderWidth: stroke, borderColor: trackColor, justifyContent: 'center', alignItems: 'center' }]}>
        <View style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: stroke, borderColor: fillColor, borderBottomColor: 'transparent', borderLeftColor: 'transparent', transform: [{ rotate: `${(pct / 100) * 360}deg` }] }} />
        <Text style={{ fontSize: 10, fontWeight: '900', color: fillColor }}>{Math.round(pct)}%</Text>
      </View>
    </View>
  );
}

export default function MobileApp() {
  // App navigation state: 'onboarding' | 'auth' | 'dashboard'
  const [appState, setAppState] = useState<'onboarding' | 'auth' | 'dashboard'>('onboarding');
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'otp' | 'forgot'>('login');
  const [isAppLoading, setIsAppLoading] = useState(true);

  // Authentication inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [referredByEmail, setReferredByEmail] = useState('');

  // OTP Target email cache (for resending OTP)
  const [verificationEmail, setVerificationEmail] = useState('');

  // Password Feedback strength checks
  const [passwordFeedback, setPasswordFeedback] = useState('');

  // Current logged in user object
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pinSet, setPinSet] = useState(false);

  // Lists from API
  const [investments, setInvestments] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal control states
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<any | null>(null);

  // Investment creation state
  const [investAmount, setInvestAmount] = useState('');
  const [investPlanName, setInvestPlanName] = useState('Yield Max Land Banking');
  const [investDuration, setInvestDuration] = useState('12');
  const [maturityAction, setMaturityAction] = useState('pay_roi_and_principal');
  const [ninNumber, setNinNumber] = useState('');
  const [bvnNumber, setBvnNumber] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  
  // Bank domiciliation state
  const [userBankName, setUserBankName] = useState('');
  const [userAccountNumber, setUserAccountNumber] = useState('');
  const [userAccountName, setUserAccountName] = useState('');

  // Next of kin
  const [nokName, setNokName] = useState('');
  const [nokRel, setNokRel] = useState('');
  const [nokPhone, setNokPhone] = useState('');
  const [nokAddress, setNokAddress] = useState('');

  // PIN settings inputs
  const [securityPin, setSecurityPin] = useState('');
  const [currentSecurityPin, setCurrentSecurityPin] = useState('');

  // Live support input
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  // Receipt file selection
  const [receiptFile, setReceiptFile] = useState<any>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  // Onboarding Slides
  const [onboardingIndex, setOnboardingIndex] = useState(0);
  const onboardingSlides = [
    {
      title: 'Premium Property Investments',
      desc: 'Living Vine Properties lets you invest in high-yield estate banking plans with complete confidence and trust.',
      icon: <Building size={120} color="#de1f25" strokeWidth={1.5} />,
    },
    {
      title: 'Track Real-time Yields',
      desc: 'Monitor your investment maturity progress and daily interest updates straight from your native mobile dashboard.',
      icon: <TrendingUp size={120} color="#de1f25" strokeWidth={1.5} />,
    },
    {
      title: 'Verifiable Receipts & PIN Security',
      desc: 'Every investment automatically generates digital certificates. Secure your actions with our robust Transaction PIN.',
      icon: <Shield size={120} color="#de1f25" strokeWidth={1.5} />,
    }
  ];

  // Auto-login verify token on mount
  useEffect(() => {
    const autoLogin = async () => {
      try {
        if (typeof window !== 'undefined') {
          const storedToken = window.localStorage.getItem('token');
          if (storedToken) {
            // Fetch profile
            const profileRes = await api.get('/users/profile');
            const pinRes = await api.get('/users/pin-status');
            
            setCurrentUser(profileRes.data);
            setPinSet(pinRes.data.transactionPinSet);
            setAppState('dashboard');
            
            // Trigger load data
            fetchDashboardData(profileRes.data._id);
          }
        }
      } catch (err) {
        console.log('Session expired, please login.', err);
      } finally {
        setIsAppLoading(false);
      }
    };
    autoLogin();
  }, []);

  // Fetch full portfolio, plans, support chat
  const fetchDashboardData = async (userId?: string) => {
    setIsRefreshing(true);
    try {
      const { data: list } = await api.get('/investments/my');
      setInvestments(list || []);

      const { data: chatList } = await api.get('/support/messages');
      setChatMessages(chatList || []);
    } catch (err) {
      console.log('Error refreshing dashboard:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Password checker
  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (!val) {
      setPasswordFeedback('');
      return;
    }
    const hasAlpha = /[a-zA-Z]/.test(val);
    const hasNum = /[0-9]/.test(val);
    const hasSpecial = /[^a-zA-Z0-9]/.test(val);
    
    if (val.length < 8) {
      setPasswordFeedback('⚠️ Password must be at least 8 characters long');
    } else if (!hasAlpha || !hasNum || !hasSpecial) {
      setPasswordFeedback('⚠️ Make it stronger: Mix letters, numbers & special characters');
    } else {
      setPasswordFeedback('✅ Strong secure password');
    }
  };

  // Skip onboarding
  const handleOnboardingNext = () => {
    if (onboardingIndex < onboardingSlides.length - 1) {
      setOnboardingIndex(prev => prev + 1);
    } else {
      setAppState('auth');
    }
  };

  // Auth: Log in
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Required Fields', 'Please enter your email and password.');
      return;
    }
    setIsAppLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.token) {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('token', data.token);
          window.localStorage.setItem('user', JSON.stringify(data));
        }
        
        setCurrentUser(data);
        const pinRes = await api.get('/users/pin-status');
        setPinSet(pinRes.data.transactionPinSet);

        // Fetch Dashboard contents
        await fetchDashboardData(data._id);
        
        setAppState('dashboard');
        Alert.alert('Welcome', `Success, logged in as ${data.firstName}!`);
      }
    } catch (err: any) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsAppLoading(false);
    }
  };

  // Auth: Register
  const handleRegister = async () => {
    if (!firstName || !surname || !email || !password || !phone) {
      Alert.alert('Required Fields', 'Please fill in all details.');
      return;
    }
    if (!acceptTerms) {
      Alert.alert('Terms Agreement', 'Please accept the Terms and Conditions.');
      return;
    }
    setIsAppLoading(true);
    try {
      const regData = {
        email,
        password,
        firstName,
        surname,
        phoneNumber: phone,
        role: 'investor',
        referredByEmail: referredByEmail.trim() || undefined,
        acceptedTerms: true,
      };

      const { data } = await api.post('/auth/register', regData);
      setVerificationEmail(email);
      setAuthMode('otp');
      Alert.alert('Verification Sent', data.message || 'Check email for OTP.');
    } catch (err: any) {
      Alert.alert('Register Failed', err.response?.data?.message || 'Error occurred during registration.');
    } finally {
      setIsAppLoading(false);
    }
  };

  // Auth: Verify Email
  const handleOtpVerify = async () => {
    if (!otp) {
      Alert.alert('Required OTP', 'Please enter the verification OTP.');
      return;
    }
    setIsAppLoading(true);
    try {
      const { data } = await api.post('/auth/verify-email', { email: verificationEmail, otp });
      Alert.alert('Verified', data.message || 'Email verified successfully! Please login.');
      setAuthMode('login');
      setEmail(verificationEmail);
      setPassword('');
    } catch (err: any) {
      Alert.alert('Verification Failed', err.response?.data?.message || 'Invalid code.');
    } finally {
      setIsAppLoading(false);
    }
  };

  // Auth: Resend OTP
  const handleResendOtp = async () => {
    try {
      const { data } = await api.post('/auth/resend-otp', { email: verificationEmail });
      Alert.alert('OTP Resent', data.message || 'OTP resent to your email.');
    } catch (err: any) {
      Alert.alert('Resend Failed', err.response?.data?.message || 'Could not resend OTP.');
    }
  };

  // Auth: Logout
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('user');
    }
    setCurrentUser(null);
    setAppState('auth');
    setAuthMode('login');
    setEmail('');
    setPassword('');
  };

  // Create investment plan request
  const handleCreateInvestmentPlan = async () => {
    const amt = parseFloat(investAmount);
    if (!amt || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid investment capital amount.');
      return;
    }
    if (!ninNumber || !contactAddress || !nokName || !nokPhone || !userAccountNumber || !userBankName) {
      Alert.alert('KYC Details Required', 'Please complete all NIN/BVN, returns bank details, next of kin, and address details.');
      return;
    }

    setIsAppLoading(true);
    try {
      const payload = {
        name: investPlanName,
        email: currentUser.email,
        contactAddress,
        phoneNumber: currentUser.phoneNumber || phone,
        amountToInvest: amt,
        durationInMonths: parseInt(investDuration),
        principalActionAfterMaturity: maturityAction,
        nin: ninNumber,
        bvn: bvnNumber || undefined,
        accountDetails: {
          bankName: userBankName,
          accountNumber: userAccountNumber,
          accountName: userAccountName || `${currentUser.firstName} ${currentUser.surname}`,
        },
        nextOfKin: {
          fullName: nokName,
          relationship: nokRel,
          phoneNumber: nokPhone,
          address: nokAddress,
        },
      };

      const { data } = await api.post('/investments', payload);
      Alert.alert('Investment Plan Setup', 'Investment setup successfully! Attach your payment receipt to begin.');
      
      // Update lists
      setShowInvestModal(false);
      fetchDashboardData(currentUser._id);
      setSelectedInvestment(data);
      setShowReceiptModal(true);
    } catch (err: any) {
      Alert.alert('Failed to Setup', err.response?.data?.message || 'Error occurred setting up investment.');
    } finally {
      setIsAppLoading(false);
    }
  };

  // Web receipt selection callback
  const handleReceiptSelection = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
    }
  };

  // Upload receipt actual endpoint upload
  const handleUploadReceipt = async () => {
    if (!selectedInvestment) return;
    if (Platform.OS === 'web' && !receiptFile) {
      Alert.alert('Receipt Needed', 'Please select a payment screenshot or document first.');
      return;
    }

    setUploadingReceipt(true);
    try {
      const formData = new FormData();
      // On Web, send the actual selected file
      if (Platform.OS === 'web' && receiptFile) {
        formData.append('receipt', receiptFile);
      } else {
        // Native fallback simulation or standard multipart
        Alert.alert('Upload Status', 'Receipt file selection supported in browser. Uploading simulation.');
        setUploadingReceipt(false);
        setShowReceiptModal(false);
        return;
      }

      await api.put(`/investments/${selectedInvestment._id}/receipt`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Receipt Uploaded', 'Your payment receipt was uploaded successfully! Verification is ongoing.');
      setShowReceiptModal(false);
      setReceiptFile(null);
      fetchDashboardData(currentUser._id);
    } catch (err: any) {
      Alert.alert('Upload Failed', err.response?.data?.message || 'Could not upload payment receipt.');
    } finally {
      setUploadingReceipt(false);
    }
  };

  // Setup security Transaction PIN
  const handleSavePin = async () => {
    if (!securityPin || securityPin.length < 4) {
      Alert.alert('Invalid PIN', 'Please enter a valid 4–6 digit security PIN.');
      return;
    }

    setIsAppLoading(true);
    try {
      const payload = {
        pin: securityPin,
        currentPin: currentSecurityPin || undefined,
      };
      await api.post('/users/set-transaction-pin', payload);
      Alert.alert('Success', 'Transaction PIN has been updated successfully!');
      setPinSet(true);
      setShowPinModal(false);
      setSecurityPin('');
      setCurrentSecurityPin('');
    } catch (err: any) {
      Alert.alert('PIN Error', err.response?.data?.message || 'Could not update Transaction PIN.');
    } finally {
      setIsAppLoading(false);
    }
  };

  // Support thread message send
  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;
    setSendingChat(true);
    try {
      const { data } = await api.post('/support/messages', { message: chatInput });
      setChatMessages(prev => [...prev, data]);
      setChatInput('');
    } catch (err: any) {
      console.log('Error sending support message:', err);
    } finally {
      setSendingChat(false);
    }
  };

  const totalInvested = investments.reduce((sum, i) => sum + (i.amountToInvest || 0), 0);
  const totalExpectedROI = investments.filter(i => i.status === 'active' || i.status === 'approved').reduce((sum, i) => sum + (i.expectedROI || 0), 0);

  return (
    <SafeAreaView style={styles.appContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {isAppLoading ? (
          <View style={styles.loadingCenter}>
            <ActivityIndicator size="large" color="#de1f25" />
            <Text style={styles.loadingText}>Connecting to Living Vine...</Text>
          </View>
        ) : (
          <>
            {/* Onboarding View */}
            {appState === 'onboarding' && (
              <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.fullScreen}>
                <View style={styles.onboardingHeader}>
                  <Text style={styles.brandTitle}>LIVING VINE</Text>
                  <TouchableOpacity onPress={() => setAppState('auth')}>
                    <Text style={styles.skipBtn}>Skip</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.onboardingContent}>
                  <View style={styles.iconContainer}>
                    {onboardingSlides[onboardingIndex].icon}
                  </View>
                  <Text style={styles.onboardingTitle}>
                    {onboardingSlides[onboardingIndex].title}
                  </Text>
                  <Text style={styles.onboardingDesc}>
                    {onboardingSlides[onboardingIndex].desc}
                  </Text>
                </View>

                <View style={styles.onboardingFooter}>
                  <View style={styles.dotsRow}>
                    {onboardingSlides.map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.dot,
                          onboardingIndex === i ? styles.activeDot : null,
                        ]}
                      />
                    ))}
                  </View>

                  <TouchableOpacity style={styles.primaryButton} onPress={handleOnboardingNext}>
                    <Text style={styles.primaryButtonText}>
                      {onboardingIndex === onboardingSlides.length - 1 ? 'Get Started' : 'Next'}
                    </Text>
                    <ArrowRight size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}

            {/* Auth flow view */}
            {appState === 'auth' && (
              <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={styles.authWrapper}>
                  <Text style={styles.authLogo}>Living Vine Properties</Text>
                  
                  {authMode === 'login' && (
                    <View style={styles.formContainer}>
                      <Text style={styles.formTitle}>Welcome Back</Text>
                      <Text style={styles.formSubtitle}>Login to manage your yield profile</Text>

                      <View style={styles.inputWrapper}>
                        <Mail size={18} color="#94a3b8" style={styles.inputIcon} />
                        <TextInput
                          style={styles.inputField}
                          placeholder="Email Address"
                          placeholderTextColor="#94a3b8"
                          value={email}
                          onChangeText={setEmail}
                          autoCapitalize="none"
                          keyboardType="email-address"
                        />
                      </View>

                      <View style={styles.inputWrapper}>
                        <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
                        <TextInput
                          style={styles.inputField}
                          placeholder="Password"
                          placeholderTextColor="#94a3b8"
                          secureTextEntry={!showPassword}
                          value={password}
                          onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                          {showPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity style={styles.authPrimaryBtn} onPress={handleLogin}>
                        <Text style={styles.authPrimaryBtnText}>Login Account</Text>
                      </TouchableOpacity>

                      <View style={styles.authAltRow}>
                        <Text style={styles.authAltText}>Don't have an investor account? </Text>
                        <TouchableOpacity onPress={() => setAuthMode('register')}>
                          <Text style={styles.authLinkText}>Register</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {authMode === 'register' && (
                    <View style={styles.formContainer}>
                      <Text style={styles.formTitle}>Create Account</Text>
                      <Text style={styles.formSubtitle}>Join high-yield estate banking</Text>

                      <View style={styles.inputWrapper}>
                        <User size={18} color="#94a3b8" style={styles.inputIcon} />
                        <TextInput
                          style={styles.inputField}
                          placeholder="First Name"
                          placeholderTextColor="#94a3b8"
                          value={firstName}
                          onChangeText={setFirstName}
                        />
                      </View>

                      <View style={styles.inputWrapper}>
                        <User size={18} color="#94a3b8" style={styles.inputIcon} />
                        <TextInput
                          style={styles.inputField}
                          placeholder="Surname"
                          placeholderTextColor="#94a3b8"
                          value={surname}
                          onChangeText={setSurname}
                        />
                      </View>

                      <View style={styles.inputWrapper}>
                        <Mail size={18} color="#94a3b8" style={styles.inputIcon} />
                        <TextInput
                          style={styles.inputField}
                          placeholder="Email Address"
                          placeholderTextColor="#94a3b8"
                          value={email}
                          onChangeText={setEmail}
                          autoCapitalize="none"
                          keyboardType="email-address"
                        />
                      </View>

                      <View style={styles.inputWrapper}>
                        <Phone size={18} color="#94a3b8" style={styles.inputIcon} />
                        <TextInput
                          style={styles.inputField}
                          placeholder="Phone Number"
                          placeholderTextColor="#94a3b8"
                          value={phone}
                          onChangeText={setPhone}
                          keyboardType="phone-pad"
                        />
                      </View>

                      <View style={styles.inputWrapper}>
                        <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
                        <TextInput
                          style={styles.inputField}
                          placeholder="Strong Password"
                          placeholderTextColor="#94a3b8"
                          secureTextEntry={!showPassword}
                          value={password}
                          onChangeText={handlePasswordChange}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                          {showPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
                        </TouchableOpacity>
                      </View>

                      {passwordFeedback ? (
                        <Text style={[styles.passwordFeedback, passwordFeedback.includes('✅') ? styles.pwdStrong : styles.pwdWeak]}>
                          {passwordFeedback}
                        </Text>
                      ) : null}

                      <View style={styles.inputWrapper}>
                        <User size={18} color="#94a3b8" style={styles.inputIcon} />
                        <TextInput
                          style={styles.inputField}
                          placeholder="Referred By (Staff Email - Optional)"
                          placeholderTextColor="#94a3b8"
                          value={referredByEmail}
                          onChangeText={setReferredByEmail}
                          autoCapitalize="none"
                        />
                      </View>

                      <View style={styles.tcRow}>
                        <Switch
                          value={acceptTerms}
                          onValueChange={setAcceptTerms}
                          trackColor={{ false: '#e2e8f0', true: '#de1f25' }}
                          thumbColor="#fff"
                        />
                        <Text style={styles.tcLabelText}>I accept the </Text>
                        <TouchableOpacity onPress={() => setShowTermsModal(true)}>
                          <Text style={styles.tcLinkText}>Terms & Conditions</Text>
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity style={styles.authPrimaryBtn} onPress={handleRegister}>
                        <Text style={styles.authPrimaryBtnText}>Create Account</Text>
                      </TouchableOpacity>

                      <View style={styles.authAltRow}>
                        <Text style={styles.authAltText}>Already an investor? </Text>
                        <TouchableOpacity onPress={() => setAuthMode('login')}>
                          <Text style={styles.authLinkText}>Login</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {authMode === 'otp' && (
                    <View style={styles.formContainer}>
                      <Text style={styles.formTitle}>Verify Identity</Text>
                      <Text style={styles.formSubtitle}>We sent a verification code to {verificationEmail}</Text>

                      <View style={styles.inputWrapper}>
                        <Shield size={18} color="#94a3b8" style={styles.inputIcon} />
                        <TextInput
                          style={[styles.inputField, { letterSpacing: 8, fontSize: 18, fontWeight: '700' }]}
                          placeholder="OTP Code"
                          placeholderTextColor="#94a3b8"
                          value={otp}
                          onChangeText={setOtp}
                          maxLength={6}
                          keyboardType="number-pad"
                        />
                      </View>

                      <TouchableOpacity style={styles.authPrimaryBtn} onPress={handleOtpVerify}>
                        <Text style={styles.authPrimaryBtnText}>Verify OTP</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.resendBtn} onPress={handleResendOtp}>
                        <Text style={styles.resendBtnText}>Resend Code</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </Animated.View>
              </ScrollView>
            )}

            {/* Dashboard main view */}
            {appState === 'dashboard' && currentUser && (
              <View style={styles.dashboardContainer}>
                {/* Header */}
                <View style={styles.dashboardHeader}>
                  <View>
                    <Text style={styles.welcomeName}>Hi, {currentUser.firstName}</Text>
                    <Text style={styles.dashboardBadgeText}>{currentUser.role.toUpperCase()} PROFILE</Text>
                  </View>
                  <View style={styles.headerRightActions}>
                    <TouchableOpacity style={styles.headerIconBtn} onPress={() => fetchDashboardData()}>
                      <RefreshCw size={20} color="#0f172a" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIconBtn} onPress={() => setShowChatModal(true)}>
                      <MessageSquare size={20} color="#0f172a" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIconBtn} onPress={handleLogout}>
                      <LogOut size={20} color="#de1f25" />
                    </TouchableOpacity>
                  </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.dashScrollArea}>
                  
                  {/* Stats Balance Panel */}
                  <View style={styles.balanceCardWrapper}>
                    <View style={styles.balanceStatItem}>
                      <Text style={styles.statLabel}>Active Portfolio</Text>
                      <Text style={styles.statVal}>₦{totalInvested.toLocaleString()}</Text>
                    </View>
                    <View style={styles.balanceDivider} />
                    <View style={styles.balanceStatItem}>
                      <Text style={styles.statLabel}>Expected ROI</Text>
                      <Text style={[styles.statVal, { color: '#16a34a' }]}>₦{totalExpectedROI.toLocaleString()}</Text>
                    </View>
                  </View>

                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>My Wealth Plans</Text>
                    <TouchableOpacity onPress={() => setShowInvestModal(true)}>
                      <Text style={styles.sectionLinkBtn}>+ New Plan</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Plans horizontal swiper */}
                  {investments.length === 0 ? (
                    <View style={styles.emptyPlansBox}>
                      <Building size={40} color="#cbd5e1" />
                      <Text style={styles.emptyPlansText}>No active investments. Setup a yield plan now!</Text>
                    </View>
                  ) : (
                    <ScrollView
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.investmentsListContainer}
                    >
                      {investments.map((item, idx) => {
                        const statusColors = {
                          active: '#10b981',
                          approved: '#3b82f6',
                          reviewing: '#f59e0b',
                          liquidated: '#7c3aed',
                          declined: '#ef4444',
                        };
                        return (
                          <View key={item._id} style={styles.planCard}>
                            <View style={styles.cardHeader}>
                              <View>
                                <Text style={styles.planName}>{item.name}</Text>
                                <Text style={styles.planId}>ID: {item._id.slice(-6).toUpperCase()}</Text>
                              </View>
                              <Text style={[styles.statusBadge, { backgroundColor: statusColors[item.status as keyof typeof statusColors] || '#cbd5e1' }]}>
                                {item.status.toUpperCase()}
                              </Text>
                            </View>

                            <View style={styles.cardValueGrid}>
                              <View>
                                <Text style={styles.cardValueLabel}>Capital</Text>
                                <Text style={styles.cardValueAmt}>₦{item.amountToInvest.toLocaleString()}</Text>
                              </View>
                              <View style={{ alignItems: 'flex-end' }}>
                                <Text style={styles.cardValueLabel}>Expected ROI</Text>
                                <Text style={[styles.cardValueAmt, { color: '#16a34a' }]}>₦{item.expectedROI.toLocaleString()}</Text>
                              </View>
                            </View>

                            <View style={styles.cardFooterActions}>
                              {item.status === 'approved' && (
                                <TouchableOpacity
                                  style={styles.cardActionPrimaryBtn}
                                  onPress={() => {
                                    setSelectedInvestment(item);
                                    setShowReceiptModal(true);
                                  }}
                                >
                                  <Upload size={14} color="#fff" />
                                  <Text style={styles.cardActionPrimaryBtnText}>Attach Receipt</Text>
                                </TouchableOpacity>
                              )}
                              {item.status === 'active' && (
                                <View style={styles.timerRow}>
                                  <Clock size={12} color="#64748b" />
                                  <Text style={styles.timerText}>Active ({item.durationInMonths} Mo)</Text>
                                </View>
                              )}
                              {item.status === 'reviewing' && (
                                <View style={styles.timerRow}>
                                  <ActivityIndicator size="small" color="#f59e0b" style={{ marginRight: 4 }} />
                                  <Text style={styles.timerText}>Verifying Payment...</Text>
                                </View>
                              )}
                            </View>
                          </View>
                        );
                      })}
                    </ScrollView>
                  )}

                  {/* Action grid hub */}
                  <Text style={styles.sectionTitle}>Quick Hub</Text>
                  <View style={styles.quickGrid}>
                    <TouchableOpacity style={styles.gridBtn} onPress={() => setShowInvestModal(true)}>
                      <View style={[styles.gridIconCircle, { backgroundColor: 'rgba(222,31,37,0.1)' }]}>
                        <PlusCircle size={22} color="#de1f25" />
                      </View>
                      <Text style={styles.gridBtnText}>Invest Now</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.gridBtn} onPress={() => setShowPinModal(true)}>
                      <View style={[styles.gridIconCircle, { backgroundColor: 'rgba(79,70,229,0.1)' }]}>
                        <Shield size={22} color="#4f46e5" />
                      </View>
                      <Text style={styles.gridBtnText}>{pinSet ? 'Change PIN' : 'Setup PIN'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.gridBtn} onPress={() => setShowChatModal(true)}>
                      <View style={[styles.gridIconCircle, { backgroundColor: 'rgba(16,185,129,0.1)' }]}>
                        <MessageSquare size={22} color="#10b981" />
                      </View>
                      <Text style={styles.gridBtnText}>Support Chat</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.gridBtn} onPress={() => Alert.alert('Documents Support', 'Official documents and receipts can be downloaded directly from the main web portal.')}>
                      <View style={[styles.gridIconCircle, { backgroundColor: 'rgba(245,158,11,0.1)' }]}>
                        <FileText size={22} color="#f59e0b" />
                      </View>
                      <Text style={styles.gridBtnText}>Certificates</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Simple Audit notification row */}
                  {currentUser.accountOfficer && (
                    <View style={styles.officerDetailsBox}>
                      <Text style={styles.officerTitle}>Assigned Account Officer</Text>
                      <Text style={styles.officerName}>
                        {currentUser.accountOfficer.firstName} {currentUser.accountOfficer.surname}
                      </Text>
                      <Text style={styles.officerEmail}>{currentUser.accountOfficer.email} · {currentUser.accountOfficer.phoneNumber}</Text>
                    </View>
                  )}

                </ScrollView>
              </View>
            )}

            {/* MODAL: Terms and Conditions */}
            <Modal visible={showTermsModal} animationType="slide" transparent>
              <View style={styles.modalBg}>
                <View style={styles.modalContentLarge}>
                  <Text style={styles.modalHeaderTitle}>Terms & Conditions</Text>
                  <ScrollView style={styles.modalScrollBody}>
                    <Text style={styles.modalBodyText}>
                      Welcome to Living Vine Properties investor yield platform. By checking the registration terms checkbox, you agree to:
                      {"\n\n"}
                      1. Yield Investment Lock-in Period: Your selected investment wealth builder plan has a strict duration lock-in (e.g. 6 or 12 months) before liquidation is possible.
                      {"\n\n"}
                      2. Monthly ROI Payments: Returns are generated monthly based on the capital. Payouts are made directly to your registered domiciliation account.
                      {"\n\n"}
                      3. Compliance & KYC: Standard anti-money laundering compliance requires BVN and identity details.
                    </Text>
                  </ScrollView>
                  <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowTermsModal(false)}>
                    <Text style={styles.modalCloseBtnText}>Close & Accept</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* MODAL: Invest Now form */}
            <Modal visible={showInvestModal} animationType="slide" transparent>
              <View style={styles.modalBg}>
                <View style={styles.modalContentLarge}>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={styles.modalHeaderTitle}>Invest in Wealth Plan</Text>

                    <View style={styles.modalInputGroup}>
                      <Text style={styles.modalInputLabel}>Plan Category</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6 }}>
                        {['Yield Max Land Banking', 'Wealth Builder Plan', 'Short-Term Yield Plan'].map((p) => (
                          <TouchableOpacity
                            key={p}
                            style={[styles.planSelectorBadge, investPlanName === p ? styles.planSelectorBadgeActive : null]}
                            onPress={() => setInvestPlanName(p)}
                          >
                            <Text style={[styles.planSelectorText, investPlanName === p ? styles.planSelectorTextActive : null]}>
                              {p}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>

                    <View style={styles.modalInputGroup}>
                      <Text style={styles.modalInputLabel}>Capital (₦)</Text>
                      <TextInput
                        style={styles.modalInputField}
                        placeholder="e.g. 2,000,000"
                        placeholderTextColor="#94a3b8"
                        keyboardType="numeric"
                        value={investAmount}
                        onChangeText={setInvestAmount}
                      />
                    </View>

                    <View style={styles.modalInputGroup}>
                      <Text style={styles.modalInputLabel}>Duration (months)</Text>
                      <View style={styles.btnOptionsRow}>
                        {['3', '6', '12'].map((d) => (
                          <TouchableOpacity
                            key={d}
                            style={[styles.optionBtn, investDuration === d ? styles.optionBtnActive : null]}
                            onPress={() => setInvestDuration(d)}
                          >
                            <Text style={[styles.optionBtnText, investDuration === d ? styles.optionBtnTextActive : null]}>
                              {d} Months
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={styles.modalInputGroup}>
                      <Text style={styles.modalInputLabel}>Maturity Action</Text>
                      <View style={styles.btnOptionsRow}>
                        {['pay_roi_and_principal', 'reinvest_principal'].map((a) => (
                          <TouchableOpacity
                            key={a}
                            style={[styles.optionBtn, maturityAction === a ? styles.optionBtnActive : null]}
                            onPress={() => setMaturityAction(a)}
                          >
                            <Text style={[styles.optionBtnText, maturityAction === a ? styles.optionBtnTextActive : null]}>
                              {a === 'reinvest_principal' ? 'Reinvest Principal' : 'Payout ROI + Principal'}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Verification / KYC detail box */}
                    <Text style={styles.sectionDividerText}>KYC & Domiciliation Details</Text>

                    <View style={styles.modalInputGroup}>
                      <Text style={styles.modalInputLabel}>NIN Number (First-time save)</Text>
                      <TextInput
                        style={styles.modalInputField}
                        placeholder="11-digit National ID Number"
                        placeholderTextColor="#94a3b8"
                        keyboardType="numeric"
                        value={ninNumber}
                        onChangeText={setNinNumber}
                        maxLength={11}
                      />
                    </View>

                    <View style={styles.modalInputGroup}>
                      <Text style={styles.modalInputLabel}>BVN Number (Optional verification)</Text>
                      <TextInput
                        style={styles.modalInputField}
                        placeholder="11-digit Bank Verification Number"
                        placeholderTextColor="#94a3b8"
                        keyboardType="numeric"
                        value={bvnNumber}
                        onChangeText={setBvnNumber}
                        maxLength={11}
                      />
                    </View>

                    <View style={styles.modalInputGroup}>
                      <Text style={styles.modalInputLabel}>Contact Residential Address</Text>
                      <TextInput
                        style={styles.modalInputField}
                        placeholder="No. 12 Vine street, Lekki"
                        placeholderTextColor="#94a3b8"
                        value={contactAddress}
                        onChangeText={setContactAddress}
                      />
                    </View>

                    {/* ROI bank */}
                    <View style={styles.modalInputGroup}>
                      <Text style={styles.modalInputLabel}>Returns Bank Name</Text>
                      <TextInput
                        style={styles.modalInputField}
                        placeholder="e.g. Access Bank"
                        placeholderTextColor="#94a3b8"
                        value={userBankName}
                        onChangeText={setUserBankName}
                      />
                    </View>

                    <View style={styles.modalInputGroup}>
                      <Text style={styles.modalInputLabel}>Returns Account Number</Text>
                      <TextInput
                        style={styles.modalInputField}
                        placeholder="10-digit Account Number"
                        placeholderTextColor="#94a3b8"
                        keyboardType="numeric"
                        value={userAccountNumber}
                        onChangeText={setUserAccountNumber}
                        maxLength={10}
                      />
                    </View>

                    <View style={styles.modalInputGroup}>
                      <Text style={styles.modalInputLabel}>Returns Account Name</Text>
                      <TextInput
                        style={styles.modalInputField}
                        placeholder="Account holder's official name"
                        placeholderTextColor="#94a3b8"
                        value={userAccountName}
                        onChangeText={setUserAccountName}
                      />
                    </View>

                    {/* NOK */}
                    <Text style={styles.sectionDividerText}>Next of Kin Details</Text>

                    <View style={styles.modalInputGroup}>
                      <Text style={styles.modalInputLabel}>Next of Kin Full Name</Text>
                      <TextInput
                        style={styles.modalInputField}
                        placeholder="John Doe"
                        placeholderTextColor="#94a3b8"
                        value={nokName}
                        onChangeText={setNokName}
                      />
                    </View>

                    <View style={styles.modalInputGroup}>
                      <Text style={styles.modalInputLabel}>Relationship</Text>
                      <TextInput
                        style={styles.modalInputField}
                        placeholder="e.g. Brother, Spouse"
                        placeholderTextColor="#94a3b8"
                        value={nokRel}
                        onChangeText={setNokRel}
                      />
                    </View>

                    <View style={styles.modalInputGroup}>
                      <Text style={styles.modalInputLabel}>Next of Kin Phone Number</Text>
                      <TextInput
                        style={styles.modalInputField}
                        placeholder="Phone Number"
                        placeholderTextColor="#94a3b8"
                        keyboardType="phone-pad"
                        value={nokPhone}
                        onChangeText={setNokPhone}
                      />
                    </View>

                    <View style={styles.modalInputGroup}>
                      <Text style={styles.modalInputLabel}>Next of Kin Address</Text>
                      <TextInput
                        style={styles.modalInputField}
                        placeholder="Residential address"
                        placeholderTextColor="#94a3b8"
                        value={nokAddress}
                        onChangeText={setNokAddress}
                      />
                    </View>

                    <View style={styles.modalFooterRow}>
                      <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowInvestModal(false)}>
                        <Text style={styles.modalCancelBtnText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleCreateInvestmentPlan}>
                        <Text style={styles.modalSubmitBtnText}>Setup Plan</Text>
                      </TouchableOpacity>
                    </View>

                  </ScrollView>
                </View>
              </View>
            </Modal>

            {/* MODAL: PIN Setup Form */}
            <Modal visible={showPinModal} animationType="slide" transparent>
              <View style={styles.modalBg}>
                <View style={styles.modalContentSmall}>
                  <Text style={styles.modalHeaderTitle}>{pinSet ? 'Change Transaction PIN' : 'Setup Transaction PIN'}</Text>
                  
                  {pinSet && (
                    <View style={styles.modalInputGroup}>
                      <Text style={styles.modalInputLabel}>Current PIN</Text>
                      <TextInput
                        style={[styles.modalInputField, { letterSpacing: 8, fontSize: 18, textAlign: 'center' }]}
                        placeholder="Old PIN"
                        placeholderTextColor="#94a3b8"
                        keyboardType="numeric"
                        secureTextEntry
                        value={currentSecurityPin}
                        onChangeText={setCurrentSecurityPin}
                        maxLength={6}
                      />
                    </View>
                  )}

                  <View style={styles.modalInputGroup}>
                    <Text style={styles.modalInputLabel}>New PIN (4–6 Digits)</Text>
                    <TextInput
                      style={[styles.modalInputField, { letterSpacing: 8, fontSize: 18, textAlign: 'center' }]}
                      placeholder="New PIN"
                      placeholderTextColor="#94a3b8"
                      keyboardType="numeric"
                      secureTextEntry
                      value={securityPin}
                      onChangeText={setSecurityPin}
                      maxLength={6}
                    />
                  </View>

                  <View style={styles.modalFooterRow}>
                    <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowPinModal(false)}>
                      <Text style={styles.modalCancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSavePin}>
                      <Text style={styles.modalSubmitBtnText}>Save PIN</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            {/* MODAL: Support Thread Chat */}
            <Modal visible={showChatModal} animationType="slide" transparent>
              <View style={styles.modalBg}>
                <View style={styles.modalContentLarge}>
                  <View style={styles.chatHeaderRow}>
                    <Text style={styles.modalHeaderTitle}>Officer Live Support</Text>
                    <TouchableOpacity onPress={() => setShowChatModal(false)}>
                      <Text style={{ color: '#de1f25', fontWeight: 'bold' }}>Close</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <ScrollView style={styles.chatMessagesArea}>
                    {chatMessages.length === 0 ? (
                      <Text style={styles.emptyChatText}>No messages yet. Send a note to start the conversation.</Text>
                    ) : (
                      chatMessages.map((m) => {
                        const isUserMsg = m.sender?._id === currentUser._id || m.sender === currentUser._id;
                        return (
                          <View
                            key={m._id}
                            style={[
                              styles.chatMsgBubble,
                              isUserMsg ? styles.chatMsgUser : styles.chatMsgOfficer,
                            ]}
                          >
                            <Text style={[styles.chatMsgText, isUserMsg ? { color: '#fff' } : null]}>
                              {m.message}
                            </Text>
                            <Text style={[styles.chatMsgTime, isUserMsg ? { color: 'rgba(255,255,255,0.7)' } : null]}>
                              {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                          </View>
                        );
                      })
                    )}
                  </ScrollView>

                  <View style={styles.chatInputRow}>
                    <TextInput
                      style={styles.chatInputField}
                      placeholder="Type a message..."
                      placeholderTextColor="#94a3b8"
                      value={chatInput}
                      onChangeText={setChatInput}
                    />
                    <TouchableOpacity style={styles.chatSendBtn} disabled={sendingChat} onPress={handleSendChatMessage}>
                      {sendingChat ? <ActivityIndicator size="small" color="#fff" /> : <Send size={18} color="#fff" />}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            {/* MODAL: Attach Receipt details */}
            <Modal visible={showReceiptModal} animationType="slide" transparent>
              <View style={styles.modalBg}>
                <View style={styles.modalContentMedium}>
                  <Text style={styles.modalHeaderTitle}>Upload Payment Receipt</Text>
                  
                  {selectedInvestment && (
                    <View style={styles.receiptGuideWrapper}>
                      <Text style={styles.receiptGuideSubtitle}>Please transfer ₦{selectedInvestment.amountToInvest.toLocaleString()} to our Zenith bank account:</Text>
                      
                      <View style={styles.bankAccountDetailBox}>
                        <Text style={styles.bankDetailLabel}>BANK NAME</Text>
                        <Text style={styles.bankDetailVal}>{selectedInvestment.ceoPaymentAccount?.bankName || 'Zenith Bank'}</Text>
                        
                        <Text style={[styles.bankDetailLabel, { marginTop: 8 }]}>ACCOUNT NUMBER</Text>
                        <View style={styles.accNoRow}>
                          <Text style={[styles.bankDetailVal, { fontSize: 18, letterSpacing: 1 }]}>
                            {selectedInvestment.ceoPaymentAccount?.accountNumber || '1019283746'}
                          </Text>
                          <TouchableOpacity onPress={() => Alert.alert('Copied', 'Account number copied!')}>
                            <Copy size={16} color="#de1f25" />
                          </TouchableOpacity>
                        </View>

                        <Text style={[styles.bankDetailLabel, { marginTop: 8 }]}>ACCOUNT NAME</Text>
                        <Text style={styles.bankDetailVal}>{selectedInvestment.ceoPaymentAccount?.accountName || 'Living Vine Properties Ltd'}</Text>
                      </View>

                      {Platform.OS === 'web' ? (
                        <View style={styles.webUploadBox}>
                          <Text style={styles.modalInputLabel}>Select Transfer Receipt File</Text>
                          <input type="file" accept="image/*,.pdf" onChange={handleReceiptSelection} style={{ fontSize: 12, width: '100%' }} />
                        </View>
                      ) : (
                        <Text style={styles.receiptGuideNotice}>
                          Please open this page inside a mobile browser to select and upload your receipt document.
                        </Text>
                      )}
                    </View>
                  )}

                  <View style={styles.modalFooterRow}>
                    <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowReceiptModal(false)}>
                      <Text style={styles.modalCancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalSubmitBtn} disabled={uploadingReceipt} onPress={handleUploadReceipt}>
                      {uploadingReceipt ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.modalSubmitBtnText}>Upload Receipt</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 16,
  },
  fullScreen: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  onboardingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#de1f25',
    letterSpacing: 2,
  },
  skipBtn: {
    color: '#64748b',
    fontWeight: '600',
  },
  onboardingContent: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  iconContainer: {
    marginBottom: 32,
  },
  onboardingTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 12,
  },
  onboardingDesc: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  onboardingFooter: {
    alignItems: 'center',
    gap: 24,
    marginBottom: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
  },
  activeDot: {
    backgroundColor: '#de1f25',
    width: 20,
  },
  primaryButton: {
    backgroundColor: '#de1f25',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 28,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

  // Auth Styles
  authWrapper: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  authLogo: {
    fontSize: 24,
    fontWeight: '900',
    color: '#de1f25',
    textAlign: 'center',
    marginBottom: 32,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 16,
    backgroundColor: '#f8fafc',
  },
  inputIcon: {
    marginRight: 12,
  },
  inputField: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    height: '100%',
  },
  eyeBtn: {
    padding: 8,
  },
  passwordFeedback: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: -8,
    marginBottom: 16,
    paddingLeft: 4,
  },
  pwdStrong: {
    color: '#16a34a',
  },
  pwdWeak: {
    color: '#de1f25',
  },
  tcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  tcLabelText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 8,
  },
  tcLinkText: {
    fontSize: 12,
    color: '#de1f25',
    fontWeight: '700',
  },
  authPrimaryBtn: {
    backgroundColor: '#de1f25',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authPrimaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  authAltRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  authAltText: {
    fontSize: 13,
    color: '#64748b',
  },
  authLinkText: {
    fontSize: 13,
    color: '#de1f25',
    fontWeight: '700',
  },
  resendBtn: {
    alignSelf: 'center',
    marginTop: 16,
  },
  resendBtnText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 13,
  },

  // Dashboard Styles
  dashboardContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  welcomeName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  dashboardBadgeText: {
    fontSize: 10,
    color: '#de1f25',
    fontWeight: '800',
    letterSpacing: 1,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashScrollArea: {
    padding: 20,
    paddingBottom: 40,
  },
  balanceCardWrapper: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceStatItem: {
    flex: 1,
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statVal: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  balanceDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#334155',
    marginHorizontal: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginVertical: 12,
  },
  sectionLinkBtn: {
    color: '#de1f25',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyPlansBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  emptyPlansText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },
  investmentsListContainer: {
    paddingRight: 20,
    marginBottom: 12,
  },
  planCard: {
    width: SCREEN_WIDTH - 64,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  planId: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    fontSize: 9,
    fontWeight: '900',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  cardValueGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
  },
  cardValueLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  cardValueAmt: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  cardFooterActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  cardActionPrimaryBtn: {
    backgroundColor: '#de1f25',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  cardActionPrimaryBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },

  // Quick Hub Grid
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  gridBtn: {
    width: (SCREEN_WIDTH - 52) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  gridIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },

  // Officer details
  officerDetailsBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 8,
  },
  officerTitle: {
    fontSize: 10,
    color: '#de1f25',
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  officerName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  officerEmail: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },

  // Modal Layout
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.6)',
    justifyContent: 'flex-end',
  },
  modalContentLarge: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  modalContentMedium: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  modalContentSmall: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },
  modalScrollBody: {
    maxHeight: 280,
    marginBottom: 16,
  },
  modalBodyText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  modalCloseBtn: {
    backgroundColor: '#de1f25',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: '#fff',
    fontWeight: '700',
  },

  // Invest Modal Inside Form
  sectionDividerText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#de1f25',
    textTransform: 'uppercase',
    marginVertical: 14,
    letterSpacing: 0.5,
  },
  modalInputGroup: {
    marginBottom: 16,
  },
  modalInputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  planSelectorBadge: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  planSelectorBadgeActive: {
    backgroundColor: 'rgba(222,31,37,0.1)',
    borderColor: '#de1f25',
  },
  planSelectorText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  planSelectorTextActive: {
    color: '#de1f25',
    fontWeight: '700',
  },
  btnOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  optionBtnActive: {
    backgroundColor: 'rgba(222,31,37,0.1)',
    borderColor: '#de1f25',
  },
  optionBtnText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  optionBtnTextActive: {
    color: '#de1f25',
    fontWeight: '700',
  },
  modalInputField: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  modalFooterRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  modalCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelBtnText: {
    color: '#64748b',
    fontWeight: '700',
  },
  modalSubmitBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#de1f25',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSubmitBtnText: {
    color: '#fff',
    fontWeight: '700',
  },

  // Support Chat Modal Inside
  chatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    paddingBottom: 12,
    marginBottom: 12,
  },
  chatMessagesArea: {
    maxHeight: 300,
    marginBottom: 16,
  },
  emptyChatText: {
    fontSize: 12,
    color: '#cbd5e1',
    textAlign: 'center',
    paddingVertical: 32,
  },
  chatMsgBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: '80%',
  },
  chatMsgUser: {
    backgroundColor: '#de1f25',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
  },
  chatMsgOfficer: {
    backgroundColor: '#f1f5f9',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
  },
  chatMsgText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  chatMsgTime: {
    fontSize: 9,
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 4,
  },
  chatInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  chatInputField: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 13,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  chatSendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#de1f25',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Upload Receipt details
  receiptGuideWrapper: {
    marginBottom: 16,
  },
  receiptGuideSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 12,
  },
  bankAccountDetailBox: {
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  bankDetailLabel: {
    fontSize: 9,
    color: '#94a3b8',
    fontWeight: '700',
  },
  bankDetailVal: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '800',
    marginTop: 2,
  },
  accNoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  webUploadBox: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 12,
  },
  receiptGuideNotice: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },

  progressCircle: {
    borderColor: '#e2e8f0',
  },
});
