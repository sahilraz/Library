import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Building2,
  Armchair,
  Clock,
  Phone,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Calendar,
  CreditCard,
  UserCheck,
} from 'lucide-react';
import { api } from '../../api/client.js';
import { Header } from '../../components/common/Header.js';
import { SkeletonLoader } from '../../components/reactbits/SkeletonLoader.js';
import { SEO } from '../../components/common/SEO.js';

export const UsersList: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 20 });

  const fetchUsers = async (currentPage = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', String(currentPage));
      params.append('limit', '20');
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get<{ success: boolean; users: any[]; pagination: any }>(
        `/superadmin/users?${params.toString()}`
      );
      if (res.success) {
        setUsers(res.users || []);
        setPagination(res.pagination || { total: 0, pages: 1, limit: 20 });
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchUsers(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(1);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <SEO
        title="All Enrolled Students - Super Admin"
        description="Search and inspect student enrollments, desk allocations, and subscriptions across all libraries."
      />
      <Header
        title="Students & Patrons"
        subtitle={`Total ${pagination.total} Enrolled Members`}
        showBack
      />

      <div className="max-w-7xl mx-auto w-full p-4 flex flex-col gap-4">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, phone, aadhar..."
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
              <option value="ACTIVE">Active Membership</option>
              <option value="EXPIRED">Expired</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
            <button
              onClick={() => fetchUsers(page)}
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
        ) : users.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
            <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Students Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No students or members matched your search query or filter criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {users.map((u) => {
              const now = new Date();
              const expiry = u.planEndDate ? new Date(u.planEndDate) : null;
              let daysRemaining = 0;
              let isExpired = false;
              let isExpiringSoon = false;

              if (expiry) {
                const diffMs = expiry.getTime() - now.getTime();
                daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                if (daysRemaining <= 0 || u.entryStatus === 'EXPIRED') {
                  isExpired = true;
                } else if (daysRemaining <= 5) {
                  isExpiringSoon = true;
                }
              }

              return (
                <div
                  key={u._id}
                  className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Photo & Status */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-3 min-w-0">
                        {u.photo ? (
                          <img
                            src={u.photo}
                            alt={u.name}
                            className="w-11 h-11 rounded-2xl object-cover border border-slate-100 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 truncate">{u.name}</h4>
                          <span className="text-[11px] text-slate-500 font-medium truncate block">
                            {u.adminId?.organizationName || u.adminId?.name || 'Library'}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0 ${
                          isExpired
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : isExpiringSoon
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isExpired ? 'Expired' : isExpiringSoon ? `${daysRemaining}d left` : 'Active'}
                      </span>
                    </div>

                    {/* Metadata & Allocations */}
                    <div className="space-y-1.5 my-3 text-xs text-slate-600">
                      <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                        <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                        <span className="truncate">{u.branchId?.name || 'Main Branch'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                        <Phone className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                        <span>{u.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                        <CreditCard className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                        <span className="truncate">Plan: {u.currentPlan?.name || 'Standard'}</span>
                      </div>
                    </div>

                    {/* Badges: Seat & Batch */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 px-2.5 py-1.5 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 text-[10px] font-medium flex items-center gap-1">
                          <Armchair className="w-3 h-3 text-blue-600" /> Seat
                        </span>
                        <strong className="text-slate-900 font-bold">
                          {u.currentSeat?.seatNumber ? `#${u.currentSeat.seatNumber}` : 'Unassigned'}
                        </strong>
                      </div>
                      <div className="flex-1 px-2.5 py-1.5 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 text-[10px] font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-purple-600" /> Batch
                        </span>
                        <strong className="text-slate-900 font-bold truncate max-w-[90px]">
                          {u.batchId?.name || 'Regular'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Expiry & Full Detail Action */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {u.planEndDate
                        ? `Expires: ${new Date(u.planEndDate).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}`
                        : 'No Expiry'}
                    </span>
                    <button
                      onClick={() => navigate(`/superadmin/users/${u._id}`)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-all flex items-center gap-1 active:scale-95"
                    >
                      <span>Full Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
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
                  fetchUsers(p);
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
                  fetchUsers(p);
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

