import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  ShieldCheck,
  Armchair,
  Layers,
  CreditCard,
  MessageSquare,
  Activity,
  Settings,
  Clock,
  Receipt,
  UserCheck,
  Bell,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

export const DesktopNav: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  let items: NavItem[] = [];

  if (user.role === 'SUPER_ADMIN') {
    items = [
      { label: 'Dashboard', path: '/superadmin', icon: LayoutDashboard },
      { label: 'Libraries', path: '/superadmin/admins', icon: Users },
      { label: 'Branches', path: '/superadmin/branches', icon: Building2 },
      { label: 'Managers', path: '/superadmin/managers', icon: ShieldCheck },
      { label: 'Students', path: '/superadmin/users', icon: UserCheck },
      { label: 'SaaS Plans', path: '/superadmin/plans', icon: Layers },
      { label: 'Payments', path: '/superadmin/payments', icon: CreditCard },
      { label: 'WA Templates', path: '/superadmin/templates', icon: MessageSquare },
      { label: 'Activity Logs', path: '/superadmin/activity', icon: Activity },
      { label: 'Settings', path: '/superadmin/settings', icon: Settings },
    ];
  } else if (user.role === 'ADMIN') {
    items = [
      { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      { label: 'Branches', path: '/admin/branches', icon: Building2 },
      { label: 'Managers', path: '/admin/managers', icon: ShieldCheck },
      { label: 'Seats', path: '/admin/seats', icon: Armchair },
      { label: 'Students', path: '/admin/users', icon: Users },
      { label: 'Plans', path: '/admin/plans', icon: Layers },
      { label: 'Payments', path: '/admin/payments', icon: CreditCard },
      { label: 'Reminders', path: '/admin/reminders', icon: MessageSquare },
      { label: 'Queue', path: '/admin/queue', icon: Clock },
      { label: 'Expenses', path: '/admin/expenses', icon: Receipt },
      { label: 'Audit', path: '/admin/audit', icon: Activity },
      { label: 'Settings', path: '/admin/settings', icon: Settings },
    ];
  } else if (user.role === 'MANAGER') {
    items = [
      { label: 'Dashboard', path: '/manager', icon: LayoutDashboard },
      { label: 'Students', path: '/manager/users', icon: Users },
      { label: 'Seats', path: '/manager/seats', icon: Armchair },
      { label: 'Queue', path: '/manager/queue', icon: Clock },
      { label: 'Expenses', path: '/manager/expenses', icon: Receipt },
    ];
  } else if (user.role === 'USER') {
    items = [
      { label: 'Dashboard', path: '/user/dashboard', icon: LayoutDashboard },
      { label: 'Subscription', path: '/user/subscription', icon: CreditCard },
      { label: 'My Seat', path: '/user/seat', icon: Armchair },
      { label: 'Alerts', path: '/user/notifications', icon: Bell },
      { label: 'Profile', path: '/user/profile', icon: UserIcon },
    ];
  }

  return (
    <nav className="hidden md:flex items-center gap-1 overflow-x-auto px-4 py-2 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-[57px] z-30 shadow-xs">
      <div className="flex items-center gap-1.5 min-w-max mx-auto max-w-7xl w-full">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/' &&
              item.path !== '/superadmin' &&
              item.path !== '/admin' &&
              item.path !== '/manager' &&
              item.path !== '/user/dashboard' &&
              location.pathname.startsWith(item.path));

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

