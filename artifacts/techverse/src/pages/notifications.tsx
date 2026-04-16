import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useListNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Notifications() {
  const { data: notifications, isLoading, refetch } = useListNotifications({});
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const { toast } = useToast();

  const handleMarkRead = async (id: number) => {
    try {
      await markRead.mutateAsync({ notificationId: id });
      refetch();
    } catch {
      toast({ title: "Error", description: "Failed to mark notification read", variant: "destructive" });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead.mutateAsync();
      toast({ title: "All caught up!", description: "All notifications marked as read" });
      refetch();
    } catch {
      toast({ title: "Error", description: "Failed to mark all read", variant: "destructive" });
    }
  };

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight drop-shadow-[0_0_15px_rgba(0,255,255,0.2)]">ALERTS</h1>
          <p className="text-muted-foreground mt-1">{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}</p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            className="border-primary/50 text-primary hover:bg-primary/10"
            onClick={handleMarkAllRead}
          >
            <CheckCheck className="w-4 h-4 mr-2" /> Mark All Read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 bg-muted/30 rounded-xl" />)}
        </div>
      ) : notifications?.length ? (
        <AnimatePresence>
          <div className="space-y-3">
            {notifications.map((notif, i) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className={`border-border/50 backdrop-blur transition-all duration-300 cursor-pointer group ${!notif.isRead ? "bg-primary/5 border-primary/20" : "bg-card/40"}`}
                  onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                >
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className={`p-2 rounded-full mt-0.5 shrink-0 ${!notif.isRead ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`font-semibold text-sm ${!notif.isRead ? "text-foreground" : "text-muted-foreground"}`}>{notif.title}</p>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(0,255,255,0.8)] shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground/60">
                        <Calendar className="w-3 h-3" />
                        {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bell className="w-16 h-16 text-muted-foreground opacity-30 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No notifications</p>
          <p className="text-sm text-muted-foreground/60">You're all caught up!</p>
        </div>
      )}
    </motion.div>
  );
}
