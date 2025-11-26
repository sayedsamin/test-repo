# Review Management System - Documentation

## Overview
The Review Management System allows tutors to:
1. **Send review surveys** to students enrolled in their courses
2. **Manage pending reviews** submitted by students
3. **Accept or reject reviews** before they appear on the public website

## Features Implemented

### 1. Database Schema Updates
**File:** `prisma/schema.prisma`

#### New Models:
- **ReviewRequest**: Tracks survey requests sent to students
  - `id`: Unique identifier
  - `tutorId`: Reference to the tutor
  - `courseId`: Reference to the course
  - `studentId`: Reference to the student
  - `message`: Optional custom message
  - `sentAt`: Timestamp when request was sent
  - `respondedAt`: Timestamp when student responded
  - `status`: pending | responded | expired

#### Updated Models:
- **Review**: Added status tracking and approval timestamp
  - `status`: pending | accepted | rejected
  - `approvedAt`: Timestamp when review was approved

#### New Enums:
- `ReviewStatus`: pending, accepted, rejected
- `ReviewRequestStatus`: pending, responded, expired

### 2. API Endpoints

#### Review Requests API
**Base Path:** `/api/review-requests`

**GET** `/api/review-requests?tutorId={id}`
- Fetch all review requests sent by a tutor
- Returns list of review requests with timestamps

**POST** `/api/review-requests`
- Send review surveys to multiple students
- Body:
  ```json
  {
    "tutorId": "string",
    "courseId": "string",
    "studentIds": ["string"],
    "message": "string (optional)"
  }
  ```

**PATCH** `/api/review-requests/[id]?action={accept|reject}`
- Accept or reject a pending review
- Body: `{ "action": "accept" | "reject" }`

**DELETE** `/api/review-requests/[id]`
- Delete a review request

#### Pending Reviews API
**GET** `/api/review-requests/pending?tutorId={id}`
- Fetch all pending reviews awaiting tutor approval
- Returns reviews with reviewer details and course info

#### Reviews API (Updated)
**GET** `/api/reviews?tutorId={id}&courseId={id}`
- Fetch only **accepted** reviews for public display
- Filters by tutor or course if specified

**POST** `/api/reviews`
- Submit a new review (students)
- All reviews start with `status: "pending"`
- Body:
  ```json
  {
    "bookingId": "string",
    "reviewerId": "string",
    "tutorId": "string",
    "courseId": "string",
    "rating": 1-5,
    "comment": "string (optional)"
  }
  ```

### 3. UI Components

#### Review Form Component
**File:** `app/dashboard/tutor/components/review-form.tsx`

**Features:**
1. **Send Review Survey Section**
   - Select course from dropdown
   - View enrolled students
   - Select multiple students via checkboxes
   - Add custom message (optional)
   - Send survey to selected students

2. **Pending Reviews Section**
   - Display all reviews awaiting approval
   - Show student info, course, rating, and comments
   - Accept button: Publishes review to main website
   - Reject button: Hides review from public view

3. **Statistics Cards**
   - Requests Sent counter
   - Pending reviews counter
   - Accepted reviews counter

#### Updated Components

**Sidebar** (`app/dashboard/tutor/components/sidebar.tsx`)
- Added "Review Form" menu item with ClipboardList icon
- Positioned between "Reviews" and "Account Settings"

**Tutor Dashboard** (`app/dashboard/tutor/page.tsx`)
- Imported ReviewForm component
- Added "review-form" case to renderContent switch

### 4. User Workflow

#### For Tutors:
1. Navigate to Dashboard → **Review Form**
2. Select a course from dropdown
3. Select students to send survey to
4. (Optional) Add a custom message
5. Click "Send Review Survey"
6. View pending reviews in the section below
7. Accept or reject each review
8. Accepted reviews appear on the main website

#### For Students:
1. Complete a course/session
2. Receive review survey notification
3. Submit rating and comment
4. Review goes to "pending" status
5. Wait for tutor approval
6. If accepted, review appears publicly

### 5. Database Migration

To apply the schema changes:

```bash
# Generate Prisma Client
npx prisma generate

# Apply migrations (if using migrate)
npx prisma migrate dev --name add-review-management

# Or push schema directly
npx prisma db push
```

## Security Considerations

1. **Authorization**: Ensure tutors can only manage reviews for their own courses
2. **Validation**: All API endpoints validate required fields
3. **Status Workflow**: Reviews follow strict status progression (pending → accepted/rejected)
4. **Public Display**: Only accepted reviews are shown on the website

## Future Enhancements

1. Email notifications when:
   - Review survey is sent to student
   - Student submits a review
   - Tutor accepts/rejects a review

2. Bulk actions:
   - Accept/reject multiple reviews at once
   - Send surveys to all students in a course

3. Analytics:
   - Response rate tracking
   - Average time to respond
   - Review trends over time

4. Review reminders:
   - Auto-expire old requests
   - Send follow-up reminders

5. Review filtering:
   - Filter by rating
   - Filter by date range
   - Search by student name

## Testing

To test the feature:

1. **Login as a tutor**
2. Navigate to **Dashboard → Review Form**
3. Test sending survey (ensure you have courses with enrolled students)
4. Simulate student review submission via API
5. Test accept/reject functionality
6. Verify only accepted reviews appear on main website

## API Testing Examples

### Send Review Survey
```bash
curl -X POST http://localhost:3000/api/review-requests \
  -H "Content-Type: application/json" \
  -d '{
    "tutorId": "tutor123",
    "courseId": "course456",
    "studentIds": ["student1", "student2"],
    "message": "Please share your feedback!"
  }'
```

### Accept a Review
```bash
curl -X PATCH http://localhost:3000/api/review-requests/review789 \
  -H "Content-Type: application/json" \
  -d '{ "action": "accept" }'
```

### Fetch Pending Reviews
```bash
curl http://localhost:3000/api/review-requests/pending?tutorId=tutor123
```

## Files Modified/Created

### Created:
- `app/api/review-requests/route.ts`
- `app/api/review-requests/pending/route.ts`
- `app/api/review-requests/[id]/route.ts`
- `app/dashboard/tutor/components/review-form.tsx`

### Modified:
- `prisma/schema.prisma`
- `app/api/reviews/route.ts`
- `app/dashboard/tutor/components/sidebar.tsx`
- `app/dashboard/tutor/page.tsx`

## Dependencies

No new dependencies required. Uses existing:
- Prisma (database ORM)
- Next.js App Router
- Axios (API calls)
- Lucide React (icons)
- Shadcn UI components (Button, Card)
