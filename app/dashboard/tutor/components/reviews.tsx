"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Star, ThumbsUp, MessageSquare, TrendingUp, Award, Check, X, Loader2, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertModal } from "@/components/alert-modal";
import axios from "axios";
import Image from "next/image";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  status: string;
  createdAt: string;
  approvedAt: string | null;
  reviewer: {
    id: string;
    name: string;
    email: string;
    profileImageUrl: string | null;
  };
  course: {
    id: string;
    title: string;
  };
}

export default function Reviews() {
  const { user } = useAuth();
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const [acceptedReviews, setAcceptedReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    message: string;
    title?: string;
    type?: "error" | "warning" | "info" | "success";
  }>({
    isOpen: false,
    message: "",
  });
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    reviewId: string | null;
  }>({
    isOpen: false,
    reviewId: null,
  });

  useEffect(() => {
    if (user?.id) {
      fetchReviews();
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/reviews?tutorId=${user?.id}`);
      const reviews = response.data.data || [];
      
      setPendingReviews(reviews.filter((r: Review) => r.status === "pending"));
      setAcceptedReviews(reviews.filter((r: Review) => r.status === "accepted"));
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async (reviewId: string, status: "accepted" | "rejected") => {
    try {
      setProcessingId(reviewId);
      
      await axios.patch("/api/reviews", {
        reviewId,
        status,
        tutorId: user?.id,
      });

      // Refresh reviews
      fetchReviews();
    } catch (error: any) {
      console.error(`Error ${status === "accepted" ? "accepting" : "rejecting"} review:`, error);
      setAlertModal({
        isOpen: true,
        message: error.response?.data?.error || `Failed to ${status === "accepted" ? "accept" : "reject"} review`,
        title: "Action Failed",
        type: "error",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    setConfirmDelete({
      isOpen: true,
      reviewId: reviewId,
    });
  };

  const confirmDeleteReview = async () => {
    if (!confirmDelete.reviewId) return;

    try {
      setProcessingId(confirmDelete.reviewId);
      
      await axios.delete(`/api/reviews?reviewId=${confirmDelete.reviewId}&tutorId=${user?.id}`);

      setConfirmDelete({ isOpen: false, reviewId: null });
      // Refresh reviews
      fetchReviews();
    } catch (error: any) {
      console.error("Error deleting review:", error);
      setAlertModal({
        isOpen: true,
        message: error.response?.data?.error || "Failed to delete review",
        title: "Delete Failed",
        type: "error",
      });
      setConfirmDelete({ isOpen: false, reviewId: null });
    } finally {
      setProcessingId(null);
    }
  };

  const avgRating = acceptedReviews.length > 0
    ? (acceptedReviews.reduce((sum, r) => sum + r.rating, 0) / acceptedReviews.length).toFixed(1)
    : "0.0";

  const positivePercentage = acceptedReviews.length > 0
    ? Math.round((acceptedReviews.filter(r => r.rating >= 4).length / acceptedReviews.length) * 100)
    : 0;

  const ratingBreakdown = [5, 4, 3, 2, 1].map(rating => {
    const count = acceptedReviews.filter(r => r.rating === rating).length;
    const percentage = acceptedReviews.length > 0 ? (count / acceptedReviews.length) * 100 : 0;
    return { rating, count, percentage };
  });

  return (
    <div className="space-y-6 relative overflow-hidden">
      {/* Decorative background orbs (subtle, non-interactive) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-gradient-to-br from-blue-600/20 to-transparent blur-3xl opacity-60 animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="absolute -bottom-20 right-[-10%] w-96 h-96 rounded-full bg-gradient-to-br from-cyan-500/10 to-transparent blur-3xl opacity-50" style={{ animationDelay: "1.5s" }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.01)_1px,transparent_1px)] bg-[size:60px_60px] opacity-5" />
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reviews & Ratings</h2>
        <p className="text-muted-foreground mt-1">Manage your feedback from students</p>

        <div className="mt-4 flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600/80 to-cyan-400/60 px-3 py-1 text-white text-sm shadow-md">
            <Star className="h-4 w-4 text-yellow-300" />
            <span className="font-semibold">{avgRating}</span>
            <span className="opacity-80">avg</span>
          </div>
          </div>
      </div>

      {/* Review Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-gradient-to-br from-slate-900/30 to-slate-800/10 p-4 shadow-sm backdrop-blur-sm hover:shadow-lg transform transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
              <p className="text-2xl font-bold">{avgRating}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-gradient-to-br from-slate-900/30 to-slate-800/10 p-4 shadow-sm backdrop-blur-sm hover:shadow-lg transform transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reviews</p>
              <p className="text-2xl font-bold">{acceptedReviews.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-gradient-to-br from-slate-900/30 to-slate-800/10 p-4 shadow-sm backdrop-blur-sm hover:shadow-lg transform transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <ThumbsUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Positive</p>
              <p className="text-2xl font-bold">{positivePercentage}%</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-gradient-to-br from-slate-900/30 to-slate-800/10 p-4 shadow-sm backdrop-blur-sm hover:shadow-lg transform transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <Award className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{pendingReviews.length}</p>
            </div>
          </div>
        </div>
      </div>





      {/* Pending Reviews */}
      {pendingReviews.length > 0 && (
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="border-b p-6">
            <h3 className="text-lg font-semibold">Pending Reviews</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Review and approve student feedback
            </p>
          </div>
          <div className="p-6 space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              pendingReviews.map((review) => (
                <Card key={review.id} className="p-4 hover:shadow-lg hover:-translate-y-1 transform transition-transform duration-200">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <Image
                        src={review.reviewer.profileImageUrl || "/placeholder.svg"}
                        alt={review.reviewer.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{review.reviewer.name}</h4>
                        <p className="text-sm text-muted-foreground">{review.course.title}</p>
                        <div className="flex items-center gap-1 mt-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="text-sm text-muted-foreground ml-2">
                            ({review.rating}/5)
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Submitted on {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleDeleteReview(review.id)}
                        disabled={processingId !== null}
                        variant="outline"
                        className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                        size="sm"
                      >
                        {processingId === review.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleReviewAction(review.id, "accepted")}
                        disabled={processingId !== null}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        {processingId === review.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Accept
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleReviewAction(review.id, "rejected")}
                        disabled={processingId !== null}
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        size="sm"
                      >
                        {processingId === review.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}




      {/* Rating Breakdown */}
      <div className="rounded-lg border bg-gradient-to-br from-slate-900/30 to-slate-800/10 shadow-sm backdrop-blur-sm p-6 hover:shadow-lg transform transition-all duration-200">

        <div className="border-b border-white/10 pb-4 mb-4">
          <h3 className="text-lg font-semibold">Rating Breakdown</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Distribution of your accepted ratings
          </p>
        </div>

        <div className="space-y-4">
          {ratingBreakdown.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-16">
                <span className="text-sm font-medium">{rating}</span>
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              </div>

              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <span className="text-sm text-muted-foreground w-12 text-right">
                {count}
              </span>
            </div>
          ))}
        </div>

      </div>



      {/* Accepted Reviews */}
<div
  className="rounded-lg border bg-gradient-to-br from-slate-900/30 to-slate-800/10 
  shadow-sm backdrop-blur-sm p-6 hover:shadow-lg transform transition-all duration-200"
>
  <div className="border-b border-white/10 pb-4 mb-4">
    <h3 className="text-lg font-semibold">Accepted Reviews</h3>
    <p className="text-sm text-muted-foreground mt-1">
      Reviews visible on your public profile
    </p>
  </div>

  <div>
    {loading ? (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ) : acceptedReviews.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-4">No accepted reviews yet</p>
        <p className="text-xs text-muted-foreground">
          Accept pending reviews to display them publicly
        </p>
      </div>
    ) : (
      <div className="space-y-4">
        {acceptedReviews.map((review) => (
          <div
            key={review.id}
            className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start gap-4">
              <Image
                src={review.reviewer.profileImageUrl || "/placeholder.svg"}
                alt={review.reviewer.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />

              <div className="flex-1">
                <h4 className="font-semibold">{review.reviewer.name}</h4>
                <p className="text-sm text-muted-foreground">{review.course.title}</p>

                <div className="flex items-center gap-1 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">
                    ({review.rating}/5)
                  </span>
                </div>

                {review.comment && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {review.comment}
                  </p>
                )}

                <p className="text-xs text-muted-foreground mt-2">
                  Accepted on{" "}
                  {new Date(review.approvedAt || review.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => handleDeleteReview(review.id)}
                  disabled={processingId !== null}
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-4"
                  size="sm"
                >
                  {processingId === review.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Review
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
</div>









{/* Improve Your Rating */}
<div
  className="rounded-lg border bg-gradient-to-br from-slate-900/30 to-slate-800/10 
  shadow-sm backdrop-blur-sm p-6 hover:shadow-lg transform transition-all duration-200"
>
  <div className="border-b border-white/10 pb-4 mb-4">
    <div className="flex items-center gap-2">
      <TrendingUp className="h-5 w-5 text-primary" />
      <h3 className="text-lg font-semibold">Improve Your Rating</h3>
    </div>
  </div>

  <div className="grid gap-4 sm:grid-cols-2">
    <div className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
      <h4 className="font-medium mb-2">Be Responsive</h4>
      <p className="text-sm text-muted-foreground">
        Reply to messages and booking requests within 24 hours
      </p>
    </div>

    <div className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
      <h4 className="font-medium mb-2">Quality Content</h4>
      <p className="text-sm text-muted-foreground">
        Provide well-structured lessons with clear learning outcomes
      </p>
    </div>

    <div className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
      <h4 className="font-medium mb-2">Professional Conduct</h4>
      <p className="text-sm text-muted-foreground">
        Maintain punctuality and professionalism in all interactions
      </p>
    </div>

    <div className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
      <h4 className="font-medium mb-2">Follow Up</h4>
      <p className="text-sm text-muted-foreground">
        Check in with students after sessions to ensure satisfaction
      </p>
    </div>
  </div>
</div>

<AlertModal
  isOpen={alertModal.isOpen}
  onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
  message={alertModal.message}
  title={alertModal.title}
  type={alertModal.type}
/>








      {/* Confirmation Modal for Deleting */}
      {confirmDelete.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">Delete Review</h3>
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to delete this review? This action cannot be undone.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setConfirmDelete({ isOpen: false, reviewId: null });
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDeleteReview}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Yes, Delete
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
