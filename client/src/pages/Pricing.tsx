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

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  period: string;
  priceId: string;
  icon: React.ReactNode;
  highlight: boolean;
  badge: string | null;
  features: string[];
  cta: string;
}

const plans: Plan[] = [
  {
    id: "solo",
    name: "Solo Developer",
    description: "Perfect for indie devs building their next hit game.",
    price: 29,
    period: "month",
    priceId: SOLO_PRICE_ID,
    icon: <Zap className="w-6 h-6 text-violet-500" />,
    highlight: false,
    badge: null,
    features: [
      "1 active game project",
      "Loop analytics & heatmaps",
      "Session replay (up to 500/mo)",
      "Player behavior funnels",
      "Basic retention metrics",
      "CSV export",
      "Email support",
      "14-day free trial",
    ],
    cta: "Start Free Trial",
  },
  {
    id: "studio",
    name: "Small Studio",
    description: "Built for teams shipping multiple titles at scale.",
    price: 99,
    period: "month",
    priceId: STUDIO_PRICE_ID,
    icon: <Building2 className="w-6 h-6 text-violet-300" />,
    highlight: true,
    badge: "Most Popular",
    features: [
      "Up to 10 active game projects",
      "Advanced loop analytics & heatmaps",
      "Unlimited session replays",
      "Player behavior funnels",
      "Cohort & retention analysis",
      "A/B test tracking",
      "Team seats (up to 10 members)",
      "API access & webhooks",
      "Priority support + Slack channel",
      "14-day free trial",
    ],
    cta: "Start Free Trial",
  },
];

function PlanCard({ plan }: { plan: Plan }) {
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState(false);

  const checkoutMutation = trpc.payments.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      setLoadingPlan(false);
    },
  });

  const handleCheckout = () => {
    setLoadingPlan(true);
    checkoutMutation.mutate({ priceId: plan.priceId });
  };

  const isPending = checkoutMutation.isPending || loadingPlan;

  return (
    <Card
      className={`relative flex flex-col transition-all duration-300 ${
        plan.highlight
          ? "border-violet-500 shadow-2xl shadow-violet-500/20 scale-[1.02] bg-gradient-to-b from-violet-950/60 to-slate-900/80"
          : "border-slate-700/60 bg-slate-900/60 hover:border-slate-600"
      }`}
    >
      {plan.badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-gradient-to-r from-violet-600 to-purple-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-violet-500/30 uppercase tracking-wide">
            {plan.badge}
          </span>
        </div>
      )}

      <CardHeader className="pb-4 pt-8 px-6">
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              plan.highlight ? "bg-violet-500/20" : "bg-slate-800"
            }`}
          >
            {plan.icon}
          </div>
          <CardTitle
            className={`text-xl font-bold ${
              plan.highlight ? "text-white" : "text-slate-100"
            }`}
          >
            {plan.name}
          </CardTitle>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed">{plan.description}</p>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 px-6 pb-8">
        <div className="mb-6">
          <div className="flex items-end gap-1">
            <span
              className={`text-5xl font-extrabold tracking-tight ${
                plan.highlight ? "text-white" : "text-slate-100"
              }`}
            >
              ${plan.price}
            </span>
            <span className="text-slate-400 text-sm mb-2">/ {plan.period}</span>
          </div>
          <p className="text-slate-500 text-xs mt-1">Billed monthly. Cancel anytime.</p>
        </div>

        <ul className="space-y-3 mb-8 flex-1">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <div
                className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  plan.highlight ? "bg-violet-500/20" : "bg-slate-800"
                }`}
              >
                <Check
                  className={`w-3 h-3 ${
                    plan.highlight ? "text-violet-400" : "text-emerald-400"
                  }`}
                />
              </div>
              <span className="text-slate-300 text-sm leading-snug">{feature}</span>
            </li>
          ))}
        </ul>

        {user ? (
          <Button
            onClick={handleCheckout}
            disabled={isPending}
            className={`w-full h-12 text-base font-semibold transition-all duration-200 ${
              plan.highlight
                ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                : "bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 hover:border-slate-500"
            }`}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Redirecting…
              </>
            ) : (
              plan.cta
            )}
          </Button>
        ) : (
          <SignInButton mode="modal">
            <Button
              className={`w-full h-12 text-base font-semibold transition-all duration-200 ${
                plan.highlight
                  ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                  : "bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 hover:border-slate-500"
              }`}
            >
              {plan.cta}
            </Button>
          </SignInButton>
        )}
      </CardContent>
    </Card>
  );
}

