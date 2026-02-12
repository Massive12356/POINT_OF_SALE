import { useState } from 'react';
import { BarChart3, Trophy } from 'lucide-react';

interface BestSellingItem {
  name: string;
  sold: number;
  revenue?: number;
}

interface BestSellingChartProps {
  data: BestSellingItem[];
  title?: string;
  maxItems?: number;
}

/**
 * Best Selling Items Bar Chart Component
 * Displays a horizontal bar chart of top-selling products using SVG
 */
export function BestSellingChart({ 
  data, 
  title = "Best-Selling Items",
  maxItems = 8 
}: BestSellingChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Sort by quantity sold and take top items
  const sortedData = [...data]
    .sort((a, b) => b.sold - a.sold)
    .slice(0, maxItems);

  // Find best seller
  const bestSeller = sortedData[0];

  // Chart dimensions
  const width = 500;
  const height = sortedData.length * 50 + 60;
  const padding = { top: 20, right: 80, bottom: 20, left: 150 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Get max value for scale
  const maxValue = Math.max(...sortedData.map(d => d.sold), 1);
  const barHeight = (chartHeight / sortedData.length) * 0.7;
  const barGap = (chartHeight / sortedData.length) * 0.3;

  // Generate bar color based on rank
  const getBarColor = (index: number) => {
    if (index === 0) return '#10B981'; // Green for #1
    if (index === 1) return '#3B82F6'; // Blue for #2
    if (index === 2) return '#F59E0B'; // Orange for #3
    return '#6B7280'; // Gray for others
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <BarChart3 className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">Top {maxItems} products by quantity sold</p>
          </div>
        </div>
        {bestSeller && (
          <div className="flex items-center space-x-2 bg-yellow-50 px-3 py-2 rounded-lg">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <div className="text-right">
              <p className="text-xs text-yellow-700">Top Seller</p>
              <p className="text-sm font-bold text-yellow-800 truncate max-w-[120px]">
                {bestSeller.name}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[400px]"
          style={{ maxWidth: '100%' }}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const x = padding.left + chartWidth * ratio;
            return (
              <line
                key={index}
                x1={x}
                y1={padding.top}
                x2={x}
                y2={height - padding.bottom}
                stroke="#E5E7EB"
                strokeDasharray="4,4"
              />
            );
          })}

          {/* Bars */}
          {sortedData.map((item, index) => {
            const y = padding.top + index * (barHeight + barGap);
            const barWidth = (item.sold / maxValue) * chartWidth;
            const isHovered = hoveredIndex === index;
            const color = getBarColor(index);

            return (
              <g key={index}>
                {/* Rank badge for top 3 */}
                {index < 3 && (
                  <circle
                    cx={padding.left - 130}
                    cy={y + barHeight / 2}
                    r="12"
                    fill={color}
                    opacity="0.2"
                  />
                )}
                {index < 3 && (
                  <text
                    x={padding.left - 130}
                    y={y + barHeight / 2 + 4}
                    textAnchor="middle"
                    fill={color}
                    fontSize="10"
                    fontWeight="bold"
                  >
                    #{index + 1}
                  </text>
                )}

                {/* Product name */}
                <text
                  x={padding.left - 10}
                  y={y + barHeight / 2 + 4}
                  textAnchor="end"
                  fill="#374151"
                  fontSize="12"
                  fontWeight={index < 3 ? '600' : '400'}
                  className="truncate"
                >
                  {item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name}
                </text>

                {/* Bar background */}
                <rect
                  x={padding.left}
                  y={y}
                  width={chartWidth}
                  height={barHeight}
                  fill="#F3F4F6"
                  rx="4"
                />

                {/* Bar */}
                <rect
                  x={padding.left}
                  y={y}
                  width={isHovered ? barWidth + 2 : barWidth}
                  height={barHeight}
                  fill={color}
                  rx="4"
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  opacity={isHovered ? 1 : 0.85}
                />

                {/* Value label */}
                <text
                  x={padding.left + barWidth + 8}
                  y={y + barHeight / 2 + 4}
                  fill="#374151"
                  fontSize="12"
                  fontWeight="600"
                >
                  {item.sold} sold
                </text>

                {/* Tooltip on hover */}
                {isHovered && (
                  <g>
                    <rect
                      x={padding.left + barWidth / 2 - 60}
                      y={y - 45}
                      width="120"
                      height="40"
                      fill="#1F2937"
                      rx="6"
                    />
                    <text
                      x={padding.left + barWidth / 2}
                      y={y - 28}
                      textAnchor="middle"
                      fill="white"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      {item.name}
                    </text>
                    <text
                      x={padding.left + barWidth / 2}
                      y={y - 15}
                      textAnchor="middle"
                      fill="#9CA3AF"
                      fontSize="10"
                    >
                      {item.sold} units sold
                      {item.revenue && ` • $${item.revenue.toFixed(2)}`}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* X-axis labels */}
          {[0, Math.round(maxValue / 2), maxValue].map((value, index) => {
            const x = padding.left + (value / maxValue) * chartWidth;
            return (
              <text
                key={index}
                x={x}
                y={height - 5}
                textAnchor="middle"
                fill="#6B7280"
                fontSize="11"
              >
                {value}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center mt-4 space-x-6 text-sm flex-wrap gap-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-emerald-500 rounded"></div>
          <span className="text-gray-600">#1 Best Seller</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-gray-600">#2 Top Seller</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-amber-500 rounded"></div>
          <span className="text-gray-600">#3 Top Seller</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-500 rounded"></div>
          <span className="text-gray-600">Others</span>
        </div>
      </div>
    </div>
  );
}
