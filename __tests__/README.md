# User API Integration Tests

Comprehensive **integration tests** for the User CRUD API endpoints using a **real database**.

## Database Setup

### Seeding the Database

To populate the database with sample data for manual testing, use the seed file:

```bash
npm run db:seed
```

This will create:

- 8 skill categories
- 6 tutors and 4 learners
- 13 skills with availability
- 9 bookings (completed, confirmed, pending, cancelled)
- 8 payments
- 4 reviews

See `prisma/README.md` for detailed information about the seed data.

**Note:** Tests use an isolated test database and do not rely on seed data.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Coverage

### `/api/auth/login` (POST)

- **POST /api/auth/login**
  - ✅ Logs in tutor successfully with valid credentials
  - ✅ Logs in learner successfully with valid credentials
  - ✅ Returns complete user information excluding password
  - ✅ Validates required fields (email, password)
  - ✅ Validates email format
  - ✅ Validates password length (minimum 6 characters)
  - ✅ Returns 401 for non-existent email
  - ✅ Returns 401 for incorrect password
  - ✅ Does not reveal whether email exists in error message
  - ✅ Correctly identifies tutor role from email
  - ✅ Correctly identifies learner role from email
  - ✅ Generates valid JWT token
  - ✅ Includes userId, email, and role in token
  - ✅ Handles empty request body
  - ✅ Handles null values
  - ✅ Handles email with different casing
  - ✅ Handles whitespace in credentials
  - ✅ Never returns password in response
  - ✅ Uses same error message for wrong email and wrong password

### `/api/auth/register` (POST)

- **POST /api/auth/register**
  - ✅ Registers new tutor with all fields
  - ✅ Registers new learner with minimal fields
  - ✅ Handles empty string for optional fields
  - ✅ Validates required fields (name, email, password, role)
  - ✅ Validates email format
  - ✅ Validates name length (minimum 2 characters)
  - ✅ Validates password length (minimum 6 characters)
  - ✅ Validates role (tutor or learner only)
  - ✅ Validates profileImageUrl format
  - ✅ Handles multiple validation errors
  - ✅ Prevents duplicate email registration (409)
  - ✅ Tests role-specific registration for tutors
  - ✅ Tests role-specific registration for learners
  - ✅ Handles empty request body
  - ✅ Handles null values for required fields
  - ✅ Handles special characters in name
  - ✅ Does not return password in response
  - ✅ Stores user data correctly in database

### `/api/users` (GET, POST)

- **GET /api/users**

  - ✅ Returns paginated users with default parameters
  - ✅ Filters users by role (tutor/learner)
  - ✅ Searches users by name or email
  - ✅ Handles pagination correctly
  - ✅ Validates query parameters
  - ✅ Handles database errors

- **POST /api/users**
  - ✅ Creates a new user successfully
  - ✅ Validates required fields (name, email, password, role)
  - ✅ Validates email format and uniqueness
  - ✅ Prevents duplicate email registration
  - ✅ Handles optional fields (bio, profileImageUrl)
  - ✅ Handles database errors

### `/api/users/[id]` (GET, PUT, DELETE)

- **GET /api/users/[id]**

  - ✅ Returns user by ID with related data counts
  - ✅ Returns 404 for non-existent users
  - ✅ Handles database errors

- **PUT /api/users/[id]**

  - ✅ Updates user fields successfully
  - ✅ Validates update data
  - ✅ Allows email change if not taken
  - ✅ Prevents email change to existing email
  - ✅ Supports partial updates
  - ✅ Returns 404 for non-existent users
  - ✅ Handles database errors

- **DELETE /api/users/[id]**
  - ✅ Deletes user with no related data
  - ✅ Prevents deletion of users with skills
  - ✅ Prevents deletion of users with bookings
  - ✅ Prevents deletion of users with reviews
  - ✅ Returns 404 for non-existent users
  - ✅ Handles database errors

## Test Structure

```
__tests__/
├── api/
│   ├── auth/
│   │   ├── login/
│   │   │   └── route.test.ts      # Tests for /api/auth/login
│   │   └── register/
│   │       └── route.test.ts      # Tests for /api/auth/register
│   └── users/
│       ├── route.test.ts          # Tests for /api/users
│       └── [id]/
│           └── route.test.ts      # Tests for /api/users/[id]
├── mocks/
│   ├── auth.ts                    # Auth middleware mocks
│   └── prisma.ts                  # Prisma client mocks
└── utils/
    └── test-helpers.ts            # Test utilities and helpers
```

## Database Setup

These are **integration tests** that use a **real MongoDB database**.

### Requirements

- MongoDB instance running
- `DATABASE_URL` environment variable set
- Test database (can be separate from development)

### Test Database

```bash
# .env.test or .env
DATABASE_URL="mongodb://localhost:27017/skill_test"
```

### Before Running Tests

```bash
# Generate Prisma client
npx prisma generate

# Make sure MongoDB is running
# Tests will automatically clean up data
```

## Notes

- Most endpoints are protected with JWT authentication (except `/api/auth/login` and `/api/auth/register`)
- Tests use a **REAL database** (integration tests)
- Database is cleaned before/after each test
- Password fields are excluded from all responses
- Validation is performed using Zod schemas
- Each test is isolated with its own test data
- Auth endpoints are public and do not require authentication
- Login endpoint automatically identifies user role from database
