# Review Form Feature - Quick Start Guide

## ✅ What Was Implemented

I've successfully created a comprehensive **Review Management System** for the tutor dashboard with the following features:

### 1. New "Review Form" Tab in Tutor Dashboard
- Added a new navigation item in the sidebar (between "Reviews" and "Account Settings")
- Icon: Clipboard List

### 2. Send Review Surveys
Tutors can now:
- Select a course from their list of courses
- View all enrolled students in that course
- Select multiple students using checkboxes
- Add an optional custom message
- Send review survey requests to selected students

### 3. Manage Pending Reviews
Tutors can:
- View all reviews submitted by students (awaiting approval)
- See student information, course details, ratings, and comments
- **Accept reviews** → They will be published on the main website
- **Reject reviews** → They will NOT appear on the main website

### 4. Statistics Dashboard
Track:
- Number of review requests sent
- Number of pending reviews
- Number of accepted reviews

## 🗂️ Files Created

### API Routes:
1. `/app/api/review-requests/route.ts` - Send surveys & fetch requests
2. `/app/api/review-requests/pending/route.ts` - Get pending reviews
3. `/app/api/review-requests/[id]/route.ts` - Accept/reject reviews

### Components:
1. `/app/dashboard/tutor/components/review-form.tsx` - Main UI component

### Modified Files:
1. `prisma/schema.prisma` - Added ReviewRequest model and review status
2. `app/api/reviews/route.ts` - Updated to only show accepted reviews
3. `app/dashboard/tutor/components/sidebar.tsx` - Added Review Form tab
4. `app/dashboard/tutor/page.tsx` - Integrated Review Form component

## 🎯 How to Use

### For Tutors:

1. **Login to your tutor account**
2. **Go to Dashboard → Review Form**
3. **Send a Survey:**
   - Select a course
   - Check students you want to send survey to
   - (Optional) Add a custom message
   - Click "Send Review Survey"

4. **Manage Reviews:**
   - Scroll to "Pending Reviews" section
   - Review each submission
   - Click "Accept & Publish" to make it public
   - Click "Reject" to hide it

### For Students:

When students submit a review:
1. Review goes to "pending" status
2. Tutor receives it in the "Pending Reviews" section
3. Tutor can accept or reject
4. Only accepted reviews appear on the website

## 🔧 Database Schema Updates

### New Model: ReviewRequest
```prisma
model ReviewRequest {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  tutorId     String    @db.ObjectId
  courseId    String    @db.ObjectId
  studentId   String    @db.ObjectId
  message     String?
  sentAt      DateTime  @default(now())
  respondedAt DateTime?
  status      ReviewRequestStatus @default(pending)
}
```

### Updated Model: Review
Added fields:
- `status: ReviewStatus` (pending | accepted | rejected)
- `approvedAt: DateTime?` (when tutor approved)

## 🔐 How It Works

### Review Workflow:
1. Student completes a course
2. Tutor sends review survey via Review Form
3. Student submits rating and comment
4. Review status = "pending"
5. Tutor sees it in "Pending Reviews"
6. Tutor accepts/rejects
7. If accepted → appears on main website
8. If rejected → hidden from public

## 📊 API Endpoints

### Send Review Survey
```
POST /api/review-requests
Body: {
  tutorId, courseId, studentIds[], message?
}
```

### Get Pending Reviews
```
GET /api/review-requests/pending?tutorId={id}
```

### Accept/Reject Review
```
PATCH /api/review-requests/{reviewId}
Body: { action: "accept" | "reject" }
```

### Get Public Reviews (only accepted)
```
GET /api/reviews?tutorId={id}&courseId={id}
```

## ✨ Key Features

✅ Multi-student survey sending  
✅ Custom message support  
✅ Real-time pending review display  
✅ Accept/Reject functionality  
✅ Only accepted reviews shown publicly  
✅ Student information with each review  
✅ Rating visualization (stars)  
✅ Comment display  
✅ Statistics tracking  
✅ Responsive design  
✅ Mobile-friendly sidebar  

## 🚀 Next Steps

To apply database changes:
```bash
npx prisma generate
npx prisma db push
```

To start the development server:
```bash
npm run dev
```

Navigate to: http://localhost:3000/dashboard/tutor

## 📝 Notes

- All reviews start as "pending" when students submit them
- Tutors have full control over what appears publicly
- The Review Form provides a centralized place to manage all review activities
- Statistics help track engagement and response rates

## 🎨 UI Components Used

- Button (shadcn/ui)
- Card (shadcn/ui)
- Lucide React icons
- Custom checkboxes for student selection
- Responsive grid layouts
- Animated loading states

---

**Implementation Status:** ✅ Complete and Ready to Use!

For detailed technical documentation, see `REVIEW_MANAGEMENT_DOCS.md`
