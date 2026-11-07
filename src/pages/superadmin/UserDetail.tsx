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
  ExternalLink,
  Shield,
  MapPin,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../../api/client.js';
import { Header } from '../../components/common/Header.js';
import { SkeletonLoader } from '../../components/reactbits/SkeletonLoader.js';
import { SEO } from '../../components/common/SEO.js';
import { IDCardModal } from '../../components/common/IDCardModal.js';
import { humanizeActivity, formatRelativeTime } from '../../utils/activityFormatter.js';

export const UserDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'subscriptions' | 'seats' | 'payments' | 'activity'>('profile');
  const [idCardData, setIdCardData] = useState<any>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    api
      .get<{ success: boolean; [key: string]: any }>(`/superadmin/users/${userId}`)
      .then((res) => {
        if (res.success) setData(res);
      })
      .catch((err) => console.error('Failed to load student details:', err))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
        <Header title="Student Profile" showBack />
        <div className="max-w-4xl mx-auto w-full p-4 flex flex-col gap-3">
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
        <h3 className="text-base font-bold text-slate-800">Student Record Not Found</h3>
        <button
          onClick={() => navigate('/superadmin/users')}
          className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
        >
          Back to Students
        </button>
      </div>
    );
  }

  const handleOpenIdCard = async () => {
    try {
      const res = await api.get<{ success: boolean; idCard: any }>(`/admin/users/${user._id}/id-card`);
      if (res.success) setIdCardData(res.idCard);
    } catch {
      // Fallback ID Card structure
      setIdCardData({
        student: {
          id: user._id,
          idCardNumber: user.idCardNumber || `LIB-${user._id.toString().slice(-6).toUpperCase()}`,
          name: user.name,
          phone: user.phone,
          classCourse: user.classCourse || 'General Reading',
          address: user.address,
          photo: user.photo,
          parentName: user.parentName,
          parentPhone: user.parentPhone,
          aadharNumber: user.aadharNumber,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          planName: user.currentPlan?.name || 'Standard Plan',
          planStartDate: user.planStartDate || user.createdAt,
          planEndDate: user.planEndDate,
        },
        organization: {
          name: user.adminId?.organizationName || 'Library',
          adminName: user.adminId?.name,
          phone: user.adminId?.phone,
        },
        branch: {
          name: user.branchId?.name || 'Main Branch',
          address: user.branchId?.address,
        },
        seat: {
          seatNumber: user.currentSeat?.seatNumber || 'Unassigned',
        },
        batch: {
          name: user.batchId?.name || 'Regular Batch',
          timings: user.batchId ? `${user.batchId.startTime} - ${user.batchId.endTime}` : 'Full Day',
        },
      });
    }
  };

  const now = new Date();
  const expiry = user.planEndDate ? new Date(user.planEndDate) : null;
  let daysRemaining = 0;
  let isExpired = false;
  if (expiry) {
    const diffMs = expiry.getTime() - now.getTime();
    daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (daysRemaining <= 0 || user.entryStatus === 'EXPIRED') isExpired = true;
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen pb-12">
      <SEO
        title={`${user.name} - Student Details`}
        description="Comprehensive student profile, desk allocation history, and subscription records."
      />
      <Header
        title={user.name}
        subtitle={`Library Member #${user.idCardNumber || user._id.slice(-6).toUpperCase()}`}
        showBack
        rightAction={
          <button
            onClick={handleOpenIdCard}
            className="px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Digital ID Card</span>
          </button>
        }
      />

      <div className="max-w-5xl mx-auto w-full p-4 flex flex-col gap-4">
        {/* Top Profile Summary Banner */}
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
                    isExpired
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : daysRemaining <= 5
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {isExpired ? 'Expired' : `${daysRemaining} days left`}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Org: <strong>{user.adminId?.organizationName || user.adminId?.name || 'Library'}</strong> •{' '}
                Branch: <strong>{user.branchId?.name || 'Main Branch'}</strong>
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1">
                <span className="flex items-center gap-1 font-semibold text-slate-600">
                  <Phone className="w-3 h-3 text-emerald-500" /> {user.phone}
                </span>
                {user.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" /> {user.email}
                  </span>
                )}
                {user.classCourse && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                    {user.classCourse}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
            {user.adminId?._id && (
              <button
                onClick={() => navigate(`/superadmin/admins/${user.adminId._id}`)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 flex items-center gap-1"
              >
                <span>View Library Org</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Allocation Badges */}
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

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {[
            { id: 'profile', label: 'Personal & Contact' },
            { id: 'subscriptions', label: 'Subscription History', count: subscriptions?.length },
            { id: 'seats', label: 'Seat & Batch History', count: seatAssignments?.length },
            { id: 'payments', label: 'Fee Payments', count: payments?.length },
            { id: 'activity', label: 'Activity Trail', count: activity?.length },
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

        {/* Tab 1: Profile & Contact */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Personal Information</h3>
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
                    <span className="text-slate-500 block mb-0.5">Permanent / Residential Address</span>
                    <span className="text-slate-700">{user.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Guardian & Emergency Details</h3>
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
                  <span className="text-slate-500">Study Course / Exam</span>
                  <span className="font-bold text-slate-800">{user.classCourse || 'General Reading'}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Member Status</span>
                  <span className="font-bold text-slate-800">{user.entryStatus || 'ACTIVE'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Subscription History */}
        {activeTab === 'subscriptions' && (
          <div className="flex flex-col gap-2.5">
            {subscriptions?.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
                Current plan active. No previous archived subscriptions recorded.
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

        {/* Tab 3: Seat & Batch History */}
        {activeTab === 'seats' && (
          <div className="flex flex-col gap-2.5">
            {seatAssignments?.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
                No past desk changes recorded.
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

        {/* Tab 4: Fee Payments */}
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

        {/* Tab 5: Activity Timeline */}
        {activeTab === 'activity' && (
          <div className="flex flex-col gap-2.5">
            {activity?.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
                No activity records logged for this student
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
    </div>
  );
};

