"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginModal } from "@/components/login-modal";
import { SignupModal } from "@/components/signup-modal";
import { AlertModal } from "@/components/alert-modal";
import { SessionTypeModal } from "@/components/session-type-modal";
import Link from "next/link";
import { useCourse } from "@/hooks/use-course";
import { useAuth } from "@/hooks/use-auth";
import { useCheckout } from "@/hooks/use-checkout";
import { useParams } from "next/navigation";
import {
  Star,
  Clock,
  Users,
  ArrowLeft,
  Loader2,
  Calendar,
  DollarSign,
} from "lucide-react";
import Image from "next/image";

export default function CoursePage() {
  const params = useParams();
  const courseId = params.id as string;
  const { data: course, isLoading } = useCourse(courseId);
  const { isAuthenticated, user } = useAuth();
  const { handleCheckout, loading: checkoutLoading, error: checkoutError } = useCheckout();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isSessionTypeModalOpen, setIsSessionTypeModalOpen] = useState(false);
  const [activeCheckout, setActiveCheckout] = useState<"trial" | "full" | null>(
    null
  );
  const [pendingSessionType, setPendingSessionType] = useState<"individual" | "group" | null>(null);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    message: string;
    title?: string;
    type?: "error" | "warning" | "info" | "success";
  }>({
    isOpen: false,
    message: "",
  });

  // Display checkout errors in AlertModal
  useEffect(() => {
    if (checkoutError) {
      setAlertModal({
        isOpen: true,
        message: checkoutError,
        title: "Checkout Failed",
        type: "error",
      });
    }
  }, [checkoutError]);

  const handleEnrollClick = (type: "trial" | "full", amount: number) => {
    setActiveCheckout(type);
    
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }

    if (user?.role !== "learner") {
      setAlertModal({
        isOpen: true,
        message: "Only learners can enroll in courses. Please sign up as a learner account to book sessions and enroll in courses.",
        title: "Learner Access Required",
        type: "error",
      });
      return;
    }

    // Show session type modal for both trial sessions and full course enrollment
    setIsSessionTypeModalOpen(true);
  };

  const handleSignupClick = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(true);
  };

  const handleSessionTypeSelect = (sessionType: "individual" | "group") => {
    setPendingSessionType(sessionType);
    setIsSessionTypeModalOpen(false);
    
    // Proceed to checkout with the selected session type
    if (activeCheckout === "trial") {
      proceedToCheckout(activeCheckout, course!.trialRate, sessionType);
    } else if (activeCheckout === "full") {
      proceedToCheckout(activeCheckout, course!.fullCourseRate, sessionType);
    }
  };

  const proceedToCheckout = (type: "trial" | "full", amount: number, sessionType?: "individual" | "group") => {
    // Determine payment type: "trial" is a single session, "full" is enrollment
    const paymentType = type === "trial" ? "session" : "enrollment";
    const sessionDate = type === "trial" ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined;

    handleCheckout({
      courseId,
      courseName: course!.title,
      amount: amount,
      userId: user!.id,
      userEmail: user!.email,
      userRole: user!.role,
      paymentType: paymentType,
      sessionDate: sessionDate,
      sessionType: sessionType,
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container py-12">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-foreground">
                Course not found
              </h1>
              <Link href="/learn">
                <Button variant="outline">Back to Courses</Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section with Course Image */}
        <div className="relative w-full h-72 md:h-96 lg:h-112 bg-muted overflow-hidden">
          <Image
            src={course.imageUrl || "/placeholder.svg"}
            alt={course.title}
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />


          {/* Course Title Overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-8">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4 drop-shadow-lg">
              {course.title}
            </h1>
            <div className="flex flex-wrap gap-4 items-center text-black drop-shadow">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">4.5</span>
                <span>({course._count?.reviews || 0} reviews)</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>{course._count?.enrollments || 0} students</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{course.totalHours} hours</span>
              </div>3
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-primary/20 rounded text-sm capitalize">
                  {course.difficulty}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Left Column - Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Instructor Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-foreground">
                    About Your Instructor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <Image
                      src={
                        course.tutor?.user.profileImageUrl || "/placeholder.svg"
                      }
                      alt={course.tutor?.user.name || "Tutor"}
                      width={80}
                      height={80}
                      className="rounded-full"
                    />
                    <div className="flex-1">
                      <Link href={`/tutor/${course.tutorId}`}>
                        <h3 className="text-lg font-semibold text-primary hover:underline">
                          {course.tutor?.user.name || "Unknown Tutor"}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {course.category?.name || "Uncategorized"} Expert
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {course.tutor?.bio ||
                          "Experienced instructor ready to help you learn."}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold">4.8</span>
                        <span className="text-sm text-muted-foreground">
                          (200+ reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Course Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Course Overview
                  </CardTitle>
                  <CardDescription>
                    What you&apos;ll learn in this comprehensive course
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed">
                    {course.overview}
                  </p>
                </CardContent>
              </Card>

              {/* Prerequisites */}
              {course.prerequisites && course.prerequisites.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-foreground">
                      Prerequisites
                    </CardTitle>
                    <CardDescription>
                      What you should know before starting
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {course.prerequisites.map((prerequisite, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="text-primary mt-1">•</span>
                          <span className="text-foreground">
                            {prerequisite}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Skills Learned */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Skills You&apos;ll Learn
                  </CardTitle>
                  <CardDescription>
                    By the end of this course, you will be able to:
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.skillsLearned.map((skill, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-primary mt-1">✓</span>
                        <span className="text-foreground">{skill}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Course Schedule */}
              {course.schedule && course.schedule.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-foreground">
                      Course Schedule
                    </CardTitle>
                    <CardDescription>
                      Available time slots for this course
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {course.schedule.map((scheduleItem, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-3 bg-muted rounded-lg"
                        >
                          <Calendar className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-semibold text-foreground">
                              {scheduleItem.days
                                .map(
                                  (day) =>
                                    day.charAt(0).toUpperCase() + day.slice(1)
                                )
                                .join(", ")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {scheduleItem.startTime} - {scheduleItem.endTime}{" "}
                              ({scheduleItem.timezone})
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Course Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Course Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Level
                      </p>
                      <p className="font-semibold text-foreground capitalize">
                        {course.difficulty}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Duration
                      </p>
                      <p className="font-semibold text-foreground">
                        {course.totalHours} hours
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Category
                      </p>
                      <p className="font-semibold text-foreground">
                        {course.category?.name || "Uncategorized"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Students Enrolled
                      </p>
                      <p className="font-semibold text-foreground">
                        {course._count?.enrollments || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-4">
              {/* Price Card */}
              <Card className="sticky top-24">
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Trial Session
                      </p>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <p className="text-2xl font-bold text-primary">
                          ${course.trialRate}
                        </p>
                        <span className="text-sm text-muted-foreground">
                          per hour
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Full Course
                      </p>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <p className="text-3xl font-bold text-primary">
                          ${course.fullCourseRate}
                        </p>
                        <span className="text-sm text-muted-foreground">
                          total
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>4.5 rating</span>
                    <span>({course._count?.reviews || 0} reviews)</span>
                  </div>

                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base"
                    onClick={() => handleEnrollClick("trial", course.trialRate)}
                    disabled={checkoutLoading}
                  >
                    {checkoutLoading && activeCheckout === "trial"
                      ? "Processing..."
                      : "Book Trial Session"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-12 text-base border-primary text-primary hover:bg-primary/10 bg-transparent"
                    onClick={() => handleEnrollClick("full", course.fullCourseRate)}
                    disabled={checkoutLoading}
                  >
                    {checkoutLoading && activeCheckout === "full"
                      ? "Processing..."
                      : "Enroll Full Course"}
                  </Button>

                  <div className="pt-4 border-t space-y-3">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{course.totalHours} hours to complete</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {course._count?.enrollments || 0} already enrolled
                      </span>
                    </div>
                    {course.zoomLink && (
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <span className="text-primary">📹</span>
                        <span>Online sessions available</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base text-foreground">
                    Course Highlights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {course.shortDescription}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <span>Interactive video sessions</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <span>Personalized learning path</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <span>Expert instructor guidance</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToSignup={handleSignupClick}
        message="Please sign in as a learner to enroll in courses and book sessions."
        messageTitle="Sign In Required"
      />
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
      />
      <SessionTypeModal
        isOpen={isSessionTypeModalOpen}
        onClose={() => setIsSessionTypeModalOpen(false)}
        onSelect={handleSessionTypeSelect}
        courseName={course?.title}
      />
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        message={alertModal.message}
        title={alertModal.title}
        type={alertModal.type}
      />
    </div>
  );
}
