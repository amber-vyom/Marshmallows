import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Box, AlertTriangle, GitCommit, User, ShieldCheck, HardDrive } from 'lucide-react';
import { fetchBuildHistory } from './api';
import HistoryTable from './components/HistoryTable';

export default function App() {
  const [builds, setBuilds] = useState([]);
  const [selectedBuild, setSelectedBuild] = useState(null);

  useEffect(() => {
    fetchBuildHistory().then(data => {
      setBuilds(data);
      if (data.length > 0) {
        const spikeBuild = data.find(b => b.has_spike);
        setSelectedBuild(spikeBuild || data[data.length - 1]);
      }
    });
  }, []);

  if (!selectedBuild) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-zinc-400 font-mono text-sm">
        <Box className="w-5 h-5 text-violet-500 animate-spin mr-3" />
        INITIALIZING_DOCKTRACE...
      </div>
    );
  }

  return (
    // Stark black background with a subtle engineering grid pattern
    <div className="min-h-screen bg-black text-zinc-100 p-8 flex flex-col gap-6 font-sans relative overflow-hidden">

      {/* Background Texture */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="bg-violet-500/10 p-1.5 rounded-md border border-violet-500/20">
            <Box className="w-6 h-6 text-violet-500" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">DOCKTRACE</h1>
          <span className="bg-zinc-900 text-zinc-400 text-[10px] px-2 py-0.5 rounded-sm border border-zinc-800 font-mono tracking-widest uppercase">
            v1.0.0
          </span>
        </div>
        <div className="text-xs text-zinc-500 uppercase tracking-widest">
          Target: <span className="text-zinc-300 font-mono lowercase">marshmallows/docktrace</span>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Section: Visual Area Chart */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800/60 rounded-xl p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-sm font-medium text-zinc-200 uppercase tracking-widest">Layer Size Telemetry</h2>
              <p className="text-xs text-zinc-500 mt-1">Select a telemetry node to inspect Git attribution</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono bg-black px-3 py-1.5 rounded border border-zinc-800 uppercase">
              <HardDrive className="w-3 h-3 text-violet-400" />
              <span>Unit: MB</span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={builds}
                onClick={(e) => e && e.activePayload && setSelectedBuild(e.activePayload[0].payload)}
              >
                <defs>
                  <linearGradient id="colorSize" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="timestamp" stroke="#52525b" tick={{ fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#52525b" tick={{ fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px' }}
                  itemStyle={{ color: '#8b5cf6' }}
                />
                <Area
                  type="monotone"
                  dataKey="size_mb"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSize)"
                  activeDot={{ r: 6, stroke: '#000', strokeWidth: 2, onClick: (_, payload) => setSelectedBuild(payload.payload) }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Section: Inspector Panel */}
        <div className="bg-zinc-950 border border-zinc-800/60 rounded-xl p-6 flex flex-col shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-5">
            <h2 className="text-sm font-medium text-zinc-200 uppercase tracking-widest">Attribution Inspector</h2>
            {selectedBuild.has_spike ? (
              <span className="flex items-center gap-1.5 bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] uppercase px-2 py-1 rounded font-mono">
                <AlertTriangle className="w-3 h-3" /> Bloat Warning
              </span>
            ) : (
              <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] uppercase px-2 py-1 rounded font-mono">
                <ShieldCheck className="w-3 h-3" /> Optimal
              </span>
            )}
          </div>

          <div className="flex flex-col gap-5 flex-grow">
            <div className="bg-black p-4 rounded-lg border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-mono">Current Image Size</div>
              <div className="text-3xl font-light text-white font-mono">{selectedBuild.size_mb} <span className="text-lg text-zinc-600">MB</span></div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-zinc-900 p-1.5 rounded border border-zinc-800"><GitCommit className="w-4 h-4 text-zinc-400" /></div>
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Commit SHA</div>
                  <div className="font-mono text-sm text-zinc-200">{selectedBuild.commit_sha}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-zinc-900 p-1.5 rounded border border-zinc-800"><User className="w-4 h-4 text-zinc-400" /></div>
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Author</div>
                  <div className="text-sm text-zinc-200">{selectedBuild.author}</div>
                </div>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Commit Message</span>
              <p className="text-sm text-zinc-300 mt-1.5 bg-zinc-900/50 p-3 rounded border border-zinc-800/50">
                {selectedBuild.message}
              </p>
            </div>

            <div className="mt-auto">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Automated Root Cause</span>
              <p className={`text-sm mt-1.5 p-3 rounded border font-mono leading-relaxed ${selectedBuild.has_spike ? 'bg-red-500/5 border-red-500/20 text-red-300' : 'bg-black border-zinc-800 text-zinc-400'}`}>
                {selectedBuild.diff_summary}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Embedded History Table - Ensure it has a relative z-index to sit above the grid */}
      <div className="relative z-10">
        <HistoryTable builds={builds} />
      </div>

    </div>
  );
}