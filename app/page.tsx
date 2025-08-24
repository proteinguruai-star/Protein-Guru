"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  MessageCircle,
  Leaf,
  ShoppingCart,
  Tag,
  Sparkles,
  UsersRound,
  Target,
  ListChecks,
  Share2,
  Menu,
  X,
  Egg,
  Fish,
  IndianRupee
} from "lucide-react";

// Protein Guru.ai — Lumio/Forai-inspired landing (icons + extra responsiveness)
// Palette: Green #5c6e49, Paper #f6f3ef, Ink #0f0f10
// Paste into app/page.tsx. Also run once:  npm i framer-motion recharts lucide-react

// ===== Brand + palette =====
const BRAND = {
  name: "Protein Guru.ai",
  tagline: "India’s protein co‑pilot",
  waitlistUrl: "/signup", // point to your embedded Google Form route
  contactEmail: "hello@proteinguru.ai",
  whatsappShare:
    "https://wa.me/?text=" +
    encodeURIComponent(
      "Protein Guru.ai — a chat‑first nutrition co‑pilot that plans budget‑friendly, high‑protein Indian meals. Join the waitlist at proteinguru.ai"
    ),
};

const C = { green: "#5c6e49", paper: "#f6f3ef", ink: "#0f0f10" } as const;

// ===== Utilities =====
const Container = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
);

const Section = ({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) => (
  <section id={id} data-section={id} className={`py-16 md:py-24 lg:py-28 scroll-mt-24 ${className}`}>{children}</section>
);

function Button({ children, href, variant = "primary", className = "", onClick }:{ children: React.ReactNode; href?: string; variant?: "primary"|"secondary"|"ghost"; className?: string; onClick?: () => void }){
  // Forai/Lumio‑like buttons: pill, black primary → green on hover, outline secondary → green on hover
  const base = "group relative inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 md:px-6 md:py-3 text-sm md:text-[15px] font-medium transition-all duration-200 active:translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ring-offset-[var(--paper)]";
  const styles =
    variant === "primary"
      ? "bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--green)] hover:text-[var(--paper)] hover:shadow-[0_12px_26px_rgba(92,110,73,0.28)] focus-visible:ring-[var(--green)]"
      : variant === "secondary"
      ? "border border-[var(--ink)]/15 text-[var(--ink)] hover:bg-[var(--green)] hover:text-[var(--paper)] hover:border-[var(--green)] focus-visible:ring-[var(--green)]"
      : "text-[var(--ink)]/80 hover:text-[var(--ink)]";
  const inner = (
    <>
      <span className="transition-transform group-hover:-translate-y-0.5">{children}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" className="-mr-1 opacity-80 transition-transform group-hover:translate-x-0.5" fill="none" aria-hidden>
        <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </>
  );
  if (href) return <a className={`${base} ${styles} ${className}`} href={href} target={href.startsWith("#")?"_self":"_blank"} rel="noreferrer">{inner}</a>;
  return <button className={`${base} ${styles} ${className}`} onClick={onClick}>{inner}</button>;
}

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    whileHover={{ y: -6 }}
    whileTap={{ y: -2 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    className={`group relative overflow-hidden rounded-3xl border border-[var(--ink)]/10 bg-white p-5 md:p-6 shadow-[0_1px_0_rgba(15,15,16,0.06)] transition will-change-transform hover:shadow-[0_16px_32px_rgba(15,15,16,0.08)] ${className}`}
  >
    {children}
  </motion.div>
);

const H2 = ({ children }: { children: React.ReactNode }) => (
  <motion.h2
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="text-balance text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight tracking-tight text-[var(--ink)]"
  >
    {children}
  </motion.h2>
);

const Sub = ({ children }: { children: React.ReactNode }) => (
  <motion.p
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: 0.05 }}
    className="mt-3 md:mt-4 max-w-2xl text-pretty text-[15px] md:text-lg text-[var(--ink)]/70"
  >
    {children}
  </motion.p>
);

