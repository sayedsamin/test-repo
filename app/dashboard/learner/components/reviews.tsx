"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Star, ThumbsUp, MessageSquare, TrendingUp, Send, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertModal } from "@/components/alert-modal";
import axios from "axios";
import Image from "next/image";

interface ReviewRequest {
  id: string;
  tutorId: string;
  courseId: string;
  studentId: string;
  message: string | null;
  sentAt: string;
  status: string;
  course: {
    id: string;
    title: string;
    imageUrl: string | null;
  } | null;
  tutor: {
    id: string;
    userId: string;
    name: string;
    email: string;
    profileImageUrl: string | null;
  } | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  status: string;
  createdAt: string;
  approvedAt: string | null;
  course: {
    id: string;
    title: string;
  };
  tutor: {
    id: string;
    user: {
      name: string;
      profileImageUrl: string | null;
    };
  };
}

export default function Reviews() {
  const { user } = useAuth();
  const [reviewRequests, setReviewRequests] = useState<ReviewRequest[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ReviewRequest | null>(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    message: string;
    title?: string;
    type?: "error" | "warning" | "info" | "success";
  }>({
    isOpen: false,
    message: "",
  });

  useEffect(() => {
    if (user?.id) {
      fetchReviewRequests();
      fetchMyReviews();
    }
  }, [user]);

  const fetchReviewRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/review-requests/student?studentId=${user?.id}`);
      console.log("Fetched review requests:", response.data.data);
      setReviewRequests(response.data.data || []);
    } catch (error) {
      console.error("Error fetching review requests:", error);
      setReviewRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReviews = async () => {
    try {
      const response = await axios.get(`/api/reviews?studentId=${user?.id}`);
      setMyReviews(response.data.data || []);
    } catch (error) {
      console.error("Error fetching my reviews:", error);
      setMyReviews([]);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedRequest) {
      setAlertModal({
        isOpen: true,
        message: "Please select a course to review from the list above.",
        title: "No Course Selected",
        type: "warning",
      });
      return;
    }
    
    if (!rating || rating === 0) {
      setAlertModal({
        isOpen: true,
        message: "Please select a rating between 1 and 5 stars to submit your review.",
        title: "Rating Required",
        type: "warning",
      });
      return;
    }

    try {
      setSubmittingId(selectedRequest.id);
      
      const payload = {
        reviewRequestId: selectedRequest.id,
        rating: Number(rating), // Ensure it's a number
        comment: comment.trim() || null,
      };
      
      console.log("Submitting review with data:", payload);
      console.log("Selected request details:", {
        id: selectedRequest.id,
        tutorId: selectedRequest.tutorId,
        courseId: selectedRequest.courseId,
        studentId: selectedRequest.studentId,
        status: selectedRequest.status,
      });
      
      const response = await axios.post("/api/review-requests/submit", payload);

      console.log("Review submitted successfully:", response.data);
      
      setAlertModal({
        isOpen: true,
        message: "Your review has been submitted successfully! Thank you for your feedback.",
        title: "Review Submitted",
        type: "success",
      });
      
      // Reset form
      setSelectedRequest(null);
      setRating(0);
      setComment("");
      
      // Refresh data
      fetchReviewRequests();
      fetchMyReviews();
    } catch (error: any) {
      console.error("Error submitting review:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error statusText:", error.response?.statusText);
      console.error("Full error object:", JSON.stringify(error.response, null, 2));
      
      // Get all possible error information
      const errorData = error.response?.data;
      console.log("Raw error data:", errorData);
      console.log("Error data type:", typeof errorData);
      console.log("Error data keys:", errorData ? Object.keys(errorData) : "no data");
      
      const errorMessage = errorData?.error || 
                          errorData?.details ||
                          errorData?.message ||
                          error.message || 
                          "Failed to submit review. Please try again.";
      
      const errorDetails = errorData?.details ? `\n\nDetails: ${errorData.details}` : "";
      const fullErrorMessage = errorMessage + errorDetails;
      
      console.log("Displaying error message:", fullErrorMessage);
      
      // Check for specific error types
      const isDuplicate = errorMessage.includes("already submitted a review");
      const isFutureSession = errorMessage.includes("before attending the session");
      const isNotEnrolled = errorMessage.includes("must be enrolled") || errorMessage.includes("have booked a session");
      
      let title = "Submission Failed";
      let type: "error" | "warning" | "info" = "error";
      
      if (isDuplicate) {
        title = "Review Already Submitted";
        type = "info";
      } else if (isFutureSession) {
        title = "Session Not Yet Attended";
        type = "warning";
      } else if (isNotEnrolled) {
        title = "Enrollment Required";
        type = "warning";
      }
      
      setAlertModal({
        isOpen: true,
        message: fullErrorMessage,
        title: title,
        type: type,
      });
      
      // If duplicate, still refresh to remove it from the list
      if (isDuplicate) {
        setSelectedRequest(null);
        setRating(0);
        setComment("");
        fetchReviewRequests();
      }
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      setDeletingId(reviewId);
      
      await axios.delete(`/api/review-requests?requestId=${reviewId}&studentId=${user?.id}`);
      
      setAlertModal({
        isOpen: true,
        message: "Review request has been deleted successfully.",
        title: "Request Deleted",
        type: "success",
      });
      
      setConfirmDelete(null);
      
      // Refresh data
      fetchReviewRequests();
    } catch (error: any) {
      console.error("Error deleting review request:", error);
      
      const errorMessage = error.response?.data?.error || error.message || "Failed to delete review request. Please try again.";
      
      setAlertModal({
        isOpen: true,
        message: errorMessage,
        title: "Deletion Failed",
        type: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const renderStars = (currentRating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-6 w-6 ${
              interactive ? "cursor-pointer" : ""
            } ${
              star <= (interactive ? (hoveredRating || rating) : currentRating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoveredRating(star)}
            onMouseLeave={() => interactive && setHoveredRating(0)}
          />
        ))}
      </div>
    );
  };
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reviews & Ratings</h2>
        <p className="text-muted-foreground mt-1">
          Share your learning experience
        </p>
      </div>

      {/* Review Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reviews Given</p>
              <p className="text-2xl font-bold">{myReviews.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Requests</p>
              <p className="text-2xl font-bold">{reviewRequests.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <ThumbsUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
              <p className="text-2xl font-bold">
                {myReviews.length > 0 
                  ? (myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length).toFixed(1)
                  : "0.0"
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Review Requests */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Pending Review Requests</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Courses waiting for your feedback
              </p>
            </div>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {reviewRequests.length}
            </span>
          </div>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : reviewRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">No pending review requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviewRequests.map((request) => (
                <Card key={request.id} className="p-4">
                  <div className="flex items-start gap-4">
                    {request.course?.imageUrl && (
                      <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={request.course.imageUrl}
                          alt={request.course.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold">{request.course?.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Tutor: {request.tutor?.name}
                      </p>
                      {request.message && (
                        <p className="text-sm text-muted-foreground mt-2 italic">
                          "{request.message}"
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Requested on {new Date(request.sentAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setSelectedRequest(request)}
                        size="sm"
                        disabled={submittingId !== null || deletingId !== null}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Leave Review
                      </Button>
                      <Button
                        onClick={() => setConfirmDelete(request.id)}
                        variant="outline"
                        size="sm"
                        disabled={submittingId !== null || deletingId !== null}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Submission Modal/Form */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">Leave a Review</h3>
              
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  {selectedRequest.course?.imageUrl && (
                    <div className="relative h-20 w-20 shrink-0 rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={selectedRequest.course.imageUrl}
                        alt={selectedRequest.course.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-lg">{selectedRequest.course?.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Tutor: {selectedRequest.tutor?.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Your Rating *
                  </label>
                  {renderStars(rating, true)}
                  {rating > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {rating === 1 && "Poor"}
                      {rating === 2 && "Fair"}
                      {rating === 3 && "Good"}
                      {rating === 4 && "Very Good"}
                      {rating === 5 && "Excellent"}
                    </p>
                  )}
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Your Feedback (Optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this course..."
                    rows={5}
                    className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {comment.length}/500 characters
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleSubmitReview}
                  disabled={!rating || submittingId !== null}
                  className="flex-1"
                >
                  {submittingId === selectedRequest.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Review
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setSelectedRequest(null);
                    setRating(0);
                    setComment("");
                  }}
                  variant="outline"
                  disabled={submittingId !== null}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* My Reviews */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b p-6">
          <h3 className="text-lg font-semibold">My Reviews</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Your feedback history
          </p>
        </div>
        <div className="p-6">
          {myReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Star className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">No reviews yet</p>
              <p className="text-xs text-muted-foreground mb-4">
                Complete a review request to submit your first review
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myReviews.map((review) => (
                <Card key={review.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="mb-2">
                        <h4 className="font-semibold">{review.course.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Tutor: {review.tutor.user.name}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1 mb-2">
                        {renderStars(review.rating, false)}
                        <span className="text-sm text-muted-foreground ml-2">
                          ({review.rating}/5)
                        </span>
                      </div>

                      {review.comment && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {review.comment}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Submitted on {new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">Delete Review Request?</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete this review request? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleDeleteReview(confirmDelete)}
                  variant="destructive"
                  disabled={deletingId !== null}
                  className="flex-1"
                >
                  {deletingId === confirmDelete ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setConfirmDelete(null)}
                  variant="outline"
                  disabled={deletingId !== null}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
      
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        message={alertModal.message}
        title={alertModal.title}
        type={alertModal.type}
      />
    </div>
  );
}
