"use client";

import { useEffect, useRef } from "react";

/** Dot + trailing ring; the ring swells over links. Mouse/trackpad only. */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.documentElement.classList.add("has-cursor");

    const pos = { x: -100, y: -100 };
    const trail = { x: -100, y: -100 };
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      const overLink = (e.target as Element | null)?.closest("a, button");
      ring.current?.classList.toggle("is-hover", Boolean(overLink));
    };
    const tick = () => {
      trail.x += (pos.x - trail.x) * 0.18;
      trail.y += (pos.y - trail.y) * 0.18;
      if (dot.current) dot.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
      if (ring.current) ring.current.style.transform = `translate(${trail.x}px, ${trail.y}px)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden />
      <div ref={dot} className="cursor-dot" aria-hidden />
    </>
  );
}
