'use client';
import React, { useState } from 'react';
import Papa from 'papaparse';
import { X, Table2, UploadCloud, Trash2, Calendar, Database, Eye, EyeOff, Server } from 'lucide-react';
import { useCanvasHook } from '@/contexts/CanvasContext';

const GetData = ({ onClose }: { onClose: () => void }) => {
    const { storedDataSets, addStoredDataSet, removeStoredDataSet } = useCanvasHook();
    const [file, setFile] = useState<any>(null);
    const [dataPreview, setDataPreview] = useState<any>(null);
    const [dataSetName, setDataSetName] = useState('');
    const [expandedDataSet, setExpandedDataSet] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = event.target.files?.[0];
        if (uploadedFile) {
            setFile(uploadedFile as any);
            setDataSetName(uploadedFile.name.replace(/\.[^/.]+$/, "")); // Remove file extension
            Papa.parse(uploadedFile, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                preview: 5,
                complete: (results: any) => {
                    setDataPreview(results);
                },
                error: (error: any) => {
                    alert(`Error parsing file: ${error.message}`);
                    setFile(null);
                    setDataPreview(null);
                }
            });
        }
    };

    const handleStoreData = () => {
        if (file && dataSetName.trim()) {
            Papa.parse(file, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: (results: any) => {
                    if (results.data.length > 0) {
                        const storedId = addStoredDataSet({
                            name: dataSetName.trim(),
                            fileName: file.name,
                            headers: results.meta.fields,
                            data: results.data,
                            rowCount: results.data.length,
                            source: 'file'
                        });
                        alert(`Data "${dataSetName}" has been stored successfully!`);
                        setFile(null);
                        setDataPreview(null);
                        setDataSetName('');
                    } else {
                        alert('The uploaded file is empty or invalid.');
                    }
                },
                error: (error: any) => {
                    alert(`Error parsing file: ${error.message}`);
                }
            });
        } else {
            alert('Please provide a name for the dataset.');
        }
    };

    const handleDeleteDataSet = (dataSetId: string) => {
        if (confirm('Are you sure you want to delete this dataset?')) {
            removeStoredDataSet(dataSetId);
        }
    };

    const toggleDataSetPreview = (dataSetId: string) => {
        setExpandedDataSet(expandedDataSet === dataSetId ? null : dataSetId);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'database':
                return <Server size={14} className="text-blue-500" />;
            case 'file':
            default:
                return <UploadCloud size={14} className="text-green-500" />;
        }
    };

    const getSourceLabel = (dataSet: any) => {
        if (dataSet.source === 'database' && dataSet.database && dataSet.table) {
            return `${dataSet.database}.${dataSet.table}`;
        }
        return dataSet.fileName || 'File Upload';
    };

    // Group datasets by source
    const fileDatasets = storedDataSets.filter(ds => ds.source === 'file' || !ds.source);
    const databaseDatasets = storedDataSets.filter(ds => ds.source === 'database');

    return (
        <div className='flex flex-col space-y-6'>
            {/* Import New Data Section */}
            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <UploadCloud size={20} className="text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Import New Data</h3>
                </div>

                {file ? (
                    <div className="space-y-4 p-4 border bg-gray-100 rounded-lg">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-foreground">Dataset Name</label>
                            <input
                                type="text"
                                value={dataSetName}
                                onChange={(e) => setDataSetName(e.target.value)}
                                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2  text-foreground focus:ring-indigo-500"
                                placeholder="Enter a name for this dataset"
                            />
                        </div>

                        <div className="flex justify-between items-center text-sm font-medium">
                            <span className="flex items-center space-x-2 text-indigo-600">
                                <Table2 size={16} />
                                <span>{file.name}</span>
                            </span>
                            <button
                                onClick={() => { setFile(null); setDataPreview(null); setDataSetName(''); }}
                                className="text-gray-400 hover:text-red-500"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {dataPreview && dataPreview.data && dataPreview.data.length > 0 && (
                            <div className="overflow-x-auto  rounded-md border border-gray-300 bg-background text-foreground">
                                <table className="min-w-full text-xs">
                                    <thead>
                                        <tr className="bg-gray-200 text-foreground uppercase">
                                            {dataPreview.meta.fields.map((field: any) => (
                                                <th key={field} className="px-4 py-2 text-left">{field}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dataPreview.data.map((row: any, index: number) => (
                                            <tr key={index} className="border-t border-gray-200 hover:bg-muted">
                                                {dataPreview.meta.fields.map((field: any) => (
                                                    <td key={field} className="px-4 py-2">{String(row[field])}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="px-4 py-2 bg-muted text-xs text-muted-foreground border-t">
                                    Showing preview (first 5 rows of {dataPreview.data.length} total rows)
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleStoreData}
                            disabled={!dataSetName.trim()}
                            className='w-full py-2 px-4 text-sm font-medium bg-blue-50 text-indigo-600 border-2 border-indigo-300 rounded-md cursor-pointer hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            Store Dataset
                        </button>
                    </div>
                ) : (
                    <label
                        htmlFor='csv-upload-dialog'
                        className='flex flex-col items-center justify-center py-6 px-4 text-sm font-medium text-muted-foreground border-2 border-dashed border-border rounded-md cursor-pointer hover:bg-muted transition-colors'
                    >
                        <UploadCloud size={32} className="text-gray-400 mb-2" />
                        <span>Click or drag file to upload</span>
                        <span className="text-xs text-gray-400 mt-1">Supports CSV, TSV, or JSON files</span>
                        <input
                            id='csv-upload-dialog'
                            type='file'
                            accept='.csv,.tsv,.json'
                            className='hidden'
                            onChange={handleFileChange}
                        />
                    </label>
                )}
            </div>

            {/* Stored Datasets Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Database size={20} className="text-indigo-600" />
                        <h3 className="text-lg font-semibold text-gray-800">Stored Datasets</h3>
                    </div>
                    <span className="text-sm text-gray-500">{storedDataSets.length} datasets</span>
                </div>

                {storedDataSets.length > 0 ? (
                    <div className="space-y-6">
                        {/* Database Datasets */}
                        {databaseDatasets.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Server size={16} className="text-blue-500" />
                                    <h4 className="font-medium text-foreground">From Database</h4>
                                    <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full">
                                        {databaseDatasets.length}
                                    </span>
                                </div>
                                {databaseDatasets.map(dataSet => (
                                    <div key={dataSet.id} className="border border-blue-200 rounded-lg bg-blue-50">
                                        <div className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-800">{dataSet.name}</h4>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                                        <span className="flex items-center space-x-1">
                                                            <Table2 size={14} />
                                                            <span>{dataSet.rowCount} rows</span>
                                                        </span>
                                                        <span className="flex items-center space-x-1">
                                                            <Calendar size={14} />
                                                            <span>{formatDate(dataSet.createdAt)}</span>
                                                        </span>
                                                        <span className="flex items-center space-x-1">
                                                            {getSourceIcon(dataSet.source)}
                                                            <span>{getSourceLabel(dataSet)}</span>
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        Columns: {dataSet.headers.join(', ')}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => toggleDataSetPreview(dataSet.id)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-md"
                                                        title="Toggle preview"
                                                    >
                                                        {expandedDataSet === dataSet.id ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteDataSet(dataSet.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                                                        title="Delete dataset"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {expandedDataSet === dataSet.id && (
                                            <div className="border-t border-blue-200 p-4 bg-muted">
                                                <div className="overflow-x-auto rounded-md border border-border bg-background">
                                                    <table className="min-w-full text-xs">
                                                        <thead>
                                                            <tr className="bg-gray-100 text-foreground uppercase">
                                                                {dataSet.headers.map((header: any) => (
                                                                    <th key={header} className="px-4 py-2 text-left">{header}</th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {dataSet.data.slice(0, 5).map((row: any, index: number) => (
                                                                <tr key={index} className="border-t border-gray-200 hover:bg-muted">
                                                                    {dataSet.headers.map((header: any) => (
                                                                        <td key={header} className="px-4 py-2 text-foreground">{String(row[header])}</td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                    <div className="px-4 py-2 bg-muted text-xs text-muted-foreground border-t">
                                                        Showing first 5 rows of {dataSet.rowCount} total rows
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* File Datasets */}
                        {fileDatasets.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <UploadCloud size={16} className="text-green-500" />
                                    <h4 className="font-medium text-foreground">From Files</h4>
                                    <span className="text-xs text-gray-500 bg-green-50 px-2 py-1 rounded-full">
                                        {fileDatasets.length}
                                    </span>
                                </div>
                                {fileDatasets.map(dataSet => (
                                    <div key={dataSet.id} className="border border-gray-200 rounded-lg bg-muted">
                                        <div className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-800">{dataSet.name}</h4>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                                        <span className="flex items-center space-x-1">
                                                            <Table2 size={14} />
                                                            <span>{dataSet.rowCount} rows</span>
                                                        </span>
                                                        <span className="flex items-center space-x-1">
                                                            <Calendar size={14} />
                                                            <span>{formatDate(dataSet.createdAt)}</span>
                                                        </span>
                                                        <span className="flex items-center space-x-1">
                                                            {getSourceIcon(dataSet.source)}
                                                            <span>{getSourceLabel(dataSet)}</span>
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        Columns: {dataSet.headers.join(', ')}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => toggleDataSetPreview(dataSet.id)}
                                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
                                                        title="Toggle preview"
                                                    >
                                                        {expandedDataSet === dataSet.id ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteDataSet(dataSet.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                                                        title="Delete dataset"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {expandedDataSet === dataSet.id && (
                                            <div className="border-t border-border p-4 bg-muted">
                                                <div className="overflow-x-auto rounded-md border border-border bg-background">
                                                    <table className="min-w-full text-xs">
                                                        <thead>
                                                            <tr className="bg-gray-100 text-foreground uppercase">
                                                                {dataSet.headers.map((header: any) => (
                                                                    <th key={header} className="px-4 py-2 text-left">{header}</th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {dataSet.data.slice(0, 5).map((row: any, index: number) => (
                                                                <tr key={index} className="border-t border-gray-200 hover:bg-muted">
                                                                    {dataSet.headers.map((header: any) => (
                                                                        <td key={header} className="px-4 py-2 text-foreground">{String(row[header])}</td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                    <div className="px-4 py-2 bg-muted text-xs text-muted-foreground border-t">
                                                        Showing first 5 rows of {dataSet.rowCount} total rows
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <Database size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>No datasets stored yet.</p>
                        <p className="text-sm">Upload a file above or connect to a database to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GetData;