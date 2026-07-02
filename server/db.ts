import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../drizzle/schema";
import { eq, and, desc, asc, gte, lte, inArray } from "drizzle-orm";
import {
  users,
  subscriptions,
  games,
  gameLevels,
  gameSessions,
  sessionEvents,
  dropOffEvents,
  heatmapSnapshots,
  insights,
  insightRecommendations,
  playerProfiles,
  dailyGameMetrics,
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
  type DropOffEvent,
  type NewDropOffEvent,
  type HeatmapSnapshot,
  type NewHeatmapSnapshot,
  type Insight,
  type NewInsight,
  type InsightRecommendation,
  type NewInsightRecommendation,
  type PlayerProfile,
  type NewPlayerProfile,
  type DailyGameMetric,
  type NewDailyGameMetric,
} from "../drizzle/schema";

let db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!db) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle(pool, { schema });
  }
  return db;
}

export async function upsertUser(openId: string, email: string, name: string, imageUrl?: string) {
  const db = await getDb();
  const existing = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  if (existing.length > 0) {
    const updated = await db
      .update(users)
      .set({ email, name, imageUrl, updatedAt: new Date() })
      .where(eq(users.openId, openId))
      .returning();
    return updated[0];
  }
  const created = await db
    .insert(users)
    .values({ openId, email, name, imageUrl })
    .returning();
  return created[0];
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0] ?? null;
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

export async function getSubscriptionByUserId(userId: number): Promise<Subscription | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.createdAt))
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
  data: Partial<NewSubscription>
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
  const created = await db
    .insert(subscriptions)
    .values({ userId, ...data } as NewSubscription)
    .returning();
  return created[0];
}

// ─── Games ────────────────────────────────────────────────────────────────────

export async function getGamesByUserId(userId: number): Promise<Game[]> {
  const db = await getDb();
  return db
    .select()
    .from(games)
    .where(and(eq(games.userId, userId), eq(games.isActive, true)))
    .orderBy(desc(games.createdAt));
}

export async function getGameById(id: number): Promise<Game | null> {
  const db = await getDb();
  const result = await db.select().from(games).where(eq(games.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getGameBySlug(slug: string): Promise<Game | null> {
  const db = await getDb();
  const result = await db.select().from(games).where(eq(games.slug, slug)).limit(1);
  return result[0] ?? null;
}

export async function getGameBySdkApiKey(sdkApiKey: string): Promise<Game | null> {
  const db = await getDb();
  const result = await db.select().from(games).where(eq(games.sdkApiKey, sdkApiKey)).limit(1);
  return result[0] ?? null;
}

export async function createGame(data: NewGame): Promise<Game> {
  const db = await getDb();
  const result = await db.insert(games).values(data).returning();
  return result[0];
}

export async function updateGame(
  id: number,
  data: Partial<Omit<Game, "id" | "createdAt">>
): Promise<Game | null> {
  const db = await getDb();
  const result = await db
    .update(games)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(games.id, id))
    .returning();
  return result[0] ?? null;
}

export async function softDeleteGame(id: number): Promise<Game | null> {
  const db = await getDb();
  const result = await db
    .update(games)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(games.id, id))
    .returning();
  return result[0] ?? null;
}

export async function getGameWithOwnerCheck(gameId: number, userId: number): Promise<Game | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(games)
    .where(and(eq(games.id, gameId), eq(games.userId, userId), eq(games.isActive, true)))
    .limit(1);
  return result[0] ?? null;
}

// ─── Game Levels ──────────────────────────────────────────────────────────────

export async function getLevelsByGameId(gameId: number): Promise<GameLevel[]> {
  const db = await getDb();
  return db
    .select()
    .from(gameLevels)
    .where(eq(gameLevels.gameId, gameId))
    .orderBy(asc(gameLevels.ordinalPosition));
}

