import { Info } from "lucide-react";

export default function ContextualAdviceCard({ advice }: { advice: string }) {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4">
      <div className="p-2 bg-blue-100 rounded-full shrink-0">
        <Info className="w-6 h-6 text-blue-600" />
      </div>
      <div>
        <h3 className="font-bold text-blue-900 text-lg mb-1">What This Means For You Today</h3>
        <p className="text-blue-800 leading-relaxed">
          {advice}
        </p>
      </div>
    </div>
  );
}
