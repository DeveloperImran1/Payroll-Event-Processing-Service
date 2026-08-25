"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getAllEventsService } from "@/services/events/events.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  RefreshCw, 
  Search, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Activity, 
  ListFilter,
  CreditCard,
  MapPin,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";
import EventDetailModal from "./EventDetailModal";

export default function EventDashboardTable() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEvents = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await getAllEventsService();
      if (res.data) {
        setEvents(res.data);
      }
    } catch (error: any) {
      if (!silent) {
        toast.error("Failed to load events", { description: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // Real-time polling every 4 seconds for immediate state reflection
    const intervalId = setInterval(() => {
      fetchEvents(true);
    }, 4000);
    return () => clearInterval(intervalId);
  }, []);

  // Filtered Events based on search & tab
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchesSearch = 
        ev.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.eventType.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "ALL" || ev.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [events, searchQuery, statusFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = events.length;
    const success = events.filter((e) => e.status === "SUCCESS").length;
    const processing = events.filter((e) => e.status === "PROCESSING" || e.status === "PENDING").length;
    const failed = events.filter((e) => e.status === "FAILED").length;
    return { total, success, processing, failed };
  }, [events]);

  const handleOpenDetail = (id: string) => {
    setSelectedEventId(id);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
            PENDING
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            PROCESSING
          </span>
        );
      case "SUCCESS":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            SUCCESS
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            FAILED
          </span>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case "BANK_ACCOUNT_CHANGE":
        return (
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
            <CreditCard className="w-3.5 h-3.5 text-indigo-500" /> Bank Account
          </div>
        );
      case "ADDRESS_CHANGE":
        return (
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-amber-500" /> Address
          </div>
        );
      case "SALARY_CHANGE":
        return (
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Salary
          </div>
        );
      default:
        return type;
    }
  };

  return (
    <>
      <Card className="w-full shadow-lg border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
        {/* Header Section with Live Status & Refresh */}
        <CardHeader className="bg-gradient-to-r from-slate-50 to-white px-6 py-5 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-bold text-slate-900">Event Stream & Audit Table</CardTitle>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>
              <CardDescription className="text-xs text-slate-500 mt-1">
                Real-time queue monitoring with automatic background state synchronization.
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchEvents()} 
                disabled={loading}
                className="rounded-xl h-9 px-3.5 border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin text-primary" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
            <div className="p-3 rounded-xl bg-slate-100/70 border border-slate-200/60">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total</span>
              <p className="text-xl font-extrabold text-slate-900">{stats.total}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100">
              <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">In Queue/Running</span>
              <p className="text-xl font-extrabold text-blue-700">{stats.processing}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Successful</span>
              <p className="text-xl font-extrabold text-emerald-700">{stats.success}</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100">
              <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Failed</span>
              <p className="text-xl font-extrabold text-rose-700">{stats.failed}</p>
            </div>
          </div>
        </CardHeader>

        {/* Filter Controls & Search */}
        <div className="px-6 py-3.5 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by Employee ID or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-white rounded-xl border-slate-200"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {["ALL", "PENDING", "PROCESSING", "SUCCESS", "FAILED"].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  statusFilter === tab
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-slate-600 hover:bg-slate-200/60 bg-white border border-slate-200/70"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="text-xs font-bold text-slate-600 pl-6">Event ID</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600">Event Type</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600">Employee ID</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600">Status</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600">Time</TableHead>
                  <TableHead className="text-xs font-bold text-slate-600 text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-32 text-slate-400 text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                        Fetching event records...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-32 text-slate-400 text-sm">
                      No events matching criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents.map((event) => (
                    <TableRow 
                      key={event.id} 
                      onClick={() => handleOpenDetail(event.id)}
                      className="cursor-pointer hover:bg-blue-50/40 transition-colors border-slate-100 group"
                    >
                      <TableCell className="font-mono text-xs font-semibold text-slate-900 pl-6">
                        {event.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>{getEventTypeBadge(event.eventType)}</TableCell>
                      <TableCell className="font-bold text-slate-800 text-xs">
                        {event.employeeId}
                      </TableCell>
                      <TableCell>{getStatusBadge(event.status)}</TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </TableCell>
                      <TableCell className="text-right pr-6" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleOpenDetail(event.id)}
                          className="h-8 w-8 p-0 rounded-lg group-hover:bg-white group-hover:text-primary group-hover:shadow-xs"
                          title="Inspect Event Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Inspection Modal */}
      <EventDetailModal
        eventId={selectedEventId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEventUpdated={() => fetchEvents(true)}
      />
    </>
  );
}
