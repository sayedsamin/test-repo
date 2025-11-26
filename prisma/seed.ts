import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  console.log("🧹 Clearing existing data...");
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.tutor.deleteMany();
  await prisma.user.deleteMany();
  await prisma.courseCategory.deleteMany();

  // Create Categories
  console.log("📚 Creating course categories...");
  const categories = await Promise.all([
    prisma.courseCategory.create({
      data: { name: "Programming" },
    }),
    prisma.courseCategory.create({
      data: { name: "Languages" },
    }),
    prisma.courseCategory.create({
      data: { name: "Music" },
    }),
    prisma.courseCategory.create({
      data: { name: "Art & Design" },
    }),
    prisma.courseCategory.create({
      data: { name: "Business" },
    }),
    prisma.courseCategory.create({
      data: { name: "Fitness" },
    }),
    prisma.courseCategory.create({
      data: { name: "Cooking" },
    }),
    prisma.courseCategory.create({
      data: { name: "Photography" },
    }),
    prisma.courseCategory.create({
      data: { name: "Others" },
    }),
  ]);

  // Create Users (Tutors)
  console.log("👥 Creating tutor users...");
  const tutorUsers = await Promise.all([
    prisma.user.create({
      data: {
        name: "Sarah Johnson",
        email: "sarah.johnson@example.com",
        password: "password123", // In production, this should be hashed
        role: "tutor",
        profileImageUrl:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
      },
    }),
    prisma.user.create({
      data: {
        name: "Michael Chen",
        email: "michael.chen@example.com",
        password: "password123",
        role: "tutor",
        profileImageUrl:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      },
    }),
    prisma.user.create({
      data: {
        name: "Emily Rodriguez",
        email: "emily.rodriguez@example.com",
        password: "password123",
        role: "tutor",
        profileImageUrl:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      },
    }),
    prisma.user.create({
      data: {
        name: "David Thompson",
        email: "david.thompson@example.com",
        password: "password123",
        role: "tutor",
        profileImageUrl:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      },
    }),
    prisma.user.create({
      data: {
        name: "Maria Garcia",
        email: "maria.garcia@example.com",
        password: "password123",
        role: "tutor",
        profileImageUrl:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
      },
    }),
    prisma.user.create({
      data: {
        name: "James Wilson",
        email: "james.wilson@example.com",
        password: "password123",
        role: "tutor",
        profileImageUrl:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      },
    }),
  ]);

  // Create Learner Users
  console.log("🎓 Creating learner users...");
  const learnerUsers = await Promise.all([
    prisma.user.create({
      data: {
        name: "Alex Brown",
        email: "alex.brown@example.com",
        password: "password123",
        role: "learner",
        profileImageUrl:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      },
    }),
    prisma.user.create({
      data: {
        name: "Jessica Lee",
        email: "jessica.lee@example.com",
        password: "password123",
        role: "learner",
        profileImageUrl:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
      },
    }),
    prisma.user.create({
      data: {
        name: "Robert Taylor",
        email: "robert.taylor@example.com",
        password: "password123",
        role: "learner",
        profileImageUrl:
          "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150",
      },
    }),
    prisma.user.create({
      data: {
        name: "Sophie Anderson",
        email: "sophie.anderson@example.com",
        password: "password123",
        role: "learner",
        profileImageUrl:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
      },
    }),
  ]);

  // Create Tutor Profiles
  console.log("🏫 Creating tutor profiles...");
  const tutors = await Promise.all([
    prisma.tutor.create({
      data: {
        userId: tutorUsers[0].id,
        bio: "Full-stack developer with 8+ years of experience. Passionate about teaching modern web development technologies including React, Node.js, and TypeScript.",
        hourlyRate: 75,
        specialties: ["React", "Node.js", "TypeScript", "JavaScript", "Web Development"],
        availability: "Flexible - All days",
        sessionDuration: "1 hour",
        language: "English",
        timezone: "UTC-08:00 Pacific Time",
      },
    }),
    prisma.tutor.create({
      data: {
        userId: tutorUsers[1].id,
        bio: "Native Mandarin speaker and certified language instructor. Specializing in conversational Chinese and business communication for professionals.",
        hourlyRate: 50,
        specialties: ["Mandarin Chinese", "Business Chinese", "Conversational Chinese", "Language Learning"],
        availability: "Weekdays only",
        sessionDuration: "1 hour",
        language: "English",
        timezone: "UTC-08:00 Pacific Time",
      },
    }),
    prisma.tutor.create({
      data: {
        userId: tutorUsers[2].id,
        bio: "Professional guitarist and music teacher with 10+ years of performance experience. Teaching all levels from beginner to advanced.",
        hourlyRate: 60,
        specialties: ["Guitar", "Music Theory", "Songwriting", "Performance"],
        availability: "Flexible - All days",
        sessionDuration: "1 hour",
        language: "English",
        timezone: "UTC-05:00 Eastern Time",
      },
    }),
    prisma.tutor.create({
      data: {
        userId: tutorUsers[3].id,
        bio: "Senior UX/UI Designer at a Fortune 500 company. Helping aspiring designers build portfolios and land their dream jobs.",
        hourlyRate: 80,
        specialties: ["UX Design", "UI Design", "Figma", "Adobe XD", "Design Thinking"],
        availability: "Weekends only",
        sessionDuration: "2 hours",
        language: "English",
        timezone: "UTC-05:00 Eastern Time",
      },
    }),
    prisma.tutor.create({
      data: {
        userId: tutorUsers[4].id,
        bio: "Business consultant and entrepreneur. Founded 3 successful startups and now teaching others how to build and scale their businesses.",
        hourlyRate: 100,
        specialties: ["Entrepreneurship", "Business Strategy", "Marketing", "Startups"],
        availability: "Weekdays only",
        sessionDuration: "1 hour",
        language: "English",
        timezone: "UTC+00:00 GMT",
      },
    }),
    prisma.tutor.create({
      data: {
        userId: tutorUsers[5].id,
        bio: "Certified personal trainer and yoga instructor. Helping people achieve their fitness goals through personalized training programs.",
        hourlyRate: 45,
        specialties: ["Fitness Training", "Yoga", "Nutrition", "Wellness"],
        availability: "Flexible - All days",
        sessionDuration: "1 hour",
        language: "English",
        timezone: "UTC-08:00 Pacific Time",
      },
    }),
  ]);

  // Create Courses
  console.log("📖 Creating courses...");
  const courses = await Promise.all([
    // Sarah's Programming Courses
    prisma.course.create({
      data: {
        tutorId: tutors[0].id,
        title: "Complete JavaScript Fundamentals",
        shortDescription: "Master JavaScript from basics to advanced concepts",
        overview:
          "A comprehensive course covering JavaScript fundamentals, ES6+ features, DOM manipulation, async programming, and modern development practices. Perfect for beginners and those looking to solidify their JavaScript knowledge.",
        difficulty: "beginner",
        prerequisites: [
          "Basic computer skills",
          "HTML/CSS knowledge helpful but not required",
        ],
        skillsLearned: [
          "JavaScript Syntax",
          "DOM Manipulation",
          "Async Programming",
          "ES6+ Features",
          "Debugging",
        ],
        totalHours: 40,
        schedule: [
          {
            days: ["monday", "wednesday", "friday"],
            startTime: "18:00",
            endTime: "20:00",
            timezone: "UTC",
          },
        ],
        zoomLink: "https://zoom.us/j/123456789",
        categoryId: categories[0].id,
        trialRate: 25.0,
        fullCourseRate: 800.0,
        imageUrl:
          "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400",
      },
    }),
    prisma.course.create({
      data: {
        tutorId: tutors[0].id,
        title: "React Development Masterclass",
        shortDescription: "Build modern web applications with React",
        overview:
          "Learn React from the ground up including hooks, context, state management, routing, and testing. Build real-world projects and deploy them to production.",
        difficulty: "intermediate",
        prerequisites: [
          "JavaScript fundamentals",
          "HTML/CSS",
          "Basic programming concepts",
        ],
        skillsLearned: [
          "React Components",
          "Hooks",
          "State Management",
          "React Router",
          "Testing",
          "Deployment",
        ],
        totalHours: 60,
        schedule: [
          {
            days: ["tuesday", "thursday"],
            startTime: "19:00",
            endTime: "21:00",
            timezone: "UTC",
          },
        ],
        zoomLink: "https://zoom.us/j/987654321",
        categoryId: categories[0].id,
        trialRate: 40.0,
        fullCourseRate: 1200.0,
        imageUrl:
          "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
      },
    }),

    // Michael's Language Courses
    prisma.course.create({
      data: {
        tutorId: tutors[1].id,
        title: "Conversational Mandarin Chinese",
        shortDescription: "Learn practical Mandarin for everyday conversations",
        overview:
          "Focus on speaking and listening skills for real-world situations. Learn essential vocabulary, pronunciation, and cultural context for effective communication.",
        difficulty: "beginner",
        prerequisites: ["No prior Chinese knowledge required"],
        skillsLearned: [
          "Basic Vocabulary",
          "Pronunciation",
          "Tones",
          "Common Phrases",
          "Cultural Context",
        ],
        totalHours: 30,
        schedule: [
          {
            days: ["monday", "wednesday"],
            startTime: "17:00",
            endTime: "18:30",
            timezone: "UTC",
          },
        ],
        zoomLink: "https://zoom.us/j/456789123",
        categoryId: categories[1].id,
        trialRate: 30.0,
        fullCourseRate: 600.0,
        imageUrl:
          "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400",
      },
    }),
    prisma.course.create({
      data: {
        tutorId: tutors[1].id,
        title: "Business Chinese Communication",
        shortDescription: "Professional Mandarin for business contexts",
        overview:
          "Advanced course focusing on business vocabulary, formal communication, presentation skills, and cultural etiquette in Chinese business environments.",
        difficulty: "advanced",
        prerequisites: [
          "Intermediate Mandarin level",
          "Basic business knowledge",
        ],
        skillsLearned: [
          "Business Vocabulary",
          "Formal Communication",
          "Presentation Skills",
          "Business Etiquette",
          "Negotiation",
        ],
        totalHours: 25,
        schedule: [
          {
            days: ["saturday"],
            startTime: "10:00",
            endTime: "12:00",
            timezone: "UTC",
          },
        ],
        zoomLink: "https://zoom.us/j/789123456",
        categoryId: categories[1].id,
        trialRate: 50.0,
        fullCourseRate: 750.0,
        imageUrl:
          "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400",
      },
    }),

    // Emily's Music Courses
    prisma.course.create({
      data: {
        tutorId: tutors[2].id,
        title: "Guitar Fundamentals for Beginners",
        shortDescription: "Learn to play guitar from scratch",
        overview:
          "Complete beginner course covering basic chords, strumming patterns, finger positioning, and your first songs. No prior musical experience required.",
        difficulty: "beginner",
        prerequisites: ["Own or have access to an acoustic or electric guitar"],
        skillsLearned: [
          "Basic Chords",
          "Strumming Patterns",
          "Finger Positioning",
          "Reading Tabs",
          "Song Playing",
        ],
        totalHours: 20,
        schedule: [
          {
            days: ["tuesday", "thursday"],
            startTime: "16:00",
            endTime: "17:00",
            timezone: "UTC",
          },
        ],
        zoomLink: "https://zoom.us/j/321654987",
        categoryId: categories[2].id,
        trialRate: 35.0,
        fullCourseRate: 500.0,
        imageUrl:
          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
      },
    }),

    // David's Design Courses
    prisma.course.create({
      data: {
        tutorId: tutors[3].id,
        title: "UX/UI Design Fundamentals",
        shortDescription:
          "Learn user experience and interface design principles",
        overview:
          "Comprehensive introduction to UX/UI design covering user research, wireframing, prototyping, and design systems. Build a portfolio project.",
        difficulty: "beginner",
        prerequisites: ["Basic computer skills", "Creative mindset"],
        skillsLearned: [
          "User Research",
          "Wireframing",
          "Prototyping",
          "Design Systems",
          "Figma",
          "Portfolio Building",
        ],
        totalHours: 35,
        schedule: [
          {
            days: ["saturday", "sunday"],
            startTime: "14:00",
            endTime: "16:00",
            timezone: "UTC",
          },
        ],
        zoomLink: "https://zoom.us/j/654987321",
        categoryId: categories[3].id,
        trialRate: 45.0,
        fullCourseRate: 900.0,
        imageUrl:
          "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400",
      },
    }),

    // Maria's Business Courses
    prisma.course.create({
      data: {
        tutorId: tutors[4].id,
        title: "Digital Marketing Strategy",
        shortDescription: "Master modern digital marketing techniques",
        overview:
          "Learn to create and execute effective digital marketing campaigns across social media, email, content marketing, and paid advertising.",
        difficulty: "intermediate",
        prerequisites: [
          "Basic business understanding",
          "Social media familiarity",
        ],
        skillsLearned: [
          "Social Media Marketing",
          "Content Strategy",
          "Email Marketing",
          "SEO Basics",
          "Analytics",
          "Campaign Management",
        ],
        totalHours: 30,
        schedule: [
          {
            days: ["monday", "wednesday", "friday"],
            startTime: "20:00",
            endTime: "21:00",
            timezone: "UTC",
          },
        ],
        zoomLink: "https://zoom.us/j/147258369",
        categoryId: categories[4].id,
        trialRate: 40.0,
        fullCourseRate: 750.0,
        imageUrl:
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
      },
    }),

    // James's Fitness Courses
    prisma.course.create({
      data: {
        tutorId: tutors[5].id,
        title: "Personal Fitness Training",
        shortDescription: "Customized fitness program for your goals",
        overview:
          "Personalized fitness training program designed around your specific goals, fitness level, and schedule. Includes nutrition guidance and progress tracking.",
        difficulty: "beginner",
        prerequisites: [
          "Medical clearance for exercise",
          "Basic fitness equipment or gym access",
        ],
        skillsLearned: [
          "Exercise Form",
          "Workout Planning",
          "Nutrition Basics",
          "Goal Setting",
          "Progress Tracking",
        ],
        totalHours: 15,
        schedule: [
          {
            days: ["monday", "wednesday", "friday"],
            startTime: "07:00",
            endTime: "08:00",
            timezone: "UTC",
          },
        ],
        zoomLink: "https://zoom.us/j/963852741",
        categoryId: categories[5].id,
        trialRate: 30.0,
        fullCourseRate: 400.0,
        imageUrl:
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
      },
    }),
  ]);

  // Create Enrollments
  console.log("📝 Creating enrollments...");
  const enrollments = await Promise.all([
    prisma.enrollment.create({
      data: {
        studentId: learnerUsers[0].id,
        courseId: courses[0].id, // Alex enrolled in JavaScript Fundamentals
        hoursCompleted: 15,
        progress: Math.round((15 / courses[0].totalHours) * 100),
      },
    }),
    prisma.enrollment.create({
      data: {
        studentId: learnerUsers[1].id,
        courseId: courses[5].id, // Jessica enrolled in UX/UI Design
        hoursCompleted: 10,
        progress: Math.round((10 / courses[5].totalHours) * 100),
      },
    }),
    prisma.enrollment.create({
      data: {
        studentId: learnerUsers[2].id,
        courseId: courses[4].id, // Robert enrolled in Guitar Fundamentals
        hoursCompleted: 8,
        progress: Math.round((8 / courses[4].totalHours) * 100),
      },
    }),
    prisma.enrollment.create({
      data: {
        studentId: learnerUsers[3].id,
        courseId: courses[2].id, // Sophie enrolled in Conversational Mandarin
        hoursCompleted: 20,
        progress: Math.round((20 / courses[2].totalHours) * 100),
      },
    }),
  ]);

  // Create Bookings
  console.log("📅 Creating bookings...");
  const now = new Date();
  const bookings = await Promise.all([
    // Completed bookings (past dates)
    prisma.booking.create({
      data: {
        learnerId: learnerUsers[0].id,
        tutorId: tutors[0].id,
        courseId: courses[0].id,
        sessionDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        durationMin: 120,
        status: "completed",
        videoLink: "https://zoom.us/rec/completed1",
      },
    }),
    prisma.booking.create({
      data: {
        learnerId: learnerUsers[1].id,
        tutorId: tutors[3].id,
        courseId: courses[5].id,
        sessionDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        durationMin: 120,
        status: "completed",
        videoLink: "https://zoom.us/rec/completed2",
      },
    }),
    prisma.booking.create({
      data: {
        learnerId: learnerUsers[2].id,
        tutorId: tutors[2].id,
        courseId: courses[4].id,
        sessionDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        durationMin: 60,
        status: "completed",
        videoLink: "https://zoom.us/rec/completed3",
      },
    }),
    prisma.booking.create({
      data: {
        learnerId: learnerUsers[3].id,
        tutorId: tutors[1].id,
        courseId: courses[2].id,
        sessionDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        durationMin: 90,
        status: "completed",
        videoLink: "https://zoom.us/rec/completed4",
      },
    }),

    // Confirmed bookings (future dates)
    prisma.booking.create({
      data: {
        learnerId: learnerUsers[0].id,
        tutorId: tutors[0].id,
        courseId: courses[1].id,
        sessionDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        durationMin: 120,
        status: "confirmed",
        videoLink: "https://zoom.us/j/987654321",
      },
    }),
    prisma.booking.create({
      data: {
        learnerId: learnerUsers[1].id,
        tutorId: tutors[4].id,
        courseId: courses[6].id,
        sessionDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        durationMin: 60,
        status: "confirmed",
        videoLink: "https://zoom.us/j/147258369",
      },
    }),
    prisma.booking.create({
      data: {
        learnerId: learnerUsers[2].id,
        tutorId: tutors[5].id,
        courseId: courses[7].id,
        sessionDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        durationMin: 60,
        status: "confirmed",
        videoLink: "https://zoom.us/j/963852741",
      },
    }),

    // Pending booking
    prisma.booking.create({
      data: {
        learnerId: learnerUsers[3].id,
        tutorId: tutors[1].id,
        courseId: courses[3].id,
        sessionDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        durationMin: 120,
        status: "pending",
      },
    }),

    // Cancelled booking
    prisma.booking.create({
      data: {
        learnerId: learnerUsers[0].id,
        tutorId: tutors[2].id,
        courseId: courses[4].id,
        sessionDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        durationMin: 60,
        status: "cancelled",
      },
    }),
  ]);

  // Create Payments for completed and confirmed bookings
  console.log("💳 Creating payments...");
  const payments = await Promise.all([
    // Payments for completed bookings
    prisma.payment.create({
      data: {
        bookingId: bookings[0].id,
        amount: 50.0,
        paymentMethod: "stripe",
        paymentStatus: "completed",
        transactionId: "txn_1completed001",
      },
    }),
    prisma.payment.create({
      data: {
        bookingId: bookings[1].id,
        amount: 90.0,
        paymentMethod: "credit_card",
        paymentStatus: "completed",
        transactionId: "txn_1completed002",
      },
    }),
    prisma.payment.create({
      data: {
        bookingId: bookings[2].id,
        amount: 35.0,
        paymentMethod: "paypal",
        paymentStatus: "completed",
        transactionId: "txn_1completed003",
      },
    }),
    prisma.payment.create({
      data: {
        bookingId: bookings[3].id,
        amount: 45.0,
        paymentMethod: "stripe",
        paymentStatus: "completed",
        transactionId: "txn_1completed004",
      },
    }),

    // Payments for confirmed bookings
    prisma.payment.create({
      data: {
        bookingId: bookings[4].id,
        amount: 80.0,
        paymentMethod: "stripe",
        paymentStatus: "completed",
        transactionId: "txn_1confirmed001",
      },
    }),
    prisma.payment.create({
      data: {
        bookingId: bookings[5].id,
        amount: 40.0,
        paymentMethod: "credit_card",
        paymentStatus: "completed",
        transactionId: "txn_1confirmed002",
      },
    }),
    prisma.payment.create({
      data: {
        bookingId: bookings[6].id,
        amount: 30.0,
        paymentMethod: "paypal",
        paymentStatus: "completed",
        transactionId: "txn_1confirmed003",
      },
    }),

    // Pending payment
    prisma.payment.create({
      data: {
        bookingId: bookings[7].id,
        amount: 100.0,
        paymentMethod: "stripe",
        paymentStatus: "pending",
      },
    }),
  ]);

  // Create Reviews for completed bookings
  console.log("⭐ Creating reviews...");
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        bookingId: bookings[0].id,
        reviewerId: learnerUsers[0].id,
        tutorId: tutors[0].id,
        courseId: courses[0].id,
        rating: 5,
        comment:
          "Excellent course! Sarah explains JavaScript concepts very clearly and provides great practical examples. Highly recommended for beginners.",
      },
    }),
    prisma.review.create({
      data: {
        bookingId: bookings[1].id,
        reviewerId: learnerUsers[1].id,
        tutorId: tutors[3].id,
        courseId: courses[5].id,
        rating: 5,
        comment:
          "David is an amazing UX/UI instructor. His real-world experience really shows and he provides valuable industry insights.",
      },
    }),
    prisma.review.create({
      data: {
        bookingId: bookings[2].id,
        reviewerId: learnerUsers[2].id,
        tutorId: tutors[2].id,
        courseId: courses[4].id,
        rating: 4,
        comment:
          "Great guitar lessons! Emily is patient and encouraging. I can already play a few songs after just a few sessions.",
      },
    }),
    prisma.review.create({
      data: {
        bookingId: bookings[3].id,
        reviewerId: learnerUsers[3].id,
        tutorId: tutors[1].id,
        courseId: courses[2].id,
        rating: 5,
        comment:
          "Michael makes learning Mandarin fun and engaging. His cultural insights are invaluable for understanding the language context.",
      },
    }),
  ]);

  console.log("✅ Database seeded successfully!");
  console.log(`
📊 Created:
   • ${categories.length} course categories
   • ${tutorUsers.length} tutor users
   • ${learnerUsers.length} learner users
   • ${tutors.length} tutor profiles
   • ${courses.length} courses
   • ${enrollments.length} enrollments
   • ${bookings.length} bookings
   • ${payments.length} payments
   • ${reviews.length} reviews

🔑 Test Credentials (password: password123):
   Tutors: sarah.johnson@example.com, michael.chen@example.com, emily.rodriguez@example.com
   Learners: alex.brown@example.com, jessica.lee@example.com, robert.taylor@example.com
  `);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
