import mongoose, { Document, Schema } from 'mongoose';

export type TemplateCategory =
  | 'BILLING'
  | 'REMINDER'
  | 'SUBSCRIPTION'
  | 'ALLOCATION'
  | 'ENROLLMENT'
  | 'ANNOUNCEMENT'
  | 'GENERAL';

export interface IWhatsAppTemplate extends Document {
  name: string;
  key: string;
  category: TemplateCategory;
  template: string;
  variables: string[];
  description?: string;
  isActive: boolean;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WhatsAppTemplateSchema = new Schema<IWhatsAppTemplate>(
  {
    name: { type: String, required: true, trim: true },
    key: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    category: {
      type: String,
      enum: ['BILLING', 'REMINDER', 'SUBSCRIPTION', 'ALLOCATION', 'ENROLLMENT', 'ANNOUNCEMENT', 'GENERAL'],
      default: 'GENERAL',
      index: true,
    },
    template: { type: String, required: true },
    variables: { type: [String], default: [] },
    description: { type: String },
    isActive: { type: Boolean, default: true, index: true },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

WhatsAppTemplateSchema.index({ category: 1, isActive: 1 });

export const WhatsAppTemplate = mongoose.model<IWhatsAppTemplate>('WhatsAppTemplate', WhatsAppTemplateSchema);

