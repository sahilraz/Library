export interface FormattedActivity {
  title: string;
  description: string;
  actor: string;
  actorRole: string;
  category: 'AUTH' | 'STUDENT' | 'SEAT' | 'BATCH' | 'PAYMENT' | 'SUBSCRIPTION' | 'WHATSAPP' | 'SETTINGS' | 'SYSTEM';
  badgeColor: string;
  iconName: string;
  formattedDate: string;
  relativeTime: string;
  changes?: { label: string; from?: string; to?: string; value?: string }[];
  rawMetadata?: any;
}

export function formatRelativeTime(dateInput: string | Date): string {
  const date = new Date(dateInput);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export function humanizeActivity(log: any): FormattedActivity {
  const action = log.action || '';
  const actorName = log.actorName || 'User';
  const actorRole = (log.actorRole || '').replace(/_/g, ' ');
  const meta = log.metadata || {};
  const date = new Date(log.createdAt || Date.now());

  const formattedDate = date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const relativeTime = formatRelativeTime(date);

  let title = 'System Activity';
  let description = `Action performed by ${actorName}`;
  let category: FormattedActivity['category'] = 'SYSTEM';
  let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
  let iconName = 'Activity';
  const changes: FormattedActivity['changes'] = [];

  switch (action) {
    case 'AUTH_LOGIN_SUCCESS':
    case 'LOGIN':
    case 'USER_LOGIN':
      title = `${actorName} logged in successfully`;
      description = `Session started via ${meta.device || 'web application'}`;
      category = 'AUTH';
      badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
      iconName = 'LogIn';
      break;

    case 'AUTH_LOGOUT':
    case 'LOGOUT':
      title = `${actorName} logged out`;
      description = 'Session closed safely';
      category = 'AUTH';
      badgeColor = 'bg-slate-100 text-slate-600 border-slate-200';
      iconName = 'LogOut';
      break;

    case 'STUDENT_CREATED':
    case 'USER_CREATED': {
      const studentName = meta.studentName || meta.name || 'New Student';
      title = `New student ${studentName} was enrolled`;
      description = `Enrolled by ${actorName}${meta.seat ? ` with Seat #${meta.seat}` : ''}${meta.batch ? ` in ${meta.batch}` : ''}`;
      category = 'STUDENT';
      badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      iconName = 'UserPlus';
      if (meta.seat) changes.push({ label: 'Assigned Seat', value: `#${meta.seat}` });
      if (meta.batch) changes.push({ label: 'Batch', value: meta.batch });
      if (meta.planPrice) changes.push({ label: 'Fee', value: `₹${meta.planPrice}` });
      break;
    }

    case 'STUDENT_UPDATED':
    case 'USER_UPDATED': {
      const studentName = meta.studentName || 'Student';
      title = `${studentName}'s student details were updated`;
      description = `Profile updated by ${actorName}`;
      category = 'STUDENT';
      badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
      iconName = 'UserCheck';
      if (meta.phone) changes.push({ label: 'Phone', value: meta.phone });
      break;
    }

    case 'STUDENT_DELETED':
    case 'USER_DELETED': {
      const studentName = meta.studentName || 'Student';
      title = `Student record for ${studentName} was removed`;
      description = `Deleted by ${actorName}`;
      category = 'STUDENT';
      badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
      iconName = 'UserX';
      break;
    }

    case 'SEAT_ASSIGNMENT_CHANGED':
    case 'SEAT_CHANGED': {
      const studentName = meta.studentName || 'Student';
      const oldSeat = meta.oldSeat || 'None';
      const newSeat = meta.newSeat || 'New Seat';
      title = `Seat allocation changed for ${studentName}`;
      description = `Assigned seat moved from #${oldSeat} to #${newSeat}`;
      category = 'SEAT';
      badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      iconName = 'Armchair';
      changes.push({ label: 'Seat Relocation', from: `#${oldSeat}`, to: `#${newSeat}` });
      break;
    }

    case 'SEAT_CREATED': {
      title = `Seat #${meta.seatNumber || ''} created`;
      description = `Added to library capacity by ${actorName}`;
      category = 'SEAT';
      badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      iconName = 'Armchair';
      break;
    }

    case 'SEAT_DELETED': {
      title = `Seat #${meta.seatNumber || ''} deleted`;
      description = `Removed from library by ${actorName}`;
      category = 'SEAT';
      badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
      iconName = 'Trash2';
      break;
    }

    case 'BATCH_CHANGED': {
      const studentName = meta.studentName || 'Student';
      title = `Batch schedule updated for ${studentName}`;
      description = `Moved from ${meta.oldBatch || 'Previous'} to ${meta.newBatch || 'New Batch'}`;
      category = 'BATCH';
      badgeColor = 'bg-purple-50 text-purple-700 border-purple-200';
      iconName = 'Clock';
      changes.push({ label: 'Batch Shift', from: meta.oldBatch, to: meta.newBatch });
      break;
    }

    case 'EXPIRY_EXTENDED': {
      const studentName = meta.studentName || 'Student';
      title = `Subscription extended for ${studentName}`;
      description = `Granted extension by ${actorName}${meta.newExpiry ? ` until ${new Date(meta.newExpiry).toLocaleDateString()}` : ''}`;
      category = 'SUBSCRIPTION';
      badgeColor = 'bg-teal-50 text-teal-700 border-teal-200';
      iconName = 'Calendar';
      if (meta.newExpiry) changes.push({ label: 'New Expiry', value: new Date(meta.newExpiry).toLocaleDateString() });
      break;
    }

    case 'SUBSCRIPTION_CANCELLED': {
      const studentName = meta.studentName || 'Student';
      title = `Subscription cancelled for ${studentName}`;
      description = `Membership terminated and seat released by ${actorName}`;
      category = 'SUBSCRIPTION';
      badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
      iconName = 'XCircle';
      if (meta.reason) changes.push({ label: 'Reason', value: meta.reason });
      break;
    }

    case 'USER_PLAN_RENEWED':
    case 'PLAN_RENEWED': {
      const studentName = meta.studentName || 'Student';
      title = `${studentName}'s membership plan was renewed`;
      description = `Renewed until ${meta.expiresAt ? new Date(meta.expiresAt).toLocaleDateString() : 'next cycle'} (₹${meta.amount || 0})`;
      category = 'SUBSCRIPTION';
      badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      iconName = 'RefreshCw';
      if (meta.amount) changes.push({ label: 'Renewal Fee', value: `₹${meta.amount}` });
      break;
    }

    case 'PLAN_PURCHASED':
    case 'SAAS_PLAN_PURCHASED': {
      title = `SaaS Plan "${meta.planName || ''}" purchased`;
      description = `Purchased by ${actorName} for ₹${meta.amount || 0}`;
      category = 'PAYMENT';
      badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      iconName = 'CreditCard';
      if (meta.amount) changes.push({ label: 'Amount', value: `₹${meta.amount}` });
      break;
    }

    case 'PAYMENT_APPROVED': {
      title = `Payment of ₹${meta.amount || ''} approved`;
      description = `Reviewed and activated by ${actorName}`;
      category = 'PAYMENT';
      badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      iconName = 'CheckCircle';
      break;
    }

    case 'PAYMENT_REJECTED': {
      title = `Payment verification rejected`;
      description = `Reason: ${meta.reason || 'Verification incomplete'}`;
      category = 'PAYMENT';
      badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
      iconName = 'AlertTriangle';
      break;
    }

    case 'WHATSAPP_ALERT_SENT': {
      const studentName = meta.studentName || 'Student';
      title = `WhatsApp alert sent to ${studentName}`;
      description = `Template: ${meta.templateKey || 'Notice'} via ${actorName}`;
      category = 'WHATSAPP';
      badgeColor = 'bg-green-50 text-green-700 border-green-200';
      iconName = 'MessageSquare';
      break;
    }

    case 'BRANCH_CREATED': {
      title = `New branch added: "${meta.name || 'Branch'}"`;
      description = `Established by ${actorName}`;
      category = 'SETTINGS';
      badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
      iconName = 'Building2';
      break;
    }

    case 'MANAGER_CREATED': {
      title = `New staff manager appointed: ${meta.name || ''}`;
      description = `Account created by ${actorName}`;
      category = 'SETTINGS';
      badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      iconName = 'ShieldCheck';
      break;
    }

    case 'MANAGER_PERMISSIONS_UPDATED': {
      title = `Staff manager permissions updated`;
      description = `Modified by ${actorName}`;
      category = 'SETTINGS';
      badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
      iconName = 'Sliders';
      break;
    }

    case 'ADMIN_STATUS_UPDATED': {
      title = `Library organization status changed to ${meta.status || ''}`;
      description = `Updated by Platform Owner`;
      category = 'SETTINGS';
      badgeColor = 'bg-purple-50 text-purple-700 border-purple-200';
      iconName = 'Shield';
      break;
    }

    default: {
      const readableAction = action
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/(^\w{1})|(\s+\w{1})/g, (letter: string) => letter.toUpperCase());
      title = readableAction;
      description = `Performed by ${actorName} (${actorRole})`;
      break;
    }
  }

  return {
    title,
    description,
    actor: actorName,
    actorRole,
    category,
    badgeColor,
    iconName,
    formattedDate,
    relativeTime,
    changes: changes.length > 0 ? changes : undefined,
    rawMetadata: meta,
  };
}

