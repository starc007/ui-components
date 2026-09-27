import { afterEach, describe, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/motion/breadcrumb";

afterEach(cleanup);

describe("Breadcrumb accessibility", () => {
  test("exposes a labelled navigation, ancestor links and one current page", async () => {
    const { container, getByRole } = render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem key="home">
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem key="projects">
            <BreadcrumbSeparator />
            <BreadcrumbLink href="/projects" render={(props) => <a {...props} />}>Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem key="website">
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbPage>Website</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );
    expect(getByRole("navigation", { name: "Breadcrumb" })).toBeTruthy();
    expect(getByRole("link", { name: "Projects" }).getAttribute("href")).toBe("/projects");
    expect(container.querySelectorAll('[aria-current="page"]').length).toBe(1);
    expect(container.querySelectorAll('li').length).toBe(3);
    expect((await axe(container)).violations).toEqual([]);
  });

  test("supports a single current page and a custom landmark name", async () => {
    const { container, getByRole, queryByRole } = render(
      <Breadcrumb aria-label="Project location">
        <BreadcrumbList>
          <BreadcrumbItem key="home"><BreadcrumbPage>Workspace</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );
    expect(getByRole("navigation", { name: "Project location" })).toBeTruthy();
    expect(queryByRole("link")).toBeNull();
    expect((await axe(container)).violations).toEqual([]);
  });
});


test("collapsed ancestors are keyboard accessible and Escape returns to the ellipsis", async () => {
  const { getByRole, queryByRole } = render(
    <Breadcrumb>
      <BreadcrumbList maxItems={3}>
        {["Home", "Projects", "Website", "Components", "Navigation"].map((label, index) => (
          <BreadcrumbItem key={label}>
            {index > 0 && <BreadcrumbSeparator />}
            {index === 4 ? <BreadcrumbPage>{label}</BreadcrumbPage> : <BreadcrumbLink href={`/${label.toLowerCase()}`}>{label}</BreadcrumbLink>}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>,
  );
  expect(queryByRole("link", { name: "Projects" })).toBeNull();
  const trigger = getByRole("button", { name: "Show hidden paths" });
  act(() => trigger.focus());
  fireEvent.keyDown(trigger, { key: "ArrowDown" });
  await waitFor(() => expect(getByRole("dialog", { name: "Show hidden paths" })).toBeTruthy());
  await waitFor(() => expect(document.activeElement).toBe(getByRole("link", { name: "Projects" })));
  expect((await axe(document.body, { rules: { region: { enabled: false } } })).violations).toEqual([]);
  fireEvent.keyDown(document.activeElement ?? window, { key: "Escape" });
  expect(document.activeElement).toBe(trigger);
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
});
