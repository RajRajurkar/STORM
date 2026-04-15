import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { 
  Activity,
  LogIn,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useApplication } from '../context/ApplicationContext'; // ✅ ADD

export default function Navbar() {
  const navigate = useNavigate();
  const { hasApplication, applicationResult } = useApplication(); // ✅ ADD

  
  const riskPercentage = hasApplication && applicationResult?.risk_assessment 
    ? (applicationResult.risk_assessment.risk_score * 100).toFixed(0)
    : null;

  const getRiskColor = () => {
    if (!hasApplication || !applicationResult) return null;
    const score = applicationResult.risk_assessment.risk_score;
    if (score < 0.3) return '#22C55E'; // Green
    if (score < 0.5) return '#F59E0B'; // Yellow
    if (score < 0.7) return '#F97316'; // Orange
    return '#EF4444'; // Red
  };

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl shadow-lg bg-gradient-to-r from-gray-900/95 via-gray-900/90 to-gray-900/95 border-b border-gray-800"
    >
      <div className="w-full flex justify-between items-center px-8 md:px-12 py-4 text-white">

        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-3 text-lg md:text-xl font-semibold cursor-pointer group"
        >
          <motion.div
            className="relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <Activity className="w-6 h-6 text-white relative z-10" />
            </div>

            <motion.div
              className="absolute -inset-1 bg-gradient-to-r from-primary-400 to-purple-400 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>

          <motion.div
            className="flex flex-col"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
            }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{ backgroundSize: "200% 200%" }}
          >
            <span className="bg-gradient-to-r from-white via-primary-100 to-white bg-clip-text text-transparent">
              LiveRisk AI
            </span>
            <span className="text-xs text-gray-400 font-normal">
              Intelligent Underwriting
            </span>
          </motion.div>
        </motion.div>

   
        <div className="hidden md:flex gap-10 text-gray-400 font-medium">
          {["Features", "Architecture", "How it Works", "Impact"].map((item, index) => {

            const isArchitecture = item === "Architecture";

            return (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {isArchitecture ? (
                  <Link
                    to="/architecture"
                    className="hover:text-white transition relative group"
                  >
                    {item}
                    <motion.span 
                      className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-primary-500 to-purple-500"
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                ) : (
                  <a
                    href={`#${item.toLowerCase().replace(' ', '-')}`}
                    className="hover:text-white transition relative group"
                  >
                    {item}
                    <motion.span 
                      className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-primary-500 to-purple-500"
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </a>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="flex items-center gap-3">

       
          {hasApplication && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-green-500/30"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CheckCircle className="w-4 h-4 text-green-400" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">Risk Score</span>
                <span 
                  className="text-sm font-bold"
                  style={{ color: getRiskColor() }}
                >
                  {riskPercentage}%
                </span>
              </div>
            </motion.div>
          )}

          {!hasApplication && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium bg-white/5 border border-gray-700 hover:border-primary-500 transition-all duration-300 group relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
              <span className="text-gray-300 group-hover:text-white transition">
                Login
              </span>
            </motion.button>
          )}

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 400 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(hasApplication ? "/dashboard" : "/apply")}
            className="px-6 py-2.5 rounded-xl font-medium bg-gradient-to-r from-primary-600 via-purple-600 to-indigo-600 shadow-lg relative overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6 }}
            />
            <div className="flex items-center gap-2 relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Activity className="w-4 h-4 text-white" />
              </motion.div>
              
              <span>
                {hasApplication ? "View Dashboard" : "Get Started"}
              </span>
              
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="opacity-0 group-hover:opacity-100 transition"
              >
                <LogIn className="w-4 h-4" />
              </motion.div>
            </div>
          </motion.button>

          {hasApplication && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hidden lg:flex items-center gap-2"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/chat")}
                className="px-4 py-2 rounded-xl bg-white/5 border border-gray-700 hover:border-blue-500 transition-all text-sm text-gray-300 hover:text-white relative group"
              >
                <motion.div
                  className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-gray-900"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                AI Chat
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/simulate")}
                className="px-4 py-2 rounded-xl bg-white/5 border border-gray-700 hover:border-purple-500 transition-all text-sm text-gray-300 hover:text-white relative group"
              >
                <motion.div
                  className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-gray-900"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                Simulator
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>

      <motion.div
        className="h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"
        animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "200% 100%" }}
      />
    </motion.nav>
  );
}