function Divider({ vertical=false }:{ vertical?: boolean }){
  return vertical ? (
    <div className="hidden lg:block lg:h-full lg:w-px lg:bg-[var(--ink)]/10" />
  ) : (
    <div className="my-10 md:my-12 h-px w-full bg-[var(--ink)]/10" />
  );
}

function IconCircle({ children }:{ children: React.ReactNode }){
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--green)]/12 text-[var(--green)]">
      {children}
    </span>
  );
}

// ===== Active link highlighting =====
function useActiveSection(ids: string[]){
  const [active, setActive] = useState<string>(ids[0] ?? "");
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.getAttribute("data-section") || ""); });
    }, { threshold: 0.25 });
    ids.forEach((id) => { const el = document.querySelector(`[data-section="${id}"]`); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [ids]);
  return active;
}

// ===== Nav (with mobile menu) =====
function Nav(){
  const ids = ["about","insights","steps","why","perks","faq"]; // include insights
  const active = useActiveSection(ids);
  const links = [
    { href: "#about", label: "About" },
    { href: "#insights", label: "Data" },
    { href: "#steps", label: "Steps" },
    { href: "#why", label: "Why us" },
    { href: "#perks", label: "Perks" },
    { href: "#faq", label: "FAQ" },
  ];
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--ink)]/10 bg-[var(--paper)]/90 backdrop-blur supports-[backdrop-filter]:bg-[var(--paper)]/70">
      <Container>
        <div className="flex h-14 md:h-16 items-center justify-between">
          <a href="#top" className="flex items-center gap-2 font-semibold text-[var(--ink)]">
            <span className="inline-grid h-8 w-8 place-items-center rounded-xl bg-[var(--green)] text-[var(--paper)] font-bold">PG</span>
            <span className="hidden sm:block">{BRAND.name}</span>
          </a>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            {links.map((l) => (
              <a key={l.href} href={l.href}
                 className={`relative px-1 py-1 text-[var(--ink)]/75 hover:text-[var(--ink)] ${active === l.href.replace('#','') ? 'text-[var(--ink)]' : ''}`}>
                <span>{l.label}</span>
                <span className={`pointer-events-none absolute -bottom-1 left-0 h-[2px] w-full rounded bg-[var(--green)] transition ${active === l.href.replace('#','') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
              </a>
            ))}
            <Button href={BRAND.waitlistUrl}>Be the first to test</Button>
          </nav>
          <div className="md:hidden flex items-center gap-3">
            <Button href={BRAND.waitlistUrl} className="hidden sm:inline-flex">Be first</Button>
            <button aria-label="Open menu" onClick={() => setOpen(true)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--ink)]/15 text-[var(--ink)]/80">
              <Menu size={18} />
            </button>
          </div>
        </div>
      </Container>
      {/* Mobile overlay menu */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: open ? 1 : 0 }}
        className={`fixed inset-0 z-50 bg-[var(--paper)]/95 backdrop-blur ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        <Container>
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-[var(--ink)]">
              <span className="inline-grid h-8 w-8 place-items-center rounded-xl bg-[var(--green)] text-[var(--paper)] font-bold">PG</span>
              {BRAND.name}
            </div>
            <button aria-label="Close menu" onClick={() => setOpen(false)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--ink)]/15 text-[var(--ink)]/80"><X size={18}/></button>
          </div>
          <div className="grid gap-2 py-4">
            {links.map(l => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-lg text-[var(--ink)] hover:bg-[var(--ink)]/5">{l.label}</a>
            ))}
            <div className="pt-2">
              <Button href={BRAND.waitlistUrl} className="w-full">Be the first to test</Button>
            </div>
          </div>
        </Container>
      </motion.div>
    </header>
  );
}

