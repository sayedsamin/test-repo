import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch all review requests sent by the tutor
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tutorId = searchParams.get("tutorId");

    if (!tutorId) {
      return NextResponse.json(
        { error: "Tutor ID is required" },
        { status: 400 }
      );
    }

    const reviewRequests = await prisma.reviewRequest.findMany({
      where: {
        tutorId: tutorId,
      },
      orderBy: {
        sentAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: reviewRequests,
    });
  } catch (error) {
    console.error("Error fetching review requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch review requests" },
      { status: 500 }
    );
  }
}

// POST: Send review request to students
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tutorId, courseId, studentIds, message, forceResend } = body;

    console.log("Review request POST received:", { tutorId, courseId, studentIds, message, forceResend });

    if (!tutorId || !courseId || !studentIds || !Array.isArray(studentIds)) {
      console.error("Invalid request data:", { tutorId, courseId, studentIds });
      return NextResponse.json(
        { error: "Invalid request data. Required: tutorId, courseId, studentIds (array)" },
        { status: 400 }
      );
    }

    if (studentIds.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one student" },
        { status: 400 }
      );
    }

    // Verify tutor exists
    const tutor = await prisma.tutor.findUnique({
      where: { userId: tutorId },
    });

    if (!tutor) {
      console.error("Tutor not found for userId:", tutorId);
      return NextResponse.json(
        { error: "Tutor profile not found. Please create a course first to set up your tutor profile." },
        { status: 404 }
      );
    }

    console.log("Creating review requests for tutor:", tutor.id);

    // Validate that all IDs are valid ObjectIds (24 hex characters)
    const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
    
    if (!isValidObjectId(tutor.id)) {
      console.error("Invalid tutor ObjectId:", tutor.id);
      return NextResponse.json(
        { error: "Invalid tutor ID format" },
        { status: 400 }
      );
    }

    if (!isValidObjectId(courseId)) {
      console.error("Invalid course ObjectId:", courseId);
      return NextResponse.json(
        { error: "Invalid course ID format. Please select a valid course." },
        { status: 400 }
      );
    }

    const invalidStudentIds = studentIds.filter((id: string) => !isValidObjectId(id));
    if (invalidStudentIds.length > 0) {
      console.error("Invalid student ObjectIds:", invalidStudentIds);
      return NextResponse.json(
        { error: `Invalid student IDs: ${invalidStudentIds.join(", ")}` },
        { status: 400 }
      );
    }

    // Create review requests for each student
    try {
      console.log("Attempting to create review requests with data:", {
        tutorId: tutor.id,
        courseId,
        studentIds,
        message: message || "Please share your feedback about the course!",
      });

      const results = await Promise.allSettled(
        studentIds.map(async (studentId: string) => {
          try {
            // Check if there's already a pending review request for this combination
            const existingPendingRequest = await prisma.reviewRequest.findFirst({
              where: {
                tutorId: tutor.id,
                courseId,
                studentId,
                status: "pending",
              },
            });

            if (existingPendingRequest) {
              console.log(`Pending review request already exists for student ${studentId}`);
              
              // If forceResend is true, update the existing request with new message and sentAt date
              if (forceResend) {
                await prisma.reviewRequest.update({
                  where: { id: existingPendingRequest.id },
                  data: {
                    message: message || "Please share your feedback about the course!",
                    sentAt: new Date(), // Update the sent date
                  },
                });
                console.log(`Updated existing review request for student ${studentId}`);
                return { status: 'success', data: existingPendingRequest };
              }
              
              return { status: 'duplicate', type: 'pending' };
            }

            // Check if student has already submitted a review for this course
            const existingReview = await prisma.review.findFirst({
              where: {
                reviewerId: studentId,
                courseId,
                tutorId: tutor.id,
              },
            });

            if (existingReview) {
              console.log(`Student ${studentId} has already submitted a review for this course`);
              return { status: 'duplicate', type: 'reviewed' };
            }

            // Create the review request
            const reviewRequest = await prisma.reviewRequest.create({
              data: {
                tutorId: tutor.id,
                courseId,
                studentId,
                message: message || "Please share your feedback about the course!",
              },
            });

            return { status: 'success', data: reviewRequest };
          } catch (error: any) {
            // Check if it's a duplicate key error (P2002)
            if (error.code === 'P2002') {
              console.log(`Review request already exists for student ${studentId} (unique constraint)`);
              return { status: 'duplicate', type: 'constraint' };
            }
            throw error;
          }
        })
      );

      const successful = results.filter(
        (result): result is PromiseFulfilledResult<{ status: 'success'; data: any }> => 
          result.status === 'fulfilled' && result.value.status === 'success'
      );
      
      const duplicates = results.filter(
        (result): result is PromiseFulfilledResult<{ status: 'duplicate'; type: string }> => 
          result.status === 'fulfilled' && result.value.status === 'duplicate'
      );
      
      const failed = results.filter(
        (result): result is PromiseRejectedResult => result.status === 'rejected'
      );

      // Count duplicate types
      const pendingDuplicates = duplicates.filter(r => r.value.type === 'pending').length;
      const reviewedDuplicates = duplicates.filter(r => r.value.type === 'reviewed').length;

      console.log(`Review request results:`, {
        successful: successful.length,
        pendingDuplicates,
        reviewedDuplicates,
        failed: failed.length,
      });

      if (failed.length > 0) {
        console.error("Some review requests failed:", failed);
      }

      if (successful.length === 0 && duplicates.length === 0) {
        throw new Error("All review requests failed");
      }

      const reviewRequests = successful.map(result => result.value.data);

      let responseMessage = '';
      if (successful.length > 0 && duplicates.length > 0) {
        const duplicateMsg = [];
        if (pendingDuplicates > 0) duplicateMsg.push(`${pendingDuplicates} already pending`);
        if (reviewedDuplicates > 0) duplicateMsg.push(`${reviewedDuplicates} already reviewed`);
        responseMessage = `Sent ${successful.length} new review request(s). ${duplicateMsg.join(', ')}.`;
      } else if (successful.length > 0) {
        responseMessage = `Review requests sent to ${successful.length} student(s)`;
      } else if (duplicates.length > 0) {
        if (reviewedDuplicates > 0 && pendingDuplicates === 0) {
          responseMessage = `All selected students have already submitted reviews for this course`;
        } else if (pendingDuplicates > 0 && reviewedDuplicates === 0) {
          responseMessage = `All selected students already have pending review requests`;
        } else {
          responseMessage = `Students either have pending requests or have already submitted reviews`;
        }
      }

      return NextResponse.json({
        success: true,
        message: responseMessage,
        data: reviewRequests,
        stats: {
          sent: successful.length,
          pendingDuplicates,
          reviewedDuplicates,
          failed: failed.length,
        },
      });
    } catch (createError: any) {
      console.error("Error creating review requests in database:", createError);
      console.error("Full error object:", JSON.stringify(createError, Object.getOwnPropertyNames(createError), 2));
      throw createError; // Re-throw to be caught by outer catch
    }
  } catch (error: any) {
    console.error("=== ERROR SENDING REVIEW REQUESTS ===");
    console.error("Error object:", error);
    console.error("Error type:", typeof error);
    console.error("Error constructor:", error?.constructor?.name);
    
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error name:", error.name);
      console.error("Error stack:", error.stack);
    }
    
    // Try to extract Prisma-specific error information
    if (error.code) {
      console.error("Prisma error code:", error.code);
    }
    if (error.meta) {
      console.error("Prisma error meta:", error.meta);
    }
    
    // Return more detailed error information
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string'
        ? error
        : "Unknown error occurred";
        
    const errorDetails: any = {
      error: "Failed to send review requests",
      message: errorMessage,
    };
    
    if (error.code) {
      errorDetails.code = error.code;
    }
    if (error.meta) {
      errorDetails.meta = error.meta;
    }
    if (error.name) {
      errorDetails.name = error.name;
    }
    
    return NextResponse.json(errorDetails, { status: 500 });
  }
}

// DELETE: Delete a review request (students can delete pending requests)
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const requestId = searchParams.get("requestId");
    const studentId = searchParams.get("studentId");

    if (!requestId || !studentId) {
      return NextResponse.json(
        { error: "Request ID and Student ID are required" },
        { status: 400 }
      );
    }

    // Check if request exists and belongs to the student
    const reviewRequest = await prisma.reviewRequest.findUnique({
      where: { id: requestId },
    });

    if (!reviewRequest) {
      return NextResponse.json(
        { error: "Review request not found" },
        { status: 404 }
      );
    }

    if (reviewRequest.studentId !== studentId) {
      return NextResponse.json(
        { error: "You can only delete your own review requests" },
        { status: 403 }
      );
    }

    // Only allow deletion of pending requests (not responded ones)
    if (reviewRequest.status !== "pending") {
      return NextResponse.json(
        { error: "Cannot delete a review request that has already been responded to" },
        { status: 400 }
      );
    }

    // Delete the review request
    await prisma.reviewRequest.delete({
      where: { id: requestId },
    });

    return NextResponse.json({
      success: true,
      message: "Review request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review request:", error);
    return NextResponse.json(
      { error: "Failed to delete review request" },
      { status: 500 }
    );
  }
}
