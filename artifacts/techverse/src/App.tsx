import React from "react";
import { Switch, Route, Redirect, useLocation, Router as WouterRouter } from 'wouter';
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from '@clerk/react';
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout";
import { motion } from "framer-motion";
import { Link } from "wouter";

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

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />

      {/* Animated grid */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(0,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.3) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 text-center max-w-3xl"
      >
        <div className="inline-flex items-center justify-center p-2 mb-8 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm shadow-[0_0_30px_rgba(0,255,255,0.15)]">
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">SYSTEM ONLINE</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-primary/80 to-secondary drop-shadow-[0_0_20px_rgba(0,255,255,0.3)]">
          TECHVERSE CORE
        </h1>
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          The unified command center for elite developers. Portfolio, marketplace, communications, and AI-assistance, seamlessly integrated.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 text-center">
          {[
            { label: "Portfolio", desc: "Showcase projects" },
            { label: "Marketplace", desc: "Sell services" },
            { label: "Bookings", desc: "Manage clients" },
            { label: "AI Core", desc: "GPT assistant" },
          ].map(f => (
            <div key={f.label} className="p-4 rounded-xl bg-card/40 border border-border/50 backdrop-blur">
              <div className="font-bold text-primary text-sm">{f.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{f.desc}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-6">
          <Link href="/sign-up">
            <button className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:shadow-[0_0_40px_rgba(0,255,255,0.6)] hover:scale-105 transition-all duration-300">
              INITIALIZE
            </button>
          </Link>
          <Link href="/sign-in">
            <button className="px-8 py-4 bg-card text-foreground font-bold rounded-lg border border-border hover:border-primary/50 hover:bg-primary/10 transition-all duration-300">
              ACCESS SYSTEM
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      <div className="z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-border/50 rounded-xl overflow-hidden backdrop-blur-sm bg-card/50">
        <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} appearance={{ elements: { rootBox: "mx-auto", card: "bg-transparent shadow-none border-none" } }} />
      </div>
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-secondary/10 via-background to-background pointer-events-none" />
      <div className="z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-border/50 rounded-xl overflow-hidden backdrop-blur-sm bg-card/50">
        <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} appearance={{ elements: { rootBox: "mx-auto", card: "bg-transparent shadow-none border-none" } }} />
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

function ProtectedRoute({ component: Component }: { component: React.ComponentType<any> }) {
  return (
    <>
      <Show when="signed-in">
        <AppLayout>
          <Component />
        </AppLayout>
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
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

          <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
          <Route path="/portfolio"><ProtectedRoute component={Portfolio} /></Route>
          <Route path="/marketplace"><ProtectedRoute component={Marketplace} /></Route>
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
