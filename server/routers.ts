import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "./db";
import { eq, and, desc, asc, gte, lte, sql } from "drizzle-orm";
import Stripe from "stripe";
import {
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
} from "../drizzle/schema";

// ─── Stripe Payments Router ───────────────────────────────────────────────────
const paymentsRouter = router({
  createCheckout: protectedProcedure
    .input(z.object({ priceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      const appUrl = process.env.VITE_APP_URL || "https://example.aibce.io";
      const session = await stripe.checkout.sessions.create({
        customer_email: ctx.user.email ?? undefined,
        line_items: [{ price: input.priceId, quantity: 1 }],
        mode: "subscription",
        success_url: `${appUrl}/dashboard?checkout=success`,
        cancel_url: `${appUrl}/pricing?checkout=cancelled`,
        metadata: { userId: String(ctx.user.id) },
      });
      return { url: session.url };
    }),
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, ctx.user.id))
      .limit(1);
    return result[0] ?? null;
  }),
  createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const appUrl = process.env.VITE_APP_URL || "https://example.aibce.io";
    const sub = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, ctx.user.id))
      .limit(1);
    if (!sub[0]?.stripeCustomerId) {
      throw new TRPCError({ code: "NOT_FOUND", message: "No active subscription found" });
    }
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub[0].stripeCustomerId,
      return_url: `${appUrl}/dashboard`,
    });
    return { url: portalSession.url };
  }),
});

// ─── Feature Router (Games) ───────────────────────────────────────────────────
const featureRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const result = await db
      .select()
      .from(games)
      .where(eq(games.userId, ctx.user.id))
      .orderBy(desc(games.createdAt));
    return result;
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        platform: z.string().max(100).optional(),
        planTier: z.enum(["indie", "studio", "pro"]).default("indie"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const slug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 240);
      const sdkApiKey = `ll_${crypto.randomUUID().replace(/-/g, "")}`;
      const [created] = await db
        .insert(games)
        .values({
          userId: ctx.user.id,
          name: input.name,
          slug,
          description: input.description ?? null,
          platform: input.platform ?? null,
          sdkApiKey,
          planTier: input.planTier,
          isActive: true,
          sessionRetentionDays: 30,
        })
        .returning();
      return created;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [existing] = await db
        .select()
        .from(games)
        .where(and(eq(games.id, input.id), eq(games.userId, ctx.user.id)))
        .limit(1);
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Game not found" });
      }
      await db.delete(games).where(and(eq(games.id, input.id), eq(games.userId, ctx.user.id)));
      return { success: true };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [game] = await db
        .select()
        .from(games)
        .where(and(eq(games.id, input.id), eq(games.userId, ctx.user.id)))
        .limit(1);
      if (!game) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Game not found" });
      }
      return game;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        platform: z.string().max(100).optional(),
        planTier: z.enum(["indie", "studio", "pro"]).optional(),
        isActive: z.boolean().optional(),
        sessionRetentionDays: z.number().int().min(1).max(365).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [existing] = await db
        .select()
        .from(games)
        .where(and(eq(games.id, input.id), eq(games.userId, ctx.user.id)))
        .limit(1);
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Game not found" });
      }
      const { id, ...fields } = input;
      const updateData: Partial<typeof games.$inferInsert> = {};
      if (fields.name !== undefined) updateData.name = fields.name;
      if (fields.description !== undefined) updateData.description = fields.description;
      if (fields.platform !== undefined) updateData.platform = fields.platform;
      if (fields.planTier !== undefined) updateData.planTier = fields.planTier;
      if (fields.isActive !== undefined) updateData.isActive = fields.isActive;
      if (fields.sessionRetentionDays !== undefined) updateData.sessionRetentionDays = fields.sessionRetentionDays;
      updateData.updatedAt = new Date();
      const [updated] = await db
        .update(games)
        .set(updateData)
        .where(and(eq(games.id, input.id), eq(games.userId, ctx.user.id)))
        .returning();
      return updated;
    }),

  regenerateApiKey: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [existing] = await db
        .select()
        .from(games)
        .where(and(eq(games.id, input.id), eq(games.userId, ctx.user.id)))
        .limit(1);
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Game not found" });
      }
      const newApiKey = `ll_${crypto.randomUUID().replace(/-/g, "")}`;
      const [updated] = await db
        .update(games)
        .set({ sdkApiKey: newApiKey, updatedAt: new Date() })
        .where(and(eq(games.id, input.id), eq(games.userId, ctx.user.id)))
        .returning();
      return { sdkApiKey: updated.sdkApiKey };
    }),
});

