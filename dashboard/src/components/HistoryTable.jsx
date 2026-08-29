import React from 'react';
import { GitCommit, AlertTriangle } from 'lucide-react';

export default function HistoryTable({ builds }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg mt-6">
      <h2 className="text-lg font-semibold text-white mb-4">Detailed Build Logs</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-3 rounded-tl-lg">Commit</th>
              <th className="p-3">Author</th>
              <th className="p-3">Size (MB)</th>
              <th className="p-3 rounded-tr-lg">Status</th>
            </tr>
          </thead>
          <tbody>
            {builds.map((build) => (
              <tr key={build.id} className="border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                <td className="p-3 font-mono flex items-center gap-2">
                  <GitCommit className="w-4 h-4 text-slate-500" />
                  {build.commit_sha}
                </td>
                <td className="p-3">{build.author}</td>
                <td className="p-3 font-medium text-blue-400">{build.size_mb} MB</td>
                <td className="p-3">
                  {build.has_spike ? (
                    <span className="flex items-center gap-1 text-red-400">
                      <AlertTriangle className="w-4 h-4" /> Bloat Detected
                    </span>
                  ) : (
                    <span className="text-emerald-400">Stable</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}