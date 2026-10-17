"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  delay: number;
  bucket: number;
  arrived: boolean;
  // Direction this particle drifts when the hero is scrolled away.
  sx: number;
  sy: number;
};

type Dust = { x: number; y: number; vx: number; vy: number; a: number; s: number };

const BUCKETS = 8;
const ASSEMBLE_MS = 2200;

/**
 * Samples the portrait's pixels and rebuilds it from particles that fly in
 * from a cloud of dust. Particles are pushed away by the pointer.
 */
export default function ParticlePortrait({ src, start }: { src: string; start: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startRef = useRef(start);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = start;
  }, [start]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let particles: Particle[] = [];
    let dust: Dust[] = [];
    let w = 0;
    let h = 0;
    let gap = 3;
    let raf = 0;
    let visible = true;
    const pointer = { x: -9999, y: -9999 };
    const img = new Image();

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Portrait sits bottom-centre, filling most of the hero's height.
      // Raised so the face sits above the headline.
      const size = Math.min(h * 1.0, w * 1.1);
      const ox = (w - size) / 2;
      const oy = h - size * 0.97;
      gap = size > 1000 ? 3 : 2.5;

      const cols = Math.floor(size / gap);
      const off = document.createElement("canvas");
      off.width = cols;
      off.height = cols;
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return;
      octx.drawImage(img, 0, 0, cols, cols);
      const data = octx.getImageData(0, 0, cols, cols).data;

      particles = [];
      for (let row = 0; row < cols; row++) {
        for (let col = 0; col < cols; col++) {
          const i = (row * cols + col) * 4;
          const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          // Contrast curve: drop the black backdrop, boost highlights.
          const v = Math.pow(Math.max(0, (lum - 22) / 233), 0.8);
          if (v < 0.06) continue;
          // A little jitter turns the pixel grid into film-like grain.
          const tx = ox + col * gap + (Math.random() - 0.5) * gap * 0.6;
          const ty = oy + row * gap + (Math.random() - 0.5) * gap * 0.6;
          const angle = Math.random() * Math.PI * 2;
          const r = Math.max(w, h) * (0.15 + Math.random() * 0.6);
          particles.push({
            tx,
            ty,
            x: reduced ? tx : w / 2 + Math.cos(angle) * r,
            y: reduced ? ty : h * 0.55 + Math.sin(angle) * r * 0.6,
            vx: 0,
            vy: 0,
            // Assemble roughly top-down with noise, like the reference.
            delay: (row / cols) * 0.45 + Math.random() * 0.35,
            bucket: Math.min(BUCKETS - 1, Math.floor(v * BUCKETS)),
            arrived: reduced,
            sx: Math.cos(angle) * (0.4 + Math.random()),
            sy: Math.sin(angle) * (0.4 + Math.random()) - 0.6,
          });
        }
      }

      dust = Array.from({ length: Math.round((w * h) / 5000) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        a: 0.15 + Math.random() * 0.5,
        s: Math.random() < 0.85 ? 1 : 1.6,
      }));
    };

    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);

      // Ambient dust always drifts; it brightens once the portrait starts.
      const on = startRef.current || reduced;
      if (on && startedAt.current === null) startedAt.current = now;
      const elapsed = startedAt.current === null ? 0 : now - startedAt.current;
      const dustAlpha = on ? Math.min(1, elapsed / 800) : 0;

      if (dustAlpha > 0) {
        ctx.fillStyle = "#fff";
        for (const d of dust) {
          d.x = (d.x + d.vx + w) % w;
          d.y = (d.y + d.vy + h) % h;
          ctx.globalAlpha = d.a * dustAlpha;
          ctx.fillRect(d.x, d.y, d.s, d.s);
        }
        ctx.globalAlpha = 1;
      }
      if (!on) return;

      const progress = elapsed / ASSEMBLE_MS;
      const paths: Path2D[] = Array.from({ length: BUCKETS }, () => new Path2D());
      const radius = 90;
      const dot = gap * 0.7;
      const scatter = Math.pow(Math.min(1, window.scrollY / h), 1.4) * h * 0.7;

      for (const p of particles) {
        if (!p.arrived) {
          const t = Math.min(1, Math.max(0, (progress - p.delay) / 0.55));
          if (t <= 0) {
            // Still part of the dust cloud: show faintly where it waits.
            if (Math.random() < 0.02) paths[0].rect(p.x, p.y, 1, 1);
            continue;
          }
          const e = ease(t);
          p.x += (p.tx - p.x) * e * 0.35;
          p.y += (p.ty - p.y) * e * 0.35;
          if (t >= 1 && Math.abs(p.tx - p.x) < 0.5 && Math.abs(p.ty - p.y) < 0.5) {
            p.x = p.tx;
            p.y = p.ty;
            p.arrived = true;
          }
        } else {
          // Spring back home, get pushed by the pointer.
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < radius * radius) {
            const dist = Math.sqrt(dist2) || 1;
            const force = (1 - dist / radius) * 2.2;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
          p.vx += (p.tx + p.sx * scatter - p.x) * 0.06;
          p.vy += (p.ty + p.sy * scatter - p.y) * 0.06;
          p.vx *= 0.82;
          p.vy *= 0.82;
          p.x += p.vx;
          p.y += p.vy;
        }
        paths[p.bucket].rect(p.x, p.y, dot, dot);
      }

      for (let b = 0; b < BUCKETS; b++) {
        const v = (b + 1) / BUCKETS;
        ctx.fillStyle = `rgba(${Math.round(200 + 55 * v)},${Math.round(205 + 50 * v)},255,${0.25 + v * 0.75})`;
        ctx.fill(paths[b]);
      }
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    // Click sends a shockwave through the portrait.
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      if (cy < 0 || cy > h) return;
      for (const p of particles) {
        if (!p.arrived) continue;
        const dx = p.x - cx;
        const dy = p.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = Math.max(0, 1 - dist / 320) * 26;
        p.vx += (dx / dist) * force * (0.6 + Math.random() * 0.8);
        p.vy += (dy / dist) * force * (0.6 + Math.random() * 0.8);
      }
    };
    const onLeave = () => {
      pointer.x = pointer.y = -9999;
    };

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        build();
        for (const p of particles) {
          p.x = p.tx;
          p.y = p.ty;
          p.arrived = true;
        }
      }, 150);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);

    img.onload = () => {
      build();
      raf = requestAnimationFrame(frame);
    };
    img.src = src;

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [src]);

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />;
}
