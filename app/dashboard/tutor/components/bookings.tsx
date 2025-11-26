"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import axios from "axios";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  User,
  Users,
  Loader2,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Booking {
  id: string;
  sessionDate: string;
  durationMin: number;
  status: string;
  sessionType?: string;
  createdAt: string;
  course: {
    id: string;
    title: string;
    imageUrl?: string;
  };
  learner: {
    id: string;
    name: string;
    email: string;
    profileImageUrl?: string;
  };
  payment?: {
    id: string;
    amount: number;
    paymentStatus: string;
    paymentMethod: string;
  };
}

export default function Bookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tutorId, setTutorId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchTutorId();
    }
  }, [user]);

  useEffect(() => {
    if (tutorId) {
      fetchBookings();
    }
  }, [tutorId]);

  const fetchTutorId = async () => {
    try {
      // Try to get tutorId from localStorage first
      const userData = localStorage.getItem("userData");
      console.log("userData from localStorage:", userData);
      if (userData) {
        const parsedData = JSON.parse(userData);
        console.log("Parsed userData:", parsedData);
        if (parsedData.tutorId) {
          console.log("Found tutorId in localStorage:", parsedData.tutorId);
          setTutorId(parsedData.tutorId);
          return;
        }
      }

      // If not in localStorage, fetch from courses
      console.log("Fetching courses for userId:", user?.id);
      const response = await axios.get(`/api/courses?userId=${user?.id}`);
      const coursesData = response.data.data?.courses || response.data.data || [];
      console.log("Courses response:", coursesData);
      if (coursesData.length > 0) {
        // The tutorId is in the tutor object, not at the root level
        const firstCourse = coursesData[0];
        const foundTutorId = firstCourse.tutorId || firstCourse.tutor?.id;
        console.log("First course:", firstCourse);
        console.log("Found tutorId:", foundTutorId);
        if (foundTutorId) {
          console.log("Setting tutorId from courses:", foundTutorId);
          setTutorId(foundTutorId);
        } else {
          console.log("No tutorId found in course object");
          setLoading(false);
        }
      } else {
        console.log("No courses found");
        // No tutor ID found, stop loading
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching tutor ID:", error);
      // Error occurred, stop loading
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      console.log("Fetching bookings for tutorId:", tutorId);
      setLoading(true);
      const response = await axios.get(`/api/bookings?tutorId=${tutorId}`);
      console.log("Bookings response:", response.data);
      setBookings(response.data.data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate stats
  const now = new Date();
  const upcomingBookings = bookings.filter(
    (b) => b.status === "confirmed" && new Date(b.sessionDate) > now
  );
  console.log("All bookings:", bookings);
  console.log("Current time:", now);
  console.log("Upcoming bookings:", upcomingBookings);
  
  const currentSessions = bookings.filter(
    (b) => {
      const sessionDate = new Date(b.sessionDate);
      const sessionEnd = new Date(sessionDate.getTime() + b.durationMin * 60000);
      return b.status === "confirmed" && sessionDate <= now && sessionEnd >= now;
    }
  );
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled");
  const totalEarnings = bookings
    .filter((b) => b.payment?.paymentStatus === "completed")
    .reduce((sum, b) => sum + (b.payment?.amount || 0), 0);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; className: string; icon: any }
    > = {
      confirmed: {
        label: "Confirmed",
        className: "bg-blue-100 text-blue-700",
        icon: CheckCircle,
      },
      completed: {
        label: "Completed",
        className: "bg-green-100 text-green-700",
        icon: CheckCircle,
      },
      cancelled: {
        label: "Cancelled",
        className: "bg-red-100 text-red-700",
        icon: XCircle,
      },
      pending: {
        label: "Pending",
        className: "bg-yellow-100 text-yellow-700",
        icon: AlertCircle,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.className}`}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  const getSessionTypeBadge = (sessionType?: string) => {
    if (!sessionType) return null;
    
    const isGroup = sessionType === "group";
    
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          isGroup
            ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
            : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
        }`}
      >
        {isGroup ? <Users className="h-3 w-3" /> : <User className="h-3 w-3" />}
        {isGroup ? "Group" : "Individual"}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Sessions</h2>
        <p className="text-muted-foreground mt-1">
          Manage your teaching sessions with students
        </p>
      </div>

      {/* Booking Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-gradient-to-br from-slate-900/30 to-slate-800/10 p-4 shadow-sm backdrop-blur-sm hover:shadow-lg transform transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Upcoming</p>
              <p className="text-2xl font-bold">{upcomingBookings.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-gradient-to-br from-slate-900/30 to-slate-800/10 p-4 shadow-sm backdrop-blur-sm hover:shadow-lg transform transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{completedBookings.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-gradient-to-br from-slate-900/30 to-slate-800/10 p-4 shadow-sm backdrop-blur-sm hover:shadow-lg transform transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cancelled</p>
              <p className="text-2xl font-bold">{cancelledBookings.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-gradient-to-br from-slate-900/30 to-slate-800/10 p-4 shadow-sm backdrop-blur-sm hover:shadow-lg transform transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
              <DollarSign className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Earnings</p>
              <p className="text-2xl font-bold">${totalEarnings.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>


     

      {/* Current Sessions */}
      {currentSessions.length > 0 && (
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="border-b p-6">
            <h3 className="text-lg font-semibold">Current Sessions</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Sessions happening now
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {currentSessions.map((booking) => (
                <div
                  key={booking.id}
                  className="border rounded-lg p-5 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 animate-pulse">
                              <Video className="h-3 w-3" />
                              Live Now
                            </span>
                            {getSessionTypeBadge(booking.sessionType)}
                          </div>
                          <h4 className="font-semibold text-lg mb-1">
                            {booking.course?.title || "Session"}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Student: {booking.learner?.name || "Unknown"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-green-600">
                            ${(booking.payment?.amount || 0).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {booking.durationMin} min
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {formatDateTime(booking.sessionDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {booking.learner?.email}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Video className="h-4 w-4 mr-2" />
                          Join Session
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}



      {/* Upcoming Sessions */}
<div className="rounded-lg border bg-gradient-to-br from-slate-900/30 to-slate-800/10 
  shadow-sm backdrop-blur-sm p-6 hover:shadow-lg transform transition-all duration-200">

  <div className="border-b border-white/10 pb-4 mb-4">
    <h3 className="text-lg font-semibold">Upcoming Sessions</h3>
    <p className="text-sm text-muted-foreground mt-1">Next 30 days</p>
  </div>

  <div>
    {loading ? (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Loading sessions...</p>
      </div>
    ) : upcomingBookings.length > 0 ? (
      <div className="space-y-4">
        {upcomingBookings.map((booking) => (
          <div
            key={booking.id}
            className="border rounded-lg p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-lg mb-1">
                      {booking.course?.title || "Session"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Student: {booking.learner?.name || "Unknown"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-primary">
                      ${(booking.payment?.amount || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {booking.payment?.paymentStatus === "completed"
                        ? "Paid"
                        : "Pending"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {formatDateTime(booking.sessionDate)}
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

                  <div className="flex items-center gap-2">
                    {getSessionTypeBadge(booking.sessionType)}
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {booking.learner?.email}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-4">
          No upcoming sessions
        </p>
        <p className="text-xs text-muted-foreground">
          Students will book your skills once you create them
        </p>
      </div>
    )}
  </div>

</div>


{/* Recent Bookings */}
<div className="rounded-lg border bg-gradient-to-br from-slate-900/30 to-slate-800/10 
  shadow-sm backdrop-blur-sm p-6 hover:shadow-lg transform transition-all duration-200">

  <div className="border-b border-white/10 pb-4 mb-4">
    <h3 className="text-lg font-semibold">All Sessions History</h3>
    <p className="text-sm text-muted-foreground mt-1">Complete booking history</p>
  </div>

  <div>
    {loading ? (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Loading history...</p>
      </div>
    ) : bookings.length > 0 ? (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-semibold text-sm">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Course</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Student</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Type</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Duration</th>
              <th className="text-right py-3 px-4 font-semibold text-sm">Amount</th>
              <th className="text-center py-3 px-4 font-semibold text-sm">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b hover:bg-muted/50">
                <td className="py-3 px-4 text-sm">{formatDate(booking.sessionDate)}</td>
                <td className="py-3 px-4">
                  <p className="text-sm font-medium">{booking.course?.title || "Session"}</p>
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{booking.learner?.name || "Unknown"}</td>
                <td className="py-3 px-4">{getSessionTypeBadge(booking.sessionType)}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{booking.durationMin} min</td>
                <td className="py-3 px-4 text-sm font-semibold text-right">
                  ${(booking.payment?.amount || 0).toFixed(2)}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center">
                    {getStatusBadge(booking.status)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">No bookings yet</p>
      </div>
    )}
  </div>

</div>














      {/* Session Tips */}
      <div className="rounded-lg border bg-green-50 dark:bg-green-950 p-6">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
              Session Best Practices
            </h4>
            <ul className="space-y-1 text-sm text-green-800 dark:text-green-200">
              <li>• Join sessions 5 minutes early to prepare</li>
              <li>• Keep your teaching materials organized and ready</li>
              <li>• Provide clear instructions and feedback to students</li>
              <li>• Follow up with students after each session</li>
              <li>• Maintain professionalism and punctuality</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
