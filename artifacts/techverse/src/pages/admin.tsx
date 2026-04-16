import React from "react";
import { motion } from "framer-motion";
import { useGetAdminStats, useListAdminUsers, useGetAdminRecentActivity } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, Store, CalendarDays, DollarSign, TrendingUp, Activity, ShieldAlert } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function Admin() {
  const { data: stats, isLoading: statsLoading } = useGetAdminStats();
  const { data: users, isLoading: usersLoading } = useListAdminUsers({ limit: 8 });
  const { data: activity, isLoading: activityLoading } = useGetAdminRecentActivity();

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers, icon: Users, color: "text-primary" },
    { label: "Total Projects", value: stats?.totalProjects, icon: Briefcase, color: "text-secondary" },
    { label: "Total Services", value: stats?.totalServices, icon: Store, color: "text-blue-400" },
    { label: "Total Bookings", value: stats?.totalBookings, icon: CalendarDays, color: "text-yellow-400" },
    { label: "New Users (month)", value: stats?.newUsersThisMonth, icon: TrendingUp, color: "text-green-400" },
    { label: "Total Revenue", value: stats?.totalRevenue ? `$${stats.totalRevenue.toFixed(0)}` : "$0", icon: DollarSign, color: "text-emerald-400" },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight drop-shadow-[0_0_15px_rgba(0,255,255,0.2)]">ADMIN NEXUS</h1>
          <p className="text-muted-foreground mt-1">Platform overview and management</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 border border-destructive/30 rounded-lg">
          <ShieldAlert className="w-4 h-4 text-destructive" />
          <span className="text-sm text-destructive font-medium">Admin Access</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {statsLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 bg-muted/30 rounded-xl" />)
        ) : (
          statCards.map(({ label, value, icon: Icon, color }) => (
            <motion.div key={label} variants={itemVariants}>
              <Card className="border-border/50 bg-card/40 backdrop-blur hover:border-primary/30 transition-all duration-300 group">
                <CardContent className="p-4">
                  <Icon className={`w-4 h-4 mb-2 ${color}`} />
                  <div className={`text-2xl font-black ${color}`}>{value ?? "0"}</div>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <Card className="border-border/50 bg-card/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary text-sm uppercase tracking-wider">
              <Users className="w-4 h-4" /> Recent Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full bg-muted/30" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-3 w-24 bg-muted/30" />
                      <Skeleton className="h-3 w-32 bg-muted/30" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {users?.map(user => (
                  <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/20 transition-colors">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">{user.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <Badge variant="outline" className={user.isAdmin ? "border-destructive/50 text-destructive" : "border-border/50 text-muted-foreground"}>
                      {user.isAdmin ? "Admin" : "User"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-border/50 bg-card/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-secondary text-sm uppercase tracking-wider">
              <Activity className="w-4 h-4" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 bg-muted/30 rounded" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {activity?.slice(0, 8).map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/20 transition-colors">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${item.type === "user_joined" ? "bg-primary" : item.type === "project_created" ? "bg-secondary" : "bg-yellow-400"}`} />
                    <p className="text-sm text-muted-foreground flex-1 truncate">{item.description}</p>
                    <span className="text-xs text-muted-foreground/60 shrink-0">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
                {(!activity || activity.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Status Chart */}
        {stats?.bookingsByStatus && Object.keys(stats.bookingsByStatus).length > 0 && (
          <Card className="border-border/50 bg-card/40 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary text-sm uppercase tracking-wider">
                <CalendarDays className="w-4 h-4" /> Bookings by Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.bookingsByStatus).map(([status, count]) => {
                  const total = stats.totalBookings || 1;
                  const pct = Math.round((count / total) * 100);
                  const colors: Record<string, string> = {
                    pending: "bg-yellow-400",
                    accepted: "bg-primary",
                    in_progress: "bg-blue-400",
                    completed: "bg-green-400",
                    cancelled: "bg-destructive",
                  };
                  return (
                    <div key={status} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground capitalize">{status.replace(/_/g, " ")}</span>
                        <span className="font-medium">{count} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${colors[status] || "bg-muted-foreground"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
}
