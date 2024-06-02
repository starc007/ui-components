const Footer = () => {
  return (
    <div className="flex flex-col items-center mt-20">
      <p className="font-medium text-gray-500">
        Made by
        <a
          href="https://saura3h.xyz"
          target="_blank"
          rel="noreferrer"
          className="text-gray-800 ml-1 font-semibold"
        >
          Saurabh
        </a>
      </p>
      <div className="flex items-center gap-2 mt-2">
        <p className="text-sm ">Reach out to me via</p>
        <div className="flex items-center gap-2">
          <a
            href="https://x.com/saurra3h"
            target="_blank"
            rel="noreferrer"
            className="text-gray-500 font-medium text-sm underline"
          >
            Twitter
          </a>
          <a
            href="https://linkedin.com/in/starc007"
            target="_blank"
            rel="noreferrer"
            className="text-gray-500 font-medium text-sm underline"
          >
            Linkedin
          </a>
        </div>
      </div>
    </div>
  );
};

export default Footer;
