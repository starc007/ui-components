"use client";

import {
  AdaptiveStepper,
  AdaptiveStepperDecrement,
  AdaptiveStepperIncrement,
  AdaptiveStepperValue,
} from "@/components/motion/adaptive-stepper";

export function AdaptiveStepperPreview() {
  return (
    <div className="flex min-h-[320px] w-full items-center justify-center px-4">
      <AdaptiveStepper defaultValue={2} min={0} max={3} aria-label="Guests">
        <AdaptiveStepperDecrement />
        <AdaptiveStepperValue />
        <AdaptiveStepperIncrement />
      </AdaptiveStepper>
    </div>
  );
}
