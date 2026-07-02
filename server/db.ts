import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../drizzle/schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import {
  subscriptions,
  games,
  gameLevels,
  gameSessions,
  sessionEvents,
  sessionReplays,
  dropOffHeatmapEntries,
  quitInsightReports,
  playerProfiles,
  sdkWebhookLogs,
  type Subscription,
  type NewSubscription,
  type Game,
  type NewGame,
  type GameLevel,
  type NewGameLevel,
  type GameSession,
  type NewGameSession,
  type SessionEvent,
  type NewSessionEvent,
  type SessionReplay,
  type NewSessionReplay,
  type DropOffHeatmapEntry,
  type NewDropOffHeatmapEntry,
  type QuitInsightReport,
  type NewQuitInsightReport,
  type PlayerProfile,
  type NewPlayerProfile,
  type SdkWebhookLog,
  type NewSdkWebhookLog,
} from "../drizzle/schema";

let db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!db) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle(pool, { schema });
  }
  return db;
}

export async function upsertUser(clerkId: string, email: string, name: string) {
  const db = await getDb();
  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.clerkId, clerkId))
    .limit(1);

  if (existing.length > 0) {
    const updated = await db
      .update(schema.users)
      .set({ email, name, updatedAt: new Date() })
      .where(eq(schema.users.clerkId, clerkId))
      .returning();
    return updated[0];
  }

  const inserted = await db
    .insert(schema.users)
    .values({ clerkId, email, name })
    .returning();
  return inserted[0];
}

export async function getUserByOpenId(clerkId: string) {
  const db = await getDb();
  const result = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.clerkId, clerkId))
    .limit(1);
  return result[0] ?? null;
}

// ─── Subscription Helpers ────────────────────────────────────────────────────

export async function getSubscriptionByUserId(userId: number): Promise<Subscription | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);
  return result[0] ?? null;
}

export async function getSubscriptionByStripeCustomerId(stripeCustomerId: string): Promise<Subscription | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeCustomerId, stripeCustomerId))
    .limit(1);
  return result[0] ?? null;
}

export async function getSubscriptionByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .limit(1);
  return result[0] ?? null;
}

export async function createSubscription(data: NewSubscription): Promise<Subscription> {
  const db = await getDb();
  const result = await db.insert(subscriptions).values(data).returning();
  return result[0];
}

export async function updateSubscription(
  id: number,
  data: Partial<Omit<Subscription, "id" | "createdAt">>
): Promise<Subscription | null> {
  const db = await getDb();
  const result = await db
    .update(subscriptions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(subscriptions.id, id))
    .returning();
  return result[0] ?? null;
}

export async function upsertSubscriptionByUserId(
  userId: number,
  data: Omit<NewSubscription, "userId">
): Promise<Subscription> {
  const db = await getDb();
  const existing = await getSubscriptionByUserId(userId);
  if (existing) {
    const updated = await db
      .update(subscriptions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subscriptions.userId, userId))
      .returning();
    return updated[0];
  }
  const inserted = await db
    .insert(subscriptions)
    .values({ userId, ...data })
    .returning();
  return inserted[0];
}

// ─── Game Helpers ────────────────────────────────────────────────────────────

export async function getGamesByUserId(userId: number): Promise<Game[]> {
  const db = await getDb();
  return db
    .select()
    .from(games)
    .where(eq(games.userId, userId))
    .orderBy(desc(games.createdAt));
}

export async function getGameById(gameId: number): Promise<Game | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(games)
    .where(eq(games.id, gameId))
    .limit(1);
  return result[0] ?? null;
}

export async function getGameBySlug(slug: string): Promise<Game | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(games)
    .where(eq(games.slug, slug))
    .limit(1);
  return result[0] ?? null;
}

export async function getGameBySdkApiKey(sdkApiKey: string): Promise<Game | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(games)
    .where(eq(games.sdkApiKey, sdkApiKey))
    .limit(1);
  return result[0] ?? null;
}

export async function createGame(data: NewGame): Promise<Game> {
  const db = await getDb();
  const result = await db.insert(games).values(data).returning();
  return result[0];
}

