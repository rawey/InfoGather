import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const visitors = pgTable("visitors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  email: text("email"),
  ageGroup: text("age_group").notNull(),
  city: text("city"),
  hearAbout: text("hear_about"),
  isFirstTime: boolean("is_first_time").default(false),
  notes: text("notes"),
  language: text("language").notNull().default("en"),
  submissionDate: timestamp("submission_date").defaultNow().notNull(),
});

export const churchSettings = pgTable("church_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().default("Grace Community Church"),
  subtitle: text("subtitle").notNull().default("Welcome Center"),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").notNull().default("#1976D2"),
  notificationEmails: jsonb("notification_emails").default({
    children: "",
    youth: "",
    youngAdult: "",
    adult: "",
    senior: ""
  }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertVisitorSchema = createInsertSchema(visitors).omit({
  id: true,
  submissionDate: true,
}).extend({
  fullName: z.string().min(1, "Full name is required"),
  ageGroup: z.enum(["children", "youth", "young_adult", "adult", "senior"], {
    required_error: "Age group is required"
  }),
  language: z.enum(["en", "es"]).default("en"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  city: z.string().optional(),
  hearAbout: z.string().optional(),
  isFirstTime: z.boolean().optional(),
  notes: z.string().optional(),
});

export const insertChurchSettingsSchema = createInsertSchema(churchSettings).omit({
  id: true,
  updatedAt: true,
}).extend({
  name: z.string().min(1, "Church name is required"),
  subtitle: z.string().min(1, "Subtitle is required"),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
  notificationEmails: z.object({
    children: z.string().email().optional().or(z.literal("")),
    youth: z.string().email().optional().or(z.literal("")),
    youngAdult: z.string().email().optional().or(z.literal("")),
    adult: z.string().email().optional().or(z.literal("")),
    senior: z.string().email().optional().or(z.literal("")),
  }).optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertVisitor = z.infer<typeof insertVisitorSchema>;
export type Visitor = typeof visitors.$inferSelect;

export type InsertChurchSettings = z.infer<typeof insertChurchSettingsSchema>;
export type ChurchSettings = typeof churchSettings.$inferSelect;
