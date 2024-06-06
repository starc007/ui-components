import { Input } from "@/components/UI";
import { RenderCode } from "@/components/appComp";
import React, { useMemo } from "react";

const ShowInputs = () => {
  const { typeString, codeString } = useMemo(() => {
    try {
      const codeStr =
        require("!!raw-loader!@/components/UI/Input/input.main.tsx").default;
      const filteredCodeStr = codeStr.split("\n").slice(1).join("\n");

      const typeStr =
        require("!!raw-loader!@/components/UI/Input/input.types.ts").default;
      return { typeString: typeStr, codeString: filteredCodeStr };
    } catch (e) {
      return { typeString: "", codeString: "" };
    }
  }, []);

  return (
    <div className="flex flex-col">
      <p className="text-lg font-semibold">
        Fully typed Custom Input Component
      </p>
      <div className="mt-4 bg-gray-50 p-4 rounded-xl ">
        <Input
          id="input1"
          label="Custom input with error message and label"
          placeholder="Enter your text"
          errorText="hehe i am error message"
          isInputRequired
        />
      </div>

      <div className="mt-6">
        <p className="font-medium text-primary mb-2">Input Types</p>
        <RenderCode code={typeString} />
        <p className="font-medium text-primary mt-6 mb-2">Input Component</p>
        <RenderCode code={codeString} />
      </div>
    </div>
  );
};

export default ShowInputs;
