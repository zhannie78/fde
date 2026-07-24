import { Body, Container, Head, Heading, Hr, Html, Link, Preview, Text } from "@react-email/components";

import { siteConfig } from "@/config/site";

type BookingEmailState = "confirmed" | "cancelled" | "rescheduled";

type BookingUpdateEmailProps = {
  state: BookingEmailState;
  name: string;
  dateLabel: string;
  manageUrl: string;
};

const HEADLINE: Record<BookingEmailState, string> = {
  confirmed: "Your call is booked",
  cancelled: "Your call has been cancelled",
  rescheduled: "Your call has been rescheduled",
};

// Same domain-style wordmark treatment used site-wide (SiteHeader/SiteFooter)
// — this project has no separate graphic logo asset, the styled wordmark is
// the brand mark.
const [brandPrefix, brandSuffix] = siteConfig.name.split(".");

export function BookingUpdateEmail({ state, name, dateLabel, manageUrl }: BookingUpdateEmailProps) {
  const headline = HEADLINE[state];

  return (
    <Html>
      <Head />
      <Preview>{headline}</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f5f5f5", padding: "24px" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "8px" }}>
          <Text style={{ fontSize: "18px", fontWeight: 700, color: "#0C0C0D", margin: "0 0 24px" }}>
            {brandPrefix}
            <span style={{ color: "#3552FF" }}>.</span>
            {brandSuffix}
          </Text>
          <Heading as="h1" style={{ fontSize: "20px" }}>
            {headline}
          </Heading>
          <Text>Hi {name},</Text>
          {state === "cancelled" ? (
            <Text>
              Your booking has been cancelled. If this wasn&apos;t you, just reply to this email.
            </Text>
          ) : (
            <Text>
              Your call is scheduled for <strong>{dateLabel}</strong>.
            </Text>
          )}
          {state !== "cancelled" && (
            <Text>
              Need to make a change? <Link href={manageUrl}>Reschedule or cancel here</Link>.
            </Text>
          )}
          <Hr style={{ borderColor: "#e5e5e5", margin: "32px 0 16px" }} />
          <Text style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
            Questions? Contact{" "}
            <Link href="mailto:annie@aideployed.dev" style={{ color: "#3552FF" }}>
              annie@aideployed.dev
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
