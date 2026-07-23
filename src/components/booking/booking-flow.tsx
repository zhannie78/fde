"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatSlotButtonLabel, formatSlotLabel } from "@/lib/booking";

type Step = "slot" | "details" | "review" | "success";
type Slot = { dateISO: string; time: string };

const GENERIC_ERROR = "Couldn't send your booking — please try again.";

type BookingFlowProps = {
  slots: Slot[];
};

/**
 * Native 4-step booking flow (pick slot -> details -> review -> success).
 * Availability comes from the admin-configured weekly template + date
 * exceptions (src/lib/slots.ts), passed in as a flat, date-ascending list
 * of up to 21 open slots. On confirm, POSTs to /api/book, which atomically
 * reserves the slot in Netlify Blobs, relays a Telegram notification, and
 * sends a confirmation email with a reschedule/cancel link. A 409 means
 * another visitor took the slot first — the flow returns to the slot step
 * with a fresh list.
 */
export function BookingFlow({ slots: initialSlots }: BookingFlowProps) {
  const [slots, setSlots] = useState(initialSlots);
  const [step, setStep] = useState<Step>("slot");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detailsValid = name.trim().length > 0 && email.includes("@") && note.trim().length > 0;

  async function refreshSlots() {
    try {
      const res = await fetch("/api/book/slots");
      if (res.ok) {
        const body = await res.json();
        setSlots(body.slots);
      }
    } catch {
      // Best-effort refresh; the visitor can still retry manually.
    }
  }

  async function handleConfirmBooking() {
    if (!selectedSlot) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          note,
          dateISO: selectedSlot.dateISO,
          time: selectedSlot.time,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message = typeof body?.error === "string" ? body.error : GENERIC_ERROR;
        setSubmitting(false);

        if (res.status === 409) {
          setSelectedSlot(null);
          setError(message);
          setStep("slot");
          await refreshSlots();
          return;
        }

        setError(message);
        return;
      }

      setSubmitting(false);
      setStep("success");
    } catch {
      setSubmitting(false);
      setError(GENERIC_ERROR);
    }
  }

  if (step === "slot") {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-sm font-semibold text-foreground">Pick a time</p>
        {error && (
          <div role="alert" className="rounded-lg border border-destructive p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        {slots.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No open times right now — please check back soon or reach out directly.
          </p>
        )}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {slots.map((slot) => (
            <button
              key={`${slot.dateISO}T${slot.time}`}
              type="button"
              onClick={() => {
                setError(null);
                setSelectedSlot(slot);
                setStep("details");
              }}
              className="flex flex-col items-start gap-1 rounded-lg border border-border bg-background p-4 text-left text-sm transition-colors hover:border-ring focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <span className="font-semibold text-foreground">
                {formatSlotButtonLabel(slot.dateISO, slot.time)}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === "details" && selectedSlot) {
    return (
      <div className="flex flex-col gap-5">
        <p className="text-sm font-semibold text-foreground">Your details</p>
        <p className="rounded-lg border border-border bg-background p-4 text-base text-foreground">
          {formatSlotLabel(selectedSlot.dateISO, selectedSlot.time)}
        </p>

        <div className="flex flex-col gap-2">
          <Label htmlFor="booking-name">Name</Label>
          <Input id="booking-name" value={name} onChange={(event) => setName(event.target.value)} required />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="booking-email">Email</Label>
          <Input
            id="booking-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="booking-note">What&apos;s going on?</Label>
          <Textarea id="booking-note" value={note} onChange={(event) => setNote(event.target.value)} required />
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => setStep("slot")}>
            Back
          </Button>
          <Button type="button" disabled={!detailsValid} onClick={() => setStep("review")}>
            Continue
          </Button>
        </div>
      </div>
    );
  }

  if (step === "review" && selectedSlot) {
    return (
      <div className="flex flex-col gap-5">
        <p className="text-sm font-semibold text-foreground">Review &amp; confirm</p>

        {error && (
          <div role="alert" className="rounded-lg border border-destructive p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4 text-sm text-foreground">
          <p>
            <span className="font-semibold">When:</span> {formatSlotLabel(selectedSlot.dateISO, selectedSlot.time)}
          </p>
          <p>
            <span className="font-semibold">Name:</span> {name}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {email}
          </p>
          <p>
            <span className="font-semibold">Note:</span> {note}
          </p>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => setStep("details")} disabled={submitting}>
            Back
          </Button>
          <Button type="button" onClick={handleConfirmBooking} disabled={submitting}>
            {submitting ? "Booking…" : "Confirm Booking"}
          </Button>
        </div>
      </div>
    );
  }

  if (step === "success" && selectedSlot) {
    return (
      <p role="status" className="rounded-lg border border-border bg-muted/40 p-6 text-base text-foreground">
        You&apos;re booked for {formatSlotLabel(selectedSlot.dateISO, selectedSlot.time)}. I&apos;ll email you a
        confirmation with a link to reschedule or cancel if anything changes.
      </p>
    );
  }

  return null;
}
