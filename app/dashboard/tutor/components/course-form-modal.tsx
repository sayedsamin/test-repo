import { useState, useEffect } from "react";
import { X, Loader2, Plus, Trash2, Video } from "lucide-react";
import {
    Course,
    CourseCategory,
    CreateCourseData,
    UpdateCourseData,
    DifficultyLevel,
} from "./types";
import ZoomLinkModal from "./zoom-link-modal";
import { getCurrentUserName } from "./course-service";

interface CourseFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateCourseData | UpdateCourseData) => Promise<void>;
    course?: Course;
    categories: CourseCategory[];
    tutorId: string;
}

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string }[] = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
];



export default function CourseFormModal({
    isOpen,
    onClose,
    onSubmit,
    course,
    categories,
    tutorId: _tutorId,
}: CourseFormModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showZoomModal, setShowZoomModal] = useState(false);

    const [formData, setFormData] = useState<CreateCourseData>({
        title: "",
        shortDescription: "",
        overview: "",
        difficulty: "beginner",
        prerequisites: [],
        skillsLearned: [],
        totalHours: 1,
        schedule: [
            {
                days: ["monday"],
                startTime: "09:00",
                endTime: "10:00",
                timezone: "UTC",
            },
        ],
        zoomLink: undefined,
        trialRate: 0,
        fullCourseRate: 0,
        startDate: undefined,
        endDate: undefined,
    });

    const [newPrerequisite, setNewPrerequisite] = useState("");
    const [newSkill, setNewSkill] = useState("");

    useEffect(() => {
        if (course) {
            setFormData({
                title: course.title,
                shortDescription: course.shortDescription,
                overview: course.overview,
                difficulty: course.difficulty,
                prerequisites: course.prerequisites,
                skillsLearned: course.skillsLearned,
                totalHours: course.totalHours,
                schedule: course.schedule,
                zoomLink: course.zoomLink || "",
                categoryId: course.categoryId,
                imageUrl: course.imageUrl,
                trialRate: course.trialRate,
                fullCourseRate: course.fullCourseRate,
                startDate: course.startDate ? course.startDate.split('T')[0] : undefined,
                endDate: course.endDate ? course.endDate.split('T')[0] : undefined,
            });
        } else {
            setFormData({
                title: "",
                shortDescription: "",
                overview: "",
                difficulty: "beginner",
                prerequisites: [],
                skillsLearned: [],
                totalHours: 1,
                schedule: [
                    {
                        days: ["monday"],
                        startTime: "09:00",
                        endTime: "10:00",
                        timezone: "UTC",
                    },
                ],
                zoomLink: undefined,
                trialRate: 0,
                fullCourseRate: 0,
                startDate: undefined,
                endDate: undefined,
            });
        }
    }, [course, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {


            // Basic validation check
            if (!formData.title.trim()) {
                throw new Error("Title is required");
            }
            if (!formData.shortDescription.trim()) {
                throw new Error("Short description is required");
            }
            if (!formData.overview.trim()) {
                throw new Error("Overview is required");
            }
            if (formData.skillsLearned.length === 0) {
                throw new Error("At least one skill must be specified");
            }

            // Validate schedule
            for (let i = 0; i < formData.schedule.length; i++) {
                const slot = formData.schedule[i];
                if (slot.days.length === 0) {
                    throw new Error(`Time slot ${i + 1}: Please select at least one day`);
                }
                if (slot.startTime >= slot.endTime) {
                    throw new Error(`Time slot ${i + 1}: End time must be after start time`);
                }
            }

            // Clean the form data before submission
            const cleanedData = {
                ...formData,
                zoomLink: formData.zoomLink?.trim() || undefined,
                categoryId: formData.categoryId || undefined,
                imageUrl: formData.imageUrl?.trim() || undefined,
                startDate: formData.startDate?.trim() || undefined,
                endDate: formData.endDate?.trim() || undefined,
            };

            await onSubmit(cleanedData);
            onClose();
        } catch (error) {
            // Error handling is done in parent component
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    const addPrerequisite = () => {
        if (newPrerequisite.trim()) {
            setFormData(prev => ({
                ...prev,
                prerequisites: [...prev.prerequisites, newPrerequisite.trim()],
            }));
            setNewPrerequisite("");
        }
    };

    const removePrerequisite = (index: number) => {
        setFormData(prev => ({
            ...prev,
            prerequisites: prev.prerequisites.filter((_, i) => i !== index),
        }));
    };

    const addSkill = () => {
        if (newSkill.trim()) {
            setFormData(prev => ({
                ...prev,
                skillsLearned: [...prev.skillsLearned, newSkill.trim()],
            }));
            setNewSkill("");
        }
    };

    const removeSkill = (index: number) => {
        setFormData(prev => ({
            ...prev,
            skillsLearned: prev.skillsLearned.filter((_, i) => i !== index),
        }));
    };

    // Schedule management functions
    const updateScheduleSlot = (index: number, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            schedule: prev.schedule.map((slot, i) =>
                i === index ? { ...slot, [field]: value } : slot
            )
        }));
    };

    const addScheduleSlot = () => {
        setFormData(prev => ({
            ...prev,
            schedule: [...prev.schedule, {
                days: ["monday"],
                startTime: "09:00",
                endTime: "10:00",
                timezone: "UTC"
            }]
        }));
    };

    const removeScheduleSlot = (index: number) => {
        if (formData.schedule.length > 1) {
            setFormData(prev => ({
                ...prev,
                schedule: prev.schedule.filter((_, i) => i !== index)
            }));
        }
    };

    const toggleDay = (scheduleIndex: number, day: string) => {
        setFormData(prev => ({
            ...prev,
            schedule: prev.schedule.map((slot, i) => {
                if (i === scheduleIndex) {
                    const days = slot.days.includes(day as any)
                        ? slot.days.filter(d => d !== day)
                        : [...slot.days, day as any];
                    return { ...slot, days };
                }
                return slot;
            })
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold">
                        {course ? "Edit Course" : "Create New Course"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Basic Information</h3>

                        <div>
                            <label className="block text-sm font-medium mb-2">Title *</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Short Description *</label>
                            <input
                                type="text"
                                required
                                value={formData.shortDescription}
                                onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Image URL</label>
                            <input
                                type="url"
                                value={formData.imageUrl || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                                placeholder="https://example.com/course-image.jpg"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Optional: Add a URL for the course image to display on the website</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Overview *</label>
                            <textarea
                                required
                                rows={4}
                                value={formData.overview}
                                onChange={(e) => setFormData(prev => ({ ...prev, overview: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Difficulty *</label>
                                <select
                                    required
                                    value={formData.difficulty}
                                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as DifficultyLevel }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {DIFFICULTY_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Category</label>
                                <select
                                    value={formData.categoryId || ""}
                                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value || undefined }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select a category</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Total Hours *</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.totalHours}
                                onChange={(e) => setFormData(prev => ({ ...prev, totalHours: parseInt(e.target.value) }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Start Date</label>
                                <input
                                    type="date"
                                    value={formData.startDate || ""}
                                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value || undefined }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Optional: When does the course begin?</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">End Date</label>
                                <input
                                    type="date"
                                    value={formData.endDate || ""}
                                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value || undefined }))}
                                    min={formData.startDate || ""}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Optional: When does the course end?</p>
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Pricing</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Trial Rate ($) *</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="1"
                                    value={formData.trialRate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, trialRate: parseFloat(e.target.value) || 0 }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Full Course Rate ($) *</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="1"
                                    value={formData.fullCourseRate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, fullCourseRate: parseFloat(e.target.value) || 0 }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Prerequisites */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Prerequisites</h3>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newPrerequisite}
                                onChange={(e) => setNewPrerequisite(e.target.value)}
                                placeholder="Add prerequisite"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addPrerequisite())}
                            />
                            <button
                                type="button"
                                onClick={addPrerequisite}
                                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>

                        {formData.prerequisites.length > 0 && (
                            <div className="space-y-2">
                                {formData.prerequisites.map((prereq, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                        <span className="flex-1">{prereq}</span>
                                        <button
                                            type="button"
                                            onClick={() => removePrerequisite(index)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Skills Learned */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Skills Learned *</h3>
                        <p className="text-sm text-gray-600">Add at least one skill that students will learn</p>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                placeholder="Add skill"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                            />
                            <button
                                type="button"
                                onClick={addSkill}
                                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>

                        {formData.skillsLearned.length > 0 && (
                            <div className="space-y-2">
                                {formData.skillsLearned.map((skill, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                        <span className="flex-1">{skill}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeSkill(index)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Schedule */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Schedule *</h3>
                        <p className="text-sm text-gray-600">Set your regular teaching schedule. You can add multiple time slots for different days or times.</p>

                        {formData.schedule.map((slot, scheduleIndex) => (
                            <div key={scheduleIndex} className="border rounded-lg p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium">Time Slot {scheduleIndex + 1}</h4>
                                    {formData.schedule.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeScheduleSlot(scheduleIndex)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Days Selection */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Days *</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(day => (
                                            <label key={day} className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={slot.days.includes(day as any)}
                                                    onChange={() => toggleDay(scheduleIndex, day)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm capitalize">{day.slice(0, 3)}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Time Selection */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Start Time *</label>
                                        <input
                                            type="time"
                                            required
                                            value={slot.startTime}
                                            onChange={(e) => updateScheduleSlot(scheduleIndex, 'startTime', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">End Time *</label>
                                        <input
                                            type="time"
                                            required
                                            value={slot.endTime}
                                            onChange={(e) => updateScheduleSlot(scheduleIndex, 'endTime', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Timezone */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Timezone *</label>
                                    <select
                                        required
                                        value={slot.timezone}
                                        onChange={(e) => updateScheduleSlot(scheduleIndex, 'timezone', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="UTC">UTC</option>
                                        <option value="America/New_York">Eastern Time (ET)</option>
                                        <option value="America/Chicago">Central Time (CT)</option>
                                        <option value="America/Denver">Mountain Time (MT)</option>
                                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                        <option value="Europe/London">London (GMT)</option>
                                        <option value="Europe/Paris">Paris (CET)</option>
                                        <option value="Europe/Berlin">Berlin (CET)</option>
                                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                                        <option value="Asia/Shanghai">Shanghai (CST)</option>
                                        <option value="Asia/Kolkata">India (IST)</option>
                                        <option value="Australia/Sydney">Sydney (AEST)</option>
                                    </select>
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addScheduleSlot}
                            className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Another Time Slot
                        </button>
                    </div>

                    {/* Zoom Link */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Online Meeting</h3>

                        <div>
                            <label className="block text-sm font-medium mb-2">Zoom Link</label>
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    value={formData.zoomLink || ""}
                                    onChange={(e) => setFormData(prev => ({ ...prev, zoomLink: e.target.value.trim() || undefined }))}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://zoom.us/j/... (optional)"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowZoomModal(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <Video className="h-4 w-4" />
                                    Create Zoom Link
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                You can manually enter a Zoom link or create one using our integration
                            </p>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 justify-end pt-6 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            {isSubmitting ? "Saving..." : course ? "Update Course" : "Create Course"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Zoom Link Modal */}
            <ZoomLinkModal
                isOpen={showZoomModal}
                onClose={() => setShowZoomModal(false)}
                onZoomLinkCreated={(zoomLink) => {
                    setFormData(prev => ({ ...prev, zoomLink }));
                }}
                courseSchedule={formData.schedule}
                courseTitle={formData.title || "New Course"} // Pass course title for better meeting names
                tutorName={getCurrentUserName()} // Pass tutor name for better meeting names
            />
        </div>
    );
}