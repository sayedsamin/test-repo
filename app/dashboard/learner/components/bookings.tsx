"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import axios from "axios";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  BookOpen,
  DollarSign,
  Loader2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { calculateNextSessionDate } from "@/lib/utils/session-calculator";

interface Booking {
  id: string;
  sessionDate: string;
  durationMin: number;
  status: string;
  createdAt: string;
  course: {
    id: string;
    title: string;
    imageUrl?: string;
    startDate?: string | null;
    endDate?: string | null;
    zoomLink?: string | null;
    schedule?: Array<{
      days: string[];
      startTime: string;
      endTime: string;
      timezone: string;
    }>;
  };
  tutor: {
    user: {
      id: string;
      name: string;
    };
  };
  payment?: {
    id: string;
    amount: number;
    paymentStatus: string;
    paymentMethod: string;
    transactionId?: string;
  };
}

export default function Bookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/bookings?learnerId=${user?.id}`);
      console.log("Bookings response:", response.data);
      console.log("First booking course data:", response.data.data?.[0]?.course);
      setBookings(response.data.data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate next session date based on course schedule
  const getNextSessionDate = (booking: Booking): Date | null => {
    return calculateNextSessionDate(booking.course?.schedule);
  };

  const getSessionDateTime = (booking: Booking): string => {
    const nextSession = getNextSessionDate(booking);
    if (nextSession) {
      return formatDateTime(nextSession.toISOString());
    }
    // Fallback to original booking date if no schedule found
    return formatDateTime(booking.sessionDate);
  };

  const totalSpent = bookings.reduce(
    (sum, booking) => sum + (booking.payment?.amount || 0),
    0
  );

  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const upcomingBookings = bookings.filter(b => 
    b.status === 'confirmed' && new Date(b.sessionDate) > new Date()
  ).length;

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
      confirmed: {
        label: 'Confirmed',
        className: 'bg-blue-100 text-blue-700',
        icon: CheckCircle,
      },
      completed: {
        label: 'Completed',
        className: 'bg-green-100 text-green-700',
        icon: CheckCircle,
      },
      cancelled: {
        label: 'Cancelled',
        className: 'bg-red-100 text-red-700',
        icon: XCircle,
      },
      pending: {
        label: 'Pending',
        className: 'bg-yellow-100 text-yellow-700',
        icon: AlertCircle,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Bookings & Payments</h2>
          <p className="text-muted-foreground mt-1">
            View your booked sessions and payment history
          </p>
        </div>
        <Button
          onClick={fetchBookings}
          variant="outline"
          size="sm"
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Payment Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="text-2xl font-bold">{bookings.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{completedBookings}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Upcoming</p>
              <p className="text-2xl font-bold">{upcomingBookings}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <DollarSign className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Booked Sessions */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b p-6">
          <h3 className="text-lg font-semibold">My Booked Sessions</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Sessions you've booked and paid for
          </p>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Loading bookings...</p>
            </div>
          ) : bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border rounded-lg p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-lg mb-1">
                            {booking.course?.title || 'Session'}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Instructor: {booking.tutor?.user?.name || 'Unknown'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-primary">
                            ${(booking.payment?.amount || 0).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {booking.payment?.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            <span className="font-medium">Next Session: </span>
                            {getSessionDateTime(booking)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {booking.durationMin} minutes
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(booking.status)}
                        </div>
                        {booking.payment?.paymentMethod && (
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground capitalize">
                              {booking.payment.paymentMethod}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Course Duration */}
                      {(booking.course?.startDate || booking.course?.endDate) && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Full Course Duration:</p>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {booking.course.startDate && formatDate(booking.course.startDate)}
                              {booking.course.startDate && booking.course.endDate && ' - '}
                              {booking.course.endDate && formatDate(booking.course.endDate)}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 mt-4">
                        <Link href={`/course/${booking.course?.id || ''}`}>
                          <Button size="sm" variant="outline">
                            View Course
                          </Button>
                        </Link>
                        {booking.course?.zoomLink && (
                          <a 
                            href={booking.course.zoomLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              <Video className="h-4 w-4 mr-2" />
                              Join Zoom Session
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                No booked sessions yet
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Browse our courses and book a session to get started
              </p>
              <Link href="/learn">
                <Button>Browse Courses</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Payment History */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b p-6">
          <h3 className="text-lg font-semibold">Payment History</h3>
          <p className="text-sm text-muted-foreground mt-1">
            All your session payments
          </p>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Loading payments...</p>
            </div>
          ) : bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-sm">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Course</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Instructor</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Session</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Amount</th>
                    <th className="text-center py-3 px-4 font-semibold text-sm">Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm">
                        {formatDate(booking.sessionDate)}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/course/${booking.course?.id || ''}`}
                          className="text-sm font-medium hover:text-primary"
                        >
                          {booking.course?.title || 'Session'}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {booking.tutor?.user?.name || 'Unknown'}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {booking.durationMin} min
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-right">
                        ${(booking.payment?.amount || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center">
                          {booking.payment?.paymentStatus === 'completed' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <CheckCircle className="h-3 w-3" />
                              Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                              <AlertCircle className="h-3 w-3" />
                              Pending
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-semibold bg-muted/30">
                    <td colSpan={4} className="py-3 px-4 text-right">
                      Total:
                    </td>
                    <td className="py-3 px-4 text-right">
                      ${totalSpent.toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">No payment history</p>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-lg border bg-blue-50 dark:bg-blue-950 p-6">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Learning Tips
            </h4>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li>• Set aside dedicated time each day for learning</li>
              <li>• Complete courses to unlock certificates</li>
              <li>• Leave reviews to help other learners</li>
              <li>• Track your progress regularly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
