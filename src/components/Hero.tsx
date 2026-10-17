"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { navLinks, profile } from "@/content";
import ParticlePortrait from "./ParticlePortrait";

type Phase = "spell" | "morph" | "settle" | "done";

const TARGET = "PORTFOLIO";
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&@";
const LETTER_MS = 170;
const MORPH_MS = 110;

const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

export default function Hero() {
  const name = profile.name.toUpperCase();
  const length = Math.max(name.length, TARGET.length);

  const [phase, setPhase] = useState<Phase>("spell");
  const [revealed, setRevealed] = useState(0);
  const [morph, setMorph] = useState({ step: -1, glyph: "" });
  const [dotX, setDotX] = useState<number | null>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const wordRef = useRef<HTMLSpanElement>(null);

  // Intro timeline: spell the name → morph to PORTFOLIO → settle into the hero.
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      at(0, () => {
        setRevealed(name.length);
        setMorph({ step: length, glyph: "" });
        setPhase("done");
      });
      return () => timers.forEach(clearTimeout);
    }

    let t = 800;
    for (let i = 1; i <= name.length; i++) at((t += LETTER_MS), () => setRevealed(i));
    t += 500;
    at(t, () => setPhase("morph"));
    for (let i = 0; i <= length; i++) {
      at((t += MORPH_MS), () => setMorph({ step: i, glyph: randomGlyph() }));
    }
    at((t += 450), () => setPhase("settle"));
    at(t + 1300, () => setPhase("done"));

    return () => timers.forEach(clearTimeout);
  }, [name, length]);

  // The dot rides just after the last revealed letter.
  useLayoutEffect(() => {
    const word = wordRef.current;
    if (!word) return;
    const last = letterRefs.current[revealed - 1];
    setDotX(last ? last.offsetLeft + last.offsetWidth + word.offsetHeight * 0.06 : word.offsetWidth / 2);
  }, [revealed]);

  const charAt = (i: number) => {
    if (phase === "spell") return name[i] ?? "";
    if (i < morph.step) return TARGET[i] ?? "";
    if (i === morph.step && i < length) return morph.glyph;
    return name[i] ?? "";
  };

  const settled = phase === "settle" || phase === "done";
  const spelling = phase === "spell";

  return (
    <section id="home" className="hero relative h-svh min-h-[560px] overflow-hidden" data-phase={phase}>
      {/* Spotlight behind the intro word */}
      <div className="intro-glow pointer-events-none absolute inset-0" />

      <ParticlePortrait src="/me.png" start={settled} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/70 to-transparent" />

      <nav className="hero-nav absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-5 md:px-10">
        <a href="#home" className="font-display text-sm tracking-[0.08em] md:text-base">
          {profile.fullName.toUpperCase()}
        </a>
        <ul className="hidden gap-7 text-[11px] uppercase tracking-[0.14em] text-white/70 sm:flex">
          {navLinks.map((l, i) => (
            <li key={l.href}>
              <a href={l.href} className={`nav-link ${i === 0 ? "is-active text-white" : ""}`}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <a href="#contact" className="text-[11px] uppercase tracking-[0.14em] sm:hidden">
          Contact
        </a>
      </nav>

      <h1 className={`headline font-display ${settled ? "is-settled" : ""}`} aria-label={`${profile.fullName} — Portfolio`}>
        <span ref={wordRef} className="relative inline-flex whitespace-nowrap" aria-hidden>
          {Array.from({ length }, (_, i) => {
            const ch = charAt(i);
            if (!ch) return null;
            const shown = !spelling || i < revealed;
            return (
              <span
                key={i}
                ref={(el) => {
                  letterRefs.current[i] = el;
                }}
                className={`letter ${shown ? "is-shown" : ""} ${i === morph.step ? "is-scrambling" : ""}`}
                style={{ "--i": i } as React.CSSProperties}
              >
                {ch}
              </span>
            );
          })}

          {dotX !== null && (
            <span className={`intro-dot ${spelling ? "" : "is-gone"}`} style={{ left: dotX }}>
              {revealed > 0 && <span key={revealed} className="intro-bar" />}
            </span>
          )}
        </span>

        <span className="hero-meta">
          <span className="font-sans text-[clamp(0.95rem,1.6vw,1.5rem)] tracking-tight">
            <strong className="font-semibold">{profile.role.strong}</strong>{" "}
            <em className="font-light">{profile.role.soft}</em>
          </span>
          <a
            href="#contact"
            className="pointer-events-auto rounded-full border border-white/15 bg-white/[0.03] px-5 py-2 font-sans text-xs italic tracking-wide text-white/80 backdrop-blur transition hover:border-white/40 hover:text-white"
          >
            Contact
          </a>
        </span>
      </h1>

      <a href="#about" className="hero-scroll absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-white/40">
        Scroll
      </a>
    </section>
  );
}
