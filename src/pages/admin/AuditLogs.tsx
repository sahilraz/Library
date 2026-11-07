import React, { useEffect, useState } from 'react';
import {
  Activity,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Code,
  Calendar,
} from 'lucide-react';
import { api } from '../../api/client.js';
import { Header } from '../../components/common/Header.js';
import { SkeletonLoader } from '../../components/reactbits/SkeletonLoader.js';
import { SEO } from '../../components/common/SEO.js';
import { humanizeActivity } from '../../utils/activityFormatter.js';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .get<{ success: boolean; logs: any[] }>('/admin/audit')
      .then((res) => {
        if (res.success) setLogs(res.logs || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs = logs.filter((log) => {
    const formatted = humanizeActivity(log);
    if (categoryFilter && formatted.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchTitle = formatted.title.toLowerCase().includes(q);
      const matchDesc = formatted.description.toLowerCase().includes(q);
      const matchActor = (log.actorName || '').toLowerCase().includes(q);
      return matchTitle || matchDesc || matchActor;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen pb-12">
      <SEO
        title="Library Audit Trail"
        description="Comprehensive activity and operation timeline of your library organization."
      />
      <Header title="Library Activity Trail" subtitle="Complete Operational History" showBack />

      <div className="max-w-4xl mx-auto w-full p-4 flex flex-col gap-4">
        {/* Search & Filter */}
        <div className="p-3.5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search actions, students, changes..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-2xl bg-slate-50 border border-slate-200 font-semibold text-slate-700 w-full sm:w-auto"
            >
              <option value="">All Categories</option>
              <option value="STUDENT">Student Operations</option>
              <option value="SEAT">Seat Allocations</option>
              <option value="BATCH">Batch Shifts</option>
              <option value="SUBSCRIPTION">Renewals & Plans</option>
              <option value="PAYMENT">Payments</option>
              <option value="WHATSAPP">WhatsApp Notices</option>
              <option value="AUTH">Logins</option>
            </select>
          </div>
        </div>

        {/* Activity Feed */}
        {loading ? (
          <div className="flex flex-col gap-2.5">
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 mt-2">
            <Activity className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No Activity Records</h3>
            <p className="text-xs text-slate-400 mt-1">Actions performed in your library will appear here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filteredLogs.map((log) => {
              const item = humanizeActivity(log);
              const isExpanded = expandedLogId === log._id;

              return (
                <div
                  key={log._id}
                  className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col gap-1.5 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className={`p-2 rounded-xl flex-shrink-0 ${item.badgeColor} mt-0.5`}>
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-[11px] font-bold text-slate-700 block">
                        {item.relativeTime}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {item.formattedDate}
                      </span>
                    </div>
                  </div>

                  {/* Changes Diff Tags */}
                  {item.changes && item.changes.length > 0 && (
                    <div className="ml-9 flex flex-wrap gap-1.5 pt-1">
                      {item.changes.map((c, i) => (
                        <div
                          key={i}
                          className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-semibold text-slate-700 flex items-center gap-1"
                        >
                          <span className="text-slate-400">{c.label}:</span>
                          {c.from ? (
                            <span>
                              <span className="line-through text-slate-400">{c.from}</span> →{' '}
                              <strong className="text-blue-600">{c.to}</strong>
                            </span>
                          ) : (
                            <strong className="text-slate-900">{c.value}</strong>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actor Strip */}
                  <div className="ml-9 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>
                      Performed by: <strong className="text-slate-700">{log.actorName}</strong> ({log.actorRole})
                    </span>
                    <button
                      onClick={() => setExpandedLogId(isExpanded ? null : log._id)}
                      className="hover:text-slate-700 flex items-center gap-0.5"
                    >
                      <Code className="w-2.5 h-2.5" />
                      <span>{isExpanded ? 'Hide' : 'Details'}</span>
                      {isExpanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="ml-9 mt-1.5 p-2.5 rounded-xl bg-slate-900 text-slate-200 text-[10px] font-mono overflow-x-auto">
                      <pre className="whitespace-pre-wrap break-all">
                        {JSON.stringify(log.metadata || {}, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
