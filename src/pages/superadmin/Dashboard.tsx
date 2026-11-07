import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  Layers,
  CreditCard,
  IndianRupee,
  Activity,
  PlusCircle,
  Settings,
  ShieldCheck,
  CheckCircle,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { api } from '../../api/client.js';
import { Header } from '../../components/common/Header.js';
import { SpotlightCard } from '../../components/reactbits/SpotlightCard.js';
import { AnimatedCounter } from '../../components/reactbits/AnimatedCounter.js';
import { PulseBadge } from '../../components/reactbits/PulseBadge.js';
import { SkeletonLoader } from '../../components/reactbits/SkeletonLoader.js';
import { SEO } from '../../components/common/SEO.js';
import { humanizeActivity } from '../../utils/activityFormatter.js';

export const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ success: boolean; metrics: any }>('/superadmin/metrics')
      .then((res) => {
        if (res.success) setMetrics(res.metrics);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <SEO
        title="Super Admin Dashboard"
        description="Platform command center for managing library organizations, subscriptions, payments, and system health."
      />
      <Header
        title="Super Admin"
        subtitle="Platform Overview & Control"
        rightAction={
          <button
            onClick={() => navigate('/superadmin/settings')}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-all active:scale-95"
            title="UPI / QR Payment Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        }
      />

      <div className="p-4 flex flex-col gap-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
          </div>
        ) : (
          <>
            {/* Top Revenue Spotlight Card (Clickable) */}
            <SpotlightCard
              onClick={() => navigate('/superadmin/payments')}
              className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-ios-lg cursor-pointer hover:shadow-xl transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Total Revenue</span>
                  <span className="text-[10px] text-slate-400 group-hover:text-white transition-colors">
                    (Click to inspect payments →)
                  </span>
                </span>
                <span className="p-1.5 rounded-xl bg-white/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-all">
                  <IndianRupee className="w-4 h-4" />
                </span>
              </div>
              <div className="text-3xl font-extrabold tracking-tight text-white mb-2">
                <AnimatedCounter value={metrics?.totalRevenue || 0} prefix="₹" />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-slate-300">
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/superadmin/payments?status=APPROVED');
                  }}
                  className="hover:text-emerald-300 hover:underline cursor-pointer"
                >
                  Approved Payments: {metrics?.approvedPayments || 0}
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/superadmin/payments?status=PENDING');
                  }}
                  className="text-amber-300 font-semibold hover:text-amber-200 hover:underline cursor-pointer"
                >
                  Pending: {metrics?.pendingPayments || 0}
                </span>
              </div>
            </SpotlightCard>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => navigate('/superadmin/plans/new')}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200 shadow-ios active:scale-95 hover:border-blue-300 transition-all text-left"
              >
                <div className="p-2 rounded-xl bg-blue-50 text-ios-blue">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900">Create Plan</span>
                  <span className="text-[10px] text-slate-400">Pricing & Quotas</span>
                </div>
              </button>

              <button
                onClick={() => navigate('/superadmin/payments')}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200 shadow-ios active:scale-95 hover:border-amber-300 transition-all text-left"
              >
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 relative">
                  <CreditCard className="w-5 h-5" />
                  {metrics?.pendingPayments > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900">Review Pay</span>
                  <span className="text-[10px] text-amber-600 font-semibold">
                    {metrics?.pendingPayments} Pending
                  </span>
                </div>
              </button>

              <button
                onClick={() => navigate('/superadmin/templates')}
                className="col-span-2 sm:col-span-1 flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200 shadow-ios active:scale-95 hover:border-emerald-300 transition-all text-left"
              >
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900">WA Templates</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">17 Presets Ready</span>
                </div>
              </button>
            </div>

            {/* Platform Stats Grid - Fully Interactive */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <SpotlightCard
                onClick={() => navigate('/superadmin/admins')}
                className="cursor-pointer hover:border-blue-400 hover:shadow-md active:scale-95 transition-all group"
              >
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-semibold text-slate-500 group-hover:text-blue-600 transition-colors">
                    Libraries
                  </span>
                  <div className="p-1 rounded-lg bg-blue-50 text-ios-blue group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  <AnimatedCounter value={metrics?.totalAdmins || 0} />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    {metrics?.activeAdmins || 0} Active
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </SpotlightCard>

              <SpotlightCard
                onClick={() => navigate('/superadmin/branches')}
                className="cursor-pointer hover:border-purple-400 hover:shadow-md active:scale-95 transition-all group"
              >
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-semibold text-slate-500 group-hover:text-purple-600 transition-colors">
                    Total Branches
                  </span>
                  <div className="p-1 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  <AnimatedCounter value={metrics?.totalBranches || 0} />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-slate-400 font-medium">Physical Centers</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </SpotlightCard>

              <SpotlightCard
                onClick={() => navigate('/superadmin/managers')}
                className="cursor-pointer hover:border-indigo-400 hover:shadow-md active:scale-95 transition-all group"
              >
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-semibold text-slate-500 group-hover:text-indigo-600 transition-colors">
                    Staff / Managers
                  </span>
                  <div className="p-1 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  <AnimatedCounter value={metrics?.totalManagers || 0} />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-slate-400 font-medium">Branch Operators</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </SpotlightCard>

              <SpotlightCard
                onClick={() => navigate('/superadmin/users')}
                className="cursor-pointer hover:border-emerald-400 hover:shadow-md active:scale-95 transition-all group"
              >
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-semibold text-slate-500 group-hover:text-emerald-600 transition-colors">
                    Students / Users
                  </span>
                  <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  <AnimatedCounter value={metrics?.totalUsers || 0} />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-slate-400 font-medium">Enrolled Patrons</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </SpotlightCard>
            </div>

            {/* Recent Platform Activity - Human Friendly */}
            <div className="mt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Recent Platform Activity
                </span>
                <button
                  onClick={() => navigate('/superadmin/activity')}
                  className="text-xs font-semibold text-ios-blue hover:underline flex items-center gap-0.5"
                >
                  View Full Audit Log <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {metrics?.recentActivity?.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-400">
                    No recent activity logged
                  </div>
                ) : (
                  metrics?.recentActivity?.slice(0, 5).map((act: any) => {
                    const formatted = humanizeActivity(act);
                    return (
                      <div
                        key={act._id}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-center gap-3 truncate mr-2">
                          <div className={`p-2 rounded-xl flex-shrink-0 ${formatted.badgeColor}`}>
                            <Activity className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <span className="block text-xs font-bold text-slate-800 truncate">
                              {formatted.title}
                            </span>
                            <span className="text-[11px] text-slate-400 truncate block">
                              {formatted.description}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 flex-shrink-0 font-medium whitespace-nowrap">
                          {formatted.relativeTime}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
};
