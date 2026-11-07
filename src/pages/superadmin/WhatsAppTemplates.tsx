import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Search,
  Sparkles,
  Copy,
  Info,
} from 'lucide-react';
import { api } from '../../api/client.js';
import { Header } from '../../components/common/Header.js';
import { SkeletonLoader } from '../../components/reactbits/SkeletonLoader.js';
import { SEO } from '../../components/common/SEO.js';
import { useToast } from '../../context/ToastContext.js';

const AVAILABLE_VARIABLES = [
  { key: 'student_name', label: 'Student Name', sample: 'Rahul Sharma' },
  { key: 'student_phone', label: 'Student Phone', sample: '+91 9876543210' },
  { key: 'institute_name', label: 'Institute Name', sample: 'Apex Study Library' },
  { key: 'branch_name', label: 'Branch Name', sample: 'Central Campus' },
  { key: 'seat_number', label: 'Seat Number', sample: 'A-12' },
  { key: 'batch_name', label: 'Batch Name', sample: 'Morning Batch (06:00 - 14:00)' },
  { key: 'expiry_date', label: 'Expiry Date', sample: '25 Nov 2026' },
  { key: 'remaining_days', label: 'Remaining Days', sample: '3' },
  { key: 'payment_amount', label: 'Payment Amount', sample: '₹999' },
  { key: 'subscription_status', label: 'Subscription Status', sample: 'ACTIVE' },
  { key: 'renewal_date', label: 'Renewal Date', sample: '08 Nov 2026' },
  { key: 'admin_name', label: 'Admin Name', sample: 'Vikram Singh' },
  { key: 'custom_message', label: 'Custom Message', sample: 'Please check the notice board.' },
];

