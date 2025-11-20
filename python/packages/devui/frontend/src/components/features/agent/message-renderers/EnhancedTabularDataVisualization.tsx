/**
 * Tabular Data Visualization Components using Recharts
 * Enhanced version of DevUI's tabular-data-visualization.tsx
 */

import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, TrendingUp, Scatter3D } from 'lucide-react';
import { clsx } from 'clsx';
import type { TabularData } from './types';

interface TabularDataVisualizationProps {
  data: TabularData;
  className?: string;
  theme?: 'light' | 'dark';
}

// Enhanced color palette with theme support
const LIGHT_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', 
  '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#98fb98'
];

const DARK_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4',
  '#8b5cf6', '#f97316', '#3b82f6', '#ec4899', '#84cc16'
];

/**
 * Custom tooltip for better data display
 */
const CustomTooltip = ({ active, payload, label, theme }: any) => {
  if (active && payload && payload.length) {
    const bgColor = theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200';
    const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
    
    return (
      <div className={clsx('p-3 rounded-lg border shadow-lg', bgColor, textColor)}>
        <p className="font-medium">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.dataKey}: ${typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * Enhanced Bar Chart with animations and custom styling
 */
function EnhancedBarChart({ data, theme }: { data: TabularData; theme?: string }) {
  const chartData = data.data;
  const firstDataKey = data.headers[0];
  const valueKeys = data.headers.slice(1);
  const colors = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis 
          dataKey={firstDataKey} 
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
        />
        <Tooltip content={<CustomTooltip theme={theme} />} />
        <Legend />
        {valueKeys.map((key, index) => (
          <Bar 
            key={key} 
            dataKey={key} 
            fill={colors[index % colors.length]}
            radius={[2, 2, 0, 0]}
            animationDuration={1000}
            animationDelay={index * 100}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * Enhanced Line Chart with smooth curves and area fill
 */
function EnhancedLineChart({ data, theme }: { data: TabularData; theme?: string }) {
  const chartData = data.data;
  const firstDataKey = data.headers[0];
  const valueKeys = data.headers.slice(1);
  const colors = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis 
          dataKey={firstDataKey}
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
        />
        <Tooltip content={<CustomTooltip theme={theme} />} />
        <Legend />
        {valueKeys.map((key, index) => (
          <Line 
            key={key} 
            type="monotone" 
            dataKey={key} 
            stroke={colors[index % colors.length]}
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6, stroke: colors[index % colors.length], strokeWidth: 2 }}
            animationDuration={1500}
            animationDelay={index * 150}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

/**
 * Enhanced Area Chart for trend visualization
 */
function EnhancedAreaChart({ data, theme }: { data: TabularData; theme?: string }) {
  const chartData = data.data;
  const firstDataKey = data.headers[0];
  const valueKeys = data.headers.slice(1);
  const colors = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <defs>
          {valueKeys.map((key, index) => (
            <linearGradient key={key} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.1}/>
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis 
          dataKey={firstDataKey}
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
        />
        <Tooltip content={<CustomTooltip theme={theme} />} />
        <Legend />
        {valueKeys.map((key, index) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[index % colors.length]}
            fillOpacity={1}
            fill={`url(#gradient-${index})`}
            strokeWidth={2}
            animationDuration={1500}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

/**
 * Enhanced Pie Chart with custom labels and hover effects
 */
function EnhancedPieChart({ data, theme }: { data: TabularData; theme?: string }) {
  const chartData = data.data;
  const nameKey = data.headers[0];
  const valueKey = data.headers[1];
  const colors = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;

  // Transform data for pie chart
  const pieData = chartData.map((item, index) => ({
    name: item[nameKey],
    value: Number(item[valueKey]) || 0,
    fill: colors[index % colors.length]
  }));

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill={theme === 'dark' ? 'white' : 'black'} 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight={500}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
          animationBegin={0}
          animationDuration={1000}
        >
          {pieData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.fill}
              stroke={theme === 'dark' ? '#374151' : '#f3f4f6'}
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip theme={theme} />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

/**
 * Enhanced Scatter Plot for correlation analysis
 */
function EnhancedScatterChart({ data, theme }: { data: TabularData; theme?: string }) {
  const chartData = data.data;
  const xKey = data.headers[0];
  const yKey = data.headers[1];
  const colors = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis 
          dataKey={xKey}
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
        />
        <YAxis 
          dataKey={yKey}
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
        />
        <Tooltip content={<CustomTooltip theme={theme} />} />
        <Scatter 
          dataKey={yKey} 
          fill={colors[0]} 
          stroke={colors[0]}
          strokeWidth={2}
          r={6}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

/**
 * Enhanced Table with sorting and styling
 */
function EnhancedTable({ data, theme }: { data: TabularData; theme?: string }) {
  const [sortConfig, setSortConfig] = React.useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data.data;
    
    return [...data.data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data.data, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => {
      if (prevConfig?.key === key && prevConfig.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const tableStyles = theme === 'dark' 
    ? 'bg-gray-900 text-white' 
    : 'bg-white text-gray-900';
  const headerStyles = theme === 'dark' 
    ? 'bg-gray-800 text-gray-300' 
    : 'bg-gray-50 text-gray-500';
  const borderStyles = theme === 'dark' 
    ? 'border-gray-700' 
    : 'border-gray-200';

  return (
    <div className="overflow-x-auto rounded-lg border" style={{ maxHeight: '400px' }}>
      <table className={clsx('min-w-full divide-y', tableStyles, borderStyles)}>
        <thead className={clsx('sticky top-0', headerStyles)}>
          <tr>
            {data.headers.map((header) => (
              <th
                key={header}
                onClick={() => handleSort(header)}
                className={clsx(
                  'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:opacity-75 select-none',
                  sortConfig?.key === header && 'font-bold'
                )}
              >
                {header}
                {sortConfig?.key === header && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={clsx('divide-y', borderStyles)}>
          {sortedData.map((row, index) => (
            <tr 
              key={index} 
              className={clsx(
                'hover:opacity-75 transition-opacity',
                theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
              )}
            >
              {data.headers.map((header) => (
                <td
                  key={header}
                  className="px-6 py-4 whitespace-nowrap text-sm"
                >
                  {typeof row[header] === 'number' 
                    ? row[header].toLocaleString() 
                    : String(row[header] ?? '')
                  }
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
 * Chart type selector with icons
 */
function ChartTypeSelector({ 
  currentType, 
  onTypeChange, 
  theme 
}: { 
  currentType: string; 
  onTypeChange: (type: string) => void;
  theme?: string;
}) {
  const types = [
    { id: 'bar', name: 'Bar Chart', icon: BarChart3 },
    { id: 'line', name: 'Line Chart', icon: LineChartIcon },
    { id: 'area', name: 'Area Chart', icon: TrendingUp },
    { id: 'pie', name: 'Pie Chart', icon: PieChartIcon },
    { id: 'scatter', name: 'Scatter Plot', icon: Scatter3D },
    { id: 'table', name: 'Table', icon: null },
  ];

  const buttonStyles = theme === 'dark'
    ? 'bg-gray-700 hover:bg-gray-600 text-white'
    : 'bg-gray-100 hover:bg-gray-200 text-gray-700';

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {types.map((type) => {
        const Icon = type.icon;
        const isActive = currentType.toLowerCase() === type.id;
        
        return (
          <button
            key={type.id}
            onClick={() => onTypeChange(type.id)}
            className={clsx(
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isActive 
                ? 'bg-blue-500 text-white' 
                : buttonStyles
            )}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {type.name}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Main enhanced tabular data visualization component
 */
export function EnhancedTabularDataVisualization({ 
  data, 
  className, 
  theme = 'light' 
}: TabularDataVisualizationProps) {
  const [visualizationType, setVisualizationType] = React.useState(
    data.visualization_type || 'table'
  );

  if (!data.data || data.data.length === 0) {
    const emptyStyles = theme === 'dark' 
      ? 'bg-gray-800 text-gray-400 border-gray-700'
      : 'bg-gray-50 text-gray-500 border-gray-200';
      
    return (
      <div className={clsx('p-4 border rounded-lg', emptyStyles, className)}>
        <p className="text-sm">No data to display</p>
      </div>
    );
  }

  const renderVisualization = () => {
    switch (visualizationType.toLowerCase()) {
      case 'bar':
      case 'bar_chart':
        return <EnhancedBarChart data={data} theme={theme} />;
      case 'line':
      case 'line_chart':
        return <EnhancedLineChart data={data} theme={theme} />;
      case 'area':
      case 'area_chart':
        return <EnhancedAreaChart data={data} theme={theme} />;
      case 'pie':
      case 'pie_chart':
        return <EnhancedPieChart data={data} theme={theme} />;
      case 'scatter':
      case 'scatter_plot':
        return <EnhancedScatterChart data={data} theme={theme} />;
      case 'table':
      default:
        return <EnhancedTable data={data} theme={theme} />;
    }
  };

  const containerStyles = theme === 'dark'
    ? 'bg-gray-900 border-gray-700'
    : 'bg-white border-gray-200';

  return (
    <div className={clsx('my-4 p-6 border rounded-lg shadow-sm', containerStyles, className)}>
      {data.title && (
        <h4 className="text-xl font-bold mb-4 text-center">{data.title}</h4>
      )}
      
      <ChartTypeSelector 
        currentType={visualizationType}
        onTypeChange={setVisualizationType}
        theme={theme}
      />
      
      {renderVisualization()}
      
      <div className={clsx(
        'text-xs mt-4 text-center',
        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
      )}>
        Visualization: {visualizationType} • {data.data.length} rows • Enhanced with Recharts
      </div>
    </div>
  );
}