import { BookCta } from "@/components/book-cta";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Empty-state card reserving the Phase 2 live-demo slot (UI-SPEC Copywriting
 * Contract, D-09). Heading and body copy are VERBATIM — do not paraphrase.
 * Sized/shaped so the Phase 2 missed-call demo can swap directly into this
 * container with no layout change.
 */
export function DemoPlaceholder() {
  return (
    <Card className="min-h-[420px] justify-between border-none bg-secondary text-secondary-foreground shadow-none ring-1 ring-secondary-foreground/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-2.5 w-2.5 rounded-full bg-secondary-foreground/30" />
          <CardDescription className="text-sm font-semibold tracking-[0.02em] text-secondary-foreground/70 uppercase">
            Live demo — coming soon
          </CardDescription>
        </div>
        <CardTitle className="font-heading text-2xl leading-[1.2] font-semibold text-secondary-foreground">
          The live demo lands here next
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <Skeleton className="h-24 w-full bg-secondary-foreground/10" />
        <p className="text-base leading-[1.6] text-secondary-foreground/90">
          This is where you&apos;ll simulate a missed call and watch an
          instant AI text-back happen live. Coming very soon — want to see it
          sooner? Book a free audit call and we&apos;ll walk through it
          together.
        </p>
        <BookCta />
      </CardContent>
    </Card>
  );
}
