import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import {
  ArrowRight,
  Play,
  Star,
  Dumbbell,
  Utensils,
  LineChart,
  CalendarCheck,
  Check,
  Activity,
  Quote,
} from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { Reveal } from "@/components/Reveal";

const whyChooseUs = [
  { title: "Personalized Workouts", description: "Plans built around your gear, goals, and level.", icon: Dumbbell },
  { title: "Smart Meal Plans", description: "Balanced, budget-friendly meals to fuel training.", icon: Utensils },
  { title: "Progress Tracking", description: "See every gain with clear charts and logs.", icon: LineChart },
  { title: "Daily Guidance", description: "Stay consistent with reminders and routines.", icon: CalendarCheck },
];

const testimonials = [
  { name: "Sam R.", role: "Lost 12 lbs", quote: "The plans actually fit my schedule and equipment. I finally stayed consistent for a full season." },
  { name: "Mariam K.", role: "First-time lifter", quote: "Clear demos and steps made the gym far less intimidating. I knew exactly what to do each day." },
  { name: "Devon L.", role: "Marathoner", quote: "Tracking progress in one place kept me motivated. The meal plans were a genuine game changer." },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <Navbar />

      <main className="flex-grow">
        {/* Hero */}
        <section className="bg-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Copy */}
              <Reveal>
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-blue-700 shadow-sm">
                  <Star className="w-4 h-4 fill-current text-blue-600" />
                  <span>Transform your fitness journey today</span>
                </div>

                <h1 className="mt-6 text-5xl sm:text-6xl font-extrabold leading-[1.05] tracking-tight text-ink">
                  Never Give Up <Star className="inline w-9 h-9 -mt-3 fill-current text-blue-600" /> <br className="hidden sm:block" />
                  On Your <span className="text-blue-600">Goals</span>
                </h1>

                <p className="mt-6 max-w-md text-lg text-slate-600 leading-relaxed">
                  Personalized workout and meal plans, progress tracking, and daily guidance &mdash; your all-in-one companion for a stronger, healthier you.
                </p>

                <div className="mt-9 flex items-center gap-5">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all group"
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href="/#how-it-works" className="inline-flex items-center gap-3 group">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-purple text-white shadow-md group-hover:scale-105 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </span>
                    <span className="text-sm font-semibold text-ink">See how it works</span>
                  </Link>
                </div>
              </Reveal>

              {/* Visual */}
              <Reveal delay={140} className="relative flex items-center justify-center">
                <div className="relative aspect-square w-full max-w-md">
                  <div className="absolute inset-6 rounded-full bg-brand-amber/90" />
                  <div className="absolute inset-0 rounded-full border border-brand-amber/40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Activity className="w-44 h-44 text-white" strokeWidth={1.25} />
                  </div>

                  {/* Floating stat badge */}
                  <div className="absolute left-0 top-10 rounded-2xl bg-brand-purple px-4 py-2 text-white shadow-lg animate-floaty">
                    <p className="text-lg font-bold leading-none">10k+</p>
                    <p className="text-[11px] opacity-90">Members training</p>
                  </div>

                  {/* Floating coach card */}
                  <div className="absolute bottom-10 right-0 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-lg animate-floaty-slow">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600">
                      <BrandMark className="h-5 w-5 text-white" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-ink leading-none">Verified Plans</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Built by the system</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section id="features" className="bg-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold tracking-tight text-ink">Why Choose Us</h2>
              <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
                We provide the tools and guidance. You provide the effort. Together, we build results.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
              {whyChooseUs.map((item, i) => (
                <Reveal key={item.title} delay={i * 90}>
                  <div className="group text-center px-2">
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-transform duration-300 group-hover:-translate-y-1.5">
                      <item.icon className="h-7 w-7" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wide text-ink">{item.title}</h3>
                    <p className="mt-2 text-sm text-slate-500 leading-relaxed">{item.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="bg-cream py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2">
                <h2 className="text-4xl font-extrabold tracking-tight text-ink mb-10">How it works</h2>
                <div className="space-y-8">
                  {[
                    { step: "01", title: "Create Your Profile", description: "Tell us about your goals, experience, and preferences." },
                    { step: "02", title: "Get Your Plans", description: "We generate a custom workout and meal schedule for you." },
                    { step: "03", title: "Track & Transform", description: "Log your progress daily and watch yourself evolve." },
                  ].map((s) => (
                    <div key={s.step} className="flex gap-6">
                      <div className="text-2xl font-extrabold text-blue-600/30">{s.step}</div>
                      <div>
                        <h3 className="text-lg font-bold text-ink mb-1">{s.title}</h3>
                        <p className="text-slate-600">{s.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:w-1/2 w-full">
                <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-bold text-ink">Today&apos;s Progress</h4>
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">75% Done</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-slate-500 line-through">Morning Workout</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-slate-500 line-through">High Protein Lunch</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                      <span className="text-sm text-ink font-medium">Log Evening Run</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-cream py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-4xl font-extrabold tracking-tight text-ink">What Our Members Say</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <Reveal key={t.name} delay={i * 110} className="h-full">
                  <div className="h-full rounded-3xl bg-white p-7 shadow-sm border border-slate-100 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md">
                  <Quote className="h-7 w-7 text-blue-600/40" />
                  <div className="mt-3 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current text-brand-amber" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-slate-600 leading-relaxed">{t.quote}</p>
                  <div className="mt-5">
                    <p className="text-sm font-bold text-ink">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA banner */}
        <section className="bg-white py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
            <div className="rounded-3xl bg-ink px-8 py-14 text-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Ready to start your transformation?</h2>
              <p className="mt-3 text-slate-300 max-w-xl mx-auto">Build your first plan in minutes. No equipment list too small, no goal too big.</p>
              <Link
                href="/register"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white hover:bg-blue-700 transition-all"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            </Reveal>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-ink text-slate-400 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 pb-8 border-b border-white/10">
              <Link href="/" className="flex items-center gap-2">
                <BrandMark className="h-6 w-6 text-blue-500" />
                <span className="text-xl font-bold text-white tracking-tight">Strive</span>
              </Link>
              <div className="flex gap-8 text-sm">
                <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
                <Link href="/#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
                <Link href="/login" className="hover:text-white transition-colors">Login</Link>
              </div>
            </div>
            <div className="pt-8 text-sm text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
              <p>&copy; 2026 Strive Fitness. All rights reserved.</p>
              <div className="flex gap-6">
                <Link href="/register" className="hover:text-white transition-colors">Get Started</Link>
                <Link href="/login" className="hover:text-white transition-colors">Login</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
