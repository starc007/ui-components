"use client";

import { useId, useState } from "react";
import { Button } from "@/components/motion/button";
import {
  CARD_TARGET_CLASS,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/motion/card";
import { Checkbox } from "@/components/motion/checkbox";
import { Switch } from "@/components/motion/switch";

const DOCUMENTS = [
  { id: "contract", title: "Signed contract", description: "The final PDF with every signature and the audit trail." },
  { id: "invoice", title: "Invoice", description: "Itemised billing for the period, ready for accounting." },
];

const SUMMARY = [
  { label: "Plan", value: "Team, yearly" },
  { label: "Seats", value: "12" },
  { label: "Billing email", value: "billing@acme.co" },
];

function DocumentChoice({ id, title, description }: (typeof DOCUMENTS)[number]) {
  const [checked, setChecked] = useState(id === "contract");
  const descriptionId = useId();
  return (
    <Card size="compact" interactive selected={checked}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription id={descriptionId}>{description}</CardDescription>
        <CardAction>
          <Checkbox
            checked={checked}
            onCheckedChange={setChecked}
            aria-label={title}
            aria-describedby={descriptionId}
            className={CARD_TARGET_CLASS}
          />
        </CardAction>
      </CardHeader>
    </Card>
  );
}

export function CardPreview() {
  const [notifications, setNotifications] = useState(true);
  const [digest, setDigest] = useState(false);

  return (
    <div className="grid w-full max-w-3xl items-start gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-3">
        {DOCUMENTS.map((document) => (
          <DocumentChoice key={document.id} {...document} />
        ))}

        <Card variant="muted" size="compact">
          <CardHeader>
            <CardTitle as="h3">Notifications</CardTitle>
            <CardDescription>Choose what reaches your inbox.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <span>Mentions and replies</span>
              <Switch checked={notifications} onCheckedChange={setNotifications} ariaLabel="Mentions and replies" />
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Weekly digest</span>
              <Switch checked={digest} onCheckedChange={setDigest} ariaLabel="Weekly digest" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
        <CardHeader>
          <CardTitle as="h3">Review order</CardTitle>
          <CardDescription>Check the details before you confirm.</CardDescription>
          <CardAction>
            <Button variant="ghost" size="sm">
              Edit
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <dl className="divide-y divide-border">
            {SUMMARY.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="font-medium text-foreground">{row.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
        <CardFooter className="justify-end">
          <Button variant="secondary" size="sm">
            Back
          </Button>
          <Button size="sm">Confirm order</Button>
        </CardFooter>
      </Card>

        <Card className="overflow-hidden pt-0">
          {/* biome-ignore lint/performance/noImgElement: plain img keeps the copy-paste preview portable (no next/image host config). */}
          <img
            src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=720&q=80"
            alt="Bright open-plan studio with long desks and plants"
            width={720}
            height={405}
            loading="lazy"
            className="aspect-video w-full object-cover"
          />
          <CardHeader>
            <CardTitle as="h3">Studio, Lisbon</CardTitle>
            <CardDescription>Desks for 12 people, booked for the March offsite.</CardDescription>
          </CardHeader>
          <CardFooter className="justify-between">
            <span className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">€1,840</span> · 3 days
            </span>
            <Button variant="secondary" size="sm">
              View booking
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