export const WhatsAppTemplates: React.FC = () => {
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');

  // Create / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [form, setForm] = useState({
    name: '',
    key: '',
    category: 'GENERAL',
    template: '',
    description: '',
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Preview Modal
  const [previewTemplate, setPreviewTemplate] = useState<any | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ success: boolean; templates: any[] }>('/superadmin/templates');
      if (res.success) {
        setTemplates(res.templates || []);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setForm({
      name: '',
      key: '',
      category: 'GENERAL',
      template: 'Dear {{student_name}}, reminder from {{institute_name}}...',
      description: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: any) => {
    setEditingTemplate(t);
    setForm({
      name: t.name || '',
      key: t.key || '',
      category: t.category || 'GENERAL',
      template: t.template || '',
      description: t.description || '',
      isActive: t.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleInsertVariable = (varKey: string) => {
    setForm((prev) => ({
      ...prev,
      template: `${prev.template} {{${varKey}}}`,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingTemplate) {
        const res = await api.patch<{ success: boolean; template: any }>(
          `/superadmin/templates/${editingTemplate._id}`,
          form
        );
        if (res.success) {
          showToast('Template updated successfully', 'success');
          setIsModalOpen(false);
          fetchTemplates();
        }
      } else {
        const res = await api.post<{ success: boolean; template: any }>(
          '/superadmin/templates',
          form
        );
        if (res.success) {
          showToast('Template created successfully', 'success');
          setIsModalOpen(false);
          fetchTemplates();
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save template', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (t: any) => {
    try {
      const res = await api.patch<{ success: boolean; template: any }>(
        `/superadmin/templates/${t._id}`,
        { isActive: !t.isActive }
      );
      if (res.success) {
        showToast(`Template ${!t.isActive ? 'enabled' : 'disabled'}`, 'info');
        fetchTemplates();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update template', 'error');
    }
  };

  const handleDelete = async (t: any) => {
    if (t.isSystem) {
      showToast('System preset templates cannot be deleted. You can disable them instead.', 'info');
      return;
    }
    if (!confirm(`Are you sure you want to delete template "${t.name}"?`)) return;

    try {
      const res = await api.delete<{ success: boolean; message: string }>(
        `/superadmin/templates/${t._id}`
      );
      if (res.success) {
        showToast('Template deleted successfully', 'success');
        fetchTemplates();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete template', 'error');
    }
  };

  // Render preview with sample data
  const renderSamplePreview = (templateStr: string) => {
    let result = templateStr;
    AVAILABLE_VARIABLES.forEach((v) => {
      const reg = new RegExp(`\\{\\{?\\s*${v.key}\\s*\\}?\\}`, 'gi');
      result = result.replace(reg, v.sample);
    });
    return result;
  };

  const filteredTemplates = templates.filter((t) => {
    if (categoryFilter && t.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchName = t.name?.toLowerCase().includes(q);
      const matchKey = t.key?.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      return matchName || matchKey || matchDesc;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen pb-12">
      <SEO
        title="WhatsApp Message Templates - Super Admin"
        description="Manage and customize official WhatsApp notifications, dynamic placeholders, and auto-reminders."
      />
      <Header
        title="WhatsApp Templates"
        subtitle="Manage Reusable Message Presets & Variables"
        showBack
        rightAction={
          <button
            onClick={handleOpenCreate}
            className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Template</span>
          </button>
        }
      />

      <div className="max-w-6xl mx-auto w-full p-4 flex flex-col gap-4">
        {/* Search & Categories Bar */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates by name, key, description..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2.5 text-xs rounded-2xl bg-slate-50 border border-slate-200 font-semibold text-slate-700"
            >
              <option value="">All Categories ({templates.length})</option>
              <option value="EXPIRY">Expiry Notices</option>
              <option value="BILLING">Billing & Reminders</option>
              <option value="SUBSCRIPTION">Subscription Cycles</option>
              <option value="ALLOCATION">Seat & Batch Shifts</option>
              <option value="ENROLLMENT">Admissions & Welcome</option>
              <option value="ANNOUNCEMENT">Announcements</option>
              <option value="GENERAL">General Custom</option>
            </select>
          </div>
        </div>

        {/* Supported Variables Quick Guide */}
        <div className="p-4 rounded-3xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 text-xs">
          <div className="flex items-center gap-2 mb-2 font-bold text-emerald-800">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Supported Dynamic Variables:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {AVAILABLE_VARIABLES.map((v) => (
              <span
                key={v.key}
                className="px-2 py-0.5 rounded-lg bg-white/90 border border-emerald-300 font-mono text-[11px] text-emerald-800"
              >
                {`{{${v.key}}}`}
              </span>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">No Templates Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No message templates matched your query. Click "Create Template" to add one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredTemplates.map((t) => (
              <div
                key={t._id}
                className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{t.name}</h4>
                        {t.isSystem && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            Preset
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">{t.key}</span>
                    </div>

                    <button
                      onClick={() => handleToggleActive(t)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider transition-all ${
                        t.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {t.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </div>

                  {t.description && (
                    <p className="text-[11px] text-slate-500 mb-2 italic">{t.description}</p>
                  )}

                  {/* Template Text preview */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-mono leading-relaxed line-clamp-4 whitespace-pre-wrap mb-3">
                    {t.template}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setPreviewTemplate(t)}
                    className="text-slate-500 hover:text-blue-600 font-bold flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(t)}
                      className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-all"
                      title="Edit template"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    {!t.isSystem && (
                      <button
                        onClick={() => handleDelete(t)}
                        className="p-1.5 rounded-xl hover:bg-rose-50 text-rose-600 transition-all"
                        title="Delete template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Template Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {editingTemplate ? 'Edit WhatsApp Template' : 'Create New WhatsApp Template'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Configure template content and dynamic placeholder variables.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Template Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Plan Renewal Reminder"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Unique Key</label>
                  <input
                    type="text"
                    value={form.key}
                    onChange={(e) => setForm((p) => ({ ...p, key: e.target.value }))}
                    placeholder="Auto-generated if empty"
                    disabled={editingTemplate?.isSystem}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 uppercase font-mono disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold"
                  >
                    <option value="EXPIRY">EXPIRY</option>
                    <option value="BILLING">BILLING</option>
                    <option value="SUBSCRIPTION">SUBSCRIPTION</option>
                    <option value="ALLOCATION">ALLOCATION</option>
                    <option value="ENROLLMENT">ENROLLMENT</option>
                    <option value="ANNOUNCEMENT">ANNOUNCEMENT</option>
                    <option value="GENERAL">GENERAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="When should this notification be triggered..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Message Template Text *</label>
                  <span className="text-[10px] text-slate-400">Click chips below to insert</span>
                </div>
                <textarea
                  rows={4}
                  value={form.template}
                  onChange={(e) => setForm((p) => ({ ...p, template: e.target.value }))}
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs leading-relaxed"
                  required
                />
              </div>

              {/* Variable Chips Inserter */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Click to Insert Dynamic Placeholder:
                </span>
                <div className="flex flex-wrap gap-1">
                  {AVAILABLE_VARIABLES.map((v) => (
                    <button
                      key={v.key}
                      type="button"
                      onClick={() => handleInsertVariable(v.key)}
                      className="px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-mono text-[10px] border border-blue-200 active:scale-95 transition-all"
                    >
                      + {`{{${v.key}}}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Inside Modal */}
              <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Live Sample Preview:
                </span>
                <p className="text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed">
                  {renderSamplePreview(form.template)}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{previewTemplate.name}</h3>
                <span className="text-[10px] text-slate-400 font-mono">{previewTemplate.key}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Raw Template (Stored in DB):
                </span>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700 whitespace-pre-wrap">
                  {previewTemplate.template}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase block mb-1">
                  Sample Rendered Message for WhatsApp:
                </span>
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 font-mono text-xs text-slate-800 whitespace-pre-wrap">
                  {renderSamplePreview(previewTemplate.template)}
                </div>
              </div>
            </div>

            <button
              onClick={() => setPreviewTemplate(null)}
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

