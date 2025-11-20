/**
 * Simple Tabular Data Visualization Component (fromtherepo version)
 * 
 * This is the simple, working version that was originally in the DevUI repo.
 * Keeps it minimal and focused on basic table rendering with simple chart support.
 */

import React from 'react';
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
 * Main simple visualization component
 * 
 * This is the "fromtherepo" version - simple and working
 */
export function TabularDataVisualization({ data, className }: TabularDataVisualizationProps) {
  if (!data.data || data.data.length === 0) {
    return (
      <div className={`p-4 border rounded ${className || ''}`}>
        <p className="text-gray-500">No data to display</p>
      </div>
    );
  }

  const renderContent = () => {
    // Simple logic for visualization type
    const vizType = (data.visualization_type || 'table').toLowerCase();
    
    if (vizType.includes('bar')) {
      return <SimpleBarChart data={data} />;
    } else if (vizType.includes('line')) {
      return <SimpleLineChart data={data} />;
    } else {
      return <SimpleTable data={data} />;
    }
  };

  return (
    <div className={`border rounded p-4 my-4 ${className || ''}`}>
      {data.title && (
        <h3 className="text-lg font-semibold mb-3">{data.title}</h3>
      )}
      {renderContent()}
      {data.visualization_type && (
        <div className="text-xs text-gray-500 mt-2">
          Type: {data.visualization_type}
        </div>
      )}
    </div>
  );
}