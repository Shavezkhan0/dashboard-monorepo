'use client';
import React, { useState, useRef, useEffect } from "react";
import { BiExport, BiImport } from "react-icons/bi";
import { FaRegSave } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { useCanvasHook } from "../Context/CanvasContext";
import Papa from 'papaparse';
import Image from "next/image";

export default function DesignHeader() {
    const {
        widgets,
        setWidgets,
        storedDataSets,
        setStoredDataSets,
        dashboardName,
        setDashboardName,
        saveToBackend,
        saveStatus,
        isSaving,
        dashboardId
    } = useCanvasHook();
    const [isEditing, setIsEditing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const inputRef = useRef(null);

    const handleSave = () => {
        if (dashboardId) {
            saveToBackend();
        } else {
            // Should theoretically not happen if creating on mount
            alert('Please wait for dashboard to be created...');
        }
    };

    const handleExportToCSV = (format = 'single') => {
        if (widgets.length === 0) {
            alert("Canvas is empty. Add widgets to export.");
            return;
        }

        const downloadCsv = (data, filename) => {
            const csv = Papa.unparse(data);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        if (format === 'separate') {
            widgets.forEach(widget => {
                let dataToExport = [];

                switch (widget.type) {
                    case 'pie':
                    case 'donut':
                        if (widget.props.labels && widget.props.datasets?.[0]?.dataPoints) {
                            dataToExport = widget.props.labels.map((label, index) => ({
                                Label: label,
                                Value: widget.props.datasets[0].dataPoints[index] || 0
                            }));
                        }
                        break;

                    case 'waterfall':
                        if (widget.props.labels && widget.props.dataPoints) {
                            const initial = widget.props.initialValue || 0;
                            const total = widget.props.dataPoints.reduce((acc, val) => acc + val, initial);

                            dataToExport = [
                                { Label: 'Initial', Value: initial },
                                ...widget.props.labels.map((label, index) => ({
                                    Label: label,
                                    Value: widget.props.dataPoints[index] || 0
                                })),
                                { Label: 'Total', Value: total }
                            ];
                        }
                        break;

                    case 'treemap':
                        if (widget.props.data) {
                            dataToExport = widget.props.data.map(item => ({
                                id: item.id,
                                parent: item.parent || '',
                                name: item.name,
                                value: item.value || 0
                            }));
                        }
                        break;

                    case 'bubble':
                        if (widget.props.datasets?.[0]?.data) {
                            dataToExport = widget.props.datasets[0].data.map((point, index) => ({
                                X_Axis: point.x || 0,
                                Y_Axis: point.y || 0,
                                Radius: point.r || 1,
                                Label: `Point ${index + 1}`
                            }));
                        }
                        break;

                    default:
                        // Handle bar, line, column charts and others
                        if (widget.props.labels && widget.props.datasets) {
                            dataToExport = widget.props.labels.map((label, index) => {
                                const row = { Label: label };
                                widget.props.datasets.forEach(ds => {
                                    row[ds.name || 'Value'] = ds.dataPoints?.[index] || 0;
                                });
                                return row;
                            });
                        }
                        break;
                }

                if (dataToExport.length > 0) {
                    downloadCsv(dataToExport, `${dashboardName}_${widget.type}_${widget.id}.csv`);
                }
            });
            alert(`${widgets.length} chart(s) exported as separate CSV files!`);
        } else {
            // Export dashboard layout
            const flatData = widgets.map(widget => ({
                id: widget.id,
                type: widget.type,
                layout_x: widget.layout?.x || 0,
                layout_y: widget.layout?.y || 0,
                layout_w: widget.layout?.w || 4,
                layout_h: widget.layout?.h || 4,
                props: JSON.stringify(widget.props)
            }));
            downloadCsv(flatData, `${dashboardName}_dashboard.csv`);
            alert('Dashboard layout exported to CSV!');
        }
    };

    const handleImportFromCSV = (event) => {
        const file = event.target.files[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    try {
                        const importedWidgets = results.data
                            .filter(item => item.id && item.type)
                            .map(item => ({
                                id: item.id,
                                type: item.type,
                                layout: {
                                    i: String(item.id),
                                    x: Number(item.layout_x) || 0,
                                    y: Number(item.layout_y) || 0,
                                    w: Number(item.layout_w) || 4,
                                    h: Number(item.layout_h) || 4,
                                },
                                props: JSON.parse(item.props || '{}')
                            }));

                        if (importedWidgets.length > 0) {
                            setWidgets(importedWidgets);
                            alert(`Successfully imported ${importedWidgets.length} widget(s)!`);
                        } else {
                            alert("No valid widgets found in the CSV file.");
                        }
                    } catch (e) {
                        console.error("Error processing imported CSV:", e);
                        alert("Failed to import. The CSV format might be incorrect.");
                    }
                },
                error: (error) => {
                    console.error("Error parsing CSV:", error);
                    alert("Failed to parse CSV file.");
                }
            });
        }
        event.target.value = '';
    };

    const handleDownloadPBIT = async () => {
        if (widgets.length === 0) {
            alert("Canvas is empty. Add widgets to export to Power BI.");
            return;
        }

        setIsExporting(true);
        try {
            console.log('Exporting widgets to Power BI:', widgets.length);

            console.log("projectName", projectName)
            console.log("widgets", widgets)

            // const response = await fetch('/api/export-pbit', {
            const response = await fetch('http://localhost:5000/powerBi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chartData: widgets,
                    projectName: projectName
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            console.log('Received blob:', blob.size, 'bytes');

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${dashboardName}_dashboard.pbit`);
            document.body.appendChild(link);
            link.click();

            // Cleanup
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

            alert('Power BI template downloaded successfully!');

        } catch (error) {
            console.error('Error generating Power BI template:', error);
            alert(`Failed to export Power BI template: ${error.message}`);
        } finally {
            setIsExporting(false);
        }
    };

    const handleNameSave = () => {
        setIsEditing(false);
        if (inputRef.current) {
            inputRef.current.blur();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleNameSave();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
        }
    };

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const baseBtnClass = `
        flex items-center justify-center gap-1
        px-[4px] py-[2px]
        border-2 border-indigo-300
        text-indigo-600
        bg-blue-50
        rounded-md
        text-sm font-medium
        transition-all duration-200
        hover:text-white
        hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600
        hover:border-transparent
        disabled:opacity-50 disabled:cursor-not-allowed
    `;

    return (
        <header className="flex justify-between items-center px-3 py-1 border-b-2 border-gray-300 bg-white z-10">
            <div className="ml-4">
                <Image
                    className="cursor-pointer"
                    title="Indian Navy"
                    alt="logo"
                    src="/logo.png"
                    width={35}
                    height={35}
                />
            </div>

            <div className="flex items-center space-x-4">
                <h3 className="text-sm font-medium text-indigo-600">Your Dashboard:</h3>
                {isEditing ? (
                    <input
                        ref={inputRef}
                        type="text"
                        value={dashboardName}
                        onChange={(e) => setDashboardName(e.target.value)}
                        onBlur={handleNameSave}
                        onKeyDown={handleKeyDown}
                        className="px-[4px] py-[2px] border-2 border-indigo-300 text-indigo-600 bg-blue-50 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        maxLength={50}
                    />
                ) : (
                    <div
                        className="flex items-center justify-center gap-1 px-[4px] py-[2px] border-2 border-indigo-300 text-indigo-600 bg-blue-50 rounded-md text-sm font-medium cursor-pointer hover:bg-indigo-50 transition-colors"
                        onClick={() => setIsEditing(true)}
                        title="Click to edit dashboard name"
                    >
                        <span>{dashboardName}</span>
                        <MdEdit size={16} />
                    </div>
                )}
                {saveStatus === 'saving' && (
                    <span className="text-xs text-gray-500">Saving...</span>
                )}
                {saveStatus === 'saved' && (
                    <span className="text-xs text-green-600">Saved</span>
                )}
                {saveStatus === 'error' && (
                    <span className="text-xs text-red-600">Error saving</span>
                )}
            </div>

            <div className="flex justify-end items-center space-x-2">
                <label className={baseBtnClass + " cursor-pointer"}>
                    <BiImport size={18} /> Import
                    <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleImportFromCSV}
                    />
                </label>

                <div className="relative group">
                    <button className={baseBtnClass}>
                        <BiExport size={18} /> Export
                    </button>
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <button
                            onClick={() => handleExportToCSV('single')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-md"
                        >
                            Export Dashboard Layout (CSV)
                        </button>
                        <button
                            onClick={() => handleExportToCSV('separate')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            Export All Charts Data (CSV)
                        </button>
                        <button
                            onClick={handleDownloadPBIT}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-md disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isExporting || widgets.length === 0}
                        >
                            {isExporting ? 'Generating...' : 'Export to Power BI (.pbit)'}
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    className={baseBtnClass}
                    title="Save dashboard"
                >
                    <FaRegSave size={18} /> Save
                </button>
            </div>
        </header>
    );
}
