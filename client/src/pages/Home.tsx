import { useState } from "react";
import { Link } from "wouter";
import { SignInButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  Play,
  BarChart3,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Gamepad2,
  Eye,
  Zap,
  Users,
  ChevronRight,
  Star,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay: i * 0.1 },
});

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <Play className="w-7 h-7 text-violet-400" />,
      title: "Session Capture & Playback",
      headline: "See Your Game Through Player Eyes",
      description:
        "LoopLens automatically records every game session—from first launch to the moment players quit. Replay exactly what happened, where they struggled, and what caused them to leave. No guesswork. No surveys. Pure behavioral data that shows you the real story behind your player drop-off.",
    },
    {
      icon: <BarChart3 className="w-7 h-7 text-violet-400" />,
      title: "Player Behavior Insights",
      headline: "Understand the Why Behind the Quit",
      description:
        "Identify patterns across hundreds of sessions. Which levels cause the most friction? Where do players spend the most time? What features do they never use? LoopLens aggregates session data into clear, actionable insights so you can prioritize fixes that actually matter to your players.",
    },
    {
      icon: <TrendingUp className="w-7 h-7 text-violet-400" />,
      title: "Retention Analytics Dashboard",
      headline: "Track What Matters: Engagement, Churn & Trends",
      description:
        "Watch your retention metrics in real-time. See which updates moved the needle, which features drive engagement, and where players consistently abandon your game. Built for indie developers—simple enough for solo devs, powerful enough for growing studios.",
    },
  ];

  const problems = [
    {
      icon: <Gamepad2 className="w-6 h-6 text-red-400" />,
      text: "Players quit after level 3 and you have no idea why",
    },
    {
      icon: <Eye className="w-6 h-6 text-red-400" />,
      text: "You're guessing which features players actually use",
    },
    {
      icon: <Zap className="w-6 h-6 text-red-400" />,
      text: "You spend weeks fixing the wrong things",
    },
    {
      icon: <Users className="w-6 h-6 text-red-400" />,
      text: "Retention is dropping but surveys give you nothing useful",
    },
  ];

  const soloFeatures = [
    "Up to 1,000 sessions/month",
    "Session playback & recording",
    "Basic behavior analytics",
    "Retention dashboard",
    "Email support",
    "1 game project",
  ];

  const studioFeatures = [
    "Up to 10,000 sessions/month",
    "Session playback & recording",
    "Advanced behavior insights",
    "Retention & churn analytics",
    "Priority support",
    "Up to 5 game projects",
    "Team collaboration tools",
    "Custom event tracking",
  ];

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white font-sans">
      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a12]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-900/50">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-violet-300 transition-colors">
              LoopLens
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Pricing
            </a>
            <SignedIn>
              <Link
                to="/dashboard"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
            </SignedIn>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white hover:bg-white/10"
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button
                  size="sm"
                  className="bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40 h-10 px-5"
                >
                  Start Free Trial
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link to="/dashboard">
                <Button
                  size="sm"
                  className="bg-violet-600 hover:bg-violet-500 text-white h-10 px-5"
                >
                  Go to Dashboard
                </Button>
              </Link>
            </SignedIn>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#0a0a12] px-4 py-4 flex flex-col gap-4">
            <a
              href="#features"
              className="text-sm text-gray-300 hover:text-white py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm text-gray-300 hover:text-white py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </a>
            <SignedIn>
              <Link
                to="/dashboard"
                className="text-sm text-gray-300 hover:text-white py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            </SignedIn>
            <div className="flex flex-col gap-3 pt-2 border-t border-white/10">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10 h-10"
                  >
                    Sign In
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button className="w-full bg-violet-600 hover:bg-violet-500 text-white h-10">
                    Start Free Trial
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-violet-600 hover:bg-violet-500 text-white h-10">
                    Go to Dashboard
                  </Button>
                </Link>
              </SignedIn>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden px-4 md:px-8 lg:px-16 pt-20 pb-24 md:pt-28 md:pb-32">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-violet-700/20 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div {...stagger(0)}>
            <Badge className="mb-6 inline-flex bg-violet-900/60 text-violet-300 border border-violet-700/50 px-4 py-1.5 text-sm font-medium">
              <Star className="w-3.5 h-3.5 mr-1.5 fill-violet-400 text-violet-400" />
              Session Analytics for Indie Games
            </Badge>
          </motion.div>

          <motion.h1
            {...stagger(1)}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6"
          >
            Stop Guessing Why{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
              Players Leave.
            </span>{" "}
            Know Exactly What Happens in Every Game Session.
          </motion.h1>

          <motion.p
            {...stagger(2)}
            className="text-base md:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Capture real player behavior and turn session data into actionable
            insights. LoopLens reveals the exact moments players quit—so you can
            fix them and keep players coming back.
          </motion.p>

          <motion.div
            {...stagger(3)}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <SignedOut>
              <SignInButton mode="modal">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-violet-600 hover:bg-violet-500 text-white h-12 px-8 text-base font-semibold shadow-xl shadow-violet-900/40 group"
                >
                  Start Free Trial — No Credit Card
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link to="/dashboard">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-violet-600 hover:bg-violet-500 text-white h-12 px-8 text-base font-semibold shadow-xl shadow-violet-900/40 group"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </SignedIn>
            <a href="#features">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 h-12 px-8 text-base"
              >
                See How It Works
              </Button>
            </a>
          </motion.div>

          <motion.p
            {...stagger(4)}
            className="mt-5 text-sm text-gray-500"
          >
            Free 14-day trial · No credit card required · Cancel anytime
          </motion.p>
        </div>

        {/* Hero visual placeholder — stat bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative max-w-4xl mx-auto mt-16 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-6 md:p-8 shadow-2xl shadow-black/40"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-3 text-xs text-gray-500 font-mono">
              LoopLens — Session Dashboard
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Sessions Recorded", value: "12,847" },
              { label: "Avg. Session Length", value: "8m 32s" },
              { label: "Drop-off Rate", value: "34%" },
              { label: "Retention D7", value: "61%" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-white/5 border border-white/10 p-4"
              >
                <p className="text-2xl font-bold text-violet-300">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
              Drop-off Heatmap — Level Progress
            </p>
            {[
              { label: "Tutorial", pct: 92, color: "bg-green-500" },
              { label: "Level 1", pct: 78, color: "bg-green-500" },
              { label: "Level 2", pct: 55, color: "bg-yellow-500" },
              { label: "Level 3", pct: 31, color: "bg-red-500" },
              { label: "Level 4", pct: 18, color: "bg-red-600" },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-3">
                <span className="w-16 text-xs text-gray-400 shrink-0">
                  {row.label}
                </span>
                <div className="flex-1 bg-white/5 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${row.color}`}
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
                <span className="w-10 text-xs text-gray-400 text-right shrink-0">
                  {row.pct}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── PROBLEM / SOLUTION ── */}
      <section className="px-4 md:px-8 lg:px-16 py-20 md:py-28 bg-[#07070f]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Problem */}
            <motion.div {...fadeUp}>
              <Badge className="mb-4 bg-red-900/40 text-red-300 border-red-700/50 px-3 py-1 text-xs">
                The Problem
              </Badge>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                Indie Devs Are Flying{" "}
                <span className="text-red-400">Blind</span>
              </h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                You've poured months into your game. Players download it, play
                for a few minutes, then vanish. You check the numbers—retention
                is low—but you have no idea why. Traditional analytics don't
                tell you what actually happened inside the session.
              </p>
              <ul className="space-y-4">
                {problems.map((p, i) => (
                  <motion.li
                    key={i}
                    {...stagger(i)}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-0.5 w-8 h-8 rounded-lg bg-red-900/30 border border-red-800/40 flex items-center justify-center shrink-0">
                      {p.icon}
                    </div>
                    <span className="text-gray-300 text-sm leading-relaxed">
                      {p.text}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Solution */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl border border-violet-700/30 bg-gradient-to-br from-violet-900/20 to-fuchsia-900/10 p-8"
            >
              <Badge className="mb-4 bg-violet-900/50 text-violet-300 border-violet-700/50 px-3 py-1 text-xs">
                The Solution
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
                LoopLens Gives You{" "}
                <span className="text-violet-400">Crystal Clarity</span>
              </h2>
              <p className="text-gray-300 mb-8 leading-relaxed">
                LoopLens automatically captures every session and surfaces
                exactly where players struggle, what they ignore, and when they
                quit—without any manual instrumentation work on your end.
              </p>
              <ul className="space-y-4">
                {[
                  "Watch real session replays, not abstract logs",
                  "Spot drop-off moments down to the exact game event",
                  "Aggregate patterns across thousands of sessions",
                  "Prioritize fixes that actually move the retention needle",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-violet-400 mt-0.5 shrink-0" />
                    <span className="text-gray-300 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button className="bg-violet-600 hover:bg-violet-500 text-white h-11 px-6 w-full group">
                      Fix Your Drop-off Today
                      <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link to="/dashboard">
                    <Button className="bg-violet-600 hover:bg-violet-500 text-white h-11 px-6 w-full">
                      Go to Dashboard
                    </Button>
                  </Link>
                </SignedIn>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section
        id="features"
        className="px-4 md:px-8 lg:px-16 py-20 md:py-28"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-14">
            <Badge className="mb-4 bg-violet-900/40 text-violet-300 border-violet-700/50 px-3 py-1 text-xs">
              Features
            </Badge>
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              Everything You Need to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                Understand Your Players
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
              Three powerful tools designed specifically for indie game
              developers who want real answers, not vanity metrics.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div key={i} {...stagger(i)}>
                <Card className="h-full bg-white/[0.03] border-white/10 hover:border-violet-700/40 hover:bg-white/[0.05] transition-all duration-300 group">
                  <CardHeader className="pb-3">
                    <div className="w-12 h-12 rounded-xl bg-violet-900/40 border border-violet-700/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <Badge className="self-start mb-2 bg-violet-900/30 text-violet-400 border-violet-800/40 text-xs">
                      {feature.title}
                    </Badge>
                    <CardTitle className="text-lg font-bold text-white leading-snug">
                      {feature.headline}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF / STATS ── */}
      <section className="px-4 md:px-8 lg:px-16 py-16 bg-[#07070f] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            {...fadeUp}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {[
              { value: "2,400+", label: "Game Sessions Analyzed" },
              { value: "340+", label: "Indie Devs Trust Us" },
              { value: "41%", label: "Avg. Retention Improvement" },
              { value: "14 days", label: "Free Trial" },
            ].map((stat, i) => (
              <motion.div key={i} {...stagger(i)}>
                <p className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section
        id="pricing"
        className="px-4 md:px-8 lg:px-16 py-20 md:py-28"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-14">
            <Badge className="mb-4 bg-violet-900/40 text-violet-300 border-violet-700/50 px-3 py-1 text-xs">
              Pricing
            </Badge>
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-base">
              No hidden fees. No per-event charges. Just flat monthly pricing
              that scales with your studio.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Solo Plan */}
            <motion.div {...stagger(0)}>
              <Card className="h-full bg-white/[0.03] border-white/10 hover:border-violet-700/40 transition-all duration-300">
                <CardHeader className="pb-4">
                  <Badge className="self-start mb-3 bg-slate-800 text-slate-300 border-slate-700 text-xs">
                    Solo Developer
                  </Badge>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-4xl md:text-5xl font-extrabold text-white">
                      $29
                    </span>
                    <span className="text-gray-400 mb-2">/month</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Everything you need to understand your first 1,000 players.
                  </p>
                </CardHeader>
                <CardContent className="space-y-5">
                  <ul className="space-y-3">
                    {soloFeatures.map((f, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-violet-400 shrink-0" />
                        <span className="text-sm text-gray-300">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button
                        variant="outline"
                        className="w-full border-violet-700/50 text-violet-300 hover:bg-violet-900/30 hover:border-violet-600 h-11 mt-2"
                      >
                        Start Free Trial
                      </Button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Link to="/dashboard">
                      <Button
                        variant="outline"
                        className="w-full border-violet-700/50 text-violet-300 hover:bg-violet-900/30 h-11 mt-2"
                      >
                        Get Started
                      </Button>
                    </Link>
                  </SignedIn>
                </CardContent>
              </Card>
            </motion.div>

            {/* Studio Plan */}
            <motion.div {...stagger(1)}>
              <Card className="h-full bg-gradient-to-b from-violet-900/30 to-fuchsia-900/10 border-violet-600/40 shadow-xl shadow-violet-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-violet-600 text-white border-violet-500 text-xs">
                      Small Studio
                    </Badge>
                    <Badge className="bg-fuchsia-900/50 text-fuchsia-300 border-fuchsia-700/50 text-xs">
                      Most Popular
                    </Badge>
                  </div>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-4xl md:text-5xl font-extrabold text-white">
                      $99
                    </span>
                    <span className="text-gray-400 mb-2">/month</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Scale your analytics as your studio and player base grow.
                  </p>
                </CardHeader>
                <CardContent className="space-y-5">
                  <ul className="space-y-3">
                    {studioFeatures.map((f, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-violet-400 shrink-0" />
                        <span className="text-sm text-gray-300">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button className="w-full bg-violet-600 hover:bg-violet-500 text-white h-11 mt-2 shadow-lg shadow-violet-900/40">
                        Start Free Trial
                      </Button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Link to="/dashboard">
                      <Button className="w-full bg-violet-600 hover:bg-violet-500 text-white h-11 mt-2">
                        Get Started
                      </Button>
                    </Link>
                  </SignedIn>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.p
            {...stagger(2)}
            className="text-center text-sm text-gray-500 mt-8"
          >
            Both plans include a{" "}
            <span className="text-violet-400 font-medium">
              14-day free trial
            </span>
            . No credit card required. Cancel anytime.
          </motion.p>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="px-4 md:px-8 lg:px-16 py-20 md:py-28 bg-[#07070f]">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <div className="inline-flex items-center gap-2 bg-violet-900/40 border border-violet-700/40 rounded-full px-4 py-1.5 text-sm text-violet-300 mb-6">
              <Zap className="w-3.5 h-3.5 fill-violet-400 text-violet-400" />
              Start capturing sessions in minutes
            </div>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold mb-6 leading-tight">
              Your Players Are Trying to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                Tell You Something.
              </span>{" "}
              Start Listening.
            </h2>
            <p className="text-gray-400 text-base md:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Every session without LoopLens is a session where players quit and
              you never find out why. Join hundreds of indie developers who've
              stopped guessing and started growing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button
                    size="lg"
                    className="bg-violet-600 hover:bg-violet-500 text-white h-12 px-10 text-base font-semibold shadow-xl shadow-violet-900/40 group"
                  >
                    Start Free Trial — No Credit Card
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link to="/dashboard">
                  <Button
                    size="lg"
                    className="bg-violet-600 hover:bg-violet-500 text-white h-12 px-10 text-base font-semibold shadow-xl shadow-violet-900/40"
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              </SignedIn>
              <a href="#pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 h-12 px-8 text-base"
                >
                  View Pricing
                </Button>
              </a>
            </div>
            <p className="mt-6 text-sm text-gray-600">
              14-day free trial · No credit card · Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/10 px-4 md:px-8 lg:px-16 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <Eye className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-base font-bold text-white">LoopLens</span>
          </div>
          <p className="text-sm text-gray-500 text-center">
            Gain Clear Insights into Player Behavior
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#features"
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Pricing
            </a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} LoopLens. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}