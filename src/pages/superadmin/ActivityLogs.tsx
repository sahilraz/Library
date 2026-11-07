import React, { useEffect, useState } from 'react';
import {
  Activity,
  Filter,
  Search,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Code,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { api } from '../../api/client.js';
import { Header } from '../../components/common/Header.js';
import { SkeletonLoader } from '../../components/reactbits/SkeletonLoader.js';
import { SEO } from '../../components/common/SEO.js';
import { humanizeActivity } from '../../utils/activityFormatter.js';

export const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionCategory, setActionCategory] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 30 });

  const fetchLogs = async (currentPage = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', String(currentPage));
      params.append('limit', '30');

      const res = await api.get<{ success: boolean; logs: any[]; pagination: any }>(
        `/superadmin/activity?${params.toString()}`
      );
      if (res.success) {
        setLogs(res.logs || []);
        setPagination(res.pagination || { total: 0, pages: 1, limit: 30 });
      }
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  // Client-side filtering for human-friendly categories & search
  const filteredLogs = logs.filter((log) => {
    const formatted = humanizeActivity(log);

    if (actionCategory && formatted.category !== actionCategory) {
      return false;
    }

    if (roleFilter && log.actorRole !== roleFilter) {
      return false;
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchTitle = formatted.title.toLowerCase().includes(q);
      const matchDesc = formatted.description.toLowerCase().includes(q);
      const matchActor = (log.actorName || '').toLowerCase().includes(q);
      const matchTarget = (log.target || '').toLowerCase().includes(q);
      return matchTitle || matchDesc || matchActor || matchTarget;
    }

    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen pb-12">
      <SEO
        title="Platform Activity Trail - Super Admin"
        description="Human-friendly security audit log and operational history across the entire SaaS platform."
      />
      <Header
        title="Platform Activity"
        subtitle="Human-Friendly Operational Trail & Security Log"
        showBack
      />

      <div className="max-w-5xl mx-auto w-full p-4 flex flex-col gap-4">
        {/* Filter & Search Bar */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, action description, administrator..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 shadow-xs focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-50 border border-slate-200">
              <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <select
                value={actionCategory}
                onChange={(e) => setActionCategory(e.target.value)}
                className="w-full bg-transparent text-slate-700 font-semibold text-xs border-none"
              >
                <option value="">All Activity Types</option>
                <option value="STUDENT">Student Operations (Enroll/Edit)</option>
                <option value="SEAT">Desk & Seat Allocations</option>
                <option value="BATCH">Batch Timing Changes</option>
                <option value="SUBSCRIPTION">Renewals & Extensions</option>
                <option value="PAYMENT">Fee & SaaS Payments</option>
                <option value="WHATSAPP">WhatsApp Notices</option>
                <option value="AUTH">Logins & Security</option>
                <option value="SETTINGS">Platform & Branch Config</option>
              </select>
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-50 border border-slate-200">
              <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full bg-transparent text-slate-700 font-semibold text-xs border-none"
              >
                <option value="">All Actors & Roles</option>
                <option value="SUPER_ADMIN">Platform Owner</option>
                <option value="ADMIN">Library Admin</option>
                <option value="MANAGER">Branch Manager</option>
                <option value="USER">Student / User</option>
              </select>
            </div>

            <button
              onClick={() => {
                setSearch('');
                setActionCategory('');
                setRoleFilter('');
                fetchLogs(1);
              }}
              className="px-3 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Activity Feed */}
        {loading ? (
          <div className="flex flex-col gap-2.5">
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
            <Activity className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">No Activity Matches Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your filter settings or search terms to inspect more events.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredLogs.map((log) => {
              const item = humanizeActivity(log);
              const isExpanded = expandedLogId === log._id;

              return (
                <div
                  key={log._id}
                  className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-sm hover:border-slate-300 transition-all flex flex-col gap-2"
                >
                  {/* Top Bar: Icon, Title, and Relative Time */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`p-2.5 rounded-2xl flex-shrink-0 ${item.badgeColor} mt-0.5`}>
                        <Activity className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-bold text-slate-800 block">
                        {item.relativeTime}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {item.formattedDate}
                      </span>
                    </div>
                  </div>

                  {/* Changes Diff Tags */}
                  {item.changes && item.changes.length > 0 && (
                    <div className="ml-11 flex flex-wrap gap-1.5 pt-1">
                      {item.changes.map((c, i) => (
                        <div
                          key={i}
                          className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-700 flex items-center gap-1.5"
                        >
                          <span className="text-slate-400">{c.label}:</span>
                          {c.from ? (
                            <span className="font-bold text-slate-900">
                              <span className="line-through text-slate-400">{c.from}</span> →{' '}
                              <span className="text-blue-600">{c.to}</span>
                            </span>
                          ) : (
                            <strong className="text-slate-900 font-bold">{c.value}</strong>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actor & Auditing Strip */}
                  <div className="ml-11 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <span>
                        Performed by: <strong className="text-slate-700">{log.actorName}</strong> ({log.actorRole.replace(/_/g, ' ')})
                      </span>
                    </div>

                    {/* Developer/Auditor Collapsible Raw Inspector */}
                    <button
                      onClick={() => setExpandedLogId(isExpanded ? null : log._id)}
                      className="text-slate-400 hover:text-slate-700 font-semibold flex items-center gap-1 transition-colors"
                      title="Inspect technical audit metadata"
                    >
                      <Code className="w-3 h-3" />
                      <span>{isExpanded ? 'Hide Raw Audit' : 'Audit Data'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  {/* Collapsible Technical Metadata */}
                  {isExpanded && (
                    <div className="ml-11 mt-2 p-3 rounded-2xl bg-slate-900 text-slate-200 text-[10px] font-mono overflow-x-auto shadow-inner">
                      <div className="flex items-center justify-between mb-1 pb-1 border-b border-white/10 text-slate-400">
                        <span>Event: {log.action}</span>
                        <span>IP: {log.ip || 'Local / API'}</span>
                      </div>
                      <pre className="whitespace-pre-wrap break-all">
                        {JSON.stringify(
                          {
                            logId: log._id,
                            target: log.target,
                            targetId: log.targetId,
                            userAgent: log.userAgent,
                            metadata: log.metadata,
                          },
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between pt-2 px-2">
            <span className="text-xs text-slate-500 font-medium">
              Page {pagination.page} of {pagination.pages} ({pagination.total} records)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => {
                  const p = Math.max(1, page - 1);
                  setPage(p);
                }}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= pagination.pages}
                onClick={() => {
                  const p = Math.min(pagination.pages, page + 1);
                  setPage(p);
                }}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