// ─── Session Router ───────────────────────────────────────────────────────────
const sessionRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        gameId: z.number().int().positive(),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
        status: z.enum(["active", "completed", "quit", "crashed", "timeout"]).optional(),
        from: z.date().optional(),
        to: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [game] = await db
        .select()
        .from(games)
        .where(and(eq(games.id, input.gameId), eq(games.userId, ctx.user.id)))
        .limit(1);
      if (!game) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Game not found" });
      }
      const conditions = [eq(gameSessions.gameId, input.gameId)];
      if (input.status) conditions.push(eq(gameSessions.status, input.status));
      if (input.from) conditions.push(gte(gameSessions.startedAt, input.from));
      if (input.to) conditions.push(lte(gameSessions.startedAt, input.to));
      const sessions = await db
        .select()
        .from(gameSessions)
        .where(and(...conditions))
        .orderBy(desc(gameSessions.startedAt))
        .limit(input.limit)
        .offset(input.offset);
      return sessions;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number().int().positive(), gameId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [game] = await db
        .select()
        .from(games)
        .where(and(eq(games.id, input.gameId), eq(games.userId, ctx.user.id)))
        .limit(1);
      if (!game) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Game not found" });
      }
      const [session] = await db
        .select()
        .from(gameSessions)
        .where(and(eq(gameSessions.id, input.id), eq(gameSessions.gameId, input.gameId)))
        .limit(1);
      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session not found" });
      }
      return session;
    }),

  getEvents: protectedProcedure
    .input(
      z.object({
        sessionId: z.number().int().positive(),
        gameId: z.number().int().positive(),
        eventType: z
          .enum([
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
          ])
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [game] = await db
        .select()
        .from(games)
        .where(and(eq(games.id, input.gameId), eq(games.userId, ctx.user.id)))
        .limit(1);
      if (!game) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Game not found" });
      }
      const conditions = [
        eq(sessionEvents.sessionId, input.sessionId),
        eq(sessionEvents.gameId, input.gameId),
      ];
      if (input.eventType) conditions.push(eq(sessionEvents.eventType, input.eventType));
      const events = await db
        .select()
        .from(sessionEvents)
        .where(and(...conditions))
        .orderBy(asc(sessionEvents.sessionOffsetMs));
      return events;
    }),

  getDropOffs: protectedProcedure
    .input(
      z.object({
        gameId: z.number().int().positive(),
        levelId: z.number().int().positive().optional(),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
        from: z.date().optional(),
        to: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [game] = await db
        .select()
        .from(games)
        .where(and(eq(games.id, input.gameId), eq(games.userId, ctx.user.id)))
        .limit(1);
      if (!game) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Game not found" });
      }
      const conditions = [eq(dropOffEvents.gameId, input.gameId)];
      if (input.levelId) conditions.push(eq(dropOffEvents.levelId, input.levelId));
      if (input.from) conditions.push(gte(dropOffEvents.occurredAt, input.from));
      if (input.to) conditions.push(lte(dropOffEvents.occurredAt, input.to));
      const dropOffs = await db
        .select()
        .from(dropOffEvents)
        .where(and(...conditions))
        .orderBy(desc(dropOffEvents.occurredAt))
        .limit(input.limit)
        .offset(input.offset);
      return dropOffs;
    }),
});

