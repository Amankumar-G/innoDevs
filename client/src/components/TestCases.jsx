// import { useLocation } from "react-router-dom";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import { io } from "socket.io-client"; // Use socket.io
// import { useGenerate } from "../context/GenerateTest";
// import { Loader2 } from "lucide-react";

// function TestExecutionTerminal() {
//     const location = useLocation();
//     const { githubUrl, requirements } = location.state || {}; // Get passed data
//     const { isGenerating, setIsGenerating } = useGenerate();
//     const [logs, setLogs] = useState([]);
//     const [socket, setSocket] = useState(null);
//     const [finalResponse, setFinalResponse] = useState(null);
//     const [loading, setLoading] = useState(true); // Show loading until first log

//     useEffect(() => {
//       console.log(githubUrl,requirements)
//         if (!githubUrl || !requirements) {
//             setIsGenerating(false);
//             console.log("inside if ")
//             return;
//         }
//         console.log("enter in useffect")
//         setIsGenerating(true);
//         setLoading(true); // Show loading initially

//         // Step 1: Connect to WebSocket first
//         const newSocket = io("wss://smooth-walrus-commonly.ngrok-free.app"); // Replace with your actual WebSocket URL
//         setSocket(newSocket); 
//         console.log("socketconncted");
//         newSocket.on("connect", () => {
//           console.log("Connected to WebSocket server");
          
//           // Step 2: Immediately call API once WebSocket is connected
//           const formData = new FormData();
//           formData.append("githubUrl", githubUrl);
//           formData.append("requirements", requirements);
          
//           console.log("socketconncted");
//           axios.post("https://smooth-walrus-commonly.ngrok-free.app/process-workflow", formData)
//           .then((res) => {
//                     console.log("API Response:", res);
//                     setFinalResponse(res.data); // Store final response
//                 })
//                 .catch((err) => console.error("API Error:", err))
//                 .finally(() => setIsGenerating(false));
//         });

//         // Step 3: Continuously receive logs from WebSocket
//         newSocket.on("message", (data) => {
//             setLogs((prevLogs) => [...prevLogs, data]);

//             if (loading) setLoading(false); // Stop loading when first log arrives
//             scrollToBottom();
//         });

//         newSocket.on("error", (error) => console.error("WebSocket Error:", error));
//         newSocket.on("disconnect", () => console.log("WebSocket connection closed"));

//         return () => {
//             newSocket.disconnect(); // Cleanup socket connection on unmount
//         };
//     }, [githubUrl, requirements, setIsGenerating]);

//     const scrollToBottom = () => {
//         const terminalRef = document.getElementById("terminal");
//         if (terminalRef) {
//             terminalRef.scrollTop = terminalRef.scrollHeight;
//         }
//     };

//     if (!githubUrl || !requirements) {
//         return (
//           <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100">

//             <h2 className="text-red-500 text-center font-bold text-xl">No Project Details Entered</h2>
//           </div>);
//     }

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100">
//             {isGenerating && loading ? (
//                 // Show loading until the first log arrives
//                 <div className="flex flex-col items-center">
//                     <Loader2 className="w-12 h-12 animate-spin text-green-500" />
//                     <h2 className="text-xl font-bold mt-4">Waiting for Logs...</h2>
//                 </div>
//             ) : finalResponse ? (
//                 <h2 className="text-2xl font-bold text-green-500">✅ Process Completed Successfully!</h2>
//             ) : (
//                 <div
//                     id="terminal"
//                     className="h-96 w-full max-w-3xl bg-gray-800 rounded-lg p-4 border border-gray-600 overflow-y-auto"
//                 >
//                     {logs.length > 0 ? logs.map((log, index) => <p key={index}>{log}</p>) : "Waiting for logs..."}
//                 </div>
//             )}
//         </div>
//     );
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
    const { githubUrl, requirements } = location.state || {}; // Get passed data
    const { isGenerating, setIsGenerating } = useGenerate();
    const [logs, setLogs] = useState([]);
    const [socket, setSocket] = useState(null);
    const [finalResponse, setFinalResponse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!githubUrl || !requirements) {
            console.error("🚨 Missing GitHub URL or Requirements File");
            return;
        }

        console.log("✅ Initializing WebSocket...");
        setIsGenerating(true);
        setLoading(true); // Show loading initially

        // Step 1: Ensure only one WebSocket instance
        if (socket) socket.disconnect();
        const newSocket = io("https://smooth-walrus-commonly.ngrok-free.app/"); // Update with actual WebSocket URL
        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("🟢 WebSocket Connected:", newSocket.id);

            // Step 2: Call API when WebSocket is ready
            const formData = new FormData();
            formData.append("githubUrl", githubUrl);
            
            // Ensure correct file handling
            if (requirements instanceof File) {
                formData.append("requirements", requirements, requirements.name);
            } else {
                formData.append("requirements", requirements);
            }

            axios.post("https://smooth-walrus-commonly.ngrok-free.app/process-workflow", formData)
                .then((res) => {
                    console.log("✅ API Response Received");
                    setFinalResponse(res);
                })
                .catch((err) => console.error("❌ API Error:", err))
                .finally(() => setIsGenerating(false));
        });

        // Step 3: Listen for logs from WebSocket
        newSocket.on("message", (data) => { // ✅ Fix event name
            console.log("📥 Log Received:", data);
            setLogs((prevLogs) => [...prevLogs, data]);

            if (loading) setLoading(false); // Stop loading when first log arrives
            scrollToBottom();
        });

        newSocket.on("disconnect", () => console.log("🔴 WebSocket Disconnected"));

        return () => {
            newSocket.disconnect(); // Cleanup WebSocket on unmount
        };
    }, [githubUrl, requirements]);

    const scrollToBottom = () => {
        setTimeout(() => {
            const terminalRef = document.getElementById("terminal");
            if (terminalRef) {
                terminalRef.scrollTop = terminalRef.scrollHeight;
            }
        }, 100); // Small delay for smooth scrolling
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100">
            {isGenerating && loading ? (
                <div className="flex flex-col items-center">
                    <Loader2 className="w-12 h-12 animate-spin text-green-500" />
                    <h2 className="text-xl font-bold mt-4">Waiting for Logs...</h2>
                </div>
            ) : finalResponse ? (
                <h2 className="text-2xl font-bold text-green-500">✅ Process Completed Successfully!</h2>
            ) : (
                <div
                    id="terminal"
                    className="h-96 w-full max-w-3xl bg-gray-800 rounded-lg p-4 border border-gray-600 overflow-y-auto"
                >
                    {logs.length > 0 ? logs.map((log, index) => <p key={index}>{log}</p>) : "Waiting for logs..."}
                </div>
            )}
        </div>
    );
}

export default TestExecutionTerminal;
