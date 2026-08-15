import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, CalendarDays, Check, Clock3, LogOut, Mail, Phone, RefreshCw, ShieldAlert, UsersRound } from "lucide-react";
import { toast } from "sonner";

const statuses = ["new", "contacted", "confirmed", "declined", "closed"] as const;
const statusLabels: Record<(typeof statuses)[number], string> = {
  new: "New",
  contacted: "Contacted",
  confirmed: "Confirmed",
  declined: "Declined",
  closed: "Closed",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PK", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

export default function Admin() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const utils = trpc.useUtils();
  const inquiries = trpc.booking.adminList.useQuery(undefined, { enabled: user?.role === "admin" });
  const updateStatus = trpc.booking.adminUpdateStatus.useMutation({
    onSuccess: async () => {
      toast.success("Inquiry updated");
      await utils.booking.adminList.invalidate();
    },
    onError: () => toast.error("The inquiry could not be updated."),
  });

  if (loading) return <div className="grid min-h-screen place-items-center bg-[#f8f2e5] text-[#4b1830]"><div className="flex items-center gap-3 text-sm font-semibold"><RefreshCw className="animate-spin" size={18} />Loading owner access…</div></div>;

  if (!isAuthenticated) return <AccessPanel title="Owner access" description="Sign in to view and manage booking inquiries for Askari Event Place." action="Sign in securely" onAction={startLogin} />;

  if (user?.role !== "admin") return <AccessPanel title="Owner access only" description="This dashboard is reserved for the Askari Event Place account owner. If you believe this is an error, contact the project owner." action="Sign out" onAction={() => void logout()} locked />;

  return <div className="min-h-screen bg-[#f8f2e5] text-[#351424]"><header className="border-b border-[#e4d5bb] bg-[#2a0b1b] text-white"><div className="container flex min-h-20 items-center justify-between gap-4"><a href="/" className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.13em] text-[#efd084] transition hover:text-white"><ArrowLeft size={15} />Public website</a><div className="text-center"><p className="font-display text-2xl font-semibold">Askari Event Place</p><p className="text-[9px] font-bold uppercase tracking-[0.19em] text-white/60">Booking desk</p></div><button onClick={() => void logout()} className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.13em] text-[#efd084] transition hover:text-white"><LogOut size={15} />Sign out</button></div></header><main className="container py-10 sm:py-14"><div className="flex flex-col justify-between gap-6 border-b border-[#e4d5bb] pb-8 sm:flex-row sm:items-end"><div><p className="text-[11px] font-extrabold uppercase tracking-[0.17em] text-[#8a5930]">Owner dashboard</p><h1 className="mt-2 font-display text-5xl font-semibold tracking-[-0.04em] text-[#401329]">Booking inquiries</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[#67554c]">Review every web inquiry, track the response status, and follow up with event hosts directly.</p></div><div className="rounded-sm border border-[#dfc99f] bg-[#fffaf0] px-5 py-4"><p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#8a5930]">Total inquiries</p><p className="mt-1 font-display text-4xl font-semibold text-[#44152a]">{inquiries.data?.length ?? "—"}</p></div></div>{inquiries.isLoading ? <div className="grid min-h-64 place-items-center text-sm font-semibold text-[#765f52]"><RefreshCw className="animate-spin" size={18} />Loading inquiries…</div> : inquiries.isError ? <div className="mt-8 rounded-sm border border-[#e5b0ab] bg-[#fff1f0] p-6 text-sm text-[#8d2926]">Booking data could not be loaded. Please refresh or try again shortly.</div> : inquiries.data?.length === 0 ? <div className="mt-8 rounded-sm border border-dashed border-[#d9c7a6] bg-[#fffdf8] p-12 text-center"><CalendarDays className="mx-auto text-[#9b7041]" size={28} /><h2 className="mt-4 font-display text-3xl font-semibold text-[#48162c]">No inquiries yet</h2><p className="mt-2 text-sm text-[#746258]">New booking requests will appear here as soon as guests submit the form.</p></div> : <div className="mt-8 grid gap-4">{inquiries.data?.map((inquiry) => <article key={inquiry.id} className="rounded-sm border border-[#e4d5bb] bg-[#fffdf8] p-5 shadow-[0_8px_20px_rgb(65_26_38/4%)] sm:p-6"><div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-display text-3xl font-semibold text-[#45162b]">{inquiry.fullName}</h2><StatusBadge status={inquiry.status} /></div><div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-[13px] text-[#655149]"><span className="inline-flex items-center gap-2"><CalendarDays size={15} className="text-[#92582b]" />{formatDate(inquiry.eventDate)} · {inquiry.eventType}</span><span className="inline-flex items-center gap-2"><UsersRound size={15} className="text-[#92582b]" />{inquiry.guestCount} guests</span><a className="inline-flex items-center gap-2 transition hover:text-[#8a3e56]" href={`tel:${inquiry.phone}`}><Phone size={15} className="text-[#92582b]" />{inquiry.phone}</a>{inquiry.email && <a className="inline-flex items-center gap-2 transition hover:text-[#8a3e56]" href={`mailto:${inquiry.email}`}><Mail size={15} className="text-[#92582b]" />{inquiry.email}</a>}</div>{inquiry.specialRequests && <div className="mt-5 rounded-sm border-l-2 border-[#c69452] bg-[#faf4e8] px-4 py-3 text-sm leading-6 text-[#624f46]"><span className="mr-2 text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#8a5930]">Special requests</span>{inquiry.specialRequests}</div>}<p className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold text-[#907a6a]"><Clock3 size={13} />Received {new Intl.DateTimeFormat("en-PK", { dateStyle: "medium", timeStyle: "short" }).format(new Date(inquiry.createdAt))}</p></div><label className="block shrink-0"><span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#8a5930]">Status</span><select value={inquiry.status} disabled={updateStatus.isPending} onChange={(event) => updateStatus.mutate({ id: inquiry.id, status: event.target.value as (typeof statuses)[number] })} className="venue-input min-w-36 bg-[#fffaf0] py-2.5 text-xs font-bold uppercase tracking-[0.08em]">{statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></label></div></article>)}</div>}</main></div>;
}

