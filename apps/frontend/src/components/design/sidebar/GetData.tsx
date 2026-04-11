'use client';

import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Database, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useCanvasHook } from '@/contexts/CanvasContext';
import Papa from 'papaparse';

interface GetDataProps {
    onClose: () => void;
}

const GetData: React.FC<GetDataProps> = ({ onClose }) => {
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const { addStoredDataSet, storedDataSets } = useCanvasHook();

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Check file type
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (fileExtension !== 'csv' && fileExtension !== 'xlsx') {
            setUploadStatus('error');
            setErrorMessage('Only CSV and Excel files are supported');
            return;
        }

        setUploadStatus('loading');
        setErrorMessage('');

        if (fileExtension === 'csv') {
            // Parse CSV
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.data && results.data.length > 0) {
                        const headers = Object.keys(results.data[0] as object);

                        addStoredDataSet({
                            name: file.name.replace('.csv', ''),
                            fileName: file.name,
                            headers: headers,
                            columns: headers, // Add columns for database compatibility
                            data: results.data,
                            rowCount: results.data.length,
                            totalRows: results.data.length,
                            source: 'upload',
                        });

                        setUploadStatus('success');
                        setTimeout(() => {
                            setUploadStatus('idle');
                            onClose();
                        }, 1500);
                    } else {
                        setUploadStatus('error');
                        setErrorMessage('File is empty or has no valid data');
                    }
                },
                error: (error) => {
                    setUploadStatus('error');
                    setErrorMessage(error.message);
                },
            });
        } else {
            // For Excel files, you would need to use a library like xlsx
            setUploadStatus('error');
            setErrorMessage('Excel file support coming soon. Please use CSV files for now.');
        }
    };

    return (
        <div className="min-h-[45vh] bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-800 dark:to-gray-900 p-5 rounded-2xl">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-background rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <FileSpreadsheet className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        <h1 className="text-3xl font-bold text-foreground">Get Data</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Upload CSV or Excel files, or use data from connected databases
                    </p>
                </div>

                {/* Upload Section */}
                <div className="bg-background rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                        <Upload className="h-6 w-6 mr-2 text-purple-600 dark:text-purple-400" />
                        Upload File
                    </h2>

                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-purple-500 dark:hover:border-purple-400 transition-colors">
                        <input
                            type="file"
                            id="file-upload"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={uploadStatus === 'loading'}
                        />
                        <label
                            htmlFor="file-upload"
                            className="cursor-pointer flex flex-col items-center"
                        >
                            {uploadStatus === 'loading' ? (
                                <Loader2 className="h-16 w-16 text-purple-600 dark:text-purple-400 animate-spin mb-4" />
                            ) : uploadStatus === 'success' ? (
                                <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400 mb-4" />
                            ) : uploadStatus === 'error' ? (
                                <AlertCircle className="h-16 w-16 text-red-600 dark:text-red-400 mb-4" />
                            ) : (
                                <Upload className="h-16 w-16 text-muted-foreground mb-4" />
                            )}

                            <p className="text-lg font-medium text-foreground mb-2">
                                {uploadStatus === 'loading' ? 'Processing...' :
                                    uploadStatus === 'success' ? 'File uploaded successfully!' :
                                        uploadStatus === 'error' ? 'Upload failed' :
                                            'Click to upload or drag and drop'}
                            </p>

                            {uploadStatus === 'idle' && (
                                <p className="text-sm text-muted-foreground">
                                    CSV or Excel files (Max 10MB)
                                </p>
                            )}

                            {uploadStatus === 'error' && errorMessage && (
                                <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                                    {errorMessage}
                                </p>
                            )}
                        </label>
                    </div>
                </div>

                {/* Stored Datasets */}
                {storedDataSets && storedDataSets.length > 0 && (
                    <div className="bg-background rounded-xl shadow-lg p-6">
<h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                            <Database className="h-6 w-6 mr-2 text-purple-600 dark:text-purple-400" />
                            Stored Datasets ({storedDataSets.length})
                        </h2>

                        <div className="space-y-3">
                            {storedDataSets.map((dataset) => (
                                <div
                                    key={dataset.id}
                                    className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <FileSpreadsheet className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                        <div>
                                            <p className="font-medium text-foreground">{dataset.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {dataset.rowCount} rows • {dataset.headers.length} columns
                                                {dataset.source && ` • ${dataset.source}`}
                                            </p>
                                        </div>
                                    </div>
                                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Instructions */}
                {(!storedDataSets || storedDataSets.length === 0) && uploadStatus === 'idle' && (
                    <div className="bg-background rounded-xl shadow-lg p-8 text-center">
                        <Database className="h-16 w-16 text-purple-400 dark:text-purple-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">No Datasets Yet</h3>
<p className="text-muted-foreground">
                            Upload a CSV file or connect to a database server to get started with your data.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GetData;
