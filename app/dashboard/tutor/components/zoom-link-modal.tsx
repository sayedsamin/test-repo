"use client";

import { useState } from "react";
import { X, Loader2, Video, Calendar, Clock } from "lucide-react";

interface ZoomLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onZoomLinkCreated: (zoomLink: string) => void;
    courseSchedule?: Array<{
        days: string[];
        startTime: string;
        endTime: string;
        timezone: string;
    }>;
    courseTitle?: string; // Optional course title for better meeting names
    tutorName?: string; // Optional tutor name for better meeting names
}

interface ZoomMeeting {
    id: string;
    topic: string;
    joinUrl: string;
    startUrl: string;
}

export default function ZoomLinkModal({
    isOpen,
    onClose,
    onZoomLinkCreated,
    courseSchedule = [],
    courseTitle,
    tutorName,
}: ZoomLinkModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedScheduleIndex, setSelectedScheduleIndex] = useState(0);

    const createZoomMeeting = async (isScheduled: boolean = false) => {
        setLoading(true);
        setError(null);

        try {
            // Create meeting topic with tutor name and course name
            let meetingTopic = "Course Session";
            if (tutorName && courseTitle) {
                meetingTopic = `${courseTitle} with ${tutorName}`;
            } else if (courseTitle) {
                meetingTopic = `${courseTitle} - Session`;
            } else if (tutorName) {
                meetingTopic = `Session with ${tutorName}`;
            }

            const body: any = {
                topic: meetingTopic,
                duration: 60,
            };

            if (isScheduled && courseSchedule.length > 0) {
                const selectedSchedule = courseSchedule[selectedScheduleIndex];

                // Find the next occurrence of the selected schedule
                const nextSessionDate = getNextScheduledDate(selectedSchedule);
                if (nextSessionDate) {
                    body.start_time = nextSessionDate.toISOString();
                }
            }

            const response = await fetch("/api/zoom", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create meeting");
            }

            const meetingData: ZoomMeeting = await response.json();

            // Pass the join URL back to the parent component
            onZoomLinkCreated(meetingData.joinUrl);
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getNextScheduledDate = (schedule: {
        days: string[];
        startTime: string;
        timezone: string;
    }) => {
        const now = new Date();
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

        // Find the next occurrence of any of the scheduled days
        for (let i = 1; i <= 7; i++) {
            const futureDate = new Date(now);
            futureDate.setDate(now.getDate() + i);

            const dayName = dayNames[futureDate.getDay()];

            if (schedule.days.includes(dayName)) {
                // Set the time
                const [hours, minutes] = schedule.startTime.split(':').map(Number);
                futureDate.setHours(hours, minutes, 0, 0);

                return futureDate;
            }
        }

        return null;
    };

    const formatScheduleDisplay = (schedule: {
        days: string[];
        startTime: string;
        endTime: string;
        timezone: string;
    }) => {
        const daysText = schedule.days.map(day =>
            day.charAt(0).toUpperCase() + day.slice(1, 3)
        ).join(', ');

        return `${daysText} at ${schedule.startTime} - ${schedule.endTime} (${schedule.timezone})`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Video className="h-5 w-5 text-blue-600" />
                        Create Zoom Link
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            Error: {error}
                        </div>
                    )}

                    {/* Meeting Name Preview */}
                    {(tutorName || courseTitle) && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm text-blue-800">
                                <strong>Meeting will be named:</strong>{" "}
                                {tutorName && courseTitle
                                    ? `${courseTitle} with ${tutorName}`
                                    : courseTitle
                                        ? `${courseTitle} - Session`
                                        : tutorName
                                            ? `Session with ${tutorName}`
                                            : "Course Session"}
                            </p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <button
                            onClick={() => createZoomMeeting(false)}
                            disabled={loading}
                            className="w-full p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-full">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-medium text-gray-900">Create Instant Meeting</h3>
                                    <p className="text-sm text-gray-600">Start a meeting right now</p>
                                </div>
                            </div>
                        </button>

                        {courseSchedule.length > 0 && (
                            <div className="space-y-3">
                                <button
                                    onClick={() => createZoomMeeting(true)}
                                    disabled={loading}
                                    className="w-full p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 rounded-full">
                                            <Calendar className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-medium text-gray-900">Schedule for Next Class</h3>
                                            <p className="text-sm text-gray-600">Based on your course schedule</p>
                                        </div>
                                    </div>
                                </button>

                                {courseSchedule.length > 1 && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Select Schedule:
                                        </label>
                                        <select
                                            value={selectedScheduleIndex}
                                            onChange={(e) => setSelectedScheduleIndex(Number(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {courseSchedule.map((schedule, index) => (
                                                <option key={index} value={index}>
                                                    {formatScheduleDisplay(schedule)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {loading && (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                            <span className="ml-2 text-gray-600">Creating Zoom meeting...</span>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 justify-end p-6 border-t">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}