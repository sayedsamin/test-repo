"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, User, Users } from "lucide-react";

interface SessionTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (sessionType: "individual" | "group") => void;
  courseName?: string;
}

export function SessionTypeModal({
  isOpen,
  onClose,
  onSelect,
  courseName = "this course",
}: SessionTypeModalProps) {
  const [selectedType, setSelectedType] = useState<"individual" | "group" | null>(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedType) {
      onSelect(selectedType);
      setSelectedType(null); // Reset for next time
    }
  };

  const handleClose = () => {
    setSelectedType(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="w-full max-w-md p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Choose Your Session Type
            </h2>
            <p className="text-sm text-muted-foreground">
              Select how you'd like to learn {courseName}
            </p>
          </div>

          <div className="space-y-3">
            {/* Individual Session Option */}
            <button
              onClick={() => setSelectedType("individual")}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                selectedType === "individual"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    selectedType === "individual"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    One-on-One Session
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Personalized learning experience with individual attention from
                    your tutor. Perfect for focused learning and tailored instruction.
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedType === "individual"
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                  }`}
                >
                  {selectedType === "individual" && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>
            </button>

            {/* Group Session Option */}
            <button
              onClick={() => setSelectedType("group")}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                selectedType === "group"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    selectedType === "group"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    Group Session
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Learn alongside other students in a collaborative environment.
                    Great for networking and shared learning experiences.
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedType === "group"
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                  }`}
                >
                  {selectedType === "group" && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedType}
              className="flex-1"
            >
              Continue to Payment
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
