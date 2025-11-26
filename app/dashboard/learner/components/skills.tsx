"use client";

import { Search, BookOpen, Star, Clock, Calendar, Loader2, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import axios from "axios";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Enrollment {
  id: string;
  enrolledAt: string;
  progress: number;
  hoursCompleted: number;
  course: {
    id: string;
    title: string;
    totalHours: number;
    imageUrl?: string;
    tutor: {
      user: {
        id: string;
        name: string;
      };
    };
  };
}

interface Booking {
  id: string;
  sessionDate: string;
  durationMin: number;
  status: string;
  course: {
    id: string;
    title: string;
  };
  tutor: {
    user: {
      id: string;
      name: string;
    };
  };
}

export default function Skills() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchLearningData();
    }
  }, [user]);

  const fetchLearningData = async () => {
    try {
      setLoading(true);
      // Fetch enrollments
      const enrollmentsResponse = await axios.get(`/api/enrollments?userId=${user?.id}`);
      setEnrollments(enrollmentsResponse.data.data || []);

      // Fetch bookings
      const bookingsResponse = await axios.get(`/api/bookings?learnerId=${user?.id}`);
      const allBookings = bookingsResponse.data.data || [];
      
      // Filter for upcoming confirmed bookings
      const upcoming = allBookings.filter((booking: Booking) => 
        booking.status === 'confirmed' && new Date(booking.sessionDate) > new Date()
      );
      setUpcomingBookings(upcoming);
    } catch (error) {
      console.error("Error fetching learning data:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalHoursCompleted = enrollments.reduce((sum, enrollment) => sum + (enrollment.hoursCompleted || 0), 0);
  const completedCourses = enrollments.filter(e => e.progress === 100).length;

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
     
     
      {/* Enrolled Courses */}
      {enrollments.length > 0 && (
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="border-b p-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">My Enrolled Courses</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Continue your learning journey
              </p>
            </div>
            <Link href="/dashboard/learner?tab=bookings">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {enrollments.slice(0, 3).map((enrollment) => (
                <Link 
                  key={enrollment.id} 
                  href={`/course/${enrollment.course.id}`}
                  className="block"
                >
                  <div className="flex items-center gap-4 p-4 rounded-lg border bg-background hover:bg-accent transition-colors">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{enrollment.course.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        by {enrollment.course.tutor.user.name}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          {enrollment.hoursCompleted || 0} / {enrollment.course.totalHours} hours
                        </span>
                        <span className="text-primary font-medium">
                          {enrollment.progress || 0}% complete
                        </span>
                      </div>
                      {/* Progress Bar */}
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${enrollment.progress || 0}%` }}
                        />
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Sessions */}
      {upcomingBookings.length > 0 && (
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="border-b p-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Upcoming Sessions</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your scheduled sessions
              </p>
            </div>
            <Link href="/dashboard/learner?tab=bookings">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {upcomingBookings.slice(0, 3).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-background"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">{booking.course.title}</p>
                      <p className="text-sm text-muted-foreground">
                        with {booking.tutor.user.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatDateTime(booking.sessionDate)}</p>
                    <p className="text-xs text-muted-foreground">{booking.durationMin} min</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
