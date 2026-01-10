"use client";

import CitizenLayout from "@/components/citizen/CitizenLayout";
import { MessageSquare, Phone, Mail, FileText, ExternalLink, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function SupportPage() {
  return (
    <CitizenLayout>
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-blue-600/20">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Citizen Support</h1>
          <p className="text-slate-500 font-medium max-w-md mx-auto">
            Get help with air quality issues, report violations, or contact your local ward officer.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Methods */}
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Direct Contact</h2>
            
            <div className="space-y-4">
              <div className="p-6 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/20 shadow-xl flex items-center gap-6 group hover:bg-white transition-all">
                <div className="p-4 bg-blue-50 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emergency Helpline</p>
                  <p className="text-lg font-black text-slate-900">1800-11-2233</p>
                </div>
              </div>

              <div className="p-6 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/20 shadow-xl flex items-center gap-6 group hover:bg-white transition-all">
                <div className="p-4 bg-indigo-50 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Support</p>
                  <p className="text-lg font-black text-slate-900">support@mcd.gov.in</p>
                </div>
              </div>

              <div className="p-6 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/20 shadow-xl flex items-center gap-6 group hover:bg-white transition-all">
                <div className="p-4 bg-emerald-50 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Chat</p>
                  <p className="text-lg font-black text-slate-900">Available 24/7</p>
                </div>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Resources</h2>
            
            <div className="space-y-4">
              {[
                { title: "Health Guidelines", desc: "How to protect yourself from smog.", icon: FileText },
                { title: "Report a Violation", desc: "Report illegal waste burning.", icon: Shield },
                { title: "Ward Directory", desc: "Find your local representative.", icon: ExternalLink },
              ].map((item, i) => (
                <div key={i} className="p-6 bg-white/40 backdrop-blur-md rounded-[2rem] border border-white/10 hover:border-blue-200 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm">
                        <item.icon className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-all" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 tracking-tight">{item.title}</h3>
                        <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-24 -mr-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="relative z-10 space-y-8">
            <h2 className="text-2xl font-black tracking-tight">Frequently Asked Questions</h2>
            <div className="grid gap-6">
              <div className="space-y-2">
                <h4 className="font-black text-blue-400">How is the AQI calculated?</h4>
                <p className="text-sm text-slate-400 leading-relaxed">We use real-time sensor data from the WAQI network combined with local MCD sensors to provide the most accurate readings.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-black text-blue-400">What should I do during 'Severe' air quality?</h4>
                <p className="text-sm text-slate-400 leading-relaxed">Avoid all outdoor physical activities. Keep windows closed and use air purifiers if available. Wear an N95 mask if you must go out.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}
