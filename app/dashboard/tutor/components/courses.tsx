"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Users,
  Loader2,
  DollarSign,
  Clock,
  Calendar,
  Video,
  ExternalLink,
} from "lucide-react";
import {
  Course,
  CourseCategory,
  CreateCourseData,
  UpdateCourseData,
} from "./types";
import {
  fetchCourses,
  fetchCourseCategories,
  createCourse,
  updateCourse,
  deleteCourse,
  getCurrentUserId,
  isAuthenticated,
} from "./course-service";
import CourseFormModal from "./course-form-modal";
import DeleteConfirmDialog from "./delete-confirm-dialog";
import { ToastContainer } from "./toast";
import { Toast } from "./types";

export default function Courses() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>(
    undefined
  );
  const [courseToDelete, setCourseToDelete] = useState<Course | undefined>(
    undefined
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [tutorId, setTutorId] = useState<string>("");

  const showToast = (
    type: "success" | "error" | "warning",
    message: string
  ) => {
    const newToast: Toast = {
      id: Date.now().toString(),
      type,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleAuthError = (error: any) => {
    const errorMessage = error.message || "An error occurred";

    // Check if it's an authentication error
    if (
      errorMessage.includes("not logged in") ||
      errorMessage.includes("Authentication failed") ||
      errorMessage.includes("Invalid authentication token")
    ) {
      showToast("error", "Session expired. Please login again.");
      setTimeout(() => {
        router.push("/");
      }, 2000);
      return true;
    }

    return false;
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Check if user is authenticated first
      if (!isAuthenticated()) {
        showToast("error", "Please login to continue");
        setTimeout(() => {
          router.push("/");
        }, 1500);
        return;
      }

      const userId = getCurrentUserId();
      setTutorId(userId);

      const [coursesData, categoriesData] = await Promise.all([
        fetchCourses(userId),
        fetchCourseCategories(),
      ]);

      setCourses(coursesData);
      setCategories(categoriesData);
    } catch (error: any) {
      if (!handleAuthError(error)) {
        showToast("error", error.message || "Failed to load data");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddCourse = () => {
    setSelectedCourse(undefined);
    setIsModalOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (course: Course) => {
    setCourseToDelete(course);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;

    setIsDeleting(true);
    try {
      await deleteCourse(courseToDelete.id);
      setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
      showToast("success", "Course deleted successfully");
      setIsDeleteDialogOpen(false);
      setCourseToDelete(undefined);
    } catch (error: any) {
      if (!handleAuthError(error)) {
        showToast("error", error.message || "Failed to delete course");
      }
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSubmit = async (data: CreateCourseData | UpdateCourseData) => {
    try {
      if (selectedCourse) {
        // Update existing course
        const updatedCourse = await updateCourse(
          selectedCourse.id,
          data as UpdateCourseData
        );
        setCourses((prev) =>
          prev.map((c) => (c.id === selectedCourse.id ? updatedCourse : c))
        );
        showToast("success", "Course updated successfully");
      } else {
        // Create new course
        const newCourse = await createCourse(data as CreateCourseData);
        setCourses((prev) => [newCourse, ...prev]);
        showToast("success", "Course created successfully");
      }
      setIsModalOpen(false);
    } catch (error: any) {
      if (!handleAuthError(error)) {
        showToast("error", error.message || "Failed to save course");
      }
      throw error;
    }
  };

  // Calculate stats
  const totalBookings = courses.reduce(
    (sum, course) => sum + (course._count?.bookings || 0),
    0
  );

  const totalEnrollments = courses.reduce(
    (sum, course) => sum + (course._count?.enrollments || 0),
    0
  );

  const difficultyLabels = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
  };

  const formatSchedule = (schedule: Course['schedule']) => {
    if (!schedule || schedule.length === 0) return "No schedule set";

    if (schedule.length === 1) {
      const slot = schedule[0];
      const days = slot.days.map(day =>
        day.charAt(0).toUpperCase() + day.slice(1)
      ).join(", ");
      return `${days} ${slot.startTime}-${slot.endTime}`;
    }

    return `${schedule.length} time slots configured`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Courses</h2>
          <p className="text-muted-foreground mt-1">
            Manage your teaching courses and offerings
          </p>
        </div>
        <button
          onClick={handleAddCourse}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Course
        </button>
      </div>
      
      {/* Course Stats */}
<div className="grid gap-4 sm:grid-cols-4">
  <div className="rounded-lg border bg-gradient-to-br from-slate-900/30 to-slate-800/10 p-4 shadow-sm backdrop-blur-sm hover:shadow-lg transform transition-all duration-200">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
        <BookOpen className="h-5 w-5 text-blue-600" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Active Courses</p>
        <p className="text-2xl font-bold">{courses.length}</p>
      </div>
    </div>
  </div>

  <div className="rounded-lg border bg-gradient-to-br from-slate-900/30 to-slate-800/10 p-4 shadow-sm backdrop-blur-sm hover:shadow-lg transform transition-all duration-200">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
        <Users className="h-5 w-5 text-green-600" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Total Enrollments</p>
        <p className="text-2xl font-bold">{totalEnrollments}</p>
      </div>
    </div>
  </div>

  <div className="rounded-lg border bg-gradient-to-br from-slate-900/30 to-slate-800/10 p-4 shadow-sm backdrop-blur-sm hover:shadow-lg transform transition-all duration-200">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
        <Calendar className="h-5 w-5 text-purple-600" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Total Bookings</p>
        <p className="text-2xl font-bold">{totalBookings}</p>
      </div>
    </div>
  </div>

  <div className="rounded-lg border bg-gradient-to-br from-slate-900/30 to-slate-800/10 p-4 shadow-sm backdrop-blur-sm hover:shadow-lg transform transition-all duration-200">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
        <DollarSign className="h-5 w-5 text-orange-600" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Avg. Course Rate</p>
        <p className="text-2xl font-bold">
          $
          {courses.length > 0
            ? (
                courses.reduce((sum, c) => sum + c.fullCourseRate, 0) /
                courses.length
              ).toFixed(0)
            : 0}
        </p>
      </div>
    </div>
  </div>
</div>




{/* Course Stats */}
<div className="rounded-lg border bg-gradient-to-br from-slate-900/30 to-slate-800/10 
  shadow-sm backdrop-blur-sm p-6 hover:shadow-lg transform transition-all duration-200">

  <div className="border-b border-white/10 pb-4 mb-4">
    <h3 className="text-lg font-semibold">Your Courses</h3>
    <p className="text-sm text-muted-foreground mt-1">
      Courses you offer to students
    </p>
  </div>

  <div>
    {courses.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-4">
          You haven&apos;t created any courses yet
        </p>
        <button
          onClick={handleAddCourse}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Create Your First Course
        </button>
      </div>
    ) : (
      <div className="space-y-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">
                      {course.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {course.shortDescription}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-3 text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        Trial: ${course.trialRate} | Full: ${course.fullCourseRate}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {course.totalHours} hours
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {difficultyLabels[course.difficulty]}
                      </span>
                      {course.category && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          {course.category.name}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatSchedule(course.schedule)}
                      </span>
                      {course._count && course._count.enrollments > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {course._count.enrollments} enrollment
                          {course._count.enrollments !== 1 ? "s" : ""}
                        </span>
                      )}
                      {course._count && course._count.bookings > 0 && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {course._count.bookings} booking
                          {course._count.bookings !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    {course.zoomLink && (
                      <div className="mt-3 pt-3 border-t">
                        <a
                          href={course.zoomLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <Video className="h-4 w-4" />
                          <span>Join Zoom Meeting</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEditCourse(course)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Edit course"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteClick(course)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete course"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
</div>



{/* Available Categories */}
{categories.length > 0 && (
  <div
    className="rounded-lg border bg-gradient-to-br from-slate-900/30 to-slate-800/10 
    shadow-sm backdrop-blur-sm p-6 hover:shadow-lg transform transition-all duration-200"
  >
    <div className="border-b border-white/10 pb-4 mb-4">
      <h3 className="text-lg font-semibold">Available Categories</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Choose from these categories when creating courses
      </p>
    </div>

    <div className="space-y-4">
      {categories.map((category) => (
        <div
          key={category.id}
          className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>

            <div className="flex-1">
              <h4 className="font-semibold text-lg">{category.name}</h4>

              {category._count && (
                <p className="text-sm text-muted-foreground mt-1">
                  {category._count.courses} course
                  {category._count.courses !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

















      {/* Tips for Creating Courses */}
      <div className="rounded-lg border bg-blue-50 dark:bg-blue-950 p-6">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
          💡 Tips for Creating Great Courses
        </h4>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>
            • Write clear, detailed descriptions and comprehensive overviews
          </li>
          <li>• Set competitive pricing for both trial and full course rates</li>
          <li>
            • Define clear prerequisites and learning outcomes
          </li>
          <li>• Set up a consistent schedule that works for your students</li>
          <li>• Keep your course content and materials up to date</li>
          <li>• Optionally provide a Zoom link for online sessions</li>
        </ul>
      </div>

      {/* Modals */}
      <CourseFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        course={selectedCourse}
        categories={categories}
        tutorId={tutorId}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Course"
        message={`Are you sure you want to delete "${courseToDelete?.title
          }"? This action cannot be undone.${courseToDelete?._count?.enrollments || courseToDelete?._count?.bookings
            ? " Note: This course has existing enrollments or bookings."
            : ""
          }`}
        isDeleting={isDeleting}
      />
    </div>
  );
}
