"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "./components/sidebar";
import Courses from "./components/courses";
import Bookings from "./components/bookings";
import Payments from "./components/payments";
import Reviews from "./components/reviews";
import ReviewForm from "./components/review-form";
import AccountSettings from "./components/account-settings";
import ProfileCompletionModal from "./components/profile-completion-modal";
import axios from "axios";

export default function TutorDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("courses");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!isLoading && isAuthenticated && user?.role === "tutor") {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get("/api/tutors/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.data.success) {
            const profileData = response.data.data;
            // Check if essential fields are filled
            const isComplete =
              profileData.bio &&
              profileData.bio.trim().length > 0 &&
              profileData.hourlyRate &&
              profileData.hourlyRate > 0 &&
              profileData.specialties &&
              profileData.specialties.length > 0;

            setShowProfileModal(!isComplete);
          } else {
            // If profile fetch fails, show modal
            setShowProfileModal(true);
          }
        } catch (error) {
          console.error("Error checking profile:", error);
          // If error, show modal to be safe
          setShowProfileModal(true);
        } finally {
          setIsCheckingProfile(false);
        }
      } else if (!isLoading) {
        setIsCheckingProfile(false);
      }
    };

    checkProfileCompletion();
  }, [isAuthenticated, isLoading, user]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/");
        return;
      }

      // Check if user is a tutor
      if (user?.role !== "tutor") {
        router.push("/dashboard/learner");
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  const handleProfileComplete = () => {
    setShowProfileModal(false);
    // Refresh the page to load the updated profile data
    window.location.reload();
  };

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/");
        return;
      }

      // Check if user is a tutor
      if (user?.role !== "tutor") {
        router.push("/dashboard/learner");
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  const renderContent = () => {
    // If profile is incomplete, show blocked message
    if (showProfileModal) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Profile Incomplete</h2>
            <p className="text-muted-foreground">
              Please complete your profile to access the dashboard
            </p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "courses":
        return <Courses />;
      case "bookings":
        return <Bookings />;
      case "payments":
        return <Payments />;
      case "reviews":
        return <Reviews />;
      case "review-form":
        return <ReviewForm />;
      case "settings":
        return <AccountSettings user={user} />;
      default:
        return <Courses />;
    }
  };

  if (isLoading || isCheckingProfile || !isAuthenticated || user?.role !== "tutor") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        isOpen={showProfileModal}
        onComplete={handleProfileComplete}
        userId={user?.id || ""}
      />

      {/* Main Content with Sidebar */}
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          <div className="container p-6 md:p-8 max-w-7xl">
            {/* Welcome Banner */}
            <div className="mb-8 rounded-lg bg-linear-to-r from-primary/10 to-primary/5 p-6 border">
              <h1 className="text-2xl font-bold tracking-tight">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="mt-1 text-muted-foreground">
                Here&apos;s an overview of your tutoring activity
              </p>
            </div>

            {/* Tab Content */}
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
