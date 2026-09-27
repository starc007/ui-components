import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
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
