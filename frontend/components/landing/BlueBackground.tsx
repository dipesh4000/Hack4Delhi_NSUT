// components/landing/BlueBackground.tsx
"use client";

export default function BlueBackground() {
  return (
    <div className="absolute inset-0 z-0">
      {/* Base blue gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-100 via-blue-50 to-white" />

      {/* Top emphasis band (govt-style) */}
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-blue-200/70 to-transparent" />

      {/* Center radial blue wash */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2
                   w-[1000px] h-[700px]
                   bg-blue-300/40 rounded-full blur-3xl"
      />

      {/* Bottom calm blue */}
      <div
        className="absolute bottom-0 right-0
                   w-[800px] h-[500px]
                   bg-sky-200/40 rounded-full blur-3xl"
      />
    </div>
  );
}