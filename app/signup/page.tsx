'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, Mail, User, Phone, Shield, Scale,
  BadgeHelp, Dumbbell, Leaf, Egg, Fish, CheckCircle, Mars, Venus, ChevronDown
} from 'lucide-react';
import { firebaseService, UserData } from '../../lib/firebaseService';
import toast, { Toaster } from 'react-hot-toast';
import { User as FirebaseUser } from 'firebase/auth';

type Sex = 'male' | 'female' | 'other' | '';
type Lifestyle = 'gym' | 'non-gym' | '';
type Diet = 'veg' | 'egg' | 'non-veg' | '';
type StepId = 'phone' | 'otp' | 'name' | 'email' | 'age' | 'sex' | 'weight' | 'lifestyle' | 'diet' | 'finish';

const C = { green: '#5c6e49', paper: '#f6f3ef', ink: '#0f0f10' };

export default function SignupWizard() {
  const style = useMemo(() => ({ ['--green' as any]: C.green, ['--paper' as any]: C.paper, ['--ink' as any]: C.ink }), []);
  const [step, setStep] = useState<StepId>('phone');
  const [submitting, setSubmitting] = useState(false);
  const [serverOk, setServerOk] = useState<boolean | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState<number>(25);
  const [sex, setSex] = useState<Sex>('');
  const [weight, setWeight] = useState<number>(70);
  const [lifestyle, setLifestyle] = useState<Lifestyle>('');
  const [diet, setDiet] = useState<Diet>('');

  // Initialize recaptcha on component mount
  useEffect(() => {
    try {
      firebaseService.initRecaptcha('recaptcha-container');
    } catch (error) {
      console.error('Failed to initialize recaptcha:', error);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      firebaseService.resetAuth();
    };
  }, []);

  // ---------- helpers ----------
  const digits10 = (s: string) => s.replace(/\D/g, '').slice(0, 10);
  const formatIN = (s: string) => {
    const d = digits10(s);
    return d.length > 5 ? `${d.slice(0, 5)} ${d.slice(5)}` : d;
  };

  // Format phone for Firebase (must include country code)
  const getFormattedPhone = () => `+91${digits10(phone)}`;

  // simple per-step validation
  const valid = {
    phone: digits10(phone).length === 10,
    otp: otp.length === 6,
    name: name.trim().length >= 2,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    age: age >= 12 && age <= 90,
    sex: !!sex,
    weight: weight >= 30 && weight <= 200,
    lifestyle: !!lifestyle,
    diet: !!diet,
  };

  const order: StepId[] = ['phone', 'otp', 'name', 'email', 'age', 'sex', 'weight', 'lifestyle', 'diet', 'finish'];
  const idx = order.indexOf(step);
  
  const goNext = () => {
    if (idx < order.length - 1) {
      setStep(order[idx + 1]);
    }
  };
  
  const goBack = () => {
    if (idx > 0) {
      // If going back from OTP, reset OTP state
      if (step === 'otp') {
        setOtpSent(false);
        setOtp('');
      }
      setStep(order[idx - 1]);
    }
  };

  // Send OTP
  const sendOTP = async () => {
    if (!valid.phone) return;
    
    setSendingOtp(true);
    try {
      await firebaseService.sendOTP(getFormattedPhone());
      setOtpSent(true);
      goNext(); // Move to OTP step
    } catch (error) {
      console.error('Failed to send OTP:', error);
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify OTP
  const verifyOTP = async () => {
    if (!valid.otp) return;
    
    setVerifyingOtp(true);
    try {
      const user = await firebaseService.verifyOTP(otp);
      if (user) {
        setFirebaseUser(user);
        goNext(); // Move to name step
      }
    } catch (error) {
      console.error('Failed to verify OTP:', error);
    } finally {
      setVerifyingOtp(false);
    }
  };

  // protein lane
  const protein = firebaseService.calculateProtein(weight, lifestyle);

  async function submitAll() {
    if (!firebaseUser) {
      toast.error('Authentication required. Please start over.');
      return;
    }

    setSubmitting(true);
    setServerOk(null);
    
    try {
      const userData: UserData = {
        phone: getFormattedPhone(),
        name: name.trim(),
        email: email.trim(),
        age,
        sex: sex as 'male' | 'female' | 'other',
        weight,
        lifestyle: lifestyle as 'gym' | 'non-gym',
        diet: diet as 'veg' | 'egg' | 'non-veg',
        proteinRange: protein,
      };

      await firebaseService.saveUserData(userData, firebaseUser.uid);
      setServerOk(true);
    } catch (error) {
      console.error('Failed to save user data:', error);
      setServerOk(false);
    } finally {
      setSubmitting(false);
    }
  }

  // ---------- shared shell ----------
  const Shell: React.FC<{
    icon: React.ReactNode;
    title: React.ReactNode;
    sub?: React.ReactNode;
    children?: React.ReactNode;
    hideNavigation?: boolean;
  }> = ({ icon, title, sub, children, hideNavigation = false }) => (
    <div className="relative mx-auto w-full max-w-[44rem] rounded-[28px] border border-[var(--ink)]/10 bg-white p-6 md:p-8 shadow-sm">
      <div className="mb-4 flex items-center gap-3 text-[var(--ink)]/80">
        <div className="inline-grid h-10 w-10 place-items-center rounded-full border border-[var(--ink)]/20">{icon}</div>
        <div className="h-2 w-2 rounded-full bg-[var(--ink)]/20" />
      </div>
      <h1 className="text-2xl md:text-4xl font-semibold text-[var(--ink)]">{title}</h1>
      {sub && <p className="mt-2 text-[15px] md:text-[16px] text-[var(--ink)]/70">{sub}</p>}
      <div className="mt-5">{children}</div>
      
      {!hideNavigation && (
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={goBack}
            disabled={idx === 0}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--ink)]/15 text-[var(--ink)]/70 disabled:opacity-40"
          >
            <ArrowLeft size={18} />
          </button>
          
          {step === 'phone' && (
            <button
              onClick={sendOTP}
              disabled={!valid.phone || sendingOtp}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-6 py-3 text-[var(--paper)] hover:bg-[var(--green)] transition disabled:bg-[var(--ink)]/40"
            >
              {sendingOtp ? 'Sending...' : 'Send OTP'} <ArrowRight size={18} />
            </button>
          )}
          
          {step === 'otp' && (
            <button
              onClick={verifyOTP}
              disabled={!valid.otp || verifyingOtp}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-6 py-3 text-[var(--paper)] hover:bg-[var(--green)] transition disabled:bg-[var(--ink)]/40"
            >
              {verifyingOtp ? 'Verifying...' : 'Verify OTP'} <ArrowRight size={18} />
            </button>
          )}
          
          {step !== 'phone' && step !== 'otp' && step !== 'finish' && (
            <button
              onClick={goNext}
              disabled={!valid[step as keyof typeof valid]}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--green)] transition disabled:bg-[var(--ink)]/40"
            >
              <ArrowRight size={18} />
            </button>
          )}
          
          {step === 'finish' && (
            <button
              onClick={submitAll}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-6 py-3 text-[var(--paper)] hover:bg-[var(--green)] transition disabled:bg-[var(--ink)]/40"
            >
              {submitting ? 'Saving...' : 'Complete Registration'} <ArrowRight size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)] px-4 py-8 md:py-12" style={style as any}>
      <Toaster position="top-center" />
      
      {/* Hidden recaptcha container */}
      <div id="recaptcha-container" style={{ display: 'none' }}></div>
      
      <div className="mx-auto mb-5 max-w-[44rem]">
        <a href="/" className="text-sm text-[var(--ink)]/70 hover:text-[var(--ink)]">← Back to home</a>
      </div>

      <AnimatePresence mode="wait">
        {/* PHONE */}
        {step === 'phone' && (
          <motion.section key="phone" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Shell icon={<Phone size={18} />} title="What's your phone number?" sub="We'll send an OTP to verify your number.">
              <PhoneField value={phone} onChange={(s) => setPhone(formatIN(s))} />
            </Shell>
          </motion.section>
        )}

        {/* OTP */}
        {step === 'otp' && (
          <motion.section key="otp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Shell icon={<Phone size={18} />} title="Enter OTP" sub={`We sent a 6-digit code to ${getFormattedPhone()}`}>
              <OTPField value={otp} onChange={setOtp} />
              <div className="mt-4 text-center">
                <button
                  onClick={sendOTP}
                  disabled={sendingOtp}
                  className="text-sm text-[var(--green)] hover:underline disabled:opacity-50"
                >
                  {sendingOtp ? 'Resending...' : 'Resend OTP'}
                </button>
              </div>
            </Shell>
          </motion.section>
        )}

        {/* NAME */}
        {step === 'name' && (
          <motion.section key="name" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Shell icon={<User size={18} />} title="What's your name?" sub="First name is required; last name optional.">
              <input
                autoFocus
                className="w-full border-b border-[var(--ink)]/25 bg-transparent px-1 py-3 text-lg outline-none placeholder:text-[var(--ink)]/30"
                placeholder="First Last"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Shell>
          </motion.section>
        )}

        {/* EMAIL */}
        {step === 'email' && (
          <motion.section key="email" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Shell icon={<Mail size={18} />} title="Provide your email" sub="We'll send early-access info and tips.">
              <input
                autoFocus
                type="email"
                className="w-full border-b border-[var(--ink)]/25 bg-transparent px-1 py-3 text-lg outline-none placeholder:text-[var(--ink)]/30"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Shell>
          </motion.section>
        )}

        {/* AGE (METER) */}
        {step === 'age' && (
          <motion.section key="age" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Shell icon={<BadgeHelp size={18} />} title="How old are you?">
              <Meter min={12} max={90} step={1} value={age} onChange={setAge} unit="yrs" />
            </Shell>
          </motion.section>
        )}

        {/* SEX */}
        {step === 'sex' && (
          <motion.section key="sex" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Shell icon={<Shield size={18} />} title="How do you identify?">
              <Segment
                value={sex}
                onChange={(v) => setSex(v as Sex)}
                items={[
                  { value: 'male', label: 'Male', icon: <Mars size={16} /> },
                  { value: 'female', label: 'Female', icon: <Venus size={16} /> },
                  { value: 'other', label: 'Other', icon: <BadgeHelp size={16} /> },
                ]}
              />
            </Shell>
          </motion.section>
        )}

        {/* WEIGHT (METER) */}
        {step === 'weight' && (
          <motion.section key="weight" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Shell icon={<Scale size={18} />} title="What's your weight?" sub="Slide to set it — we'll estimate your daily protein lane.">
              <Meter min={30} max={200} step={0.5} value={weight} onChange={setWeight} unit="kg" />
            </Shell>
          </motion.section>
        )}

        {/* LIFESTYLE */}
        {step === 'lifestyle' && (
          <motion.section key="lifestyle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Shell icon={<Dumbbell size={18} />} title="Lifestyle">
              <Segment
                value={lifestyle}
                onChange={(v) => setLifestyle(v as Lifestyle)}
                items={[
                  { value: 'gym', label: 'Gym goer', icon: <Dumbbell size={16} /> },
                  { value: 'non-gym', label: 'Not a gym goer', icon: <BadgeHelp size={16} /> },
                ]}
              />
            </Shell>
          </motion.section>
        )}

        {/* DIET */}
        {step === 'diet' && (
          <motion.section key="diet" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Shell icon={<Leaf size={18} />} title="What's your diet?" sub="Tap one — you can change this later.">
              <Segment
                value={diet}
                onChange={(v) => setDiet(v as Diet)}
                items={[
                  { value: 'veg', label: 'Veg', icon: <Leaf size={16} /> },
                  { value: 'egg', label: 'Egg', icon: <Egg size={16} /> },
                  { value: 'non-veg', label: 'Non-veg', icon: <Fish size={16} /> },
                ]}
              />
            </Shell>
          </motion.section>
        )}

        {/* FINISH */}
        {step === 'finish' && (
          <motion.section key="finish" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="mx-auto w-full max-w-[44rem] rounded-[28px] border border-[var(--ink)]/10 bg-white p-6 md:p-8 shadow-sm">
              <h1 className="text-2xl md:text-4xl font-semibold text-[var(--ink)]">Your Protein Lane</h1>
              <p className="mt-2 text-[15px] md:text-[16px] text-[var(--ink)]/70">Based on your weight and lifestyle:</p>

              <div className="mt-6 rounded-2xl border border-[var(--ink)]/10 bg-[var(--paper)] p-5">
                <div className="text-3xl md:text-4xl font-semibold text-[var(--ink)]">{protein.min}–{protein.max} g / day</div>
                <div className="mt-3 h-2 w-full rounded-full bg-[var(--ink)]/10">
                  <motion.div
                    className="h-2 rounded-full bg-[var(--green)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (protein.max / (2.2 * weight)) * 100)}%` }}
                    transition={{ type: 'spring', stiffness: 140, damping: 18 }}
                  />
                </div>
                <p className="mt-2 text-xs text-[var(--ink)]/60">
                  Min uses 0.8 g/kg; Max uses {lifestyle === 'gym' ? '2.0' : '1.2'} g/kg. Educational, not medical advice.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--ink)]/15 px-3 py-1">
                  <CheckCircle size={16} /> Phone Verified
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--ink)]/15 px-3 py-1">
                  <CheckCircle size={16} /> Profile Complete
                </span>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={goBack}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--ink)]/15 text-[var(--ink)]/70"
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  onClick={submitAll}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-6 py-3 text-[var(--paper)] hover:bg-[var(--green)] transition disabled:bg-[var(--ink)]/40"
                >
                  {submitting ? 'Saving...' : 'Complete Registration'} <ArrowRight size={18} />
                </button>
              </div>

              {serverOk === true && (
                <div className="mt-5 rounded-2xl border border-[var(--green)]/40 bg-[var(--green)]/10 p-4 text-[var(--ink)]">
                  🎉 <strong>Welcome to Protein Guru!</strong> Your daily protein lane is <strong>{protein.min}–{protein.max}g</strong>.
                  We're going live soon — you'll get an invite the moment we launch, and Protein Guru will help you hit that number every day. 💪
                </div>
              )}
              {serverOk === false && (
                <div className="mt-4 rounded-2xl border border-red-300 bg-red-50 p-3 text-red-700">
                  Oops, couldn't save right now. Try again in a bit.
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}

/* ========= UI Components ========= */

function PhoneField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 rounded-xl border border-[var(--ink)]/15 px-3 py-3">
        🇮🇳 <ChevronDown size={14} className="opacity-60" />
        <span className="opacity-80">+91</span>
      </div>
      <input
        ref={ref}
        autoFocus
        inputMode="tel"
        className="flex-1 border-b border-[var(--ink)]/25 bg-transparent px-2 py-3 text-lg outline-none placeholder:text-[var(--ink)]/30"
        placeholder="81759 03369"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function OTPField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, newValue: string) => {
    if (newValue.length > 1) return; // Only allow single digits
    
    const newOtp = value.split('');
    newOtp[index] = newValue;
    const updatedOtp = newOtp.join('');
    
    onChange(updatedOtp);
    
    // Auto-focus next input
    if (newValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-3 justify-center">
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="h-14 w-12 text-center text-xl font-semibold border-2 border-[var(--ink)]/20 rounded-lg focus:border-[var(--green)] focus:outline-none transition-colors"
        />
      ))}
    </div>
  );
}

