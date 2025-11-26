"use client";

import { useState } from "react";
import { X } from "lucide-react";
import axios from "axios";

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onComplete: () => void;
  userId: string;
}

export default function ProfileCompletionModal({
  isOpen,
  onComplete,
  userId,
}: ProfileCompletionModalProps) {
  const [formData, setFormData] = useState({
    bio: "",
    hourlyRate: "",
    specialties: "",
    profileImageUrl: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.bio.trim()) {
      setError("Professional bio is required");
      return;
    }
    if (!formData.hourlyRate || parseFloat(formData.hourlyRate) <= 0) {
      setError("Valid hourly rate is required");
      return;
    }
    if (!formData.specialties.trim()) {
      setError("At least one specialty is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");

      const specialtiesArray = formData.specialties
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await axios.patch(
        "/api/tutors/profile",
        {
          bio: formData.bio,
          hourlyRate: parseFloat(formData.hourlyRate),
          specialties: specialtiesArray,
          profileImageUrl: formData.profileImageUrl || undefined,
          availability: "Flexible - All days",
          sessionDuration: "1 hour",
          language: "English",
          timezone: "UTC-08:00 Pacific Time",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update localStorage to mark profile as complete
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        user.profileComplete = true;
        localStorage.setItem("user", JSON.stringify(user));
      }

      onComplete();
    } catch (err: any) {
      console.error("Error completing profile:", err);
      setError(
        err.response?.data?.error || "Failed to save profile. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="border-b p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Complete Your Profile</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Please fill in your profile information to get started
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-100 p-4">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">
              Professional Bio <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell students about your expertise and teaching experience..."
              rows={4}
              required
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Minimum 50 characters recommended
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Hourly Rate (USD) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={formData.hourlyRate}
              onChange={(e) =>
                setFormData({ ...formData, hourlyRate: e.target.value })
              }
              placeholder="25"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Specialties/Skills <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.specialties}
              onChange={(e) =>
                setFormData({ ...formData, specialties: e.target.value })
              }
              placeholder="React, Node.js, JavaScript, Web Development"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Separate multiple specialties with commas
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Profile Image URL (Optional)
            </label>
            <input
              type="url"
              value={formData.profileImageUrl}
              onChange={(e) =>
                setFormData({ ...formData, profileImageUrl: e.target.value })
              }
              placeholder="https://example.com/your-photo.jpg"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            {formData.profileImageUrl && (
              <div className="mt-3">
                <p className="text-xs font-medium mb-2">Preview:</p>
                <img
                  src={formData.profileImageUrl}
                  alt="Profile preview"
                  className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Complete Profile"}
            </button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            You must complete your profile to access the dashboard
          </p>
        </form>
      </div>
    </div>
  );
}
