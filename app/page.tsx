"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadialBarChart,
  RadialBar,
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
  X as XIcon,
  IndianRupee,
} from "lucide-react";

// ===== Brand + palette =====
const BRAND = {
  name: "Protein Guru.ai",
  tagline: "India’s protein co-pilot",
  waitlistUrl: "/signup",
  contactEmail: "proteinguruai@gmail.com",
  whatsappShare:
    "https://wa.me/?text=" +
    encodeURIComponent(
      "Protein Guru.ai — a chat-first nutrition co-pilot that plans budget-friendly, high-protein Indian meals. Join the waitlist at proteinguru.ai"
    ),
};

const C = { green: "#5c6e49", paper: "#f6f3ef", ink: "#0f0f10" } as const;

// ===== Utilities =====
const Container = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6">{children}</div>
);

const Section = ({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <section
    id={id}
    data-section={id}
    className={`pt-4 pb-16 md:pb-24 lg:pb-28 scroll-mt-24 text-center ${className}`}
  >
    {children}
  </section>
);

// Modern rectangular button
function Button({
  children,
  href,
  variant = "primary",
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  onClick?: () => void;
}) {
  const base =
    "group relative inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 md:px-5 md:py-3 text-sm md:text-[15px] font-medium transition-all duration-200 active:translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ring-offset-[var(--paper)]";
  const styles =
    variant === "primary"
      ? "bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--green)] hover:text-[var(--paper)] hover:shadow-[0_12px_24px_rgba(92,110,73,0.22)] focus-visible:ring-[var(--green)]"
      : variant === "secondary"
      ? "border border-[var(--ink)]/15 text-[var(--ink)] bg-white/90 hover:bg-[var(--ink)]/5 focus-visible:ring-[var(--green)]"
      : "text-[var(--ink)]/80 hover:text-[var(--ink)]";
  const inner = (
    <>
      <span className="transition-transform group-hover:-translate-y-0.5">
        {children}
      </span>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        className="-mr-1 opacity-80 transition-transform group-hover:translate-x-0.5"
        fill="none"
        aria-hidden
      >
        <path
          d="M5 12h14M13 5l7 7-7 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
  if (href)
    return (
      <a
        className={`${base} ${styles} ${className}`}
        href={href}
        target="_self"
        rel="noreferrer"
      >
        {inner}
      </a>
    );
  return (
    <button className={`${base} ${styles} ${className}`} onClick={onClick}>
      {inner}
    </button>
  );
}

const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4 }}
    whileTap={{ y: -1 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    className={`group relative overflow-hidden rounded-2xl border border-[var(--ink)]/10 bg-white p-5 md:p-6 shadow-[0_1px_0_rgba(15,15,16,0.06)] transition will-change-transform hover:shadow-[0_14px_28px_rgba(15,15,16,0.08)] ${className}`}
  >
    {children}
  </motion.div>
);

const H2 = ({ children }: { children: React.ReactNode }) => (
  <motion.h2
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.45 }}
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
    transition={{ duration: 0.55, delay: 0.05 }}
    className="mt-3 md:mt-4 mx-auto max-w-2xl text-pretty text-[15px] md:text-lg text-[var(--ink)]/70"
  >
    {children}
  </motion.p>
);

function IconCircle({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[var(--green)]/12 text-[var(--green)]">
      {children}
    </span>
  );
}

// ===== Active link highlighting =====
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string>(ids[0] ?? "");
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting)
            setActive(e.target.getAttribute("data-section") || "");
        });
      },
      { threshold: 0.25 }
    );
    ids.forEach((id) => {
      const el = document.querySelector(`[data-section="${id}"]`);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [ids]);
  return active;
}

