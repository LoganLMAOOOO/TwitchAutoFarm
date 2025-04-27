import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User accounts
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  username: text("username").notNull(),
  authType: text("auth_type").notNull(), // "cookie" or "oauth"
  authCredentials: text("auth_credentials").notNull(),
  remember: boolean("remember").default(false),
  active: boolean("active").default(true),
});

export const insertAccountSchema = createInsertSchema(accounts).pick({
  name: true,
  username: true,
  authType: true,
  authCredentials: true,
  remember: true,
});

// Channel farms
export const farms = pgTable("farms", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull(),
  channelName: text("channel_name").notNull(),
  channelId: text("channel_id"),
  profileImage: text("profile_image"),
  status: text("status").default("active"), // active, warning, error, offline
  uptime: integer("uptime").default(0), // in seconds
  pointsClaimed: integer("points_claimed").default(0),
  watchTime: integer("watch_time").default(0), // in seconds
  enabled: boolean("enabled").default(true),
  features: json("features").$type<{
    claimPoints: boolean;
    watchTime: boolean;
    predictions: boolean;
    claimDrops: boolean;
  }>().notNull(),
  predictionSettings: json("prediction_settings").$type<{
    strategy: "random" | "majority" | "percentage" | "custom";
    maxPoints: number;
    favorableOddsOnly: boolean;
  }>().notNull(),
  lastActivity: timestamp("last_activity").defaultNow(),
});

export const insertFarmSchema = createInsertSchema(farms).pick({
  accountId: true,
  channelName: true,
  features: true,
  predictionSettings: true,
});

// Activity logs
export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow(),
  accountId: integer("account_id").notNull(),
  accountName: text("account_name").notNull(),
  channelId: text("channel_id"),
  channelName: text("channel_name").notNull(),
  event: text("event").notNull(),
  status: text("status").notNull(), // success, warning, error, info
  details: text("details"),
});

export const insertLogSchema = createInsertSchema(logs).pick({
  accountId: true,
  accountName: true,
  channelId: true,
  channelName: true,
  event: true,
  status: true,
  details: true,
});

// Statistics
export const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  date: timestamp("date").defaultNow().notNull().unique(),
  activeFarms: integer("active_farms").default(0),
  pointsClaimed: integer("points_claimed").default(0),
  watchHours: integer("watch_hours").default(0),
  predictionRate: integer("prediction_rate").default(0),
});

export const insertStatSchema = createInsertSchema(stats).pick({
  activeFarms: true,
  pointsClaimed: true,
  watchHours: true,
  predictionRate: true,
});

// User model schema for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Type exports
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;

export type Farm = typeof farms.$inferSelect;
export type InsertFarm = z.infer<typeof insertFarmSchema>;

export type Log = typeof logs.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;

export type Stat = typeof stats.$inferSelect;
export type InsertStat = z.infer<typeof insertStatSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
