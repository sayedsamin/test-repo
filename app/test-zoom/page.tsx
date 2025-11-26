import ZoomMeetingCreator from "@/components/zoom-meeting-creator";

export default function TestZoomPage() {
    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">
                    Test Zoom Integration
                </h1>
                <ZoomMeetingCreator />
            </div>
        </div>
    );
}