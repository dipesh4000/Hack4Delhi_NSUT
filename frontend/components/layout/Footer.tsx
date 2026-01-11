import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        
        <div className="flex items-center gap-2">
          <Image 
            src="/logo.png" 
            alt="WardAir Logo" 
            width={24} 
            height={24} 
            className="rounded-md"
          />
          <span className="font-semibold text-slate-900">WardAir</span>
        </div>

        <div className="text-sm text-slate-500">
          © {new Date().getFullYear()} Ward-Wise Pollution Action Dashboard. GovTech Initiative.
        </div>

        <div className="flex gap-6 text-sm text-slate-600">
          <Link href="#" className="hover:text-blue-600">Privacy</Link>
          <Link href="#" className="hover:text-blue-600">Terms</Link>
          <Link href="#" className="hover:text-blue-600">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
