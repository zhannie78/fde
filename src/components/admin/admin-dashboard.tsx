"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Weekday } from "@/lib/booking";
import type { WeeklyTemplate } from "@/lib/availability-store";

const WEEKDAY_ORDER: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const WEEKDAY_LABEL: Record<Weekday, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

type Override = { dateISO: string; times: string[] };

type AdminDashboardProps = {
  initialTemplate: WeeklyTemplate;
  initialOverrides: Override[];
};

export function AdminDashboard({ initialTemplate, initialOverrides }: AdminDashboardProps) {
  const [template, setTemplate] = useState<WeeklyTemplate>(initialTemplate);
  const [overrides, setOverrides] = useState<Override[]>(initialOverrides);
  const [templateStatus, setTemplateStatus] = useState<string | null>(null);
  const [templateSaving, setTemplateSaving] = useState(false);

  const [overrideDate, setOverrideDate] = useState("");
  const [overrideTimes, setOverrideTimes] = useState<string[]>([]);
  const [overrideStatus, setOverrideStatus] = useState<string | null>(null);
  const [overrideSaving, setOverrideSaving] = useState(false);

  function addTemplateTime(day: Weekday) {
    setTemplate((current) => ({ ...current, [day]: [...current[day], "09:00"] }));
  }

  function updateTemplateTime(day: Weekday, index: number, value: string) {
    setTemplate((current) => {
      const next = [...current[day]];
      next[index] = value;
      return { ...current, [day]: next };
    });
  }

  function removeTemplateTime(day: Weekday, index: number) {
    setTemplate((current) => ({
      ...current,
      [day]: current[day].filter((_, i) => i !== index),
    }));
  }

  async function handleSaveTemplate() {
    setTemplateSaving(true);
    setTemplateStatus(null);

    try {
      const res = await fetch("/api/admin/template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template),
      });

      setTemplateSaving(false);
      setTemplateStatus(res.ok ? "Saved." : "Couldn't save — please try again.");
    } catch {
      setTemplateSaving(false);
      setTemplateStatus("Couldn't save — please try again.");
    }
  }

  function addOverrideTime() {
    setOverrideTimes((current) => [...current, "09:00"]);
  }

  function updateOverrideTime(index: number, value: string) {
    setOverrideTimes((current) => current.map((time, i) => (i === index ? value : time)));
  }

  function removeOverrideTime(index: number) {
    setOverrideTimes((current) => current.filter((_, i) => i !== index));
  }

  async function handleSaveOverride(blocked: boolean) {
    if (!overrideDate) return;
    setOverrideSaving(true);
    setOverrideStatus(null);

    const times = blocked ? [] : overrideTimes;

    try {
      const res = await fetch("/api/admin/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateISO: overrideDate, times }),
      });

      if (!res.ok) {
        setOverrideSaving(false);
        setOverrideStatus("Couldn't save — please try again.");
        return;
      }

      setOverrides((current) =>
        [...current.filter((item) => item.dateISO !== overrideDate), { dateISO: overrideDate, times }].sort(
          (a, b) => a.dateISO.localeCompare(b.dateISO)
        )
      );
      setOverrideSaving(false);
      setOverrideStatus("Saved.");
      setOverrideDate("");
      setOverrideTimes([]);
    } catch {
      setOverrideSaving(false);
      setOverrideStatus("Couldn't save — please try again.");
    }
  }

  async function handleRemoveOverride(dateISO: string) {
    setOverrideSaving(true);
    setOverrideStatus(null);

    try {
      const res = await fetch(`/api/admin/override?dateISO=${dateISO}`, { method: "DELETE" });

      if (!res.ok) {
        setOverrideSaving(false);
        setOverrideStatus("Couldn't remove — please try again.");
        return;
      }

      setOverrides((current) => current.filter((item) => item.dateISO !== dateISO));
      setOverrideSaving(false);
      setOverrideStatus("Removed.");
    } catch {
      setOverrideSaving(false);
      setOverrideStatus("Couldn't remove — please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-6">
        <h2 className="text-lg font-semibold text-foreground">Weekly Template</h2>
        {WEEKDAY_ORDER.map((day) => (
          <div key={day} className="flex flex-col gap-2 border-b border-border pb-4">
            <p className="text-sm font-semibold text-foreground">{WEEKDAY_LABEL[day]}</p>
            <div className="flex flex-wrap gap-2">
              {template[day].map((time, index) => (
                <div key={index} className="flex items-center gap-1">
                  <Input
                    type="time"
                    value={time}
                    onChange={(event) => updateTemplateTime(day, index, event.target.value)}
                    className="w-32"
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeTemplateTime(day, index)}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => addTemplateTime(day)}>
                Add time
              </Button>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-4">
          <Button type="button" onClick={handleSaveTemplate} disabled={templateSaving}>
            {templateSaving ? "Saving…" : "Save Template"}
          </Button>
          {templateStatus && <p className="text-sm text-muted-foreground">{templateStatus}</p>}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-lg font-semibold text-foreground">Exceptions</h2>
        <div className="flex flex-col gap-3">
          <Input
            type="date"
            value={overrideDate}
            onChange={(event) => setOverrideDate(event.target.value)}
            className="w-48"
          />
          <div className="flex flex-wrap gap-2">
            {overrideTimes.map((time, index) => (
              <div key={index} className="flex items-center gap-1">
                <Input
                  type="time"
                  value={time}
                  onChange={(event) => updateOverrideTime(index, event.target.value)}
                  className="w-32"
                />
                <Button type="button" variant="ghost" size="sm" onClick={() => removeOverrideTime(index)}>
                  Remove
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addOverrideTime}>
              Add time
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              onClick={() => handleSaveOverride(false)}
              disabled={overrideSaving || !overrideDate}
            >
              Save custom hours
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => handleSaveOverride(true)}
              disabled={overrideSaving || !overrideDate}
            >
              Block this day
            </Button>
            {overrideStatus && <p className="text-sm text-muted-foreground">{overrideStatus}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-foreground">Upcoming exceptions</p>
          {overrides.length === 0 && <p className="text-sm text-muted-foreground">None set.</p>}
          {overrides.map((override) => (
            <div
              key={override.dateISO}
              className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
            >
              <span>
                {override.dateISO} — {override.times.length === 0 ? "Blocked" : override.times.join(", ")}
              </span>
              <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveOverride(override.dateISO)} disabled={overrideSaving}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
