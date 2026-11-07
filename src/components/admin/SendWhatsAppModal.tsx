import React, { useEffect, useState } from 'react';
import { X, MessageSquare, Send, CheckCircle2, AlertTriangle, ExternalLink, Sparkles, Filter, Edit3 } from 'lucide-react';
import { api } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.js';
import { useAuth } from '../../context/AuthContext.js';

interface SendWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  onSuccess?: () => void;
}

export const SendWhatsAppModal: React.FC<SendWhatsAppModalProps> = ({
  isOpen,
  onClose,
  student,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('');
  const [editableMessage, setEditableMessage] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ waLink?: string; messageText?: string } | null>(null);

  // Compute student values for placeholder substitution
  const getSubstitutedMessage = (templateString: string) => {
    if (!student || !templateString) return '';

    const now = new Date();
    const expiry = student.planEndDate ? new Date(student.planEndDate) : null;
    let remainingDays = 0;
    if (expiry) {
      const diffMs = expiry.getTime() - now.getTime();
      remainingDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    const libraryName = user?.organizationName || 'Library';

    const replacements: Record<string, string> = {
      student_name: student.name || 'Student',
      studentname: student.name || 'Student',
      student_phone: student.phone || '',
      studentphone: student.phone || '',
      institute_name: libraryName,
      institutename: libraryName,
      libraryname: libraryName,
      branch_name: student.branchId?.name || 'Main Branch',
      branchname: student.branchId?.name || 'Main Branch',
      batch_name: student.batchId?.name || 'Standard Batch',
      batchname: student.batchId?.name || 'Standard Batch',
      seat_number: student.currentSeat?.seatNumber ? String(student.currentSeat.seatNumber) : 'Unassigned',
      seatnumber: student.currentSeat?.seatNumber ? String(student.currentSeat.seatNumber) : 'Unassigned',
      expiry_date: expiry ? expiry.toLocaleDateString() : 'N/A',
      expirydate: expiry ? expiry.toLocaleDateString() : 'N/A',
      remaining_days: String(remainingDays),
      remainingdays: String(remainingDays),
      subscription_status: student.entryStatus || 'ACTIVE',
      subscriptionstatus: student.entryStatus || 'ACTIVE',
      payment_amount: student.currentPlan?.price ? `₹${student.currentPlan.price}` : '',
      paymentamount: student.currentPlan?.price ? `₹${student.currentPlan.price}` : '',
      renewal_date: new Date().toLocaleDateString(),
      renewaldate: new Date().toLocaleDateString(),
      admin_name: user?.name || 'Administrator',
      adminname: user?.name || 'Administrator',
      custom_message: '',
      custommessage: '',
    };

    let text = templateString;

    // Replace {{key}}
    text = text.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
      const lower = key.toLowerCase();
      return replacements[lower] !== undefined ? replacements[lower] : '';
    });

    // Replace {key}
    text = text.replace(/\{\s*([a-zA-Z0-9_]+)\s*\}/g, (_, key) => {
      const lower = key.toLowerCase();
      return replacements[lower] !== undefined ? replacements[lower] : '';
    });

    // Clean extra whitespace
    return text.replace(/[ \t]{2,}/g, ' ').trim();
  };

  useEffect(() => {
    if (!isOpen) return;
    setResult(null);
    api
      .get<{ success: boolean; templates: any[] }>('/admin/whatsapp/templates')
      .then((res) => {
        if (res.success && res.templates && res.templates.length > 0) {
          setTemplates(res.templates);
          const firstKey = res.templates[0].key || res.templates[0].id;
          setSelectedTemplateKey(firstKey);
          setEditableMessage(getSubstitutedMessage(res.templates[0].template));
        }
      })
      .catch((err) => console.error(err));
  }, [isOpen, student]);

  if (!isOpen || !student) return null;

  const handleTemplateChange = (key: string) => {
    setSelectedTemplateKey(key);
    const tmpl = templates.find((t) => (t.key || t.id) === key);
    if (tmpl) {
      setEditableMessage(getSubstitutedMessage(tmpl.template));
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editableMessage.trim()) return;

    try {
      setIsLoading(true);
      const res = await api.post<{
        success: boolean;
        message: string;
        waLink: string;
        messageText: string;
      }>('/admin/whatsapp/send', {
        userId: student._id,
        templateKey: selectedTemplateKey,
        rawTemplate: editableMessage,
        customMessage: editableMessage,
      });

      // Construct direct fallback WhatsApp link if needed
      let waLink = res.waLink;
      if (!waLink) {
        let phone = (student.whatsappNumber || student.phone || '').replace(/\D/g, '');
        if (phone.length === 10) phone = '91' + phone;
        waLink = `https://wa.me/${phone}?text=${encodeURIComponent(editableMessage)}`;
      }

      setResult({ waLink, messageText: editableMessage });
      showToast('WhatsApp notice prepared! Click to open chat.', 'success');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      showToast(err.message || 'Failed to prepare WhatsApp message (Quota limit reached?)', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTemplates = templates.filter((t) => {
    if (categoryFilter && t.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-emerald-600 text-white shadow-xs">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Send WhatsApp Message</h3>
              <p className="text-[11px] text-slate-500">
                To: <strong>{student.name}</strong> ({student.phone})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {result ? (
          <div className="p-6 space-y-4 text-xs text-center flex-1 overflow-y-auto">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900">Message Ready to Send!</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Review your final personalized text below before opening WhatsApp.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed shadow-inner">
              {result.messageText}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              {result.waLink && (
                <a
                  href={result.waLink}
                  target="_blank"
                  rel="noreferrer"
                  onClick={onClose}
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open WhatsApp & Send</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => setResult(null)}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-all"
              >
                Back to Edit
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend} className="p-5 space-y-3.5 text-xs flex-1 overflow-y-auto">
            {/* Category Filter */}
            <div className="flex items-center justify-between gap-2">
              <label className="font-bold text-slate-700 text-xs">Choose Notification Template:</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-[11px] font-semibold px-2 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700"
              >
                <option value="">All Categories</option>
                <option value="EXPIRY">Expiry Notices</option>
                <option value="BILLING">Billing & Reminders</option>
                <option value="SUBSCRIPTION">Subscriptions</option>
                <option value="ALLOCATION">Seat & Batch Shifts</option>
                <option value="ENROLLMENT">Enrollment</option>
                <option value="ANNOUNCEMENT">Announcements</option>
                <option value="GENERAL">General</option>
              </select>
            </div>

            {/* Template Selection Dropdown or Radio */}
            <div>
              <select
                value={selectedTemplateKey}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-slate-800 text-xs shadow-xs focus:bg-white transition-all"
              >
                {filteredTemplates.map((t) => (
                  <option key={t.key || t.id} value={t.key || t.id}>
                    {t.name || t.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Live Message Preview & Customizer */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Preview & Edit Message Before Sending:</span>
                </label>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3" /> Auto-populated
                </span>
              </div>
              <textarea
                rows={5}
                value={editableMessage}
                onChange={(e) => setEditableMessage(e.target.value)}
                placeholder="Message will appear here with student details filled in..."
                className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed shadow-xs focus:bg-white focus:border-emerald-500 transition-all outline-none"
                required
              />
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/70 text-amber-900 border border-amber-200 text-[11px] leading-relaxed">
              💡 The message above has been pre-filled with <strong>{student.name}</strong>'s current desk, batch, and expiry details. You can tweak the wording before opening WhatsApp.
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !editableMessage.trim()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Preparing Message...' : 'Preview & Open WhatsApp'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
