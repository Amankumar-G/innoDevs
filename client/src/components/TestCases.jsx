// import { useLocation } from "react-router-dom";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import { io } from "socket.io-client";
// import { useGenerate } from "../context/GenerateTest";
// import { Loader2 } from "lucide-react";

// function TestExecutionTerminal() {
//   const location = useLocation();
//   const { pathUrl, requirements,testType,portUrl } = location.state || {}; // Get passed data
//   const { isGenerating, setIsGenerating } = useGenerate();
//   const [logs, setLogs] = useState([]);
//   const [socket, setSocket] = useState(null);
//   const [finalResponse, setFinalResponse] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [url,setUrl] = useState("");

//   useEffect(() => {
//     if (!pathUrl || !requirements) {
//       console.error("🚨 Missing PathURI URL or Requirements File");
//       return;
//     }
//     console.log("✅ Initializing WebSocket...");
//     setIsGenerating(true);
//     setLoading(true);

//     if (socket) socket.disconnect();
//     const newSocket = io("http://localhost:5000");
//     setSocket(newSocket);

//     newSocket.on("connect", () => {
//       console.log("🟢 WebSocket Connected:", newSocket.id);

//       const formData = new FormData();
//       formData.append("pathUrl", pathUrl);
//       formData.append("portUrl",portUrl);
//       if (requirements instanceof File) {
//         formData.append("requirements", requirements, requirements.name);
//       } else {
//         formData.append("requirements", requirements);
//       }


//       axios
//         .post(`http://localhost:5000/${testType}/process-workflow`, formData)
//         .then((res) => {
//           console.log("✅ API Response Received", res.data);
//           setFinalResponse(res.data);
//         })
//         .catch((err) => console.error("❌ API Error:", err))
//         .finally(() => setIsGenerating(false));
//     });

//     newSocket.on("message", (data) => {
//       console.log("📥 Log Received:", data);
//       setLogs((prevLogs) => [...prevLogs, data]);
//       if (loading) setLoading(false);
//       scrollToBottom();
//     });

//     newSocket.on("disconnect", () => console.log("🔴 WebSocket Disconnected"));

//     return () => {
//       newSocket.disconnect();
//     };
//   }, [pathUrl, requirements]);

//   const scrollToBottom = () => {
//     setTimeout(() => {
//       const terminalRef = document.getElementById("terminal");
//       if (terminalRef) {
//         terminalRef.scrollTop = terminalRef.scrollHeight;
//       }
//     }, 100);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
//       {isGenerating && loading ? (
//         <div className="flex flex-col items-center">
//           <Loader2 className="w-12 h-12 animate-spin text-green-500" />
//           <h2 className="text-xl font-bold mt-4">Waiting for Logs...</h2>
//         </div>
//       ) : finalResponse ? (
//         <div className="w-full max-w-4xl bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-300 dark:border-gray-600 overflow-y-auto">
//           <h2 className="text-2xl font-bold text-green-700 dark:text-green-500">
//             ✅ Process Completed Successfully!
//           </h2>
//           {finalResponse.analysisResults.map((component, index) => (
//             <div key={index} className="mt-4">
//               <h3 className="text-xl font-bold">🔹 {component.component}</h3>
//               <p
//                 className={
//                   component.meetsRequirements
//                     ? "text-green-600 dark:text-green-400"
//                     : "text-red-600 dark:text-red-400"
//                 }
//               >
//                 {component.meetsRequirements
//                   ? "✔ Meets Requirements"
//                   : "❌ Does Not Meet Requirements"}
//               </p>
//               <p className="text-gray-700 dark:text-gray-300">{component.details}</p>
//               <h4 className="text-lg font-semibold mt-2">📝 Test Cases:</h4>
//               <ul className="list-disc pl-6">
//                 {component.testCases.map((test, idx) => (
//                   <li key={idx} className="mt-2">
//                     <strong>{test.testCaseName}:</strong> {test.description}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           ))}
//           {finalResponse.validationErrors.length > 0 && (
//             <div className="mt-4">
//               <h3 className="text-xl font-bold text-red-700 dark:text-red-500">
//                 ⚠ Validation Errors:
//               </h3>
//               <ul className="list-disc pl-6 text-red-600 dark:text-red-400">
//                 {finalResponse?.data?.analysisResults?.map((result, index) => (
//                   <li key={index}>
//                     <strong>Component:</strong> {result.component} <br />
//                     <strong>Details:</strong> {result.details} <br />
//                     {result.testCases?.length > 0 && (
//                       <ul>
//                         {result.testCases.map((test, testIndex) => (
//                           <li key={testIndex}>
//                             <strong>Test Case:</strong> {test.testCaseName} <br />
//                             <strong>Description:</strong> {test.description}
//                           </li>
//                         ))}
//                       </ul>
//                     )}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>
//       ) : (
//         <div
//           id="terminal"
//           className="w-full max-w-3xl overflow-hidden h-[34rem] bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-300 dark:border-gray-600 overflow-y-auto text-gray-900 dark:text-gray-100"
//         >
//           {logs.length > 0
//             ? logs.map((log, index) => <p key={index}>{log}</p>)
//             : "Waiting for logs..."}
//         </div>
//       )}
//     </div>
//   );
// }

