import { navCodes } from "@/components/AllNavs/AllNavsCode";
import Navbar1 from "@/components/AllNavs/Navbar1";
import Navbar2 from "@/components/AllNavs/Navbar2";
import Navbar3 from "@/components/AllNavs/Navbar3";
import { RenderCode, SlideOver } from "@/components/appComp";
import { useState } from "react";

const cmnClas = "w-full flex items-center border rounded-xl py-4 px-4 mt-1";

const NavbarList = [
  { id: 1, component: <Navbar1 /> },
  { id: 2, component: <Navbar2 /> },
  { id: 3, component: <Navbar3 /> },
];

const NavbarsPage = () => {
  const [whichCodeToDisplay, setWhichCodeToDisplay] = useState({
    id: 1,
  });

  const [isSlideOpen, setIsSlideOpen] = useState(false);

  const code = navCodes[whichCodeToDisplay.id];

  return (
    <div className="flex flex-col">
      <p className="font-semibold">Navbars</p>
      <div className="space-y-16 mt-4">
        {NavbarList.map((item) => (
          <div key={item.id}>
            {item.id === 3 && (
              <p className="font-medium mb-2">Navbar with Dropdown</p>
            )}

            <div className="flex items-center gap-4">
              {["Preview", "Code"].map((it) => (
                <button
                  onClick={() => {
                    setIsSlideOpen(true);
                    setWhichCodeToDisplay({
                      id: item.id,
                    });
                  }}
                  key={it}
                  className={`text-gray-400 font-medium text-sm hover:text-gray-800 ${
                    it === "Preview" && "text-gray-800"
                  } `}
                >
                  {it}
                </button>
              ))}
            </div>
            <div className={cmnClas}>{item.component}</div>
          </div>
        ))}
      </div>

      <SlideOver
        isSlideOpen={isSlideOpen}
        setIsSlideOpen={setIsSlideOpen}
        title="Code"
      >
        <RenderCode code={code} />
      </SlideOver>
    </div>
  );
};

export default NavbarsPage;