// ===== Nav (mobile hamburger fixed + animated) =====
function Nav() {
  const ids = ["about", "insights", "steps", "why", "perks", "faq"];
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
          <a
            href="#top"
            className="flex items-center gap-2 font-semibold text-[var(--ink)]"
          >
            <span className="inline-grid h-8 w-8 place-items-center rounded-md bg-[var(--green)] text-[var(--paper)] font-bold">
              PG
            </span>
            <span className="hidden sm:block">{BRAND.name}</span>
          </a>

          <nav className="hidden items-center gap-6 text-sm md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`relative px-1 py-1 text-[var(--ink)]/75 hover:text-[var(--ink)] ${
                  active === l.href.replace("#", "") ? "text-[var(--ink)]" : ""
                }`}
              >
                <span>{l.label}</span>
                <span
                  className={`pointer-events-none absolute -bottom-1 left-0 h-[2px] w-full rounded bg-[var(--green)] transition ${
                    active === l.href.replace("#", "")
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                />
              </a>
            ))}
            <Button href={BRAND.waitlistUrl}>Be the first to test</Button>
          </nav>

          {/* Mobile hamburger: visible bg + animation */}
          <div className="md:hidden flex items-center gap-3">
            <Button
              href={BRAND.waitlistUrl}
              className="hidden sm:inline-flex"
              variant="secondary"
            >
              Be first
            </Button>
            <button
              aria-label="Open menu"
              onClick={() => setOpen((v) => !v)}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--ink)]/15 bg-white/90 text-[var(--ink)]/90 shadow-sm transition active:scale-[0.98]`}
            >
              <motion.div
                initial={false}
                animate={{ rotate: open ? 90 : 0, scale: open ? 1.05 : 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                {open ? <XIcon size={18} /> : <Menu size={18} />}
              </motion.div>
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile overlay menu with smooth fade + slide */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[var(--paper)]/95 backdrop-blur"
            onClick={() => setOpen(false)}
          >
            <Container>
              <motion.div
                initial={{ y: -16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -16, opacity: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
                className="mt-3 rounded-2xl border border-[var(--ink)]/10 bg-white p-3 shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-2 pb-1">
                  <div className="flex items-center gap-2 font-semibold text-[var(--ink)]">
                    <span className="inline-grid h-8 w-8 place-items-center rounded-md bg-[var(--green)] text-[var(--paper)] font-bold">
                      PG
                    </span>
                    {BRAND.name}
                  </div>
                  <button
                    aria-label="Close menu"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--ink)]/15 bg-white text-[var(--ink)]/80"
                  >
                    <XIcon size={18} />
                  </button>
                </div>

                <div className="grid gap-2 py-2">
                  {links.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="rounded-md px-3 py-3 text-base text-[var(--ink)] hover:bg-[var(--ink)]/5"
                    >
                      {l.label}
                    </a>
                  ))}
                  <div className="pt-1 px-2">
                    <Button href={BRAND.waitlistUrl} className="w-full">
                      Be the first to test
                    </Button>
                  </div>
                </div>
              </motion.div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ===== Hero (refined self-check) =====
function Hero() {
  const [check, setCheck] = useState<"yes" | "no" | "idk" | null>(null);

  return (
    <Section id="top" className="pt-4">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-[var(--ink)]/10 bg-white p-6 md:p-10 shadow-[0_2px_0_rgba(15,15,16,0.06)]"
        >
          <div className="mx-auto max-w-3xl">
            <div className="mb-3 inline-flex items-center justify-center gap-2 text-xs text-[var(--ink)]/60">
              <span className="h-2 w-2 rounded-full bg-[var(--green)]" />
              Beta • Chat-first nutrition
            </div>

            <h1 className="text-balance text-4xl md:text-6xl font-semibold leading-[1.07] tracking-tight text-[var(--ink)]">
              Functions of your diet, simplified.
            </h1>

            <p className="mt-4 md:mt-5 text-pretty text-[15px] md:text-lg text-[var(--ink)]/75">
              Plan Indian meals around your protein goal and habits. One tap to
              share a grocery checklist.
            </p>

            <div className="mt-6 md:mt-7 flex flex-wrap items-center justify-center gap-3">
              <Button href={BRAND.waitlistUrl} variant="primary">
                Be the first to test
              </Button>
              <Button href="#about" variant="secondary">
                Learn more
              </Button>
            </div>

            {/* 60s self-check */}
            <div className="mx-auto mt-8 md:mt-10 max-w-2xl">
              <div className="h-px w-full bg-[var(--ink)]/10" />
              <div className="mt-6">
                <p className="text-sm md:text-[15px] text-[var(--ink)]/70">
                  <span className="font-medium text-[var(--ink)]">
                    60-second self-check:
                  </span>{" "}
                  Did you reach <span className="font-medium">your protein goal</span> yesterday?
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  {[
                    { k: "yes", label: "Yes" },
                    { k: "no", label: "No" },
                    { k: "idk", label: "Not sure" },
                  ].map((o) => (
                    <button
                      key={o.k}
                      onClick={() => setCheck(o.k as any)}
                      className={`rounded-md border px-4 py-2 text-sm font-medium transition
                        ${
                          check === o.k
                            ? "bg-[var(--green)] text-[var(--paper)] border-[var(--green)]"
                            : "border-[var(--ink)]/15 text-[var(--ink)] hover:bg-[var(--ink)]/5"
                        }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>

                <div className="mt-4 text-sm md:text-[15px] text-[var(--ink)]/80">
                  {check === "yes" && (
                    <p>Nice. Lock your favourites and keep the streak going. 🎯</p>
                  )}
                  {check === "no" && (
                    <p>
                      Most people aren’t even aware of a daily protein goal —
                      let’s set yours and plan tomorrow around it.
                    </p>
                  )}
                  {check === "idk" && (
                    <p>
                      Not sure is common. We’ll track it for you, without tedious logging.
                    </p>
                  )}
                  {check && (
                    <div className="mt-3">
                      <Button href={BRAND.waitlistUrl} variant="primary">
                        Get my early invite
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* end self-check */}
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}

