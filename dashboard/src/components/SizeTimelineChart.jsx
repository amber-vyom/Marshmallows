import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// 1. Define the custom tooltip that appears on hover
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-800 text-white p-3 rounded-lg shadow-lg border border-slate-700 text-sm">
        <p className="font-semibold text-blue-400 mb-1">{data.date}</p>
        <p>Size: <span className="font-bold">{data.sizeMB} MB</span></p>
        <p className="text-slate-400 text-xs mt-1">Commit: {data.commitSha}</p>
      </div>
    );
  }
  return null;
};

// 2. Define the main chart component
export default function SizeTimelineChart({ data, onPointClick }) {

  // This captures the click on a chart point and passes it up to App.jsx
  const handleChartClick = (state) => {
    if (state && state.activePayload) {
      const clickedData = state.activePayload[0].payload;
      if (onPointClick) {
        onPointClick(clickedData);
      }
    }
  };

  return (
    <div className="w-full h-96 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-lg font-bold text-slate-700 mb-4">Image Size Over Time</h2>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          onClick={handleChartClick}
          className="cursor-pointer"
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#cbd5e1' }}
          />
          <YAxis
            unit=" MB"
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '5 5' }}
          />
          <Line
            type="monotone"
            dataKey="sizeMB"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#ffffff' }}
            activeDot={{ r: 6, fill: '#1d4ed8', stroke: '#ffffff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}