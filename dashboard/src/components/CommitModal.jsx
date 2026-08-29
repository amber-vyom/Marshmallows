import React from 'react';
import { X, GitCommit, User, AlertTriangle, FileText, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function CommitModal({ build, onClose }) {
  if (!build) return null;

  // Calculate or fallback delta display
  const delta = build.size_delta || (build.has_spike ? "+340 MB" : "+2 MB");
  const modifiedFiles = build.modified_files || ['package.json', 'Dockerfile', 'src/server.ts'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">

      {/* Modal Container */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col font-sans relative">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-violet-400" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Commit Deep Dive</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-sm">

          {/* Top Metrics Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black p-3.5 rounded-lg border border-zinc-800/80">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Image Size</span>
              <p className="text-2xl font-light text-white font-mono mt-1">{build.size_mb} MB</p>
            </div>

            <div className="bg-black p-3.5 rounded-lg border border-zinc-800/80">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Size Delta</span>
              <p className={`text-2xl font-light font-mono mt-1 flex items-center gap-1 ${build.has_spike ? 'text-red-400' : 'text-emerald-400'}`}>
                <ArrowUpRight className="w-5 h-5" /> {delta}
              </p>
            </div>
          </div>

          {/* Metadata List */}
          <div className="space-y-3 bg-zinc-900/40 p-4 rounded-lg border border-zinc-800/60 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-zinc-800/60 pb-2">
              <span className="text-zinc-500 flex items-center gap-2">
                <GitCommit className="w-3.5 h-3.5 text-zinc-400" /> Commit SHA
              </span>
              <span className="text-violet-400 font-semibold">{build.commit_sha}</span>
            </div>

            <div className="flex justify-between items-center border-b border-zinc-800/60 pb-2">
              <span className="text-zinc-500 flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-zinc-400" /> Author
              </span>
              <span className="text-zinc-200">{build.author}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Status</span>
              {build.has_spike ? (
                <span className="text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Regression Detected
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Nominal
                </span>
              )}
            </div>
          </div>

          {/* Commit Message */}
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Commit Message</span>
            <p className="text-zinc-300 mt-1.5 bg-black p-3 rounded-lg border border-zinc-800 font-mono text-xs">
              {build.message}
            </p>
          </div>

          {/* Modified Files Section */}
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Modified Files</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {modifiedFiles.map((file, idx) => (
                <span key={idx} className="flex items-center gap-1.5 bg-zinc-900 text-zinc-300 text-xs font-mono px-2.5 py-1 rounded border border-zinc-800">
                  <FileText className="w-3 h-3 text-violet-400" /> {file}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-zinc-800 px-6 py-3 bg-zinc-900/30 flex justify-end">
          <button
            onClick={onClose}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono px-4 py-2 rounded-md transition-colors"
          >
            Close Panel
          </button>
        </div>

      </div>
    </div>
  );
}