// ─── Analytics Router ─────────────────────────────────────────────────────────
const analyticsRouter = router({
  getDailyMetrics: protectedProcedure
    .input(
      z.object({
        gameId: z.number().int().positive(),
        from: z.date(),
        to: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [game] = await db
        .select()
        .from(games)
        .where(and(eq(games.id, input.gameId), eq(games.userId, ctx.user.id)))
        .limit(1);
      if (!game) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Game not found" });
      }
      const metrics = await db
        .select()
        .from(dailyGameMetrics)
        .where(
          and(
            eq(dailyGameMetrics.gameId, input.gameId),
            gte(dailyGameMetrics.metricDate, input.from),
            lte(dailyGameMetrics.metricDate, input.to)
          )
        )
        .orderBy(asc(dailyGameMetrics.metricDate));
      return metrics;
    }),

  getSummary: protectedProcedure
    .input(
      z.object({
        gameId: z.number().int().positive(),
        from: z.date().optional(),
        to: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [game] = await db
        .select()
        .from(games)
        .where(and(eq(games.id, input.gameId), eq(games.userId, ctx.user.id)))
        .limit(1);
      if (!game) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Game not found" });
      }
      const sessionConditions = [eq(gameSessions.gameId, input.gameId)];
      if (input.from) sessionConditions.push(gte(gameSessions.startedAt, input.from));
      if (input.to) sessionConditions.push(lte(gameSessions.startedAt, input.to));
      const allSessions = await db
        .select()
        .from(gameSessions)
        .where(and(...sessionConditions));
      const totalSessions = allSessions.length;
      const uniquePlayers = new Set(allSessions.map((s) => s.externalPlayerId)).size;
      const completedSessions = allSessions.filter((s) => s.status === "completed").length;
      const quitSessions = allSessions.filter((s) => s.status === "quit").length;
      const crashedSessions = allSessions.filter((s) => s.status === "crashed").length;
      const durationsWithValues = allSessions
        .filter((s) => s.durationSeconds !== null)
        .map((s) => s.durationSeconds as number);
      const avgSessionDuration =
        durationsWithValues.length > 0
          ? Math.round(
              durationsWithValues.reduce((a, b) => a + b, 0) / durationsWithValues.length
            )
          : 0;
      const completionRate = totalSessions > 0 ? completedSessions / totalSessions : 0;
      const quitRate = totalSessions > 0 ? quitSessions / totalSessions : 0;
      const dropOffConditions = [eq(dropOffEvents.gameId, input.gameId)];
      if (input.from) dropOffConditions.push(gte(dropOffEvents.occurredAt, input.from));
      if (input.to) dropOffConditions.push(lte(dropOffEvents.occurredAt, input.to));
      const dropOffs = await db
        .select()
        .from(dropOffEvents)
        .where(and(...dropOffConditions));
      return {
        totalSessions,
        uniquePlayers,
        completedSessions,
        quitSessions,
        crashedSessions,
        avgSessionDuration,
        completionRate,
        quitRate,
        totalDropOffs: dropOffs.length,
      };
    }),

  getHeatmap: protectedProcedure
    .input(
      z.object({
        gameId: z.number().int().positive(),
        levelId: z.number().int().positive(),
        from: z.date().optional(),
        to: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [game] = await db
        .select()
        .from(games)
        .where(and(eq(games.id, input.gameId), eq(games.userId, ctx.user.id)))
        .limit(1);
      if (!game) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Game not found" });
      }
      const conditions = [
        eq(heatmapSnapshots.gameId, input.gameId),
        eq(heatmapSnapshots.levelId, input.levelId),
      ];
      if (input.from) conditions.push(gte(heatmapSnapshots.snapshotDate, input.from));
      if (input.to) conditions.push(lte(heatmapSnapshots.snapshotDate, input.to));
      const snapshots = await db
        .select()
        .from(heatmapSnapshots)
        .where(and(...conditions))
        .orderBy(desc(heatmapSnapshots.snapshotDate))
        .limit(1);
      return snapshots[0] ?? null;
    }),

  getLevelFunnel: protectedProcedure
    .input(
      z.object({
        gameId: z.number().int().positive(),
        from: z.date().optional(),
        to: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [game] = await db
        .select()
        .from(games)
        .where(and(eq(games.id, input.gameId), eq(games.userId, ctx.user.id)))
        .limit(1);
      if (!game) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Game not found" });
      }
      const levels = await db
        .select()
        .from(gameLevels)
        .where(eq(gameLevels.gameId, input.gameId))
        .orderBy(asc(gameLevels.ordinalPosition));
      const funnelData = await Promise.all(
        levels.map(async (level) => {
          const eventConditions = [
            eq(sessionEvents.gameId, input.gameId),
            eq(sessionEvents.levelId, level.id),
            eq(sessionEvents.eventType, "level_start"),
          ];
          if (input.from) eventConditions.push(gte(sessionEvents.occurredAt, input.from));
          if (input.to) eventConditions.push(lte(sessionEvents.occurredAt, input.to));
          const startEvents = await db
            .select()
            .from(sessionEvents)
            .where(and(...eventConditions));
          const completeConditions = [
            eq(sessionEvents.gameId, input.gameId),
            eq(sessionEvents.levelId, level.id),
            eq(sessionEvents.eventType, "level_complete"),
          ];
          if (input.from) completeConditions.push(gte(sessionEvents.occurredAt, input.from));
          if (input.to) completeConditions.push(lte(sessionEvents.occurredAt, input.to));
          const completeEvents = await db
            .select()
            .from(sessionEvents)
            .where(and(...completeConditions));
          const dropOffConditions = [
            eq(dropOffEvents.gameId, input.gameId),
            eq(dropOffEvents.levelId, level.id),
          ];
          if (input.from) dropOffConditions.push(gte(dropOffEvents.occurredAt, input.from));
          if (input.to) dropOffConditions.push(lte(dropOffEvents.occurredAt, input.to));
          const levelDropOffs = await db
            .select()
            .from(dropOffEvents)
            .where(and(...dropOffConditions));
          return {
            levelId: level.id,
            levelName: level.name,
            levelKey: level.levelKey,
            ordinalPosition: level.ordinalPosition,
            starts: startEvents.length,
            completions: completeEvents.length,
            dropOffs: levelDropOffs.length,
            completionRate:
              startEvents.length > 0 ? completeEvents.length / startEvents.length : 0,
            dropOffRate:
              startEvents.length > 0 ? levelDropOffs.length / startEvents.length : 0,
          };
        })
      );
      return funnelData;
    }),

  getPlayerProfiles: protectedProcedure
    .input(
      z.object({
        gameId: z.number().int().positive(),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [game] = await db
        .select()
        .from(games)
        .where(and(eq(games.id, input.gameId), eq(games.userId, ctx.user.id)))
        .limit(1);
      if (!game) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Game not found" });
      }
      const profiles = await db
        .select()
        .from(playerProfiles)
        .where(eq(playerProfiles.gameId, input.gameId))
        .orderBy(desc(playerProfiles.lastSeenAt))
        .limit(input.limit)
        .offset(input.offset);
      return profiles;
    }),

  getPlayerProfile: protectedProcedure
    .input(
      z.object({
        gameId: z.number().int().positive(),
        externalPlayerId: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [game] = await db
        .select()
        .from(games)
        .where(and(eq(games.id, input.gameId), eq(games.userId, ctx.user.id)))
        .limit(1);
      if (!game) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Game not found" });
      }
      const [profile] = await db
        .select()
        .from(playerProfiles)
        .where(
          and(
            eq(playerProfiles.gameId, input.gameId),
            eq(playerProfiles.externalPlayerId, input.externalPlayerId)
          )
        )
        .limit(1);
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Player profile not found" });
      }
      return profile;
    }),
});

