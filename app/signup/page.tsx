'use client';

import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, Mail, User, Phone, Shield, Scale,
  BadgeHelp, Dumbbell, Leaf, Egg, Fish, CheckCircle, Mars, Venus
} from 'lucide-react';
import { firebaseService, UserData } from '../../lib/firebaseService';
import toast, { Toaster } from 'react-hot-toast';
import { User as FirebaseUser } from 'firebase/auth';

type Sex = 'male' | 'female' | 'other' | '';
type Lifestyle = 'gym' | 'non-gym' | '';
type Diet = 'veg' | 'egg' | 'non-veg' | '';
type StepId = 'google' | 'details' | 'age' | 'sex' | 'lifestyle' | 'diet' | 'finish';

const C = { green: '#5c6e49', paper: '#f6f3ef', ink: '#0f0f10' };

/* =========================
   TOP-LEVEL COMPONENTS
   (do NOT define inside SignupWizard)
   ========================= */

const Shell = React.memo(function Shell({
  icon,
  title,
  sub,
  children,
  hideNavigation,
  onBack,
  onNext,
  canBack,
  canNext,
  isFinish,
  onFinish,
  submitting,
}: {
  icon: React.ReactNode;
  title: React.ReactNode;
  sub?: React.ReactNode;
  children?: React.ReactNode;
  hideNavigation?: boolean;
  onBack?: () => void;
  onNext?: () => void;
  canBack?: boolean;
  canNext?: boolean;
  isFinish?: boolean;
  onFinish?: () => void;
  submitting?: boolean;
}) {
  return (
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
            onClick={onBack}
            disabled={!canBack}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--ink)]/15 text-[var(--ink)]/70 disabled:opacity-40"
          >
            <ArrowLeft size={18} />
          </button>

          {!isFinish ? (
            <button
              onClick={onNext}
              disabled={!canNext}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-6 py-3 text-[var(--paper)] hover:bg-[var(--green)] hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:bg-[var(--ink)]/40 disabled:transform-none disabled:shadow-none"
            >
              Continue <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={onFinish}
              disabled={!!submitting}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-6 py-3 text-[var(--paper)] hover:bg-[var(--green)] hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:bg-[var(--ink)]/40 disabled:transform-none disabled:shadow-none"
            >
              {submitting ? 'Saving...' : 'Complete Registration'} <ArrowRight size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
});

const PhoneInput = React.memo(function PhoneInput({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  className: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  // simple formatter: adds a space after 5 digits for readability
  const formatDisplay = (digits: string) =>
    digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // keep only digits, clamp to 10
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    onChange(digits);

    // After React updates the value, push the caret to the end so typing flows naturally
    const el = inputRef.current;
    if (!el) return;
    const formatted = formatDisplay(digits);
    requestAnimationFrame(() => {
      try {
        const end = formatted.length;
        el.setSelectionRange(end, end);
      } catch {}
    });
  };

  return (
    <input
      ref={inputRef}
      type="tel"
      inputMode="numeric"
      autoComplete="tel"
      pattern="[0-9]*"
      className={className}
      placeholder="98765 43210"
      value={formatDisplay(value)}
      onChange={handleChange}
      maxLength={11} // 10 digits + 1 space
    />
  );
});
PhoneInput.displayName = "PhoneInput";


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

/* =========================
   MAIN PAGE
   ========================= */

export default function SignupWizard() {
  const style = useMemo(
    () => ({ ['--green' as any]: C.green, ['--paper' as any]: C.paper, ['--ink' as any]: C.ink }),
    []
  );
  const [step, setStep] = useState<StepId>('google');
  const [submitting, setSubmitting] = useState(false);
  const [serverOk, setServerOk] = useState<boolean | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState<number>(25);
  const [sex, setSex] = useState<Sex>('');
  const [weight, setWeight] = useState<number>(70);
  const [lifestyle, setLifestyle] = useState<Lifestyle>('');
  const [diet, setDiet] = useState<Diet>('');

  useEffect(() => () => { firebaseService.resetAuth(); }, []);

  // styles for phone input (changes className only, safe)
  const phoneInputClass = useMemo(() => {
    const base = 'flex-1 border-b bg-transparent px-1 py-3 text-lg outline-none placeholder:text-[var(--ink)]/30 transition-all duration-200';
    const state = phone.length === 10
      ? 'border-[var(--green)] text-[var(--green)]'
      : 'border-[var(--ink)]/25 focus:border-[var(--green)]';
    return `${base} ${state}`;
  }, [phone.length]);

  const order: StepId[] = ['google', 'details', 'age', 'sex', 'lifestyle', 'diet', 'finish'];
  const idx = order.indexOf(step);
  const goNext = () => { if (idx < order.length - 1) setStep(order[idx + 1]); };
  const goBack = () => { if (idx > 0) setStep(order[idx - 1]); };

  // Google Sign In
  const signInWithGoogle = async () => {
    setSubmitting(true);
    try {
      const user = await firebaseService.signInWithGoogle();
      if (user) {
        setFirebaseUser(user);
        if (user.displayName) setName(user.displayName);
        if (user.email) setEmail(user.email);
        goNext();
      }
    } catch (error) {
      console.error('Failed to sign in with Google:', error);
    } finally {
      setSubmitting(false);
    }
  };

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
        phone: `+91${phone}`,
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

      setTimeout(() => { window.location.href = '/'; }, 2500);
    } catch (error) {
      console.error('Failed to save user data:', error);
      setServerOk(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)] px-4 py-8 md:py-12" style={style as any}>
      <Toaster position="top-center" />

      <div className="mx-auto mb-5 max-w-[44rem]">
        <a href="/" className="text-sm text-[var(--ink)]/70 hover:text-[var(--ink)]">← Back to home</a>
      </div>

      <AnimatePresence mode="sync">
        {/* GOOGLE SIGN IN */}
        {step === 'google' && (
          <motion.section key="google" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Shell
              icon={<User size={18} />}
              title="Welcome to Protein Guru!"
              sub="Sign in with Google to get started."
              onBack={goBack}
              canBack={idx !== 0}
              onNext={() => {}}
              canNext={false}
            >
              <button
                onClick={signInWithGoogle}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 hover:shadow-md transform hover:scale-[1.01] transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:shadow-none"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {submitting ? 'Signing in...' : 'Continue with Google'}
              </button>
            </Shell>
          </motion.section>
        )}

        {/* DETAILS */}
        {step === 'details' && (
          <motion.section key="details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Shell
              icon={<User size={18} />}
              title="Complete your profile"
              sub="Add your name and phone number to continue."
              onBack={goBack}
              canBack={idx !== 0}
              onNext={() => setStep('age')}
              canNext={!!name.trim() && phone.length === 10}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--ink)]/70 mb-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full border-b border-[var(--ink)]/25 bg-transparent px-1 py-3 text-lg outline-none placeholder:text-[var(--ink)]/30 focus:border-[var(--green)] transition-colors"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--ink)]/70 mb-1">Phone Number</label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-3 text-lg text-[var(--ink)]/80">
                      <span className="text-lg">🇮🇳</span>
                      <span className="font-medium">+91</span>
                    </div>
                    <PhoneInput value={phone} onChange={setPhone} className={phoneInputClass} />
                    {phone.length === 10 && <span className="ml-2 text-[var(--green)]">✓</span>}
                  </div>
                </div>
              </div>
            </Shell>
          </motion.section>
        )}

        {/* AGE */}
        {step === 'age' && (
          <motion.section key="age" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Shell
              icon={<Scale size={18} />}
              title="What's your age and weight?"
              sub="This helps us calculate your protein needs."
              onBack={goBack}
              canBack
              onNext={() => setStep('sex')}
              canNext={!!age && age >= 10 && age <= 100 && !!weight && weight >= 30 && weight <= 200}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-[var(--ink)]/70 mb-1">Age (years)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g., 25"
                    min={10}
                    max={100}
                    step={1}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full border-b border-[var(--ink)]/25 bg-transparent px-1 py-3 text-lg outline-none placeholder:text-[var(--ink)]/30 focus:border-[var(--green)] transition-colors"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-[var(--ink)]/70 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="e.g., 62.5"
                    min={30}
                    max={200}
                    step={0.1}
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full border-b border-[var(--ink)]/25 bg-transparent px-1 py-3 text-lg outline-none placeholder:text-[var(--ink)]/30 focus:border-[var(--green)] transition-colors"
                  />
                </div>
              </div>
            </Shell>
          </motion.section>
        )}

        {/* SEX */}
        {step === 'sex' && (
          <motion.section key="sex" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Shell
              icon={<Shield size={18} />}
              title="How do you identify?"
              onBack={goBack}
              canBack
              onNext={() => setStep('lifestyle')}
              canNext={!!sex}
            >
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

        {/* LIFESTYLE */}
        {step === 'lifestyle' && (
          <motion.section key="lifestyle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Shell
              icon={<Dumbbell size={18} />}
              title="Lifestyle"
              onBack={goBack}
              canBack
              onNext={() => setStep('diet')}
              canNext={!!lifestyle}
            >
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
            <Shell
              icon={<Leaf size={18} />}
              title="What's your diet?"
              sub="Tap one — you can change this later."
              onBack={goBack}
              canBack
              onNext={() => setStep('finish')}
              canNext={!!diet}
            >
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
                <button onClick={goBack} className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--ink)]/15 text-[var(--ink)]/70">
                  <ArrowLeft size={18} />
                </button>
                <button
                  onClick={submitAll}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-6 py-3 text-[var(--paper)] hover:bg-[var(--green)] hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:bg-[var(--ink)]/40 disabled:transform-none disabled:shadow-none"
                >
                  {submitting ? 'Saving...' : 'Complete Registration'} <ArrowRight size={18} />
                </button>
              </div>

              {serverOk === true && (
                <div className="mt-5 rounded-2xl border border-[var(--green)]/40 bg-[var(--green)]/10 p-4 text-[var(--ink)]">
                  🎉 <strong>Welcome to Protein Guru!</strong> Your daily protein lane is <strong>{protein.min}–{protein.max}g</strong>.
                  <br /><br />
                  We're going live soon — you'll get an invite the moment we launch, and Protein Guru will help you hit that number every day. 💪
                  <br /><br />
                  <span className="text-sm opacity-75">Redirecting to homepage in a few seconds...</span>
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
