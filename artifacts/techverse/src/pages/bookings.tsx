import React, { useState } from "react";
import { motion } from "framer-motion";
import { useListBookings, useUpdateBookingStatus } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, CheckCircle, XCircle, DollarSign, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  pending: "border-yellow-500/50 text-yellow-400",
  accepted: "border-primary/50 text-primary",
  in_progress: "border-blue-500/50 text-blue-400",
  completed: "border-green-500/50 text-green-400",
  cancelled: "border-destructive/50 text-destructive",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function Bookings() {
  const [role, setRole] = useState<"client" | "provider">("client");
  const { data: bookings, isLoading, refetch } = useListBookings({ role, limit: 20 });
  const updateStatus = useUpdateBookingStatus();
  const { toast } = useToast();

  const handleStatusChange = async (bookingId: number, status: string) => {
    try {
      await updateStatus.mutateAsync({ bookingId, data: { status } });
      toast({ title: "Booking updated", description: `Status changed to ${status}` });
      refetch();
    } catch {
      toast({ title: "Error", description: "Failed to update booking", variant: "destructive" });
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight drop-shadow-[0_0_15px_rgba(0,255,255,0.2)]">BOOKINGS</h1>
          <p className="text-muted-foreground mt-1">Manage your service bookings</p>
        </div>
        <div className="flex rounded-lg border border-border overflow-hidden">
          {(["client", "provider"] as const).map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-all ${role === r ? "bg-primary/10 text-primary border-primary/30" : "text-muted-foreground hover:bg-muted"}`}
            >
              As {r}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 bg-muted/30 rounded-xl" />)}
        </div>
      ) : bookings?.length ? (
        <motion.div className="space-y-4">
          {bookings.map(booking => (
            <motion.div key={booking.id} variants={itemVariants}>
              <Card className="border-border/50 bg-card/40 backdrop-blur hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg">{booking.serviceTitle}</h3>
                        <Badge variant="outline" className={statusColors[booking.status] || "border-border"}>
                          {booking.status?.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {role === "client" ? `Provider: ${booking.providerName}` : `Client: ${booking.clientName}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          ${booking.price?.toFixed(2)}
                        </span>
                        {booking.scheduledAt && (
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-3.5 h-3.5" />
                            {new Date(booking.scheduledAt).toLocaleDateString()}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {booking.requirements && (
                        <p className="text-sm text-muted-foreground/80 line-clamp-2 mt-2">{booking.requirements}</p>
                      )}
                    </div>

                    {role === "provider" && booking.status === "pending" && (
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                          onClick={() => handleStatusChange(booking.id, "accepted")}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" /> Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-destructive/50 text-destructive hover:bg-destructive/10"
                          onClick={() => handleStatusChange(booking.id, "cancelled")}
                        >
                          <XCircle className="w-4 h-4 mr-1" /> Decline
                        </Button>
                      </div>
                    )}
                    {role === "provider" && booking.status === "accepted" && (
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground shrink-0"
                        onClick={() => handleStatusChange(booking.id, "completed")}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" /> Mark Complete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CalendarDays className="w-16 h-16 text-muted-foreground opacity-30 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No bookings found</p>
          <p className="text-sm text-muted-foreground/60">Browse the marketplace to book a service</p>
        </div>
      )}
    </motion.div>
  );
}
