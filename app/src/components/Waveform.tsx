"use client";

const bars = [
  { h: 8, dur: 0.8, delay: 0 },
  { h: 22, dur: 0.7, delay: 0.1 },
  { h: 35, dur: 0.9, delay: 0.05 },
  { h: 18, dur: 1.1, delay: 0.2 },
  { h: 28, dur: 0.6, delay: 0 },
  { h: 40, dur: 0.8, delay: 0.15 },
  { h: 32, dur: 1.0, delay: 0.05 },
  { h: 44, dur: 0.7, delay: 0.1 },
  { h: 22, dur: 0.9, delay: 0.2 },
  { h: 36, dur: 0.8, delay: 0 },
  { h: 28, dur: 1.1, delay: 0.15 },
  { h: 16, dur: 0.6, delay: 0.05 },
  { h: 38, dur: 0.8, delay: 0.1 },
  { h: 24, dur: 0.9, delay: 0 },
  { h: 42, dur: 0.7, delay: 0.2 },
  { h: 30, dur: 1.0, delay: 0.05 },
  { h: 20, dur: 0.8, delay: 0.15 },
  { h: 34, dur: 0.6, delay: 0 },
  { h: 14, dur: 0.9, delay: 0.1 },
  { h: 26, dur: 0.8, delay: 0.2 },
];

export default function Waveform() {
  return (
    <div className="flex items-center gap-[3px] h-12 mb-5">
      {bars.map((bar, i) => (
        <div
          key={i}
          className="flex-1 bg-saffron rounded-sm opacity-70"
          style={{
            animation: `waveDance ${bar.dur}s ease-in-out infinite ${bar.delay}s alternate`,
            ["--h" as string]: `${bar.h}px`,
          }}
        />
      ))}
    </div>
  );
}
