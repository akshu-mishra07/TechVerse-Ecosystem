import React from "react";
import { motion } from "framer-motion";
import { useGetUserStats, useListProjects, useListBookings, useListNotifications } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Briefcase, CalendarDays, DollarSign, Star, Store, Bell } from "lucide-react";
import { Link } from "wouter";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetUserStats();
  const { data: projects, isLoading: projectsLoading } = useListProjects({ limit: 3 });
  const { data: bookings, isLoading: bookingsLoading } = useListBookings({ status: "pending" });
  const { data: notifications, isLoading: notifsLoading } = useListNotifications({ unreadOnly: true });

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black tracking-tight text-foreground drop-shadow-[0_0_15px_rgba(0,255,255,0.2)]">COMMAND CENTER</h1>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(0,255,255,0.8)]" />
          <span className="text-sm font-medium text-primary tracking-widest uppercase">System Online</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Projects" value={stats?.totalProjects} icon={Briefcase} loading={statsLoading} />
        <StatCard title="Active Services" value={stats?.totalServices} icon={Store} loading={statsLoading} />
        <StatCard title="Total Bookings" value={stats?.totalBookings} icon={CalendarDays} loading={statsLoading} />
        <StatCard title="Total Earnings" value={stats?.totalEarnings ? `$${stats.totalEarnings}` : "0"} icon={DollarSign} loading={statsLoading} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-2 border-border/50 bg-card/40 backdrop-blur shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Briefcase className="w-5 h-5" />
              Recent Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full bg-muted/50" />)}
              </div>
            ) : projects?.length ? (
              <div className="space-y-4">
                {projects.map((project) => (
                  <Link key={project.id} href={`/portfolio/${project.id}`}>
                    <div className="p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 cursor-pointer group flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold group-hover:text-primary transition-colors">{project.title}</h4>
                        <p className="text-sm text-muted-foreground">{project.category}</p>
                      </div>
                      <div className="flex gap-2">
                        {project.techStack.slice(0, 3).map(tech => (
                          <span key={tech} className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">{tech}</span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No projects found. Start building.</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/50 bg-card/40 backdrop-blur shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-secondary">
                <Bell className="w-5 h-5" />
                Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifsLoading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => <Skeleton key={i} className="h-12 w-full bg-muted/50" />)}
                </div>
              ) : notifications?.length ? (
                <div className="space-y-3">
                  {notifications.slice(0, 4).map((notif) => (
                    <div key={notif.id} className="p-3 rounded border border-border/30 bg-background/50 flex flex-col gap-1">
                      <span className="text-sm font-medium">{notif.title}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1">{notif.message}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No new alerts.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon: Icon, loading }: { title: string, value?: number | string, icon: any, loading: boolean }) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="border-border/50 bg-card/40 backdrop-blur shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-20 bg-muted/50" />
          ) : (
            <div className="text-3xl font-black group-hover:scale-105 transition-transform origin-left drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">
              {value || "0"}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
