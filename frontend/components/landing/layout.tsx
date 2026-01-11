// layout.tsx
import React from "react";
import GlobalBackground from "@/components/landing/BlueBackground";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <GlobalBackground />
      <main className="relative z-10 min-h-screen overflow-x-hidden">{children}</main>
    </>
  );
}