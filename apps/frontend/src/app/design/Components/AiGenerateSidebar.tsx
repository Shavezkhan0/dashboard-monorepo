'use client';
import React, { useState } from "react";
import { HiRectangleGroup } from "react-icons/hi2";

export default function AiGenerateSidebar() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const wordCount = prompt.trim().split(/\s+/).filter(Boolean).length;
  const minWords = 5;
  const isValid = wordCount >= minWords;

  const handlePromt = async () => {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "deepseek-r1:1.5b", prompt }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(Boolean);

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.response) {
              fullText += data.response;
              setResult(prev => prev + data.response); // live update
            }
          } catch (err) {
            console.error("Parsing error:", err, line);
          }
        }
      }

    } catch (error) {
      console.error("Error:", error);
      setResult("❌ Failed to connect to LLM server");
    }

    setLoading(false);
  };


  // const handlePromt = async () => {
  //   setLoading(true);
  //   setResult("");

  //   try {
  //     // 👇 Call your LLM API running on Ubuntu server
  //     // const response = await fetch("http://localhost:5000/generate", {
  //     //   method: "POST",
  //     //   headers: {
  //     //     "Content-Type": "application/json",
  //     //   },
  //     //   body: JSON.stringify({ prompt }), // send user prompt
  //     // });

  //     const response = await fetch("http://localhost:11434/api/generate", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ model: "deepseek-r1:1.5b", prompt }),
  //     });


  //     const data = await response.json();
  //     setResult(data.result);
  //   } catch (error) {
  //     console.error("Error:", error);
  //     setResult("❌ Failed to connect to LLM server");
  //   }

  //   setLoading(false);
  // };

  return (
    <div className="w-[305px] bg-white border border-gray-200 rounded-lg shadow p-4 m-1">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-semibold text-gray-700">Write A Prompt</h2>
      </div>

      <div className="w-full bg-gray-100 rounded-md px-3 py-2 mb-3 flex justify-start gap-2">
        <HiRectangleGroup className="text-indigo-600" />
        <span className="text-sm font-medium text-gray-700">Create Dashboard Screen</span>
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt here..."
        className="w-full h-28 text-black border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
      />

      <div className="flex justify-between text-xs text-gray-500 mt-1">
        {!isValid && <span className="text-red-500">Min words: {minWords}</span>}
        <span>{wordCount}/5000 words</span>
      </div>

      <button
        onClick={handlePromt}
        disabled={!isValid || loading}
        className={`w-full hover:text-white
         px-[4px] py-[4px] border-2 border-indigo-300
        
        bg-blue-50
        rounded-md
        text-sm font-medium
        transition-all duration-200
        hover:text-white ${isValid && !loading
            ? "text-indigo-600 hover:bg-indigo-800 hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600"
            : "bg-gray-400 cursor-not-allowed text-gray"
          }`}
      >
        {loading ? "Generating..." : "Create Screen"}
      </button>

      <div className="mt-2 max-h-[50vh] overflow-y-auto">
        {result && (
          <div className="mt-4 p-2 border rounded-md bg-gray-50 text-sm text-black whitespace-pre-wrap">
            {result}
          </div>
        )}
      </div>

    </div>
  );
}

