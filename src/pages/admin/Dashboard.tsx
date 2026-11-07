import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Armchair,
  Users,
  CreditCard,
  Send,
  AlertTriangle,
  Clock,
  ChevronRight,
  PlusCircle,
  Sparkles,
  Layers,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Filter,
  MessageSquare,
  Printer,
  RefreshCw,
  CheckCircle,
  Phone,
} from 'lucide-react';
import { api } from '../../api/client.js';
import { Header } from '../../components/common/Header.js';
import { SpotlightCard } from '../../components/reactbits/SpotlightCard.js';
import { AnimatedCounter } from '../../components/reactbits/AnimatedCounter.js';
import { SkeletonLoader } from '../../components/reactbits/SkeletonLoader.js';
import { SEO } from '../../components/common/SEO.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { BatchOccupancyModal } from '../../components/admin/BatchOccupancyModal.js';
import { StudentDetailModal } from '../../components/admin/StudentDetailModal.js';
import { IDCardModal } from '../../components/common/IDCardModal.js';
import { RenewPlanModal } from '../../components/admin/RenewPlanModal.js';
import { SendWhatsAppModal } from '../../components/admin/SendWhatsAppModal.js';
import { ImageUpload } from '../../components/common/ImageUpload.js';

const FILTER_OPTIONS = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'this_week', label: 'This Week' },
  { id: 'this_month', label: 'This Month' },
  { id: 'last_6_months', label: 'Last 6 Months' },
  { id: 'this_year', label: 'This Year' },
  { id: 'all_time', label: 'All Time' },
];

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('this_month');

  // Expiring Students State
  const [expiringStudents, setExpiringStudents] = useState<any[]>([]);
  const [loadingExpiring, setLoadingExpiring] = useState(true);

  // Interactive Linking Modals
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [idCardData, setIdCardData] = useState<any>(null);
  const [studentToRenew, setStudentToRenew] = useState<any>(null);
  const [studentToSendWhatsApp, setStudentToSendWhatsApp] = useState<any>(null);

  // Quick Action Modals for Expiring Students
  const [extendStudent, setExtendStudent] = useState<any | null>(null);
  const [extendDays, setExtendDays] = useState('7');
  const [isSubmittingExtend, setIsSubmittingExtend] = useState(false);

  const [changeSeatStudent, setChangeSeatStudent] = useState<any | null>(null);
  const [availableSeats, setAvailableSeats] = useState<any[]>([]);
  const [targetSeatId, setTargetSeatId] = useState('');
  const [isSubmittingSeat, setIsSubmittingSeat] = useState(false);

  const [changeBatchStudent, setChangeBatchStudent] = useState<any | null>(null);
  const [availableBatches, setAvailableBatches] = useState<any[]>([]);
  const [targetBatchId, setTargetBatchId] = useState('');
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);

  const [editStudent, setEditStudent] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    classCourse: '',
    address: '',
    parentName: '',
    parentPhone: '',
    photo: '',
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const fetchDashboardStats = (filterKey: string) => {
    setLoading(true);
    api
      .get<{ success: boolean; stats: any }>(`/admin/dashboard?filter=${filterKey}`)
      .then((res) => {
        if (res.success) setStats(res.stats);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchExpiringStudents = () => {
    setLoadingExpiring(true);
    api
      .get<{ success: boolean; expiringStudents: any[] }>('/admin/users/expiring')
      .then((res) => {
        if (res.success) setExpiringStudents(res.expiringStudents || []);
      })
      .catch((err) => console.error('Failed to load expiring students:', err))
      .finally(() => setLoadingExpiring(false));
  };

  useEffect(() => {
    fetchDashboardStats(selectedFilter);
    fetchExpiringStudents();
  }, [selectedFilter]);

  // Handlers for Expiring Student Actions
  const handleExtendExpiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extendStudent) return;
    try {
      setIsSubmittingExtend(true);
      const res = await api.patch<{ success: boolean; message: string }>(
        `/admin/users/${extendStudent._id}/extend-expiry`,
        { days: parseInt(extendDays, 10) }
      );
      if (res.success) {
        showToast(res.message, 'success');
        setExtendStudent(null);
        fetchExpiringStudents();
        fetchDashboardStats(selectedFilter);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to extend subscription', 'error');
    } finally {
      setIsSubmittingExtend(false);
    }
  };

  const handleOpenChangeSeat = async (student: any) => {
    try {
      const res = await api.get<{ success: boolean; seats: any[] }>('/admin/seats');
      if (res.success) {
        setAvailableSeats(res.seats || []);
        setTargetSeatId('');
        setChangeSeatStudent(student);
      }
    } catch (err: any) {
      showToast('Failed to load seats', 'error');
    }
  };

  const handleChangeSeat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeSeatStudent || !targetSeatId) return;
    try {
      setIsSubmittingSeat(true);
      const res = await api.patch<{ success: boolean; message: string }>(
        `/admin/users/${changeSeatStudent._id}/change-seat`,
        { seatId: targetSeatId }
      );
      if (res.success) {
        showToast(res.message, 'success');
        setChangeSeatStudent(null);
        fetchExpiringStudents();
        fetchDashboardStats(selectedFilter);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to change seat', 'error');
    } finally {
      setIsSubmittingSeat(false);
    }
  };

  const handleOpenChangeBatch = async (student: any) => {
    try {
      const res = await api.get<{ success: boolean; batches: any[] }>('/admin/batches');
      if (res.success) {
        setAvailableBatches(res.batches || []);
        setTargetBatchId('');
        setChangeBatchStudent(student);
      }
    } catch (err: any) {
      showToast('Failed to load batches', 'error');
    }
  };

  const handleChangeBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeBatchStudent || !targetBatchId) return;
    try {
      setIsSubmittingBatch(true);
      const res = await api.patch<{ success: boolean; message: string }>(
        `/admin/users/${changeBatchStudent._id}/change-batch`,
        { batchId: targetBatchId }
      );
      if (res.success) {
        showToast(res.message, 'success');
        setChangeBatchStudent(null);
        fetchExpiringStudents();
        fetchDashboardStats(selectedFilter);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to change batch', 'error');
    } finally {
      setIsSubmittingBatch(false);
    }
  };

  const handleOpenEdit = (student: any) => {
    setEditForm({
      name: student.name || '',
      phone: student.phone || '',
      classCourse: student.classCourse || '',
      address: student.address || '',
      parentName: student.parentName || '',
      parentPhone: student.parentPhone || '',
      photo: student.photo || '',
    });
    setEditStudent(student);
  };

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudent) return;
    try {
      setIsSubmittingEdit(true);
      const res = await api.patch<{ success: boolean; message: string }>(
        `/admin/users/${editStudent._id}`,
        editForm
      );
      if (res.success) {
        showToast(res.message, 'success');
        setEditStudent(null);
        fetchExpiringStudents();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update details', 'error');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleCancelSubscription = async (student: any) => {
    if (!confirm(`Cancel subscription for ${student.name}? Their assigned seat will be released immediately.`)) {
      return;
    }
    try {
      const res = await api.patch<{ success: boolean; message: string }>(
        `/admin/users/${student._id}/cancel-subscription`,
        { reason: 'Cancelled from Dashboard' }
      );
      if (res.success) {
        showToast(res.message, 'info');
        fetchExpiringStudents();
        fetchDashboardStats(selectedFilter);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel subscription', 'error');
    }
  };

  const handleOpenIdCard = async (student: any) => {
    try {
      const res = await api.get<{ success: boolean; idCard: any }>(`/admin/users/${student._id}/id-card`);
      if (res.success) {
        setIdCardData(res.idCard);
      }
    } catch (err) {
      console.error('Failed to fetch ID card data:', err);
    }
  };

  const usageStats = stats?.usageStats;
  const hasActivePlan = usageStats?.hasActivePlan;
  const financials = stats?.financials || { totalIncome: 0, totalExpenses: 0, netRevenue: 0, label: 'This Month' };
  const waAlerts = stats?.whatsappAlerts || { used: 0, limit: 500, remaining: 500 };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 pb-12">
      <SEO
        title={user?.organizationName ? `${user.organizationName} Dashboard` : 'Library Admin Dashboard'}
        description="Monitor real-time income, expenses, seat occupancy, member batches, and automated WhatsApp alerts."
      />
      <Header
        title={user?.organizationName || 'Library Console'}
        subtitle="Library Operations & Financials"
      />

      <div className="p-4 flex flex-col gap-4">
        {loading && !stats ? (
          <div className="flex flex-col gap-3">
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
          </div>
        ) : (
          <>
            {/* Subscription Status Banner */}
            {!hasActivePlan ? (
              <div className="p-4 rounded-3xl bg-amber-500 text-white shadow-ios flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 flex-shrink-0 text-amber-200" />
                  <div>
                    <h3 className="text-sm font-bold leading-tight">No Active Subscription</h3>
                    <p className="text-xs text-amber-100">Unlock multiple branches, seats, timings & WhatsApp alerts.</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/admin/saas-purchase')}
                  className="px-3.5 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-sm active:scale-95 transition-all flex-shrink-0"
                >
                  Buy Plan
                </button>
              </div>
            ) : (
              <SpotlightCard className="bg-gradient-to-br from-ios-blue to-blue-700 text-white border-none shadow-glow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-200" />
                    <span className="text-xs font-semibold text-sky-100 uppercase tracking-wider">
                      {usageStats?.planName}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold">
                    ACTIVE
                  </span>
                </div>

                <div className="flex items-baseline justify-between mb-3">
                  <div>
                    <span className="text-xs text-blue-100 block">Valid until</span>
                    <span className="text-sm font-bold text-white">
                      {new Date(usageStats?.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-xl font-black text-white">
                    {usageStats?.daysRemaining} days left
                  </span>
                </div>

                {/* Quota Usage Progress Grid */}
                <div className="space-y-2 pt-2.5 border-t border-white/20 text-xs">
                  {[
                    { label: 'Branches', ...usageStats?.branches },
                    { label: 'Staff / Managers', ...usageStats?.managers },
                    { label: 'Students / Patrons', ...usageStats?.users },
                    { label: 'Seats', ...usageStats?.seats },
                  ].map((item, idx) => {
                    const pct = item.max > 0 ? Math.min(100, Math.round((item.current / item.max) * 100)) : 0;
                    return (
                      <div key={idx}>
                        <div className="flex justify-between font-medium text-sky-100 mb-0.5 text-[11px]">
                          <span>{item.label}</span>
                          <span>
                            {item.current} / {item.max}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              pct >= 90 ? 'bg-amber-300' : 'bg-white'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SpotlightCard>
            )}

            {/* Financial Overview (Income, Expenses & Net Revenue) */}
            <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-ios space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Financial Performance</h3>
                    <p className="text-[10px] text-slate-500">Real-time library cash flow</p>
                  </div>
                </div>

                {/* Filter Indicator Badge */}
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700">
                  {financials.label}
                </span>
              </div>

              {/* Time Period Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedFilter(opt.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                      selectedFilter === opt.id
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {/* Total Income */}
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-700 block uppercase">Income</span>
                  <span className="text-base font-black text-slate-900 mt-0.5 block truncate">
                    ₹{financials.totalIncome.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-emerald-600 font-semibold">Admissions & Renewals</span>
                </div>

                {/* Total Expenses */}
                <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100">
                  <span className="text-[10px] font-bold text-rose-700 block uppercase">Expenses</span>
                  <span className="text-base font-black text-slate-900 mt-0.5 block truncate">
                    ₹{financials.totalExpenses.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-rose-600 font-semibold">Bills & Upkeep</span>
                </div>

                {/* Net Revenue */}
                <div
                  className={`p-3 rounded-2xl border ${
                    financials.netRevenue >= 0
                      ? 'bg-blue-50/70 border-blue-100 text-blue-900'
                      : 'bg-amber-50/70 border-amber-100 text-amber-900'
                  }`}
                >
                  <span className="text-[10px] font-bold block uppercase text-slate-500">Net Revenue</span>
                  <span
                    className={`text-base font-black mt-0.5 block truncate ${
                      financials.netRevenue >= 0 ? 'text-ios-blue' : 'text-rose-600'
                    }`}
                  >
                    ₹{financials.netRevenue.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-slate-500 font-semibold">Income - Expenses</span>
                </div>
              </div>
            </div>

            {/* WhatsApp Alerts Quota Card */}
            <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-ios">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">WhatsApp Alert Limit</h3>
                    <p className="text-[10px] text-slate-500">Expiry reminders & student alerts</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    waAlerts.remaining <= 20
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {waAlerts.remaining} Remaining
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Total Sent by System & Admin</span>
                <span>
                  {waAlerts.used} / {waAlerts.limit} Alerts
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.round((waAlerts.used / Math.max(1, waAlerts.limit)) * 100))}%`,
                  }}
                />
              </div>
            </div>

            {/* Quick Action Matrix */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => navigate('/admin/branches')}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200 shadow-ios active:scale-95 transition-all text-left"
              >
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900">Branches</span>
                  <span className="text-[10px] text-slate-400">
                    {stats?.branchesCount || 0} Configured
                  </span>
                </div>
              </button>

              <button
                onClick={() => navigate('/admin/seats')}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200 shadow-ios active:scale-95 transition-all text-left"
              >
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Armchair className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900">Seat Timings</span>
                  <span className="text-[10px] text-slate-400">
                    {stats?.activeSeatsCount || 0} Filled in Batches
                  </span>
                </div>
              </button>

              <button
                onClick={() => navigate('/admin/plans')}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200 shadow-ios active:scale-95 transition-all text-left"
              >
                <div className="p-2 rounded-xl bg-blue-50 text-ios-blue">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900">Student Plans</span>
                  <span className="text-[10px] text-slate-400">
                    {stats?.userPlansCount || 0} Tiers Active
                  </span>
                </div>
              </button>

              <button
                onClick={() => navigate('/admin/expenses')}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200 shadow-ios active:scale-95 transition-all text-left"
              >
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900">Expenses</span>
                  <span className="text-[10px] text-rose-600 font-semibold">
                    Manage Outflow
                  </span>
                </div>
              </button>
            </div>

            {/* Operational Stats: Clickable to Open User List & Seat Grid */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/admin/users')}
                className="text-left w-full active:scale-95 transition-all group"
              >
                <SpotlightCard className="h-full border border-slate-200/90 group-hover:border-ios-blue/50 transition-colors">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-xs font-semibold text-slate-500">Active Students</span>
                    <Users className="w-4 h-4 text-ios-blue" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    <AnimatedCounter value={stats?.activeUsersCount || 0} />
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[10px]">
                    <span className="text-slate-400">
                      Total: {stats?.totalUsersCount || 0}
                    </span>
                    <span className="font-semibold text-ios-blue flex items-center">
                      View All <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </SpotlightCard>
              </button>

              <button
                onClick={() => navigate('/admin/seats')}
                className="text-left w-full active:scale-95 transition-all group"
              >
                <SpotlightCard className="h-full border border-slate-200/90 group-hover:border-purple-300 transition-colors">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-xs font-semibold text-slate-500">Seat Allocations</span>
                    <Armchair className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    <AnimatedCounter value={stats?.activeSeatsCount || 0} />
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[10px]">
                    <span className="text-slate-400">
                      Across all batches
                    </span>
                    <span className="font-semibold text-purple-600 flex items-center">
                      Seat Grid <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </SpotlightCard>
              </button>
            </div>

            {/* Expiring Students Section */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-2xl bg-amber-50 text-amber-600">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-black text-slate-900 leading-tight">
                      Expiring & Due Subscriptions
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800">
                    {expiringStudents.length} Students
                  </span>
                  <button
                    onClick={() => navigate('/admin/users?filter=expiring_soon')}
                    className="hidden sm:flex text-xs font-bold text-ios-blue hover:underline items-center gap-0.5"
                  >
                    View All <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {loadingExpiring ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <SkeletonLoader variant="card" />
                  <SkeletonLoader variant="card" />
                </div>
              ) : expiringStudents.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">All Subscriptions Active!</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    No student plans are expiring in the next 5 days.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {expiringStudents.map((st) => {
                    const isToday = st.expiryCategory === 'EXPIRES_TODAY';
                    const isOverdue = st.expiryCategory === 'EXPIRED';

                    return (
                      <div
                        key={st._id}
                        className={`p-4 rounded-3xl bg-white border shadow-xs flex flex-col justify-between transition-all ${
                          isToday
                            ? 'border-rose-300 ring-2 ring-rose-100'
                            : isOverdue
                            ? 'border-slate-300 bg-slate-50/50'
                            : 'border-amber-200'
                        }`}
                      >
                        <div>
                          {/* Card Top: Photo, Name, Status Badge */}
                          <div className="flex items-start justify-between gap-2.5 mb-2.5">
                            <div className="flex items-center gap-3 min-w-0">
                              {st.photo ? (
                                <img
                                  src={st.photo}
                                  alt={st.name}
                                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 flex-shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 font-black text-base flex items-center justify-center flex-shrink-0">
                                  {st.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <h4 className="text-sm font-black text-slate-900 truncate">
                                  {st.name}
                                </h4>
                                <a
                                  href={`tel:${st.phone}`}
                                  className="text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1 mt-0.5 font-medium"
                                >
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{st.phone}</span>
                                </a>
                              </div>
                            </div>

                            <span
                              className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex-shrink-0 ${
                                isToday
                                  ? 'bg-rose-500 text-white animate-pulse'
                                  : isOverdue
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {isToday
                                ? 'Expires Today'
                                : isOverdue
                                ? 'Already Expired'
                                : `${st.daysRemaining}d remaining`}
                            </span>
                          </div>

                          {/* Desk & Batch Info */}
                          <div className="grid grid-cols-2 gap-2 my-2.5">
                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                              <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                                Seat
                              </span>
                              <strong className="text-xs font-black text-slate-800">
                                {st.currentSeat?.seatNumber ? `#${st.currentSeat.seatNumber}` : 'None'}
                              </strong>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                              <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                                Batch
                              </span>
                              <strong className="text-xs font-black text-slate-800 truncate block">
                                {st.batchId?.name || 'Standard'}
                              </strong>
                            </div>
                          </div>

                          {/* Expiry Date */}
                          <div className="text-[11px] text-slate-500 flex items-center justify-between mb-3 px-1">
                            <span>Expiry Date:</span>
                            <strong className={isToday ? 'text-rose-600 font-black' : 'text-slate-800 font-bold'}>
                              {st.planEndDate ? new Date(st.planEndDate).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              }) : 'N/A'}
                            </strong>
                          </div>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
                          {/* 1. Extend Expiry */}
                          <button
                            onClick={() => {
                              setExtendStudent(st);
                              setExtendDays('7');
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold text-[11px] transition-all active:scale-95"
                            title="Extend validity"
                          >
                            Extend Expiry
                          </button>

                          {/* 2. WhatsApp Notice */}
                          <button
                            onClick={() => setStudentToSendWhatsApp(st)}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] transition-all active:scale-95 flex items-center gap-1"
                            title="Open WhatsApp message with template"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </button>

                          {/* 3. Change Seat */}
                          <button
                            onClick={() => handleOpenChangeSeat(st)}
                            className="px-2.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-[11px] transition-all active:scale-95"
                          >
                            Seat
                          </button>

                          {/* 4. Change Batch */}
                          <button
                            onClick={() => handleOpenChangeBatch(st)}
                            className="px-2.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-[11px] transition-all active:scale-95"
                          >
                            Batch
                          </button>

                          {/* 5. Update Details */}
                          <button
                            onClick={() => handleOpenEdit(st)}
                            className="px-2 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-[11px] transition-all active:scale-95"
                          >
                            Edit
                          </button>

                          {/* 6. View Profile */}
                          <button
                            onClick={() => navigate(`/admin/users/${st._id}`)}
                            className="px-2 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] transition-all active:scale-95"
                          >
                            Profile
                          </button>

                          {/* 7. Cancel Subscription */}
                          <button
                            onClick={() => handleCancelSubscription(st)}
                            className="px-2 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[11px] transition-all active:scale-95 ml-auto"
                            title="Cancel subscription and release seat"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Extend Expiry Modal */}
      {extendStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Extend Subscription</h3>
            <p className="text-xs text-slate-500 mb-4">
              Extend plan duration for <strong>{extendStudent.name}</strong>.
            </p>
            <form onSubmit={handleExtendExpiry} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Extension Duration
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {['3', '7', '15', '30'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setExtendDays(d)}
                      className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
                        extendDays === d
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      +{d}d
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={extendDays}
                  onChange={(e) => setExtendDays(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                  placeholder="Custom days..."
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setExtendStudent(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingExtend}
                  className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmittingExtend ? 'Extending...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Seat Modal */}
      {changeSeatStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Reassign Desk</h3>
            <p className="text-xs text-slate-500 mb-4">
              Select available desk for <strong>{changeSeatStudent.name}</strong>:
            </p>
            <form onSubmit={handleChangeSeat} className="space-y-3">
              <select
                value={targetSeatId}
                onChange={(e) => setTargetSeatId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium"
                required
              >
                <option value="">Select an Available Seat</option>
                {availableSeats.map((s) => (
                  <option key={s._id} value={s._id}>
                    Seat #{s.seatNumber} ({s.branchId?.name || 'Branch'}) - {s.status}
                  </option>
                ))}
              </select>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setChangeSeatStudent(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSeat || !targetSeatId}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSubmittingSeat ? 'Reassigning...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Batch Modal */}
      {changeBatchStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Change Study Batch</h3>
            <p className="text-xs text-slate-500 mb-4">
              Select session timing for <strong>{changeBatchStudent.name}</strong>:
            </p>
            <form onSubmit={handleChangeBatch} className="space-y-3">
              <select
                value={targetBatchId}
                onChange={(e) => setTargetBatchId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium"
                required
              >
                <option value="">Select a Session Batch</option>
                {availableBatches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} ({b.startTime} - {b.endTime})
                  </option>
                ))}
              </select>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setChangeBatchStudent(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBatch || !targetBatchId}
                  className="flex-1 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 disabled:opacity-50"
                >
                  {isSubmittingBatch ? 'Updating...' : 'Update Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Details Modal */}
      {editStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Edit Student Details</h3>
            <p className="text-xs text-slate-500 mb-4">Update contact and guardian details.</p>
            <form onSubmit={handleUpdateDetails} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Course / Exam</label>
                  <input
                    type="text"
                    value={editForm.classCourse}
                    onChange={(e) => setEditForm((p) => ({ ...p, classCourse: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Parent Name</label>
                  <input
                    type="text"
                    value={editForm.parentName}
                    onChange={(e) => setEditForm((p) => ({ ...p, parentName: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Parent Phone</label>
                  <input
                    type="tel"
                    value={editForm.parentPhone}
                    onChange={(e) => setEditForm((p) => ({ ...p, parentPhone: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm((p) => ({ ...p, address: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div>
                <ImageUpload
                  label="Student Photo"
                  value={editForm.photo}
                  onChange={(url) => setEditForm((p) => ({ ...p, photo: url }))}
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditStudent(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmittingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Linked Drill-Down Modals */}
      <BatchOccupancyModal
        isOpen={!!selectedSeatId}
        seatId={selectedSeatId}
        onClose={() => setSelectedSeatId(null)}
        onSelectStudent={(student) => setSelectedStudent(student)}
      />

      <StudentDetailModal
        isOpen={!!selectedStudent}
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onGenerateIdCard={(student) => handleOpenIdCard(student)}
        onRenewPlan={(student) => setStudentToRenew(student)}
        onSendWhatsApp={(student) => setStudentToSendWhatsApp(student)}
      />

      <IDCardModal
        isOpen={!!idCardData}
        idCardData={idCardData}
        onClose={() => setIdCardData(null)}
      />

      <RenewPlanModal
        isOpen={!!studentToRenew}
        student={studentToRenew}
        onClose={() => setStudentToRenew(null)}
        onSuccess={() => fetchDashboardStats(selectedFilter)}
      />

      <SendWhatsAppModal
        isOpen={!!studentToSendWhatsApp}
        student={studentToSendWhatsApp}
        onClose={() => setStudentToSendWhatsApp(null)}
        onSuccess={() => fetchDashboardStats(selectedFilter)}
      />
    </div>
  );
};
