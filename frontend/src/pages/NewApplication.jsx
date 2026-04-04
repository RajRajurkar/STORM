import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Heart,
  Activity,
  Watch,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { underwriteApplication } from "../utils/api";
import { DEFAULT_APPLICATION } from "../utils/constants";
import { useApplication } from "../context/ApplicationContext";

const NewApplication = () => {
  const navigate = useNavigate();
  const { saveApplicationResult } = useApplication();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_APPLICATION);

  const steps = [
    { id: "personal", title: "Personal Info", icon: User },
    { id: "health", title: "Health Data", icon: Heart },
    { id: "lifestyle", title: "Lifestyle", icon: Activity },
    { id: "alternative", title: "Smart Data", icon: Watch },
  ];

  const updateFormData = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const updateRootField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await underwriteApplication(formData);

      saveApplicationResult(result, formData);

      navigate("/result", { state: { result, application: formData } });
    } catch (error) {
      console.error("Submission error:", error);
      alert("Error processing application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <PersonalInfoStep
            formData={formData}
            updateFormData={updateFormData}
            updateRootField={updateRootField}
          />
        );
      case 1:
        return (
          <HealthDataStep formData={formData} updateFormData={updateFormData} />
        );
      case 2:
        return (
          <LifestyleStep formData={formData} updateFormData={updateFormData} />
        );
      case 3:
        return (
          <AlternativeDataStep
            formData={formData}
            updateFormData={updateFormData}
            updateRootField={updateRootField}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">
          New Insurance Application
        </h1>
        <p className="text-gray-500 mt-2">
          Complete the form to get instant risk assessment
        </p>
      </motion.div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center
                      ${isCompleted ? "bg-green-500" : isActive ? "bg-primary-600" : "bg-gray-200"}`}
                    animate={{ scale: isActive ? 1.1 : 1 }}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <Icon
                        className={`w-6 h-6 ${isActive ? "text-white" : "text-gray-500"}`}
                      />
                    )}
                  </motion.div>
                  <span
                    className={`mt-2 text-sm font-medium 
                    ${isActive ? "text-primary-600" : "text-gray-500"}`}
                  >
                    {step.title}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-4 rounded-full bg-gray-200 overflow-hidden">
                    <motion.div
                      className="h-full bg-green-500"
                      initial={{ width: "0%" }}
                      animate={{ width: isCompleted ? "100%" : "0%" }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <motion.div
        className="glass-card p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium
              ${
                currentStep === 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </button>

          <button
            onClick={nextStep}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 
              text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : currentStep === steps.length - 1 ? (
              <>
                Submit Application
                <CheckCircle className="w-5 h-5" />
              </>
            ) : (
              <>
                Next Step
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Step Components
const PersonalInfoStep = ({ formData, updateFormData, updateRootField }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-6">
      Personal Information
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name
        </label>
        <input
          type="text"
          value={formData.applicant_name}
          onChange={(e) => updateRootField("applicant_name", e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 
            focus:ring-primary-500 focus:border-transparent transition-all"
          placeholder="John Smith"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => updateRootField("email", e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 
            focus:ring-primary-500 focus:border-transparent transition-all"
          placeholder="john@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Age
        </label>
        <input
          type="number"
          value={formData.traditional_data.age}
          onChange={(e) =>
            updateFormData("traditional_data", "age", parseInt(e.target.value))
          }
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 
            focus:ring-primary-500 focus:border-transparent transition-all"
          min="18"
          max="100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Gender
        </label>
        <select
          value={formData.traditional_data.gender}
          onChange={(e) =>
            updateFormData("traditional_data", "gender", e.target.value)
          }
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 
            focus:ring-primary-500 focus:border-transparent transition-all"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Annual Income ($)
        </label>
        <input
          type="number"
          value={formData.traditional_data.annual_income}
          onChange={(e) =>
            updateFormData(
              "traditional_data",
              "annual_income",
              parseFloat(e.target.value),
            )
          }
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 
            focus:ring-primary-500 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Occupation
        </label>
        <select
          value={formData.traditional_data.occupation}
          onChange={(e) =>
            updateFormData("traditional_data", "occupation", e.target.value)
          }
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 
            focus:ring-primary-500 focus:border-transparent transition-all"
        >
          <option value="sedentary">Office Work (Sedentary)</option>
          <option value="light">Light Physical Work</option>
          <option value="moderate">Moderate Physical Work</option>
          <option value="heavy">Heavy Physical Work</option>
          <option value="hazardous">Hazardous Work</option>
        </select>
      </div>
    </div>
  </div>
);

const HealthDataStep = ({ formData, updateFormData }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-6">
      Health Information
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Height (cm)
        </label>
        <input
          type="number"
          value={formData.traditional_data.height_cm}
          onChange={(e) =>
            updateFormData(
              "traditional_data",
              "height_cm",
              parseFloat(e.target.value),
            )
          }
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 
            focus:ring-primary-500 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Weight (kg)
        </label>
        <input
          type="number"
          value={formData.traditional_data.weight_kg}
          onChange={(e) =>
            updateFormData(
              "traditional_data",
              "weight_kg",
              parseFloat(e.target.value),
            )
          }
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 
            focus:ring-primary-500 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Systolic BP (mmHg)
        </label>
        <input
          type="number"
          value={formData.traditional_data.blood_pressure_systolic}
          onChange={(e) =>
            updateFormData(
              "traditional_data",
              "blood_pressure_systolic",
              parseInt(e.target.value),
            )
          }
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 
            focus:ring-primary-500 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Diastolic BP (mmHg)
        </label>
        <input
          type="number"
          value={formData.traditional_data.blood_pressure_diastolic}
          onChange={(e) =>
            updateFormData(
              "traditional_data",
              "blood_pressure_diastolic",
              parseInt(e.target.value),
            )
          }
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 
            focus:ring-primary-500 focus:border-transparent transition-all"
        />
      </div>

     <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Chronic Conditions
  </label>

  <div className="grid grid-cols-2 gap-2">
    {[
      "Diabetes",
      "Hypertension",
      "Heart Disease",
      "Asthma",
      "Thyroid",
      "Arthritis"
    ].map((disease) => (
      <label key={disease} className="flex items-center gap-2">
        <input
          type="checkbox"
          value={disease}
          onChange={(e) => {
            let selected = formData.traditional_data.selected_conditions || [];

            if (e.target.checked) {
              selected = [...selected, disease];
            } else {
              selected = selected.filter((d) => d !== disease);
            }

            updateFormData("traditional_data", "selected_conditions", selected);

            updateFormData(
              "traditional_data",
              "chronic_conditions",
              selected.length
            );
          }}
          checked={
            formData.traditional_data.selected_conditions?.includes(disease) ||
            false
          }
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
        <span className="text-gray-700 text-sm">{disease}</span>
      </label>
    ))}
  </div>
</div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Family History Conditions
        </label>
        <input
          type="number"
          value={formData.traditional_data.family_history_conditions}
          onChange={(e) =>
            updateFormData(
              "traditional_data",
              "family_history_conditions",
              parseInt(e.target.value),
            )
          }
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 
            focus:ring-primary-500 focus:border-transparent transition-all"
          min="0"
          max="5"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Previous Claims
        </label>
        <input
          type="number"
          value={formData.traditional_data.previous_claims}
          onChange={(e) =>
            updateFormData(
              "traditional_data",
              "previous_claims",
              parseInt(e.target.value),
            )
          }
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 
            focus:ring-primary-500 focus:border-transparent transition-all"
          min="0"
          max="10"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hospitalizations (Last 5 Years)
        </label>
        <input
          type="number"
          value={formData.traditional_data.hospitalizations_last_5_years}
          onChange={(e) =>
            updateFormData(
              "traditional_data",
              "hospitalizations_last_5_years",
              parseInt(e.target.value),
            )
          }
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 
            focus:ring-primary-500 focus:border-transparent transition-all"
          min="0"
          max="10"
        />
      </div>
    </div>
  </div>
);

const LifestyleStep = ({ formData, updateFormData }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-6">
      Lifestyle Information
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Smoking Status
        </label>
        <select
          value={formData.traditional_data.smoking_status}
          onChange={(e) =>
            updateFormData("traditional_data", "smoking_status", e.target.value)
          }
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 
            focus:ring-primary-500 focus:border-transparent transition-all"
        >
          <option value="never">Never Smoked</option>
          <option value="former">Former Smoker</option>
          <option value="current">Current Smoker</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Alcohol Consumption
        </label>
        <select
          value={formData.traditional_data.alcohol_consumption}
          onChange={(e) =>
            updateFormData(
              "traditional_data",
              "alcohol_consumption",
              e.target.value,
            )
          }
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 
            focus:ring-primary-500 focus:border-transparent transition-all"
        >
          <option value="none">None</option>
          <option value="occasional">Occasional</option>
          <option value="moderate">Moderate</option>
          <option value="heavy">Heavy</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Exercise Days/Week: {formData.alternative_data.exercise_days_per_week}
        </label>
        <input
          type="range"
          value={formData.alternative_data.exercise_days_per_week}
          onChange={(e) =>
            updateFormData(
              "alternative_data",
              "exercise_days_per_week",
              parseInt(e.target.value),
            )
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          min="0"
          max="7"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0</span>
          <span>7</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Stress Level: {formData.alternative_data.stress_level}/10
        </label>
        <input
          type="range"
          value={formData.alternative_data.stress_level}
          onChange={(e) =>
            updateFormData(
              "alternative_data",
              "stress_level",
              parseInt(e.target.value),
            )
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          min="1"
          max="10"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Diet Quality: {formData.alternative_data.diet_quality_score}/10
        </label>
        <input
          type="range"
          value={formData.alternative_data.diet_quality_score}
          onChange={(e) =>
            updateFormData(
              "alternative_data",
              "diet_quality_score",
              parseInt(e.target.value),
            )
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          min="1"
          max="10"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Poor</span>
          <span>Excellent</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Work-Life Balance: {formData.alternative_data.work_life_balance}/10
        </label>
        <input
          type="range"
          value={formData.alternative_data.work_life_balance}
          onChange={(e) =>
            updateFormData(
              "alternative_data",
              "work_life_balance",
              parseInt(e.target.value),
            )
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          min="1"
          max="10"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Poor</span>
          <span>Excellent</span>
        </div>
      </div>
    </div>
  </div>
);

const AlternativeDataStep = ({ formData, updateFormData, updateRootField }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-2">
      Smart Data Sources
    </h2>
              <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-2">
      ⚠️ Providing your health checkup report can help us assess your risk more accurately 
      and may lead to a more optimized premium rate. Your data will be handled securely 
      and used only for insurance evaluation purposes.
    </div>
    <p className="text-gray-500 text-sm mb-6">
      Connect your wearable devices or enter data manually for better risk
      assessment
    </p>

    {/* Wearable Connection */}
    <div className="p-4 bg-primary-50 rounded-xl border border-primary-100 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Watch className="w-8 h-8 text-primary-600" />
          <div>
            <p className="font-medium text-gray-900">Connect Wearable Device</p>
            <p className="text-sm text-gray-500">
              Sync data from Fitbit, Apple Watch, etc.
            </p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.wearable_data_connected}
            onChange={(e) =>
              updateRootField("wearable_data_connected", e.target.checked)
            }
            className="sr-only peer"
          />
          <div
            className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
            peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full 
            peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] 
            after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full 
            after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"
          ></div>
        </label>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Daily Steps (Avg):{" "}
          {formData.alternative_data.daily_steps_avg.toLocaleString()}
        </label>
        <input
          type="range"
          value={formData.alternative_data.daily_steps_avg}
          onChange={(e) =>
            updateFormData(
              "alternative_data",
              "daily_steps_avg",
              parseInt(e.target.value),
            )
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          min="0"
          max="20000"
          step="500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0</span>
          <span>20,000</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Resting Heart Rate: {formData.alternative_data.resting_heart_rate} BPM
        </label>
        <input
          type="range"
          value={formData.alternative_data.resting_heart_rate}
          onChange={(e) =>
            updateFormData(
              "alternative_data",
              "resting_heart_rate",
              parseInt(e.target.value),
            )
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          min="40"
          max="100"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>40</span>
          <span>100</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sleep Hours (Avg): {formData.alternative_data.sleep_hours_avg}
        </label>
        <input
          type="range"
          value={formData.alternative_data.sleep_hours_avg}
          onChange={(e) =>
            updateFormData(
              "alternative_data",
              "sleep_hours_avg",
              parseFloat(e.target.value),
            )
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          min="4"
          max="10"
          step="0.5"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>4 hrs</span>
          <span>10 hrs</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Active Minutes/Day: {formData.alternative_data.active_minutes_daily}
        </label>
        <input
          type="range"
          value={formData.alternative_data.active_minutes_daily}
          onChange={(e) =>
            updateFormData(
              "alternative_data",
              "active_minutes_daily",
              parseInt(e.target.value),
            )
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          min="0"
          max="180"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0</span>
          <span>180 min</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location Risk Score: {formData.alternative_data.location_risk_score}
          /10
        </label>
        <input
          type="range"
          value={formData.alternative_data.location_risk_score}
          onChange={(e) =>
            updateFormData(
              "alternative_data",
              "location_risk_score",
              parseInt(e.target.value),
            )
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          min="1"
          max="10"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Low Risk</span>
          <span>High Risk</span>
        </div>
      </div>

<div className="flex flex-col gap-3">
  <label className="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      checked={formData.alternative_data.regular_checkups}
      onChange={(e) =>
        updateFormData(
          "alternative_data",
          "regular_checkups",
          e.target.checked
        )
      }
      className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
    />
    <span className="text-sm text-gray-700">
      Regular Health Checkups
    </span>
  </label>

  {/* ✅ Show upload only when checked */}
  {formData.alternative_data.regular_checkups && (
    <div className="ml-7">
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) =>
          updateFormData(
            "alternative_data",
            "checkup_report",
            e.target.files[0]
          )
        }
        className="block w-full text-sm text-gray-600 
          file:mr-4 file:py-2 file:px-4 
          file:rounded-lg file:border-0 
          file:text-sm file:font-medium 
          file:bg-primary-50 file:text-primary-600 
          hover:file:bg-primary-100"
      />
      <p className="text-xs text-gray-400 mt-1">
        Upload your latest health report (PDF only)
      </p>

    </div>
  )}
</div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.alternative_data.gym_membership}
            onChange={(e) =>
              updateFormData(
                "alternative_data",
                "gym_membership",
                e.target.checked,
              )
            }
            className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">Active Gym Membership</span>
        </label>
      </div>
    </div>
  </div>
);

export default NewApplication;
