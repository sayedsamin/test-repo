"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import axios from "axios";

export default function EnrollmentTestPage() {
  const { user } = useAuth();
  const [courseId, setCourseId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateEnrollment = async () => {
    if (!user || !courseId) {
      setError("Please login and enter a course ID");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post("/api/enrollments", {
        userId: user.id,
        courseId: courseId,
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckEnrollment = async () => {
    if (!courseId) {
      setError("Please enter a course ID");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.get(
        `/api/enrollments/check?courseId=${courseId}${user ? `&userId=${user.id}` : ""}`
      );
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">Enrollment Testing</h1>

        {user && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Current User</h2>
            <div className="space-y-2 text-sm">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
            </div>
          </Card>
        )}

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Enrollment</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Course ID
              </label>
              <Input
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                placeholder="Enter course ID..."
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCheckEnrollment}
                disabled={loading || !courseId}
                variant="outline"
              >
                {loading ? "Checking..." : "Check Enrollment"}
              </Button>
              <Button
                onClick={handleCreateEnrollment}
                disabled={loading || !courseId || !user}
              >
                {loading ? "Creating..." : "Create Enrollment"}
              </Button>
            </div>
          </div>
        </Card>

        {error && (
          <Card className="p-6 mb-6 border-red-500">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Error</h3>
            <p className="text-sm text-red-600">{error}</p>
          </Card>
        )}

        {result && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Result</h3>
            <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </Card>
        )}
      </main>
    </div>
  );
}
