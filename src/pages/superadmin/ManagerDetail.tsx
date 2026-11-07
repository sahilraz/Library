import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  Calendar,
  Clock,
  Users,
  Activity,
  CheckCircle,
  ExternalLink,
  Sliders,
  ChevronLeft,
} from 'lucide-react';
import { api } from '../../api/client.js';
import { Header } from '../../components/common/Header.js';
import { SkeletonLoader } from '../../components/reactbits/SkeletonLoader.js';
import { SEO } from '../../components/common/SEO.js';
import { humanizeActivity, formatRelativeTime } from '../../utils/activityFormatter.js';

export const ManagerDetail: React.FC = () => {
  const { managerId } = useParams<{ managerId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'students' | 'permissions' | 'sessions' | 'activity'>('profile');

  useEffect(() => {
    if (!managerId) return;
    setLoading(true);
    api
      .get<{ success: boolean; [key: string]: any }>(`/superadmin/managers/${managerId}`)
      .then((res) => {
        if (res.success) setData(res);
      })
      .catch((err) => console.error('Failed to load manager details:', err))
      .finally(() => setLoading(false));
  }, [managerId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
        <Header title="Manager Profile" showBack />
        <div className="max-w-4xl mx-auto w-full p-4 flex flex-col gap-3">
          <SkeletonLoader variant="card" />
          <SkeletonLoader variant="card" />
        </div>
      </div>
    );
  }

  const { manager, permissions, students, sessions, activity } = data || {};

  if (!manager) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50">
        <ShieldCheck className="w-12 h-12 text-slate-300 mb-2" />
        <h3 className="text-base font-bold text-slate-800">Manager Not Found</h3>
        <button
          onClick={() => navigate('/superadmin/managers')}
          className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
        >
          Back to Managers
        </button>
      </div>
    );
  }

  const lastActiveSession = sessions && sessions.length > 0 ? sessions[0] : null;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen pb-12">
      <SEO
        title={`${manager.name} - Staff Manager Details`}
        description="Comprehensive manager profile, branch duties, permissions, and operational activity."
      />
      <Header
        title={manager.name}
        subtitle={`Branch Operator: ${manager.branchId?.name || 'Unassigned'}`}
        showBack
      />

      <div className="max-w-5xl mx-auto w-full p-4 flex flex-col gap-4">
        {/* Top Summary Banner */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl flex-shrink-0">
              {manager.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900">{manager.name}</h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    manager.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {manager.status || 'ACTIVE'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Organization: <strong>{manager.adminId?.organizationName || manager.adminId?.name || 'Library'}</strong>
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" /> {manager.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" /> {manager.phone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-400 font-medium block">Last Active</span>
              <span className="text-xs font-bold text-slate-800">
                {lastActiveSession ? formatRelativeTime(lastActiveSession.lastActiveAt) : 'Never'}
              </span>
            </div>
            {manager.adminId?._id && (
              <button
                onClick={() => navigate(`/superadmin/admins/${manager.adminId._id}`)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 flex items-center gap-1"
              >
                <span>Admin View</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Resource Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
            <span className="text-xl font-black text-slate-900 block">{students?.length || 0}</span>
            <span className="text-[11px] text-slate-400 font-semibold uppercase flex items-center justify-center gap-1 mt-0.5">
              <Users className="w-3 h-3 text-emerald-500" /> Students in Branch
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
            <span className="text-xl font-black text-slate-900 block">{activity?.length || 0}</span>
            <span className="text-[11px] text-slate-400 font-semibold uppercase flex items-center justify-center gap-1 mt-0.5">
              <Activity className="w-3 h-3 text-blue-500" /> Actions Logged
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
            <span className="text-xl font-black text-slate-900 block">{sessions?.length || 0}</span>
            <span className="text-[11px] text-slate-400 font-semibold uppercase flex items-center justify-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-purple-500" /> Login Sessions
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
            <span className="text-xl font-black text-slate-900 block">
              {new Date(manager.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="text-[11px] text-slate-400 font-semibold uppercase flex items-center justify-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3 text-amber-500" /> Joined Date
            </span>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {[
            { id: 'profile', label: 'Branch & Duties' },
            { id: 'students', label: 'Students Managed', count: students?.length },
            { id: 'permissions', label: 'Granted Permissions' },
            { id: 'sessions', label: 'Login History', count: sessions?.length },
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

        {/* Tab 1: Profile & Branch */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Assigned Branch Details</h3>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">Branch Name</span>
                  <strong className="text-slate-800 text-sm font-bold">{manager.branchId?.name || 'Unassigned'}</strong>
                </div>
                {manager.branchId?.address && (
                  <div>
                    <span className="text-[11px] text-slate-400 block">Address</span>
                    <span className="text-slate-600">{manager.branchId.address}</span>
                  </div>
                )}
                {manager.branchId?.phone && (
                  <div>
                    <span className="text-[11px] text-slate-400 block">Branch Contact</span>
                    <span className="text-slate-600">{manager.branchId.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Supervising Library Admin</h3>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">Organization</span>
                  <strong className="text-slate-800 text-sm font-bold">
                    {manager.adminId?.organizationName || 'Library'}
                  </strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Admin Name</span>
                  <span className="text-slate-700 font-semibold">{manager.adminId?.name}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Contact Info</span>
                  <span className="text-slate-600">{manager.adminId?.email} • {manager.adminId?.phone}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Students Managed */}
        {activeTab === 'students' && (
          <div className="flex flex-col gap-2.5">
            {students?.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-400">
                No students enrolled in this manager's branch yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {students?.map((st: any) => (
                  <div
                    key={st._id}
                    onClick={() => navigate(`/superadmin/users/${st._id}`)}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{st.name}</h4>
                      <span className="text-[11px] text-slate-400 truncate block">{st.phone}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {st.entryStatus || 'ACTIVE'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Permissions */}
        {activeTab === 'permissions' && (
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Configured Role Capabilities
            </h3>
            {permissions ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {Object.entries(permissions.toObject ? permissions.toObject() : permissions)
                  .filter(([k]) => !['_id', 'managerId', 'adminId', 'createdAt', 'updatedAt', '__v'].includes(k))
                  .map(([perm, val]) => (
                    <div
                      key={perm}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                    >
                      <span className="font-semibold text-slate-700 capitalize">
                        {perm.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          val ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {val ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 text-xs text-slate-500">
                Standard branch operator permissions applied by organization admin.
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Login History */}
        {activeTab === 'sessions' && (
          <div className="flex flex-col gap-2.5">
            {sessions?.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
                No session logs recorded
              </div>
            ) : (
              sessions?.map((sess: any) => (
                <div
                  key={sess._id}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        sess.isValid ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    />
                    <div className="min-w-0">
                      <span className="font-bold text-slate-800 block truncate">
                        {sess.deviceInfo?.userAgent ? sess.deviceInfo.userAgent.split(' ')[0] : 'Web Client'}
                        {sess.deviceInfo?.ip ? ` (${sess.deviceInfo.ip})` : ''}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Session created: {new Date(sess.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] font-bold text-slate-600 block">
                      Last Active: {formatRelativeTime(sess.lastActiveAt)}
                    </span>
                    <span className={`text-[9px] font-bold uppercase ${sess.isValid ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {sess.isValid ? 'Active Session' : 'Ended'}
                    </span>
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
                No activity recorded by this manager
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
    </div>
  );
};

