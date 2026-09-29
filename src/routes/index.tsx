import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, BookOpen, Check, ChevronRight, Play, RouteIcon, Target, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Skill Bridge | AI Career Readiness" },
      { name: "description", content: "Measure your skill gaps and follow a personalized learning roadmap toward your target role." },
      { property: "og:title", content: "Skill Bridge | AI Career Readiness" },
      { property: "og:description", content: "Turn skill gaps into a focused, personalized path to job readiness." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type View = "Overview" | "Roadmap" | "Skills" | "Reports";

const skills = [
  { label: "Prompt & LLM design", current: 78, target: 90 },
  { label: "Experiment design", current: 61, target: 85 },
  { label: "Model evals & metrics", current: 44, target: 80 },
  { label: "Stakeholder storytelling", current: 82, target: 88 },
];

const roadmap = [
  ["Model evaluation fundamentals", "Week 1 · 3h · High impact"],
  ["A/B testing for AI features", "Week 2 · 4h · High impact"],
  ["Writing AI product specs", "Week 3 · 2.5h · Medium impact"],
  ["Cost & latency trade-offs", "Week 4 · 3h · Medium impact"],
];

const days = [
  ["M", 40], ["T", 62], ["W", 52], ["T", 74], ["F", 30], ["S", 88], ["S", 58],
] as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{children}</p>;
}

