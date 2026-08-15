import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { createBookingInquiry, listBookingInquiries, updateBookingInquiryStatus } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";

const eventTypes = ["Wedding", "Mehndi", "Walima", "Birthday", "Corporate", "Social Celebration", "Other"] as const;
const bookingStatuses = ["new", "contacted", "confirmed", "declined", "closed"] as const;

const bookingInput = z.object({
  fullName: z.string().trim().min(2, "Please enter your name.").max(120),
  phone: z.string().trim().min(7, "Please enter a valid phone number.").max(32),
  email: z.string().trim().email("Please enter a valid email address.").max(320).optional(),
  eventType: z.enum(eventTypes),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please select a date.").refine(
    (value) => value >= new Date().toISOString().slice(0, 10),
    "Please choose a future date.",
  ),
  guestCount: z.number().int().min(1, "Guest count must be at least 1.").max(1100, "Please contact the venue for events above 1100 guests."),
  specialRequests: z.string().trim().max(2000).optional(),
});

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
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
  booking: router({
    create: publicProcedure.input(bookingInput).mutation(async ({ input }) => {
      await createBookingInquiry({
        fullName: input.fullName,
        phone: input.phone,
        email: input.email,
        eventType: input.eventType,
        eventDate: input.eventDate,
        guestCount: input.guestCount,
        specialRequests: input.specialRequests,
      });

      let notificationSent = false;
      try {
        notificationSent = await notifyOwner({
          title: `New ${input.eventType} booking inquiry`,
          content: `${input.fullName} requested ${input.eventDate} for ${input.guestCount} guests. Contact: ${input.phone}${input.email ? ` · ${input.email}` : ""}.`,
        });
      } catch (error) {
        console.warn("[Booking] Inquiry saved but owner notification failed:", error);
      }

      return { success: true, notificationSent };
    }),
    adminList: adminProcedure.query(() => listBookingInquiries()),
    adminUpdateStatus: adminProcedure.input(z.object({
      id: z.number().int().positive(),
      status: z.enum(bookingStatuses),
    })).mutation(async ({ input }) => {
      await updateBookingInquiryStatus(input.id, input.status);
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