function AccessPanel({ title, description, action, onAction, locked = false }: { title: string; description: string; action: string; onAction: () => void; locked?: boolean }) {
  return <div className="grid min-h-screen place-items-center bg-[#f8f2e5] px-4"><div className="w-full max-w-md rounded-sm border border-[#e1cda9] bg-[#fffdf8] p-8 text-center shadow-[0_22px_60px_rgb(67_24_42/11%)]"><span className="mx-auto grid h-13 w-13 place-items-center rounded-full bg-[#3a1127] text-[#f0cf83]">{locked ? <ShieldAlert size={22} /> : <Check size={22} />}</span><p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.17em] text-[#8a5930]">Askari Event Place</p><h1 className="mt-2 font-display text-4xl font-semibold text-[#42152a]">{title}</h1><p className="mt-4 text-sm leading-6 text-[#67554c]">{description}</p><button onClick={onAction} className="mt-7 inline-flex h-11 w-full items-center justify-center rounded-full bg-[#3a1127] px-5 text-[11px] font-extrabold uppercase tracking-[0.13em] text-[#f1d187] transition hover:bg-[#58203e] active:scale-[0.98]">{action}</button><a href="/" className="mt-5 inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.13em] text-[#6a3a46] transition hover:text-[#a66d30]"><ArrowLeft size={14} />Back to website</a></div></div>;
}

function StatusBadge({ status }: { status: (typeof statuses)[number] }) {
  const style: Record<(typeof statuses)[number], string> = { new: "bg-[#f7e7be] text-[#785118]", contacted: "bg-[#e0eef3] text-[#256077]", confirmed: "bg-[#e3f1dd] text-[#386b2d]", declined: "bg-[#f4dddd] text-[#8c3833]", closed: "bg-[#e9e7e4] text-[#5b5751]" };
  return <span className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] ${style[status]}`}>{statusLabels[status]}</span>;
}
