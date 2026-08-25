import Image from "next/image";
import EventSubmissionForm from "@/components/home/EventSubmissionForm";
import EventDashboardTable from "@/components/home/EventDashboardTable";
import { Zap, Activity, ArrowRight, ShieldCheck, Database, Server } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Modern Responsive Navbar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Brand Logo */}
            <div className="flex items-center gap-2.5">
              <div className="bg-primary p-2 rounded-xl text-primary-foreground shadow-xs">
                <Zap className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-none">
                  Payroll-Event
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium text-slate-500">
                  Processing Service
                </span>
              </div>
            </div>

            {/* Quick Live Status Indicators in Navbar */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="hidden sm:inline">Engine:</span> Active
              </div>

              <a 
                href="http://localhost:5000/health" 
                target="_blank" 
                rel="noreferrer"
                className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-slate-700 text-xs font-medium transition-colors"
                title="View Live Health Check JSON"
              >
                <Server className="w-3.5 h-3.5 text-slate-500" />
                Health API
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-16 sm:pb-24">
        {/* Hero Section */}
        <section className="relative pt-8 pb-12 sm:pt-14 sm:pb-16 lg:pt-18 lg:pb-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              
              {/* Left Column: Heading & Description */}
              <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/70 text-blue-700 text-xs sm:text-sm font-semibold shadow-xs">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>Asynchronous BullMQ Queue Engine</span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                  High-Throughput <br className="hidden sm:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    Payroll-Event
                  </span> Processing
                </h1>
                
                <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Reliable event-driven architecture designed to decouple request ingestion from background execution. 
                  Guarantees FIFO sequential ordering per employee, idempotency, and automated failure recovery.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                  <a href="#event-dispatcher" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto rounded-xl gap-2 font-bold h-12 px-6 shadow-md shadow-primary/20">
                      Submit New Event <ArrowRight className="w-4 h-4" />
                    </Button>
                  </a>
                  <a href="#event-dashboard" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-xl gap-2 font-semibold h-12 px-6 border-slate-200 bg-white hover:bg-slate-50">
                      View Live Queue
                    </Button>
                  </a>
                </div>
              </div>
              
              {/* Right Column: Hero Visual Asset */}
              <div className="lg:col-span-6 relative mt-4 lg:mt-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-3xl transform rotate-2 scale-105 -z-10 opacity-70"></div>
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 bg-white">
                  <Image 
                    src="/images/hero_banner.jpg" 
                    alt="Payroll-Event Processing Architecture" 
                    width={800} 
                    height={800}
                    className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-500"
                    priority
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Form and Table Grid Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2 sm:mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            
            {/* Form Section */}
            <div id="event-dispatcher" className="lg:col-span-5 xl:col-span-4 scroll-mt-20">
              <EventSubmissionForm />
            </div>

            {/* Table Section */}
            <div id="event-dashboard" className="lg:col-span-7 xl:col-span-8 scroll-mt-20">
              <EventDashboardTable />
            </div>

          </div>
        </section>
      </main>

      {/* Modern Responsive Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-slate-800">Payroll-Event Processing Service</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1"><Server className="w-3.5 h-3.5 text-slate-400" /> Express 5 + Node.js 20</span>
            <span className="flex items-center gap-1"><Database className="w-3.5 h-3.5 text-slate-400" /> PostgreSQL 15 + Prisma</span>
            <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-slate-400" /> Redis 7 + BullMQ 6</span>
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Next.js 16</span>
          </div>

          <p className="text-xs text-slate-400">
            Production-Ready Assignment Delivery
          </p>
        </div>
      </footer>
    </div>
  );
}
