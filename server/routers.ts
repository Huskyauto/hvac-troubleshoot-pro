import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { runDiagnostics, generateRepairReport } from "./services/diagnosticEngine";
import { saveManual, trackManualAccess, getManualsForModel, searchManuals, getPopularManuals } from "./services/manualService";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Equipment & Models
  equipment: router({
    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        const models = await db.searchDeviceModels(input.query);
        return { models };
      }),

    getModel: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const model = await db.getDeviceModel(input.id);
        return { model };
      }),

    createModel: protectedProcedure
      .input(z.object({
        brand: z.string(),
        modelNumber: z.string(),
        equipmentType: z.string(),
        specs: z.record(z.string(), z.any()).optional(),
        oemManualUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createDeviceModel({
          brand: input.brand,
          modelNumber: input.modelNumber,
          equipmentType: input.equipmentType,
          specs: input.specs,
          oemManualUrl: input.oemManualUrl,
        });
        return { success: true };
      }),

    myDevices: protectedProcedure
      .query(async ({ ctx }) => {
        const devices = await db.getUserDevices(ctx.user.id);
        return { devices };
      }),

    addDevice: protectedProcedure
      .input(z.object({
        nickname: z.string().optional(),
        type: z.string(),
        modelId: z.number().optional(),
        serial: z.string().optional(),
        locationAddress: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createDevice({
          userId: ctx.user.id,
          type: input.type,
          nickname: input.nickname,
          modelId: input.modelId,
          serial: input.serial,
          locationAddress: input.locationAddress,
        });
        return { success: true };
      }),
  }),

  // Error Codes
  errorCodes: router({
    search: publicProcedure
      .input(z.object({ 
        code: z.string(),
        modelId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        const codes = await db.searchErrorCodes(input.code, input.modelId);
        return { codes };
      }),

    byModel: publicProcedure
      .input(z.object({ modelId: z.number() }))
      .query(async ({ input }) => {
        const codes = await db.getErrorCodesByModel(input.modelId);
        return { codes };
      }),
  }),

  // Diagnostics
  diagnostics: router({
    start: protectedProcedure
      .input(z.object({
        deviceId: z.number().optional(),
        symptom: z.string(),
        errorCodes: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Create diagnostic session
        const result = await db.createDiagnosticSession({
          userId: ctx.user.id,
          deviceId: input.deviceId,
          symptom: input.symptom,
          errorCodesInput: input.errorCodes || [],
        });
        
        const sessionId = Number(result[0].insertId);
        
        // Get device model if deviceId provided
        let modelId: number | undefined;
        if (input.deviceId) {
          const device = await db.getDevice(input.deviceId);
          modelId = device?.modelId || undefined;
        }
        
        // Run AI diagnostics
        const diagnostic = await runDiagnostics(
          input.symptom,
          modelId,
          input.errorCodes
        );
        
        // Update session with results
        await db.updateDiagnosticSession(sessionId, {
          resultRankedCauses: diagnostic.rankedCauses,
        });
        
        // Create diagnostic steps
        for (let i = 0; i < diagnostic.steps.length; i++) {
          const step = diagnostic.steps[i];
          await db.createDiagnosticStep({
            sessionId,
            stepIndex: i,
            instructionMd: step.instructionMd,
            requiredTools: step.meterMode ? [step.meterMode] : [],
            expectedReadings: step.expectedRange ? { range: step.expectedRange } : undefined,
          });
        }
        
        return { 
          sessionId,
          rankedCauses: diagnostic.rankedCauses,
          steps: diagnostic.steps,
        };
      }),

    getSession: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        const session = await db.getDiagnosticSession(input.sessionId);
        const steps = await db.getSessionSteps(input.sessionId);
        return { session, steps };
      }),

    mySessions: protectedProcedure
      .query(async ({ ctx }) => {
        const sessions = await db.getUserDiagnosticSessions(ctx.user.id);
        return { sessions };
      }),

    completeStep: protectedProcedure
      .input(z.object({
        stepId: z.number(),
        outcome: z.enum(["pass", "fail", "skip"]),
        measurement: z.record(z.string(), z.any()).optional(),
        evidenceUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.updateDiagnosticStep(input.stepId, {
          outcome: input.outcome,
          measurement: input.measurement,
          evidenceUrl: input.evidenceUrl,
          completedAt: new Date(),
        });
        return { success: true };
      }),

    generateReport: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .mutation(async ({ input }) => {
        const report = await generateRepairReport(input.sessionId);
        return { report };
      }),
  }),

  // Manuals
  manuals: router({
    save: protectedProcedure
      .input(z.object({
        url: z.string(),
        title: z.string(),
        source: z.enum(["user_manual", "service_manual", "installation_manual", "parts_list"]),
        modelId: z.number().optional(),
        brand: z.string().optional(),
        equipmentTypes: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await saveManual({
          ...input,
          userId: ctx.user.id,
        });
        return result;
      }),

    byModel: publicProcedure
      .input(z.object({ modelId: z.number() }))
      .query(async ({ input }) => {
        const manuals = await getManualsForModel(input.modelId);
        return { manuals };
      }),

    search: publicProcedure
      .input(z.object({
        brand: z.string().optional(),
        equipmentType: z.string().optional(),
        query: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const manuals = await searchManuals(input);
        return { manuals };
      }),

    popular: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        const manuals = await getPopularManuals(input.limit);
        return { manuals };
      }),

    trackAccess: protectedProcedure
      .input(z.object({ docId: z.number() }))
      .mutation(async ({ input }) => {
        await trackManualAccess(input.docId);
        return { success: true };
      }),
  }),

  // Parts
  parts: router({
    search: publicProcedure
      .input(z.object({
        query: z.string(),
        equipmentType: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const parts = await db.searchParts(input.query, input.equipmentType);
        return { parts };
      }),

    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const part = await db.getPart(input.id);
        return { part };
      }),

    byModel: publicProcedure
      .input(z.object({ modelId: z.number() }))
      .query(async ({ input }) => {
        const parts = await db.getPartsByModel(input.modelId);
        return { parts };
      }),

    inventory: publicProcedure
      .input(z.object({
        partId: z.number(),
        userLat: z.string().optional(),
        userLng: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const inventory = await db.searchInventory(input.partId, input.userLat, input.userLng);
        return { inventory };
      }),
  }),

  // Suppliers
  suppliers: router({
    list: publicProcedure
      .query(async () => {
        const suppliers = await db.getSuppliers();
        return { suppliers };
      }),

    locations: publicProcedure
      .input(z.object({ supplierId: z.number().optional() }))
      .query(async ({ input }) => {
        const locations = await db.getSupplierLocations(input.supplierId);
        return { locations };
      }),
  }),

  // Shopping Cart
  cart: router({
    get: protectedProcedure
      .query(async ({ ctx }) => {
        let cart = await db.getUserCart(ctx.user.id);
        if (!cart) {
          await db.createCart(ctx.user.id);
          cart = await db.getUserCart(ctx.user.id);
        }
        const items = cart ? await db.getCartItems(cart.id) : [];
        return { cart, items };
      }),

    add: protectedProcedure
      .input(z.object({
        partId: z.number(),
        qty: z.number().default(1),
        priceCents: z.number().optional(),
        supplierLocationId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        let cart = await db.getUserCart(ctx.user.id);
        if (!cart) {
          await db.createCart(ctx.user.id);
          cart = await db.getUserCart(ctx.user.id);
        }
        
        if (cart) {
          await db.addToCart({
            cartId: cart.id,
            ...input,
          });
        }
        
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