// ===== Hero (split later for tablets: single column until lg) =====
function Hero(){
  return (
    <Section id="top" className="pt-0 md:pt-1">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-[20px] md:rounded-[26px] border border-[var(--ink)]/10 bg-white p-5 md:p-8 lg:p-10 shadow-[0_2px_0_rgba(15,15,16,0.06)]"
        >
          <div className="grid items-start gap-5 md:gap-8 lg:gap-10 lg:grid-cols-[1.06fr,0.94fr]">
            {/* Left: Headline + CTAs (no chips, no budget here) */}
            <div className="flex flex-col justify-center">
              <div className="mb-2 md:mb-3 inline-flex items-center gap-2 text-xs text-[var(--ink)]/60">
                <span className="h-2 w-2 rounded-full bg-[var(--green)]" /> Beta • Chat‑first nutrition
              </div>
              <h1 className="text-balance text-3xl md:text-5xl lg:text-6xl font-semibold leading-[1.07] tracking-tight text-[var(--ink)]">
                Functions of your diet, simplified.
              </h1>
              <p className="mt-3 md:mt-4 max-w-xl text-pretty text-[15px] md:text-lg text-[var(--ink)]/75">
                Plan Indian meals around your protein goal and <strong className="text-[var(--ink)]">habits</strong>. One tap to share a grocery checklist.
              </p>
              <div className="mt-5 md:mt-6 flex flex-wrap items-center gap-3">
                <Button href={BRAND.waitlistUrl} variant="primary">Be the first to test</Button>
                <Button href="#about" variant="secondary">Learn more</Button>
              </div>
            </div>

            {/* Right: Micro features inside hero */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={{ hidden:{}, show:{ transition:{ staggerChildren: 0.08, delayChildren: 0.05 } } }}
              className="flex flex-col gap-3"
            >
              <FeatureTile title="Budget Mode" subtitle="₹/day cap" icon={<IndianRupee size={18}/> }>
                <div className="flex items-center gap-2">
                  {["₹200","₹250","₹300"].map((n) => (
                    <button key={n} className="rounded-full border border-[var(--ink)]/10 bg-white px-3 py-1 text-xs font-medium text-[var(--ink)]/80 transition hover:-translate-y-0.5 hover:bg-[var(--green)]/10">{n}</button>
                  ))}
                </div>
              </FeatureTile>
              <div className="grid grid-cols-2 gap-3">
                <FeatureTiny title="Veg" caption="Vegetarian plans" icon={<Leaf size={16}/>}/>
                <FeatureTiny title="Egg" caption="Ovo‑veg plans" icon={<Egg size={16}/>}/>
                <FeatureTiny title="Non‑veg" caption="Chicken/Fish ready" icon={<Fish size={16}/>}/>
                <FeatureTiny title="Grocery list" caption="Blinkit‑ready" icon={<ShoppingCart size={16}/>}/>
                <FeatureTiny title="Local brands" caption="Amul, Mother Dairy" icon={<Tag size={16}/>}/>
                <FeatureTiny title="WhatsApp" caption="One‑tap share" icon={<MessageCircle size={16}/>}/>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}


function FeatureTile({ title, subtitle, icon, children }:{ title: string; subtitle: string; icon?: React.ReactNode; children: React.ReactNode }){
  return (
    <motion.div variants={{ hidden:{opacity:0,y:10}, show:{opacity:1,y:0} }} className="rounded-2xl border border-[var(--ink)]/10 bg-[var(--paper)] p-4 hover:border-[var(--green)]/40 transition">
      <div className="mb-2 flex items-center justify-between text-xs text-[var(--ink)]/60">
        <span className="inline-flex items-center gap-2 text-[var(--ink)]">
          <IconCircle>{icon}</IconCircle>
          <span className="text-[var(--ink)]/80 font-medium">{title}</span>
        </span>
        <span>{subtitle}</span>
      </div>
      {children}
    </motion.div>
  );
}

function FeatureTiny({ title, caption, icon }:{ title: string; caption: string; icon?: React.ReactNode }){
  return (
    <motion.div variants={{ hidden:{opacity:0,y:10}, show:{opacity:1,y:0} }} whileHover={{ y: -4 }} whileTap={{ y: -1 }} className="rounded-2xl border border-[var(--ink)]/10 bg-white p-3 transition hover:-translate-y-0.5 hover:border-[var(--green)]/40">
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--ink)]">
        <IconCircle>{icon}</IconCircle>
        {title}
      </div>
      <div className="mt-0.5 text-xs text-[var(--ink)]/60">{caption}</div>
    </motion.div>
  );
}

