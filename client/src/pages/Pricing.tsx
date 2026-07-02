import { useState } from "react";
import { Check, Zap, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignInButton } from "@clerk/clerk-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

const SOLO_PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ID;
const STUDIO_PRICE_ID = import.meta.env.VITE_STRIPE_STUDIO_PRICE_ID ?? import.meta.env.VITE_STRIPE_PRICE_ID;

const soloFeatures = [
  "Up to 3 active game projects",
  "Loop analysis & playtest insights",
  "AI-powered feedback summaries",
  "Basic retention heatmaps",
  "Export reports as PDF",
  "Community support",
  "1 team seat",
];

const studioFeatures = [
  "Unlimited game projects",
  "Advanced loop & funnel analysis",
  "AI-powered feedback summaries",
  "Full retention & churn heatmaps",
  "Custom KPI dashboards",
  "Priority Slack & email support",
  "Up to 10 team seats",
  "API access & webhooks",
  "White-label reports",
  "Dedicated onboarding session",
];

interface PlanCardProps {
  icon: React.ReactNode;
  name: string;
  price: number;
  description: string;
  features: string[];
  priceId: string;
  highlighted?: boolean;
  badge?: string;
}

function PlanCard({
  icon,
  name,
  price,
  description,
  features,
  priceId,
  highlighted = false,
  badge,
}: PlanCardProps) {
  const { user, loading } = useAuth();

  const checkoutMutation = trpc.payments.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });

  const handleCheckout = () => {
    checkoutMutation.mutate({ priceId });
  };

  return (
    <Card
      className={`relative flex flex-col transition-all duration-300 ${
        highlighted
          ? "border-2 border-violet-500 shadow-2xl shadow-violet-500/20 scale-[1.02]"
          : "border border-border hover:border-violet-400/50 hover:shadow-lg"
      }`}
    >
      {badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg tracking-wide uppercase">
            {badge}
          </span>
        </div>
      )}

      <CardHeader className="pb-4 pt-8 px-6 md:px-8">
        <div
          className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
            highlighted
              ? "bg-violet-600 text-white"
              : "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
          }`}
        >
          {icon}
        </div>

        <CardTitle className="text-xl font-bold text-foreground">{name}</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>

        <div className="mt-4 flex items-end gap-1">
          <span className="text-5xl font-extrabold tracking-tight text-foreground">
            ${price}
          </span>
          <span className="text-muted-foreground mb-2 text-base">/month</span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 px-6 md:px-8 pb-8">
        <ul className="space-y-3 mb-8 flex-1">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm">
              <span
                className={`mt-0.5 flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full ${
                  highlighted
                    ? "bg-violet-600 text-white"
                    : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                <Check className="w-3 h-3" strokeWidth={3} />
              </span>
              <span className="text-muted-foreground leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>

        {loading ? (
          <Button
            disabled
            className="w-full h-12 text-base font-semibold"
            variant={highlighted ? "default" : "outline"}
          >
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Loading…
          </Button>
        ) : user ? (
          <Button
            onClick={handleCheckout}
            disabled={checkoutMutation.isPending}
            className={`w-full h-12 text-base font-semibold transition-all ${
              highlighted
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50"
                : "border-violet-400 text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20"
            }`}
            variant={highlighted ? "default" : "outline"}
          >
            {checkoutMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Redirecting…
              </>
            ) : (
              `Get ${name}`
            )}
          </Button>
        ) : (
          <SignInButton mode="modal">
            <Button
              className={`w-full h-12 text-base font-semibold transition-all ${
                highlighted
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50"
                  : "border-violet-400 text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20"
              }`}
              variant={highlighted ? "default" : "outline"}
            >
              Get Started
            </Button>
          </SignInButton>
        )}

        {checkoutMutation.isError && (
          <p className="mt-3 text-xs text-destructive text-center">
            Something went wrong. Please try again.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Pricing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link to="/">
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer select-none">
              LoopLens
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/">
              <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                Home
              </span>
            </Link>
            <Link to="/pricing">
              <span className="text-sm font-medium text-foreground cursor-pointer">
                Pricing
              </span>
            </Link>
            <Link to="/dashboard">
              <Button size="sm" className="h-9 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                Dashboard
              </Button>
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-md hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <span
              className={`block w-5 h-0.5 bg-foreground transition-transform duration-200 ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`block w-5 h-0.5 bg-foreground transition-opacity duration-200 ${mobileMenuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block w-5 h-0.5 bg-foreground transition-transform duration-200 ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/60 bg-background px-4 py-4 flex flex-col gap-4">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              <span className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer py-1">
                Home
              </span>
            </Link>
            <Link to="/pricing" onClick={() => setMobileMenuOpen(false)}>
              <span className="block text-sm font-medium text-foreground cursor-pointer py-1">
                Pricing
              </span>
            </Link>
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full h-10 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                Dashboard
              </Button>
            </Link>
          </div>
        )}
      </header>

      {/* Hero section */}
      <section className="px-4 md:px-8 pt-16 pb-12 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wide uppercase">
          <Zap className="w-3.5 h-3.5" />
          Simple, transparent pricing
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4">
          Understand your game loops.{" "}
          <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Grow faster.
          </span>
        </h1>

        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          LoopLens gives indie developers and studios deep playtest analytics and
          AI-driven insights to tighten feedback loops and ship better games.
          Start free, upgrade when you're ready.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          {["No credit card to explore", "Cancel anytime", "14-day money-back guarantee"].map(
            (item) => (
              <span key={item} className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-500" />
                {item}
              </span>
            )
          )}
        </div>
      </section>

      {/* Pricing cards */}
      <section className="px-4 md:px-8 pb-20 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-stretch pt-6">
          <PlanCard
            icon={<Zap className="w-6 h-6" />}
            name="Solo"
            price={29}
            description="Perfect for indie developers shipping their first or next hit."
            features={soloFeatures}
            priceId={SOLO_PRICE_ID}
            highlighted={false}
          />
          <PlanCard
            icon={<Building2 className="w-6 h-6" />}
            name="Studio"
            price={99}
            description="Built for small studios managing multiple titles and teams."
            features={studioFeatures}
            priceId={STUDIO_PRICE_ID}
            highlighted={true}
            badge="Most Popular"
          />
        </div>
      </section>

      {/* FAQ / Trust section */}
      <section className="px-4 md:px-8 pb-24 max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 tracking-tight">
          Frequently asked questions
        </h2>

        <div className="space-y-6">
          {[
            {
              q: "Can I switch plans later?",
              a: "Absolutely. You can upgrade or downgrade at any time from your dashboard. Changes are prorated automatically.",
            },
            {
              q: "What counts as a game project?",
              a: "A game project is any title you've connected to LoopLens via our SDK or data import. Solo plan supports up to 3 active projects; Studio is unlimited.",
            },
            {
              q: "Is there a free trial?",
              a: "Every new account gets a 14-day money-back guarantee. If LoopLens doesn't help you ship better games, we'll refund you — no questions asked.",
            },
            {
              q: "How does team seating work on Studio?",
              a: "Studio includes up to 10 seats. Each seat can have custom roles (admin, analyst, viewer). Additional seats can be added for $9/month each.",
            },
            {
              q: "What payment methods do you accept?",
              a: "We accept all major credit and debit cards via Stripe. Annual billing with a 2-month discount is available on request.",
            },
          ].map(({ q, a }) => (
            <div
              key={q}
              className="border border-border rounded-xl px-6 py-5 hover:border-violet-400/50 transition-colors"
            >
              <h3 className="font-semibold text-foreground mb-2 text-sm md:text-base">{q}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA banner */}
      <section className="px-4 md:px-8 pb-24">
        <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-8 md:p-12 text-white text-center shadow-2xl shadow-violet-500/30">
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-3">
            Ready to level up your game analytics?
          </h2>
          <p className="text-violet-100 text-sm md:text-base mb-8 max-w-xl mx-auto leading-relaxed">
            Join hundreds of developers who use LoopLens to understand player
            behaviour, reduce churn, and ship games players love.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard">
              <Button
                size="lg"
                className="w-full sm:w-auto h-12 px-8 bg-white text-violet-700 hover:bg-violet-50 font-bold text-base shadow-lg"
              >
                Go to Dashboard
              </Button>
            </Link>
            <SignInButton mode="modal">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-12 px-8 border-white/60 text-white hover:bg-white/10 font-semibold text-base"
              >
                Sign Up Free
              </Button>
            </SignInButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span className="font-bold text-base bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            LoopLens
          </span>
          <p>© {new Date().getFullYear()} LoopLens. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-foreground transition-colors cursor-pointer">Privacy</span>
            <span className="hover:text-foreground transition-colors cursor-pointer">Terms</span>
            <span className="hover:text-foreground transition-colors cursor-pointer">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}