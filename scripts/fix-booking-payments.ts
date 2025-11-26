import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

// Load environment variables
config();

const prisma = new PrismaClient();

async function fixBookingPayments() {
  try {
    console.log("Starting to fix booking payments...");

    // Find all bookings without payments
    const bookingsWithoutPayments = await prisma.booking.findMany({
      where: {
        payment: null,
      },
      include: {
        course: true,
      },
    });

    console.log(
      `Found ${bookingsWithoutPayments.length} bookings without payment records`
    );

    // Create payment records for each booking
    for (const booking of bookingsWithoutPayments) {
      try {
        const payment = await prisma.payment.create({
          data: {
            bookingId: booking.id,
            amount: booking.course.trialRate, // Use the trial rate as the payment amount
            paymentMethod: "stripe",
            paymentStatus: "completed",
            transactionId: `legacy_${booking.id}`,
          },
        });

        console.log(
          `✓ Created payment for booking ${booking.id}: $${payment.amount}`
        );
      } catch (error) {
        console.error(
          `✗ Failed to create payment for booking ${booking.id}:`,
          error
        );
      }
    }

    console.log("\nDone! Payment records created for all bookings.");

    // Verify the results
    const allBookings = await prisma.booking.findMany({
      include: {
        payment: true,
      },
    });

    const bookingsWithPayments = allBookings.filter(
      (b: any) => b.payment !== null
    );
    console.log(
      `\nSummary: ${bookingsWithPayments.length}/${allBookings.length} bookings now have payment records`
    );
  } catch (error) {
    console.error("Error fixing booking payments:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixBookingPayments();