export async function updateGame(
  gameId: number,
  userId: number,
  data: Partial<Omit<Game, "id" | "userId" | "createdAt">>
): Promise<Game | null> {
  const db = await getDb();
  const result = await db
    .update(games)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(games.id, gameId), eq(games.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function deleteGame(gameId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  const result = await db
    .delete(games)
    .where(and(eq(games.id, gameId), eq(games.userId, userId)))
    .returning();
  return result.length > 0;
}

export async function setGameActiveStatus(
  gameId: number,
  userId: number,
  isActive: boolean
): Promise<Game | null> {
  const db = await getDb();
  const result = await db
    .update(games)
    .set({ isActive, updatedAt: new Date() })
    .where(and(eq(games.id, gameId), eq(games.userId, userId)))
    .returning();
  return result[0] ?? null;
}

// ─── Game Level Helpers ──────────────────────────────────────────────────────

export async function getLevelsByGameId(gameId: number): Promise<GameLevel[]> {
  const db = await getDb();
  return db
    .select()
    .from(gameLevels)
    .where(eq(gameLevels.gameId, gameId))
    .orderBy(asc(gameLevels.levelIndex));
}

export async function getLevelById(levelId: number): Promise<GameLevel | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(gameLevels)
    .where(eq(gameLevels.id, levelId))
    .limit(1);
  return result[0] ?? null;
}

export async function createGameLevel(data: NewGameLevel): Promise<GameLevel> {
  const db = await getDb();
  const result = await db.insert(gameLevels).values(data).returning();
  return result[0];
}

export async function updateGameLevel(
  levelId: number,
  gameId: number,
  data: Partial<Omit<GameLevel, "id" | "gameId" | "createdAt">>
): Promise<GameLevel | null> {
  const db = await getDb();
  const result = await db
    .update(gameLevels)
    .set(data)
    .where(and(eq(gameLevels.id, levelId), eq(gameLevels.gameId, gameId)))
    .returning();
  return result[0] ?? null;
}

export async function deleteGameLevel(levelId: number, gameId: number): Promise<boolean> {
  const db = await getDb();
  const result = await db
    .delete(gameLevels)
    .where(and(eq(gameLevels.id, levelId), eq(gameLevels.gameId, gameId)))
    .returning();
  return result.length > 0;
}

export async function upsertGameLevels(gameId: number, levels: Omit<NewGameLevel, "gameId">[]): Promise<GameLevel[]> {
  const db = await getDb();
  await db.delete(gameLevels).where(eq(gameLevels.gameId, gameId));
  if (levels.length === 0) return [];
  const result = await db
    .insert(gameLevels)
    .values(levels.map((l) => ({ ...l, gameId })))
    .returning();
  return result;
}

// ─── Game Session Helpers ────────────────────────────────────────────────────

export async function getSessionsByGameId(
  gameId: number,
  limit = 100,
  offset = 0
): Promise<GameSession[]> {
  const db = await getDb();
  return db
    .select()
    .from(gameSessions)
    .where(eq(gameSessions.gameId, gameId))
    .orderBy(desc(gameSessions.sessionStartedAt))
    .limit(limit)
    .offset(offset);
}

export async function getSessionById(sessionId: number): Promise<GameSession | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(gameSessions)
    .where(eq(gameSessions.id, sessionId))
    .limit(1);
  return result[0] ?? null;
}

export async function getSessionsByPlayerIdentifier(
  gameId: number,
  playerIdentifier: string
): Promise<GameSession[]> {
  const db = await getDb();
  return db
    .select()
    .from(gameSessions)
    .where(
      and(
        eq(gameSessions.gameId, gameId),
        eq(gameSessions.playerIdentifier, playerIdentifier)
      )
    )
    .orderBy(desc(gameSessions.sessionStartedAt));
}

export async function createGameSession(data: NewGameSession): Promise<GameSession> {
  const db = await getDb();
  const result = await db.insert(gameSessions).values(data).returning();
  return result[0];
}

export async function updateGameSession(
  sessionId: number,
  data: Partial<Omit<GameSession, "id" | "createdAt">>
): Promise<GameSession | null> {
  const db = await getDb();
  const result = await db
    .update(gameSessions)
    .set(data)
    .where(eq(gameSessions.id, sessionId))
    .returning();
  return result[0] ?? null;
}

export async function endGameSession(
  sessionId: number,
  sessionEndedAt: Date,
  durationSeconds: number,
  status: "completed" | "quit" | "crashed" | "idle_timeout",
  quitReason?: "manual_quit" | "idle_timeout" | "crash" | "level_frustration" | "repeated_failure" | "unknown",
  quitLevelId?: number
): Promise<GameSession | null> {
  const db = await getDb();
  const result = await db
    .update(gameSessions)
    .set({
      sessionEndedAt,
      durationSeconds,
      status,
      quitReason: quitReason ?? null,
      quitLevelId: quitLevelId ?? null,
    })
    .where(eq(gameSessions.id, sessionId))
    .returning();
  return result[0] ?? null;
}

export async function updateSessionLlmSummary(
  sessionId: number,
  llmQuitSummary: string
): Promise<GameSession | null> {
  const db = await getDb();
  const result = await db
    .update(gameSessions)
    .set({ llmQuitSummary })
    .where(eq(gameSessions.id, sessionId))
    .returning();
  return result[0] ?? null;
}

