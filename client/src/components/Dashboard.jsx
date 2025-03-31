import { Button } from "@mui/material";
import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Upload, Github } from "lucide-react"; // Icons
import { useNavigate } from "react-router-dom";
import { useGenerate } from "../context/GenerateTest";
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import LinkIcon from '@mui/icons-material/Link';


function Dashboard() {
  const [requirements, setRequirements] = useState(null);
  const [pathUrl, setpathUrl] = useState("");
  const [submit, setSubmit] = useState(false);
  const navigate = useNavigate();
  const { isGenerating, setIsGenerating } = useGenerate();
  const [testType,setTestType] = useState("");
  const [portUrl,setportUrl] = useState("");

  const handleSubmit = () => {
    if (!pathUrl || !requirements) {
      alert("Please enter project details!");
      return;
    }

    console.log("Submitted:", { requirements, pathUrl ,testType});
    setSubmit(true);
    setIsGenerating(true);
    resetData();
    // Navigate to TestExecutionTerminal and pass data via state
    navigate("/testcase", { state: { pathUrl, requirements,testType,portUrl } });
  };

  function resetData() {
    setRequirements(null);
    setpathUrl("");
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 overflow-hidden">
      {/* Background Animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-white via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-900 dark:to-black opacity-50"
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full flex flex-col gap-4 max-w-2xl bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-300 dark:border-gray-700"
      >
        <h1 className="text-4xl font-extrabold text-blue-500 dark:text-gray-300 text-center drop-shadow-lg">
          AI Testing Dashboard
        </h1>
        <p className="text-lg text-black dark:text-gray-400 text-center mt-2">
          Automate software testing effortlessly with AI-driven test case
          generation.
        </p>

        <div className="mt-6 space-y-6">
          {/* File Upload Input */}
          {/* Radio Button for Testing Type */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <input
                type="radio"
                name="testType"
                value="frontend"
                checked={testType === "frontend"}
                onChange={(e) => setTestType(e.target.value)}
              />
              Frontend Testing
            </label>
            <label className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <input
                type="radio"
                name="testType"
                value="backend"
                checked={testType === "backend"}
                onChange={(e) => setTestType(e.target.value)}
              />
              Backend Testing
            </label>
          </div>

          <div className="flex items-center gap-4 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition">
            <label
              htmlFor="file-upload"
              className="flex items-center gap-3 cursor-pointer"
            >
              <Upload className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                id="file-upload"
                className="hidden"
                onChange={(e) => setRequirements(e.target.files[0])}
              />
              <Button
                variant="outlined"
                component="span"
                className="w-full text-gray-800 dark:text-gray-200"
              >
                Upload Requirements
              </Button>
            </label>
            {requirements && (
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                {requirements.name}
              </p>
            )}
          </div>

          {/* GitHub URL Input */}
          <div className="relative">
            <InsertDriveFileIcon className="absolute left-3 top-3 text-gray-500 dark:text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Provide your Folder Path"
              className="w-full p-3 pl-10 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-400 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 transition"
              value={pathUrl}
              onChange={(e) => setpathUrl(e.target.value)}
            />
          </div>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-3 text-gray-500 dark:text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Provide your System URL"
              className="w-full p-3 pl-10 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-400 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 transition"
              value={portUrl}
              onChange={(e) => setportUrl(e.target.value)}
            />
          </div>
        </div>

        {/* Submit Button */}
        <motion.div whileHover={{ scale: 1.05 }} className="mt-6">
          <button
            className="w-full py-3 text-lg font-semibold text-gray-900 dark:text-gray-100 bg-blue-300 dark:bg-gray-700 rounded-lg hover:bg-blue-400 dark:hover:bg-gray-500 hover:cursor-pointer transition flex items-center justify-center"
            onClick={handleSubmit}
            disabled={submit}
          >
            {submit ? "Generating..." : "Generate Test Cases"}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Dashboard;