// export default TestExecutionTerminal;



import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useGenerate } from "../context/GenerateTest";
import { Loader2 } from "lucide-react";

function TestExecutionTerminal() {
  const location = useLocation();
  const { pathUrl, requirements, testType, portUrl } = location.state || {}; // Get passed data
  const { isGenerating, setIsGenerating } = useGenerate();
  const [logs, setLogs] = useState([]);
  const [socket, setSocket] = useState(null);
  const [finalResponse, setFinalResponse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pathUrl || !requirements) {
      console.error("🚨 Missing PathURI URL or Requirements File");
      return;
    }
    initializeSocket(); // Start WebSocket connection on load
  }, [pathUrl, requirements]);

  const initializeSocket = () => {
    console.log("✅ Initializing WebSocket...");
    setIsGenerating(true);
    setLoading(true);

    if (socket) socket.disconnect();
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("🟢 WebSocket Connected:", newSocket.id);

      const formData = new FormData();
      formData.append("pathUrl", pathUrl);
      formData.append("portUrl", portUrl);
      if (requirements instanceof File) {
        formData.append("requirements", requirements, requirements.name);
      } else {
        formData.append("requirements", requirements);
      }

      axios
        .post(`http://localhost:5000/${testType}/process-workflow`, formData)
        .then((res) => {
          console.log("✅ API Response Received", res.data);
          setFinalResponse(res.data);
        })
        .catch((err) => console.error("❌ API Error:", err))
        .finally(() => setIsGenerating(false));
    });

    newSocket.on("message", (data) => {
      console.log("📥 Log Received:", data);
      setLogs((prevLogs) => [...prevLogs, data]);
      if (loading) setLoading(false);
      scrollToBottom();
    });

    newSocket.on("disconnect", () => console.log("🔴 WebSocket Disconnected"));

    return () => {
      newSocket.disconnect();
    };
  };

  const runSeleniumTests = () => {
    console.log("🚀 Running Selenium Tests...");
    if (socket) socket.disconnect();
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);
    setLogs([]); // Clear previous logs before new execution
    setLoading(true);
    setIsGenerating(true);

    newSocket.on("connect", () => {
      console.log("🟢 WebSocket Connected for Selenium Test:", newSocket.id);
      
      axios
        .post("http://localhost:5000/run-selenium-tests", { pathUrl, portUrl })
        .then((res) => {
          console.log("✅ Selenium Test Triggered", res.data);
        })
        .catch((err) => console.error("❌ Selenium API Error:", err))
        .finally(() => setIsGenerating(false));
    });

    newSocket.on("message", (data) => {
      console.log("📥 Selenium Log Received:", data);
      setLogs((prevLogs) => [...prevLogs, data]);
      if (loading) setLoading(false);
      scrollToBottom();
    });

    newSocket.on("disconnect", () => console.log("🔴 WebSocket Disconnected (Selenium)"));

    return () => {
      newSocket.disconnect();
    };
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      const terminalRef = document.getElementById("terminal");
      if (terminalRef) {
        terminalRef.scrollTop = terminalRef.scrollHeight;
      }
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
      {/* Selenium Test Button */}
      <button
        onClick={runSeleniumTests}
        className="mb-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        🏁 Run Selenium Tests
      </button>

      {isGenerating && loading ? (
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-500" />
          <h2 className="text-xl font-bold mt-4">Waiting for Logs...</h2>
        </div>
      ) : finalResponse ? (
        <div className="w-full max-w-4xl bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-300 dark:border-gray-600 overflow-y-auto">
          <h2 className="text-2xl font-bold text-green-700 dark:text-green-500">
            ✅ Process Completed Successfully!
          </h2>
          {finalResponse.analysisResults.map((component, index) => (
            <div key={index} className="mt-4">
              <h3 className="text-xl font-bold">🔹 {component.component}</h3>
              <p
                className={
                  component.meetsRequirements
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }
              >
                {component.meetsRequirements
                  ? "✔ Meets Requirements"
                  : "❌ Does Not Meet Requirements"}
              </p>
              <p className="text-gray-700 dark:text-gray-300">{component.details}</p>
              <h4 className="text-lg font-semibold mt-2">📝 Test Cases:</h4>
              <ul className="list-disc pl-6">
                {component.testCases.map((test, idx) => (
                  <li key={idx} className="mt-2">
                    <strong>{test.testCaseName}:</strong> {test.description}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div
          id="terminal"
          className="w-full max-w-3xl overflow-hidden h-[34rem] bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-300 dark:border-gray-600 overflow-y-auto text-gray-900 dark:text-gray-100"
        >
          {logs.length > 0
            ? logs.map((log, index) => <p key={index}>{log}</p>)
            : "Waiting for logs..."}
        </div>
      )}
    </div>
  );
}

export default TestExecutionTerminal;
