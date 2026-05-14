'use client';
import React, { useState, useRef, useEffect } from "react";
import { BiExport, BiImport } from "react-icons/bi";
import { FaRegSave } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { useCanvasHook } from "@/contexts/CanvasContext";
import { useAuthContext } from "@/contexts/AuthContext";
import Papa from 'papaparse';
import ProfileDropdown from '@/components/account/ProfileDropdown';
import ThemeToggle from '@/components/ui/ThemeToggle';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ShareDashboardDialog, ExportDashboardDialog } from '@/components/ui/dialogs';

export default function DesignHeader() {
    const { widgets, setWidgets, storedDataSets, setStoredDataSets, saveDashboard, dashboard } = useCanvasHook();
    const { user } = useAuthContext();
    const [projectName, setProjectName] = useState('My Project');
    const [isEditing, setIsEditing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Export dropdown state
    const [isExportOpen, setIsExportOpen] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);

    // Export dialog state
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [captureProgress, setCaptureProgress] = useState('');

    // Share dialog state
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const [shareStatus, setShareStatus] = useState(''); // 'success', 'error', 'loading'
    const [shareError, setShareError] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    // Load project name from dashboard
    useEffect(() => {
        if (dashboard?.name) {
            setProjectName(dashboard.name);
        }
    }, [dashboard]);

    // Save to localStorage as backup (optional)
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
            } catch (e) {
                console.error("Failed to parse saved data:", e);
            }
        }
    }, [setWidgets, setStoredDataSets]);

    // Save to Supabase database
    const handleSave = () => {
        saveDashboard(projectName);
    };

    const handleNameSave = () => {
        setIsEditing(false);
        if (inputRef.current) {
            inputRef.current.blur();
        }
        // Save the name to database
        saveDashboard(projectName);
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
                let dataToExport: any[] = [];

                switch (widget.type) {
                    case 'pie':
                    case 'donut':
                        if (widget.props.labels && widget.props.datasets?.[0]?.dataPoints) {
                            dataToExport = widget.props.labels.map((label: string, index: number) => ({
                                Label: label,
                                Value: widget.props.datasets[0].dataPoints[index] || 0
                            }));
                        }
                        break;

                    case 'waterfall':
                        if (widget.props.labels && widget.props.dataPoints) {
                            const initial = widget.props.initialValue || 0;
                            const total = widget.props.dataPoints.reduce((acc: number, val: number) => acc + val, initial);

                            dataToExport = [
                                { Label: 'Initial', Value: initial },
                                ...widget.props.labels.map((label: string, index: number) => ({
                                    Label: label,
                                    Value: widget.props.dataPoints[index] || 0
                                })),
                                { Label: 'Total', Value: total }
                            ];
                        }
                        break;

                    case 'treemap':
                        if (widget.props.data) {
                            dataToExport = widget.props.data.map((item: any) => ({
                                id: item.id,
                                parent: item.parent || '',
                                name: item.name,
                                value: item.value || 0
                            }));
                        }
                        break;

                    case 'bubble':
                        if (widget.props.datasets?.[0]?.data) {
                            dataToExport = widget.props.datasets[0].data.map((point: any, index: number) => ({
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
                            dataToExport = widget.props.labels.map((label: string, index: number) => {
                                const row: any = { Label: label };
                                widget.props.datasets.forEach((ds: any) => {
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
            if (link.parentNode) {
                link.parentNode.removeChild(link);
            }
            window.URL.revokeObjectURL(url);

            alert('Power BI template downloaded successfully!');

        } catch (error: unknown) {
            console.error('Error generating Power BI template:', error);
            alert(`Failed to export Power BI template: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        } catch (error: unknown) {
            console.error("Publishing error:", error);
            setShareError(error instanceof Error ? error.message : 'Unknown error');
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

    const handleKeyDown = (e: React.KeyboardEvent) => {
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

    // Click outside handler for export dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
                setIsExportOpen(false);
            }
        };
        if (isExportOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isExportOpen]);

    // Canvas capture function
    const captureCanvas = async (): Promise<HTMLCanvasElement | null> => {
        const element = document.getElementById('dashboard-canvas');
        if (!element) {
            alert('Dashboard canvas not found. Make sure widgets are loaded.');
            return null;
        }
        return await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
        });
    };

    const handleExportPDF = async () => {
        if (widgets.length === 0) {
            alert('Canvas is empty. Add widgets before exporting.');
            return;
        }
        setIsCapturing(true);
        setCaptureProgress('Capturing dashboard...');
        try {
            const canvas = await captureCanvas();
            if (!canvas) return;
            setCaptureProgress('Generating PDF...');
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
                unit: 'px',
                format: [canvas.width / 2, canvas.height / 2],
            });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
            pdf.save(`${projectName}_dashboard.pdf`);
            setCaptureProgress('');
        } catch (error) {
            console.error('PDF export error:', error);
            alert('Failed to export PDF. Please try again.');
        } finally {
            setIsCapturing(false);
            setCaptureProgress('');
        }
    };

    const handleExportImage = async (format: 'png' | 'jpg') => {
        if (widgets.length === 0) {
            alert('Canvas is empty. Add widgets before exporting.');
            return;
        }
        setIsCapturing(true);
        setCaptureProgress(`Capturing dashboard as ${format.toUpperCase()}...`);
        try {
            const canvas = await captureCanvas();
            if (!canvas) return;
            const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
            const quality = format === 'jpg' ? 0.95 : undefined;
            const dataUrl = format === 'jpg' ? canvas.toDataURL(mimeType, quality) : canvas.toDataURL(mimeType);
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `${projectName}_dashboard.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Image export error:', error);
            alert(`Failed to export ${format.toUpperCase()}. Please try again.`);
        } finally {
            setIsCapturing(false);
            setCaptureProgress('');
        }
    };

    const handleShareLinkAndCloseExport = async () => {
        setIsExportDialogOpen(false);
        handleShareLink();
    };

    const baseBtnClass = `
        flex items-center justify-center gap-1
       px-[4px] py-[2px]
       border-2 border-indigo-300
       text-indigo-600 dark:text-indigo-400
       bg-blue-50 dark:bg-blue-900/20
       rounded-md
       text-sm font-medium
       hover:border-transparent
       hover:text-white
       hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600
       disabled:opacity-50 disabled:cursor-not-allowed
    `;

    return (
        <>
            <header className="flex justify-between items-center px-3 py-1 border-b-2 border-border bg-background z-10">
                <div className="ml-4">
                    <img
                        className="cursor-pointer h-8 w-auto object-contain"
                        title="Logo"
                        alt="logo"
                        src="/logo.png"
                    />
                </div>

                <div className="flex items-center space-x-4">
                    <h3 className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Name:</h3>
                    {isEditing ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            onBlur={handleNameSave}
                            onKeyDown={handleKeyDown}
                            className="px-[4px] py-[2px] border-2 border-indigo-300 text-indigo-600 dark:text-indigo-400 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                            maxLength={50}
                        />
                    ) : (
                        <div
                            className="flex items-center justify-center gap-1 px-[4px] py-[2px] border-2 border-indigo-300 text-indigo-600 dark:text-indigo-400 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm font-medium cursor-pointer hover:bg-indigo-50 dark:hover:bg-blue-900/30 transition-colors"
                            onClick={() => setIsEditing(true)}
                            title="Click to edit project name"
                        >
                            <span>{projectName}</span>
                            <MdEdit size={16} />
                        </div>
                    )}
                </div>

                <div className="flex justify-end items-center space-x-2">
                    <ThemeToggle />
                    <ProfileDropdown userName={user?.name} userEmail={user?.email} />

                    <label className={baseBtnClass + " cursor-pointer"}>
                        <BiImport size={18} /> Import
                        <input
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={handleImportFromCSV}
                        />
                    </label>

                    <div className="relative" ref={exportRef}>
                        <button 
                            className={baseBtnClass}
                            onClick={() => setIsExportOpen(!isExportOpen)}
                        >
                            <BiExport size={18} /> Export
                        </button>
                        {isExportOpen && (
                            <div className="absolute right-0 mt-1 w-56 bg-background border border-border rounded-md shadow-lg z-50">
                                <div className="absolute h-1 w-full -top-1" />
                                <button
                                    onClick={() => { setIsExportOpen(false); setIsExportDialogOpen(true); }}
                                    className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted rounded-t-md"
                                >
                                    Export Dashboard
                                </button>
                                <button
                                    onClick={() => { setIsExportOpen(false); handleShareLink(); }}
                                    className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                                >
                                    Publish (Create Link To Share)
                                </button>
                                <button
                                    onClick={() => { setIsExportOpen(false); handleExportToCSV('single'); }}
                                    className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                                >
                                    Export Dashboard Layout (CSV)
                                </button>
                                <button
                                    onClick={() => { setIsExportOpen(false); handleExportToCSV('separate'); }}
                                    className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                                >
                                    Export All Charts Data (CSV)
                                </button>
                                <button
                                    onClick={() => { setIsExportOpen(false); handleDownloadPBIT(); }}
                                    className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted rounded-b-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isExporting || widgets.length === 0}
                                >
                                    {isExporting ? 'Generating...' : 'Export to Power BI (.pbit)'}
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleSave}
                        className={baseBtnClass}
                        title="Save dashboard to database"
                    >
                        <FaRegSave size={18} /> Save
                    </button>
                </div>
            </header>

            {/* Share Link Dialog */}
            <ShareDashboardDialog
                open={shareDialogOpen}
                onOpenChange={handleShareDialogClose}
                shareLink={shareLink}
                shareStatus={shareStatus}
                shareError={shareError}
                linkCopied={linkCopied}
                onShareLink={handleShareLink}
                onCopyLink={handleCopyLink}
                onOpenInNewTab={handleOpenInNewTab}
            />

            {/* Export Dialog */}
            <ExportDashboardDialog
                open={isExportDialogOpen}
                onOpenChange={setIsExportDialogOpen}
                widgets={widgets}
                projectName={projectName}
                isCapturing={isCapturing}
                captureProgress={captureProgress}
                isExporting={isExporting}
                onExportPDF={handleExportPDF}
                onExportImage={handleExportImage}
                onExportCSV={handleExportToCSV}
                onDownloadPBIT={handleDownloadPBIT}
                onShareLink={handleShareLinkAndCloseExport}
            />
        </>
    );
}