import React, { useState, useEffect } from "react";
import { Database, Table, Server, AlertCircle, Loader2, CheckCircle, Download } from "lucide-react";
import { useCanvasHook } from '../../Context/CanvasContext';

const SqlServerConnector = () => {
  const [databases, setDatabases] = useState([]);
  const [selectedDB, setSelectedDB] = useState("");
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");
  const [serverStatus, setServerStatus] = useState(null);

  // Get context functions for storing data
  const { addStoredDataSet } = useCanvasHook();

  const BasePort = process.env.NEXT_PUBLIC_BACKEND_BASE_PORT;
  let API_BASE = "";
  if (typeof window !== "undefined") {
    API_BASE = `${window.location.protocol}//${window.location.hostname}:${BasePort}`;
  }

  // Check server status on mount
  useEffect(() => {
    checkServerStatus();
  }, []);

  // Fetch databases on mount
  useEffect(() => {
    fetchDatabases();
  }, []);

  const checkServerStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/`);
      const data = await response.json();
      setServerStatus(data.status === "API is running");
    } catch (err) {
      setServerStatus(false);
      setError("Failed to connect to server");
    }
  };

  const fetchDatabases = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/databases`);
      const data = await response.json();

      if (response.ok) {
        setDatabases(data.databases || []);
      } else {
        setError(data.error || "Failed to fetch databases");
      }
    } catch (err) {
      setError("Error connecting to server: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async (dbName: string) => {
    setLoading(true);
    setError("");
    setTables([]);
    setSelectedTable("");
    setRows([]);

    try {
      const response = await fetch(`${API_BASE}/tables/${dbName}`);
      const data = await response.json();

      if (response.ok) {
        setTables(data.tables || []);
      } else {
        setError(data.error || "Failed to fetch tables");
      }
    } catch (err) {
      setError("Error fetching tables: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRows = async (dbName: string, tableName: string) => {
    setLoading(true);
    setError("");

    try {
      // Fetch preview data with limit for display
      const response = await fetch(`${API_BASE}/data/${dbName}/${tableName}?preview=true&limit=100`);
      const data = await response.json();

      if (response.ok) {
        setRows(data.rows || []);
      } else {
        setError(data.error || "Failed to fetch table data");
      }
    } catch (err) {
      setError("Error fetching data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDataToDatasets = async () => {
    if (!selectedDB || !selectedTable) {
      alert("Please select both database and table first");
      return;
    }

    setLoadingData(true);
    try {
      // Fetch all data (not just preview) - no limit parameter
      const response = await fetch(`${API_BASE}/data/${selectedDB}/${selectedTable}`);
      const data = await response.json();

      if (response.ok && data.rows && data.rows.length > 0) {
        // Extract headers from the first row
        const headers = Object.keys(data.rows[0]);

        // Add to stored datasets
        const datasetName = `${selectedDB}_${selectedTable}`;
        const datasetId = addStoredDataSet({
          name: datasetName,
          fileName: `${datasetName}.sql`,
          headers: headers,
          data: data.rows,
          rowCount: data.returned_rows,
          totalRows: data.total_rows,
          source: 'database',
          database: selectedDB,
          table: selectedTable
        });

        let message = `Data from ${selectedDB}.${selectedTable} has been loaded successfully!`;
        if (data.total_rows > data.returned_rows) {
          message += `\n\nNote: Loaded ${data.returned_rows} out of ${data.total_rows} total rows for performance reasons.`;
        }
        message += `\n\nYou can now use it to create charts in the Data tab.`;

        alert(message);

        // Optional: Clear the selection after successful load
        // setSelectedDB("");
        // setSelectedTable("");
        // setRows([]);

      } else {
        setError(data.error || "Failed to load table data");
      }
    } catch (err) {
      setError("Error loading data: " + err.message);
    } finally {
      setLoadingData(false);
    }
  };

  const handleDatabaseChange = (dbName: string) => {
    setSelectedDB(dbName);
    if (dbName) {
      fetchTables(dbName);
    } else {
      setTables([]);
      setSelectedTable("");
      setRows([]);
    }
  };

  const handleTableChange = (tableName: string) => {
    setSelectedTable(tableName);
    if (tableName && selectedDB) {
      fetchRows(selectedDB, tableName);
    } else {
      setRows([]);
    }
  };

  return (
    <div className="min-h-[45vh] bg-gradient-to-br from-blue-50 to-indigo-100 p-5 rounded-2xl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-3 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Server className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-800">MySQL Server Explorer</h1>
            </div>
            <div className="flex items-center space-x-1">
              {serverStatus === null ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
              ) : serverStatus ? (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Connected</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Disconnected</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-1">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Database Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-1 mb-4">
              <Database className="h-6 w-6 text-blue-600" />
              <label className="text-lg font-semibold text-gray-700">Select Database</label>
            </div>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
              value={selectedDB}
              onChange={(e) => handleDatabaseChange(e.target.value)}
              disabled={loading}
            >
              <option value="">-- Choose a Database --</option>
              {databases.map((db, index) => (
                <option key={index} value={db}>
                  {db}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-2">
              {databases.length} database(s) available
            </p>
          </div>

          {/* Table Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-1 mb-4">
              <Table className="h-6 w-6 text-green-600" />
              <label className="text-lg font-semibold text-gray-700">Select Table</label>
            </div>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:bg-gray-100 text-black"
              value={selectedTable}
              onChange={(e) => handleTableChange(e.target.value)}
              disabled={!selectedDB || loading}
            >
              <option value="">-- Choose a Table --</option>
              {tables.map((table, index) => (
                <option key={index} value={table}>
                  {table}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-2">
              {tables.length} table(s) in {selectedDB || "selected database"}
            </p>
          </div>
        </div>

        {/* Load Data Button */}
        {selectedTable && selectedDB && rows.length > 0 && !loading && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Load Data for Charts</h3>
                <p className="text-gray-600 text-sm">
                  Load this table data into your datasets to create charts and visualizations.
                  The data will be available in the "Get Data" section under "Stored Datasets".
                </p>
              </div>
              <button
                onClick={handleLoadDataToDatasets}
                disabled={loadingData}
                className="flex items-center space-x-1 px-6 py-3  text-indigo-600 border-2 border-indigo-300 bg-blue-50
                rounded-md
                text-sm font-medium transition-all duration-200
                hover:text-white
                hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600
                hover:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingData ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-6" />
                    <span>Load Data</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        )}

        {/* Data Table */}
        {selectedTable && rows.length > 0 && !loading && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 px-4 py-2">
              <h2 className="text-xl font-semibold text-white flex items-center space-x-1">
                <Table className="h-6 w-6" />
                <span>Preview: {selectedDB}.{selectedTable}</span>
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Showing {rows.length} row(s) (limited to 100 for performance)
              </p>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {rows.length > 0 &&
                      Object.keys(rows[0]).map((col, index) => (
                        <th
                          key={index}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
                        >
                          {col}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rows.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {Object.values(row).map((val, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-4 py-3 text-sm text-gray-900 border-b"
                        >
                          {val !== null ? (
                            <span className="max-w-xs truncate block">
                              {val.toString()}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">NULL</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {selectedTable && rows.length === 0 && !loading && !error && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Table className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Found</h3>
            <p className="text-gray-500">The selected table appears to be empty.</p>
          </div>
        )}

        {/* Instructions */}
        {!selectedDB && !loading && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Database className="h-16 w-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Get Started</h3>
            <p className="text-gray-600">
              Select a database from the dropdown above to explore its tables and data.
              Once you find the data you need, click "Load Data" to add it to your stored datasets.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SqlServerConnector;