import { Button, Input, Select } from "@/components";
import { useState } from "react";

const Home = () => {
  const [selectDetails, setSelectDetails] = useState({
    isMulti: false,
  });

  const handleChange = (
    selectedOption: {
      label: string;
      value: string;
    }[]
  ) => {
    console.log("selectedOptio", selectedOption);
  };

  return (
    <div>
      <p className="text-2xl font-bold py-5">Full Customizable Ui Components</p>
      <div>
        <p>Custom Select Component</p>
        <div className="flex items-center mt-3">
          <p className="text-semibold mr-2">isMulti</p>
          <input
            type="checkbox"
            checked={selectDetails.isMulti}
            onChange={(e) =>
              setSelectDetails({ ...selectDetails, isMulti: e.target.checked })
            }
          />
        </div>
        <Select
          isMulti={selectDetails.isMulti}
          defaultSelectValue={[{ label: "Red", value: "red" }]}
          options={[
            { label: "Blue", value: "blue" },
            { label: "Orange", value: "orange" },
            { label: "Black", value: "black" },
            { label: "Red", value: "red" },
            { label: "Yellow", value: "yellow" },
            { label: "Green", value: "green" },
            { label: "Purple", value: "purple" },
            { label: "Pink", value: "pink" },
          ]}
          onSelectChange={handleChange}
        />
      </div>

      <div className="mt-4">
        <p>Custom Button Component</p>

        <div className="flex items-center gap-5 ">
          <Button className="mt-3" size="large">
            Hey there
          </Button>
          <Button className="mt-3" size="medium">
            Hey there
          </Button>
          <Button className="mt-3" size="small">
            Hey there
          </Button>
        </div>
      </div>
      <div className="mt-4">
        <p>Custom Input Component</p>
        <Input placeholder="I am INPUT" />
      </div>
    </div>
  );
};

export default Home;