function Segment<T extends string>({
  value,
  onChange,
  items,
}: {
  value: T | '';
  onChange: (v: T) => void;
  items: { value: T; label: string; icon?: React.ReactNode }[];
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item) => {
        const active = value === item.value;
        return (
          <button
            key={item.value as string}
            type="button"
            onClick={() => onChange(item.value)}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm md:text-base transition ${
              active
                ? 'border-[var(--green)] bg-[var(--green)]/10 text-[var(--ink)]'
                : 'border-[var(--ink)]/15 text-[var(--ink)]/80 hover:bg-[var(--ink)]/5'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

/** Pretty slider with animated fill + value readout */
function Meter({
  min,
  max,
  step,
  value,
  onChange,
  unit,
}: {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (n: number) => void;
  unit: string;
}) {
  const pct = Math.round(((value - min) / (max - min)) * 100);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[var(--ink)]/70 text-sm">
          {min}
          {unit}
        </span>
        <span className="rounded-full bg-[var(--ink)]/5 px-3 py-1 text-[var(--ink)] text-sm font-medium">
          {value}
          {unit}
        </span>
        <span className="text-[var(--ink)]/70 text-sm">
          {max}
          {unit}
        </span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-[var(--ink)]/10">
        <motion.div
          className="absolute left-0 top-0 h-full bg-[var(--green)]"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 160, damping: 18 }}
        />
        {/* transparent input on top for native drag/keyboard support */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-3 w-full appearance-none bg-transparent"
        />
      </div>
    </div>
  );
}