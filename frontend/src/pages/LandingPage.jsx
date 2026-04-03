    import { motion } from "framer-motion";
    import { ArrowRight, ExternalLink, CheckCircle } from "lucide-react";
    import Navbar from "./Navbar";

    import {
    BarChart3,
    Cpu,
    Activity,
    TrendingUp,
    Brain,
    Radio,
    Bell,
    PieChart,
    } from "lucide-react";
    import { useNavigate } from "react-router-dom";



    export default function LandingPage() {
    const navigate = useNavigate();
    const features = [
        {
        icon: <BarChart3 />,
        title: "Risk Dashboard",
        desc: "Real-time risk monitoring with live score updates every 2.5 seconds.",
        points: [
            "Live risk score gauge",
            "30-day trend chart",
            "Top risk drivers",
            "Recent alerts",
        ],
        },
        {
        icon: <Cpu />,
        title: "Underwriting Engine",
        desc: "Evaluate individual policyholder risk instantly with AI scoring.",
        points: [
            "Multi-factor scoring",
            "Premium calculation",
            "Risk categorization",
            "Instant recommendations",
        ],
        },
        {
        icon: <Activity />,
        title: "Scenario Simulation",
        desc: "Interactive what-if analysis with real-time recalculation.",
        points: [
            "Interactive sliders",
            "Real-time comparison",
            "Factor breakdown",
            "Contextual insights",
        ],
        },
        {
        icon: <TrendingUp />,
        title: "AI Prediction",
        desc: "12-month risk trajectory forecasting.",
        points: [
            "12-month forecast",
            "Confidence bands",
            "Milestone tracking",
            "Model confidence",
        ],
        },
        {
        icon: <Brain />,
        title: "Explainable AI",
        desc: "Full transparency into risk score calculation.",
        points: [
            "SHAP analysis",
            "Feature attribution",
            "Risk decomposition",
            "TreeSHAP v3",
        ],
        },
        {
        icon: <Radio />,
        title: "Live Monitoring",
        desc: "Continuous policy tracking with real-time events.",
        points: [
            "Event stream",
            "Timeline chart",
            "Multi-source data",
            "Instant alerts",
        ],
        },
        {
        icon: <Bell />,
        title: "Alerts & Insights",
        desc: "Centralized notification hub with fraud detection.",
        points: [
            "Multi-level alerts",
            "Category filtering",
            "Fraud detection",
            "Weekly trends",
        ],
        },
        {
        icon: <PieChart />,
        title: "Portfolio Analytics",
        desc: "Analytics across revenue and risk distribution.",
        points: [
            "Risk distribution",
            "Revenue tracking",
            "Fraud analytics",
            "Model performance",
        ],
        },
    ];

    return (
        <div className="min-h-screen bg-[#030712] text-white relative overflow-hidden font-[Inter]">

        {/* Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />

        {/* Glow */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex justify-center items-center"
        >
            <div className="w-[650px] h-[650px] bg-purple-700/20 rounded-full blur-[140px] animate-pulse" />
        </motion.div>

        <Navbar />

        {/* HERO */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 pt-28 md:pt-32">

            <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 px-6 py-2 rounded-full border border-green-400/20 bg-green-500/10 text-green-400 text-sm"
            >
            ● Live Risk Intelligence Engine Active
            </motion.div>

            <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[64px] md:text-[96px] font-bold leading-[1.05] max-w-5xl"
            >
            Continuous{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Risk
            </span>
            <br />
            Intelligence <span className="text-gray-500">Platform</span>
            </motion.h1>

            <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-gray-400 text-xl md:text-2xl max-w-3xl"
            >
            AI-powered underwriting analytics that monitor, predict, and explain
            policyholder risk in real-time.
            </motion.p>

            <motion.div className="flex gap-6 mt-14">
            <motion.button
                onClick={() => navigate("/dashboard")}
                whileHover={{ scale: 1.08 }}
                className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-500 px-10 py-5 rounded-2xl font-semibold"
            >
                Enter Dashboard <ArrowRight size={18} />
            </motion.button>

<motion.button
  onClick={() => navigate("/architecture")}
  whileHover={{ scale: 1.05 }}
  className="flex items-center gap-3 border border-gray-600 px-10 py-5 rounded-2xl text-gray-300"
>
  View Architecture <ExternalLink size={18} />
</motion.button>
            </motion.div>
        </div>

        {/* STATS */}
        <div className="mt-32 py-12 bg-gradient-to-r from-purple-900/40 to-indigo-900/40">
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
                { value: "91%", label: "Model AUC Score" },
                { value: "1247", label: "Active Policies" },
                { value: "99.8%", label: "API Uptime" },
                { value: "47", label: "AI Features" },
            ].map((item, i) => (
                <motion.div key={i} whileHover={{ scale: 1.05 }}>
                <h2 className="text-4xl font-bold">{item.value}</h2>
                <p className="text-gray-300 mt-2">{item.label}</p>
                </motion.div>
            ))}
            </div>
        </div>

        {/* CORE */}
        <div className="text-center mt-32 px-4">
            <div className="inline-block px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-full mb-6">
            ✦ Core Capabilities
            </div>

            <h2 className="text-4xl md:text-6xl font-bold">
            Everything you need for <br />
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                intelligent underwriting
            </span>
            </h2>
        </div>

        {/* FEATURES */}
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
            visible: { transition: { staggerChildren: 0.1 } },
            }}
            className="max-w-7xl mx-auto mt-20 px-4 grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
            {features.map((card, i) => (
            <motion.div
                key={i}
                variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ y: -10 }}
                className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl"
            >
                <div className="mb-4 w-12 h-12 flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl">
                {card.icon}
                </div>

                <h3 className="font-semibold mb-2">{card.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{card.desc}</p>

                <ul className="space-y-2">
                {card.points.map((p, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-gray-300">
                    <CheckCircle size={14} className="text-green-400" />
                    {p}
                    </li>
                ))}
                </ul>
            </motion.div>
            ))}
        </motion.div>



    {/* FOOTER */}
    <footer className="mt-24 border-t border-white/10 bg-white/[0.02] backdrop-blur-xl">
    <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-10 text-gray-400">

        {/* Logo */}
        <div>
        <div className="flex items-center gap-3 text-white font-semibold text-lg mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
            ⚡
            </div>
            LiveRisk AI
        </div>
        <p className="text-sm">
            AI-powered risk intelligence platform transforming underwriting
            with real-time insights.
        </p>
        </div>

        {/* Product */}
        <div>
        <h4 className="text-white font-semibold mb-4">Product</h4>
        <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">Features</li>
            <li className="hover:text-white cursor-pointer">Pricing</li>
            <li className="hover:text-white cursor-pointer">API</li>
            <li className="hover:text-white cursor-pointer">Integrations</li>
        </ul>
        </div>

        {/* Company */}
        <div>
        <h4 className="text-white font-semibold mb-4">Company</h4>
        <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">About</li>
            <li className="hover:text-white cursor-pointer">Careers</li>
            <li className="hover:text-white cursor-pointer">Blog</li>
            <li className="hover:text-white cursor-pointer">Contact</li>
        </ul>
        </div>

        {/* Legal */}
        <div>
        <h4 className="text-white font-semibold mb-4">Legal</h4>
        <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">Privacy Policy</li>
            <li className="hover:text-white cursor-pointer">Terms of Service</li>
            <li className="hover:text-white cursor-pointer">Security</li>
        </ul>
        </div>
    </div>

    {/* Bottom */}
    <div className="text-center text-gray-500 text-sm py-6 border-t border-white/10">
        © 2026 LiveRisk AI. All rights reserved.
    </div>
    </footer>
        </div>
        
    );
    }