"use client";

import { useEffect, useRef, forwardRef } from "react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AgentState =
  | "connecting"
  | "initializing"
  | "listening"
  | "thinking"
  | "speaking";

export type AuraSize = "icon" | "sm" | "md" | "lg" | "xl";

export interface AgentAudioVisualizerAuraProps
  extends React.ComponentProps<"div"> {
  size?: AuraSize;
  state?: AgentState;
  color?: `#${string}`;
  colorShift?: number;
  themeMode?: "light" | "dark" | string;
  audioTrack?: MediaStreamTrack | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SIZE_MAP: Record<AuraSize, number> = {
  icon: 56,
  sm:   96,
  md:  140,
  lg:  200,
  xl:  260,
};

// Neon palette: cyan → pink → purple → sky → cyan (loop)
const PALETTE = [
  "#00f0ff",
  "#c084fc",
  "#ff4df8",
  "#818cf8",
  "#06b6d4",
  "#00f0ff",
];

const STATE_CFG: Record<
  AgentState,
  { speed: number; baseWarp: number; strokeW: number; glow: number }
> = {
  connecting:   { speed: 0.5,  baseWarp: 0.03, strokeW: 3,   glow: 14 },
  initializing: { speed: 0.7,  baseWarp: 0.05, strokeW: 3,   glow: 16 },
  listening:    { speed: 1.0,  baseWarp: 0.08, strokeW: 3.5, glow: 18 },
  thinking:     { speed: 2.0,  baseWarp: 0.13, strokeW: 3.5, glow: 22 },
  speaking:     { speed: 3.0,  baseWarp: 0.20, strokeW: 4,   glow: 28 },
};

// ─── Component ────────────────────────────────────────────────────────────────

export const AgentAudioVisualizerAura = forwardRef<
  HTMLDivElement,
  AgentAudioVisualizerAuraProps
>(function AgentAudioVisualizerAura(
  {
    size = "lg",
    state = "connecting",
    color = "#1FD5F9",
    colorShift = 0.05,
    themeMode,
    audioTrack,
    className,
    ...props
  },
  ref
) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const animRef     = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timeDataRef = useRef<Uint8Array<ArrayBuffer>>(new Uint8Array(new ArrayBuffer(512)));
  const smoothRef   = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const px = SIZE_MAP[size];

  // ── Wire microphone track → AnalyserNode ──────────────────────────────────
  useEffect(() => {
    if (!audioTrack) { analyserRef.current = null; return; }

    const stream  = new MediaStream([audioTrack]);
    const audioCtx = new AudioContext();
    audioCtxRef.current = audioCtx;

    const source   = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.15; // very fast — near zero lag
    source.connect(analyser);

    analyserRef.current = analyser;
    timeDataRef.current = new Uint8Array(new ArrayBuffer(analyser.fftSize));

    return () => {
      source.disconnect();
      audioCtx.close();
      analyserRef.current = null;
    };
  }, [audioTrack]);

  // ── Render loop (re-runs when state/size/colorShift changes) ─────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width  = px * dpr;
    canvas.height = px * dpr;
    ctx.scale(dpr, dpr);

    const cx     = px / 2;
    const cy     = px / 2;
    const baseR  = px * 0.37;
    const SEGS   = 200; // smooth path
    const step   = (Math.PI * 2) / SEGS;

    function draw(ts: number) {
      if (!ctx) return;
      const t   = ts / 1000;
      const cfg = STATE_CFG[state];

      // ── Read mic level via time-domain RMS (zero FFT lag) ────────────────
      const analyser = analyserRef.current;
      if (analyser) {
        analyser.getByteTimeDomainData(timeDataRef.current);
        let sq = 0;
        for (let i = 0; i < timeDataRef.current.length; i++) {
          const v = (timeDataRef.current[i] - 128) / 128;
          sq += v * v;
        }
        const rms = Math.sqrt(sq / timeDataRef.current.length);
        // Punchy: fast attack, slow decay
        smoothRef.current = rms > smoothRef.current
          ? rms * 0.6 + smoothRef.current * 0.4
          : smoothRef.current * 0.88;
      } else {
        smoothRef.current *= 0.95;
      }

      // Clamp & amplify so even quiet speech is visible
      const audio = Math.min(smoothRef.current * 5, 1);
      const warp  = cfg.baseWarp + audio * 0.42;

      // ── STEP 1: Dark circular background (makes neon pop) ─────────────────
      ctx.clearRect(0, 0, px, px);

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, px * 0.5, 0, Math.PI * 2);
      ctx.clip();

      const bgGrad = ctx.createRadialGradient(cx, cy, px * 0.05, cx, cy, px * 0.5);
      bgGrad.addColorStop(0,   "rgba(4, 4, 16, 0.98)");
      bgGrad.addColorStop(0.6, "rgba(4, 4, 16, 0.95)");
      bgGrad.addColorStop(1,   "rgba(4, 4, 16, 0.85)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, px, px);
      ctx.restore();

      // ── STEP 2: Build organic ring path ───────────────────────────────────
      const noiseR = (a: number) =>
        baseR
        + Math.sin(a * 3 + t * cfg.speed)               * baseR * warp * 0.55
        + Math.sin(a * 5 - t * cfg.speed * 1.4 + 1.1)   * baseR * warp * 0.30
        + Math.sin(a * 8 + t * cfg.speed * 0.8 + 2.5)   * baseR * warp * 0.15
        + audio * Math.sin(a * 2 + t * 5)                * baseR * 0.18;

      ctx.beginPath();
      for (let i = 0; i <= SEGS; i++) {
        const a = i * step;
        const r = noiseR(a);
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();

      // ── STEP 3: Conic gradient — rainbow colour that rotates with state ───
      const colorAngle = ((t * cfg.speed * colorShift) % 1) * Math.PI * 2;
      const conicGrad  = ctx.createConicGradient(colorAngle, cx, cy);
      PALETTE.forEach((c, i) => conicGrad.addColorStop(i / (PALETTE.length - 1), c));

      // GLOW pass — wide, blurred halo (shadowBlur set ONCE on entire path)
      ctx.save();
      ctx.shadowColor  = color;
      ctx.shadowBlur   = cfg.glow + audio * 30; // reacts to voice!
      ctx.strokeStyle  = conicGrad;
      ctx.lineWidth    = cfg.strokeW * 3 + audio * 4;
      ctx.globalAlpha  = 0.55 + audio * 0.3;
      ctx.lineCap      = "round";
      ctx.lineJoin     = "round";
      ctx.stroke();
      ctx.restore();

      // CORE pass — thin crisp bright ring on top
      ctx.save();
      ctx.shadowBlur  = 0;
      ctx.strokeStyle = conicGrad;
      ctx.lineWidth   = cfg.strokeW + audio * 1.5;
      ctx.globalAlpha = 0.95;
      ctx.lineCap     = "round";
      ctx.lineJoin    = "round";
      ctx.stroke();
      ctx.restore();

      // WHITE SPINE — inner highlight for glass/neon feel
      ctx.save();
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.25 + audio * 0.35})`;
      ctx.lineWidth   = 1;
      ctx.globalAlpha = 1;
      ctx.stroke();
      ctx.restore();

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [px, state, color, colorShift, themeMode]);

  return (
    <div
      ref={ref}
      className={cn(
        "relative inline-flex items-center justify-center rounded-full",
        className
      )}
      style={{ width: px, height: px }}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="rounded-full"
        style={{ width: px, height: px }}
        aria-hidden
      />
    </div>
  );
});

AgentAudioVisualizerAura.displayName = "AgentAudioVisualizerAura";
