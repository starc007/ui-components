import { afterEach, describe, expect, mock, test } from "bun:test";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import {
  SignUpForm,
  passwordStrength,
  type SignUpValues,
} from "@/components/motion/signup-form";

afterEach(cleanup);

const VALID: SignUpValues = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  password: "correct horse battery",
  confirmPassword: "correct horse battery",
  terms: true,
};

function fill(getByLabelText: (text: string) => HTMLElement, values: SignUpValues) {
  fireEvent.change(getByLabelText("Name"), { target: { value: values.name } });
  fireEvent.change(getByLabelText("Email"), { target: { value: values.email } });
  fireEvent.change(getByLabelText("Password"), {
    target: { value: values.password },
  });
  fireEvent.change(getByLabelText("Confirm password"), {
    target: { value: values.confirmPassword },
  });
}

describe("SignUpForm validation timing", () => {
  test("does not flag a field while it is being typed for the first time", () => {
    const { getByLabelText, queryByText } = render(<SignUpForm />);

    fireEvent.change(getByLabelText("Email"), {
      target: { value: "not-an-email" },
    });

    expect(queryByText("That doesn't look like an email address.")).toBeNull();
  });

  test("flags the field once it is left", () => {
    const { getByLabelText, queryByText } = render(<SignUpForm />);
    const email = getByLabelText("Email");

    fireEvent.change(email, { target: { value: "not-an-email" } });
    fireEvent.blur(email);

    expect(queryByText("That doesn't look like an email address.")).not.toBeNull();
  });

  test("clears the error on the next keystroke once the field is fixed", () => {
    const { getByLabelText } = render(<SignUpForm />);
    const email = getByLabelText("Email");
    const field = email.parentElement;

    fireEvent.change(email, { target: { value: "not-an-email" } });
    fireEvent.blur(email);
    expect(email.getAttribute("aria-invalid")).toBe("true");
    expect(field?.dataset.state).toBe("error");

    // Reward early: no second blur required. Asserted on the field state rather
    // than the message text, which AnimatePresence keeps mounted while it exits.
    fireEvent.change(email, { target: { value: "ada@example.com" } });

    expect(email.getAttribute("aria-invalid")).toBeNull();
    expect(field?.dataset.state).toBe("success");
  });

  test("reports mismatched passwords", () => {
    const { getByLabelText, queryByText } = render(<SignUpForm />);
    const confirm = getByLabelText("Confirm password");

    fireEvent.change(getByLabelText("Password"), {
      target: { value: "a-long-enough-password" },
    });
    fireEvent.change(confirm, { target: { value: "something-else" } });
    fireEvent.blur(confirm);

    expect(queryByText("Passwords don't match.")).not.toBeNull();
  });
});

describe("SignUpForm submission", () => {
  test("submitting an empty form surfaces every error and does not call onSubmit", async () => {
    const onSubmit = mock(() => {});
    const { container, queryByText } = render(<SignUpForm onSubmit={onSubmit} />);
    const form = container.querySelector("form");
    if (!form) throw new Error("form did not render");

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(queryByText("Enter your name.")).not.toBeNull();
    expect(queryByText("Enter your email.")).not.toBeNull();
    expect(queryByText("Choose a password.")).not.toBeNull();
    expect(queryByText("Accept the terms to continue.")).not.toBeNull();
  });

  test("submits the collected values once valid", async () => {
    const onSubmit = mock((_values: SignUpValues) => {});
    const { container, getByLabelText, getByRole } = render(
      <SignUpForm onSubmit={onSubmit} />,
    );
    const form = container.querySelector("form");
    if (!form) throw new Error("form did not render");

    fill(getByLabelText, VALID);
    fireEvent.click(getByRole("checkbox"));

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0]?.[0]).toEqual(VALID);
  });

  test("drives the button through loading into success", async () => {
    let release: (() => void) | undefined;
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });

    const { container, getByLabelText, getByRole } = render(
      <SignUpForm onSubmit={() => pending} />,
    );
    const form = container.querySelector("form");
    if (!form) throw new Error("form did not render");

    fill(getByLabelText, VALID);
    fireEvent.click(getByRole("checkbox"));

    await act(async () => {
      fireEvent.submit(form);
    });

    const submit = getByRole("button", { name: /creating account/i });
    expect(submit.getAttribute("aria-busy")).toBe("true");

    await act(async () => {
      release?.();
      await pending;
    });

    expect(getByRole("button", { name: /account created/i })).toBeDefined();
  });

  test("falls back to the error state when onSubmit rejects", async () => {
    const { container, getByLabelText, getByRole } = render(
      <SignUpForm
        onSubmit={() => Promise.reject(new Error("email taken"))}
      />,
    );
    const form = container.querySelector("form");
    if (!form) throw new Error("form did not render");

    fill(getByLabelText, VALID);
    fireEvent.click(getByRole("checkbox"));

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(getByRole("button", { name: /try again/i })).toBeDefined();
  });

  test("honours a caller-supplied validate function", async () => {
    const onSubmit = mock(() => {});
    const { container, queryByText } = render(
      <SignUpForm
        onSubmit={onSubmit}
        validate={() => ({ email: "Use your work address." })}
      />,
    );
    const form = container.querySelector("form");
    if (!form) throw new Error("form did not render");

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(queryByText("Use your work address.")).not.toBeNull();
    // Built-in rules are replaced, not merged.
    expect(queryByText("Enter your name.")).toBeNull();
  });
});

describe("passwordStrength", () => {
  test("scores anything under the minimum as zero", () => {
    expect(passwordStrength("")).toBe(0);
    expect(passwordStrength("Ab1!")).toBe(0);
    expect(passwordStrength("Ab1!xyz")).toBe(0);
  });

  test("weights length above character variety", () => {
    // Symbols and mixed case cannot rescue a barely-long-enough password...
    expect(passwordStrength("Ab1!efgh")).toBe(2);
    // ...while plain lowercase length climbs on its own.
    expect(passwordStrength("abcdefghijklmnop")).toBe(3);
  });

  test("caps at four", () => {
    expect(passwordStrength(`Ab1!${"x".repeat(40)}`)).toBe(4);
  });
});
