import { afterEach, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { axe } from "jest-axe";
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

afterEach(cleanup);

test("content card exposes its heading, rows and actions", async () => {
  const { container, getByRole } = render(
    <Card>
      <CardHeader>
        <CardTitle as="h2">Review order</CardTitle>
        <CardDescription>Check the details before you confirm.</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <dl>
          <div>
            <dt>Seats</dt>
            <dd>12</dd>
          </div>
        </dl>
      </CardContent>
      <CardFooter>
        <Button size="sm">Confirm order</Button>
      </CardFooter>
    </Card>,
  );
  expect(getByRole("heading", { level: 2, name: "Review order" })).toBeTruthy();
  expect(getByRole("button", { name: "Edit" })).toBeTruthy();
  expect(getByRole("button", { name: "Confirm order" })).toBeTruthy();
  expect((await axe(container)).violations).toEqual([]);
});

test("selectable card keeps one named, described checkbox as its target", async () => {
  const { container, getByRole } = render(
    <Card size="compact" variant="muted" interactive selected>
      <CardHeader>
        <CardTitle>Invoice</CardTitle>
        <CardDescription id="invoice-description">Itemised billing for the period.</CardDescription>
        <CardAction>
          <Checkbox
            checked
            onCheckedChange={() => {}}
            aria-label="Invoice"
            aria-describedby="invoice-description"
            className={CARD_TARGET_CLASS}
          />
        </CardAction>
      </CardHeader>
    </Card>,
  );
  const checkbox = getByRole("checkbox", { name: "Invoice" });
  expect(checkbox.getAttribute("aria-checked")).toBe("true");
  expect(checkbox.getAttribute("aria-describedby")).toBe("invoice-description");
  expect((await axe(container)).violations).toEqual([]);
});
