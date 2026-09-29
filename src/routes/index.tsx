import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { BarChart3, BookOpen, Check, ChevronRight, LoaderCircle, Play, Plus, RouteIcon, Sparkles, Target, Trash2, TrendingUp } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Slider } from "../components/ui/slider";
import { createSkillAssessment } from "../lib/skill-assessment.functions";
import type { SkillAssessmentResult } from "../lib/skill-assessment.types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Skill Bridge | AI Career Readiness" },
      { name: "description", content: "Analyze your skill gaps and generate a personalized AI learning roadmap toward your target role." },
      { property: "og:title", content: "Skill Bridge | AI Career Readiness" },
      { property: "og:description", content: "Turn your current skills into an AI-personalized path to job readiness." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type View = "Overview" | "Roadmap" | "Skills" | "Reports";
type SkillEntry = { id: number; name: string; level: number };

const initialAssessment: SkillAssessmentResult = {
  targetRole: "AI Product Manager",
  summary: "You have strong product communication foundations. Building deeper model evaluation and experimentation skills will make your profile more competitive.",
  readinessScore: 74,
  estimatedWeeks: 12,
  gaps: [
    { skill: "Prompt & LLM design", current: 78, target: 90, priority: "Medium", reason: "Strengthen repeatable prompt evaluation patterns." },
    { skill: "Experiment design", current: 61, target: 85, priority: "High", reason: "AI product teams rely on well-designed experiments." },
    { skill: "Model evals & metrics", current: 44, target: 80, priority: "High", reason: "This is the largest gap for the target role." },
    { skill: "Stakeholder storytelling", current: 82, target: 88, priority: "Low", reason: "Your communication foundation is already strong." },
  ],
  roadmap: [
    { title: "Model evaluation fundamentals", weeks: "Week 1", duration: "3h / week", impact: "High", outcome: "Build a reliable evaluation scorecard." },
    { title: "A/B testing for AI features", weeks: "Week 2", duration: "4h / week", impact: "High", outcome: "Design an experiment with measurable success criteria." },
    { title: "Writing AI product specs", weeks: "Week 3", duration: "2.5h / week", impact: "Medium", outcome: "Create an implementation-ready product brief." },
    { title: "Cost & latency trade-offs", weeks: "Week 4", duration: "3h / week", impact: "Medium", outcome: "Defend a model and architecture choice." },
  ],
  recommendation: { title: "Close the evals gap", description: "Complete the model evaluation module to address your highest-impact opportunity.", readinessLift: 4 },
};

const defaultSkills: SkillEntry[] = [
  { id: 1, name: "Product strategy", level: 72 },
  { id: 2, name: "Prompt engineering", level: 58 },
  { id: 3, name: "Data analysis", level: 46 },
];

const days = [["M", 40], ["T", 62], ["W", 52], ["T", 74], ["F", 30], ["S", 88], ["S", 58]] as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{children}</p>;
}

function Panel({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return <section className={`glass-panel animate-rise rounded-xl p-5 ${className}`} style={{ animationDelay: `${delay}ms` }}>{children}</section>;
}

function ReadinessPanel({ assessment }: { assessment: SkillAssessmentResult }) {
  const circumference = 327;
  const offset = circumference - (circumference * assessment.readinessScore) / 100;
  return (
    <Panel className="col-span-12 md:col-span-4 lg:col-span-3">
      <SectionLabel>Job readiness</SectionLabel>
      <div className="mt-4 flex items-center gap-4">
        <div className="relative size-28 shrink-0">
          <svg viewBox="0 0 120 120" className="size-28 -rotate-90" aria-label={`${assessment.readinessScore} percent job ready`}>
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--progress-track)" strokeWidth="10" />
            <circle className="animate-ring" cx="60" cy="60" r="52" fill="none" stroke="var(--primary)" strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center"><p className="font-display text-3xl font-semibold leading-none">{assessment.readinessScore}<span className="text-base text-primary">%</span></p></div>
        </div>
        <div className="space-y-1"><p className="font-display text-lg font-semibold leading-tight">Personalized</p><p className="text-xs leading-relaxed text-muted-foreground">{assessment.estimatedWeeks} weeks to target readiness</p></div>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 ring-1 ring-primary/25"><TrendingUp className="size-3.5 text-primary" /><span className="text-[11px] font-medium text-primary">AI-assessed career fit</span></div>
    </Panel>
  );
}

