"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  X, 
  Copy, 
  Check, 
  RefreshCw, 
  Clock, 
  User, 
  CreditCard, 
  MapPin, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Calendar,
  FileJson
} from "lucide-react";
import { getEventStatusService } from "@/services/events/events.service";
import { toast } from "sonner";

interface EventDetailModalProps {
  eventId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEventUpdated?: () => void;
}

export default function EventDetailModal({
  eventId,
  isOpen,
  onClose,
  onEventUpdated,
}: EventDetailModalProps) {
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchDetail = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const res = await getEventStatusService(eventId);
      if (res.data) {
        setEvent(res.data);
      }
    } catch (error: any) {
      toast.error("Failed to load event details", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && eventId) {
      fetchDetail();
    } else {
      setEvent(null);
    }
  }, [isOpen, eventId]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const copyId = () => {
    if (!event?.id) return;
    navigator.clipboard.writeText(event.id);
    setCopied(true);
    toast.success("Event ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-amber-400"></span>
            PENDING
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            PROCESSING
          </span>
        );
      case "SUCCESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            SUCCESS
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            FAILED
          </span>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "BANK_ACCOUNT_CHANGE":
        return <CreditCard className="w-5 h-5 text-indigo-600" />;
      case "ADDRESS_CHANGE":
        return <MapPin className="w-5 h-5 text-amber-600" />;
      case "SALARY_CHANGE":
        return <DollarSign className="w-5 h-5 text-emerald-600" />;
      default:
        return <CreditCard className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white shadow-sm border border-slate-200/60">
              {event?.eventType ? getEventIcon(event.eventType) : <CreditCard className="w-5 h-5 text-primary" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Event Inspection & Lifecycle</h3>
              <p className="text-xs text-slate-500 font-mono">
                {event?.id ? `ID: ${event.id}` : "Loading event details..."}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading && !event ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              <p className="text-sm font-medium">Fetching event from database...</p>
            </div>
          ) : event ? (
            <>
              {/* Status Banner */}
              <div className="flex flex-wrap items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/70 gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Current Status:
                  </span>
                  {getStatusBadge(event.status)}
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={copyId}
                    className="h-8 gap-1.5 text-xs rounded-lg"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy ID"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      fetchDetail();
                      if (onEventUpdated) onEventUpdated();
                    }}
                    disabled={loading}
                    className="h-8 gap-1.5 text-xs rounded-lg text-primary hover:text-primary"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Failure Alert (if FAILED) */}
              {event.status === "FAILED" && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-900 flex items-start gap-3 animate-in fade-in duration-300">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-rose-800">Processing Failure Reason</h4>
                    <p className="text-xs text-rose-700 font-mono leading-relaxed">
                      {event.failureReason || "Simulated unrecoverable provider failure."}
                    </p>
                  </div>
                </div>
              )}

              {/* Processing Info (if PROCESSING) */}
              {event.status === "PROCESSING" && (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-900 flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-blue-800">Worker Node Active</h4>
                    <p className="text-xs text-blue-700">
                      This job is actively being processed by the BullMQ worker cluster.
                    </p>
                  </div>
                </div>
              )}

              {/* Key Attributes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-xs space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <User className="w-4 h-4 text-slate-400" /> Employee ID
                  </div>
                  <p className="text-base font-bold text-slate-900">{event.employeeId}</p>
                </div>

                <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-xs space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <CreditCard className="w-4 h-4 text-slate-400" /> Event Type
                  </div>
                  <p className="text-base font-bold text-slate-900">{event.eventType}</p>
                </div>
              </div>

              {/* Payload Breakdown Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <FileJson className="w-4 h-4 text-primary" /> Submitted Payload Attributes
                </div>
                <div className="bg-white rounded-lg p-3 border border-slate-200/70 font-mono text-xs text-slate-800 space-y-1.5 overflow-x-auto">
                  {event.payload && typeof event.payload === "object" ? (
                    Object.entries(event.payload).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-1 border-b border-slate-50 last:border-0">
                        <span className="text-slate-500 font-semibold">{key}:</span>
                        <span className="font-bold text-slate-900">{String(value)}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-400">No payload attributes</span>
                  )}
                </div>
              </div>

              {/* Timestamps & Lifecycle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Submitted: {new Date(event.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 sm:justify-end">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Last Update: {new Date(event.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-slate-500 py-10 text-sm">Event not found.</p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <Button variant="default" onClick={onClose} className="rounded-xl px-6">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