export default function Pricing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-white group-hover:text-violet-300 transition-colors">
                LoopLens
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/pricing"
                className="text-sm text-violet-400 font-medium"
              >
                Pricing
              </Link>
              {user ? (
                <Link to="/dashboard">
                  <Button
                    size="sm"
                    className="bg-violet-600 hover:bg-violet-500 text-white h-9 px-4"
                  >
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <SignInButton mode="modal">
                  <Button
                    size="sm"
                    className="bg-violet-600 hover:bg-violet-500 text-white h-9 px-4"
                  >
                    Sign In
                  </Button>
                </SignInButton>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex flex-col gap-1.5 p-2 rounded-md hover:bg-slate-800 transition-colors"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              <span
                className={`block w-5 h-0.5 bg-slate-300 transition-all duration-200 ${
                  menuOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-slate-300 transition-all duration-200 ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-slate-300 transition-all duration-200 ${
                  menuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </button>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden border-t border-slate-800 py-4 flex flex-col gap-3">
              <Link
                to="/pricing"
                className="text-sm text-violet-400 font-medium px-2"
                onClick={() => setMenuOpen(false)}
              >
                Pricing
              </Link>
              {user ? (
                <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                  <Button className="w-full bg-violet-600 hover:bg-violet-500 text-white h-10">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <SignInButton mode="modal">
                  <Button className="w-full bg-violet-600 hover:bg-violet-500 text-white h-10">
                    Sign In
                  </Button>
                </SignInButton>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Hero section */}
      <section className="px-4 md:px-8 pt-16 pb-10 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-violet-300 text-xs font-semibold uppercase tracking-wide">
            Simple, transparent pricing
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4 bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Understand your players.
          <br />
          Tighten every loop.
        </h1>

        <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          LoopLens gives indie developers and studios deep behavioral insights to
          build more engaging games — no data science degree required. Pick the
          plan that fits your team.
        </p>
      </section>

      {/* Pricing cards */}
      <section className="px-4 md:px-8 pb-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </section>

      {/* FAQ / trust strip */}
      <section className="px-4 md:px-8 pb-16 max-w-3xl mx-auto">
        <h2 className="text-xl md:text-2xl font-bold text-center text-white mb-8">
          Frequently asked questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              q: "Is there a free trial?",
              a: "Yes — every plan starts with a 14-day free trial. No credit card required to start.",
            },
            {
              q: "Can I switch plans later?",
              a: "Absolutely. Upgrade or downgrade at any time. Prorated credits are applied automatically.",
            },
            {
              q: "What counts as a game project?",
              a: "Each distinct game title you integrate LoopLens into counts as one project.",
            },
            {
              q: "Do you offer annual billing?",
              a: "Annual billing with a 20% discount is coming soon. Reach out to get early access.",
            },
            {
              q: "What platforms are supported?",
              a: "Unity, Unreal, and Godot SDKs are available. Web-based games via JS snippet too.",
            },
            {
              q: "How do I cancel?",
              a: "Cancel anytime from your dashboard — no hoops, no retention flows. We respect your time.",
            },
          ].map(({ q, a }) => (
            <div
              key={q}
              className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-5 hover:border-slate-700 transition-colors"
            >
              <h3 className="text-sm font-semibold text-white mb-2">{q}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA banner */}
      <section className="px-4 md:px-8 pb-20 max-w-4xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden border border-violet-500/30 bg-gradient-to-br from-violet-900/40 to-purple-900/30 p-8 md:p-12 text-center">
          {/* Decorative blobs */}
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <h2 className="relative text-2xl md:text-4xl font-extrabold text-white mb-3">
            Ready to close the loop?
          </h2>
          <p className="relative text-slate-400 text-sm md:text-base max-w-xl mx-auto mb-8">
            Join hundreds of developers using LoopLens to ship tighter, more
            addictive game experiences. Start your free trial today — no credit
            card needed.
          </p>

          <div className="relative flex flex-col sm:flex-row gap-3 justify-center items-center">
            {user ? (
              <Link to="/dashboard">
                <Button className="h-12 px-8 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-base shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-200">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <SignInButton mode="modal">
                <Button className="h-12 px-8 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-base shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-200">
                  Start Free Trial
                </Button>
              </SignInButton>
            )}
            <Link to="/">
              <Button
                variant="ghost"
                className="h-12 px-6 text-slate-400 hover:text-white hover:bg-slate-800 text-base"
              >
                Learn more
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>