// ===== About =====
function About() {
  return (
    <Section id="about">
      <Container>
        <div className="mx-auto max-w-3xl">
          <H2>What is Protein Guru.ai?</H2>
          <Sub>
            It’s a chat-first nutrition co-pilot that builds your day around
            protein — using the Indian foods you already cook.
          </Sub>
        </div>

        <div className="mt-8 md:mt-10 grid gap-4 md:gap-6 md:grid-cols-2">
          <Card>
            <div className="flex flex-col items-center gap-2 text-lg font-semibold text-[var(--ink)]">
              <IconCircle>
                <Sparkles size={18} />
              </IconCircle>
              Day plan in chat
            </div>
            <p className="mt-2 text-sm md:text-[15px] text-[var(--ink)]/75">
              Tell us your protein goal and budget. We balance breakfast → dinner
              with grams and calories. Swap items and lock favourites to appear
              more often.
            </p>
          </Card>
          <Card>
            <div className="flex flex-col items-center gap-2 text-lg font-semibold text-[var(--ink)]">
              <IconCircle>
                <ShoppingCart size={18} />
              </IconCircle>
              Groceries that just work
            </div>
            <p className="mt-2 text-sm md:text-[15px] text-[var(--ink)]/75">
              Auto-grouped grocery list, formatted for Blinkit/WhatsApp. Paste it
              directly or send as a note.
            </p>
          </Card>
          <Card>
            <div className="flex flex-col items-center gap-2 text-lg font-semibold text-[var(--ink)]">
              <IconCircle>
                <Tag size={18} />
              </IconCircle>
              Quick macros
            </div>
            <p className="mt-2 text-sm md:text-[15px] text-[var(--ink)]/75">
              Branded macros (Amul, Mother Dairy, Fortune Soya) so numbers feel
              real — not generic tables.
            </p>
          </Card>
          <Card>
            <div className="flex flex-col items-center gap-2 text-lg font-semibold text-[var(--ink)]">
              <IconCircle>
                <UsersRound size={18} />
              </IconCircle>
              Made for India
            </div>
            <p className="mt-2 text-sm md:text-[15px] text-[var(--ink)]/75">
              Veg, egg, and non-veg modes. Works with wheat/rice limits and
              gym/rest patterns.
            </p>
          </Card>
        </div>
      </Container>
    </Section>
  );
}

/* =======================
   Protein reality in India (from your research)
   ======================= */
