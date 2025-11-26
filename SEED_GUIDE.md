# Database Seed Guide

This guide provides a quick overview of the database seeding functionality for the Course Management System.

## Quick Start

1. **Set up your environment** - Create a `.env` file with your database connection:

   ```env
   DATABASE_URL="mongodb://localhost:27017/skillshare"
   JWT_SECRET="your-secret-key"
   ```

2. **Generate Prisma Client** (if not already done):

   ```bash
   npx prisma generate
   ```

3. **Run the seed**:
   ```bash
   npm run db:seed
   ```

## What Gets Created

The seed file creates a complete, realistic dataset:

### 📚 Course Categories (8)

Programming, Languages, Music, Art & Design, Business, Fitness, Cooking, Photography

### 👥 Users (10 total)

**Tutors (6):**

- Sarah Johnson - Full-stack developer teaching JavaScript and React courses
- Michael Chen - Mandarin Chinese instructor offering conversational and business Chinese
- Emily Rodriguez - Professional guitar teacher for beginners
- David Thompson - UX/UI Designer teaching design fundamentals
- Maria Garcia - Business consultant teaching digital marketing strategy
- James Wilson - Personal trainer offering fitness courses

**Learners (4):**

- Alex Brown - Learning programming and enrolled in JavaScript course
- Jessica Lee - Learning design and enrolled in UX/UI course
- Robert Taylor - Learning guitar and enrolled in guitar fundamentals
- Sophie Anderson - Learning Mandarin and enrolled in conversational Chinese

### 📖 Courses (8)

Each tutor offers 1-2 comprehensive courses with:

- **Trial rates**: $25-50 per session
- **Full course rates**: $400-1200 for complete programs
- **Total hours**: 15-60 hours per course
- **Difficulty levels**: Beginner, Intermediate, Advanced
- **Prerequisites and learning outcomes** clearly defined
- **Scheduled sessions** with specific days and times
- **Zoom links** for online delivery

### 📝 Enrollments (4)

- Students enrolled in various courses with progress tracking
- Hours completed and progress percentages calculated
- Realistic learning progression data

### 📅 Bookings (9)

- 4 **completed** bookings (past dates, with payments and reviews)
- 3 **confirmed** bookings (upcoming dates, with payments)
- 1 **pending** booking (awaiting tutor confirmation)
- 1 **cancelled** booking

### 💳 Payments (8)

- Associated with completed and confirmed bookings
- Various payment methods: Stripe, Credit Card, PayPal
- Realistic transaction IDs for completed payments
- Payment amounts based on trial rates and session durations

### ⭐ Reviews (4)

- One review for each completed booking
- Ratings from 4-5 stars
- Realistic comments from learners about their course experience

## Test Credentials

All users have the password: **password123**

**Tutor Logins:**

- sarah.johnson@example.com
- michael.chen@example.com
- emily.rodriguez@example.com
- david.thompson@example.com
- maria.garcia@example.com
- james.wilson@example.com

**Learner Logins:**

- alex.brown@example.com
- jessica.lee@example.com
- robert.taylor@example.com
- sophie.anderson@example.com

## Clearing and Reseeding

To clear all data and reseed from scratch:

```bash
npx prisma migrate reset
```

This will:

1. Drop the database
2. Recreate it
3. Run all migrations
4. Automatically run the seed

## Viewing the Data

Use Prisma Studio to browse the seeded data:

```bash
npx prisma studio
```

This opens a GUI at http://localhost:5555 where you can view and edit all records.

## Files

- `prisma/seed.ts` - The seed script
- `prisma/README.md` - Detailed documentation
- `prisma/schema.prisma` - Database schema

## Production Warning

⚠️ **This seed file is for development only!**

Before production:

1. Install bcrypt: `npm install bcrypt @types/bcrypt`
2. Hash passwords in the seed file
3. Never commit real user data or passwords
4. Use environment-specific seed data

## Troubleshooting

**Error: Environment variable not found: DATABASE_URL**

- Make sure you have a `.env` file with `DATABASE_URL` set
- Check that the MongoDB server is running

**Error: Prisma Client not found**

- Run `npx prisma generate` to generate the Prisma Client

**Error: Connection refused**

- Ensure MongoDB is running locally or your MongoDB Atlas connection string is correct
- Check your network connection

## Next Steps

After seeding, you can:

1. Test API endpoints with realistic data
2. Develop frontend components with real data
3. Test the authentication flow
4. Verify relationships between models
5. Test booking and payment workflows
6. Test course enrollment and progress tracking

For more details, see `prisma/README.md`
