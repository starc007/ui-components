import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import { Input } from "@/components/motion/input";

afterEach(cleanup);

describe("Input", () => {
  test("exposes its input ref and configurable slots", () => {
    const ref = createRef<HTMLInputElement>();
    const { getByLabelText, container } = render(
      <Input
        ref={ref}
        label="Email"
        className="root-class"
        classNames={{
          field: "field-class",
          input: "h-14 px-6",
          label: "label-class",
        }}
      />,
    );

    const input = getByLabelText("Email") as HTMLInputElement;
    const field = input.parentElement;

    expect(ref.current).toBe(input);
    expect(container.firstElementChild?.classList).toContain("root-class");
    expect(field?.classList).toContain("field-class");
    expect(input.classList).toContain("h-14");
    expect(input.classList).toContain("px-6");
    expect(container.querySelector("label")?.classList).toContain("label-class");
  });

  test("composes native focus events with internal state", () => {
    const onFocus = mock(() => {});
    const onBlur = mock(() => {});
    const { getByLabelText } = render(
      <Input label="Name" onFocus={onFocus} onBlur={onBlur} />,
    );
    const input = getByLabelText("Name") as HTMLInputElement;
    const field = input.parentElement;

    fireEvent.focus(input);
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(field?.dataset.state).toBe("focused");

    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(field?.dataset.state).toBe("idle");
  });

  test("keeps the string value change callback", () => {
    const onChange = mock(() => {});
    const { getByLabelText } = render(
      <Input label="Query" onChange={onChange} />,
    );

    fireEvent.change(getByLabelText("Query"), {
      target: { value: "beUI" },
    });

    expect(onChange).toHaveBeenCalledWith("beUI");
  });
});
