import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Search,
  Users,
  Armchair,
  ShieldCheck,
  MapPin,
  Phone,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { api } from '../../api/client.js';
import { Header } from '../../components/common/Header.js';
import { SkeletonLoader } from '../../components/reactbits/SkeletonLoader.js';
import { SEO } from '../../components/common/SEO.js';

export const BranchesList: React.FC = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 20 });

  const fetchBranches = async (currentPage = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', String(currentPage));
      params.append('limit', '20');
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get<{ success: boolean; branches: any[]; pagination: any }>(
        `/superadmin/branches?${params.toString()}`
      );
      if (res.success) {
        setBranches(res.branches || []);
        setPagination(res.pagination || { total: 0, pages: 1, limit: 20 });
      }
    } catch (err) {
      console.error('Failed to load branches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchBranches(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBranches(1);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <SEO
        title="All Branches - Super Admin"
        description="Inspect physical branch centers, occupancy, and staff across all library organizations."
      />
      <Header
        title="Platform Branches"
        subtitle={`Total ${pagination.total} Physical Centers`}
        showBack
      />

      <div className="max-w-7xl mx-auto w-full p-4 flex flex-col gap-4">
        {/* Controls: Search & Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by branch name, address, phone..."
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
              <option value="ACTIVE">Active Centers</option>
              <option value="INACTIVE">Inactive Centers</option>
            </select>
            <button
              onClick={() => fetchBranches(page)}
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
        ) : branches.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Branches Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No physical centers matched your search query or filter criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {branches.map((b) => (
              <div
                key={b._id}
                className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 flex-shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{b.name}</h4>
                        <span className="text-[11px] text-slate-500 font-medium truncate block">
                          Org: {b.adminId?.organizationName || b.adminId?.name || 'Library'}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        b.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {b.status || 'ACTIVE'}
                    </span>
                  </div>

                  <div className="space-y-1.5 my-3 text-xs text-slate-600">
                    {b.address && (
                      <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                        <span className="truncate">{b.address}</span>
                      </div>
                    )}
                    {b.phone && (
                      <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                        <Phone className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                        <span>{b.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Resource Counters */}
                  <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <div>
                      <span className="block text-xs font-black text-slate-800">{b.seatsCount || 0}</span>
                      <span className="text-[9px] text-slate-400 font-semibold uppercase flex items-center justify-center gap-0.5">
                        <Armchair className="w-2.5 h-2.5 text-blue-500" /> Seats
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-black text-slate-800">{b.usersCount || 0}</span>
                      <span className="text-[9px] text-slate-400 font-semibold uppercase flex items-center justify-center gap-0.5">
                        <Users className="w-2.5 h-2.5 text-emerald-500" /> Students
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-black text-slate-800">{b.managersCount || 0}</span>
                      <span className="text-[9px] text-slate-400 font-semibold uppercase flex items-center justify-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5 text-indigo-500" /> Staff
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(b.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  {b.adminId?._id && (
                    <button
                      onClick={() => navigate(`/superadmin/admins/${b.adminId._id}`)}
                      className="text-blue-600 font-bold hover:underline flex items-center gap-0.5"
                    >
                      <span>Admin View</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
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
                  fetchBranches(p);
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
                  fetchBranches(p);
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

