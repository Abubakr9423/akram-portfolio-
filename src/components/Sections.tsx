import { profile, projects, services, skills } from "@/content";
import Reveal from "./Reveal";

function Eyebrow({ children }: { children: string }) {
  return <p className="mb-6 text-[10px] uppercase tracking-[0.3em] text-white/40">{children}</p>;
}

export function Marquee() {
  const row = [...skills, ...skills];
  return (
    <div className="relative overflow-hidden border-y border-white/10 py-5 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
      <div className="marquee flex w-max gap-10">
        {row.map((s, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-2xl text-white/25 md:text-4xl">
            {s}
            <span className="text-sm text-white/40">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function About() {
  return (
    <section id="about" className="mx-auto grid max-w-6xl gap-12 px-5 py-28 md:grid-cols-[1fr_1.1fr] md:px-10 md:py-40">
      <Reveal>
        <Eyebrow>About me</Eyebrow>
        <h2 className="silver font-display text-[clamp(4.5rem,13vw,10rem)] leading-[0.85]">Intro</h2>
      </Reveal>
      <Reveal delay={120} className="self-end">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 text-[1.05rem] leading-relaxed text-white/60 md:p-9">
          <p>
            Hey, I&apos;m <strong className="font-semibold text-white">{profile.fullName.split(" ")[0]}.</strong> {profile.about}
          </p>
          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
            {profile.stats.map((s) => (
              <div key={s.label}>
                <dt className="font-display text-2xl text-white md:text-3xl">{s.value}</dt>
                <dd className="mt-1 text-xs text-white/40">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Reveal>
    </section>
  );
}

export function Services() {
  return (
    <section id="service" className="mx-auto max-w-6xl px-5 py-24 md:px-10">
      <Reveal>
        <Eyebrow>Service</Eyebrow>
        <h2 className="silver font-display text-[clamp(3rem,8vw,6rem)] leading-[0.9]">What I do</h2>
      </Reveal>
      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {services.map((s, i) => (
          <Reveal key={s.title} delay={i * 100}>
            <article className="group h-full rounded-2xl border border-white/10 bg-white/[0.02] p-7 transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.04]">
              <span className="font-mono text-xs text-white/30">0{i + 1}</span>
              <h3 className="mt-10 text-xl font-semibold text-white">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/50">{s.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Projects() {
  return (
    <section id="project" className="mx-auto max-w-6xl px-5 py-24 md:px-10">
      <Reveal>
        <Eyebrow>Project</Eyebrow>
        <h2 className="silver font-display text-[clamp(3rem,8vw,6rem)] leading-[0.9]">Selected work</h2>
      </Reveal>
      <ul className="mt-14 border-t border-white/10">
        {projects.map((p, i) => (
          <Reveal key={p.name} delay={i * 60}>
            <li className="border-b border-white/10">
              <a href={p.href} className="group flex items-baseline justify-between gap-6 py-7 transition-colors hover:text-white">
                <span className="font-display text-[clamp(1.6rem,4vw,3rem)] text-white/80 transition-transform duration-300 group-hover:translate-x-3 group-hover:text-white">
                  {p.name}
                </span>
                <span className="flex shrink-0 gap-6 text-xs uppercase tracking-[0.15em] text-white/40">
                  <span className="hidden sm:inline">{p.kind}</span>
                  <span>{p.year}</span>
                </span>
              </a>
            </li>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

export function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-6xl px-5 pb-12 pt-32 md:px-10">
      <Reveal>
        <Eyebrow>Contact</Eyebrow>
        <h2 className="silver font-display text-[clamp(3rem,10vw,8rem)] leading-[0.88]">
          Let&apos;s build
          <br />
          something.
        </h2>
        <a
          href={`mailto:${profile.email}`}
          className="mt-10 inline-block border-b border-white/30 pb-1 text-lg text-white/80 transition hover:border-white hover:text-white md:text-2xl"
        >
          {profile.email}
        </a>
      </Reveal>
      <footer className="mt-28 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
        <span>
          © 2026 {profile.fullName} · {profile.location}
        </span>
        <span className="flex gap-6">
          {profile.socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="transition hover:text-white">
              {s.label}
            </a>
          ))}
        </span>
      </footer>
    </section>
  );
}
