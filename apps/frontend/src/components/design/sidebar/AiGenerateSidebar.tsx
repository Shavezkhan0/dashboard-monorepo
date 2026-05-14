'use client';

import React, { useState, useEffect, useRef } from 'react';
import { HiRectangleGroup } from 'react-icons/hi2';
import { useChat } from '@ai-sdk/react';
import { useCanvasHook } from '@/contexts/CanvasContext';

export default function AiGenerateSidebar() {
  const { storedDataSets, addWidget } = useCanvasHook();
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [localInput, setLocalInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Keep a ref to the latest selectedDatasetId so the onToolCall closure is never stale
  const selectedDatasetIdRef = useRef(selectedDatasetId);
  const selectedColumnsRef = useRef(selectedColumns);
  useEffect(() => {
    selectedDatasetIdRef.current = selectedDatasetId;
    selectedColumnsRef.current = selectedColumns;
  }, [selectedDatasetId, selectedColumns]);

  useEffect(() => {
    if (selectedDatasetId && storedDataSets.length > 0) {
      const dataset = storedDataSets.find((ds) => ds.id === selectedDatasetId);
      if (dataset) {
        setSelectedColumns(dataset.columns || dataset.headers || []);
      }
    }
  }, [selectedDatasetId, storedDataSets]);

  const { messages, append, addToolResult } = useChat({
    api: '/api/chat',

    async onToolCall({ toolCall }) {
      console.log('[onToolCall] triggered:', toolCall);
      if (toolCall.toolName === 'createChart') {
        const args = toolCall.input as { type: string; xAxisSelected: string; yAxisSelected: string };

        // Look up the live dataset using the ref (avoids stale closure)
        const dataset = storedDataSets.find((ds) => ds.id === selectedDatasetIdRef.current);
        let labels: string[] = [];
        let dataPoints: number[] = [];

        if (dataset?.data && args.xAxisSelected && args.yAxisSelected) {
          const agg = new Map<string, number>();
          dataset.data.forEach((row: any) => {
            const x = String(row[args.xAxisSelected] ?? '');
            const y = Number(row[args.yAxisSelected]) || 0;
            agg.set(x, (agg.get(x) ?? 0) + y);
          });
          const keys = Array.from(agg.keys()).sort();
          labels = keys;
          dataPoints = keys.map(k => agg.get(k)!);
        }

        // Add tool output to the chat stream
        addToolResult({
          toolCallId: toolCall.toolCallId,
          result: { success: true },
        });

        // Add the populated widget to the canvas
        addWidget({
          type: args.type,
          props: {
            title: `${args.type.charAt(0).toUpperCase() + args.type.slice(1)} Chart`,
            labels,
            datasets: [{
              id: 1,
              name: args.yAxisSelected,
              dataPoints,
              color: '#118DFF',
            }],
            xAxisTitle: args.xAxisSelected,
            yAxisTitle: args.yAxisSelected,
            showXAxisTitle: true,
            showYAxisTitle: true,
            showLegend: false,
            datasetId: selectedDatasetIdRef.current,
          },
        });

        setIsLoading(false);
        return { success: true };
      }
    },

    onError(err) {
      console.error('[useChat] onError:', err);
      setIsLoading(false);
    },

    onFinish({ message }) {
      console.log('[useChat] onFinish - message:', JSON.stringify(message));
      setIsLoading(false);
    },
  });

  const wordCount = localInput.trim().split(/\s+/).filter(Boolean).length;
  const minWords = 3;
  const isValid = wordCount >= minWords;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDatasetId || !isValid || isLoading) return;

    setIsLoading(true);

    console.log('[onSubmit] sending message:', localInput, 'dataSchema:', selectedColumnsRef.current);

    try {
      await append(
        { role: 'user', content: localInput },
        { body: { dataSchema: selectedColumnsRef.current } }
      );
    } catch (err) {
      console.error('[onSubmit] sendMessage error:', err);
      setIsLoading(false);
    }
    setLocalInput('');
  };

  return (
    <div className="w-[305px] bg-background border border-gray-200 rounded-lg shadow p-4 m-1">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-semibold text-foreground">Write A Prompt</h2>
      </div>

      <div className="w-full bg-muted rounded-md px-3 py-2 mb-3 flex justify-start gap-2">
        <HiRectangleGroup className="text-indigo-600" />
        <span className="text-sm font-medium text-foreground">Create Dashboard Screen</span>
      </div>

      <div className="mb-3">
        <label className="text-xs font-medium text-foreground mb-1 block">
          Select Data Source
        </label>
        <select
          value={selectedDatasetId}
          onChange={(e) => setSelectedDatasetId(e.target.value)}
          className="w-full text-sm bg-background border border-gray-300 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        >
          <option value="">Choose a dataset...</option>
          {storedDataSets.map((ds) => (
            <option key={ds.id} value={ds.id}>
              {ds.name} ({ds.rowCount} rows)
            </option>
          ))}
        </select>

        {/* Show available columns to help the user write the prompt */}
        {selectedColumns.length > 0 && (
          <div className="mt-2 p-2 bg-muted rounded-md">
            <p className="text-xs text-muted-foreground font-medium mb-1">Available columns:</p>
            <div className="flex flex-wrap gap-1">
              {selectedColumns.map((col) => (
                <span key={col} className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                  {col}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={onSubmit}>
        <textarea
          value={localInput}
          onChange={(e) => setLocalInput(e.target.value)}
          placeholder={
            selectedDatasetId
              ? 'e.g. Create a bar chart showing salary by experience'
              : 'Select a data source first'
          }
          disabled={!selectedDatasetId || isLoading}
          className="w-full h-28 text-foreground bg-background border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />

        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          {!isValid && localInput.length > 0 && (
            <span className="text-red-500">Min {minWords} words</span>
          )}
          <span className="ml-auto">{wordCount} words</span>
        </div>

        <button
          type="submit"
          disabled={!isValid || !selectedDatasetId || isLoading}
          className={`w-full mt-2 px-[4px] py-[6px] border-2 border-indigo-300 rounded-md text-sm font-medium transition-all duration-200 ${
            isValid && selectedDatasetId && !isLoading
              ? 'text-indigo-600 bg-muted hover:bg-gradient-to-r hover:from-blue-800 hover:via-indigo-700 hover:to-purple-600 hover:text-white'
              : 'bg-muted-foreground/30 text-muted-foreground cursor-not-allowed'
          }`}
        >
          {isLoading ? 'Generating chart...' : 'Create Screen'}
        </button>
      </form>

      <div className="mt-2 max-h-[30vh] overflow-y-auto space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 border rounded-md text-sm whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-blue-50 border-blue-200 text-foreground'
                : 'bg-muted text-foreground'
            }`}
          >
            <span className="text-xs font-bold uppercase mr-1">{msg.role}:</span>
            {msg.parts?.map((part, pIdx) => {
              if (part.type === 'text') return <span key={pIdx}>{part.text}</span>;
              return null;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
