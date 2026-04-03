import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl shadow-lg"
    >
      <div className="w-full flex justify-between items-center px-8 md:px-12 py-4 text-white">

        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-3 text-lg md:text-xl font-semibold cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center shadow-md">
            ⚡
          </div>
          LiveRisk AI
        </motion.div>

        {/* Links */}
        <div className="hidden md:flex gap-10 text-gray-400 font-medium">
          {["Features", "Architecture", "How it Works", "Impact"].map((item) => (
            <a
              key={item}
              href="#"
              className="hover:text-white transition relative group"
            >
              {item}
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
        </div>

        {/* Button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/dashboard")}
          className="px-6 py-2.5 rounded-xl font-medium bg-gradient-to-r from-purple-500 to-indigo-500 shadow-md"
        >
          Launch App
        </motion.button>
      </div>
    </motion.nav>
  );
}