function Insights() {
  // ===== Research-derived figures (from your PDF/markdown) =====
  // Awareness & deficiency
  const AWARE_PCT = 10; // ~90% unaware of daily protein goal
  const DEFICIENT_PCT = 73; // protein deficient population

  // ICMR & intake
  const GOAL_MEN = 54; // g/day
  const GOAL_WOMEN = 46; // g/day
  const INTAKE_NATIONAL = 47; // g/day avg
  const INTAKE_URBAN = 55.4;  // g/day
  const INTAKE_RURAL = 69;    // g/day (lower quality)

  // Income gradient (intake)
  const INCOME_DATA = [
    { group: "Bottom decile", grams: 43 },
    { group: "Top decile", grams: 82 },
  ];

  // Regional highlights (examples called out in your research)
  const REGIONAL_HIGHLIGHTS = [
    { title: "Rajasthan (rural)", value: "71.4g/day", note: "Highest rural intake" },
    { title: "Jharkhand/Bihar", value: "48.8g/day", note: "Lowest intake cluster" },
    { title: "Lucknow (city)", value: "90%", note: "Deficiency rate" },
    { title: "Delhi (city)", value: "64%", note: "Deficiency rate" },
  ];

  // Protein source mix — cereals dominate (60–75%). We visualize a representative share.
  const CEREAL_SHARE = 65;

  // ===== Visual datasets =====
  const gaugeData = [
    { name: "Aware", value: AWARE_PCT, fill: C.green },
    { name: "bg", value: 100, fill: "#e6eadf" },
  ];

  const intakeBlocks = [
    { label: "Men (goal)", grams: GOAL_MEN, type: "goal" },
    { label: "Women (goal)", grams: GOAL_WOMEN, type: "goal" },
    { label: "National intake", grams: INTAKE_NATIONAL, type: "intake" },
    { label: "Urban intake", grams: INTAKE_URBAN, type: "intake" },
    { label: "Rural intake*", grams: INTAKE_RURAL, type: "intake" },
  ];

  const incomeBars = INCOME_DATA;

  const factTiles = [
    {
      h: "Awareness gap",
      d: "About 90% of people don’t know their daily protein goal.",
    },
    {
      h: "Quality issue",
      d: "60–75% of protein comes from cereals with lower bioavailability.",
    },
    {
      h: "ICMR guide rails",
      d: "Men ~54g/day, women ~46g/day recommended; national average ~47g.",
    },
    {
      h: "Belief barrier",
      d: "85% believe protein causes weight gain — education matters.",
    },
  ];

  // ===== Colors =====
  const fillGoal = "#cfd5c7";
  const fillIntake = C.green;

  return (
    <Section id="insights" className="bg-white/50">
      <Container>
        <div className="mx-auto max-w-3xl">
          <H2>Protein reality in India</H2>
          <Sub>
            Highlights from our research on awareness, intake vs goals, income and regional patterns — built for practical planning in Indian kitchens.
          </Sub>
        </div>

        {/* KPI tiles */}
        <div className="mx-auto mt-7 grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="p-4">
            <div className="text-sm text-[var(--ink)]/70">Know their daily goal</div>
            <div className="mt-1 text-3xl font-semibold">{AWARE_PCT}%</div>
            <div className="mt-1 text-xs text-[var(--ink)]/60">Awareness remains low</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-[var(--ink)]/70">Protein deficient</div>
            <div className="mt-1 text-3xl font-semibold">{DEFICIENT_PCT}%</div>
            <div className="mt-1 text-xs text-[var(--ink)]/60">Across demographics</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-[var(--ink)]/70">Cereal share of protein</div>
            <div className="mt-1 text-3xl font-semibold">{CEREAL_SHARE}%</div>
            <div className="mt-1 text-xs text-[var(--ink)]/60">Lower bioavailability</div>
          </Card>
        </div>

        {/* Awareness gauge + facts — combined sleek tile */}
<div className="mx-auto mt-8 max-w-5xl">
  <Card className="p-5 md:p-6">
    <div className="grid gap-6 md:grid-cols-[320px,1fr] items-center">
      {/* Left: Gauge */}
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-2 text-sm font-medium text-[var(--ink)]">
          Daily protein goal awareness
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="100%"
              barSize={14}
              data={[
                { name: "Aware", value: AWARE_PCT, fill: C.green },
                { name: "bg", value: 100, fill: "#e6eadf" },
              ]}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar
                minAngle={15}
                clockWise
                dataKey="value"
                cornerRadius={8}
              />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={C.ink}
                style={{ fontSize: 28, fontWeight: 600 }}
              >
                {AWARE_PCT}%
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-xs text-[var(--ink)]/70">
          Share of people aware of a daily protein target.
        </div>
      </div>

      {/* Right: 3 concise facts */}
      <div className="text-left md:text-center">
        <div className="mb-3 text-base md:text-lg font-semibold text-[var(--ink)] text-center">
          What this means
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {/* Fact 1 */}
          <button
            className="group rounded-xl border border-[var(--ink)]/10 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[var(--green)]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green)]"
            type="button"
          >
            <div className="text-sm font-medium text-[var(--ink)] group-hover:text-[var(--ink)]">
              Awareness gap
            </div>
            <div className="mt-1 text-sm text-[var(--ink)]/70">
              ~90% don’t know their daily protein goal.
            </div>
          </button>

          {/* Fact 2 */}
          <button
            className="group rounded-xl border border-[var(--ink)]/10 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[var(--green)]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green)]"
            type="button"
          >
            <div className="text-sm font-medium text-[var(--ink)]">
              Quality issue
            </div>
            <div className="mt-1 text-sm text-[var(--ink)]/70">
              60–75% of protein comes from cereals (lower bioavailability).
            </div>
          </button>

          {/* Fact 3 */}
          <button
            className="group rounded-xl border border-[var(--ink)]/10 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[var(--green)]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green)]"
            type="button"
          >
            <div className="text-sm font-medium text-[var(--ink)]">
              ICMR guide rails
            </div>
            <div className="mt-1 text-sm text-[var(--ink)]/70">
              Men ~54g/day; 
              Women ~46g/day
            </div>
          </button>
        </div>
      </div>
    </div>
  </Card>
</div>


        {/* Intake vs recommended / context blocks */}
        <div className="mx-auto mt-8 max-w-5xl">
          <Card>
            <div className="mb-2 text-sm font-medium text-[var(--ink)]">
              Protein (g/day) across goals and reality
            </div>
            <div className="h-64 w-full md:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={intakeBlocks}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid stroke="rgba(15,15,16,0.06)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: C.ink, opacity: 0.7 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: C.ink, opacity: 0.7 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      borderColor: "rgba(15,15,16,0.1)",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="grams"
                    name="g/day"
                    radius={[8, 8, 0, 0]}
                    label={{ position: "top", fill: C.ink, fontSize: 12 }}
                  >
                    {intakeBlocks.map((d, i) => (
                      <Cell
                        key={i}
                        fill={d.type === "goal" ? fillGoal : fillIntake}
                      />
                    ))}
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-xs text-[var(--ink)]/60">
              *Rural intake is higher in grams but often lower in protein quality.
            </div>
          </Card>
        </div>

        {/* Income gradient & regional callouts */}
        <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <div className="mb-2 text-sm font-medium text-[var(--ink)]">
              Intake by income segment (g/day)
            </div>
            <div className="h-64 w-full md:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeBars} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(15,15,16,0.06)" vertical={false} />
                  <XAxis
                    dataKey="group"
                    tick={{ fill: C.ink, opacity: 0.7 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: C.ink, opacity: 0.7 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      borderColor: "rgba(15,15,16,0.1)",
                    }}
                  />
                  <Bar dataKey="grams" radius={[10, 10, 0, 0]} fill={fillIntake}>
                    {incomeBars.map((_, i) => (
                      <Cell key={i} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <div className="mb-2 text-sm font-medium text-[var(--ink)]">
              Regional callouts
            </div>
            <div className="grid gap-3">
              {REGIONAL_HIGHLIGHTS.map((r) => (
                <div key={r.title} className="rounded-xl border border-[var(--ink)]/10 p-3">
                  <div className="text-sm font-semibold">{r.title}</div>
                  <div className="text-lg font-semibold text-[var(--ink)] mt-0.5">
                    {r.value}
                  </div>
                  <div className="text-xs text-[var(--ink)]/70">{r.note}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Container>
    </Section>
  );
}



// ===== Why =====
function Why() {
  const points = [
    {
      h: "Indian-first",
      d: "We start from your thali — paneer, dal, besan, soy — instead of western salads or expensive powders.",
      icon: <Leaf size={18} />,
    },
    {
      h: "Budget aware",
      d: "Set a ₹/day cap. We’ll hit protein targets using local staples and suggest cheaper swaps when needed.",
      icon: <IndianRupee size={18} />,
    },
    {
      h: "WhatsApp-ready",
      d: "One-tap day plan + checklist share. Accountability partners, trainers, family — everyone can see it easily.",
      icon: <MessageCircle size={18} />,
    },
    {
      h: "Frictionless",
      d: "No giant dashboards. Just a simple chat that remembers your likes and constraints.",
      icon: <Sparkles size={18} />,
    },
  ];
  return (
    <Section id="why">
      <Container>
        <div className="mx-auto max-w-3xl">
          <H2>Why it feels effortless</H2>
          <Sub>Less app; more outcome. We cut choices and keep you moving.</Sub>
        </div>
        <div className="mt-8 md:mt-10 grid gap-4 md:gap-6 md:grid-cols-2">
          {points.map((p) => (
            <Card key={p.h}>
              <div className="flex flex-col items-center gap-2 text-lg font-semibold text-[var(--ink)]">
                <IconCircle>{p.icon}</IconCircle>
                {p.h}
              </div>
              <p className="mt-2 text-sm md:text-[15px] text-[var(--ink)]/75">
                {p.d}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ===== Steps =====
function Steps() {
  const steps = [
    {
      t: "Set your goal",
      d: "Tell us your daily protein goal and preferences. Add rules (e.g., Monday wheat once).",
      icon: <Target size={18} />,
    },
    {
      t: "Get the plan",
      d: "We balance Indian meals with grams + calories and prepare a grocery list.",
      icon: <ListChecks size={18} />,
    },
    {
      t: "Tweak & share",
      d: "Swap items, lock favourites, then share to WhatsApp or paste into Blinkit.",
      icon: <Share2 size={18} />,
    },
  ];
  return (
    <Section id="steps" className="bg-white/50">
      <Container>
        <div className="mx-auto max-w-3xl">
          <H2>Three steps. That’s it.</H2>
          <Sub>Minimal effort → meaningful protein.</Sub>
        </div>
        <div className="mx-auto mt-8 md:mt-10 max-w-3xl space-y-3 md:space-y-4">
          {steps.map((s, i) => (
            <Card key={i} className="p-4 md:p-5">
              <div className="flex flex-col items-center gap-3">
                <IconCircle>{s.icon}</IconCircle>
                <div className="text-base md:text-lg font-semibold text-[var(--ink)]">
                  {s.t}
                </div>
                <div className="max-w-xl text-sm md:text-[15px] text-[var(--ink)]/75">
                  {s.d}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ===== Perks =====
function Perks() {
  const perks = [
    {
      h: "Early invite",
      d: "Get access in batches as we scale. You’ll be among the first to try new features.",
      icon: <Sparkles size={18} />,
    },
    {
      h: "Founder updates",
      d: "We share weekly progress, decisions, and small wins. Transparent building.",
      icon: <UsersRound size={18} />,
    },
    {
      h: "Shape the roadmap",
      d: "Tell us what you need — regional recipes, macros, or automation. We’ll prioritise with you.",
      icon: <ListChecks size={18} />,
    },
  ];
  return (
    <Section id="perks" className="bg-white/50">
      <Container>
        <div className="mx-auto max-w-3xl">
          <H2>Day-0 Crew — First Bite Pass</H2>
          <Sub>
            No payment. Claim a limited <strong>First Bite Pass</strong> and help
            shape Protein Guru from day zero.
          </Sub>
        </div>
        <div className="mt-8 md:mt-10 grid gap-4 md:gap-6 md:grid-cols-3">
          {perks.map((p) => (
            <Card key={p.h}>
              <div className="flex flex-col items-center gap-2 text-lg font-semibold text-[var(--ink)]">
                <IconCircle>{p.icon}</IconCircle>
                {p.h}
              </div>
              <p className="mt-2 text-sm md:text-[15px] text-[var(--ink)]/75">
                {p.d}
              </p>
            </Card>
          ))}
        </div>
        <div className="mt-6 md:mt-8">
          <Button href={BRAND.waitlistUrl} variant="primary">
            Claim First Bite Pass
          </Button>
        </div>
      </Container>
    </Section>
  );
}

// ===== FAQ =====
function FAQ() {
  const faqs = [
    {
      q: "Is it only for gym-goers?",
      a: (
        <>
          <p>
            Not at all. Protein is a baseline nutrient for everyone—students,
            working professionals, parents. Pick a sensible daily protein goal
            for the day you’re having.
          </p>
          <ul className="mt-2 list-disc pl-5 text-left inline-block text-[var(--ink)]/75">
            <li>Balanced across breakfast, lunch, snacks, dinner</li>
            <li>Veg-forward by default; eggs optional</li>
            <li>Kitchen-friendly recipes you already cook</li>
          </ul>
        </>
      ),
    },
    {
      q: "Can it fit my daily routine?",
      a: (
        <>
          <p>
            Yes. It adapts to busy weekdays, travel, or festival weeks. Lock
            favourites so they appear more often, and swap any item if you don’t
            have it.
          </p>
          <ul className="mt-2 list-disc pl-5 text-left inline-block text-[var(--ink)]/75">
            <li>Works with veg, egg, and non-veg modes</li>
            <li>Quick substitutions without redoing everything</li>
            <li>Clean checklist for easy shopping</li>
          </ul>
        </>
      ),
    },
    {
      q: "What makes it different from generic macro apps?",
      a: (
        <>
          <p>
            Most macro apps assume western meals and manual logging. Protein
            Guru starts from your thali and removes the bookkeeping.
          </p>
          <ul className="mt-2 list-disc pl-5 text-left inline-block text-[var(--ink)]/75">
            <li>Indian-first recipes and branded macros</li>
            <li>WhatsApp-ready sharing for accountability</li>
            <li>Blinkit-friendly checklists</li>
          </ul>
        </>
      ),
    },
    {
      q: "When do I get access?",
      a: (
        <>
          <p>
            We’ll invite users in small batches while we harden the core
            experience. Join the waitlist for updates and your invite.
          </p>
        </>
      ),
    },
  ];
  return (
    <Section id="faq" className="bg-white/50">
      <Container>
        <div className="mx-auto max-w-3xl">
          <H2>FAQ</H2>
          <Sub>
            Still curious? Write to{" "}
            <a className="underline" href={`mailto:${BRAND.contactEmail}`}>
              {BRAND.contactEmail}
            </a>
            .
          </Sub>
        </div>
        <div className="mx-auto mt-8 md:mt-10 max-w-3xl space-y-3">
          {faqs.map((f, i) => (
            <Card key={i} className="p-5">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between text-left text-base md:text-lg font-medium text-[var(--ink)]">
                  <span className="pr-4">{f.q}</span>
                  <span className="ml-4 inline-flex h-6 w-6 items-center justify-center rounded-md border border-[var(--ink)]/15 text-[var(--ink)]/70 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="pt-2 text-sm md:text-[15px] text-[var(--ink)]/80">
                  {f.a}
                </div>
              </details>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ===== Footer =====
function Footer() {
  return (
    <footer className="border-t border-[var(--ink)]/10 py-8 md:py-10 text-sm text-[var(--ink)]/70">
      <Container>
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 text-[var(--ink)]/80">
            <span className="inline-grid h-7 w-7 place-items-center rounded-md bg-[var(--green)] text-[var(--paper)] font-bold">
              PG
            </span>
            <span>
              © {new Date().getFullYear()} {BRAND.name}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a className="hover:text-[var(--ink)]" href={`mailto:${BRAND.contactEmail}`}>
              Contact
            </a>
            <a className="hover:text-[var(--ink)]" href={BRAND.waitlistUrl}>
              Be the first to test
            </a>
            <a className="hover:text-[var(--ink)]" href="#top">
              Back to top ↑
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}

// ===== PAGE =====
export default function Page() {
  const style = useMemo(
    () =>
      ({
        ["--green" as any]: C.green,
        ["--paper" as any]: C.paper,
        ["--ink" as any]: C.ink,
      }) as React.CSSProperties,
    []
  );

  return (
    <main
      className="min-h-screen bg-[var(--paper)] text-[var(--ink)]"
      style={style}
    >
      <Nav />
      <Hero />
      <About />
      <Insights />
      <Steps />
      <Why />
      <Perks />
      <FAQ />
      <Footer />
    </main>
  );
}
