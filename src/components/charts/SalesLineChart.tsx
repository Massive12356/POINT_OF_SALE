import { useState } from 'react';
import { TrendingUp, DollarSign } from 'lucide-react';

interface SalesDataPoint {
  time: string;
  total: number;
}

interface SalesLineChartProps {
  data: SalesDataPoint[];
  title?: string;
}

/**
 * Sales Line Chart Component
 * Displays a line chart of sales over time using SVG
 */
export function SalesLineChart({ data, title = "Today's Sales" }: SalesLineChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Calculate total sales
  const totalSales = data.reduce((sum, point) => sum + point.total, 0);

  // Chart dimensions
  const width = 600;
  const height = 300;
  const padding = { top: 20, right: 30, bottom: 50, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Get max value for Y scale
  const maxValue = Math.max(...data.map(d => d.total), 100);
  const yScale = chartHeight / maxValue;

  // Generate path for the line
  const generatePath = () => {
    if (data.length === 0) return '';
    
    const xStep = chartWidth / (data.length - 1);
    
    return data.map((point, index) => {
      const x = padding.left + index * xStep;
      const y = padding.top + chartHeight - (point.total * yScale);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  // Generate area path (for gradient fill)
  const generateAreaPath = () => {
    if (data.length === 0) return '';
    
    const xStep = chartWidth / (data.length - 1);
    const linePath = data.map((point, index) => {
      const x = padding.left + index * xStep;
      const y = padding.top + chartHeight - (point.total * yScale);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    return `${linePath} L ${padding.left + chartWidth} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`;
  };

  // Y-axis labels
  const yLabels = [0, maxValue * 0.25, maxValue * 0.5, maxValue * 0.75, maxValue].map(v => 
    Math.round(v)
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">Sales throughout the day</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total Sales</p>
          <p className="text-2xl font-bold text-blue-600 flex items-center">
            <DollarSign className="h-6 w-6" />
            {totalSales.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[500px]"
          style={{ maxWidth: '100%' }}
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id="salesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yLabels.map((label, index) => {
            const y = padding.top + chartHeight - (label * yScale);
            return (
              <g key={index}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartWidth}
                  y2={y}
                  stroke="#E5E7EB"
                  strokeDasharray="4,4"
                />
              </g>
            );
          })}

          {/* Area fill */}
          <path
            d={generateAreaPath()}
            fill="url(#salesGradient)"
          />

          {/* Line */}
          <path
            d={generatePath()}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {data.map((point, index) => {
            const xStep = chartWidth / (data.length - 1);
            const x = padding.left + index * xStep;
            const y = padding.top + chartHeight - (point.total * yScale);
            const isHovered = hoveredPoint === index;

            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 8 : 5}
                  fill="#3B82F6"
                  stroke="white"
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredPoint(index)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                
                {/* Tooltip */}
                {isHovered && (
                  <g>
                    <rect
                      x={x - 50}
                      y={y - 45}
                      width="100"
                      height="35"
                      fill="#1F2937"
                      rx="6"
                    />
                    <text
                      x={x}
                      y={y - 28}
                      textAnchor="middle"
                      fill="white"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      ${point.total.toFixed(2)}
                    </text>
                    <text
                      x={x}
                      y={y - 15}
                      textAnchor="middle"
                      fill="#9CA3AF"
                      fontSize="10"
                    >
                      {point.time}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Y-axis labels */}
          {yLabels.map((label, index) => {
            const y = padding.top + chartHeight - (label * yScale);
            return (
              <text
                key={index}
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                fill="#6B7280"
                fontSize="11"
              >
                ${label}
              </text>
            );
          })}

          {/* X-axis labels */}
          {data.map((point, index) => {
            const xStep = chartWidth / (data.length - 1);
            const x = padding.left + index * xStep;
            const showLabel = index % Math.ceil(data.length / 8) === 0 || index === data.length - 1;
            
            if (!showLabel) return null;
            
            return (
              <text
                key={index}
                x={x}
                y={height - 15}
                textAnchor="middle"
                fill="#6B7280"
                fontSize="11"
              >
                {point.time}
              </text>
            );
          })}

          {/* Axes */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + chartHeight}
            stroke="#D1D5DB"
            strokeWidth="1"
          />
          <line
            x1={padding.left}
            y1={padding.top + chartHeight}
            x2={padding.left + chartWidth}
            y2={padding.top + chartHeight}
            stroke="#D1D5DB"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center mt-4 space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-gray-600">Sales Amount</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-200 rounded-full"></div>
          <span className="text-gray-600">Trend Area</span>
        </div>
      </div>
    </div>
  );
}
