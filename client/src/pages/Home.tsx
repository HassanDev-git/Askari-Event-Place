import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Flower2,
  Heart,
  Hotel,
  Instagram,
  Mail,
  MapPin,
  Menu,
  Music2,
  Phone,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
  UsersRound,
  Wifi,
  X,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

const heroImage = "/manus-storage/askari-hero-banquet_b50bca38.jpg";

const navItems = [
  { label: "Our story", id: "story" },
  { label: "Celebrations", id: "celebrations" },
  { label: "Gallery", id: "gallery" },
  { label: "Venue", id: "venue" },
  { label: "Contact", id: "contact" },
];

const galleryImages = [
  { src: "/manus-storage/askari-hero-banquet_b50bca38.jpg", alt: "Askari Event Place banquet seating in a purple and gold wedding setup", label: "Wedding banquet" },
  { src: "/manus-storage/askari-colourful-banquet_a2eb9c76.jpg", alt: "Colourful traditional event decor at Askari Event Place", label: "Celebration décor" },
  { src: "/manus-storage/askari-aisle_f68da395.jpg", alt: "A decorated aisle inside Askari Event Place", label: "Grand entry" },
  { src: "/manus-storage/askari-decor_67d3c3a5.jpg", alt: "Ceiling drapery and floral decor at the venue", label: "Styled interiors" },
  { src: "/manus-storage/askari-interior_b9958b90.jpg", alt: "Floral lounge area at Askari Event Place", label: "Guest welcome" },
  { src: "/manus-storage/askari-seating_6630e336.jpg", alt: "Formal guest seating arrangement at Askari Event Place", label: "Banquet setting" },
];

const amenities = [
  { icon: UtensilsCrossed, title: "Catering", copy: "Coordinate a food service plan that suits your guest list and celebration." },
  { icon: Flower2, title: "Décor planning", copy: "A canvas for florals, drapery, lighting, and personal details." },
  { icon: Hotel, title: "Bridal room", copy: "A private space intended for the hosts and their final preparations." },
  { icon: Sparkles, title: "Air-conditioned comfort", copy: "A more comfortable experience for celebrations throughout the year." },
  { icon: MapPin, title: "Parking & valet", copy: "On-site parking options to help arrivals feel seamless." },
  { icon: Music2, title: "Sound & celebration", copy: "A flexible event setup designed for ceremonies and festive moments." },
  { icon: Wifi, title: "Venue connectivity", copy: "Wi-Fi availability and practical facilities for modern event needs." },
  { icon: ShieldCheck, title: "Attended venue", copy: "Professional staffing and on-site surveillance for greater peace of mind." },
];

const packages = [
  { title: "Signature ceremony", eyebrow: "For intimate beginnings", copy: "A thoughtfully styled setting for nikah, dholki, mehndi, or a private family gathering.", inclusions: ["Planning consultation", "Flexible seating layout", "Décor discussion"] },
  { title: "Grand wedding", eyebrow: "For unforgettable evenings", copy: "A spacious banquet setting that lets your wedding, walima, or reception take centre stage.", inclusions: ["Large-event floor plan", "Catering coordination", "Guest arrival planning"], featured: true },
  { title: "Corporate & social", eyebrow: "For every milestone", copy: "A flexible canvas for corporate dinners, brand moments, birthdays, and formal celebrations.", inclusions: ["Custom event inquiry", "Practical venue facilities", "Dedicated coordination"] },
];

type BookingForm = {
  fullName: string;
  phone: string;
  email: string;
  eventType: EventType;
  eventDate: string;
  guestCount: string;
  specialRequests: string;
};

type EventType = "Wedding" | "Mehndi" | "Walima" | "Birthday" | "Corporate" | "Social Celebration" | "Other";

