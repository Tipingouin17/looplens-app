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
  AlertCircle,
  LineChart,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const stagger = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      {/* STICKY NAVBAR */}
      <header className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-violet-400 transition-colors">
              LoopLens
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
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
                  className="text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button
                  size="sm"
                  className="bg-violet-600 hover:bg-violet-500 text-white h-10 px-4"
                >
                  Start Free Trial
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link to="/dashboard">
                <Button
                  size="sm"
                  className="bg-violet-600 hover:bg-violet-500 text-white h-10 px-4"
                >
                  Go to Dashboard
                </Button>
              </Link>
            </SignedIn>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
          <div className="md:hidden border-t border-gray-800 bg-gray-950 px-4 py-4 flex flex-col gap-4">
            <a
              href="#features"
              className="text-sm text-gray-300 hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm text-gray-300 hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </a>
            <SignedIn>
              <Link
                to="/dashboard"
                className="text-sm text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            </SignedIn>
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-800">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button
                    variant="outline"
                    className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 h-10"
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

      {/* HERO SECTION */}
      <section className="relative overflow-hidden px-4 md:px-8 lg:px-16 pt-20 pb-28">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute top-20 left-1/4 w-[400px] h-[300px] bg-indigo-600/8 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div {...stagger(0)}>
            <Badge className="mb-6 bg-violet-950 text-violet-300 border border-violet-700 hover:bg-violet-900 px-4 py-1.5 text-xs font-medium tracking-wide uppercase">
              Session Analytics for Indie Developers
            </Badge>
          </motion.div>

          <motion.h1
            {...stagger(0.1)}
            className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white mb-6"
          >
            Stop Guessing Why Players Leave.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
              Know Exactly What Happens
            </span>{" "}
            in Every Game Session.
          </motion.h1>

          <motion.p
            {...stagger(0.2)}
            className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Capture real player behavior and turn session data into actionable
            insights. LoopLens reveals the exact moments players quit—so you can
            fix them and keep players coming back.
          </motion.p>

          <motion.div
            {...stagger(0.3)}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <SignedOut>
              <SignInButton mode="modal">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-violet-600 hover:bg-violet-500 text-white h-12 px-8 text-base font-semibold shadow-lg shadow-violet-900/40"
                >
                  Start Free Trial — No Credit Card
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link to="/dashboard">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-violet-600 hover:bg-violet-500 text-white h-12 px-8 text-base font-semibold shadow-lg shadow-violet-900/40"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </SignedIn>
            <a href="#features">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white h-12 px-8 text-base"
              >
                <Play className="mr-2 w-4 h-4" />
                See How It Works
              </Button>
            </a>
          </motion.div>

          {/* Social proof bar */}
          <motion.div
            {...stagger(0.4)}
            className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>14-day free trial</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-700" />
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-700" />
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </motion.div>
        </div>

        {/* Hero Dashboard Preview */}
        <motion.div
          {...stagger(0.5)}
          className="relative max-w-5xl mx-auto mt-16"
        >
          <div className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden shadow-2xl shadow-black/50">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/60 border-b border-gray-700">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-3 text-xs text-gray-500 font-mono">
                LoopLens — Session Analytics
              </span>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-800/70 rounded-xl p-4 border border-gray-700">
                <p className="text-xs text-gray-500 mb-1">Avg. Session Length</p>
                <p className="text-2xl font-bold text-white">4m 32s</p>
                <p className="text-xs text-green-400 mt-1">↑ 12% this week</p>
              </div>
              <div className="bg-gray-800/70 rounded-xl p-4 border border-gray-700">
                <p className="text-xs text-gray-500 mb-1">Day-7 Retention</p>
                <p className="text-2xl font-bold text-white">34.2%</p>
                <p className="text-xs text-green-400 mt-1">↑ 8% after fix</p>
              </div>
              <div className="bg-gray-800/70 rounded-xl p-4 border border-gray-700">
                <p className="text-xs text-gray-500 mb-1">Drop-off Events</p>
                <p className="text-2xl font-bold text-white">Level 3</p>
                <p className="text-xs text-red-400 mt-1">67% quit here</p>
              </div>
              <div className="sm:col-span-3 bg-gray-800/70 rounded-xl p-4 border border-gray-700">
                <p className="text-xs text-gray-500 mb-3">
                  Session Heatmap — Level 3 Drop-off
                </p>
                <div className="flex items-end gap-1 h-16">
                  {[40, 55, 70, 90, 85, 67, 45, 30, 20, 15, 10, 8].map(
                    (h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm"
                        style={{
                          height: `${h}%`,
                          background:
                            h > 60
                              ? "rgba(167,139,250,0.8)"
                              : "rgba(167,139,250,0.3)",
                        }}
                      />
                    )
                  )}
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-600">
                  <span>Start</span>
                  <span>Level 3 Boss</span>
                  <span>Exit</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* PROBLEM / SOLUTION SECTION */}
      <section className="px-4 md:px-8 lg:px-16 py-24 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <Badge className="mb-4 bg-red-950 text-red-300 border border-red-800 px-3 py-1 text-xs uppercase tracking-wide">
              The Problem
            </Badge>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
              You Ship Updates Blind
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
              Most indie developers rely on gut feelings and sparse reviews to
              understand player behavior. That guesswork costs you players every
              single day.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {[
              {
                icon: AlertCircle,
                color: "text-red-400",
                bg: "bg-red-950/30 border-red-800/40",
                title: "Players quit and you don't know why",
                desc: "Your game gets 1-star reviews mentioning \"that one level\" but you have no data to identify which level or what specifically went wrong.",
              },
              {
                icon: Gamepad2,
                color: "text-orange-400",
                bg: "bg-orange-950/30 border-orange-800/40",
                title: "Surveys don't capture real behavior",
                desc: "Players rarely fill out feedback forms. And even when they do, what they say they do and what they actually do are completely different.",
              },
              {
                icon: Zap,
                color: "text-yellow-400",
                bg: "bg-yellow-950/30 border-yellow-800/40",
                title: "You fix the wrong things first",
                desc: "Without data, you spend weeks polishing features nobody uses while the actual drop-off point—the real reason players quit—goes unfixed.",
              },
            ].map((item, i) => (
              <motion.div key={i} {...stagger(i * 0.1)}>
                <Card className={`border ${item.bg} bg-transparent h-full`}>
                  <CardHeader className="pb-3">
                    <item.icon className={`w-8 h-8 ${item.color} mb-3`} />
                    <CardTitle className="text-white text-base font-semibold">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Solution transition */}
          <motion.div {...fadeUp} className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-violet-600/20 border border-violet-600/40 mb-6">
              <ArrowRight className="w-5 h-5 text-violet-400" />
            </div>
            <Badge className="mb-4 bg-violet-950 text-violet-300 border border-violet-700 px-3 py-1 text-xs uppercase tracking-wide">
              The Solution
            </Badge>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
              LoopLens Gives You the Full Picture
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
              LoopLens captures every game session and transforms raw behavioral
              data into clear, actionable insights. See exactly where players
              struggle, why they quit, and what keeps them coming back.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {[
              "Pinpoint the exact level or moment players quit",
              "Replay real sessions frame by frame",
              "Identify friction patterns across hundreds of players",
              "Measure the impact of every update you ship",
              "Know which features players love and which they ignore",
              "Make data-driven decisions in minutes, not weeks",
            ].map((benefit, i) => (
              <motion.div
                key={i}
                {...stagger(i * 0.07)}
                className="flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-violet-400 mt-0.5 shrink-0" />
                <span className="text-gray-300 text-sm">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="px-4 md:px-8 lg:px-16 py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <Badge className="mb-4 bg-indigo-950 text-indigo-300 border border-indigo-800 px-3 py-1 text-xs uppercase tracking-wide">
              Features
            </Badge>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to Understand Your Players
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
              Built specifically for indie developers—powerful analytics without
              the enterprise complexity.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: Play,
                color: "text-violet-400",
                iconBg: "bg-violet-900/40 border-violet-700/50",
                title: "Session Capture & Playback",
                subtitle: "See Your Game Through Player Eyes",
                desc: "LoopLens automatically records every game session—from first launch to the moment players quit. Replay exactly what happened, where they struggled, and what caused them to leave. No guesswork. No surveys. Pure behavioral data that shows you the real story behind your player drop-off.",
                tags: ["Auto-record", "Full Playback", "Event Timeline"],
              },
              {
                icon: BarChart3,
                color: "text-indigo-400",
                iconBg: "bg-indigo-900/40 border-indigo-700/50",
                title: "Player Behavior Insights",
                subtitle: "Understand the Why Behind the Quit",
                desc: "Identify patterns across hundreds of sessions. Which levels cause the most friction? Where do players spend the most time? What features do they never use? LoopLens aggregates session data into clear, actionable insights so you can prioritize fixes that actually matter.",
                tags: ["Pattern Detection", "Friction Maps", "Feature Usage"],
              },
              {
                icon: TrendingUp,
                color: "text-emerald-400",
                iconBg: "bg-emerald-900/40 border-emerald-700/50",
                title: "Retention Analytics Dashboard",
                subtitle: "Track Engagement, Churn & Trends",
                desc: "Watch your retention metrics in real-time. See which updates moved the needle, which features drive engagement, and where players consistently abandon your game. Built for indie developers—simple enough for solo devs, powerful enough for growing studios.",
                tags: ["Real-time Data", "Churn Tracking", "Update Impact"],
              },
            ].map((feature, i) => (
              <motion.div key={i} {...stagger(i * 0.15)}>
                <Card className="border border-gray-800 bg-gray-900/60 hover:bg-gray-900 hover:border-gray-700 transition-all duration-300 h-full group">
                  <CardHeader className="pb-4">
                    <div
                      className={`w-12 h-12 rounded-xl border ${feature.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <p className={`text-xs font-semibold uppercase tracking-wide ${feature.color} mb-1`}>
                      {feature.subtitle}
                    </p>
                    <CardTitle className="text-white text-lg font-bold">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-400 text-sm leading-relaxed mb-5">
                      {feature.desc}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {feature.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-400 border border-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Additional feature highlights */}
          <motion.div
            {...fadeUp}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              {
                icon: Eye,
                title: "Heatmaps",
                desc: "Visual overlay showing where players spend time in every level",
              },
              {
                icon: LineChart,
                title: "Funnel Analysis",
                desc: "Track player progression and identify where your funnel leaks",
              },
              {
                icon: Users,
                title: "Cohort Tracking",
                desc: "Compare behavior between player groups and update cohorts",
              },
              {
                icon: Zap,
                title: "Instant Alerts",
                desc: "Get notified when drop-off spikes after shipping a new build",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-xl bg-gray-900/40 border border-gray-800"
              >
                <div className="w-8 h-8 rounded-lg bg-violet-900/40 border border-violet-700/40 flex items-center justify-center shrink-0 mt-0.5">
                  <item.icon className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold mb-1">
                    {item.title}
                  </p>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section
        id="pricing"
        className="px-4 md:px-8 lg:px-16 py-24 bg-gray-900/50"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <Badge className="mb-4 bg-violet-950 text-violet-300 border border-violet-700 px-3 py-1 text-xs uppercase tracking-wide">
              Simple Pricing
            </Badge>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
              Start Free. Scale When You're Ready.
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-base md:text-lg">
              No complicated tiers. No hidden fees. Pick the plan that fits
              where you are today.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Solo Plan */}
            <motion.div {...stagger(0)}>
              <Card className="border border-gray-700 bg-gray-900 h-full relative">
                <CardHeader className="pb-4">
                  <p className="text-sm font-semibold text-violet-400 mb-1">
                    Solo Developer
                  </p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-4xl font-extrabold text-white">
                      $29
                    </span>
                    <span className="text-gray-500 mb-1.5">/month</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Everything you need as an indie solo dev to understand and
                    retain your players.
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {[
                      "Up to 10,000 sessions/month",
                      "Session capture & full playback",
                      "Player behavior insights",
                      "Retention analytics dashboard",
                      "Heatmaps & funnel analysis",
                      "Email alerts for drop-off spikes",
                      "14-day free trial",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-violet-400 shrink-0" />
                        <span className="text-gray-300 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button className="w-full bg-violet-600 hover:bg-violet-500 text-white h-11 font-semibold">
                        Start Free Trial
                      </Button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Link to="/dashboard">
                      <Button className="w-full bg-violet-600 hover:bg-violet-500 text-white h-11 font-semibold">
                        Go to Dashboard
                      </Button>
                    </Link>
                  </SignedIn>
                </CardContent>
              </Card>
            </motion.div>

            {/* Studio Plan */}
            <motion.div {...stagger(0.1)}>
              <Card className="border-2 border-violet-500 bg-gray-900 h-full relative overflow-hidden">
                {/* Popular badge */}
                <div className="absolute top-0 right-0">
                  <div className="bg-violet-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                    MOST POPULAR
                  </div>
                </div>
                <CardHeader className="pb-4 pt-8">
                  <p className="text-sm font-semibold text-violet-400 mb-1">
                    Small Studio
                  </p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-4xl font-extrabold text-white">
                      $99
                    </span>
                    <span className="text-gray-500 mb-1.5">/month</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    For growing studios that need deeper analytics and team
                    collaboration.
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {[
                      "Up to 100,000 sessions/month",
                      "Everything in Solo Developer",
                      "Up to 5 team members",
                      "Multi-game support",
                      "Cohort & A/B test analysis",
                      "Priority support & onboarding",
                      "Custom retention reports",
                      "14-day free trial",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-violet-400 shrink-0" />
                        <span className="text-gray-300 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button className="w-full bg-violet-600 hover:bg-violet-500 text-white h-11 font-semibold border-0">
                        Start Free Trial
                      </Button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Link to="/dashboard">
                      <Button className="w-full bg-violet-600 hover:bg-violet-500 text-white h-11 font-semibold">
                        Go to Dashboard
                      </Button>
                    </Link>
                  </SignedIn>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.p
            {...stagger(0.3)}
            className="text-center text-gray-500 text-sm mt-8"
          >
            All plans include a 14-day free trial. No credit card required to
            start. Cancel anytime.
          </motion.p>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="px-4 md:px-8 lg:px-16 py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            {...fadeUp}
            className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-violet-900/60 via-indigo-900/40 to-gray-900 border border-violet-700/40 p-8 md:p-16 text-center"
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-violet-600/10 rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <Badge className="mb-6 bg-violet-900/60 text-violet-300 border border-violet-600/50 px-4 py-1.5 text-xs uppercase tracking-wide">
                Start Today — Free
              </Badge>
              <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
                Your Next Update Should Be Driven by Data,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                  Not Guesses
                </span>
              </h2>
              <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto mb-10">
                Join indie developers who stopped shipping blind. Start your free
                trial today and discover exactly why players are leaving—before
                your next update.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-white text-gray-900 hover:bg-gray-100 h-12 px-8 text-base font-bold shadow-xl"
                    >
                      Start Free Trial — No Credit Card
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link to="/dashboard">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-white text-gray-900 hover:bg-gray-100 h-12 px-8 text-base font-bold shadow-xl"
                    >
                      Go to Dashboard
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </SignedIn>
                <a href="#pricing">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto border-violet-600/60 text-violet-300 hover:bg-violet-900/40 h-12 px-8 text-base"
                  >
                    View Pricing
                  </Button>
                </a>
              </div>
              <p className="text-gray-600 text-sm mt-6">
                14-day free trial · No credit card · Cancel anytime
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-800 px-4 md:px-8 lg:px-16 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Eye className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-base font-bold text-white">LoopLens</span>
          </div>

          <p className="text-gray-600 text-sm text-center">
            Gain Clear Insights into Player Behavior
          </p>

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#features" className="hover:text-gray-300 transition-colors">
              Features
            </a>
            <a href="#pricing" className="hover:text-gray-300 transition-colors">
              Pricing
            </a>
            <SignedIn>
              <Link to="/dashboard" className="hover:text-gray-300 transition-colors">
                Dashboard
              </Link>
            </SignedIn>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-gray-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} LoopLens. All rights reserved.</p>
          <p>Built for indie game developers who care about player retention.</p>
        </div>
      </footer>
    </div>
  );
}