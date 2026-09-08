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
    <div className="flex flex-col min-h-screen bg-cream selection:bg-blue-500 selection:text-white">
      <Navbar />

      <main className="flex-grow">
        {/* Hero */}
        <section className="bg-gradient-to-b from-cream via-cream to-white/60 relative overflow-hidden">
          {/* Subtle background glow circle */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Copy */}
              <Reveal>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-800 text-xs font-bold uppercase tracking-wider mb-6 border border-blue-200/50">
                  <Star className="w-3.5 h-3.5 fill-current text-blue-600" />
                  Your AI Fitness & Health Companion
                </div>
                <h1 className="text-5xl sm:text-6xl font-extrabold leading-[1.05] tracking-tight text-ink">
                  Never Give Up <Star className="inline w-9 h-9 -mt-3 fill-current text-blue-600 animate-pulse" /> <br className="hidden sm:block" />
                  On Your <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-amber-600 bg-clip-text text-transparent">Goals</span>
                </h1>

                <p className="mt-6 max-w-md text-lg text-slate-600 leading-relaxed font-medium">
                  Personalized workout and meal plans, progress tracking, and daily guidance &mdash; your all-in-one companion for a stronger, healthier you.
                </p>

                <div className="mt-9 flex flex-wrap items-center gap-5">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2.5 rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all group"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href="/#how-it-works" className="inline-flex items-center gap-3 group">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-purple text-white shadow-md shadow-brand-purple/20 group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </span>
                    <span className="text-sm font-bold text-ink group-hover:text-blue-600 transition-colors">See how it works</span>
                  </Link>
                </div>
              </Reveal>

              {/* Visual */}
              <Reveal delay={140} className="relative flex items-center justify-center">
                <div className="relative aspect-square w-full max-w-md">
                  <div className="absolute inset-6 rounded-full bg-gradient-to-tr from-brand-amber to-orange-400 shadow-xl shadow-brand-amber/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-brand-amber/40 animate-[spin_60s_linear_infinite]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Activity className="w-44 h-44 text-white drop-shadow-md" strokeWidth={1.25} />
                  </div>

                  {/* Floating stat badge */}
                  <div className="absolute left-0 top-10 rounded-2xl bg-brand-purple px-4 py-2.5 text-white shadow-xl shadow-brand-purple/30 animate-floaty backdrop-blur-sm border border-purple-400/30">
                    <p className="text-lg font-extrabold leading-none">Instant</p>
                    <p className="text-[11px] font-medium opacity-90">AI Plan Generation</p>
                  </div>

                  {/* Floating coach card */}
                  <div className="absolute bottom-10 right-0 flex items-center gap-3 rounded-2xl bg-white/90 backdrop-blur-md px-4 py-3 shadow-xl border border-slate-100 animate-floaty-slow">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-500/30">
                      <BrandMark className="h-5 w-5 text-white" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-ink leading-none">Verified Plans</p>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">Built by the system</p>
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
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Designed for Results</span>
              <h2 className="text-4xl font-extrabold tracking-tight text-ink mt-3">Why Choose Us</h2>
              <p className="mt-3 text-slate-600 max-w-2xl mx-auto font-medium">
                We provide the tools and guidance. You provide the effort. Together, we build results.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {whyChooseUs.map((item, i) => (
                <Reveal key={item.title} delay={i * 90}>
                  <div className="group text-center p-6 rounded-3xl bg-slate-50/70 border border-slate-100 hover-lift hover:bg-white hover:border-blue-100 transition-all">
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                      <item.icon className="h-7 w-7" strokeWidth={1.75} />
                    </div>
                    <h3 className="text-base font-bold text-ink tracking-tight">{item.title}</h3>
                    <p className="mt-2 text-sm text-slate-500 leading-relaxed">{item.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="bg-cream py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-100/60 px-3 py-1 rounded-full border border-blue-200/50">Simple 3-Step Process</span>
                <h2 className="text-4xl font-extrabold tracking-tight text-ink mt-3 mb-10">How it works</h2>
                <div className="space-y-8">
                  {[
                    { step: "01", title: "Create Your Profile", description: "Tell us about your goals, experience, and preferences." },
                    { step: "02", title: "Get Your Plans", description: "We generate a custom workout and meal schedule for you." },
                    { step: "03", title: "Track & Transform", description: "Log your progress daily and watch yourself evolve." },
                  ].map((s) => (
                    <div key={s.step} className="flex gap-6 group">
                      <div className="text-2xl font-extrabold text-blue-600 bg-blue-100/80 w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {s.step}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-ink mb-1 group-hover:text-blue-600 transition-colors">{s.title}</h3>
                        <p className="text-slate-600 leading-relaxed font-medium">{s.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:w-1/2 w-full">
                <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50 border border-slate-100/80 hover-lift">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                    <div>
                      <h4 className="font-bold text-ink text-base">Today&apos;s Progress</h4>
                      <p className="text-xs text-slate-400">Keep up the streak!</p>
                    </div>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">75% Done</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50/80">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                      <span className="text-sm text-slate-400 line-through font-medium">Morning Workout Completed</span>
                    </div>
                    <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50/80">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                      <span className="text-sm text-slate-400 line-through font-medium">High Protein Lunch Logged</span>
                    </div>
                    <div className="flex items-center gap-3.5 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                      <div className="w-6 h-6 rounded-full border-2 border-blue-600 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                      </div>
                      <span className="text-sm text-slate-900 font-bold">Log Evening Run & Recovery</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-cream py-24 border-t border-slate-200/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-100/60 px-3 py-1 rounded-full border border-blue-200/50">Real User Stories</span>
              <h2 className="text-4xl font-extrabold tracking-tight text-ink mt-3">What Our Members Say</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <Reveal key={t.name} delay={i * 110} className="h-full">
                  <div className="h-full rounded-3xl bg-white p-8 shadow-sm border border-slate-100/80 hover-lift flex flex-col justify-between">
                    <div>
                      <Quote className="h-8 w-8 text-blue-600/30" />
                      <div className="mt-3 flex gap-1">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star key={idx} className="h-4 w-4 fill-current text-brand-amber" />
                        ))}
                      </div>
                      <p className="mt-4 text-sm text-slate-600 leading-relaxed font-medium">{t.quote}</p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-ink">{t.name}</p>
                        <p className="text-xs text-blue-600 font-semibold">{t.role}</p>
                      </div>
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
              <div className="rounded-3xl bg-ink px-8 py-16 text-center relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white relative z-10">Ready to start your transformation?</h2>
                <p className="mt-4 text-slate-300 max-w-xl mx-auto text-base font-medium relative z-10">Build your first plan in minutes. No equipment list too small, no goal too big.</p>
                <Link
                  href="/register"
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-blue-600 px-9 py-4 text-base font-bold text-white hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/30 relative z-10 group"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-ink text-slate-400 py-12 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 pb-8 border-b border-white/10">
              <Link href="/" className="flex items-center gap-2 group">
                <BrandMark className="h-6 w-6 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-xl font-extrabold text-white tracking-tight">Strive</span>
              </Link>
              <div className="flex gap-8 text-sm font-semibold">
                <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
                <Link href="/#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
                <Link href="/login" className="hover:text-white transition-colors">Login</Link>
              </div>
            </div>
            <div className="pt-8 text-sm text-center md:text-left flex flex-col sm:flex-row justify-between items-center gap-4">
              <p>&copy; 2026 Strive Fitness. All rights reserved.</p>
              <p className="text-xs text-slate-500 font-medium">Empowering your personal fitness journey.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
