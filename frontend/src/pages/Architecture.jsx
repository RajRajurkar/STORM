import { motion } from "framer-motion";
import Navbar from "./Navbar";
import {
  Database,
  Cpu,
  Eye,
  TrendingUp,
  Bell,
} from "lucide-react";

export default function Architecture() {
  return (
    <div className="min-h-screen w-full bg-[#030712] text-white relative overflow-hidden font-[Inter]">

      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

      <div className="absolute inset-0 flex justify-center items-center">
        <div className="w-[700px] h-[700px] bg-purple-700/20 rounded-full blur-[150px]" />
      </div>

      <Navbar />

      {/* CONTENT */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-12-">

        {/* HEADER */}
        <div className="text-center mb-24">
          <div className="inline-block px-4 py-2 bg-purple-500/10 text-purple-400 rounded-full mb-6">
            ✦ System Architecture
          </div>

          <h1 className="text-4xl md:text-6xl font-bold">
            How LiveRisk AI is{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              architected
            </span>
          </h1>

          <p className="text-gray-400 mt-6 max-w-2xl mx-auto">
            A layered, event-driven architecture designed for real-time risk processing.
          </p>
        </div>

        {/* TIMELINE */}
        <div className="relative">

          {/* Vertical Line */}
          <div className="absolute left-1/2 top-0 h-full w-[2px] bg-white/10 -translate-x-1/2" />

          <div className="space-y-28">

            {/* STEP 1 */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between"
            >
              <div className="w-[45%] text-right">
                <h3 className="text-xl font-semibold">Data Ingestion Layer</h3>
                <p className="text-gray-400 mt-2">
                 Claims DB ,Health Records API,Location Services,Market Data,Policy Registry,Document Store.
                </p>
              </div>

              <div className="relative z-10 w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Database />
                <span className="absolute -top-2 -right-2 text-xs bg-black px-2 py-0.5 rounded-full">
                  01
                </span>
              </div>

              <div className="w-[45%]" />
            </motion.div>

            {/* STEP 2 */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between"
            >
              <div className="w-[45%]" />

              <div className="relative z-10 w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Cpu />
                <span className="absolute -top-2 -right-2 text-xs bg-black px-2 py-0.5 rounded-full">
                  02
                </span>
              </div>

              <div className="w-[45%]">
                <h3 className="text-xl font-semibold">
Processing & AI Engine</h3>
                <p className="text-gray-400 mt-2">
                  Risk Scorer,ML Model (GBT),SHAP Engine,Forecast Engine,Fraud Detector,Stream Processor
                </p>
              </div>
            </motion.div>

            {/* STEP 3 */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between"
            >
              <div className="w-[45%] text-right">
                <h3 className="text-xl font-semibold">
API & State Management</h3>
                <p className="text-gray-400 mt-2">
                  REST API Gateway,WebSocket Serve,Auth & RBAC,React State (hooks),Config Manager
                </p>
              </div>

              <div className="relative z-10 w-14 h-14 bg-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Eye />
                <span className="absolute -top-2 -right-2 text-xs bg-black px-2 py-0.5 rounded-full">
                  03
                </span>
              </div>

              <div className="w-[45%]" />
            </motion.div>

            {/* STEP 4 */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between"
            >
              <div className="w-[45%]" />

              <div className="relative z-10 w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp />
                <span className="absolute -top-2 -right-2 text-xs bg-black px-2 py-0.5 rounded-full">
                  04
                </span>
              </div>

              <div className="w-[45%]">
                <h3 className="text-xl font-semibold">Presentation Layer (React + Vite)</h3>
                <p className="text-gray-400 mt-2">
                  Dashboard,Underwriting,Simulation,Prediction,Explainable AI,Monitoring,Alerts,Analytics
                </p>
              </div>
            </motion.div>

            
          </div>
        </div>

      </div>
      <div className="mt-20 ">

  <div className="my-32 border-t border-white mx-auto" />
  {/* Heading */}
  <div className="text-center mb-20">
    <div className="inline-block px-4 py-2 bg-yellow-500/10 text-yellow-400 rounded-full mb-6">
      ✦ How It Works
    </div>

    <h2 className="text-4xl md:text-6xl font-bold">
      From raw data to{" "}
      <span className="text-yellow-400">actionable risk intelligence</span>
    </h2>
  </div>

  {/* Timeline */}
  <div className="relative max-w-5xl mx-auto mb-20">

    {/* Vertical Line */}
    <div className="absolute left-1/2 top-0 h-full w-[2px] bg-white/10 -translate-x-1/2" />

    <div className="space-y-24">

      {/* STEP 1 */}
      <div className="flex items-center justify-between">
        <div className="w-[45%] text-right">
          <h3 className="text-xl font-semibold">Multi-Source Data Ingestion</h3>
          <p className="text-gray-400 mt-2">
            Real-time feeds from claims databases, health APIs, location services,
            and market data are continuously ingested and normalized into a unified model.
          </p>
        </div>

        <div className="relative z-10 w-14 h-14 bg-cyan-500 rounded-xl flex items-center justify-center">
          <Database />
          <span className="absolute -top-2 -right-2 text-xs bg-black px-2 py-0.5 rounded-full">
            01
          </span>
        </div>

        <div className="w-[45%]" />
      </div>

      {/* STEP 2 */}
      <div className="flex items-center justify-between">
        <div className="w-[45%]" />

        <div className="relative z-10 w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center">
          <Cpu />
          <span className="absolute -top-2 -right-2 text-xs bg-black px-2 py-0.5 rounded-full">
            02
          </span>
        </div>

        <div className="w-[45%]">
          <h3 className="text-xl font-semibold">AI Risk Scoring Engine</h3>
          <p className="text-gray-400 mt-2">
            A Gradient Boosted Tree model processes features and generates
            continuous risk scores updated every few seconds.
          </p>
        </div>
      </div>

      {/* STEP 3 */}
      <div className="flex items-center justify-between">
        <div className="w-[45%] text-right">
          <h3 className="text-xl font-semibold">Explainable AI (SHAP)</h3>
          <p className="text-gray-400 mt-2">
            TreeSHAP decomposes each risk score into factors, helping
            underwriters understand exactly why a policy is flagged.
          </p>
        </div>

        <div className="relative z-10 w-14 h-14 bg-pink-500 rounded-xl flex items-center justify-center">
          <Eye />
          <span className="absolute -top-2 -right-2 text-xs bg-black px-2 py-0.5 rounded-full">
            03
          </span>
        </div>

        <div className="w-[45%]" />
      </div>

      {/* STEP 4 */}
      <div className="flex items-center justify-between">
        <div className="w-[45%]" />

        <div className="relative z-10 w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center">
          <TrendingUp />
          <span className="absolute -top-2 -right-2 text-xs bg-black px-2 py-0.5 rounded-full">
            04
          </span>
        </div>

        <div className="w-[45%]">
          <h3 className="text-xl font-semibold">Predictive Forecasting</h3>
          <p className="text-gray-400 mt-2">
            12-month trajectory modeling with confidence intervals helps anticipate risk.
          </p>
        </div>
      </div>

      {/* STEP 5 */}
      <div className="flex items-center justify-between">
        <div className="w-[45%] text-right">
          <h3 className="text-xl font-semibold">Intelligent Alerting</h3>
          <p className="text-gray-400 mt-2">
            Multi-level alerts surface fraud signals, anomalies, and risk spikes.
          </p>
        </div>

        <div className="relative z-10 w-14 h-14 bg-red-500 rounded-xl flex items-center justify-center">
          <Bell />
          <span className="absolute -top-2 -right-2 text-xs bg-black px-2 py-0.5 rounded-full">
            05
          </span>
        </div>

        <div className="w-[45%]" />
      </div>

    </div>
  </div>
</div>
    </div>
  );
}