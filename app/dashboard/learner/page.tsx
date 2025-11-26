"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "./components/sidebar";
import Skills from "./components/skills";
import Bookings from "./components/bookings";
import Reviews from "./components/reviews";
import AccountSettings from "./components/account-settings";

export default function LearnerDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("skills");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Check for tab parameter in URL
    const tabParam = searchParams.get("tab");
    if (tabParam && ["skills", "bookings", "reviews", "settings"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/");
        return;
      }

      // Check if user is a learner
      if (user?.role !== "learner") {
        router.push("/dashboard/tutor");
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  const renderContent = () => {
    switch (activeTab) {
      case "skills":
        return <Skills />;
      case "bookings":
        return <Bookings />;
      case "reviews":
        return <Reviews />;
      case "settings":
        return <AccountSettings user={user} />;
      default:
        return <Skills />;
    }
  };

  if (isLoading || !isAuthenticated || user?.role !== "learner") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isMounted) {
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
                Continue your learning journey
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
