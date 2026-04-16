import React from "react";
import { Switch, Route, Redirect, useLocation, Router as WouterRouter } from 'wouter';
import { ClerkProvider, SignIn, SignUp, Show, useClerk, useUser } from '@clerk/react';
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { UserPlus, Search, CalendarCheck, Rocket } from "lucide-react";

// Pages
import Dashboard from "./pages/dashboard";
import Portfolio from "./pages/portfolio";
import Marketplace from "./pages/marketplace";
import Bookings from "./pages/bookings";
import Chat from "./pages/chat";
import AIAssistant from "./pages/ai-assistant";
import Notifications from "./pages/notifications";
import SettingsPage from "./pages/settings";
import Admin from "./pages/admin";
import NotFound from "@/pages/not-found";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

const HOW_IT_WORKS = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create Your Account",
    desc: "Sign up in seconds. Set up your developer profile, add your skills, and configure your command center dashboard.",
    color: "from-primary/20 to-primary/5",
    border: "border-primary/30",
    glow: "rgba(0,255,255,0.25)",
  },
  {
    icon: Search,
    step: "02",
    title: "Explore the Marketplace",
    desc: "Browse 100+ elite developer services — web apps, DevOps, AI/ML, mobile, and more. Filter by category, price, and delivery time.",
    color: "from-violet-500/20 to-violet-500/5",
    border: "border-violet-500/30",
    glow: "rgba(139,92,246,0.25)",
  },
  {
    icon: CalendarCheck,
    step: "03",
    title: "Book & Collaborate",
    desc: "Hire a developer, schedule a session, and manage everything through the built-in comms system and booking dashboard.",
    color: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/30",
    glow: "rgba(16,185,129,0.25)",
  },
  {
    icon: Rocket,
    step: "04",
    title: "Launch with AI Power",
    desc: "Use the built-in AI Core assistant to plan, debug, and accelerate your projects — powered by GPT and always available.",
    color: "from-orange-500/20 to-orange-500/5",
    border: "border-orange-500/30",
    glow: "rgba(249,115,22,0.25)",
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-y-auto relative">
      {/* Ambient background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_30%_20%,_var(--tw-gradient-stops))] from-primary/8 via-background to-background pointer-events-none z-0" />
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: "linear-gradient(rgba(0,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.4) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      {/* ── HERO ── */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center mb-8 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm shadow-[0_0_30px_rgba(0,255,255,0.12)]">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">SYSTEM ONLINE · v2.0</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-primary/80 to-violet-400 drop-shadow-[0_0_30px_rgba(0,255,255,0.2)]">
            TECHVERSE<br />CORE
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            The unified command center for elite developers.<br />
            <span className="text-foreground/70">Portfolio · Marketplace · Communications · AI</span>
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {[
              { label: "Portfolio", desc: "Showcase projects", href: "/portfolio" },
              { label: "Marketplace", desc: "Find services", href: "/marketplace" },
              { label: "Bookings", desc: "Manage clients", href: "/bookings" },
              { label: "AI Core", desc: "GPT assistant", href: "/ai-assistant" },
            ].map(f => (
              <Link key={f.label} href={f.href}>
                <div className="px-5 py-3 rounded-xl bg-card/40 border border-border/60 backdrop-blur hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 cursor-pointer text-left">
                  <div className="font-bold text-primary text-sm">{f.label}</div>
                  <div className="text-xs text-muted-foreground">{f.desc}</div>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up">
              <button className="px-10 py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-[0_0_25px_rgba(0,255,255,0.4)] hover:shadow-[0_0_45px_rgba(0,255,255,0.65)] hover:scale-105 transition-all duration-300 text-lg">
                GET STARTED FREE
              </button>
            </Link>
            <Link href="/marketplace">
              <button className="px-10 py-4 bg-card/60 text-foreground font-bold rounded-xl border border-border hover:border-primary/50 hover:bg-primary/8 backdrop-blur transition-all duration-300 text-lg">
                BROWSE MARKETPLACE
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-10 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-muted-foreground uppercase tracking-widest">How it works</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="w-5 h-8 rounded-full border-2 border-primary/30 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 bg-primary/60 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative z-10 px-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary mb-3">PROCESS</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            How It Works
          </h2>
          <p className="text-muted-foreground mt-4 text-lg max-w-xl mx-auto">
            From zero to fully operational in four steps.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {/* Connector line on desktop */}
          <div className="hidden md:block absolute top-14 left-1/2 -translate-x-1/2 w-[calc(100%-8rem)] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent pointer-events-none" />

          {HOW_IT_WORKS.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.12 }}
              className={`relative rounded-2xl bg-gradient-to-br ${item.color} border ${item.border} p-8 backdrop-blur-sm overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}
              style={{ boxShadow: `0 0 0 0 ${item.glow}` }}
              whileHover={{ boxShadow: `0 0 40px ${item.glow}` }}
            >
              {/* Step number watermark */}
              <span className="absolute top-4 right-6 text-7xl font-black text-white/[0.04] select-none leading-none">
                {item.step}
              </span>

              <div className="flex items-start gap-5">
                <div className={`shrink-0 w-14 h-14 rounded-xl flex items-center justify-center border ${item.border} bg-background/40 shadow-[0_0_20px_${item.glow}]`}>
                  <item.icon className="w-7 h-7" style={{ color: `${item.glow.replace("rgba(", "rgb(").replace(", 0.25)", ")")}` }} />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">
                    STEP {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-20"
        >
          <p className="text-muted-foreground mb-6 text-lg">Ready to join the network?</p>
          <Link href="/sign-up">
            <button className="px-12 py-5 bg-primary text-primary-foreground font-black rounded-xl text-lg shadow-[0_0_30px_rgba(0,255,255,0.4)] hover:shadow-[0_0_60px_rgba(0,255,255,0.65)] hover:scale-105 transition-all duration-300 tracking-wide">
              INITIALIZE ACCOUNT →
            </button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}

function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      <div className="z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-border/50 rounded-xl overflow-hidden backdrop-blur-sm bg-card/50">
        <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} fallbackRedirectUrl={`${basePath}/dashboard`} appearance={{ elements: { rootBox: "mx-auto", card: "bg-transparent shadow-none border-none" } }} />
      </div>
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-secondary/10 via-background to-background pointer-events-none" />
      <div className="z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-border/50 rounded-xl overflow-hidden backdrop-blur-sm bg-card/50">
        <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} fallbackRedirectUrl={`${basePath}/dashboard`} appearance={{ elements: { rootBox: "mx-auto", card: "bg-transparent shadow-none border-none" } }} />
      </div>
    </div>
  );
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <LandingPage />
      </Show>
    </>
  );
}

/** Pages that need auth — redirect to sign-in if not authenticated */
function ProtectedRoute({ component: Component }: { component: React.ComponentType<any> }) {
  return (
    <>
      <Show when="signed-in">
        <AppLayout>
          <Component />
        </AppLayout>
      </Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  );
}

/** Public pages — show with nav, auth not required */
function PublicRoute({ component: Component }: { component: React.ComponentType<any> }) {
  return (
    <AppLayout>
      <Component />
    </AppLayout>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = React.useRef<string | null | undefined>(undefined);

  React.useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
      appearance={{
        variables: { colorPrimary: 'hsl(190, 90%, 50%)', colorBackground: 'hsl(220, 30%, 4%)', colorText: 'hsl(220, 10%, 90%)', colorInputBackground: 'hsl(220, 25%, 15%)' }
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <Switch>
          <Route path="/" component={HomeRedirect} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />

          {/* Public routes — visible without login */}
          <Route path="/marketplace"><PublicRoute component={Marketplace} /></Route>
          <Route path="/portfolio"><PublicRoute component={Portfolio} /></Route>

          {/* Protected routes — require login */}
          <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
          <Route path="/bookings"><ProtectedRoute component={Bookings} /></Route>
          <Route path="/chat"><ProtectedRoute component={Chat} /></Route>
          <Route path="/ai-assistant"><ProtectedRoute component={AIAssistant} /></Route>
          <Route path="/notifications"><ProtectedRoute component={Notifications} /></Route>
          <Route path="/settings"><ProtectedRoute component={SettingsPage} /></Route>
          <Route path="/admin"><ProtectedRoute component={Admin} /></Route>

          <Route component={NotFound} />
        </Switch>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default function App() {
  return (
    <WouterRouter base={basePath}>
      <TooltipProvider>
        <ClerkProviderWithRoutes />
        <Toaster />
      </TooltipProvider>
    </WouterRouter>
  );
}
