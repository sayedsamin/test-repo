"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: "error" | "warning" | "info" | "success";
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
}: AlertModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "error":
        return {
          bg: "bg-red-50 dark:bg-red-950",
          border: "border-red-200 dark:border-red-800",
          icon: "🚫",
          iconBg: "bg-red-100 dark:bg-red-900",
          iconText: "text-red-600 dark:text-red-400",
          titleColor: "text-red-900 dark:text-red-100",
        };
      case "warning":
        return {
          bg: "bg-yellow-50 dark:bg-yellow-950",
          border: "border-yellow-200 dark:border-yellow-800",
          icon: "⚠️",
          iconBg: "bg-yellow-100 dark:bg-yellow-900",
          iconText: "text-yellow-600 dark:text-yellow-400",
          titleColor: "text-yellow-900 dark:text-yellow-100",
        };
      case "success":
        return {
          bg: "bg-green-50 dark:bg-green-950",
          border: "border-green-200 dark:border-green-800",
          icon: "✓",
          iconBg: "bg-green-100 dark:bg-green-900",
          iconText: "text-green-600 dark:text-green-400",
          titleColor: "text-green-900 dark:text-green-100",
        };
      default:
        return {
          bg: "bg-blue-50 dark:bg-blue-950",
          border: "border-blue-200 dark:border-blue-800",
          icon: "ℹ️",
          iconBg: "bg-blue-100 dark:bg-blue-900",
          iconText: "text-blue-600 dark:text-blue-400",
          titleColor: "text-blue-900 dark:text-blue-100",
        };
    }
  };

  const styles = getTypeStyles();
  const defaultTitles = {
    error: "Access Denied",
    warning: "Warning",
    success: "Success",
    info: "Information",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className={`${styles.bg} ${styles.border} border-b p-6`}>
          <div className="flex items-start gap-4">
            <div
              className={`${styles.iconBg} rounded-full p-3 flex items-center justify-center shrink-0`}
            >
              <span className="text-2xl">{styles.icon}</span>
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${styles.titleColor}`}>
                {title || defaultTitles[type]}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  );
}
