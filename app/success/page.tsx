"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@/hooks/use-auth";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [enrolling, setEnrolling] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentCreated, setEnrollmentCreated] = useState(false);
  const [paymentType, setPaymentType] = useState<string | null>(null);

  const sessionId = searchParams.get("sessionId");
  const courseId = searchParams.get("courseId");

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) {
      console.log("Waiting for authentication...");
      return;
    }

    if (!sessionId || !courseId) {
      console.error("Missing sessionId or courseId");
      setEnrolling(false);
      setError("Missing payment session information");
      return;
    }

    if (!user) {
      console.error("User not authenticated");
      setEnrolling(false);
      setError("You must be logged in to complete enrollment");
      return;
    }

    console.log("Creating enrollment for user:", user.id, "course:", courseId);

    // Create enrollment or booking based on payment type
    const processPayment = async () => {
      try {
        // First, get the payment session details to check the payment type
        const sessionResponse = await axios.get(`/api/checkout/session?sessionId=${sessionId}`);
        const sessionData = sessionResponse.data;
        const paymentType = sessionData.metadata?.paymentType || "enrollment";
        
        setPaymentType(paymentType);
        console.log("Payment type:", paymentType);

        if (paymentType === "enrollment") {
          // Full course enrollment
          const response = await axios.post("/api/enrollments", {
            userId: user.id,
            courseId: courseId,
            sessionId: sessionId,
          });

          console.log("Enrollment response:", response.data);

          if (response.data.success) {
            setEnrollmentCreated(true);
          }
        } else if (paymentType === "session") {
          // Single session booking - create a booking instead of enrollment
          const sessionDate = sessionData.metadata?.sessionDate || new Date().toISOString();
          const tutorId = sessionData.metadata?.tutorId;
          const amount = parseFloat(sessionData.metadata?.amount || "0");
          const sessionType = sessionData.metadata?.sessionType || "individual";
          
          console.log("Creating booking with data:", {
            learnerId: user.id,
            tutorId,
            courseId,
            sessionDate,
            sessionType,
            amount
          });
          
          const response = await axios.post("/api/bookings", {
            learnerId: user.id,
            tutorId: tutorId,
            courseId: courseId,
            sessionDate: sessionDate,
            durationMin: 60, // Default duration
            status: "confirmed",
            paymentSessionId: sessionId,
            amount: amount,
            sessionType: sessionType,
          });

          console.log("Booking response:", response.data);

          if (response.data.success) {
            setEnrollmentCreated(true); // Reusing this state for success indication
          }
        }
      } catch (err: any) {
        console.error("Processing error:", err);
        console.error("Error response:", err.response?.data);
        console.error("Error details:", err.response?.data?.details);
        setError(
          err.response?.data?.details || 
          err.response?.data?.error || 
          "Failed to process payment. Please contact support."
        );
      } finally {
        setEnrolling(false);
      }
    };

    processPayment();
  }, [sessionId, courseId, user, authLoading]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8">
          {enrolling ? (
            <div className="text-center space-y-4">
              <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
              <h2 className="text-2xl font-bold">Processing your payment...</h2>
              <p className="text-muted-foreground">
                Please wait while we set up your access.
              </p>
            </div>
          ) : error ? (
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <span className="text-3xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-bold text-red-600">Processing Issue</h2>
              <p className="text-muted-foreground">{error}</p>
              <p className="text-sm text-muted-foreground">
                Your payment was successful, but there was an issue processing your request. 
                Please contact support.
              </p>
              <div className="pt-4 space-y-2">
                <Link href={`/course/${courseId}`}>
                  <Button variant="outline" className="w-full">Back to Course</Button>
                </Link>
                <Link href="/learn">
                  <Button variant="ghost" className="w-full">
                    Browse Courses
                  </Button>
                </Link>
              </div>
            </div>
          ) : enrollmentCreated ? (
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-green-600">
                Payment Successful!
              </h2>
              <p className="text-lg font-semibold">
                {paymentType === "session" ? "Session Booked!" : "You're all set!"}
              </p>
              <p className="text-muted-foreground">
                {paymentType === "session" 
                  ? "Your session has been booked successfully. You'll receive a confirmation email shortly."
                  : "You have been successfully enrolled in the course. You can now access all course materials and start learning!"}
              </p>
              <div className="pt-6 space-y-2">
                <Link href="/dashboard/learner">
                  <Button className="w-full bg-primary">Go to My Courses</Button>
                </Link>
                <Link href={`/course/${courseId}`}>
                  <Button variant="outline" className="w-full">
                    View Course Details
                  </Button>
                </Link>
                <Link href="/learn">
                  <Button variant="ghost" className="w-full">
                    Browse More Courses
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Payment Received</h2>
              <p className="text-muted-foreground">
                Thank you for your payment. Your enrollment will be processed shortly.
              </p>
              <Link href="/dashboard/learner">
                <Button className="w-full">Go to Dashboard</Button>
              </Link>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