// ===== About (detail) =====
function About(){


  return (
    <Section id="about">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <H2>What is Protein Guru.ai?</H2>
          <Sub>It’s a chat‑first nutrition co‑pilot that builds your day around protein—using the Indian foods you already cook.</Sub>
        </div>
        <div className="mt-8 md:mt-10 grid gap-4 md:gap-6 md:grid-cols-2">
          <Card>
            <div className="flex items-center gap-2 text-lg font-semibold text-[var(--ink)]"><IconCircle><Sparkles size={18}/></IconCircle> Day plan in chat</div>
            <p className="mt-2 text-sm md:text-[15px] text-[var(--ink)]/75">Tell us your protein goal and budget. We balance breakfast → dinner with grams and calories. Swap any item and lock favourites (paneer bhurji, besan chilla) to appear more often.</p>
          </Card>
          <Card>
            <div className="flex items-center gap-2 text-lg font-semibold text-[var(--ink)]"><IconCircle><ShoppingCart size={18}/></IconCircle> Groceries that just work</div>
            <p className="mt-2 text-sm md:text-[15px] text-[var(--ink)]/75">We auto‑group your grocery list (paneer, dal, curd, soy chunks) and format for Blinkit/WhatsApp. Paste it directly or send as a note.</p>
          </Card>
          <Card>
            <div className="flex items-center gap-2 text-lg font-semibold text-[var(--ink)]"><IconCircle><Tag size={18}/></IconCircle> Quick macros</div>
            <p className="mt-2 text-sm md:text-[15px] text-[var(--ink)]/75">For common items we use branded macros (Amul, Mother Dairy, Fortune Soya) so the numbers you see feel real—not generic tables.</p>
          </Card>
          <Card>
            <div className="flex items-center gap-2 text-lg font-semibold text-[var(--ink)]"><IconCircle><UsersRound size={18}/></IconCircle> Made for India</div>
            <p className="mt-2 text-sm md:text-[15px] text-[var(--ink)]/75">Veg, egg, and non‑veg modes supported. Works with wheat/rice limits and gym/rest day patterns.</p>
          </Card>
        </div>
      </Container>
    </Section>
  );
}