const initialForm: BookingForm = { fullName: "", phone: "", email: "", eventType: "Wedding", eventDate: "", guestCount: "", specialRequests: "" };

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("story");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [form, setForm] = useState<BookingForm>(initialForm);
  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const createInquiry = trpc.booking.create.useMutation({
    onSuccess: () => {
      setForm(initialForm);
      toast.success("Your inquiry is with Askari Event Place", { description: "The venue team will confirm availability and next steps." });
    },
    onError: () => toast.error("We could not send your inquiry", { description: "Please call +92 321 2429792 and the team will be happy to help." }),
  });

  useEffect(() => {
    const observers = navItems.map(({ id }) => {
      const section = document.getElementById(id);
      if (!section) return null;
      return new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) setActiveSection(id);
      }, { rootMargin: "-36% 0px -56% 0px", threshold: 0.1 });
    });
    observers.forEach((observer, index) => {
      const section = document.getElementById(navItems[index].id);
      if (observer && section) observer.observe(section);
    });
    return () => observers.forEach((observer) => observer?.disconnect());
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (event.key === "Escape") setLightboxIndex(null);
      if (event.key === "ArrowRight") setLightboxIndex((current) => current === null ? null : (current + 1) % galleryImages.length);
      if (event.key === "ArrowLeft") setLightboxIndex((current) => current === null ? null : (current - 1 + galleryImages.length) % galleryImages.length);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex]);

  function updateForm<K extends keyof BookingForm>(field: K, value: BookingForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createInquiry.mutate({
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      eventType: form.eventType,
      eventDate: form.eventDate,
      guestCount: Number(form.guestCount),
      specialRequests: form.specialRequests.trim() || undefined,
    });
  }

  function navigate(id: string) {
    setMenuOpen(false);
    scrollToSection(id);
  }

  return (
    <div className="min-h-screen bg-[#fbf8f0] text-[#351424]">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#250a19]/88 text-white shadow-[0_8px_30px_rgb(35_5_20/18%)] backdrop-blur-xl">
        <div className="container flex h-[74px] items-center justify-between">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="group flex items-center gap-3 text-left" aria-label="Back to the top of Askari Event Place">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-[#e0bd73]/75 bg-[#fbf8f0]/5 font-display text-2xl text-[#f3d38b] transition-transform duration-200 group-hover:scale-105">A</span>
            <span className="leading-none"><span className="block font-display text-[22px] font-semibold tracking-tight">Askari</span><span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.22em] text-[#e8d6b0]">Event Place</span></span>
          </button>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
            {navItems.map((item) => <button key={item.id} onClick={() => navigate(item.id)} className={`rounded-full px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${activeSection === item.id ? "bg-white/13 text-[#f4d890]" : "text-[#f9f2e4]/80 hover:bg-white/8 hover:text-white"}`}>{item.label}</button>)}
            <a href="/admin" className="ml-2 rounded-full border border-[#d9b76b]/50 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#f0cf83] transition hover:bg-[#d9b76b] hover:text-[#2b0a1a]">Owner access</a>
          </nav>
          <button onClick={() => setMenuOpen((open) => !open)} className="grid h-10 w-10 place-items-center rounded-full border border-white/20 transition hover:bg-white/10 lg:hidden" aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label="Toggle navigation menu">{menuOpen ? <X size={18} /> : <Menu size={18} />}</button>
        </div>
        {menuOpen && <div id="mobile-menu" className="border-t border-white/10 bg-[#250a19] px-4 py-3 lg:hidden"><nav className="container grid gap-1" aria-label="Mobile navigation">{navItems.map((item) => <button key={item.id} onClick={() => navigate(item.id)} className="rounded-lg px-3 py-3 text-left text-sm font-semibold text-[#fff8ec] hover:bg-white/10">{item.label}</button>)}<a href="/admin" className="rounded-lg px-3 py-3 text-sm font-semibold text-[#f0cf83] hover:bg-white/10">Owner access</a></nav></div>}
      </header>

      <main>
        <section className="relative isolate flex min-h-[780px] items-end overflow-hidden bg-[#250a19] pb-12 pt-32 sm:min-h-[760px] sm:pb-20 lg:min-h-screen lg:pb-24" aria-label="Askari Event Place introduction">
          <img src={heroImage} alt="Elegant banquet tables and floral decor at Askari Event Place" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
          <div className="hero-grain absolute inset-0 -z-10" />
          <div className="absolute -right-24 top-1/3 -z-10 h-80 w-80 rounded-full border border-[#f5cf7a]/25" />
          <div className="absolute -right-10 top-[31%] -z-10 h-64 w-64 rounded-full border border-[#f5cf7a]/18" />
          <div className="container grid items-end gap-12 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="max-w-3xl text-white">
              <div className="animate-rise-in flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.23em] text-[#f5d58f]"><span className="h-px w-10 bg-[#e6bc62]" />Karachi’s celebration canvas</div>
              <h1 className="animate-rise-in-delay mt-6 max-w-3xl font-display text-6xl font-semibold leading-[0.88] tracking-[-0.045em] text-balance sm:text-7xl lg:text-[104px]">A venue made for <em className="font-display font-semibold text-[#f2cf84]">your moment.</em></h1>
              <p className="animate-rise-in-delay-2 mt-7 max-w-xl text-[15px] leading-7 text-white/84 sm:text-base">From intimate ceremonies to grand receptions, <strong className="font-semibold text-white">Askari Event Place</strong> brings the space, atmosphere, and thoughtful coordination behind celebrations that feel unmistakably yours.</p>
              <div className="animate-rise-in-delay-2 mt-9 flex flex-col gap-3 sm:flex-row"><button onClick={() => scrollToSection("booking")} className="group inline-flex h-13 items-center justify-center gap-3 rounded-full bg-[#e4bd6f] px-6 text-[12px] font-extrabold uppercase tracking-[0.12em] text-[#2c0b1b] shadow-lg shadow-black/20 transition duration-200 hover:bg-[#f2d590] active:scale-[0.97]">Start an enquiry <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" /></button><button onClick={() => scrollToSection("gallery")} className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-white/35 px-6 text-[12px] font-extrabold uppercase tracking-[0.12em] text-white transition duration-200 hover:border-white hover:bg-white/10 active:scale-[0.97]"><Camera size={16} />Explore the venue</button></div>
            </div>
            <aside className="animate-float-soft border-l border-[#eac773]/55 pl-5 text-white lg:mb-2" aria-label="Venue facts"><p className="font-display text-5xl font-semibold leading-none text-[#f3d18a]">900–1100</p><p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">Guest banquet capacity</p><div className="my-5 h-px w-28 bg-white/25" /><p className="text-sm leading-6 text-white/78">Main University Road<br />Near Faizan e Madina, Karachi</p></aside>
          </div>
        </section>

        <section id="story" className="venue-grid scroll-mt-20 bg-[#f7f2e6] py-24 sm:py-32">
          <div className="container grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div className="relative"><div className="absolute -left-4 -top-4 h-24 w-24 border-l border-t border-[#9b7041]/50" /><img src="/manus-storage/askari-interior_b9958b90.jpg" alt="Floral welcome area at Askari Event Place" className="aspect-[4/3] w-full rounded-[2px] object-cover shadow-[20px_24px_0_#e7d9bb]" /><div className="absolute -bottom-8 right-6 max-w-[210px] rounded-sm bg-[#3b1127] px-5 py-5 text-[#fbf6e9] shadow-xl"><p className="font-display text-3xl font-semibold text-[#eac574]">900–1100</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.13em] text-white/75">Guests in the banquet</p></div></div>
            <div className="lg:pl-10"><p className="text-[11px] font-extrabold uppercase tracking-[0.19em] text-[#8a5930]">Our story</p><h2 className="mt-4 max-w-xl font-display text-5xl font-semibold leading-[0.96] tracking-[-0.04em] text-[#401329] sm:text-6xl">A spacious setting for every kind of gathering.</h2><p className="mt-7 max-w-xl text-[15px] leading-7 text-[#5d4a45]">Askari Event Place is a banquet venue on Main University Road near Faizan e Madina. The venue’s own public profile describes it as a place for all kinds of events, with capacity for <strong className="font-semibold text-[#44152a]">900 to 1100 guests</strong>.</p><p className="mt-4 max-w-xl text-[15px] leading-7 text-[#5d4a45]">Bring your vision for a wedding, walima, mehndi, social celebration, or corporate occasion. The Askari team can guide the details once they understand your date, guest list, and ideas.</p><button onClick={() => scrollToSection("booking")} className="mt-8 inline-flex items-center gap-2 border-b border-[#4b1830] pb-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#4b1830] transition hover:border-[#c58b3c] hover:text-[#9a622a]">Discuss your date <ArrowRight size={15} /></button></div>
          </div>
        </section>

        <section id="celebrations" className="scroll-mt-20 bg-[#fffdf8] py-24 sm:py-32"><div className="container"><div className="mx-auto max-w-2xl text-center"><p className="text-[11px] font-extrabold uppercase tracking-[0.19em] text-[#8a5930]">Celebrations, considered</p><h2 className="mt-4 font-display text-5xl font-semibold leading-[0.95] tracking-[-0.04em] text-[#401329] sm:text-6xl">Choose the scale.<br /><em>Keep the feeling.</em></h2><p className="mx-auto mt-5 max-w-xl text-[15px] leading-7 text-[#685750]">Every event starts differently. Our planning tiers make it easier to begin the conversation; the venue team will shape a custom quotation around your date and requirements.</p></div><div className="mt-14 grid gap-5 lg:grid-cols-3">{packages.map((pkg) => <article key={pkg.title} className={`group relative overflow-hidden rounded-sm border p-7 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${pkg.featured ? "border-[#bb8a42] bg-[#3a1127] text-white shadow-[0_18px_40px_rgb(55_10_31/16%)]" : "border-[#eadfc8] bg-[#fbf8f0] text-[#401329]"}`}><div className="flex items-center justify-between"><span className={`text-[10px] font-extrabold uppercase tracking-[0.17em] ${pkg.featured ? "text-[#efcc80]" : "text-[#9a6a38]"}`}>{pkg.eyebrow}</span>{pkg.featured && <Heart size={16} className="fill-[#eac574] text-[#eac574]" />}</div><h3 className="mt-8 font-display text-4xl font-semibold leading-none">{pkg.title}</h3><p className={`mt-4 min-h-20 text-[14px] leading-6 ${pkg.featured ? "text-white/75" : "text-[#65514b]"}`}>{pkg.copy}</p><ul className="mt-7 grid gap-3">{pkg.inclusions.map((item) => <li key={item} className={`flex items-center gap-2 text-xs font-semibold ${pkg.featured ? "text-white/90" : "text-[#5a4842]"}`}><Check size={15} className={pkg.featured ? "text-[#f0cf83]" : "text-[#9a6a38]"} />{item}</li>)}</ul><button onClick={() => scrollToSection("booking")} className={`mt-9 inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.13em] transition ${pkg.featured ? "text-[#f0cf83] hover:text-white" : "text-[#4b1830] hover:text-[#a56a2c]"}`}>Request your quotation <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></button></article>)}</div></div></section>

        <section id="gallery" className="scroll-mt-20 bg-[#3a1127] py-24 text-white sm:py-32">
          <div className="container">
            <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-end">
              <div><p className="text-[11px] font-extrabold uppercase tracking-[0.19em] text-[#eac574]">The Askari experience</p><h2 className="mt-4 font-display text-5xl font-semibold leading-[0.95] tracking-[-0.04em] sm:text-6xl">A celebration,<br /><em>from every angle.</em></h2></div>
              <p className="max-w-md text-[14px] leading-6 text-white/72">Step inside through the latest official venue reel, then explore the florals, lighting, seating, and spacious celebration setups that make the scene feel complete.</p>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-3 lg:h-[640px] lg:grid-cols-12 lg:grid-rows-[1.25fr_1fr]">
              <article className="col-span-2 overflow-hidden rounded-sm border border-[#eac574]/35 bg-[#1b0510] shadow-[0_22px_50px_rgb(12_1_7/30%)] lg:col-span-8">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><div className="flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#eac574] text-[#351021]"><Camera size={12} /></span><span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#f3d38b]">Official venue reel</span></div><a href="https://www.facebook.com/reel/1562595725058725/" target="_blank" rel="noreferrer" className="text-[10px] font-extrabold uppercase tracking-[0.11em] text-white/70 transition hover:text-[#f0cf83]">Watch on Facebook ↗</a></div>
                <div className="relative aspect-[560/314] bg-black lg:h-[calc(100%-49px)] lg:aspect-auto"><iframe src="https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1562595725058725%2F&show_text=false&width=560&t=0" title="Askari Event Place official Facebook venue reel" width="560" height="314" style={{ border: "none", overflow: "hidden" }} scrolling="no" frameBorder="0" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" loading="lazy" className="absolute inset-0 h-full w-full" /></div>
              </article>
              <GalleryImage image={galleryImages[0]} index={0} className="col-span-2 min-h-[250px] lg:col-span-4 lg:row-span-2 lg:min-h-0" onOpen={setLightboxIndex} />
              <GalleryImage image={galleryImages[1]} index={1} className="min-h-[155px] lg:col-span-3 lg:min-h-0" onOpen={setLightboxIndex} />
              <GalleryImage image={galleryImages[2]} index={2} className="min-h-[155px] lg:col-span-3 lg:min-h-0" onOpen={setLightboxIndex} />
              <GalleryImage image={galleryImages[4]} index={4} className="col-span-2 min-h-[170px] lg:col-span-2 lg:min-h-0" onOpen={setLightboxIndex} />
            </div>
            <div className="mt-5 flex items-center justify-between gap-5 border-t border-white/10 pt-4"><p className="text-[11px] leading-5 text-white/58">Venue visuals are shown from official Askari Event Place media and public event imagery.</p><a href="https://www.facebook.com/AskariEventPlace/" target="_blank" rel="noreferrer" className="shrink-0 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#f0cf83] transition hover:text-white">More from Askari ↗</a></div>
          </div>
        </section>

        <section id="venue" className="scroll-mt-20 bg-[#f6efe0] py-24 sm:py-32"><div className="container grid gap-12 lg:grid-cols-[0.88fr_1.12fr]"><div><p className="text-[11px] font-extrabold uppercase tracking-[0.19em] text-[#8a5930]">Venue features</p><h2 className="mt-4 max-w-md font-display text-5xl font-semibold leading-[0.95] tracking-[-0.04em] text-[#401329] sm:text-6xl">The details guests feel.</h2><p className="mt-6 max-w-sm text-[15px] leading-7 text-[#65514b]">From practical comfort to the small details that help a celebration flow, Askari Event Place offers a versatile venue foundation. Discuss what is available for your particular date with the team.</p><div className="mt-9 flex items-center gap-3 border-l-2 border-[#b57e38] pl-4"><UsersRound className="text-[#8d5925]" size={24} /><p className="text-sm font-semibold text-[#4b1830]">A banquet capacity designed for<br />large celebrations of up to 1100 guests.</p></div></div><div className="grid gap-3 sm:grid-cols-2">{amenities.map(({ icon: Icon, title, copy }, index) => <article key={title} className="group rounded-sm border border-[#e4d4b7] bg-[#fffcf5] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#c99a52] hover:shadow-[0_12px_28px_rgb(79_34_24/10%)]" style={{ transitionDelay: `${Math.min(index, 3) * 40}ms` }}><span className="grid h-10 w-10 place-items-center rounded-full bg-[#f2e4c7] text-[#6a2a45] transition duration-300 group-hover:bg-[#3a1127] group-hover:text-[#f0cf83]"><Icon size={19} /></span><h3 className="mt-5 font-display text-2xl font-semibold text-[#48162c]">{title}</h3><p className="mt-2 text-[13px] leading-6 text-[#6c5b52]">{copy}</p></article>)}</div></div></section>

        <section id="booking" className="scroll-mt-20 bg-[#fffdf8] py-24 sm:py-32"><div className="container grid overflow-hidden rounded-sm border border-[#eadbc0] shadow-[0_24px_65px_rgb(69_23_43/9%)] lg:grid-cols-[0.8fr_1.2fr]"><div className="relative min-h-[390px] overflow-hidden bg-[#3a1127] p-8 text-white sm:p-12"><img src="/manus-storage/askari-colourful-banquet_a2eb9c76.jpg" alt="Celebration setup at Askari Event Place" className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-luminosity" /><div className="absolute inset-0 bg-gradient-to-br from-[#3a1127]/95 via-[#3a1127]/82 to-[#7c3b2e]/76" /><div className="relative flex h-full flex-col"><p className="text-[11px] font-extrabold uppercase tracking-[0.19em] text-[#efcb7b]">Let’s plan together</p><h2 className="mt-5 max-w-sm font-display text-5xl font-semibold leading-[0.94] tracking-[-0.04em]">Tell us what you’re celebrating.</h2><p className="mt-6 max-w-sm text-[14px] leading-7 text-white/77">Share a few details and we’ll make sure the Askari Event Place team receives your inquiry. They can confirm availability, arrangements, and a quote.</p><div className="mt-auto pt-10"><div className="h-px w-16 bg-[#eac574]" /><p className="mt-4 text-sm text-white/80">Prefer to speak now?</p><a href="tel:+923212429792" className="mt-1 inline-flex items-center gap-2 font-display text-3xl font-semibold text-[#f1cf84] transition hover:text-white"><Phone size={17} />+92 321 2429792</a></div></div></div>
          <form onSubmit={submitBooking} className="bg-[#fffdf8] p-7 sm:p-10 lg:p-12"><div className="grid gap-5 sm:grid-cols-2"><FormField label="Your name" required><input required value={form.fullName} onChange={(event) => updateForm("fullName", event.target.value)} placeholder="e.g. Ayesha Khan" className="venue-input" /></FormField><FormField label="Phone number" required><input required inputMode="tel" value={form.phone} onChange={(event) => updateForm("phone", event.target.value)} placeholder="03XX XXX XXXX" className="venue-input" /></FormField><FormField label="Email address"><input type="email" value={form.email} onChange={(event) => updateForm("email", event.target.value)} placeholder="you@example.com" className="venue-input" /></FormField><FormField label="Event type" required><select required value={form.eventType} onChange={(event) => updateForm("eventType", event.target.value as EventType)} className="venue-input"><option>Wedding</option><option>Mehndi</option><option>Walima</option><option>Birthday</option><option>Corporate</option><option>Social Celebration</option><option>Other</option></select></FormField><FormField label="Preferred date" required><div className="relative"><CalendarDays size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8f6442]" /><input required type="date" min={minDate} value={form.eventDate} onChange={(event) => updateForm("eventDate", event.target.value)} className="venue-input pl-10" /></div></FormField><FormField label="Estimated guests" required><input required min="1" max="1100" type="number" inputMode="numeric" value={form.guestCount} onChange={(event) => updateForm("guestCount", event.target.value)} placeholder="e.g. 600" className="venue-input" /></FormField></div><FormField label="How can we make it special?" additionalClass="mt-5"><textarea value={form.specialRequests} onChange={(event) => updateForm("specialRequests", event.target.value)} rows={4} maxLength={2000} placeholder="Tell us about your preferred setup, décor, food, or anything else." className="venue-input resize-none" /></FormField><p className="mt-5 text-[11px] leading-5 text-[#79655b]">By submitting, you are requesting information from Askari Event Place. Your inquiry will be saved for the venue team to follow up.</p><button type="submit" disabled={createInquiry.isPending} className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#3a1127] px-6 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#f7df9f] transition hover:bg-[#5a1f3b] disabled:cursor-wait disabled:opacity-65 active:scale-[0.98]">{createInquiry.isPending ? "Sending your inquiry…" : "Send booking inquiry"}<ArrowRight size={15} /></button></form>
        </div></section>

        <section className="border-y border-[#e7d9bf] bg-[#f8f2e5] py-14"><div className="container grid items-center gap-8 md:grid-cols-[1fr_auto_1fr]"><div className="flex items-center gap-4"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[#c69a56] text-[#7d3d55]"><Heart size={20} /></div><div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#8a5930]">Community recommendation</p><p className="mt-1 font-display text-2xl font-semibold text-[#46152b]">96% recommend us on Facebook</p></div></div><div className="hidden h-12 w-px bg-[#d8c4a0] md:block" /><p className="max-w-lg text-[13px] leading-6 text-[#66544c]">Facebook publicly shows a 96% recommendation rate from 64 reviews. For unfiltered client feedback and recent posts, explore the official page.</p><a href="https://www.facebook.com/AskariEventPlace/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.13em] text-[#4d1830] transition hover:text-[#a4682e]"><Facebook size={16} />Read reviews <ArrowRight size={14} /></a></div></section>

        <section id="contact" className="scroll-mt-20 bg-[#2d0b1d] py-24 text-white sm:py-28"><div className="container grid gap-12 lg:grid-cols-[0.86fr_1.14fr]"><div><p className="text-[11px] font-extrabold uppercase tracking-[0.19em] text-[#eac574]">Find Askari Event Place</p><h2 className="mt-4 font-display text-5xl font-semibold leading-[0.95] tracking-[-0.04em] sm:text-6xl">Let’s make room<br /><em>for your plans.</em></h2><div className="mt-9 grid gap-6"><ContactItem icon={MapPin} label="Venue address"><span>Main University Road, Near Faizan e Madina<br />Karachi, Pakistan</span></ContactItem><ContactItem icon={Phone} label="Call the booking team"><a className="transition hover:text-[#f0cf83]" href="tel:+923212429792">+92 321 2429792</a></ContactItem><ContactItem icon={Mail} label="Email"><a className="transition hover:text-[#f0cf83]" href="mailto:hamza.jaff1998@gmail.com">hamza.jaff1998@gmail.com</a></ContactItem></div><div className="mt-10 flex items-center gap-3"><a href="https://www.facebook.com/AskariEventPlace/" target="_blank" rel="noreferrer" aria-label="Askari Event Place on Facebook" className="grid h-10 w-10 place-items-center rounded-full border border-white/20 transition hover:border-[#eac574] hover:bg-[#eac574] hover:text-[#2c0a1a]"><Facebook size={17} /></a><a href="https://www.instagram.com/askarieventplace/" target="_blank" rel="noreferrer" aria-label="Askari Event Place on Instagram" className="grid h-10 w-10 place-items-center rounded-full border border-white/20 transition hover:border-[#eac574] hover:bg-[#eac574] hover:text-[#2c0a1a]"><Instagram size={17} /></a></div></div><div className="min-h-[360px] overflow-hidden rounded-sm border border-white/15 bg-white/5 p-2 sm:min-h-[470px]"><iframe title="Map showing Askari Event Place in Karachi" src="https://www.google.com/maps?q=Askari%20Event%20Place%20Karachi&output=embed" className="h-full min-h-[344px] w-full border-0 grayscale-[25%] contrast-[90%] sm:min-h-[450px]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div></div></section>
      </main>

      <footer className="bg-[#1e0713] py-6 text-white/65"><div className="container flex flex-col justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.13em] sm:flex-row"><p>© {new Date().getFullYear()} Askari Event Place</p><p>Celebrations start with a conversation.</p></div></footer>

      {lightboxIndex !== null && <div role="dialog" aria-modal="true" aria-label="Gallery lightbox" className="fixed inset-0 z-50 grid place-items-center bg-[#16040d]/95 p-4 backdrop-blur-sm" onClick={() => setLightboxIndex(null)}><div className="relative max-h-full max-w-6xl" onClick={(event) => event.stopPropagation()}><img src={galleryImages[lightboxIndex].src} alt={galleryImages[lightboxIndex].alt} className="max-h-[82vh] max-w-full rounded-sm object-contain shadow-2xl" /><p className="mt-3 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">{galleryImages[lightboxIndex].label} · {lightboxIndex + 1} / {galleryImages.length}</p><button onClick={() => setLightboxIndex(null)} className="absolute -right-1 -top-12 grid h-9 w-9 place-items-center rounded-full border border-white/30 text-white transition hover:bg-white hover:text-[#2c0a1a]" aria-label="Close gallery"><X size={16} /></button><button onClick={() => setLightboxIndex((index) => index === null ? null : (index - 1 + galleryImages.length) % galleryImages.length)} className="absolute -left-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/30 text-white transition hover:bg-white hover:text-[#2c0a1a] sm:-left-14" aria-label="Previous photograph"><ChevronLeft size={18} /></button><button onClick={() => setLightboxIndex((index) => index === null ? null : (index + 1) % galleryImages.length)} className="absolute -right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/30 text-white transition hover:bg-white hover:text-[#2c0a1a] sm:-right-14" aria-label="Next photograph"><ChevronRight size={18} /></button></div></div>}
    </div>
  );
}

function FormField({ label, required, additionalClass = "", children }: { label: string; required?: boolean; additionalClass?: string; children: React.ReactNode }) {
  return <label className={`block ${additionalClass}`}><span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#684a3e]">{label}{required && <span className="ml-1 text-[#9b254a]">*</span>}</span>{children}</label>;
}

function ContactItem({ icon: Icon, label, children }: { icon: typeof MapPin; label: string; children: React.ReactNode }) {
  return <div className="flex items-start gap-4"><span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-[#eac574]"><Icon size={17} /></span><div><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#eac574]">{label}</p><div className="mt-1 text-sm leading-6 text-white/80">{children}</div></div></div>;
}

function GalleryImage({ image, index, className, onOpen }: { image: (typeof galleryImages)[number]; index: number; className: string; onOpen: (index: number) => void }) {
  return <button type="button" onClick={() => onOpen(index)} className={`group relative overflow-hidden rounded-sm text-left focus:outline-none focus:ring-2 focus:ring-[#f0cf83] ${className}`}><img src={image.src} alt={image.alt} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><span className="absolute inset-0 bg-gradient-to-t from-[#210817]/70 via-transparent to-transparent" /><span className="absolute inset-x-4 bottom-3 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-[0.13em] text-white"><span>{image.label}</span><span className="grid h-7 w-7 place-items-center rounded-full bg-white/20 opacity-0 transition group-hover:opacity-100"><Camera size={13} /></span></span></button>;
}
