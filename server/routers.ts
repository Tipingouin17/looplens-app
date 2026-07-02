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
  sessionReplays,
  dropOffHeatmapEntries,
  quitInsightReports,
  playerProfiles,
  sdkWebhookLogs,
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

// ─── Feature Router (Games — main business entity) ────────────────────────────
const featureRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    return db
      .select()
      .from(games)
      .where(eq(games.userId, ctx.user.id))
      .orderBy(desc(games.createdAt));
  }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        slug: z.string().min(1).max(255),
        description: z.string().optional(),
        platform: z.string().max(100).optional(),
        thumbnailUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const existingSlug = await db
        .select()
        .from(games)
        .where(and(eq(games.slug, input.slug), eq(games.userId, ctx.user.id)))
        .limit(1);

      if (existingSlug[0]) {
        throw new TRPCError({ code: "CONFLICT", message: "A game with this slug already exists." });
      }

      const sdkApiKey = `ll_${crypto.randomUUID().replace(/-/g, "")}`;

      const [game] = await db
        .insert(games)
        .values({
          userId: ctx.user.id,
          name: input.name,
          slug: input.slug,
          description: input.description ?? null,
          platform: input.platform ?? null,
          sdkApiKey,
          isActive: true,
          thumbnailUrl: input.thumbnailUrl ?? null,
        })
        .returning();

      return game;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [game] = await db
        .select()
        .from(games)
        .where(and(eq(games.id, input.id), eq(games.userId, ctx.user.id)))
        .limit(1);

      if (!game) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Game not found." });
      }

      await db.delete(games).where(eq(games.id, input.id));
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
        throw new TRPCError({ code: "NOT_FOUND", message: "Game not found." });
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
        thumbnailUrl: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [game] = await db
        .select()
        .from(games)
        .where(and(eq(games.id, input.id), eq(games.userId, ctx.user.id)))
        .limit(1);

      if (!game) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Game not found." });
      }

      const { id, ...updateFields } = input;

      const [updated] = await db
        .update(games)
        .set({ ...updateFields, updatedAt: new Date() })
        .where(eq(games.id, id))
        .returning();

      return updated;
    }),
  regenerateApiKey: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [game] = await db
        .select()
        .from(games)
        .where(and(eq(games.id, input.id), eq(games.userId, ctx.user.id)))
        .limit(1);

      if (!game) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Game not found." });
      }

      const newApiKey = `ll_${crypto.randomUUID().replace(/-/g, "")}`;

      const [updated] = await db
        .update(games)
        .set({ sdkApiKey: newApiKey, updatedAt: new Date() })
        .where(eq(games.id, input.id))
        .returning();

      return updated;
    }),
});

// ─── Studio Router (Game Levels management) ────────────────────────────────────
const studioRouter = router({
  listLevels: protectedProcedure
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
        throw new TRPCError({ code: "NOT_FOUND", message: "Game not found." });
      }

      return db
        .select()
        .from(gameLevels)
        .where(eq(gameLevels.gameId, input.gameId))
        .orderBy(asc(gameLevels.levelIndex));
    }),
  createLevel: protectedProcedure
    .input(
      z.object({
        gameId: z.number().int().positive(),
        name: z.string().min(1).max(255),
        levelIndex: z.number().int().min(0),
        description: z.string().optional(),
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
        throw new TRPCError({ code: "NOT_FOUND", message: "Game not found." });
      }

      const [level] = await db
        .insert(gameLevels)
        .values({
          gameId: input.gameId,
          name: input.name,
          levelIndex: input.levelIndex,
          description: input.description ?? null,
        })
        .returning();

      return level;
    }),
  deleteLevel: protectedProcedure
    .input(z.object({ levelId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [level] = await db
        .select()
        .from(gameLevels)
        .where(eq(gameLevels.id, input.levelId))
        .limit(1);

      if (!level) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Level not found." });
      }

      const [game] = await db
        .select()
        .from(games)
        .where(and(eq(games.id, level.gameId), eq(games.userId, ctx.user.id)))
        .limit(1);

      if (!game) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied." });
      }

      await db.delete(gameLevels).where(eq(gameLevels.id, input.levelId));
      return { success: true };
    }),
  updateLevel: protectedProcedure
    .input(
      z.object({
        levelId: z.number().int().positive(),
        name: z.string().min(1).max(255).optional(),
        levelIndex: z.number().int().min(0).optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [level] = await db
        .select()
        .from(gameLevels)
        .where(eq(gameLevels.id, input.levelId))
        .limit(1);

      if (!level) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Level not found." });
      }

      const [game] = await db
        .select()
        .from(games)
        .where(and(eq(games.id, level.gameId), eq(games.userId, ctx.user.id)))
        .limit(1);

      if (!game) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied." });
      }

      const { levelId, ...updateFields } = input;

      const [updated] = await db
        .update(gameLevels)
        .set(updateFields)
        .where(eq(gameLevels.id, levelId))
        .returning();

      return updated;
    }),
});

