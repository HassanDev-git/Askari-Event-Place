import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", () => ({
  createBookingInquiry: vi.fn(),
  listBookingInquiries: vi.fn(),
  updateBookingInquiryStatus: vi.fn(),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn(),
}));

import { createBookingInquiry, listBookingInquiries, updateBookingInquiryStatus } from "./db";
import { notifyOwner } from "./_core/notification";

const mockedCreate = vi.mocked(createBookingInquiry);
const mockedList = vi.mocked(listBookingInquiries);
const mockedUpdate = vi.mocked(updateBookingInquiryStatus);
const mockedNotify = vi.mocked(notifyOwner);

function context(role: "admin" | "user" | null = null): TrpcContext {
  return {
    user: role ? { id: 1, openId: "owner", name: "Owner", email: "owner@example.com", loginMethod: "manus", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() } : null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const validInquiry = {
  fullName: "Ayesha Khan",
  phone: "+92 300 1234567",
  email: "ayesha@example.com",
  eventType: "Wedding" as const,
  eventDate: "2027-01-20",
  guestCount: 500,
  specialRequests: "Warm floral palette",
};

describe("booking router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedCreate.mockResolvedValue({} as never);
    mockedNotify.mockResolvedValue(true);
  });

  it("persists a valid public inquiry and notifies the owner", async () => {
    const caller = appRouter.createCaller(context());
    const result = await caller.booking.create(validInquiry);

    expect(result).toEqual({ success: true, notificationSent: true });
    expect(mockedCreate).toHaveBeenCalledWith(expect.objectContaining({ fullName: "Ayesha Khan", guestCount: 500 }));
    expect(mockedNotify).toHaveBeenCalledWith(expect.objectContaining({ title: "New Wedding booking inquiry" }));
  });

  it("rejects a booking request above the verified banquet capacity", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.booking.create({ ...validInquiry, guestCount: 1101 })).rejects.toThrow();
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("blocks non-admin users from reading booking inquiries", async () => {
    const caller = appRouter.createCaller(context("user"));
    await expect(caller.booking.adminList()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows admins to load and update inquiry status", async () => {
    const caller = appRouter.createCaller(context("admin"));
    mockedList.mockResolvedValue([]);
    await expect(caller.booking.adminList()).resolves.toEqual([]);
    await expect(caller.booking.adminUpdateStatus({ id: 1, status: "contacted" })).resolves.toEqual({ success: true });
    expect(mockedUpdate).toHaveBeenCalledWith(1, "contacted");
  });
});
