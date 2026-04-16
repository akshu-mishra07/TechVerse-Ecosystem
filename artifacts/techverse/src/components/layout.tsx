import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useUser, useClerk } from "@clerk/react";
import { 
  LayoutDashboard, 
  Briefcase, 
  Store, 
  CalendarDays, 
  MessageSquare, 
  Bot, 
  Bell, 
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { href: "/dashboard", label: "Command Center", icon: LayoutDashboard },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/marketplace", label: "Marketplace", icon: Store },
  { href: "/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/chat", label: "Comms", icon: MessageSquare },
  { href: "/ai-assistant", label: "AI Core", icon: Bot },
  { href: "/notifications", label: "Alerts", icon: Bell },
  { href: "/settings", label: "Systems", icon: Settings },
];

export function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (v: boolean) => void }) {
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : "-100%" }}
        className="fixed md:sticky top-0 left-0 h-screen w-64 bg-card border-r border-border z-50 flex flex-col
                   shadow-[0_0_40px_rgba(0,0,0,0.5)] md:shadow-none md:translate-x-0"
      >
        <div className="p-6 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/50 shadow-[0_0_15px_rgba(0,255,255,0.3)]">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-xl tracking-wider uppercase">TECHVERSE</span>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground" onClick={() => setIsOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href || location.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 group ${isActive ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_rgba(0,255,255,0.1)]' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}>
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'group-hover:text-primary transition-colors'}`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div layoutId="active-nav-indicator" className="absolute left-0 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_rgba(0,255,255,0.8)]" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-background border border-border">
            <Avatar className="w-10 h-10 border border-primary/30">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback className="bg-primary/20 text-primary">{user?.firstName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.fullName || 'Operator'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => signOut()} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden selection:bg-primary/30 selection:text-primary">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 flex flex-col relative h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
        <header className="h-16 border-b border-border/50 bg-background/50 backdrop-blur-md flex items-center px-4 md:hidden z-30 sticky top-0">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-foreground" />
          </Button>
          <div className="flex-1 flex justify-center">
            <span className="font-bold text-lg tracking-wider text-primary">TECHVERSE</span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {children}
        </div>
      </main>
    </div>
  );
}
