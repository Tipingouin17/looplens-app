import { pgEnum, pgTable, serial, text, timestamp, varchar, boolean, decimal, integer, numeric } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * DO NOT modify this table — it is managed by the auth system.
 */
export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Business-specific tables ─────────────────────────────────────────────────

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  stripePriceId: varchar("stripePriceId", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default("trialing"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  platform: varchar("platform", { length: 100 }),
  sdkApiKey: varchar("sdkApiKey", { length: 255 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;

export const gameLevels = pgTable("game_levels", {
  id: serial("id").primaryKey(),
  gameId: integer("gameId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  levelIndex: integer("levelIndex").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GameLevel = typeof gameLevels.$inferSelect;
export type NewGameLevel = typeof gameLevels.$inferInsert;

export const sessionStatusEnum = pgEnum("session_status", [
  "active",
  "completed",
  "quit",
  "crashed",
  "idle_timeout",
]);

export const quitReasonEnum = pgEnum("quit_reason", [
  "manual_quit",
  "idle_timeout",
  "crash",
  "level_frustration",
  "repeated_failure",
  "unknown",
]);

export const gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  gameId: integer("gameId").notNull(),
  playerIdentifier: varchar("playerIdentifier", { length: 255 }).notNull(),
  status: sessionStatusEnum("status").default("active").notNull(),
  quitReason: quitReasonEnum("quitReason"),
  quitLevelId: integer("quitLevelId"),
  sessionStartedAt: timestamp("sessionStartedAt").notNull(),
  sessionEndedAt: timestamp("sessionEndedAt"),
  durationSeconds: integer("durationSeconds"),
  deviceInfo: text("deviceInfo"),
  platformVersion: varchar("platformVersion", { length: 100 }),
  gameVersion: varchar("gameVersion", { length: 100 }),
  rawMetadata: text("rawMetadata"),
  llmQuitSummary: text("llmQuitSummary"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GameSession = typeof gameSessions.$inferSelect;
export type NewGameSession = typeof gameSessions.$inferInsert;

export const sessionEvents = pgTable("session_events", {
  id: serial("id").primaryKey(),
  sessionId: integer("sessionId").notNull(),
  gameId: integer("gameId").notNull(),
  levelId: integer("levelId"),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  eventName: varchar("eventName", { length: 255 }).notNull(),
  payload: text("payload"),
  positionX: numeric("positionX", { precision: 10, scale: 4 }),
  positionY: numeric("positionY", { precision: 10, scale: 4 }),
  positionZ: numeric("positionZ", { precision: 10, scale: 4 }),
  occurredAt: timestamp("occurredAt").notNull(),
  sequenceIndex: integer("sequenceIndex").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SessionEvent = typeof sessionEvents.$inferSelect;
export type NewSessionEvent = typeof sessionEvents.$inferInsert;

export const sessionReplays = pgTable("session_replays", {
  id: serial("id").primaryKey(),
  sessionId: integer("sessionId").notNull(),
  gameId: integer("gameId").notNull(),
  s3Key: text("s3Key").notNull(),
  s3Bucket: varchar("s3Bucket", { length: 255 }).notNull(),
  fileSizeBytes: integer("fileSizeBytes"),
  durationSeconds: integer("durationSeconds"),
  replayFormat: varchar("replayFormat", { length: 50 }).default("jsonl").notNull(),
  isProcessed: boolean("isProcessed").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SessionReplay = typeof sessionReplays.$inferSelect;
export type NewSessionReplay = typeof sessionReplays.$inferInsert;

export const dropOffHeatmapEntries = pgTable("drop_off_heatmap_entries", {
  id: serial("id").primaryKey(),
  gameId: integer("gameId").notNull(),
  levelId: integer("levelId").notNull(),
  bucketKey: varchar("bucketKey", { length: 100 }).notNull(),
  positionX: numeric("positionX", { precision: 10, scale: 4 }).notNull(),
  positionY: numeric("positionY", { precision: 10, scale: 4 }).notNull(),
  positionZ: numeric("positionZ", { precision: 10, scale: 4 }),
  quitCount: integer("quitCount").default(0).notNull(),
  totalSessionsReached: integer("totalSessionsReached").default(0).notNull(),
  dropOffRate: numeric("dropOffRate", { precision: 5, scale: 4 }),
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type DropOffHeatmapEntry = typeof dropOffHeatmapEntries.$inferSelect;
export type NewDropOffHeatmapEntry = typeof dropOffHeatmapEntries.$inferInsert;

export const quitInsightReports = pgTable("quit_insight_reports", {
  id: serial("id").primaryKey(),
  gameId: integer("gameId").notNull(),
  levelId: integer("levelId"),
  reportPeriodStart: timestamp("reportPeriodStart").notNull(),
  reportPeriodEnd: timestamp("reportPeriodEnd").notNull(),
  totalSessions: integer("totalSessions").default(0).notNull(),
  totalQuits: integer("totalQuits").default(0).notNull(),
  averageSessionDurationSeconds: integer("averageSessionDurationSeconds"),
  topQuitReason: quitReasonEnum("topQuitReason"),
  llmInsightSummary: text("llmInsightSummary"),
  llmActionableRecommendations: text("llmActionableRecommendations"),
  llmGeneratedAt: timestamp("llmGeneratedAt"),
  isPublished: boolean("isPublished").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type QuitInsightReport = typeof quitInsightReports.$inferSelect;
export type NewQuitInsightReport = typeof quitInsightReports.$inferInsert;

export const playerProfiles = pgTable("player_profiles", {
  id: serial("id").primaryKey(),
  gameId: integer("gameId").notNull(),
  playerIdentifier: varchar("playerIdentifier", { length: 255 }).notNull(),
  firstSeenAt: timestamp("firstSeenAt").notNull(),
  lastSeenAt: timestamp("lastSeenAt").notNull(),
  totalSessions: integer("totalSessions").default(0).notNull(),
  totalPlaytimeSeconds: integer("totalPlaytimeSeconds").default(0).notNull(),
  totalQuits: integer("totalQuits").default(0).notNull(),
  furthestLevelReached: integer("furthestLevelReached").default(0).notNull(),
  churnRiskScore: numeric("churnRiskScore", { precision: 5, scale: 4 }),
  tags: text("tags"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PlayerProfile = typeof playerProfiles.$inferSelect;
export type NewPlayerProfile = typeof playerProfiles.$inferInsert;

export const sdkWebhookLogs = pgTable("sdk_webhook_logs", {
  id: serial("id").primaryKey(),
  gameId: integer("gameId").notNull(),
  sdkApiKey: varchar("sdkApiKey", { length: 255 }).notNull(),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  payloadHash: varchar("payloadHash", { length: 64 }),
  rawBody: text("rawBody"),
  processingStatus: varchar("processingStatus", { length: 50 }).default("pending").notNull(),
  processingError: text("processingError"),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SdkWebhookLog = typeof sdkWebhookLogs.$inferSelect;
export type NewSdkWebhookLog = typeof sdkWebhookLogs.$inferInsert;