function Panel({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <section className={`glass-panel animate-rise rounded-xl p-5 ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </section>
  );
}

function Overview({ onStart }: { onStart: () => void }) {
  return (
    <main className="mt-6 grid grid-cols-12 gap-4">
      <Panel className="col-span-12 md:col-span-4 lg:col-span-3">
        <SectionLabel>Job readiness</SectionLabel>
        <div className="mt-4 flex items-center gap-4">
          <div className="relative size-28 shrink-0">
            <svg viewBox="0 0 120 120" className="size-28 -rotate-90" aria-label="74 percent job ready">
              <circle cx="60" cy="60" r="52" fill="none" stroke="var(--progress-track)" strokeWidth="10" />
              <circle className="animate-ring" cx="60" cy="60" r="52" fill="none" stroke="var(--primary)" strokeWidth="10" strokeLinecap="round" strokeDasharray="327" strokeDashoffset="88" />
            </svg>
            <div className="absolute inset-0 grid place-items-center text-center">
              <p className="font-display text-3xl font-semibold leading-none">74<span className="text-base text-primary">%</span></p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-display text-lg font-semibold leading-tight">On track</p>
            <p className="text-xs leading-relaxed text-muted-foreground">12 weeks to target readiness</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 ring-1 ring-primary/25">
          <TrendingUp className="size-3.5 text-primary" aria-hidden="true" />
          <span className="text-[11px] font-medium text-primary">+6 pts this month</span>
        </div>
      </Panel>

      <Panel className="col-span-12 md:col-span-8 lg:col-span-6" delay={50}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><SectionLabel>Skill gap</SectionLabel><p className="mt-1 font-display text-base font-semibold">Current vs. AI PM target</p></div>
          <div className="flex items-center gap-4 text-[11px]"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />Current</span><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-foreground/25" />Target</span></div>
        </div>
        <div className="mt-5 space-y-4">
          {skills.map((skill, index) => (
            <div key={skill.label}>
              <div className="mb-1.5 flex justify-between gap-3 text-xs"><span className="text-foreground/90">{skill.label}</span><span className="shrink-0 text-muted-foreground">{skill.current} / {skill.target}</span></div>
              <div className="relative h-1.5 overflow-hidden rounded-full bg-progress-track">
                <div className="absolute h-full rounded-full bg-foreground/20" style={{ width: `${skill.target}%` }} />
                <div className="animate-bar relative h-full rounded-full bg-primary" style={{ width: `${skill.current}%`, animationDelay: `${100 + index * 100}ms` }} />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="col-span-12 bg-primary/10 ring-primary/30 md:col-span-8 lg:col-span-3" delay={100}>
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-primary">Recommended next</p>
        <p className="mt-3 font-display text-lg font-semibold leading-tight">Close the evals gap</p>
        <p className="mt-2 text-xs leading-relaxed text-foreground/70">Complete the model evaluation module to lift readiness by an estimated 4 points.</p>
        <Button className="mt-4 w-full gap-2 text-sm" onClick={onStart}><Play className="size-3.5 fill-current" />Start module</Button>
      </Panel>

      <RoadmapPanel />
      <ProgressPanel />
      <Panel className="col-span-12 md:col-span-5 lg:col-span-3" delay={250}>
        <SectionLabel>Momentum</SectionLabel>
        <div className="mt-4 space-y-4">
          {[['Streak', '9 days'], ['Modules done', '18'], ['Avg. session', '38 min']].map(([label, value]) => <div key={label} className="flex items-center justify-between"><span className="text-xs text-muted-foreground">{label}</span><span className="font-display text-lg font-semibold">{value}</span></div>)}
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">Next milestone</span><span className="text-xs font-medium text-primary">80% readiness</span></div>
        </div>
      </Panel>
    </main>
  );
}

function RoadmapPanel({ expanded = false }: { expanded?: boolean }) {
  return (
    <Panel className={`${expanded ? "col-span-12 lg:col-span-8" : "col-span-12 md:col-span-7 lg:col-span-5"}`} delay={150}>
      <div className="flex items-center justify-between"><SectionLabel>Prioritized roadmap</SectionLabel><span className="text-[11px] text-muted-foreground">12 weeks</span></div>
      <ol className={`mt-4 grid gap-3 ${expanded ? "md:grid-cols-2" : ""}`}>
        {roadmap.map(([title, meta], index) => (
          <li key={title} className="flex items-center gap-3 rounded-lg bg-surface-subtle p-3 ring-1 ring-border">
            <span className={`grid size-7 shrink-0 place-items-center rounded-md text-[11px] font-semibold ${index === 0 ? "bg-primary/15 text-primary" : "bg-surface-hover text-foreground/70"}`}>0{index + 1}</span>
            <div className="min-w-0"><p className="text-sm font-medium">{title}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{meta}</p></div>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

function ProgressPanel() {
  return (
    <Panel className="col-span-12 md:col-span-7 lg:col-span-4" delay={200}>
      <div className="flex items-center justify-between"><SectionLabel>Weekly progress</SectionLabel><span className="text-[11px] text-muted-foreground">Hours / week</span></div>
      <div className="mt-5 flex h-32 items-end gap-2">
        {days.map(([day, height], index) => <div key={`${day}-${index}`} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"><div className={`animate-column w-full rounded-t-md ${index === 5 ? "bg-primary" : "bg-primary/40"}`} style={{ height: `${height}%`, animationDelay: `${100 + index * 50}ms` }} /><span className={`text-[10px] ${index === 5 ? "text-primary" : "text-muted-foreground"}`}>{day}</span></div>)}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Best day: Saturday · 4.2h logged</p>
    </Panel>
  );
}

function FocusView({ view }: { view: Exclude<View, "Overview"> }) {
  if (view === "Roadmap") return <main className="mt-6 grid grid-cols-12 gap-4"><RoadmapPanel expanded /><Panel className="col-span-12 lg:col-span-4"><SectionLabel>Career milestone</SectionLabel><p className="mt-3 font-display text-2xl font-semibold">Portfolio-ready in 8 weeks</p><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Complete two applied projects and one product teardown to demonstrate measurable AI product judgment.</p></Panel></main>;
  if (view === "Skills") return <main className="mt-6 grid grid-cols-12 gap-4"><Panel className="col-span-12 lg:col-span-8"><SectionLabel>Skill intelligence</SectionLabel><h1 className="mt-2 font-display text-2xl font-semibold">Your strongest opportunities</h1><div className="mt-6 space-y-5">{skills.map(skill => <div key={skill.label} className="grid gap-2 md:grid-cols-[1fr_2fr_auto] md:items-center"><span className="text-sm">{skill.label}</span><div className="h-2 overflow-hidden rounded-full bg-progress-track"><div className="h-full rounded-full bg-primary" style={{ width: `${skill.current}%` }} /></div><span className="text-xs text-muted-foreground">Gap {skill.target-skill.current} pts</span></div>)}</div></Panel><Panel className="col-span-12 lg:col-span-4"><SectionLabel>Priority insight</SectionLabel><p className="mt-3 font-display text-xl font-semibold">Model evaluation is your leverage point.</p><p className="mt-3 text-sm leading-relaxed text-muted-foreground">It has the largest role gap and appears in 78% of matched AI product roles.</p></Panel></main>;
  return <main className="mt-6 grid grid-cols-12 gap-4"><ProgressPanel /><Panel className="col-span-12 md:col-span-5 lg:col-span-4"><SectionLabel>Learning velocity</SectionLabel><p className="mt-3 font-display text-4xl font-semibold">+18%</p><p className="mt-2 text-sm text-muted-foreground">Faster than your previous four-week average.</p></Panel><Panel className="col-span-12 lg:col-span-4"><SectionLabel>Completion forecast</SectionLabel><p className="mt-3 font-display text-2xl font-semibold">December 18</p><p className="mt-2 text-sm text-muted-foreground">Three days ahead of your target date.</p></Panel></main>;
}

function Index() {
  const [view, setView] = useState<View>("Overview");
  const [started, setStarted] = useState(false);
  const navIcons = { Overview: BarChart3, Roadmap: RouteIcon, Skills: Target, Reports: BookOpen };
  return (
    <div className="relative min-h-screen overflow-hidden bg-background font-body text-foreground antialiased selection:bg-primary/25">
      <div className="ambient-top pointer-events-none absolute -left-32 -top-40 size-[520px]" aria-hidden="true" />
      <div className="ambient-side pointer-events-none absolute -right-40 top-1/3 size-[460px]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1440px] px-4 py-5 sm:px-5 lg:px-8">
        <header className="flex items-center justify-between gap-3">
          <button className="flex items-center gap-3 text-left" onClick={() => setView("Overview")} aria-label="Open overview">
            <span className="grid size-9 place-items-center rounded-lg bg-primary/15 font-display text-sm font-semibold text-primary ring-1 ring-primary/30">SB</span>
            <span className="leading-tight"><span className="block font-display text-sm font-semibold">Skill Bridge</span><span className="block text-[11px] text-muted-foreground">Learner console</span></span>
          </button>
          <nav className="hidden items-center gap-1 rounded-lg bg-surface-subtle p-1 ring-1 ring-border md:flex" aria-label="Primary navigation">
            {(Object.keys(navIcons) as View[]).map(item => <Button key={item} variant="nav" aria-pressed={view === item} onClick={() => setView(item)} className={`text-xs ${view === item ? "bg-primary/15 text-primary" : ""}`}>{item}</Button>)}
          </nav>
          <div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-lg bg-surface-subtle px-3 py-2 ring-1 ring-border sm:flex"><span className="text-[11px] text-muted-foreground">Target role</span><span className="text-xs font-medium">AI Product Manager</span></div><button className="grid size-9 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary ring-1 ring-primary/30" aria-label="Open Maya's profile">MR</button></div>
        </header>
        <div className="mt-6 flex items-end justify-between gap-4"><div><p className="text-xs text-primary">AI-guided career plan</p><h1 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">{view === "Overview" ? "Good morning, Maya" : view}</h1></div><p className="hidden text-right text-xs text-muted-foreground sm:block">Last assessment updated today<br/><span className="text-foreground/80">4 skills analyzed</span></p></div>
        {view === "Overview" ? <Overview onStart={() => setStarted(true)} /> : <FocusView view={view} />}
        <nav className="glass-panel fixed inset-x-3 bottom-3 z-20 grid grid-cols-4 rounded-xl p-1 md:hidden" aria-label="Mobile navigation">{(Object.keys(navIcons) as View[]).map(item => { const Icon = navIcons[item]; return <Button key={item} variant="nav" aria-label={item} aria-pressed={view === item} onClick={() => setView(item)} className={`min-h-12 flex-col gap-1 px-1 text-[10px] ${view === item ? "bg-primary/15 text-primary" : ""}`}><Icon className="size-4" />{item}</Button>; })}</nav>
      </div>
      {started && <div className="fixed inset-0 z-30 grid place-items-center bg-background/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="module-title"><div className="glass-panel w-full max-w-md rounded-xl p-6"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary"><Check className="size-5" /></div><SectionLabel>Module queued</SectionLabel><h2 id="module-title" className="mt-2 font-display text-2xl font-semibold">Model evaluation fundamentals</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Your 38-minute first lesson is ready. Progress will count toward this week’s goal.</p><div className="mt-6 flex gap-3"><Button className="flex-1 gap-2" onClick={() => setStarted(false)}>Begin lesson<ChevronRight className="size-4" /></Button><Button variant="quiet" onClick={() => setStarted(false)}>Not now</Button></div></div></div>}
    </div>
  );
}