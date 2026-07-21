"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Status = "idle" | "submitting" | "success" | "error";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mjgnobjw";
const GENERIC_ERROR = "Something went wrong sending your message — please try again.";

/**
 * Client-side Formspree form (name/email/message). AJAX-posts with
 * Accept: application/json so the browser never hard-navigates to
 * Formspree's own success page — the success/error state is rendered
 * in-place instead.
 */
export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (status === "success") {
    return (
      <p
        role="status"
        className="rounded-lg border border-border bg-muted/40 p-6 text-base text-foreground"
      >
        Thanks — I&apos;ll get back to you within one business day.
      </p>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: new FormData(event.currentTarget),
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        setStatus("success");
        return;
      }

      setStatus("error");
      setErrorMessage(GENERIC_ERROR);
    } catch {
      setStatus("error");
      setErrorMessage(GENERIC_ERROR);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {status === "error" && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-lg border border-destructive p-4 text-sm text-destructive"
        >
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="font-semibold underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          required
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </div>

      <Button type="submit" disabled={status === "submitting"} className="w-fit">
        {status === "submitting" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
