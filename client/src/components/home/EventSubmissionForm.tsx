"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createEventService } from "@/services/events/events.service";
import { 
  Send, 
  Sparkles, 
  CreditCard, 
  MapPin, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Zap 
} from "lucide-react";

export default function EventSubmissionForm() {
  const [loading, setLoading] = useState(false);
  const [eventType, setEventType] = useState("BANK_ACCOUNT_CHANGE");
  
  // Controlled fields for easy autofill/presets
  const [employeeId, setEmployeeId] = useState("EMP-001");
  const [effectiveDate, setEffectiveDate] = useState("2026-09-01");
  const [iban, setIban] = useState("BD1234567890123456");
  const [street, setStreet] = useState("123 Gulshan Avenue");
  const [city, setCity] = useState("Dhaka");
  const [postalCode, setPostalCode] = useState("1212");
  const [country, setCountry] = useState("Bangladesh");
  const [newSalary, setNewSalary] = useState("85000");
  const [currency, setCurrency] = useState("USD");

  const setPreset = (type: string, isFailDemo = false) => {
    setEventType(type);
    setEffectiveDate(new Date().toISOString().split("T")[0]);

    if (type === "BANK_ACCOUNT_CHANGE") {
      setEmployeeId("EMP-" + Math.floor(100 + Math.random() * 900));
      setIban(isFailDemo ? "INVALID_IBAN_9999" : "BD" + Math.floor(1000000000000000 + Math.random() * 9000000000000000));
    } else if (type === "ADDRESS_CHANGE") {
      setEmployeeId("EMP-" + Math.floor(100 + Math.random() * 900));
      setStreet("456 Park Avenue");
      setCity("New York");
      setPostalCode("10022");
      setCountry("USA");
    } else if (type === "SALARY_CHANGE") {
      setEmployeeId("EMP-" + Math.floor(100 + Math.random() * 900));
      setNewSalary(String(Math.floor(60000 + Math.random() * 40000)));
      setCurrency("USD");
    }

    toast.info(`Loaded ${isFailDemo ? "Failure Demo" : type} Preset!`);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const payload: any = {
      eventType,
      employeeId,
      effectiveDate,
    };

    if (eventType === "BANK_ACCOUNT_CHANGE") {
      payload.iban = iban;
    } else if (eventType === "ADDRESS_CHANGE") {
      payload.street = street;
      payload.city = city;
      payload.postalCode = postalCode;
      payload.country = country;
    } else if (eventType === "SALARY_CHANGE") {
      payload.newSalary = Number(newSalary);
      payload.currency = currency;
    }

    try {
      const res = await createEventService(payload);
      toast.success("Event enqueued successfully!", {
        description: `Event ID: ${res.data.id} is now processing asynchronously.`,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to submit event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-white px-6 py-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-xs">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">Event Dispatcher</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Push asynchronous payroll mutations to BullMQ
              </CardDescription>
            </div>
          </div>
        </div>

        {/* Quick Testing Presets */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Presets:
          </span>
          <button
            type="button"
            onClick={() => setPreset("BANK_ACCOUNT_CHANGE")}
            className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors border border-indigo-100"
          >
            Bank Change
          </button>
          <button
            type="button"
            onClick={() => setPreset("SALARY_CHANGE")}
            className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-100"
          >
            Salary
          </button>
          <button
            type="button"
            onClick={() => setPreset("ADDRESS_CHANGE")}
            className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors border border-amber-100"
          >
            Address
          </button>
          <button
            type="button"
            onClick={() => setPreset("BANK_ACCOUNT_CHANGE", true)}
            className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors border border-rose-100"
            title="Demonstrates permanent unrecoverable failure handling"
          >
            ⚠️ Test Failure
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Type Select */}
          <div className="space-y-1.5">
            <Label htmlFor="eventType" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Event Type
            </Label>
            <Select value={eventType} onValueChange={(val) => { if (val) setEventType(val); }}>
              <SelectTrigger className="w-full h-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white text-sm font-medium">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BANK_ACCOUNT_CHANGE">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-indigo-600" /> Bank Account Change
                  </div>
                </SelectItem>
                <SelectItem value="ADDRESS_CHANGE">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-600" /> Address Change
                  </div>
                </SelectItem>
                <SelectItem value="SALARY_CHANGE">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" /> Salary Change
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Common Fields: Employee ID & Effective Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="employeeId" className="text-xs font-bold text-slate-700">
                Employee ID
              </Label>
              <Input 
                id="employeeId" 
                value={employeeId} 
                onChange={(e) => setEmployeeId(e.target.value)} 
                placeholder="e.g. EMP-001" 
                className="h-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white font-mono text-xs" 
                required 
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="effectiveDate" className="text-xs font-bold text-slate-700">
                Effective Date
              </Label>
              <Input 
                id="effectiveDate" 
                type="date"
                value={effectiveDate} 
                onChange={(e) => setEffectiveDate(e.target.value)} 
                className="h-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white text-xs" 
                required 
              />
            </div>
          </div>

          {/* Dynamic Fields for BANK_ACCOUNT_CHANGE */}
          {eventType === "BANK_ACCOUNT_CHANGE" && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label htmlFor="iban" className="text-xs font-bold text-slate-700">
                IBAN / Account Number
              </Label>
              <Input 
                id="iban" 
                value={iban} 
                onChange={(e) => setIban(e.target.value)} 
                placeholder="BD1234567890123456" 
                className="h-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white font-mono text-xs" 
                required 
              />
              <p className="text-[11px] text-slate-400">Prefix with &apos;INVALID&apos; to demo failure rejection.</p>
            </div>
          )}

          {/* Dynamic Fields for ADDRESS_CHANGE */}
          {eventType === "ADDRESS_CHANGE" && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="street" className="text-xs font-bold text-slate-700">Street</Label>
                  <Input 
                    id="street" 
                    value={street} 
                    onChange={(e) => setStreet(e.target.value)} 
                    placeholder="123 Gulshan Ave" 
                    className="h-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white text-xs" 
                    required 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-xs font-bold text-slate-700">City</Label>
                  <Input 
                    id="city" 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)} 
                    placeholder="Dhaka" 
                    className="h-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white text-xs" 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="postalCode" className="text-xs font-bold text-slate-700">Postal Code</Label>
                  <Input 
                    id="postalCode" 
                    value={postalCode} 
                    onChange={(e) => setPostalCode(e.target.value)} 
                    placeholder="1212" 
                    className="h-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white text-xs" 
                    required 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="country" className="text-xs font-bold text-slate-700">Country</Label>
                  <Input 
                    id="country" 
                    value={country} 
                    onChange={(e) => setCountry(e.target.value)} 
                    placeholder="Bangladesh" 
                    className="h-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white text-xs" 
                    required 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Fields for SALARY_CHANGE */}
          {eventType === "SALARY_CHANGE" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-1.5">
                <Label htmlFor="newSalary" className="text-xs font-bold text-slate-700">New Salary</Label>
                <Input 
                  id="newSalary" 
                  type="number"
                  value={newSalary} 
                  onChange={(e) => setNewSalary(e.target.value)} 
                  placeholder="85000" 
                  className="h-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white text-xs font-mono" 
                  required 
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="currency" className="text-xs font-bold text-slate-700">Currency</Label>
                <Input 
                  id="currency" 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value)} 
                  placeholder="USD" 
                  className="h-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white text-xs font-mono" 
                  required 
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-11 rounded-xl gap-2 font-bold shadow-md shadow-primary/25 hover:shadow-lg transition-all active:scale-[0.98] mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                Dispatching Event...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="w-4 h-4" /> Submit
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