// ─── Session Router ────────────────────────────────────────────────────────────
const sessionRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        gameId: z.number().int().positive(),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
        status: z.enum(["active", "completed", "quit", "crashed", "idle_timeout"]).optional(),
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
        throw new TRPCError({ code: "NOT_FOUND", message: "Game not found." });
      }

      const conditions = [eq(gameSessions.gameId, input.gameId)];
      if (input.status) {
        conditions.push(eq(gameSessions.status, input.status));
      }

      const rows = await db
        .select()
        .from(gameSessions)
        .where(and(...conditions))
        .orderBy(desc(gameSessions.sessionStartedAt))
        .limit(input.limit)
        .offset(input.offset);

      return rows;
    }),
  getById: protectedProcedure
    .input(z.object({ sessionId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [session] = await db
        .select()
        .from(gameSessions)
        .where(eq(gameSessions.id, input.sessionId))
        .limit(1);

      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session not found." });
      }

      const [game] = await db
        .select()
        .from(games)
        .where(and(eq(games.id, session.gameId), eq(games.userId, ctx.user.id)))
        .limit(1);

      if (!game) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied." });
      }

      return session;
    }),
  getEvents: protectedProcedure
    .input(
      z.object({
        sessionId: z.number().int().positive(),
        limit: z.number().int().min(1).max(500).default(200),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [session] = await db
        .select()
        .from(gameSessions)
        .where(eq(gameSessions.id, input.sessionId))
        .limit(1);

      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session not found." });
      }

      const [game] = await db
        .select()
        .from(games)
        .where(and(eq(games.id, session.gameId), eq(games.userId, ctx.user.id)))
        .limit(1);

      if (!game) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied." });
      }

      return db
        .select()
        .from(sessionEvents)
        .where(eq(sessionEvents.sessionId, input.sessionId))
        .orderBy(asc(sessionEvents.sequenceIndex))
        .limit(input.limit)
        .offset(input.offset);
    }),
  ingest: publicProcedure
    .input(
      z.object({
        sdkApiKey: z.string().min(1),
        playerIdentifier: z.string().min(1).max(255),
        sessionStartedAt: z.string().datetime(),
        sessionEndedAt: z.string().datetime().optional(),
        status: z.enum(["active", "completed", "quit", "crashed", "idle_timeout"]).default("active"),
        quitReason: z
          .enum(["manual_quit", "idle_timeout", "crash", "level_frustration", "repeated_failure", "unknown"])
          .optional(),
        durationSeconds: z.number().int().min(0).optional(),
        deviceInfo: z.string().optional(),
        platformVersion: z.string().max(100).optional(),
        gameVersion: z.string().max(100).optional(),
        rawMetadata: z.string().optional(),
        events: z
          .array(
            z.object({
              eventType: z.string().max(100),
              eventName: z.string().max(255),
              payload: z.string().optional(),
              positionX: z.number().optional(),
              positionY: z.number().optional(),
              positionZ: z.number().optional(),
              occurredAt: z.string().datetime(),
              sequenceIndex: z.number().int().min(0),
              levelId: z.number().int().positive().optional(),
            })
          )
          .default([]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [game] = await db
        .select()
        .from(games)
        .where(and(eq(games.sdkApiKey, input.sdkApiKey), eq(games.isActive, true)))
        .limit(1);

      if (!game) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid SDK API key." });
      }

      await db.insert(sdkWebhookLogs).values({
        gameId: game.id,
        sdkApiKey: input.sdkApiKey,
        eventType: "session_ingest",
        rawBody: JSON.stringify(input),
        processingStatus: "processing",
      });

      const [session] = await db
        .insert(gameSessions)
        .values({
          gameId: game.id,
          playerIdentifier: input.playerIdentifier,
          status: input.status,
          quitReason: input.quitReason ?? null,
          sessionStartedAt: new Date(input.sessionStartedAt),
          sessionEndedAt: input.sessionEndedAt ? new Date(input.sessionEndedAt) : null,
          durationSeconds: input.durationSeconds ?? null,
          deviceInfo: input.deviceInfo ?? null,
          platformVersion: input.platformVersion ?? null,
          gameVersion: input.gameVersion ?? null,
          rawMetadata: input.rawMetadata ?? null,
        })
        .returning();

      if (input.events.length > 0) {
        await db.insert(sessionEvents).values(
          input.events.map((e) => ({
            sessionId: session.id,
            gameId: game.id,
            levelId: e.levelId ?? null,
            eventType: e.eventType,
            eventName: e.eventName,
            payload: e.payload ?? null,
            positionX: e.positionX != null ? String(e.positionX) : null,
            positionY: e.positionY != null ? String(e.positionY) : null,
            positionZ: e.positionZ != null ? String(e.positionZ) : null,
            occurredAt: new Date(e.occurredAt),
            sequenceIndex: e.sequenceIndex,
          }))
        );
      }

      const existingProfile = await db
        .select()
        .from(playerProfiles)
        .where(
          and(
            eq(playerProfiles.gameId, game.id),
            eq(playerProfiles.playerIdentifier, input.playerIdentifier)
          )
        )
        .limit(1);

      if (existingProfile[0]) {
        await db
          .update(playerProfiles)
          .set({
            lastSeenAt: new Date(),
            totalSessions: existingProfile[0].totalSessions + 1,
            totalPlaytimeSeconds:
              existingProfile[0].totalPlaytimeSeconds + (input.durationSeconds ?? 0),
            totalQuits:
              existingProfile[0].totalQuits +
              (input.status === "quit" || input.quitReason ? 1 : 0),
            updatedAt: new Date(),
          })
          .where(eq(playerProfiles.id, existingProfile[0].id));
      } else {
        await db.insert(playerProfiles).values({
          gameId: game.id,
          playerIdentifier: input.playerIdentifier,
          firstSeenAt: new Date(input.sessionStartedAt),
          lastSeenAt: new Date(),
          totalSessions: 1,
          totalPlaytimeSeconds: input.durationSeconds ?? 0,
          totalQuits: input.status === "quit" || input.quitReason ? 1 : 0,
          furthestLevelReached: 0,
        });
      }

      return { sessionId: session.id, success: true };
    }),
  getReplay: protectedProcedure
    .input(z.object({ sessionId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [session] = await db
        .select()
        .from(gameSessions)
        .where(eq(gameSessions.id, input.sessionId))
        .limit(1);

      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session not found." });
      }

      const [game] = await db
        .select()
        .from(games)
        .where(and(eq(games.id, session.gameId), eq(games.userId, ctx.user.id)))
        .limit(1);

      if (!game) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied." });
      }

      const [replay] = await db
        .select()
        .from(sessionReplays)
        .where(eq(sessionReplays.sessionId, input.sessionId))
        .limit(1);

      return replay ?? null;
    }),
});

