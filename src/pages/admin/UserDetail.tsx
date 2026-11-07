import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  Building2,
  Armchair,
  Clock,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  History,
  Activity,
  Printer,
  ChevronLeft,
  MessageSquare,
  RefreshCw,
  Edit,
  XCircle,
  PlusCircle,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../api/client.js';
import { Header } from '../../components/common/Header.js';
import { SkeletonLoader } from '../../components/reactbits/SkeletonLoader.js';
import { SEO } from '../../components/common/SEO.js';
import { IDCardModal } from '../../components/common/IDCardModal.js';
import { SendWhatsAppModal } from '../../components/admin/SendWhatsAppModal.js';
import { RenewPlanModal } from '../../components/admin/RenewPlanModal.js';
import { ImageUpload } from '../../components/common/ImageUpload.js';
import { useToast } from '../../context/ToastContext.js';
import { humanizeActivity, formatRelativeTime } from '../../utils/activityFormatter.js';

export const UserDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'subscriptions' | 'seats' | 'payments' | 'activity'>('profile');

  // Interactive Modals
  const [idCardData, setIdCardData] = useState<any>(null);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isRenewOpen, setIsRenewOpen] = useState(false);

  // Extend Expiry Modal
  const [isExtendOpen, setIsExtendOpen] = useState(false);
  const [extensionDays, setExtensionDays] = useState('7');
  const [isSubmittingExtend, setIsSubmittingExtend] = useState(false);

  // Change Seat Modal
  const [isChangeSeatOpen, setIsChangeSeatOpen] = useState(false);
  const [availableSeats, setAvailableSeats] = useState<any[]>([]);
  const [selectedSeatId, setSelectedSeatId] = useState('');
  const [isSubmittingSeat, setIsSubmittingSeat] = useState(false);

  // Change Batch Modal
  const [isChangeBatchOpen, setIsChangeBatchOpen] = useState(false);
  const [allBatches, setAllBatches] = useState<any[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);

  // Edit Profile Modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    classCourse: '',
    address: '',
    parentName: '',
    parentPhone: '',
    aadharNumber: '',
    photo: '',
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const fetchUserDetail = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await api.get<{ success: boolean; [key: string]: any }>(`/admin/users/${userId}`);
      if (res.success) {
        setData(res);
        if (res.user) {
          setEditForm({
            name: res.user.name || '',
            phone: res.user.phone || '',
            classCourse: res.user.classCourse || '',
            address: res.user.address || '',
            parentName: res.user.parentName || '',
            parentPhone: res.user.parentPhone || '',
            aadharNumber: res.user.aadharNumber || '',
            photo: res.user.photo || '',
          });
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load student details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetail();
  }, [userId]);

  const handleOpenIdCard = async () => {
    try {
      const res = await api.get<{ success: boolean; idCard: any }>(`/admin/users/${userId}/id-card`);
      if (res.success) setIdCardData(res.idCard);
    } catch (err: any) {
      showToast('Failed to generate ID card', 'error');
    }
  };

  const handleExtendExpiry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingExtend(true);
      const res = await api.patch<{ success: boolean; message: string }>(`/admin/users/${userId}/extend-expiry`, {
        days: parseInt(extensionDays, 10),
      });
      if (res.success) {
        showToast(res.message, 'success');
        setIsExtendOpen(false);
        fetchUserDetail();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to extend subscription', 'error');
    } finally {
      setIsSubmittingExtend(false);
    }
  };

  const handleOpenChangeSeat = async () => {
    try {
      const res = await api.get<{ success: boolean; seats: any[] }>('/admin/seats');
      if (res.success) {
        setAvailableSeats(res.seats || []);
        setIsChangeSeatOpen(true);
      }
    } catch (err: any) {
      showToast('Failed to load seats', 'error');
    }
  };

  const handleChangeSeat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeatId) return;
    try {
      setIsSubmittingSeat(true);
      const res = await api.patch<{ success: boolean; message: string }>(`/admin/users/${userId}/change-seat`, {
        seatId: selectedSeatId,
      });
      if (res.success) {
        showToast(res.message, 'success');
        setIsChangeSeatOpen(false);
        fetchUserDetail();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to change seat', 'error');
    } finally {
      setIsSubmittingSeat(false);
    }
  };

  const handleOpenChangeBatch = async () => {
    try {
      const res = await api.get<{ success: boolean; batches: any[] }>('/admin/batches');
      if (res.success) {
        setAllBatches(res.batches || []);
        setIsChangeBatchOpen(true);
      }
    } catch (err: any) {
      showToast('Failed to load batches', 'error');
    }
  };

  const handleChangeBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) return;
    try {
      setIsSubmittingBatch(true);
      const res = await api.patch<{ success: boolean; message: string }>(`/admin/users/${userId}/change-batch`, {
        batchId: selectedBatchId,
      });
      if (res.success) {
        showToast(res.message, 'success');
        setIsChangeBatchOpen(false);
        fetchUserDetail();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to change batch', 'error');
    } finally {
      setIsSubmittingBatch(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm(`Are you sure you want to cancel the subscription for ${data?.user?.name}? The assigned seat will be released.`)) {
      return;
    }
    try {
      const res = await api.patch<{ success: boolean; message: string }>(`/admin/users/${userId}/cancel-subscription`, {
        reason: 'Admin cancelled',
      });
      if (res.success) {
        showToast(res.message, 'info');
        fetchUserDetail();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel subscription', 'error');
    }
  };

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingEdit(true);
      const res = await api.patch<{ success: boolean; message: string }>(`/admin/users/${userId}`, editForm);
      if (res.success) {
        showToast(res.message, 'success');
        setIsEditOpen(false);
        fetchUserDetail();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update details', 'error');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
        <Header title="Student Profile" showBack />
        <div className="max-w-5xl mx-auto w-full p-4 flex flex-col gap-3">
          <SkeletonLoader variant="card" />
          <SkeletonLoader variant="card" />
        </div>
      </div>
    );
  }

  const { user, subscriptions, payments, seatAssignments, activity } = data || {};

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50">
        <User className="w-12 h-12 text-slate-300 mb-2" />
        <h3 className="text-base font-bold text-slate-800">Student Not Found</h3>
        <button
          onClick={() => navigate('/admin/users')}
          className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
        >
          Back to Students
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen pb-16">
      <SEO
        title={`${user.name} - Student Profile`}
        description="Comprehensive student details, desk allocations, and operations."
      />
      <Header
        title={user.name}
        subtitle={`Member #${user.idCardNumber || user._id.slice(-6).toUpperCase()}`}
        showBack
        rightAction={
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsWhatsAppOpen(true)}
              className="p-2 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all"
              title="Send WhatsApp Notice"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              onClick={handleOpenIdCard}
              className="px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ID Card</span>
            </button>
          </div>
        }
      />

      <div className="max-w-5xl mx-auto w-full p-4 flex flex-col gap-4">
        {/* Top Profile Summary */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {user.photo ? (
              <img
                src={user.photo}
                alt={user.name}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-2xl border border-emerald-100 flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900">{user.name}</h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    user.isExpired
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : user.isExpiringSoon
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {user.isExpired ? 'Expired' : `${user.daysRemaining || 0} days left`}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Branch: <strong>{user.branchId?.name || 'Main Branch'}</strong>
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <Phone className="w-3 h-3 text-emerald-500" /> {user.phone}
                </span>
                {user.classCourse && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                    {user.classCourse}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Operations Strip */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
            <button
              onClick={() => setIsExtendOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-bold transition-all active:scale-95"
            >
              Extend Expiry
            </button>
            <button
              onClick={() => setIsRenewOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-all active:scale-95"
            >
              Renew Plan
            </button>
            <button
              onClick={handleOpenChangeSeat}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-all active:scale-95"
            >
              Change Seat
            </button>
            <button
              onClick={handleOpenChangeBatch}
              className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold transition-all active:scale-95"
            >
              Change Batch
            </button>
            <button
              onClick={() => setIsEditOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
            >
              <Edit className="w-3 h-3" /> Edit
            </button>
            <button
              onClick={handleCancelSubscription}
              className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-all active:scale-95"
            >
              Cancel Sub
            </button>
          </div>
        </div>

        {/* Quick Info Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 shadow-xs text-center">
            <span className="text-lg font-black text-blue-900 block">
              {user.currentSeat?.seatNumber ? `#${user.currentSeat.seatNumber}` : 'Unassigned'}
            </span>
            <span className="text-[10px] text-blue-600 font-bold uppercase flex items-center justify-center gap-1 mt-0.5">
              <Armchair className="w-3 h-3" /> Assigned Desk
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 shadow-xs text-center">
            <span className="text-sm font-black text-purple-900 block truncate">
              {user.batchId?.name || 'Regular'}
            </span>
            <span className="text-[10px] text-purple-600 font-bold uppercase flex items-center justify-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" />{' '}
              {user.batchId ? `${user.batchId.startTime}-${user.batchId.endTime}` : 'All Day'}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 shadow-xs text-center">
            <span className="text-sm font-black text-emerald-900 block truncate">
              {user.currentPlan?.name || 'Standard'}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold uppercase flex items-center justify-center gap-1 mt-0.5">
              <CreditCard className="w-3 h-3" /> Active Plan
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs text-center">
            <span className="text-xs font-black text-slate-800 block">
              {user.planEndDate ? new Date(user.planEndDate).toLocaleDateString() : 'N/A'}
            </span>
            <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center justify-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3 text-slate-400" /> Plan Expiry
            </span>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {[
            { id: 'profile', label: 'Personal & Guardian' },
            { id: 'subscriptions', label: 'Subscription History', count: subscriptions?.length },
            { id: 'seats', label: 'Seat & Batch History', count: seatAssignments?.length },
            { id: 'payments', label: 'Fee Payments', count: payments?.length },
            { id: 'activity', label: 'Activity Timeline', count: activity?.length },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    activeTab === t.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab 1: Profile */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Personal Details</h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Gender</span>
                  <span className="font-bold text-slate-800">{user.gender || 'Not specified'}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Date of Birth</span>
                  <span className="font-bold text-slate-800">
                    {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Aadhar / ID Number</span>
                  <span className="font-mono font-bold text-slate-800">{user.aadharNumber || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Enrolled Since</span>
                  <span className="font-bold text-slate-800">
                    {new Date(user.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                {user.address && (
                  <div className="py-1.5">
                    <span className="text-slate-500 block mb-0.5">Permanent Address</span>
                    <span className="text-slate-700">{user.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Guardian & Emergency</h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Parent / Guardian Name</span>
                  <span className="font-bold text-slate-800">{user.parentName || 'Not recorded'}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Parent Phone</span>
                  <span className="font-bold text-slate-800">{user.parentPhone || 'Not recorded'}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Course / Target Exam</span>
                  <span className="font-bold text-slate-800">{user.classCourse || 'General Reading'}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Subscription Status</span>
                  <span className="font-bold text-slate-800">{user.entryStatus || 'ACTIVE'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Subscriptions */}
        {activeTab === 'subscriptions' && (
          <div className="flex flex-col gap-2.5">
            {subscriptions?.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
                No past subscription records found.
              </div>
            ) : (
              subscriptions?.map((sub: any) => (
                <div
                  key={sub._id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-slate-900">{sub.planSnapshot?.name || 'Library Subscription'}</h4>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Valid: {new Date(sub.startDate).toLocaleDateString()} — {new Date(sub.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-800 block">₹{sub.planSnapshot?.price || 0}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        sub.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Seat Assignments */}
        {activeTab === 'seats' && (
          <div className="flex flex-col gap-2.5">
            {seatAssignments?.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
                No seat change history recorded.
              </div>
            ) : (
              seatAssignments?.map((sa: any) => (
                <div
                  key={sa._id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 font-black">
                      #{sa.seatId?.seatNumber || 'Seat'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">
                        Seat #{sa.seatId?.seatNumber || 'N/A'} • {sa.batchId?.name || 'Batch'}
                      </h4>
                      <span className="text-[11px] text-slate-400 block">
                        Assigned: {new Date(sa.startDate || sa.createdAt).toLocaleDateString()}
                        {sa.notes ? ` (${sa.notes})` : ''}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                      sa.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {sa.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: Payments */}
        {activeTab === 'payments' && (
          <div className="flex flex-col gap-2.5">
            {payments?.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
                No payment transactions recorded
              </div>
            ) : (
              payments?.map((pm: any) => (
                <div
                  key={pm._id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-slate-900">{pm.planName || 'Fee Payment'}</h4>
                    <span className="text-[11px] text-slate-400 block">
                      {new Date(pm.createdAt).toLocaleDateString()} • UTR: {pm.utr || 'Direct'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-emerald-600 block text-sm">₹{pm.amount}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{pm.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 5: Activity */}
        {activeTab === 'activity' && (
          <div className="flex flex-col gap-2.5">
            {activity?.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
                No activity records logged
              </div>
            ) : (
              activity?.map((act: any) => {
                const item = humanizeActivity(act);
                return (
                  <div
                    key={act._id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col gap-1.5 text-xs hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`p-1.5 rounded-xl flex-shrink-0 ${item.badgeColor}`}>
                          <Activity className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-slate-900 truncate">{item.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                        {item.relativeTime}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 pl-8">{item.description}</p>

                    {item.changes && item.changes.length > 0 && (
                      <div className="pl-8 flex flex-wrap gap-1.5 mt-1">
                        {item.changes.map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200"
                          >
                            {c.label}: {c.from ? `${c.from} → ${c.to}` : c.value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ID Card Modal */}
      {idCardData && (
        <IDCardModal
          isOpen={Boolean(idCardData)}
          onClose={() => setIdCardData(null)}
          data={idCardData}
        />
      )}

      {/* WhatsApp Modal */}
      {isWhatsAppOpen && user && (
        <SendWhatsAppModal
          isOpen={isWhatsAppOpen}
          onClose={() => setIsWhatsAppOpen(false)}
          student={user}
          onSuccess={() => fetchUserDetail()}
        />
      )}

      {/* Renew Modal */}
      {isRenewOpen && user && (
        <RenewPlanModal
          isOpen={isRenewOpen}
          onClose={() => setIsRenewOpen(false)}
          student={user}
          onSuccess={() => fetchUserDetail()}
        />
      )}

      {/* Extend Expiry Modal */}
      {isExtendOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Extend Subscription</h3>
            <p className="text-xs text-slate-500 mb-4">
              Add extra days to {user.name}'s active desk subscription.
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
                      onClick={() => setExtensionDays(d)}
                      className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
                        extensionDays === d
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      +{d} Days
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={extensionDays}
                  onChange={(e) => setExtensionDays(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                  placeholder="Custom days..."
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsExtendOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingExtend}
                  className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmittingExtend ? 'Saving...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Seat Modal */}
      {isChangeSeatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Reassign Seat</h3>
            <p className="text-xs text-slate-500 mb-4">
              Current seat: <strong>#{user.currentSeat?.seatNumber || 'None'}</strong>. Select new desk:
            </p>
            <form onSubmit={handleChangeSeat} className="space-y-3">
              <select
                value={selectedSeatId}
                onChange={(e) => setSelectedSeatId(e.target.value)}
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
                  onClick={() => setIsChangeSeatOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSeat || !selectedSeatId}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSubmittingSeat ? 'Reassigning...' : 'Reassign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Batch Modal */}
      {isChangeBatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Change Study Batch</h3>
            <p className="text-xs text-slate-500 mb-4">
              Current: <strong>{user.batchId?.name || 'None'}</strong>. Select new timing session:
            </p>
            <form onSubmit={handleChangeBatch} className="space-y-3">
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium"
                required
              >
                <option value="">Select a Batch</option>
                {allBatches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} ({b.startTime} - {b.endTime})
                  </option>
                ))}
              </select>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsChangeBatchOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBatch || !selectedBatchId}
                  className="flex-1 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 disabled:opacity-50"
                >
                  {isSubmittingBatch ? 'Updating...' : 'Update Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Details Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Edit Student Details</h3>
            <p className="text-xs text-slate-500 mb-4">Update contact and guardian information.</p>
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
                  onClick={() => setIsEditOpen(false)}
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
    </div>
  );
};
