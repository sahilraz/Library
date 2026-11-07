import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  Building2,
  Users,
  Clock,
  Phone,
  Mail,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Activity,
  Calendar,
} from 'lucide-react';
import { api } from '../../api/client.js';
import { Header } from '../../components/common/Header.js';
import { SkeletonLoader } from '../../components/reactbits/SkeletonLoader.js';
import { SEO } from '../../components/common/SEO.js';
import { formatRelativeTime } from '../../utils/activityFormatter.js';

export const ManagersList: React.FC = () => {
  const navigate = useNavigate();
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 20 });

  const fetchManagers = async (currentPage = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', String(currentPage));
      params.append('limit', '20');
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get<{ success: boolean; managers: any[]; pagination: any }>(
        `/superadmin/managers?${params.toString()}`
      );
      if (res.success) {
        setManagers(res.managers || []);
        setPagination(res.pagination || { total: 0, pages: 1, limit: 20 });
      }
    } catch (err) {
      console.error('Failed to load managers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchManagers(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchManagers(1);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <SEO
        title="All Staff Managers - Super Admin"
        description="Inspect branch staff and operators, assigned duties, and activity across all libraries."
      />
      <Header
        title="Branch Staff & Managers"
        subtitle={`Total ${pagination.total} Branch Managers`}
        showBack
      />

      <div className="max-w-7xl mx-auto w-full p-4 flex flex-col gap-4">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by manager name, email, phone..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-white border border-slate-200 text-slate-900 shadow-sm focus:border-blue-500 transition-all"
            />
          </form>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 text-xs rounded-2xl bg-white border border-slate-200 font-semibold text-slate-700 shadow-sm"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active Staff</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
            <button
              onClick={() => fetchManagers(page)}
              className="px-3 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
          </div>
        ) : managers.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Managers Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No branch managers matched your search query or filter criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {managers.map((m) => (
              <div
                key={m._id}
                className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{m.name}</h4>
                        <span className="text-[11px] text-slate-500 font-medium truncate block">
                          Org: {m.adminId?.organizationName || m.adminId?.name || 'Library'}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        m.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {m.status || 'ACTIVE'}
                    </span>
                  </div>

                  <div className="space-y-1.5 my-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                      <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                      <span className="truncate">Branch: <strong>{m.branchId?.name || 'Unassigned'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                      <span className="truncate">{m.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                      <span>{m.phone}</span>
                    </div>
                  </div>

                  {/* Resource & Operational Stats */}
                  <div className="grid grid-cols-2 gap-2 py-2 px-3 rounded-2xl bg-slate-50 border border-slate-100 text-center mb-3">
                    <div>
                      <span className="block text-xs font-black text-slate-800">{m.studentsCount || 0}</span>
                      <span className="text-[9px] text-slate-400 font-semibold uppercase flex items-center justify-center gap-1">
                        <Users className="w-2.5 h-2.5 text-emerald-500" /> Students Managed
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-black text-slate-800">{m.totalActivities || 0}</span>
                      <span className="text-[9px] text-slate-400 font-semibold uppercase flex items-center justify-center gap-1">
                        <Activity className="w-2.5 h-2.5 text-blue-500" /> Total Actions
                      </span>
                    </div>
                  </div>

                  {m.lastActiveAt && (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Last Active: <strong>{formatRelativeTime(m.lastActiveAt)}</strong></span>
                    </div>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(m.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <button
                    onClick={() => navigate(`/superadmin/managers/${m._id}`)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 transition-all flex items-center gap-1 active:scale-95"
                  >
                    <span>Full Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between pt-2 px-2">
            <span className="text-xs text-slate-500 font-medium">
              Page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => {
                  const p = Math.max(1, page - 1);
                  setPage(p);
                  fetchManagers(p);
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
                  fetchManagers(p);
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