// ─── Analytics Router ──────────────────────────────────────────────────────────
const analyticsRouter = router({
  overview: protectedProcedure
    .input(
      z.object({
        gameId: z.number().int().positive(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
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
        throw new TRPCError({ code: "NOT_FOUND", message: "Game not found." });
      }

      const conditions = [eq(gameSessions.gameId, input.gameId)];
      if (input.startDate) {
        conditions.push(gte(gameSessions.sessionStartedAt, new Date(input.startDate)));
      }
      if (input.endDate) {
        conditions.push(lte(gameSessions.sessionStartedAt, new Date(input.endDate)));
      }

      const allSessions = await db
        .select()
        .from(gameSessions)
        .where(and(...conditions));

      const totalSessions = allSessions.length;
      const quitSessions = allSessions.filter(
        (s) => s.status === "quit" || s.status === "idle_timeout" || s.status === "crashed"
      );
      const completedSessions = allSessions.filter((s) => s.status === "completed");
      const totalQuits = quitSessions.length;
      const completionRate = totalSessions > 0 ? completedSessions.length / totalSessions : 0;
      const quitRate = totalSessions > 0 ? totalQuits / totalSessions : 0;

      const sessionsWithDuration = allSessions.filter((s) => s.durationSeconds != null);
      const avgDurationSeconds =
        sessionsWithDuration.length > 0
          ? Math.round(
              sessionsWithDuration.reduce((acc, s) => acc + (s.durationSeconds ?? 0), 0) /
                sessionsWithDuration.length
            )
          : 0;

      const quitReasonCounts: Record<string, number> = {};
      for (const s of quitSessions) {
        const reason = s.quitReason ?? "unknown";
        quitReasonCounts[reason] = (quitReasonCounts[reason] ?? 0) + 1;
      }

      const topQuitReason =
        Object.entries(quitReasonCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;

      const uniquePlayers = new Set(allSessions.map((s) => s.playerIdentifier)).size;

      return {
        totalSessions,
        totalQuits,
        completionRate,
        quitRate,
        avgDurationSeconds,
        uniquePlayers,
        topQuitReason,
        quitReasonBreakdown: quitReasonCounts,
      };
    }),
  heatmap: protectedProcedure
    .input(
      z.object({
        gameId: z.number().int().positive(),
        levelId: z.number().int().positive().optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
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
        throw new TRPCError({ code: "NOT_FOUND", message: "Game not found." });
      }

      const conditions = [eq(dropOffHeatmapEntries.gameId, input.gameId)];
      if (input.levelId) {
        conditions.push(eq(dropOffHeatmapEntries.levelId, input.levelId));
      }
      if (input.startDate) {
        conditions.push(gte(dropOffHeatmapEntries.periodStart, new Date(input.startDate)));
      }
      if (input.endDate) {
        conditions.push(lte(dropOffHeatmapEntries.periodEnd, new Date(input.endDate)));
      }

      return db
        .select()
        .from(dropOffHeatmapEntries)
        .where(and(...conditions))
        .orderBy(desc(dropOffHeatmapEntries.quitCount));
    }),
  quitInsights: protectedProcedure
    .input(
      z.object({
        gameId: z.number().int().positive(),
        levelId: z.number().int().positive().optional(),
        publishedOnly: z.boolean().default(true),
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
        throw new TRPCError({ code: "NOT_FOUND", message: "Game not found." });
      }

      const conditions = [eq(quitInsightReports.gameId, input.gameId)];
      if (input.levelId) {
        conditions.push(eq(quitInsightReports.levelId, input.levelId));
      }
      if (input.publishedOnly) {
        conditions.push(eq(quitInsightReports.isPublished, true));
      }

      return db
        .select()
        .from(quitInsightReports)
        .where(and(...conditions))
        .orderBy(desc(quitInsightReports.reportPeriodEnd));
    }),
  playerProfiles: protectedProcedure
    .input(
      z.object({
        gameId: z.number().int().positive(),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query