import { Body, Container, Head, Heading, Html, Link, Preview, Text } from "@react-email/components";

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

export function BookingUpdateEmail({ state, name, dateLabel, manageUrl }: BookingUpdateEmailProps) {
  const headline = HEADLINE[state];

  return (
    <Html>
      <Head />
      <Preview>{headline}</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f5f5f5", padding: "24px" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "8px" }}>
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
        </Container>
      </Body>
    </Html>
  );
}