export async function getLevelById(id: number): Promise<GameLevel | null> {
  const db = await getDb();
  const result = await db.select().from(gameLevels).where(eq(gameLevels.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getLevelByKey(gameId: number, levelKey: string): Promise<GameLevel | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(gameLevels)
    .where(and(eq(gameLevels.gameId, gameId), eq(gameLevels.levelKey, levelKey)))
    .limit(1);
  return result[0] ?? null;
}

export async function createGameLevel(data: NewGameLevel): Promise<GameLevel> {
  const db = await getDb();
  const result = await db.insert(gameLevels).values(data).returning();
  return result[0];
}

export async function updateGameLevel(
  id: number,
  data: Partial<Omit<GameLevel, "id" | "createdAt">>
): Promise<GameLevel | null> {
  const db = await getDb();
  const result = await db
    .update(gameLevels)
    .set(data)
    .where(eq(gameLevels.id, id))
    .returning();
  return result[0] ?? null;
}

export async function deleteGameLevel(id: number): Promise<void> {
  const db = await getDb();
  await db.delete(gameLevels).where(eq(gameLevels.id, id));
}

export async function upsertGameLevel(gameId: number, levelKey: string, data: Omit<NewGameLevel, "gameId" | "levelKey">): Promise<GameLevel> {
  const db = await getDb();
  const existing = await getLevelByKey(gameId, levelKey);
  if (existing) {
    const updated = await db
      .update(gameLevels)
      .set(data)
      .where(eq(gameLevels.id, existing.id))
      .returning();
    return updated[0];
  }
  const created = await db
    .insert(gameLevels)
    .values({ gameId, levelKey, ...data })
    .returning();
  return created[0];
}

// ─── Game Sessions ────────────────────────────────────────────────────────────

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
    .orderBy(desc(gameSessions.startedAt))
    .limit(limit)
    .offset(offset);
}

export async function getSessionById(id: number): Promise<GameSession | null> {
  const db = await getDb();
  const result = await db.select().from(gameSessions).where(eq(gameSessions.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getSessionByToken(sessionToken: string): Promise<GameSession | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(gameSessions)
    .where(eq(gameSessions.sessionToken, sessionToken))
    .limit(1);
  return result[0] ?? null;
}

export async function getSessionsByPlayerId(
  gameId: number,
  externalPlayerId: string
): Promise<GameSession[]> {
  const db = await getDb();
  return db
    .select()
    .from(gameSessions)
    .where(
      and(
        eq(gameSessions.gameId, gameId),
        eq(gameSessions.externalPlayerId, externalPlayerId)
      )
    )
    .orderBy(desc(gameSessions.startedAt));
}

export async function createGameSession(data: NewGameSession): Promise<GameSession> {
  const db = await getDb();
  const result = await db.insert(gameSessions).values(data).returning();
  return result[0];
}

export async function updateGameSession(
  id: number,
  data: Partial<Omit<GameSession, "id" | "createdAt">>
): Promise<GameSession | null> {
  const db = await getDb();
  const result = await db
    .update(gameSessions)
    .set(data)
    .where(eq(gameSessions.id, id))
    .returning();
  return result[0] ?? null;
}

export async function endGameSession(
  id: number,
  status: "completed" | "quit" | "crashed" | "timeout",
  endedAt: Date,
  durationSeconds: number,
  quitReason?: string
): Promise<GameSession | null> {
  const db = await getDb();
  const result = await db
    .update(gameSessions)
    .set({ status, endedAt, durationSeconds, quitReason })
    .where(eq(gameSessions.id, id))
    .returning();
  return result[0] ?? null;
}

export async function getActiveSessionsByGameId(gameId: number): Promise<GameSession[]> {
  const db = await getDb();
  return db
    .select()
    .from(gameSessions)
    .where(and(eq(gameSessions.gameId, gameId), eq(gameSessions.status, "active")))
    .orderBy(desc(gameSessions.startedAt));
}

export async function getSessionsByDateRange(
  gameId: number,
  from: Date,
  to: Date
): Promise<GameSession[]> {
  const db = await getDb();
  return db
    .select()
    .from(gameSessions)
    .where(
      and(
        eq(gameSessions.gameId, gameId),
        gte(gameSessions.startedAt, from),
        lte(gameSessions.startedAt, to)
      )
    )
    .orderBy(desc(gameSessions.startedAt));
}

// ─── Session Events ───────────────────────────────────────────────────────────

export async function getEventsBySessionId(sessionId: number): Promise<SessionEvent[]> {
  const db = await getDb();
  return db
    .select()
    .from(sessionEvents)
    .where(eq(sessionEvents.sessionId, sessionId))
    .orderBy(asc(sessionEvents.sessionOffsetMs));
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
  gameId: number,
  levelId: number
): Promise<SessionEvent[]> {
  const db = await getDb();
  return db
    .select()
    .from(sessionEvents)
    .where(
      and(eq(sessionEvents.gameId, gameId), eq(sessionEvents.levelId, levelId))
    )
    .orderBy(desc(sessionEvents.occurredAt));
}

export async function createSessionEvent(data: NewSessionEvent): Promise<SessionEvent> {
  const db = await getDb();
  const result = await db.insert(sessionEvents).values(data).returning();
  return result[0];
}

export async function bulkCreateSessionEvents(data: NewSessionEvent[]): Promise<SessionEvent[]> {
  if (data.length === 0) return [];
  const db = await getDb();
  return db.insert(sessionEvents).values(data).returning();
}

export async function getDeathEventsBySessionId(sessionId: number): Promise<SessionEvent[]> {
  const db = await getDb();
  return db
    .select()
    .from(sessionEvents)
    .where(
      and(eq(sessionEvents.sessionId, sessionId), eq(sessionEvents.eventType, "death"))
    )
    .orderBy(asc(sessionEvents.sessionOffsetMs));
}

// ─── Drop Off Events ──────────────────────────────────────────────────────────

export async function getDropOffEventsByGameId(
  gameId: number,
  limit = 100,
  offset = 0
): Promise<DropOffEvent[]> {
  const db = await getDb();
  return db
    .select()
    .from(dropOffEvents)
    .where(eq(dropOffEvents.gameId, gameId))
    .orderBy(desc(dropOffEvents.occurredAt))
    .limit(limit)
    .offset(offset);
}

export async function getDropOffEventsByLevelId(
  gameId: number,
  levelId: number
): Promise<DropOffEvent[]> {
  const db = await getDb();
  return db
    .select()
    .from(dropOffEvents)
    .where(
      and(eq(dropOffEvents.gameId, gameId), eq(dropOffEvents.levelId, levelId))
    )
    .orderBy(desc(dropOffEvents.occurredAt));
}

export async function getDropOffEventsBySessionId(sessionId: number): Promise<DropOffEvent[]> {
  const db = await getDb();
  return db
    .select()
    .from(dropOffEvents)
    .where(eq(dropOffEvents.sessionId, sessionId))
    .orderBy(desc(dropOffEvents.occurredAt));
}

export async function createDropOffEvent(data: NewDropOffEvent): Promise<DropOffEvent> {
  const db = await getDb();
  const result = await db.insert(dropOffEvents).values(data).returning();
  return result[0];
}

export async function updateDropOffEvent(
  id: number,
  data: Partial<Omit<DropOffEvent, "id" | "createdAt">>
): Promise<DropOffEvent | null> {
  const db = await getDb();
  const result = await db
    .update(dropOffEvents)
    .set(data)
    .where(eq(dropOffEvents.id, id))
    .returning();
  return result[0] ?? null;
}

export async function getUnanalyzedDropOffEvents(
  gameId: number,
  limit = 50
): Promise<DropOffEvent[]> {
  const db = await getDb();
  return db
    .select()
    .from(dropOffEvents)
    .where(
      and(eq(dropOffEvents.gameId, gameId), eq(dropOffEvents.llmAnalyzed, false))
    )
    .orderBy(asc(dropOffEvents.occurredAt))
    .limit(limit);
}

export async function getDropOffEventsByDateRange(
  gameId: number,
  from: Date,
  to: Date
): Promise<DropOffEvent[]> {
  const db = await getDb();
  return db
    .select()
    .from(dropOffEvents)
    .where(
      and(
        eq(dropOffEvents.gameId, gameId),
        gte(dropOff