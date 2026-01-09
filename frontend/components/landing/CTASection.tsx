"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-24 bg-blue-600">
      <div className="max-w-4xl mx-auto px-4 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Clear the Air?
        </h2>
        <p className="text-xl text-blue-100 mb-10">
          Join the platform that empowers citizens and authorities to take data-driven action against pollution.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/sign-up"
            className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
          >
            Get Started Now
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
}