// ─── Studio Router (Game Levels) ──────────────────────────────────────────────
const studioRouter = router({
  getLevels: protectedProcedure
    .input(z.object({ gameId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [game] = await db
        .select()
        .from(games)
        .where(and(eq(games.id, input.gameId), eq(games.userId, ctx.user.id)))
        .limit(1);
      if (!game) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Game not found" });
      }
      const levels = await db
        .select()
        .from(gameLevels)
        .where(eq(gameLevels.gameId, input.gameId))
        .orderBy(asc(gameLevels.ordinalPosition));
      return levels;
    }),

  createLevel: protectedProcedure
    .input(
      z.object({
        gameId: z.number().int().positive(),
        name: z.string().min(1).max(255),
        levelKey: z.string().min(1).max(255),
        description: z.string().optional(),
        ordinalPosition: z.number().int().min(0).default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [game] = await db
        .select()
        .from(games)
        .where(and(eq(games.id, input.gameId), eq(games.userId, ctx.user.id)))
        .limit(1);
      if (!game) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Game not found" });
      }
      const [created] = await db
        .insert(gameLevels)
        .values({
          gameId: input.gameId,
          name: input.name,
          levelKey: input.levelKey,
          description: input.description ?? null,
          ordinalPosition: input.ordinalPosition,
        })
        .returning();
      return created;
    }),

  updateLevel: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        gameId: z.number().int().positive(),
        name: z.string().min(1).max(255).optional(),
        levelKey: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        ordinalPosition: z.number().int().min(0).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [game] = await db
        .select()
        .from(games)
        .where(and(eq(games.id, input.gameId), eq(games.userId, ctx.user.id)))
        .limit(1);
      if (!game) {
        throw new TRPCError({ code