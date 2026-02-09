'use client';
import React, { useState, useRef, useEffect } from "react";
import { BiExport, BiImport } from "react-icons/bi";
import { FaRegSave } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { X, Copy, ExternalLink, CheckCircle, AlertCircle, LogOut } from "lucide-react";
import * as Dialog from '@radix-ui/react-dialog';
import { useCanvasHook } from "../Context/CanvasContext";
import { useAuthContext } from "@/contexts/AuthContext";
import Papa from 'papaparse';
import Image from "next/image";
import ProfileDropdown from '@/components/ProfileDropdown';

export default function DesignHeader() {
    const { widgets, setWidgets, storedDataSets, setStoredDataSets } = useCanvasHook();
    const { logout } = useAuthContext();
    const [projectName, setProjectName] = useState('My Project');
    const [isEditing, setIsEditing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Share dialog state
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const [shareStatus, setShareStatus] = useState(''); // 'success', 'error', 'loading'
    const [shareError, setShareError] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);

    const inputRef = useRef(null);

    const BasePort = process.env.NEXT_PUBLIC_BACKEND_BASE_PORT;
    let API_BASE = "";
    if (typeof window !== "undefined") {
        API_BASE = `${window.location.protocol}//${window.location.hostname}:${BasePort}`;
    }

    useEffect(() => {
        const savedState = localStorage.getItem('dashboardState');
        if (savedState) {
            try {
                const parsedState = JSON.parse(savedState);
                if (parsedState.widgets) {
                    setWidgets(parsedState.widgets);
                    console.log('Loaded dashboard widgets:', parsedState.widgets.length);
                }
                if (parsedState.storedDataSets) {
                    setStoredDataSets(parsedState.storedDataSets);
                    console.log('Loaded stored datasets:', parsedState.storedDataSets.length);
                }
                if (parsedState.projectName) {
                    setProjectName(parsedState.projectName);
                }
            } catch (e) {
                console.error("Failed to parse saved data:", e);
            }
        }
    }, [setWidgets, setStoredDataSets]);

    const handleSaveToBrowser = () => {
        try {
            const stateToSave = {
                widgets,
                storedDataSets,
                projectName,
                savedAt: new Date().toISOString()
            };
            localStorage.setItem('dashboardState', JSON.stringify(stateToSave));
            alert('Dashboard and data saved to browser!');
        } catch (e) {
            console.error("Failed to save to browser:", e);
            alert('Could not save dashboard. Storage may be full.');
        }
    };

    const handleExportToCSV = (format = 'single') => {
        if (widgets.length === 0) {
            alert("Canvas is empty. Add widgets to export.");
            return;
        }

        const downloadCsv = (data: any, filename: string) => {
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
                    downloadCsv(dataToExport, `${projectName}_${widget.type}_${widget.id}.csv`);
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
            downloadCsv(flatData, `${projectName}_dashboard.csv`);
            alert('Dashboard layout exported to CSV!');
        }
    };

    const handleImportFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results: any) => {
                    try {
                        const importedWidgets = results.data
                            .filter((item: any) => item.id && item.type)
                            .map((item: any) => ({
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
                error: (error: any) => {
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
            const response = await fetch(`${API_BASE}/powerBi`, {
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
            link.setAttribute('download', `${projectName}_dashboard.pbit`);
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

    const handleShareLink = async () => {
        // Reset states and open dialog
        setShareDialogOpen(true);
        setShareStatus('loading');
        setShareError('');
        setShareLink('');
        setLinkCopied(false);

        // Gather all the data needed to rebuild the canvas
        const canvasState = {
            charts: widgets,
            settings: {
                projectName: projectName
            }
        };

        try {
            const response = await fetch(`${API_BASE}/publish`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(canvasState),
            });

            const result = await response.json();

            if (result.success) {
                const shareableLink = `${window.location.origin}/design/view/${result.viewId}`;
                setShareLink(shareableLink);
                setShareStatus('success');
            } else {
                throw new Error(result.error || 'Failed to create link.');
            }
        } catch (error) {
            console.error("Publishing error:", error);
            setShareError(error.message);
            setShareStatus('error');
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareLink);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy link: ', err);
        }
    };

    const handleOpenInNewTab = () => {
        window.open(shareLink, '_blank');
    };

    const handleShareDialogClose = () => {
        setShareDialogOpen(false);
        setShareStatus('');
        setShareError('');
        setShareLink('');
        setLinkCopied(false);
    };

    const handleSave = () => {
        setIsEditing(false);
        if (inputRef.current) {
            inputRef.current.blur();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
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
       hover:border-transparent
       hover:text-white
       hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600
       disabled:opacity-50 disabled:cursor-not-allowed
    `;

    return (
        <>
            <header className="flex justify-between items-center px-3 py-1 border-b-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 z-10">
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
                    <h3 className="text-sm font-medium text-indigo-600">Your Project:</h3>
                    {isEditing ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            onBlur={handleSave}
                            onKeyDown={handleKeyDown}
                            className="px-[4px] py-[2px] border-2 border-indigo-300 text-indigo-600 bg-blue-50 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            maxLength={50}
                        />
                    ) : (
                        <div
                            className="flex items-center justify-center gap-1 px-[4px] py-[2px] border-2 border-indigo-300 text-indigo-600 bg-blue-50 rounded-md text-sm font-medium cursor-pointer hover:bg-indigo-50 transition-colors"
                            onClick={() => setIsEditing(true)}
                            title="Click to edit project name"
                        >
                            <span>{projectName}</span>
                            <MdEdit size={16} />
                        </div>
                    )}
                </div>

                <div className="flex justify-end items-center space-x-2">
                    <ProfileDropdown />
                    
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
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-100">
                            <button
                                onClick={handleShareLink}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-md"
                            >
                                Publish (Create Link To Share)
                            </button>
                            <button
                                onClick={() => handleExportToCSV('single')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-md"
                            >
                                Export Dashboard Layout (CSV)
                            </button>
                            <button
                                onClick={() => handleExportToCSV('separate')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                Export All Charts Data (CSV)
                            </button>
                            <button
                                onClick={handleDownloadPBIT}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-md disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isExporting || widgets.length === 0}
                            >
                                {isExporting ? 'Generating...' : 'Export to Power BI (.pbit)'}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleSaveToBrowser}
                        className={baseBtnClass}
                        title="Save dashboard and datasets to browser storage"
                    >
                        <FaRegSave size={18} /> Save
                    </button>

                    <button
                        onClick={logout}
                        className={baseBtnClass + " bg-red-50 text-red-600 border-red-300 hover:bg-red-100"}
                        title="Logout from the application"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </header>

            {/* Share Link Dialog */}
            <Dialog.Root open={shareDialogOpen} onOpenChange={handleShareDialogClose}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl w-[500px] max-w-[90vw]">
                        <div className="flex justify-between items-center p-4 border-b">
                            <Dialog.Title className="text-xl text-black font-semibold">
                                Share Dashboard
                            </Dialog.Title>
                            <Dialog.Close asChild>
                                <button className="p-1 rounded-full text-black hover:bg-gray-200" aria-label="Close">
                                    <X size={20} />
                                </button>
                            </Dialog.Close>
                        </div>

                        <div className="p-6">
                            {shareStatus === 'loading' && (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                    <span className="ml-3 text-gray-600">Creating shareable link...</span>
                                </div>
                            )}

                            {shareStatus === 'success' && (
                                <div className="space-y-4">
                                    <div className="flex items-center text-green-600 mb-4">
                                        <CheckCircle size={20} className="mr-2" />
                                        <span className="font-medium">Link created successfully!</span>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Shareable Link:
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                value={shareLink}
                                                readOnly
                                                className="flex-1 text-black px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <button
                                                onClick={handleCopyLink}
                                                className="flex items-center justify-center gap-1
        px-3 py-2
        border-2 border-indigo-300
        text-indigo-600
        bg-blue-50
        rounded-md
        text-sm font-medium
        hover:border-0
        hover:text-white
        hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600
        hover:border-transparent
        disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Copy to clipboard"
                                            >
                                                <Copy size={16} className="mr-1" />
                                                {linkCopied ? 'Copied!' : 'Copy'}
                                            </button>
                                            <button
                                                onClick={handleOpenInNewTab}
                                                className="flex items-center justify-center gap-1
        px-3 py-2
        border-2 border-indigo-300
        text-indigo-600
        bg-blue-50
        rounded-md
        text-sm font-medium
        hover:border-0
        hover:text-white
        hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600
        hover:border-transparent
        disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Open in new tab"
                                            >
                                                <ExternalLink size={16} className="mr-1" />
                                                Open
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-600 mt-4">
                                        Anyone with this link can view your dashboard. The link will remain active until you delete the shared dashboard.
                                    </p>
                                </div>
                            )}

                            {shareStatus === 'error' && (
                                <div className="space-y-4">
                                    <div className="flex items-center text-red-600 mb-4">
                                        <AlertCircle size={20} className="mr-2" />
                                        <span className="font-medium">Failed to create link</span>
                                    </div>

                                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                        <p className="text-sm text-red-800">{shareError}</p>
                                    </div>

                                    <button
                                        onClick={handleShareLink}
                                        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    );
}