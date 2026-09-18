import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import {
  ApprovalCard,
  type ApprovalCardQuestion,
} from "@/components/agents/approval-card";

afterEach(cleanup);

const QUESTION: ApprovalCardQuestion = {
  id: "theme",
  title: "Choose a theme",
  options: [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ],
  allowCustom: true,
};

describe("ApprovalCard question navigation", () => {
  test("omits single-question navigation while keeping choice and custom submission", () => {
    const onSubmit = mock(() => {});
    const onStepChange = mock(() => {});
    const { getByRole, queryByRole, queryByText } = render(
      <ApprovalCard
        questions={[QUESTION]}
        onSubmit={onSubmit}
        onStepChange={onStepChange}
      />,
    );

    expect(queryByText("1/1")).toBeNull();
    expect(queryByText("Question 1 of 1")).toBeNull();
    expect(queryByRole("button", { name: "Previous question" })).toBeNull();
    expect(queryByRole("button", { name: "Next question" })).toBeNull();
    expect(queryByText("Input required")).toBeNull();
    const submit = getByRole("button", { name: "Submit response" });
    expect((submit as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(getByRole("radio", { name: "Dark" }));
    expect((submit as HTMLButtonElement).disabled).toBe(false);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onStepChange).not.toHaveBeenCalled();
    fireEvent.click(submit);
    expect(onSubmit).toHaveBeenLastCalledWith({
      theme: { selected: ["dark"], custom: "" },
    });

    fireEvent.change(getByRole("textbox"), { target: { value: "Sepia" } });
    expect(getByRole("radio", { name: "Dark" }).getAttribute("aria-checked")).toBe(
      "false",
    );
    fireEvent.click(submit);
    expect(onSubmit).toHaveBeenLastCalledWith({
      theme: { selected: [], custom: "Sepia" },
    });

    fireEvent.change(getByRole("textbox"), { target: { value: "  " } });
    expect((submit as HTMLButtonElement).disabled).toBe(true);
  });

  test("preserves submitting and answered states without single-question navigation", () => {
    const props = {
      questions: [QUESTION],
      defaultAnswers: { theme: { selected: ["light"], custom: "" } },
    };
    const { container, getByRole, getByText, queryByRole, queryByText, rerender } =
      render(<ApprovalCard {...props} status="submitting" />);

    expect(container.firstElementChild?.getAttribute("aria-busy")).toBe("true");
    expect((getByRole("radio", { name: "Light" }) as HTMLButtonElement).disabled).toBe(true);
    expect((getByRole("textbox") as HTMLInputElement).disabled).toBe(true);
    expect((getByRole("button", { name: "Submit response" }) as HTMLButtonElement).disabled).toBe(true);
    expect(queryByText("1/1")).toBeNull();
    expect(queryByText("Question 1 of 1")).toBeNull();
    expect(queryByRole("button", { name: "Previous question" })).toBeNull();

    rerender(<ApprovalCard {...props} status="answered" result="Theme saved" />);
    expect(container.firstElementChild?.getAttribute("aria-busy")).toBe("false");
    expect(getByText("Response submitted")).toBeTruthy();
    expect(getByText("Theme saved")).toBeTruthy();
    expect(queryByRole("radio")).toBeNull();
    expect(queryByRole("textbox")).toBeNull();
    expect(queryByRole("button", { name: "Submit response" })).toBeNull();
  });

  test("retains multi-question progress, next, back, and final submission", async () => {
    const onSubmit = mock(() => {});
    const { getByRole, getByText, queryByRole } = render(
      <ApprovalCard
        questions={[
          { ...QUESTION, autoAdvance: false },
          { id: "notes", title: "Add notes", allowCustom: true },
        ]}
        onSubmit={onSubmit}
      />,
    );

    expect(getByText("1/2")).toBeTruthy();
    expect(getByText("Question 1 of 2")).toBeTruthy();
    expect((getByRole("button", { name: "Previous question" }) as HTMLButtonElement).disabled).toBe(true);
    expect((getByRole("button", { name: "Next question" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(getByRole("radio", { name: "Light" }));
    fireEvent.click(getByRole("button", { name: "Next question" }));
    await waitFor(() => expect(getByRole("heading", { name: "Add notes" })).toBeTruthy());
    await waitFor(() => expect(queryByRole("radio")).toBeNull());
    expect(getByText("2/2")).toBeTruthy();
    expect(getByText("Question 2 of 2")).toBeTruthy();
    expect(queryByRole("button", { name: "Next question" })).toBeNull();
    expect((getByRole("button", { name: "Previous question" }) as HTMLButtonElement).disabled).toBe(false);
    fireEvent.change(getByRole("textbox"), { target: { value: "Use system theme" } });

    fireEvent.click(getByRole("button", { name: "Previous question" }));
    await waitFor(() => expect(getByRole("radio", { name: "Light" }).getAttribute("aria-checked")).toBe("true"));
    expect(getByText("1/2")).toBeTruthy();
    fireEvent.click(getByRole("button", { name: "Next question" }));
    await waitFor(() => expect(queryByRole("radio")).toBeNull());
    await waitFor(() => expect((getByRole("textbox") as HTMLInputElement).value).toBe("Use system theme"));
    fireEvent.click(getByRole("button", { name: "Submit response" }));
    expect(onSubmit).toHaveBeenCalledWith({
      theme: { selected: ["light"], custom: "" },
      notes: { selected: [], custom: "Use system theme" },
    });
  });

  test("still auto-advances a single choice in a multi-question card", async () => {
    const { getByRole, getByText } = render(
      <ApprovalCard
        questions={[
          QUESTION,
          { id: "notes", title: "Add notes", allowCustom: true },
        ]}
      />,
    );

    fireEvent.click(getByRole("radio", { name: "Dark" }));
    await waitFor(() => expect(getByRole("heading", { name: "Add notes" })).toBeTruthy());
    expect(getByText("2/2")).toBeTruthy();
    expect(getByText("Question 2 of 2")).toBeTruthy();
  });
});
