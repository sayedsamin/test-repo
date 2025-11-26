"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calendar, BookOpen, CreditCard } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  transactionId?: string;
  createdAt: string;
  booking: {
    id: string;
    sessionDate: string;
    durationMin: number;
    learner: {
      name: string;
      email: string;
    };
    course: {
      title: string;
    };
  };
}

export default function Payments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    completedPayments: 0,
    pendingPayments: 0,
  });

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);

        // Get tutor data from localStorage or fetch from API
        let tutorId: string | null = null;

        const userData = localStorage.getItem("user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          tutorId = parsedUser.tutorId || parsedUser.tutor?.id;
        }

        // If no tutorId in localStorage, fetch from courses API
        if (!tutorId) {
          try {
            const coursesResponse = await fetch(`/api/courses?userId=${user.id}`);
            const coursesResult = await coursesResponse.json();

            if (coursesResult.success && coursesResult.data.length > 0) {
              tutorId = coursesResult.data[0].tutorId;

              if (userData) {
                const parsedUser = JSON.parse(userData);
                parsedUser.tutorId = tutorId;
                localStorage.setItem("user", JSON.stringify(parsedUser));
              }
            }
          } catch (err) {
            console.error("Error fetching courses to get tutor ID:", err);
          }
        }

        if (!tutorId) {
          console.warn("No tutor ID found. This may be a new tutor without courses yet.");
          setIsLoading(false);
          return;
        }

        const response = await fetch(`/api/bookings?tutorId=${tutorId}`);
        const result = await response.json();

        if (result.success && result.data) {
          const paymentsData = result.data
            .filter((booking: any) => booking.payment)
            .map((booking: any) => ({
              id: booking.payment.id,
              amount: booking.payment.amount,
              paymentMethod: booking.payment.paymentMethod,
              paymentStatus: booking.payment.paymentStatus,
              transactionId: booking.payment.transactionId,
              createdAt: booking.payment.createdAt,
              booking: {
                id: booking.id,
                sessionDate: booking.sessionDate,
                durationMin: booking.durationMin,
                learner: {
                  name: booking.learner.name,
                  email: booking.learner.email,
                },
                course: {
                  title: booking.course.title,
                },
              },
            }));

          setPayments(paymentsData);

          const totalEarnings = paymentsData
            .filter((p: Payment) => p.paymentStatus === "completed")
            .reduce((sum: number, p: Payment) => sum + p.amount, 0);

          const completedPayments = paymentsData.filter(
            (p: Payment) => p.paymentStatus === "completed"
          ).length;

          const pendingPayments = paymentsData.filter(
            (p: Payment) => p.paymentStatus === "pending"
          ).length;

          setStats({ totalEarnings, completedPayments, pendingPayments });
        }
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "failed":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    return method.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Earnings */}
        <div className="rounded-lg border bg-gradient-to-br from-slate-900/30 to-slate-800/10 p-4 shadow-sm backdrop-blur-sm hover:shadow-lg transform transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
              <DollarSign className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                From {stats.completedPayments} completed payment
                {stats.completedPayments !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="rounded-lg border bg-gradient-to-br from-slate-900/30 to-slate-800/10 p-4 shadow-sm backdrop-blur-sm hover:shadow-lg transform transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{stats.completedPayments}</p>
              <p className="text-xs text-muted-foreground">Successfully processed</p>
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="rounded-lg border bg-gradient-to-br from-slate-900/30 to-slate-800/10 p-4 shadow-sm backdrop-blur-sm hover:shadow-lg transform transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{stats.pendingPayments}</p>
              <p className="text-xs text-muted-foreground">Awaiting processing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="rounded-lg border bg-gradient-to-br from-slate-900/30 to-slate-800/10 
        shadow-sm backdrop-blur-sm p-6 hover:shadow-lg transform transition-all duration-200">
        <div className="border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Payment History</h3>
          </div>
        </div>

        <div className="space-y-4">
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No payments yet</h3>
              <p className="text-muted-foreground">
                Your payment history will appear here once students book and pay for sessions.
              </p>
            </div>
          ) : (
            payments.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium">{payment.booking.course.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Student: {payment.booking.learner.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Session on {new Date(payment.booking.sessionDate).toLocaleDateString()} 
                          ({payment.booking.durationMin} min)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge variant="outline" className={getStatusColor(payment.paymentStatus)}>
                      {payment.paymentStatus}
                    </Badge>
                    <Badge variant="outline">
                      {getPaymentMethodLabel(payment.paymentMethod)}
                    </Badge>
                    {payment.transactionId && (
                      <span className="text-muted-foreground">
                        Transaction: {payment.transactionId.slice(0, 12)}...
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 sm:mt-0 sm:ml-4 text-right">
                  <div className="text-2xl font-bold text-green-600">
                    ${payment.amount.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
