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
 * Simple bar chart - basic version
 */
function SimpleBarChart({ data }: { data: TabularData }) {
  const chartData = data.data;
  const xKey = data.headers[0];
  const yKey = data.headers[1];

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
  const yKey = data.headers[1];

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
 * Simple heatmap - CSS-based implementation
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

  const xKey = data.headers[0];
  const yKey = data.headers[1];
  const valueKey = data.headers[2];

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
 * Main simple visualization component
 * 
 * This is the "fromtherepo" version - simple and working with interactive type switching
 */
export function TabularDataVisualization({ data, className }: TabularDataVisualizationProps) {
  // State for current visualization type, defaulting to the provided type or 'table'
  const [currentVisualizationType, setCurrentVisualizationType] = useState<string>(
    data.visualization_type || 'table'
  );

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
      
      {data.visualization_type && (
        <div className="text-xs text-gray-500 mt-2">
          Original Type: {data.visualization_type} | Current: {currentVisualizationType}
        </div>
      )}
    </div>
  );
}