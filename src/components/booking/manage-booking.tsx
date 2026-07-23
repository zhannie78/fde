"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { formatSlotButtonLabel, formatSlotLabel } from "@/lib/booking";

type Slot = { dateISO: string; time: string };
type Mode = "idle" | "loadingSlots" | "rescheduling" | "cancelled" | "rescheduled";

const GENERIC_ERROR = "Something went wrong — please try again.";

type ManageBookingProps = {
  token: string;
  currentDateISO: string;
  currentTime: string;
};

export function ManageBooking({ token, currentDateISO, currentTime }: ManageBookingProps) {
  const [mode, setMode] = useState<Mode>("idle");
  const [dateISO, setDateISO] = useState(currentDateISO);
  const [time, setTime] = useState(currentTime);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openReschedule() {
    setMode("loadingSlots");
    setError(null);

    try {
      const res = await fetch("/api/book/slots");
      const body = await res.json();
      const filtered = (body.slots as Slot[]).filter(
        (slot) => !(slot.dateISO === currentDateISO && slot.time === currentTime)
      );
      setSlots(filtered);
      setMode("rescheduling");
    } catch {
      setError(GENERIC_ERROR);
      setMode("idle");
    }
  }

  async function handleCancel() {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/book/manage/${token}/cancel`, { method: "POST" });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(typeof body?.error === "string" ? body.error : GENERIC_ERROR);
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
      setMode("cancelled");
    } catch {
      setSubmitting(false);
      setError(GENERIC_ERROR);
    }
  }

  async function handleReschedule(slot: Slot) {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/book/manage/${token}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateISO: slot.dateISO, time: slot.time }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(typeof body?.error === "string" ? body.error : GENERIC_ERROR);
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
      setDateISO(slot.dateISO);
      setTime(slot.time);
      setMode("rescheduled");
    } catch {
      setSubmitting(false);
      setError(GENERIC_ERROR);
    }
  }

  if (mode === "cancelled") {
    return (
      <p role="status" className="rounded-lg border border-border bg-muted/40 p-6 text-base text-foreground">
        Your booking has been cancelled. Head back to{" "}
        <a href="/book" className="underline hover:text-primary">
          /book
        </a>{" "}
        anytime to pick a new time.
      </p>
    );
  }

  if (mode === "rescheduled") {
    return (
      <p role="status" className="rounded-lg border border-border bg-muted/40 p-6 text-base text-foreground">
        You&apos;re rebooked for {formatSlotLabel(dateISO, time)}. I&apos;ll follow up by email beforehand.
      </p>
    );
  }

  if (mode === "loadingSlots") {
    return <p className="text-sm text-muted-foreground">Loading available times…</p>;
  }

  if (mode === "rescheduling") {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-sm font-semibold text-foreground">Pick a new time</p>
        {error && (
          <div role="alert" className="rounded-lg border border-destructive p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        {slots.length === 0 && <p className="text-sm text-muted-foreground">No other open times right now.</p>}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {slots.map((slot) => (
            <button
              key={`${slot.dateISO}T${slot.time}`}
              type="button"
              disabled={submitting}
              onClick={() => handleReschedule(slot)}
              className="flex flex-col items-start gap-1 rounded-lg border border-border bg-background p-4 text-left text-sm transition-colors hover:border-ring focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="font-semibold text-foreground">
                {formatSlotButtonLabel(slot.dateISO, slot.time)}
              </span>
            </button>
          ))}
        </div>
        <Button type="button" variant="outline" onClick={() => setMode("idle")} disabled={submitting}>
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <div role="alert" className="rounded-lg border border-destructive p-4 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={openReschedule} disabled={submitting}>
          Reschedule
        </Button>
        <Button type="button" variant="destructive" onClick={handleCancel} disabled={submitting}>
          {submitting ? "Cancelling…" : "Cancel booking"}
        </Button>
      </div>
    </div>
  );
}
