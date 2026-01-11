"use client";

import CitizenSidebar from '@/components/citizen/CitizenSidebar';
import { motion } from 'framer-motion';

export default function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F0F4F9] flex">
      <CitizenSidebar />
      <main className="flex-1 ml-24 lg:ml-64 p-6 lg:p-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
