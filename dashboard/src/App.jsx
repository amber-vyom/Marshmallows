import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Box, AlertTriangle, GitCommit, User, ShieldCheck, HardDrive } from 'lucide-react';
import { fetchBuildHistory } from './api';
import HistoryTable from './components/HistoryTable';

export default function App() {
  const [builds, setBuilds] = useState([]);
  const [selectedBuild, setSelectedBuild] = useState(null);

  // Fetch data dynamically on load
  useEffect(() => {
    fetchBuildHistory().then(data => {
      setBuilds(data);
      if (data.length > 0) {
        // Find the build with a spike, or default to the last build
        const spikeBuild = data.find(b => b.has_spike);
        setSelectedBuild(spikeBuild || data[data.length - 1]);
      }
    });
  }, []);

  // Show a loading state while fetching
  if (!selectedBuild) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <Box className="w-8 h-8 text-blue-500 animate-spin mr-3" />
        Loading Docktrace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col gap-6 font-sans">

      {/* Header */}
      <header className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Box className="w-8 h-8 text-blue-500" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Docktrace</h1>
          <span className="bg-blue-950 text-blue-400 text-xs px-2.5 py-1 rounded-full border border-blue-800 font-mono">
            v1.0.0
          </span>
        </div>
        <div className="text-sm text-slate-400">
          Tracking Repository: <span className="text-slate-200 font-mono">Marshmallows/Docktrace</span>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Section: Visual Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Image Size Over Time</h2>
              <p className="text-sm text-slate-400">Click any data point on the line to inspect commit attribution</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <HardDrive className="w-4 h-4 text-blue-400" />
              <span>Unit: Megabytes (MB)</span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={builds}
                onClick={(e) => e && e.activePayload && setSelectedBuild(e.activePayload[0].payload)}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="timestamp" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc' }}
                />
                <Line
                  type="monotone"
                  dataKey="size_mb"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  activeDot={{ r: 8, onClick: (_, payload) => setSelectedBuild(payload.payload) }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Section: Inspector Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                Inspector Panel
              </h2>
              {selectedBuild.has_spike ? (
                <span className="flex items-center gap-1 bg-red-950 text-red-400 border border-red-800 text-xs px-2.5 py-1 rounded-md font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" /> Size Spike
                </span>
              ) : (
                <span className="flex items-center gap-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs px-2.5 py-1 rounded-md font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> Normal Build
                </span>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-sm">
                <div className="text-xs text-slate-500 uppercase mb-1">Docker Image Size</div>
                <div className="text-3xl font-bold text-blue-400">{selectedBuild.size_mb} MB</div>
              </div>

              <div className="flex flex-col gap-2.5 text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <GitCommit className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-400">Commit:</span>
                  <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-xs">{selectedBuild.commit_sha}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-400">Author:</span>
                  <span className="font-medium text-white">{selectedBuild.author}</span>
                </div>
              </div>

              <div className="mt-2">
                <span className="text-xs text-slate-400 uppercase tracking-wider">Commit Message</span>
                <p className="text-sm text-slate-200 mt-1 bg-slate-950 p-3 rounded-lg border border-slate-800">
                  "{selectedBuild.message}"
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider">Root Cause Analysis</span>
                <p className={`text-sm mt-1 p-3 rounded-lg border ${selectedBuild.has_spike ? 'bg-red-950/40 border-red-900/60 text-red-200' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                  {selectedBuild.diff_summary}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Embedded History Table */}
      <HistoryTable builds={builds} />

    </div>
  );
}