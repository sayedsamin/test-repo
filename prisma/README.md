# Database Seeding

This directory contains the Prisma schema and seed file for populating the database with sample data.

## Prerequisites

Before running the seed, make sure you have:

1. **MongoDB database** set up (local or MongoDB Atlas)
2. **Environment variables** configured in `.env` file:

```env
# Database
DATABASE_URL="mongodb://localhost:27017/skillshare"
# Or for MongoDB Atlas:
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/dbname"

# JWT Secret
JWT_SECRET="your-secret-key-here"
```

3. **Prisma Client** generated:

```bash
npx prisma generate
```

## Running the Seed

There are two ways to run the seed file:

### Method 1: Using npm script (Recommended)

```bash
npm run db:seed
```

### Method 2: Using Prisma CLI

```bash
npx prisma db seed
```

This will automatically run after `prisma migrate reset` or `prisma migrate dev`.

## What Gets Seeded

The seed file (`seed.ts`) populates all models with realistic sample data:

### Skill Categories (8 categories)

- Programming
- Languages
- Music
- Art & Design
- Business
- Fitness
- Cooking
- Photography

### Users (10 users)

**Tutors (6):**

1. Sarah Johnson - Programming tutor (JavaScript, React, Full-Stack)
2. Michael Chen - Language tutor (Mandarin Chinese)
3. Emily Rodriguez - Music tutor (Guitar)
4. David Thompson - Design tutor (UX/UI, Mobile Design)
5. Maria Garcia - Business tutor (Marketing, Entrepreneurship)
6. James Wilson - Fitness tutor (Personal Training, Yoga)

**Learners (4):**

1. Alex Brown - Learning programming
2. Jessica Lee - Learning design and marketing
3. Robert Taylor - Learning guitar
4. Sophie Anderson - Learning Mandarin

All users have the password: `password123` (Note: In production, these should be hashed with bcrypt)

### Skills (13 skills)

Each tutor has 2-3 skills with:

- Detailed descriptions
- Pricing (ranging from $40-90/hour)
- Different modes (one_on_one, group, video_course)
- Availability schedules with specific days and time slots

### Bookings (9 bookings)

- 4 completed bookings (with payments and reviews)
- 3 confirmed upcoming bookings (with payments)
- 1 pending booking
- 1 cancelled booking

### Payments (8 payments)

- All completed and confirmed bookings have associated payments
- Various payment methods: Stripe, Credit Card, PayPal
- Most are completed, one is pending

### Reviews (4 reviews)

- All completed bookings have reviews
- Ratings range from 4-5 stars
- Realistic comments from learners

## Clearing the Database

To clear all data and reseed:

```bash
npx prisma migrate reset
```

This will:

1. Drop the database
2. Recreate it
3. Run all migrations
4. Automatically run the seed

## Testing the Seed

After seeding, you can verify the data by:

1. Using Prisma Studio:

```bash
npx prisma studio
```

2. Testing the API endpoints:
   - `GET /api/users` - View all users
   - `GET /api/skills` - View all skills
   - `GET /api/skill-categories` - View all categories
   - `GET /api/users/:id` - View specific user with their skills/bookings

## Sample Login Credentials

You can use these credentials to test authentication:

**Tutors:**

- sarah.johnson@example.com / password123
- michael.chen@example.com / password123
- emily.rodriguez@example.com / password123
- david.thompson@example.com / password123
- maria.garcia@example.com / password123
- james.wilson@example.com / password123

**Learners:**

- alex.brown@example.com / password123
- jessica.lee@example.com / password123
- robert.taylor@example.com / password123
- sophie.anderson@example.com / password123

## Production Considerations

⚠️ **Important:** This seed file is for development only. Before deploying to production:

1. Install and use bcrypt to hash passwords:

   ```bash
   npm install bcrypt
   npm install -D @types/bcrypt
   ```

2. Update the seed file to hash passwords:

   ```typescript
   import bcrypt from "bcrypt";

   const hashedPassword = await bcrypt.hash("password123", 10);
   ```

3. Never commit real user data or passwords to version control
4. Use environment-specific seed data
5. Consider using a separate seed file for production with minimal data