// ===== Insights (interactive charts, demo data + play/pause) =====
function Insights(){
  const [mode, setMode] = useState<"all"|"urban"|"rural">("all");
  const [playing, setPlaying] = useState(true);
  const [tick, setTick] = useState(0);
  useEffect(() => { if (!playing) return; const id = setInterval(() => setTick(t => t + 1), 2500); return () => clearInterval(id); }, [playing]);

  const baseGap = [
    { age: "15–24", gap: 18 }, { age: "25–34", gap: 15 }, { age: "35–44", gap: 16 }, { age: "45–54", gap: 14 }, { age: "55+", gap: 12 },
  ];
  const baseRegion = [
    { region: "North", pct: 31 }, { region: "West", pct: 27 }, { region: "South", pct: 24 }, { region: "East", pct: 34 },
  ];
  const effects = [
    { name: "Fatigue", value: 38 }, { name: "Low muscle", value: 28 }, { name: "Hair/skin", value: 18 }, { name: "Other", value: 16 },
  ];
  const j = (v: number, i: number, amp = 2) => Math.max(0, v + Math.round(Math.sin((tick + i) * 1.3) * amp));

  const gapData = baseGap.map((d, i) => { let g = d.gap + (mode === "urban" ? -4 : mode === "rural" ? +4 : 0); return { age: d.age, gap: j(g, i) }; });
  const regionData = baseRegion.map((d, i) => { let p = d.pct + (mode === "urban" ? -6 : mode === "rural" ? +6 : 0); return { region: d.region, pct: j(p, i, 3) }; });

  const COLORS = [C.green, "#cfd5c7", "#aab49e", "#8c987c"]; // monochrome range

  return (
    <Section id="insights" className="bg-white/50">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <H2>India’s protein reality (interactive)</H2>
          <Sub>Illustrative trends on protein gaps and common effects. Toggle Urban/Rural. (Demo data now — swap in NFHS/ICMR later.)</Sub>
        </div>

        <div className="mt-5 md:mt-6 flex flex-wrap items-center justify-center gap-2">
          {(["all","urban","rural"] as const).map((t) => (
            <button key={t} onClick={() => setMode(t)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${mode===t ? 'bg-[var(--green)] text-[var(--paper)] border-[var(--green)]' : 'border-[var(--ink)]/15 text-[var(--ink)] hover:bg-[var(--ink)]/5'}`}>
              {t.toUpperCase()}
            </button>
          ))}
          <button onClick={() => setPlaying(p => !p)} className="ml-2 rounded-full border border-[var(--ink)]/15 px-3 py-1 text-xs font-medium text-[var(--ink)] hover:bg-[var(--ink)]/5">{playing ? "Pause" : "Play"}</button>
        </div>

        <div className="mt-8 md:mt-10 grid gap-4 md:gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <div className="mb-2 text-sm font-medium text-[var(--ink)]">Average daily protein gap by age (g)</div>
            <div className="h-56 sm:h-64 md:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gapData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.green} stopOpacity={0.6} />
                      <stop offset="100%" stopColor={C.green} stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(15,15,16,0.06)" vertical={false} />
                  <XAxis dataKey="age" tick={{ fill: C.ink, opacity: 0.7 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.ink, opacity: 0.7 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, borderColor: "rgba(15,15,16,0.1)" }} />
                  <Area type="monotone" dataKey="gap" stroke={C.green} fill="url(#g1)" strokeWidth={2} isAnimationActive animationDuration={900} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <div className="mb-2 text-sm font-medium text-[var(--ink)]">Reported effects of low protein (%)</div>
            <div className="h-56 sm:h-64 md:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={effects} cx="50%" cy="50%" outerRadius={70} dataKey="value" isAnimationActive animationDuration={800}>
                    {effects.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, borderColor: "rgba(15,15,16,0.1)" }} />
                  <Legend verticalAlign="bottom" height={24} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="mt-4 md:mt-6 grid gap-4 md:gap-6 md:grid-cols-2">
          <Card>
            <div className="mb-2 text-sm font-medium text-[var(--ink)]">Population with protein deficiency by region (%)</div>
            <div className="h-56 sm:h-64 md:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(15,15,16,0.06)" vertical={false} />
                  <XAxis dataKey="region" tick={{ fill: C.ink, opacity: 0.7 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.ink, opacity: 0.7 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, borderColor: "rgba(15,15,16,0.1)" }} />
                  <Bar dataKey="pct" radius={[10,10,0,0]} fill={C.green} isAnimationActive animationDuration={900} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <div className="mb-2 text-sm font-medium text-[var(--ink)]">What we’re tracking next</div>
            <ul className="space-y-2 text-sm md:text-[15px] text-[var(--ink)]/75">
              <li>• State-wise RDA vs intake from NFHS & ICMR</li>
              <li>• Affordability index for 80/100/120g targets (₹/day)</li>
              <li>• Top veg protein sources by city and price</li>
            </ul>
            <p className="mt-3 text-xs text-[var(--ink)]/60">Note: numbers vary.</p>
          </Card>
        </div>
      </Container>
    </Section>
  );
}

// ===== Why us (difference) =====
function Why(){
  const points = [
    { h: "Indian‑first", d: "We start from your thali—paneer, dal, besan, soy—rather than western salads or expensive powders.", icon: <Leaf size={18}/> },
    { h: "Budget aware", d: "Set a ₹/day cap. We’ll hit protein targets using local staples and suggest cheaper swaps when needed.", icon: <IndianRupee size={18}/> },
    { h: "WhatsApp‑ready", d: "One‑tap day plan + checklist share. Accountability partners, trainers, family—everyone can see it easily.", icon: <MessageCircle size={18}/> },
    { h: "Frictionless", d: "No giant dashboards. Just a simple chat that remembers your likes and constraints.", icon: <Sparkles size={18}/> },
  ];
  return (
    <Section id="why">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <H2>Why it feels effortless</H2>
          <Sub>Less app; more outcome. We cut choices and keep you moving.</Sub>
        </div>
        <div className="mt-8 md:mt-10 grid gap-4 md:gap-6 md:grid-cols-2">
          {points.map(p => (
            <Card key={p.h}>
              <div className="flex items-center gap-2 text-lg font-semibold text-[var(--ink)]"><IconCircle>{p.icon}</IconCircle> {p.h}</div>
              <p className="mt-2 text-sm md:text-[15px] text-[var(--ink)]/75">{p.d}</p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ===== Steps (three) =====
function Steps(){
  const steps = [
    { t: "Set your goal", d: "Tell us your daily protein goal and preferences. Add rules (e.g., Monday wheat once).", icon: <Target size={18}/> },
    { t: "Get the plan", d: "We balance Indian meals with grams + calories and prepare a grocery list.", icon: <ListChecks size={18}/> },
    { t: "Tweak & share", d: "Swap items, lock favourites, then share to WhatsApp or paste into Blinkit.", icon: <Share2 size={18}/> },
  ];
  return (
    <Section id="steps" className="bg-white/50">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <H2>Three steps. That’s it.</H2>
          <Sub>Minimal effort → meaningful protein.</Sub>
        </div>
        <div className="mx-auto mt-8 md:mt-10 max-w-3xl space-y-3 md:space-y-4">
          {steps.map((s, i) => (
            <Card key={i} className="p-4 md:p-5">
              <div className="flex items-start gap-4">
                <IconCircle>{s.icon}</IconCircle>
                <div>
                  <div className="text-base md:text-lg font-semibold text-[var(--ink)]">{s.t}</div>
                  <div className="mt-1 text-sm md:text-[15px] text-[var(--ink)]/75">{s.d}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ===== Perks (replaces pricing — no mention of paid) =====
function Perks(){
  const perks = [
    { h: "Early invite", d: "Get access in batches as we scale. You’ll be among the first to try new features.", icon: <Sparkles size={18}/> },
    { h: "Founder updates", d: "We share weekly progress, decisions, and small wins. Transparent building.", icon: <UsersRound size={18}/> },
    { h: "Shape the roadmap", d: "Tell us what you need—regional recipes, macros, or automation. We’ll prioritise with you.", icon: <ListChecks size={18}/> },
  ];
  return (
    <Section id="perks" className="bg-white/50">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <H2>Day‑0 Crew — First Bite Pass</H2>
          <Sub>No payment. Claim a fun, limited <strong>First Bite Pass</strong> and help us shape Protein Guru from day zero.</Sub>
        </div>
        <div className="mt-8 md:mt-10 grid gap-4 md:gap-6 md:grid-cols-3">
          {perks.map(p => (
            <Card key={p.h}>
              <div className="flex items-center gap-2 text-lg font-semibold text-[var(--ink)]"><IconCircle>{p.icon}</IconCircle> {p.h}</div>
              <p className="mt-2 text-sm md:text-[15px] text-[var(--ink)]/75">{p.d}</p>
            </Card>
          ))}
        </div>
        <div className="mt-6 md:mt-8 text-center">
          <Button href={BRAND.waitlistUrl} variant="primary">Claim First Bite Pass</Button>
        </div>
      </Container>
    </Section>
  );
}

// ===== FAQ (detailed answers) =====
function FAQ(){
  const faqs = [
    {
      q: "Is it only for gym‑goers?",
      a: (
        <>
          <p>Not at all. Protein is a baseline nutrient for everyone—students, working professionals, parents. You can pick a sensible daily protein goal for the day you’re having. On lighter days, choose less; on training days, choose more.</p>
          <ul className="mt-2 list-disc pl-5 text-[var(--ink)]/75">
            <li>Balanced across breakfast, lunch, snacks, dinner</li>
            <li>Veg‑forward by default; eggs optional</li>
            <li>Kitchen‑friendly recipes you already cook</li>
          </ul>
        </>
      ),
    },
    {
      q: "Can it fit my daily routine?",
      a: (
        <>
          <p>Yes. It adapts to busy weekdays, travel, or festival weeks. Pick a target that matches your day and we’ll balance the plan across breakfast → dinner. You can lock favourites so they appear more often, and swap any item if you don’t have it.</p>
          <ul className="mt-2 list-disc pl-5 text-[var(--ink)]/75">
            <li>Works with veg, egg, and non‑veg modes</li>
            <li>Handles quick substitutions without recalculating everything</li>
            <li>Gives a clean checklist for easy shopping</li>
          </ul>
        </>
      ),
    },
    {
      q: "What makes it different from generic macro apps?",
      a: (
        <>
          <p>Most macro apps assume western meals and manual logging. Protein Guru starts from your thali and removes the bookkeeping. You talk, it plans, and it outputs a grocery checklist that your family can shop from.</p>
          <ul className="mt-2 list-disc pl-5 text-[var(--ink)]/75">
            <li>Indian‑first recipes and branded macros</li>
            <li>WhatsApp‑ready sharing for accountability</li>
            <li>Blinkit‑friendly checklists</li>
          </ul>
        </>
      ),
    },
    {
      q: "When do I get access?",
      a: (
        <>
          <p>We’ll invite users in small batches while we harden the core experience. Joining the waitlist ensures you get updates and an invite link when your batch opens.</p>
          <p className="mt-2">Founding members can vote on upcoming features (regional recipes, festival modes, weekly grocery automation) so we build what you’ll actually use.</p>
        </>
      ),
    },
  ];
  return (
    <Section id="faq" className="bg-white/50">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <H2>FAQ</H2>
          <Sub>Still curious? Write to <a className="underline" href={`mailto:${BRAND.contactEmail}`}>{BRAND.contactEmail}</a>.</Sub>
        </div>
        <div className="mx-auto mt-8 md:mt-10 max-w-3xl space-y-3">
          {faqs.map((f, i) => (
            <Card key={i} className="p-5">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between text-left text-base md:text-lg font-medium text-[var(--ink)]">
                  {f.q}
                  <span className="ml-4 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[var(--ink)]/15 text-[var(--ink)]/70 transition group-open:rotate-45">+</span>
                </summary>
                <div className="pt-2 text-sm md:text-[15px] text-[var(--ink)]/80">{f.a}</div>
              </details>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ===== Footer =====
function Footer(){
  return (
    <footer className="border-t border-[var(--ink)]/10 py-8 md:py-10 text-sm text-[var(--ink)]/70">
      <Container>
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 text-[var(--ink)]/80">
            <span className="inline-grid h-7 w-7 place-items-center rounded-lg bg-[var(--green)] text-[var(--paper)] font-bold">PG</span>
            <span>© {new Date().getFullYear()} {BRAND.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <a className="hover:text-[var(--ink)]" href={`mailto:${BRAND.contactEmail}`}>Contact</a>
            <a className="hover:text-[var(--ink)]" href={BRAND.waitlistUrl}>Be the first to test</a>
            <a className="hover:text-[var(--ink)]" href="#top">Back to top ↑</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}

// ===== Sticky mobile CTA =====
function StickyCTA(){
  return (
    <div className="fixed inset-x-0 bottom-3 z-[60] px-4 sm:hidden">
      <div className="mx-auto flex max-w-md items-center gap-3 rounded-full border border-[var(--ink)]/10 bg-white p-2 shadow">
        <Button href={BRAND.waitlistUrl} className="flex-1">Be the first to test</Button>
        <Button href={BRAND.whatsappShare} variant="secondary" className="flex-1">Share</Button>
      </div>
    </div>
  );
}

// ===== PAGE =====
export default function Page(){
  const style = useMemo(() => ({ ['--green' as any]: C.green, ['--paper' as any]: C.paper, ['--ink' as any]: C.ink }), []);
  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]" style={style}>
      <Nav />
      <Hero />
      
      <About />
      <Insights />
      <Steps />
      <Why />
      <Perks />
      <FAQ />
      <Footer />
      <StickyCTA />
    </main>
  );
}
