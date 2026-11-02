import { useRef, useState } from "react";
import { site } from "../config/site.js";

const { experience, education, projects, skills } = site.resume;

const TABS = [
  { id: "experience", label: "Experience", show: experience.length > 0 },
  { id: "education", label: "Education", show: education.length > 0 },
  { id: "projects", label: "Projects", show: projects.length > 0 },
  { id: "skills", label: "Skills", show: skills.length > 0 },
].filter((t) => t.show);

function Bullets({ items }) {
  if (!items.length) return null;
  return (
    <ul className="mt-3 space-y-2">
      {items.map((b) => (
        <li key={b} className="flex gap-3 leading-relaxed">
          <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rotate-45 bg-gold" />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

// Heading row shared by jobs, schools and projects: title on the left, meta on the right
function EntryHeader({ title, place, meta }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <h3 className="font-display text-xl font-bold">
        {title}
        {place && <span className="font-sans text-base font-normal text-muted"> · {place}</span>}
      </h3>
      {meta && <p className="text-sm font-medium whitespace-nowrap text-gold-ink">{meta}</p>}
    </div>
  );
}

// Vertical gold line with a marker per entry, like a resume timeline
function Timeline({ children }) {
  return <ol className="relative space-y-10 border-l border-gold/40 pl-6">{children}</ol>;
}

function TimelineItem({ children }) {
  return (
    <li className="relative">
      <span aria-hidden="true" className="absolute top-2 -left-[29px] size-2.5 rounded-full border-2 border-gold bg-page" />
      {children}
    </li>
  );
}

function ExperiencePanel() {
  return (
    <Timeline>
      {experience.map((job) => (
        <TimelineItem key={job.company + job.dates}>
          <EntryHeader title={job.company} place={job.location} meta={job.dates} />
          {job.roles.map((role) => (
            <p key={role} className="mt-1 text-muted italic">
              {role}
            </p>
          ))}
          <Bullets items={job.bullets} />
        </TimelineItem>
      ))}
    </Timeline>
  );
}

function EducationPanel() {
  return (
    <Timeline>
      {education.map((school) => (
        <TimelineItem key={school.school}>
          <EntryHeader title={school.school} place={school.location} meta={school.dates} />
          <p className="mt-1 text-muted italic">{school.degree}</p>
          <Bullets items={school.details} />
        </TimelineItem>
      ))}
    </Timeline>
  );
}

function ProjectsPanel() {
  return (
    <div className="grid gap-4">
      {projects.map((p) => (
        <article key={p.name} className="rounded-xl border border-line bg-surface p-5">
          <EntryHeader title={p.name} meta={p.tech} />
          <Bullets items={p.bullets} />
        </article>
      ))}
    </div>
  );
}

function SkillsPanel() {
  return (
    <dl className="space-y-6">
      {skills.map((group) => (
        <div key={group.label}>
          <dt className="mb-2 text-xs font-semibold tracking-[0.2em] text-gold-ink uppercase">{group.label}</dt>
          <dd className="flex flex-wrap gap-2">
            {group.items.map((item) => (
              <span key={item} className="rounded-full border border-line-strong bg-surface px-3 py-1 text-sm">
                {item}
              </span>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}

const PANELS = { experience: ExperiencePanel, education: EducationPanel, projects: ProjectsPanel, skills: SkillsPanel };

export default function ResumeTabs() {
  const [active, setActive] = useState(TABS[0]?.id);
  const tabRefs = useRef({});
  if (!TABS.length) return null;

  // Left/right arrows move between tabs (standard keyboard pattern for tablists)
  function onKeyDown(e) {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const i = TABS.findIndex((t) => t.id === active);
    const next = TABS.at((i + step) % TABS.length);
    setActive(next.id);
    tabRefs.current[next.id]?.focus();
  }

  const Panel = PANELS[active];

  return (
    <div>
      <div role="tablist" aria-label="Resume" onKeyDown={onKeyDown} className="flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((t) => {
          const selected = t.id === active;
          return (
            <button
              key={t.id}
              ref={(el) => (tabRefs.current[t.id] = el)}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(t.id)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition ${
                selected ? "border-gold text-gold-ink" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={`panel-${active}`} aria-labelledby={`tab-${active}`} className="pt-8">
        <Panel />
      </div>
    </div>
  );
}
