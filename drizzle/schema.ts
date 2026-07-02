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

export const planTierEnum = pgEnum("plan_tier", ["indie", "studio", "pro"]);

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  platform: varchar("platform", { length: 100 }),
  sdkApiKey: varchar("sdkApiKey", { length: 255 }).notNull(),
  planTier: planTierEnum("planTier").notNull().default("indie"),
  isActive: boolean("isActive").notNull().default(true),
  sessionRetentionDays: integer("sessionRetentionDays").notNull().default(30),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;

export const gameLevels = pgTable("game_levels", {
  id: serial("id").primaryKey(),
  gameId: integer("gameId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  levelKey: varchar("levelKey", { length: 255 }).notNull(),
  description: text("description"),
  ordinalPosition: integer("ordinalPosition").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GameLevel = typeof gameLevels.$inferSelect;
export type NewGameLevel = typeof gameLevels.$inferInsert;

export const sessionStatusEnum = pgEnum("session_status", [
  "active",
  "completed",
  "quit",
  "crashed",
  "timeout",
]);

export const gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  gameId: integer("gameId").notNull(),
  externalPlayerId: varchar("externalPlayerId", { length: 255 }).notNull(),
  sessionToken: varchar("sessionToken", { length: 255 }).notNull(),
  status: sessionStatusEnum("status").notNull().default("active"),
  platformInfo: text("platformInfo"),
  gameVersion: varchar("gameVersion", { length: 100 }),
  startedAt: timestamp("startedAt").notNull(),
  endedAt: timestamp("endedAt"),
  durationSeconds: integer("durationSeconds"),
  lastActiveLevelId: integer("lastActiveLevelId"),
  quitReason: text("quitReason"),
  quitReasonSummary: text("quitReasonSummary"),
  replayS3Key: varchar("replayS3Key", { length: 512 }),
  replayProcessed: boolean("replayProcessed").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GameSession = typeof gameSessions.$inferSelect;
export type NewGameSession = typeof gameSessions.$inferInsert;

export const sessionEventTypeEnum = pgEnum("session_event_type", [
  "level_start",
  "level_complete",
  "level_quit",
  "death",
  "pause",
  "resume",
  "checkpoint",
  "menu_open",
  "menu_close",
  "custom",
]);

export const sessionEvents = pgTable("session_events", {
  id: serial("id").primaryKey(),
  sessionId: integer("sessionId").notNull(),
  gameId: integer("gameId").notNull(),
  levelId: integer("levelId"),
  eventType: sessionEventTypeEnum("eventType").notNull(),
  eventKey: varchar("eventKey", { length: 255 }),
  payload: text("payload"),
  positionX: numeric("positionX", { precision: 12, scale: 4 }),
  positionY: numeric("positionY", { precision: 12, scale: 4 }),
  positionZ: numeric("positionZ", { precision: 12, scale: 4 }),
  occurredAt: timestamp("occurredAt").notNull(),
  sessionOffsetMs: integer("sessionOffsetMs").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SessionEvent = typeof sessionEvents.$inferSelect;
export type NewSessionEvent = typeof sessionEvents.$inferInsert;

export const dropOffEvents = pgTable("drop_off_events", {
  id: serial("id").primaryKey(),
  sessionId: integer("sessionId").notNull(),
  gameId: integer("gameId").notNull(),
  levelId: integer("levelId"),
  externalPlayerId: varchar("externalPlayerId", { length: 255 }).notNull(),
  dropOffTriggerEventId: integer("dropOffTriggerEventId"),
  sessionDurationSeconds: integer("sessionDurationSeconds"),
  deathCountBeforeQuit: integer("deathCountBeforeQuit").notNull().default(0),
  pauseCountBeforeQuit: integer("pauseCountBeforeQuit").notNull().default(0),
  lastPositionX: numeric("lastPositionX", { precision: 12, scale: 4 }),
  lastPositionY: numeric("lastPositionY", { precision: 12, scale: 4 }),
  lastPositionZ: numeric("lastPositionZ", { precision: 12, scale: 4 }),
  rawQuitContext: text("rawQuitContext"),
  llmAnalyzed: boolean("llmAnalyzed").notNull().default(false),
  llmQuitCategory: varchar("llmQuitCategory", { length: 100 }),
  llmSummary: text("llmSummary"),
  llmConfidenceScore: numeric("llmConfidenceScore", { precision: 4, scale: 3 }),
  occurredAt: timestamp("occurredAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DropOffEvent = typeof dropOffEvents.$inferSelect;
export type NewDropOffEvent = typeof dropOffEvents.$inferInsert;

export const heatmapSnapshots = pgTable("heatmap_snapshots", {
  id: serial("id").primaryKey(),
  gameId: integer("gameId").notNull(),
  levelId: integer("levelId").notNull(),
  snapshotDate: timestamp("snapshotDate").notNull(),
  totalSessions: integer("totalSessions").notNull().default(0),
  totalDropOffs: integer("totalDropOffs").notNull().default(0),
  dropOffRate: numeric("dropOffRate", { precision: 5, scale: 4 }),
  heatmapData: text("heatmapData").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HeatmapSnapshot = typeof heatmapSnapshots.$inferSelect;
export type NewHeatmapSnapshot = typeof heatmapSnapshots.$inferInsert;

export const insightStatusEnum = pgEnum("insight_status", [
  "pending",
  "processing",
  "ready",
  "failed",
]);

export const insights = pgTable("insights", {
  id: serial("id").primaryKey(),
  gameId: integer("gameId").notNull(),
  levelId: integer("levelId"),
  userId: integer("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary").notNull(),
  detailedAnalysis: text("detailedAnalysis"),
  quitCategory: varchar("quitCategory", { length: 100 }),
  affectedSessionCount: integer("affectedSessionCount").notNull().default(0),
  dropOffRatePercent: numeric("dropOffRatePercent", { precision: 5, scale: 2 }),
  status: insightStatusEnum("status").notNull().default("pending"),
  analyzedFrom: timestamp("analyzedFrom"),
  analyzedTo: timestamp("analyzedTo"),
  llmModel: varchar("llmModel", { length: 100 }),
  llmPromptTokens: integer("llmPromptTokens"),
  llmCompletionTokens: integer("llmCompletionTokens"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Insight = typeof insights.$inferSelect;
export type NewInsight = typeof insights.$inferInsert;

export const insightRecommendations = pgTable("insight_recommendations", {
  id: serial("id").primaryKey(),
  insightId: integer("insightId").notNull(),
  gameId: integer("gameId").notNull(),
  recommendation: text("recommendation").notNull(),
  priority: varchar("priority", { length: 50 }).notNull().default("medium"),
  isActionable: boolean("isActionable").notNull().default(true),
  isDismissed: boolean("isDismissed").notNull().default(false),
  dismissedAt: timestamp("dismissedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InsightRecommendation = typeof insightRecommendations.$inferSelect;
export type NewInsightRecommendation = typeof insightRecommendations.$inferInsert;

export const playerProfiles = pgTable("player_profiles", {
  id: serial("id").primaryKey(),
  gameId: integer("gameId").notNull(),
  externalPlayerId: varchar("externalPlayerId", { length: 255 }).notNull(),
  totalSessions: integer("totalSessions").notNull().default(0),
  totalPlaytimeSeconds: integer("totalPlaytimeSeconds").notNull().default(0),
  totalDeaths: integer("totalDeaths").notNull().default(0),
  totalQuits: integer("totalQuits").notNull().default(0),
  levelsCompleted: integer("levelsCompleted").notNull().default(0),
  furthestLevelId: integer("furthestLevelId"),
  firstSeenAt: timestamp("firstSeenAt").notNull(),
  lastSeenAt: timestamp("lastSeenAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PlayerProfile = typeof playerProfiles.$inferSelect;
export type NewPlayerProfile = typeof playerProfiles.$inferInsert;

export const dailyGameMetrics = pgTable("daily_game_metrics", {
  id: serial("id").primaryKey(),
  gameId: integer("gameId").notNull(),
  metricDate: timestamp("metricDate").notNull(),
  totalSessions: integer("totalSessions").notNull().default(0),
  uniquePlayers: integer("uniquePlayers").notNull().default(0),
  avgSessionDurationSeconds: integer("avgSessionDurationSeconds").notNull().default(0),
  totalQuits: integer("totalQuits").notNull().default(0),
  totalCrashes: integer("totalCrashes").notNull().default(0),
  totalCompletions: integer("totalCompletions").notNull().default(0),
  quitRate: numeric("quitRate", { precision: 5, scale: 4 }),
  completionRate: numeric("completionRate", { precision: 5, scale: 4 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyGameMetric = typeof dailyGameMetrics.$inferSelect;
export type NewDailyGameMetric = typeof dailyGameMetrics.$inferInsert;
