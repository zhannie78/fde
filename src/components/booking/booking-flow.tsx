"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BOOKING_SLOT_LABEL, formatSlotLabel, getAvailableDates } from "@/lib/booking";

type Step = "date" | "time" | "details" | "review" | "success";

const GENERIC_ERROR = "Couldn't send your booking — please try again.";

/**
 * Native 5-step booking flow (date -> time confirm -> details -> review ->
 * success) replacing the Cal.com embed. Hardcoded single-daily-slot
 * availability (src/lib/booking.ts) — no external calendar account needed.
 * On confirm, POSTs to /api/book, which zod-validates and relays a Telegram
 * notification server-side; this component never talks to Telegram
 * directly.
 */
export function BookingFlow() {
  const [step, setStep] = useState<Step>("date");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detailsValid = name.trim().length > 0 && email.includes("@") && note.trim().length > 0;

  async function handleConfirmBooking() {
    if (!selectedDate) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, note, dateISO: selectedDate }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(typeof body?.error === "string" ? body.error : GENERIC_ERROR);
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
      setStep("success");
    } catch {
      setError(GENERIC_ERROR);
      setSubmitting(false);
    }
  }

  if (step === "date") {
    const dates = getAvailableDates(21);
    return (
      <div className="flex flex-col gap-6">
        <p className="text-sm font-semibold text-foreground">Pick a date</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {dates.map((date) => (
            <button
              key={date.iso}
              type="button"
              onClick={() => {
                setSelectedDate(date.iso);
                setStep("time");
              }}
              className="flex flex-col items-start gap-1 rounded-lg border border-border bg-background p-4 text-left text-sm transition-colors hover:border-ring focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <span className="font-semibold text-foreground">{date.label}</span>
              <span className="text-xs text-muted-foreground">{BOOKING_SLOT_LABEL}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === "time" && selectedDate) {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-sm font-semibold text-foreground">Confirm time</p>
        <p className="rounded-lg border border-border bg-background p-4 text-base text-foreground">
          {formatSlotLabel(selectedDate)}
        </p>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => setStep("date")}>
            Back
          </Button>
          <Button type="button" onClick={() => setStep("details")}>
            Confirm
          </Button>
        </div>
      </div>
    );
  }

  if (step === "details") {
    return (
      <div className="flex flex-col gap-5">
        <p className="text-sm font-semibold text-foreground">Your details</p>

        <div className="flex flex-col gap-2">
          <Label htmlFor="booking-name">Name</Label>
          <Input
            id="booking-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
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
          <Textarea
            id="booking-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            required
          />
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => setStep("time")}>
            Back
          </Button>
          <Button type="button" disabled={!detailsValid} onClick={() => setStep("review")}>
            Continue
          </Button>
        </div>
      </div>
    );
  }

  if (step === "review" && selectedDate) {
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
            <span className="font-semibold">When:</span> {formatSlotLabel(selectedDate)}
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

  if (step === "success" && selectedDate) {
    return (
      <p
        role="status"
        className="rounded-lg border border-border bg-muted/40 p-6 text-base text-foreground"
      >
        You&apos;re booked for {formatSlotLabel(selectedDate)}. I&apos;ll follow up by email
        beforehand — talk soon.
      </p>
    );
  }

  return null;
}
