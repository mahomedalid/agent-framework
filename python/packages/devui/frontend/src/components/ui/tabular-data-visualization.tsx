/**
 * Simple Tabular Data Visualization Component (fromtherepo version)
 * 
 * This is the simple, working version that was originally in the DevUI repo.
 * Keeps it minimal and focused on basic table rendering with simple chart support.
 */

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import type { TabularData } from './types';

interface TabularDataVisualizationProps {
  data: TabularData;
  className?: string;
}

/**
 * Simple table renderer - the basic fallback
 */
function SimpleTable({ data }: { data: TabularData }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800">
            {data.headers.map((header) => (
              <th
                key={header}
                className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-medium"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              {data.headers.map((header) => (
                <td
                  key={header}
                  className="border border-gray-300 dark:border-gray-600 px-4 py-2"
                >
                  {String(row[header] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Helper function to find the first numeric column in headers
 */
function findFirstNumericColumn(data: TabularData, startIndex: number = 1): string {
  // Helper function to check if a column contains mostly numeric data
  const isNumericColumn = (columnName: string): boolean => {
    const values = data.data.map(row => row[columnName]).filter(val => val != null);
    if (values.length === 0) return false;
    
    const numericCount = values.filter(val => {
      const num = parseFloat(String(val));
      return !isNaN(num) && isFinite(num);
    }).length;
    
    return numericCount / values.length >= 0.8; // 80% or more are numeric
  };

  // Start from startIndex and look for first numeric column
  for (let i = startIndex; i < data.headers.length; i++) {
    if (isNumericColumn(data.headers[i])) {
      return data.headers[i];
    }
  }
  
  // If no numeric column found, fallback to second header or first available
  return data.headers[startIndex] || data.headers[0];
}

/**
 * Simple bar chart - basic version
 */
function SimpleBarChart({ data }: { data: TabularData }) {
  const chartData = data.data;
  const xKey = data.headers[0];
  const yKey = findFirstNumericColumn(data, 1); // Start looking from index 1

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Bar dataKey={yKey} fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * Simple line chart - basic version
 */
function SimpleLineChart({ data }: { data: TabularData }) {
  const chartData = data.data;
  const xKey = data.headers[0];
  const yKey = findFirstNumericColumn(data, 1); // Start looking from index 1

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey={yKey} stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
}

/**
 * Improved heatmap - CSS-based implementation with better column detection
 */
function SimpleHeatmap({ data }: { data: TabularData }) {
  // For heatmap, we need at least 3 columns: x-axis, y-axis, and value
  if (data.headers.length < 3) {
    return (
      <div className="p-4 text-center text-gray-500">
        Heatmap requires at least 3 columns (X-axis, Y-axis, Value)
      </div>
    );
  }

  // Helper to check if column is numeric
  const isNumericColumn = (columnName: string): boolean => {
    const values = data.data.map(row => row[columnName]).filter(val => val != null);
    if (values.length === 0) return false;
    
    const numericCount = values.filter(val => {
      const num = parseFloat(String(val));
      return !isNaN(num) && isFinite(num);
    }).length;
    
    return numericCount / values.length >= 0.8;
  };

  // Smart column selection: use first two non-numeric columns for axes, first numeric for value
  let xKey = data.headers[0];
  let yKey = data.headers[1];
  let valueKey = findFirstNumericColumn(data, 0); // Find first numeric column from start

  // If first column is numeric, try to find categorical columns
  const categoricalColumns = data.headers.filter(header => !isNumericColumn(header));
  if (categoricalColumns.length >= 2) {
    xKey = categoricalColumns[0];
    yKey = categoricalColumns[1];
  } else if (categoricalColumns.length === 1) {
    xKey = categoricalColumns[0];
    yKey = data.headers.find(h => h !== xKey && h !== valueKey) || data.headers[1];
  }

  // Get unique values for x and y axes
  const xValues = [...new Set(data.data.map(row => row[xKey]))];
  const yValues = [...new Set(data.data.map(row => row[yKey]))];

  // Create a matrix for the heatmap
  const matrix: { [key: string]: { [key: string]: number } } = {};
  const allValues: number[] = [];

  // Initialize matrix
  yValues.forEach(y => {
    matrix[y] = {};
    xValues.forEach(x => {
      matrix[y][x] = 0;
    });
  });

  // Fill matrix with data
  data.data.forEach(row => {
    const x = row[xKey];
    const y = row[yKey];
    const value = parseFloat(row[valueKey]) || 0;
    matrix[y][x] = value;
    allValues.push(value);
  });

  // Calculate min and max for color scaling
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);

  // Function to get color based on value
  const getColor = (value: number) => {
    if (maxValue === minValue) return 'rgba(59, 130, 246, 0.5)';
    const intensity = (value - minValue) / (maxValue - minValue);
    return `rgba(59, 130, 246, ${0.1 + intensity * 0.9})`;
  };

  return (
    <div className="overflow-auto">
      <div className="min-w-fit">
        {/* Heatmap grid */}
        <div className="grid gap-1 p-4" style={{ gridTemplateColumns: `120px repeat(${xValues.length}, 80px)` }}>
          {/* Header row */}
          <div></div>
          {xValues.map(x => (
            <div key={x} className="text-xs font-medium text-center p-1 truncate" title={String(x)}>
              {String(x)}
            </div>
          ))}
          
          {/* Data rows */}
          {yValues.map(y => (
            <React.Fragment key={y}>
              <div className="text-xs font-medium p-1 truncate" title={String(y)}>
                {String(y)}
              </div>
              {xValues.map(x => {
                const value = matrix[y][x];
                return (
                  <div
                    key={`${y}-${x}`}
                    className="h-12 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-xs cursor-pointer hover:border-gray-400 transition-colors"
                    style={{ backgroundColor: getColor(value) }}
                    title={`${y} × ${x}: ${value}`}
                  >
                    {value.toFixed(2)}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center mt-4 space-x-4">
          <span className="text-xs text-gray-500">Min: {minValue.toFixed(3)}</span>
          <div className="flex h-4 w-32 border border-gray-300">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="flex-1"
                style={{ backgroundColor: `rgba(59, 130, 246, ${0.1 + (i / 19) * 0.9})` }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">Max: {maxValue.toFixed(3)}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Pivot Table Component
 */
function PivotTable({ data }: { data: TabularData }) {
  if (data.headers.length < 3) {
    return (
      <div className="p-4 text-center text-gray-500">
        Pivot table requires at least 3 columns (Row, Column, Value)
      </div>
    );
  }

  // Helper to check if column is numeric
  const isNumericColumn = (columnName: string): boolean => {
    const values = data.data.map(row => row[columnName]).filter(val => val != null);
    if (values.length === 0) return false;
    
    const numericCount = values.filter(val => {
      const num = parseFloat(String(val));
      return !isNaN(num) && isFinite(num);
    }).length;
    
    return numericCount / values.length >= 0.8;
  };

  // Smart column selection for pivot
  const categoricalColumns = data.headers.filter(header => !isNumericColumn(header));
  const numericColumns = data.headers.filter(isNumericColumn);

  let rowKey = data.headers[0];
  let colKey = data.headers[1];
  let valueKey = numericColumns[0] || data.headers[2];

  if (categoricalColumns.length >= 2) {
    rowKey = categoricalColumns[0];
    colKey = categoricalColumns[1];
  } else if (categoricalColumns.length === 1) {
    rowKey = categoricalColumns[0];
    colKey = data.headers.find(h => h !== rowKey && h !== valueKey) || data.headers[1];
  }

  // Get unique values for rows and columns
  const rowValues = [...new Set(data.data.map(row => String(row[rowKey] || '')))];
  const colValues = [...new Set(data.data.map(row => String(row[colKey] || '')))];

  // Create pivot data structure
  const pivotData: { [row: string]: { [col: string]: number } } = {};
  const totals = { rows: {} as { [key: string]: number }, cols: {} as { [key: string]: number }, grand: 0 };

  // Initialize pivot structure
  rowValues.forEach(row => {
    pivotData[row] = {};
    totals.rows[row] = 0;
    colValues.forEach(col => {
      pivotData[row][col] = 0;
    });
  });
  colValues.forEach(col => {
    totals.cols[col] = 0;
  });

  // Fill pivot data with aggregated values
  data.data.forEach(row => {
    const rowVal = String(row[rowKey] || '');
    const colVal = String(row[colKey] || '');
    const value = parseFloat(String(row[valueKey])) || 0;
    
    if (pivotData[rowVal] && pivotData[rowVal][colVal] !== undefined) {
      pivotData[rowVal][colVal] += value;
      totals.rows[rowVal] += value;
      totals.cols[colVal] += value;
      totals.grand += value;
    }
  });

  return (
    <div className="overflow-auto">
      <div className="min-w-fit">
        <table className="border-collapse border border-gray-300 dark:border-gray-600">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-medium sticky left-0 bg-gray-100 dark:bg-gray-800 z-10">
                {rowKey} \\ {colKey}
              </th>
              {colValues.map(col => (
                <th key={col} className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-medium text-center min-w-[100px]">
                  {col}
                </th>
              ))}
              <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-medium text-center bg-gray-200 dark:bg-gray-700">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {rowValues.map(row => (
              <tr key={row} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-medium text-left sticky left-0 bg-gray-50 dark:bg-gray-900 z-10">
                  {row}
                </th>
                {colValues.map(col => {
                  const value = pivotData[row][col];
                  return (
                    <td key={col} className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right">
                      {value === 0 ? '-' : value.toLocaleString()}
                    </td>
                  );
                })}
                <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right font-medium bg-gray-100 dark:bg-gray-800">
                  {totals.rows[row].toLocaleString()}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-200 dark:bg-gray-700 font-medium">
              <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left sticky left-0 bg-gray-200 dark:bg-gray-700 z-10">
                Total
              </th>
              {colValues.map(col => (
                <td key={col} className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right">
                  {totals.cols[col].toLocaleString()}
                </td>
              ))}
              <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right font-bold">
                {totals.grand.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="text-xs text-gray-500 mt-2">
        Rows: {rowKey} | Columns: {colKey} | Values: {valueKey} (aggregated sum)
      </div>
    </div>
  );
}

/**
 * Visualization Type Selector Component
 */
function VisualizationTypeSelector({ 
  currentType, 
  onTypeChange 
}: { 
  currentType: string; 
  onTypeChange: (type: string) => void; 
}) {
  const types = [
    { id: 'table', name: 'Table', icon: '📊' },
    { id: 'pivot', name: 'Pivot Table', icon: '🔄' },
    { id: 'bar', name: 'Bar Chart', icon: '📊' },
    { id: 'line', name: 'Line Chart', icon: '📈' },
    { id: 'heatmap', name: 'Heatmap', icon: '🔥' }
  ];

  return (
    <div className="flex gap-2 mb-4">
      {types.map((type) => (
        <button
          key={type.id}
          onClick={() => onTypeChange(type.id)}
          className={`px-3 py-1 text-sm rounded border transition-colors ${
            currentType === type.id
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
          }`}
        >
          <span className="mr-1">{type.icon}</span>
          {type.name}
        </button>
      ))}
    </div>
  );
}

/**
 * Analyze data and determine the best default visualization type
 */
function determineDefaultVisualizationType(data: TabularData): string {
  if (!data.data || data.data.length === 0 || data.headers.length === 0) {
    return 'table';
  }

  const numColumns = data.headers.length;
  const numRows = data.data.length;
  
  // Helper function to check if a column contains mostly numeric data
  const isNumericColumn = (columnName: string): boolean => {
    const values = data.data.map(row => row[columnName]).filter(val => val != null);
    if (values.length === 0) return false;
    
    const numericCount = values.filter(val => {
      const num = parseFloat(String(val));
      return !isNaN(num) && isFinite(num);
    }).length;
    
    return numericCount / values.length >= 0.5; // 50% or more are numeric
  };

  // Helper function to check if a column contains date/time-like data
  const isDateTimeColumn = (columnName: string): boolean => {
    const values = data.data.map(row => row[columnName]).filter(val => val != null);
    if (values.length === 0) return false;
    
    const dateCount = values.filter(val => {
      const str = String(val).toLowerCase();
      // Check for common date patterns
      return str.match(/\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/) || // YYYY-MM-DD or YYYY/MM/DD
             str.match(/\d{1,2}[-\/]\d{1,2}[-\/]\d{4}/) || // MM-DD-YYYY or MM/DD/YYYY
             str.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/) || // ISO date
             str.includes('jan') || str.includes('feb') || str.includes('mar') ||
             str.includes('apr') || str.includes('may') || str.includes('jun') ||
             str.includes('jul') || str.includes('aug') || str.includes('sep') ||
             str.includes('oct') || str.includes('nov') || str.includes('dec') ||
             !isNaN(Date.parse(str));
    }).length;
    
    return dateCount / values.length >= 0.6; // 60% or more look like dates
  };

  // Helper function to check if we have categorical vs continuous data
  const getCategoricalColumns = (): string[] => {
    return data.headers.filter(header => {
      if (isNumericColumn(header) || isDateTimeColumn(header)) return false;
      
      const uniqueValues = new Set(data.data.map(row => row[header]));
      const totalValues = data.data.length;
      
      // If unique values are less than 50% of total and we have reasonable number of categories
      return uniqueValues.size < totalValues * 0.5 && uniqueValues.size <= 20;
    });
  };

  const numericColumns = data.headers.filter(isNumericColumn);
  const categoricalColumns = getCategoricalColumns();

  // Decision logic based on data characteristics:

  // 1. Pivot Table: Best for 3+ columns with 2 categorical dimensions and 1+ numeric values, good for aggregation
  if (numColumns >= 3 && categoricalColumns.length >= 2 && numericColumns.length >= 1) {
    const xCategories = new Set(data.data.map(row => row[categoricalColumns[0]])).size;
    const yCategories = new Set(data.data.map(row => row[categoricalColumns[1]])).size;
    
    // Good pivot candidates: moderate matrix size, good for cross-tabulation
    if (xCategories <= 20 && yCategories <= 20 && xCategories * yCategories <= numRows * 3) {
      // Check if data seems to need aggregation (duplicates in category combinations)
      const combinations = new Set(data.data.map(row => `${row[categoricalColumns[0]]}-${row[categoricalColumns[1]]}`));
      if (combinations.size < numRows * 0.8) { // Some duplicates suggest aggregation is needed
        return 'pivot';
      }
    }
  }

  // 2. Heatmap: Best for 3+ columns with 2 categorical dimensions and 1 numeric value (dense matrix)
  if (numColumns >= 3 && categoricalColumns.length >= 2 && numericColumns.length >= 1) {
    const xCategories = new Set(data.data.map(row => row[categoricalColumns[0]])).size;
    const yCategories = new Set(data.data.map(row => row[categoricalColumns[1]])).size;
    
    // Good heatmap candidates: smaller, denser matrix
    if (xCategories <= 10 && yCategories <= 10 && xCategories * yCategories >= numRows * 0.7) {
      return 'heatmap';
    }
  }

  // 3. Line Chart: Best for time series data or sequential numeric data
  if (numColumns >= 2 && numericColumns.length >= 1) {
    // Check if first column looks like time/sequence
    const firstCol = data.headers[0];
    if (isDateTimeColumn(firstCol)) {
      return 'line';
    }
    
    // Check if first column is sequential numbers (like index, year, etc.)
    if (isNumericColumn(firstCol)) {
      const values = data.data.map(row => parseFloat(row[firstCol])).filter(v => !isNaN(v)).sort((a, b) => a - b);
      const isSequential = values.every((val, idx) => idx === 0 || val >= values[idx - 1]);
      
      if (isSequential && values.length === data.data.length) {
        return 'line';
      }
    }
  }

  // 4. Bar Chart: Best for categorical data with numeric values
  if (numColumns >= 2 && categoricalColumns.length >= 1 && numericColumns.length >= 1) {
    const categories = new Set(data.data.map(row => row[categoricalColumns[0]])).size;
    
    // Good for moderate number of categories
    if (categories <= 20 && categories >= 2) {
      return 'bar';
    }
  }

  // 5. Line Chart as secondary choice: Any two numeric columns
  if (numColumns >= 2 && numericColumns.length >= 2) {
    return 'line';
  }

  // 6. Bar Chart as fallback: At least one categorical and one numeric
  if (categoricalColumns.length >= 1 && numericColumns.length >= 1) {
    return 'bar';
  }

  // 7. Default fallback: Table for everything else
  return 'table';
}

/**
 * Main simple visualization component
 * 
 * This is the "fromtherepo" version - simple and working with interactive type switching
 */
export function TabularDataVisualization({ data, className }: TabularDataVisualizationProps) {
  // Determine default visualization type if not provided
  const defaultVizType = data.visualization_type || determineDefaultVisualizationType(data);
  
  // State for current visualization type, using the determined default
  const [currentVisualizationType, setCurrentVisualizationType] = useState<string>(defaultVizType);

  if (!data.data || data.data.length === 0) {
    return (
      <div className={`p-4 border rounded ${className || ''}`}>
        <p className="text-gray-500">No data to display</p>
      </div>
    );
  }

  const renderContent = () => {
    // Use current state instead of fixed prop
    const vizType = currentVisualizationType.toLowerCase();
    
    if (vizType.includes('bar')) {
      return <SimpleBarChart data={data} />;
    } else if (vizType.includes('line')) {
      return <SimpleLineChart data={data} />;
    } else if (vizType.includes('heatmap')) {
      return <SimpleHeatmap data={data} />;
    } else if (vizType.includes('pivot')) {
      return <PivotTable data={data} />;
    } else {
      return <SimpleTable data={data} />;
    }
  };

  return (
    <div className={`border rounded p-4 my-4 ${className || ''}`}>
      {data.title && (
        <h3 className="text-lg font-semibold mb-3">{data.title}</h3>
      )}
      
      <VisualizationTypeSelector 
        currentType={currentVisualizationType}
        onTypeChange={setCurrentVisualizationType}
      />
      
      {renderContent()}
      
      <div className="text-xs text-gray-500 mt-2">
        {data.visualization_type ? (
          <>Original Type: {data.visualization_type} | Current: {currentVisualizationType}</>
        ) : (
          <>Auto-detected: {defaultVizType} | Current: {currentVisualizationType}</>
        )}
      </div>
    </div>
  );
}
