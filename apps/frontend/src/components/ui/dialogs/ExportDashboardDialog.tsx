'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X, FileText, ImageIcon, Database, BarChart2, Share2 } from 'lucide-react';

interface ExportDashboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  widgets: any[];
  projectName: string;
  isCapturing: boolean;
  captureProgress: string;
  isExporting: boolean;
  onExportPDF: () => void;
  onExportImage: (format: 'png' | 'jpg') => void;
  onExportCSV: (format: 'single' | 'separate') => void;
  onDownloadPBIT: () => void;
  onShareLink: () => void;
}

export default function ExportDashboardDialog({
  open,
  onOpenChange,
  widgets,
  projectName,
  isCapturing,
  captureProgress,
  isExporting,
  onExportPDF,
  onExportImage,
  onExportCSV,
  onDownloadPBIT,
  onShareLink,
}: ExportDashboardDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 bg-background rounded-xl shadow-2xl border border-border w-[600px] max-w-[90vw] max-h-[85vh] flex flex-col">
          <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
            <Dialog.Title className="text-xl text-foreground font-semibold">
              Export Dashboard
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 rounded-full text-foreground hover:bg-muted" aria-label="Close">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            {isCapturing && (
              <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-10 rounded-xl">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                <span className="text-muted-foreground text-sm">{captureProgress}</span>
              </div>
            )}

            {/* PDF Section */}
            <div className="flex items-start gap-4 p-4 border-b border-border">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">PDF Document</h3>
                <p className="text-sm text-muted-foreground mt-1">Download the entire dashboard as a print-ready PDF file</p>
                <button
                  onClick={onExportPDF}
                  className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  Download PDF
                </button>
              </div>
            </div>

            {/* Image Section */}
            <div className="flex items-start gap-4 p-4 border-b border-border">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">Image Export</h3>
                <p className="text-sm text-muted-foreground mt-1">Export the dashboard as a high-quality image</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => onExportImage('png')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    Download PNG
                  </button>
                  <button
                    onClick={() => onExportImage('jpg')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    Download JPG
                  </button>
                </div>
              </div>
            </div>

            {/* CSV Section */}
            <div className="flex items-start gap-4 p-4 border-b border-border">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">Data Export (CSV)</h3>
                <p className="text-sm text-muted-foreground mt-1">Export dashboard widget data as spreadsheet files</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => onExportCSV('single')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    Layout CSV
                  </button>
                  <button
                    onClick={() => onExportCSV('separate')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    All Charts CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Power BI Section */}
            <div className="flex items-start gap-4 p-4 border-b border-border">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">Power BI Template</h3>
                <p className="text-sm text-muted-foreground mt-1">Export as a .pbit template file to import into Microsoft Power BI</p>
                <button
                  onClick={onDownloadPBIT}
                  disabled={isExporting || widgets.length === 0}
                  className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? 'Generating...' : 'Export to Power BI (.pbit)'}
                </button>
              </div>
            </div>

            {/* Share Link Section */}
            <div className="flex items-start gap-4 p-4">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                <Share2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">Share Dashboard</h3>
                <p className="text-sm text-muted-foreground mt-1">Create a public shareable link for this dashboard</p>
                <button
                  onClick={onShareLink}
                  className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  Publish & Get Link
                </button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}