import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="container mx-auto sticky top-0 glass__bg h-16 py-3 px-4">
      <div className="flex justify-between items-center">
        <Link to="/" className="font-semibold text-xl">
          Cool UI
        </Link>
        <div className="flex items-center gap-5 text-sm font-medium">
          <Link to="/buttons" className="text-gray-800">
            Explore
          </Link>
          <Link to="/buttons" className="text-gray-800">
            Pricing
          </Link>
          <button className="bg-gray-800 text-white px-5 py-2 rounded-full">
            Contact
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
