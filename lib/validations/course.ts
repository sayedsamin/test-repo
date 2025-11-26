import { z } from "zod";

const courseScheduleSchema = z.object({
  days: z.array(
    z.enum([
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ])
  ),
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  endTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  timezone: z.string().min(1, "Timezone is required"),
});

export const createCourseSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  shortDescription: z
    .string()
    .min(1, "Short description is required")
    .max(500, "Short description must be less than 500 characters"),
  overview: z.string().min(1, "Overview is required"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  prerequisites: z.array(z.string()).default([]),
  skillsLearned: z
    .array(z.string())
    .min(1, "At least one skill must be specified"),
  totalHours: z.number().int().min(1, "Total hours must be at least 1"),
  schedule: z
    .array(courseScheduleSchema)
    .min(1, "At least one schedule slot is required"),
  zoomLink: z
    .string()
    .optional()
    .transform((val) => val?.trim() || undefined)
    .refine((val) => !val || /^https?:\/\/.+/.test(val), {
      message: "Invalid Zoom link URL",
    }),
  categoryId: z.string().optional(),
  imageUrl: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      if (!val || val.trim() === '') return undefined;
      return val.trim();
    })
    .refine((val) => !val || /^https?:\/\/.+/.test(val), {
      message: "Invalid image URL",
    }),
  trialRate: z.number().min(0, "Trial rate must be non-negative"),
  fullCourseRate: z.number().min(0, "Full course rate must be non-negative"),
  startDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      if (!val || val.trim() === '') return undefined;
      return new Date(val);
    }),
  endDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      if (!val || val.trim() === '') return undefined;
      return new Date(val);
    }),
});

// For updates, we need to handle optional fields differently
export const updateCourseSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters")
    .optional(),
  shortDescription: z
    .string()
    .min(1, "Short description is required")
    .max(500, "Short description must be less than 500 characters")
    .optional(),
  overview: z.string().min(1, "Overview is required").optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  prerequisites: z.array(z.string()).optional(),
  skillsLearned: z
    .array(z.string())
    .min(1, "At least one skill must be specified")
    .optional(),
  totalHours: z.number().int().min(1, "Total hours must be at least 1").optional(),
  schedule: z
    .array(courseScheduleSchema)
    .min(1, "At least one schedule slot is required")
    .optional(),
  zoomLink: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      if (!val || (typeof val === 'string' && val.trim() === '')) return undefined;
      return typeof val === 'string' ? val.trim() : val;
    })
    .refine((val) => !val || (typeof val === 'string' && /^https?:\/\/.+/.test(val)), {
      message: "Invalid Zoom link URL",
    }),
  categoryId: z.string().optional().nullable(),
  imageUrl: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      if (!val || (typeof val === 'string' && val.trim() === '')) return undefined;
      return typeof val === 'string' ? val.trim() : val;
    })
    .refine((val) => !val || (typeof val === 'string' && /^https?:\/\/.+/.test(val)), {
      message: "Invalid image URL",
    }),
  trialRate: z.number().min(0, "Trial rate must be non-negative").optional(),
  fullCourseRate: z.number().min(0, "Full course rate must be non-negative").optional(),
  startDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      if (!val || (typeof val === 'string' && val.trim() === '')) return undefined;
      return typeof val === 'string' ? new Date(val) : val;
    }),
  endDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      if (!val || (typeof val === 'string' && val.trim() === '')) return undefined;
      return typeof val === 'string' ? new Date(val) : val;
    }),
});

export const courseQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1)),
  limit: z
    .string()
    .optional()
    .default("10")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(100)),
  search: z.string().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  categoryId: z.string().optional(),
  tutorId: z.string().optional(),
  userId: z.string().optional(),
  createdAfter: z.string().optional(),
  createdBefore: z.string().optional(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CourseQueryInput = z.infer<typeof courseQuerySchema>;
