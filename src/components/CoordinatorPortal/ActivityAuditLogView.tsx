import React from 'react';
import { AdminActivityLog } from '../../types';
import { History, Shield, Clock } from 'lucide-react';

interface ActivityAuditLogViewProps {
  logs: AdminActivityLog[];
}

export const ActivityAuditLogView: React.FC<ActivityAuditLogViewProps> = ({ logs }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Coordinator Activity Audit Log
          </h3>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          {logs.length} logged events
        </span>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3.5 whitespace-nowrap">Timestamp</th>
              <th className="py-2.5 px-3.5 whitespace-nowrap">Action</th>
              <th className="py-2.5 px-3.5 whitespace-nowrap">Record</th>
              <th className="py-2.5 px-3.5">Details & Rationale</th>
              <th className="py-2.5 px-3.5 whitespace-nowrap">Performed By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No activity log entries yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3.5 whitespace-nowrap font-mono text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </td>

                  <td className="py-2.5 px-3.5 whitespace-nowrap">
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-2.5 px-3.5 whitespace-nowrap font-mono text-[11px] text-slate-600">
                    {log.recordId}
                  </td>

                  <td className="py-2.5 px-3.5 text-[11px] text-slate-700 leading-relaxed max-w-md">
                    {log.details}
                  </td>

                  <td className="py-2.5 px-3.5 whitespace-nowrap font-medium text-[11px] text-slate-600">
                    <span className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-slate-400" />
                      <span>{log.performedBy}</span>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