export async function getActiveSessionsForGame(gameId: number): Promise<GameSession[]> {
  const db = await getDb();
  return db
    .select()
    .from(gameSessions)
    .where(and(eq(gameSessions.gameId, gameId), eq(gameSessions.status, "active")))
    .orderBy(desc(gameSessions.sessionStartedAt));
}

// ─── Session Event Helpers ───────────────────────────────────────────────────

export async function getEventsBySessionId(sessionId: number): Promise<SessionEvent[]> {
  const db = await getDb();
  return db
    .select()
    .from(sessionEvents)
    .where(eq(sessionEvents.sessionId, sessionId))
    .orderBy(asc(sessionEvents.sequenceIndex));
}

export async function getEventsByGameId(
  gameId: number,
  limit = 500,
  offset = 0
): Promise<SessionEvent[]> {
  const db = await getDb();
  return db
    .select()
    .from(sessionEvents)
    .where(eq(sessionEvents.gameId, gameId))
    .orderBy(desc(sessionEvents.occurredAt))
    .limit(limit)
    .offset(offset);
}

export async function getEventsByLevelId(
  levelId: number,
  gameId: number
): Promise<SessionEvent[]> {
  const db = await getDb();
  return db
    .select()
    .from(sessionEvents)
    .where(
      and(eq(sessionEvents.levelId, levelId), eq(sessionEvents.gameId, gameId))
    )
    .orderBy(asc(sessionEvents.sequenceIndex));
}

export async function createSessionEvent(data: NewSessionEvent): Promise<SessionEvent> {
  const db = await getDb();
  const result = await db.insert(sessionEvents).values(data).returning();
  return result[0];
}

export async function bulkCreateSessionEvents(data: NewSessionEvent[]): Promise<SessionEvent[]> {
  if (data.length === 0) return [];
  const db = await getDb();
  const result = await db.insert(sessionEvents).values(data).returning();
  return result;
}

export async function getEventsByTypeForSession(
  sessionId: number,
  eventType: string
): Promise<SessionEvent[]> {
  const db = await getDb();
  return db
    .select()
    .from(sessionEvents)
    .where(
      and(
        eq(sessionEvents.sessionId, sessionId),
        eq(sessionEvents.eventType, eventType)
      )
    )
    .orderBy(asc(sessionEvents.sequenceIndex));
}

// ─── Session Replay Helpers ──────────────────────────────────────────────────

export async function getReplayBySessionId(sessionId: number): Promise<SessionReplay | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(sessionReplays)
    .where(eq(sessionReplays.sessionId, sessionId))
    .limit(1);
  return result[0] ?? null;
}

export async function getReplaysByGameId(
  gameId: number,
  limit = 50,
  offset = 0
): Promise<SessionReplay[]> {
  const db = await getDb();
  return db
    .select()
    .from(sessionReplays)
    .where(eq(sessionReplays.gameId, gameId))
    .orderBy(desc(sessionReplays.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function createSessionReplay(data: NewSessionReplay): Promise<SessionReplay> {
  const db = await getDb();
  const result = await db.insert(sessionReplays).values(data).returning();
  return result[0];
}

export async function markReplayAsProcessed(replayId: number): Promise<SessionReplay | null> {
  const db = await getDb();
  const result = await db
    .update(sessionReplays)
    .set({ isProcessed: true })
    .where(eq(sessionReplays.id, replayId))
    .returning();
  return result[0] ?? null;
}

export async function updateSessionReplay(
  replayId: number,
  data: Partial<Omit<SessionReplay, "id" | "createdAt">>
): Promise<SessionReplay | null> {
  const db = await getDb();
  const result = await db
    .update(sessionReplays)
    .set(data)
    .where(eq(sessionReplays.id, replayId))
    .returning();
  return result[0] ?? null;
}

export async function getUnprocessedReplays(limit = 20): Promise<SessionReplay[]> {
  const db = await getDb();
  return db
    .select()
    .from(sessionReplays)
    .where(eq(sessionReplays.isProcessed, false))
    .orderBy(asc(sessionReplays.createdAt))
    .limit(limit);
}

// ─── Drop-Off Heatmap Entry Helpers ─────────────────────────────────────────

export async function getHeatmapEntriesByGameAndLevel(
  gameId: number,
  levelId: number
): Promise<DropOffHeatmapEntry[]> {
  const db = await getDb();
  return db
    .select()
    .from(dropOffHeatmapEntries)
    .where(
      and(
        eq(dropOffHeatmapEntries.gameId, gameId),
        eq(dropOffHeatmapEntries.levelId, levelId)
      )