"use client";

import { useState } from "react";

interface ZoomMeeting {
    id: string;
    topic: string;
    joinUrl: string;
    startUrl: string;
}

export default function ZoomMeetingCreator() {
    const [meeting, setMeeting] = useState<ZoomMeeting | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createMeeting = async (isScheduled: boolean = false) => {
        setLoading(true);
        setError(null);

        try {
            const body: any = {
                topic: "Tutoring Session",
                duration: 60,
            };

            // If scheduled, set start time to 1 hour from now
            if (isScheduled) {
                const startTime = new Date();
                startTime.setHours(startTime.getHours() + 1);
                body.start_time = startTime.toISOString();
            }

            const response = await fetch("/api/zoom/meetings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create meeting");
            }

            const meetingData = await response.json();
            setMeeting(meetingData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Create Zoom Meeting</h2>

            <div className="space-y-3">
                <button
                    onClick={() => createMeeting(false)}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    {loading ? "Creating..." : "Create Instant Meeting"}
                </button>

                <button
                    onClick={() => createMeeting(true)}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                    {loading ? "Creating..." : "Schedule Meeting (1 hour from now)"}
                </button>
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    Error: {error}
                </div>
            )}

            {meeting && (
                <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
                    <h3 className="font-bold text-green-800">Meeting Created!</h3>
                    <p className="text-sm text-green-700 mt-2">
                        <strong>Topic:</strong> {meeting.topic}
                    </p>
                    <p className="text-sm text-green-700">
                        <strong>Meeting ID:</strong> {meeting.id}
                    </p>
                    <div className="mt-3 space-y-2">
                        <a
                            href={meeting.joinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full text-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Join Meeting
                        </a>
                        <button
                            onClick={() => navigator.clipboard.writeText(meeting.joinUrl)}
                            className="w-full px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Copy Join URL
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}