function SkillGapPanel({ assessment, expanded = false }: { assessment: SkillAssessmentResult; expanded?: boolean }) {
  return (
    <Panel className={expanded ? "col-span-12 lg:col-span-8" : "col-span-12 md:col-span-8 lg:col-span-6"} delay={50}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><SectionLabel>Skill gap</SectionLabel><p className="mt-1 font-display text-base font-semibold">Current vs. {assessment.targetRole} target</p></div>
        <div className="flex items-center gap-4 text-[11px]"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />Current</span><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-foreground/25" />Target</span></div>
      </div>
      <div className="mt-5 space-y-4">
        {assessment.gaps.map((gap, index) => (
          <div key={gap.skill}>
            <div className="mb-1.5 flex justify-between gap-3 text-xs"><span className="text-foreground/90">{gap.skill}</span><span className="shrink-0 text-muted-foreground">{gap.current} / {gap.target}</span></div>
            <div className="relative h-1.5 overflow-hidden rounded-full bg-progress-track"><div className="absolute h-full rounded-full bg-foreground/20" style={{ width: `${gap.target}%` }} /><div className="animate-bar relative h-full rounded-full bg-primary" style={{ width: `${gap.current}%`, animationDelay: `${100 + index * 100}ms` }} /></div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function RoadmapPanel({ assessment, expanded = false }: { assessment: SkillAssessmentResult; expanded?: boolean }) {
  return (
    <Panel className={expanded ? "col-span-12 lg:col-span-8" : "col-span-12 md:col-span-7 lg:col-span-5"} delay={150}>
      <div className="flex items-center justify-between"><SectionLabel>Prioritized roadmap</SectionLabel><span className="text-[11px] text-muted-foreground">{assessment.estimatedWeeks} weeks</span></div>
      <ol className={`mt-4 grid gap-3 ${expanded ? "md:grid-cols-2" : ""}`}>
        {assessment.roadmap.map((step, index) => (
          <li key={`${step.title}-${index}`} className="flex items-start gap-3 rounded-lg bg-surface-subtle p-3 ring-1 ring-border">
            <span className={`grid size-7 shrink-0 place-items-center rounded-md text-[11px] font-semibold ${index === 0 ? "bg-primary/15 text-primary" : "bg-surface-hover text-foreground/70"}`}>0{index + 1}</span>
            <div className="min-w-0"><p className="text-sm font-medium">{step.title}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{step.weeks} · {step.duration} · {step.impact} impact</p>{expanded && <p className="mt-2 text-xs leading-relaxed text-foreground/70">{step.outcome}</p>}</div>
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
      <div className="mt-5 flex h-32 items-end gap-2">{days.map(([day, height], index) => <div key={`${day}-${index}`} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"><div className={`animate-column w-full rounded-t-md ${index === 5 ? "bg-primary" : "bg-primary/40"}`} style={{ height: `${height}%`, animationDelay: `${100 + index * 50}ms` }} /><span className={`text-[10px] ${index === 5 ? "text-primary" : "text-muted-foreground"}`}>{day}</span></div>)}</div>
      <p className="mt-4 text-xs text-muted-foreground">Best day: Saturday · 4.2h logged</p>
    </Panel>
  );
}

function Overview({ assessment, onStart }: { assessment: SkillAssessmentResult; onStart: () => void }) {
  return (
    <main className="mt-6 grid grid-cols-12 gap-4">
      <ReadinessPanel assessment={assessment} />
      <SkillGapPanel assessment={assessment} />
      <Panel className="col-span-12 bg-primary/10 ring-primary/30 md:col-span-8 lg:col-span-3" delay={100}>
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-primary">Recommended next</p>
        <p className="mt-3 font-display text-lg font-semibold leading-tight">{assessment.recommendation.title}</p>
        <p className="mt-2 text-xs leading-relaxed text-foreground/70">{assessment.recommendation.description} Estimated lift: {assessment.recommendation.readinessLift} points.</p>
        <Button className="mt-4 w-full gap-2 text-sm" onClick={onStart}><Play className="size-3.5 fill-current" />Start module</Button>
      </Panel>
      <RoadmapPanel assessment={assessment} />
      <ProgressPanel />
      <Panel className="col-span-12 md:col-span-5 lg:col-span-3" delay={250}><SectionLabel>AI insight</SectionLabel><p className="mt-3 text-sm leading-relaxed text-foreground/80">{assessment.summary}</p><div className="mt-4 h-px bg-border" /><p className="mt-4 text-xs text-muted-foreground">Highest priority</p><p className="mt-1 text-sm font-medium text-primary">{assessment.gaps[0]?.skill ?? "Assessment complete"}</p></Panel>
    </main>
  );
}

function FocusView({ view, assessment }: { view: Exclude<View, "Overview">; assessment: SkillAssessmentResult }) {
  if (view === "Roadmap") return <main className="mt-6 grid grid-cols-12 gap-4"><RoadmapPanel assessment={assessment} expanded /><Panel className="col-span-12 lg:col-span-4"><SectionLabel>Career outcome</SectionLabel><p className="mt-3 font-display text-2xl font-semibold">Job-ready foundation in {assessment.estimatedWeeks} weeks</p><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{assessment.summary}</p></Panel></main>;
  if (view === "Skills") return <main className="mt-6 grid grid-cols-12 gap-4"><SkillGapPanel assessment={assessment} expanded /><Panel className="col-span-12 lg:col-span-4"><SectionLabel>Priority insight</SectionLabel><p className="mt-3 font-display text-xl font-semibold">{assessment.gaps[0]?.skill ?? "Your next opportunity"}</p><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{assessment.gaps[0]?.reason ?? assessment.summary}</p></Panel></main>;
  return <main className="mt-6 grid grid-cols-12 gap-4"><ProgressPanel /><Panel className="col-span-12 md:col-span-5 lg:col-span-4"><SectionLabel>Current readiness</SectionLabel><p className="mt-3 font-display text-4xl font-semibold">{assessment.readinessScore}%</p><p className="mt-2 text-sm text-muted-foreground">Measured against the capabilities expected for {assessment.targetRole}.</p></Panel><Panel className="col-span-12 lg:col-span-4"><SectionLabel>Plan horizon</SectionLabel><p className="mt-3 font-display text-2xl font-semibold">{assessment.estimatedWeeks} weeks</p><p className="mt-2 text-sm text-muted-foreground">Your AI-generated path prioritizes {assessment.roadmap.length} practical learning steps.</p></Panel></main>;
}

function AssessmentDialog({ open, onOpenChange, onComplete }: { open: boolean; onOpenChange: (open: boolean) => void; onComplete: (result: SkillAssessmentResult) => void }) {
  const assess = useServerFn(createSkillAssessment);
  const [targetRole, setTargetRole] = useState("AI Product Manager");
  const [skills, setSkills] = useState<SkillEntry[]>(defaultSkills);
  const [nextId, setNextId] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
+
+  const updateSkill = (id: number, update: Partial<SkillEntry>) => setSkills((items) => items.map((item) => item.id === id ? { ...item, ...update } : item));
+  const addSkill = () => { setSkills((items) => [...items, { id: nextId, name: "", level: 50 }]); setNextId((id) => id + 1); };
+  const removeSkill = (id: number) => setSkills((items) => items.filter((item) => item.id !== id));
+
+  const submit = async (event: FormEvent) => {
+    event.preventDefault();
+    const cleanSkills = skills.filter((skill) => skill.name.trim());
+    if (targetRole.trim().length < 2 || cleanSkills.length === 0) { setError("Enter a target role and at least one current skill."); return; }
+    setError("");
+    setIsGenerating(true);
+    try {
+      const response = await assess({ data: { targetRole: targetRole.trim(), skills: cleanSkills.map(({ name, level }) => ({ name: name.trim(), level })) } });
+      if (!response.ok) { setError(response.error); return; }
+      onComplete(response.assessment);
+      onOpenChange(false);
+    } catch {
+      setError("The assessment could not be generated right now. Your entries are still here—please try again.");
+    } finally { setIsGenerating(false); }
+  };
+
+  return (
+    <Dialog open={open} onOpenChange={(next) => !isGenerating && onOpenChange(next)}>
+      <DialogContent className="glass-panel max-h-[92vh] max-w-2xl overflow-y-auto border-border bg-popover p-0 sm:rounded-xl">
+        <form onSubmit={submit}>
+          <DialogHeader className="border-b border-border p-5 pr-12 sm:p-6">
+            <div className="mb-1 flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/25"><Sparkles className="size-5" /></div>
+            <DialogTitle className="font-display text-2xl">Build your AI roadmap</DialogTitle>
+            <DialogDescription>Share where you are now and where you want to go. Your plan will update across the dashboard.</DialogDescription>
+          </DialogHeader>
+          <div className="space-y-6 p-5 sm:p-6">
+            <div><label htmlFor="target-role" className="text-xs font-medium text-foreground">Target job role</label><Input id="target-role" value={targetRole} onChange={(event) => setTargetRole(event.target.value)} placeholder="e.g. Machine Learning Engineer" className="mt-2 h-11 bg-surface-subtle" disabled={isGenerating} /></div>
+            <div>
+              <div className="flex items-center justify-between"><div><p className="text-xs font-medium text-foreground">Current skills</p><p className="mt-1 text-[11px] text-muted-foreground">Rate your current confidence from 0 to 100.</p></div><Button type="button" variant="quiet" size="sm" onClick={addSkill} disabled={isGenerating || skills.length >= 12}><Plus className="size-3.5" />Add skill</Button></div>
+              <div className="mt-4 space-y-3">
+                {skills.map((skill, index) => (
+                  <div key={skill.id} className="rounded-lg bg-surface-subtle p-3 ring-1 ring-border">
+                    <div className="flex items-center gap-2"><Input aria-label={`Skill ${index + 1}`} value={skill.name} onChange={(event) => updateSkill(skill.id, { name: event.target.value })} placeholder="Skill name" className="h-9 border-0 bg-transparent px-1 shadow-none" disabled={isGenerating} /><Button type="button" variant="ghost" size="icon" aria-label={`Remove ${skill.name || `skill ${index + 1}`}`} onClick={() => removeSkill(skill.id)} disabled={isGenerating || skills.length === 1} className="size-8 text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></Button></div>
+                    <div className="mt-3 grid grid-cols-[1fr_3rem] items-center gap-4"><Slider aria-label={`${skill.name || `Skill ${index + 1}`} proficiency`} min={0} max={100} step={5} value={[skill.level]} onValueChange={([value]) => updateSkill(skill.id, { level: value ?? skill.level })} disabled={isGenerating} /><span className="rounded-md bg-background/50 py-1 text-center text-xs font-medium text-primary">{skill.level}</span></div>
+                  </div>
+                ))}
+              </div>
+            </div>
+            {error && <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs leading-relaxed text-destructive-foreground">{error}</div>}
+          </div>
+          <div className="flex flex-col-reverse gap-2 border-t border-border p-5 sm:flex-row sm:justify-end sm:p-6"><Button type="button" variant="quiet" onClick={() => onOpenChange(false)} disabled={isGenerating}>Cancel</Button><Button type="submit" className="min-w-44" disabled={isGenerating}>{isGenerating ? <><LoaderCircle className="size-4 animate-spin" />Analyzing your skills…</> : <><Sparkles className="size-4" />Generate roadmap</>}</Button></div>
+        </form>
+      </DialogContent>
+    </Dialog>
+  );
+}
+
+function Index() {
+  const [view, setView] = useState<View>("Overview");
+  const [started, setStarted] = useState(false);
+  const [assessmentOpen, setAssessmentOpen] = useState(false);
+  const [assessment, setAssessment] = useState(initialAssessment);
+  const [generated, setGenerated] = useState(false);
+  const navIcons = { Overview: BarChart3, Roadmap: RouteIcon, Skills: Target, Reports: BookOpen };
+  const completeAssessment = (result: SkillAssessmentResult) => { setAssessment(result); setGenerated(true); setView("Overview"); };
+
+  return (
+    <div className="relative min-h-screen overflow-hidden bg-background pb-20 font-body text-foreground antialiased selection:bg-primary/25 md:pb-0">
+      <div className="ambient-top pointer-events-none absolute -left-32 -top-40 size-[520px]" aria-hidden="true" /><div className="ambient-side pointer-events-none absolute -right-40 top-1/3 size-[460px]" aria-hidden="true" />
+      <div className="relative mx-auto max-w-[1440px] px-4 py-5 sm:px-5 lg:px-8">
+        <header className="flex items-center justify-between gap-3">
+          <Button variant="ghost" className="h-auto justify-start gap-3 p-0 hover:bg-transparent" onClick={() => setView("Overview")} aria-label="Open overview"><span className="grid size-9 place-items-center rounded-lg bg-primary/15 font-display text-sm font-semibold text-primary ring-1 ring-primary/30">SB</span><span className="text-left leading-tight"><span className="block font-display text-sm font-semibold">Skill Bridge</span><span className="block text-[11px] text-muted-foreground">Learner console</span></span></Button>
+          <nav className="hidden items-center gap-1 rounded-lg bg-surface-subtle p-1 ring-1 ring-border md:flex" aria-label="Primary navigation">{(Object.keys(navIcons) as View[]).map((item) => <Button key={item} variant="nav" aria-pressed={view === item} onClick={() => setView(item)} className={`text-xs ${view === item ? "bg-primary/15 text-primary" : ""}`}>{item}</Button>)}</nav>
+          <div className="flex items-center gap-2"><div className="hidden items-center gap-2 rounded-lg bg-surface-subtle px-3 py-2 ring-1 ring-border lg:flex"><span className="text-[11px] text-muted-foreground">Target role</span><span className="max-w-48 truncate text-xs font-medium">{assessment.targetRole}</span></div><Button size="sm" onClick={() => setAssessmentOpen(true)} className="gap-1.5"><Sparkles className="size-3.5" /><span className="hidden sm:inline">Build my roadmap</span><span className="sm:hidden">Assess</span></Button><Button variant="quiet" size="icon" className="rounded-full" aria-label="Open Maya's profile">MR</Button></div>
+        </header>
+        <div className="mt-6 flex items-end justify-between gap-4"><div><p className="text-xs text-primary">AI-guided career plan</p><h1 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">{view === "Overview" ? "Good morning, Maya" : view}</h1></div><p className="hidden text-right text-xs text-muted-foreground sm:block">{generated ? "AI assessment generated just now" : "Sample assessment"}<br/><span className="text-foreground/80">{assessment.gaps.length} skills analyzed</span></p></div>
+        {generated && <div className="mt-5 flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-xs text-primary"><Check className="size-4" />Your dashboard now reflects your personalized AI roadmap.</div>}
+        {view === "Overview" ? <Overview assessment={assessment} onStart={() => setStarted(true)} /> : <FocusView view={view} assessment={assessment} />}
+        <nav className="glass-panel fixed inset-x-3 bottom-3 z-20 grid grid-cols-4 rounded-xl p-1 md:hidden" aria-label="Mobile navigation">{(Object.keys(navIcons) as View[]).map((item) => { const Icon = navIcons[item]; return <Button key={item} variant="nav" aria-label={item} aria-pressed={view === item} onClick={() => setView(item)} className={`min-h-12 flex-col gap-1 px-1 text-[10px] ${view === item ? "bg-primary/15 text-primary" : ""}`}><Icon className="size-4" />{item}</Button>; })}</nav>
+      </div>
+      <AssessmentDialog open={assessmentOpen} onOpenChange={setAssessmentOpen} onComplete={completeAssessment} />
+      {started && <div className="fixed inset-0 z-30 grid place-items-center bg-background/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="module-title"><div className="glass-panel w-full max-w-md rounded-xl p-6"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary"><Check className="size-5" /></div><SectionLabel>Module queued</SectionLabel><h2 id="module-title" className="mt-2 font-display text-2xl font-semibold">{assessment.roadmap[0]?.title ?? "Your first learning module"}</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Your first lesson is ready. Progress will count toward this week’s goal.</p><div className="mt-6 flex gap-3"><Button className="flex-1 gap-2" onClick={() => setStarted(false)}>Begin lesson<ChevronRight className="size-4" /></Button><Button variant="quiet" onClick={() => setStarted(false)}>Not now</Button></div></div></div>}
+    </div>
+  );
+}
