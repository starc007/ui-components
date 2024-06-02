import { FC, useEffect, useRef } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-okaidia.css";

const RenderCode: FC<{
  code: string;
}> = ({ code }) => {
  const highlighRef = useRef<HTMLDivElement>(null);

  const highlightCode = () => {
    if (highlighRef.current) {
      Prism.highlightElement(highlighRef.current);
    }
  };

  useEffect(() => {
    highlightCode();
  }, [code]);

  return (
    <div className="relative">
      <button
        onClick={() => navigator.clipboard.writeText(code as string)}
        className="absolute right-4 top-2 font-medium bg-blue-600 text-white px-4 py-2 rounded text-sm"
      >
        Copy
      </button>
      <pre className="line-numbers">
        <code ref={highlighRef} className="language-js whitespace-pre-wrap ">
          {code.trim()}
        </code>
      </pre>
    </div>
  );
};

export default RenderCode;
