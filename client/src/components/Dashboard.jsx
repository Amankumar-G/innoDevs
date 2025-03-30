import { Button } from "@mui/material";
import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Upload, Github } from "lucide-react"; // Icons
import { useNavigate } from "react-router-dom";
import { useGenerate } from "../context/GenerateTest";

function Dashboard() {
  const [requirements, setRequirements] = useState(null);
  const [githubUrl, setgithubUrl] = useState("");
  const [submit, setSubmit] = useState(false);
  const navigate = useNavigate();
  const {isGenerating, setIsGenerating} = useGenerate();

  const handleSubmit = () => {
    if (!githubUrl || !requirements) {
        alert("Please enter project details!");
        return;
    }

    console.log("Submitted:", { requirements, githubUrl });
    setSubmit(true);
    setIsGenerating(true);
     resetData();  
    // Navigate to TestExecutionTerminal and pass data via state
    navigate("/testcase", { state: { githubUrl, requirements } });
};


  function resetData() {
    setRequirements(null);
    setgithubUrl("");
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-900 text-gray-100 overflow-hidden">
      {/* Background Animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black opacity-50"
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full flex flex-col gap-4 max-w-2xl bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700"
      >
        <h1 className="text-4xl font-extrabold text-gray-300 text-center drop-shadow-lg">
          AI Testing Dashboard
        </h1>
        <p className="text-lg text-gray-400 text-center mt-2">
          Automate software testing effortlessly with AI-driven test case generation.
        </p>

        <div className="mt-6 space-y-6">
          {/* File Upload Input */}
          <div className="flex items-center gap-4 p-4 border border-gray-600 rounded-lg bg-gray-700 hover:bg-gray-600 transition">
            <label htmlFor="file-upload" className="flex items-center gap-3 cursor-pointer">
              <Upload className="w-6 h-6 text-gray-300" />
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                id="file-upload"
                className="hidden"
                onChange={(e) => setRequirements(e.target.files[0])}
              />
              <Button variant="outlined" component="span" className="w-full text-gray-200">
                Upload Requirements
              </Button>
            </label>
            {requirements && (
              <p className="text-gray-400 text-sm font-medium">{requirements.name}</p>
            )}
          </div>

          {/* GitHub URL Input */}
          <div className="relative">
            <Github className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Provide your GitHub URL"
              className="w-full p-3 pl-10 bg-gray-800 text-gray-200 border border-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 transition"
              value={githubUrl}
              onChange={(e) => setgithubUrl(e.target.value)}
            />
          </div>
        </div>

        {/* Submit Button */}
        <motion.div whileHover={{ scale: 1.05 }} className="mt-6">
          <button
            className="w-full py-3 text-lg font-semibold text-gray-100 bg-gray-700 rounded-lg hover:bg-gray-500 hover:cursor-pointer transition flex items-center justify-center"
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


