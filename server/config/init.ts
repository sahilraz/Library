import bcrypt from 'bcryptjs';
import { SuperAdmin } from '../models/SuperAdmin.js';
import { PaymentConfig } from '../models/PaymentConfig.js';
import { Plan } from '../models/Plan.js';
import { WhatsAppTemplate } from '../models/WhatsAppTemplate.js';
import { ENV } from './env.js';

export const DEFAULT_WHATSAPP_TEMPLATES = [
  {
    name: 'Payment Expiring Soon',
    key: 'PAYMENT_EXPIRING_SOON',
    category: 'EXPIRY',
    template: 'Dear {{student_name}}, gentle reminder from {{institute_name}} ({{branch_name}}). Your subscription will expire on {{expiry_date}} ({{remaining_days}} days remaining). Please renew your subscription to retain your assigned Seat #{{seat_number}} ({{batch_name}}). Thank you!',
    variables: ['student_name', 'institute_name', 'branch_name', 'expiry_date', 'remaining_days', 'seat_number', 'batch_name'],
    description: 'Sent when subscription is due to expire in the coming days',
    isActive: true,
    isSystem: true,
  },
  {
    name: 'Payment Expires Today',
    key: 'PAYMENT_EXPIRES_TODAY',
    category: 'EXPIRY',
    template: 'Dear {{student_name}}, your subscription at {{institute_name}} ({{branch_name}}) expires TODAY, {{expiry_date}}. Please complete your payment of {{payment_amount}} today to ensure uninterrupted access to your seat (Seat #{{seat_number}}, {{batch_name}}).',
    variables: ['student_name', 'institute_name', 'branch_name', 'expiry_date', 'payment_amount', 'seat_number', 'batch_name'],
    description: 'Urgent reminder on the exact day of expiry',
    isActive: true,
    isSystem: true,
  },
  {
    name: 'Payment Expired',
    key: 'PAYMENT_EXPIRED',
    category: 'EXPIRY',
    template: 'Dear {{student_name}}, your membership at {{institute_name}} ({{branch_name}}) expired on {{expiry_date}}. Your assigned Seat #{{seat_number}} ({{batch_name}}) is currently on hold. Please renew immediately to reactivate your access.',
    variables: ['student_name', 'institute_name', 'branch_name', 'expiry_date', 'seat_number', 'batch_name'],
    description: 'Notice after membership has passed its expiry date',
    isActive: true,
    isSystem: true,
  },
  {
    name: 'Payment Reminder',
    key: 'PAYMENT_REMINDER',
    category: 'BILLING',
    template: 'Hello {{student_name}}, this is a friendly payment reminder from {{institute_name}} ({{branch_name}}). A payment of {{payment_amount}} is due for your subscription. Kindly complete the payment at your earliest convenience to continue enjoying our library facilities.',
    variables: ['student_name', 'institute_name', 'branch_name', 'payment_amount'],
    description: 'General reminder for pending fees or dues',
    isActive: true,
    isSystem: true,
  },
  {
    name: 'Payment Successfully Received',
    key: 'PAYMENT_RECEIVED',
    category: 'BILLING',
    template: 'Dear {{student_name}}, we have successfully received your payment of {{payment_amount}} at {{institute_name}}! Current subscription status: {{subscription_status}}. Valid through {{expiry_date}}. Thank you for your prompt payment!',
    variables: ['student_name', 'payment_amount', 'institute_name', 'subscription_status', 'expiry_date'],
    description: 'Confirmation receipt upon successful fee payment',
    isActive: true,
    isSystem: true,
  },
  {
    name: 'Subscription Renewed',
    key: 'SUBSCRIPTION_RENEWED',
    category: 'SUBSCRIPTION',
    template: 'Hello {{student_name}}, your subscription at {{institute_name}} has been successfully renewed on {{renewal_date}}! Your new expiry date is {{expiry_date}}. Seat #{{seat_number}} in {{batch_name}} is confirmed. Happy studying!',
    variables: ['student_name', 'institute_name', 'renewal_date', 'expiry_date', 'seat_number', 'batch_name'],
    description: 'Sent after student extends or renews their study plan',
    isActive: true,
    isSystem: true,
  },
  {
    name: 'Subscription Extended',
    key: 'SUBSCRIPTION_EXTENDED',
    category: 'SUBSCRIPTION',
    template: 'Dear {{student_name}}, your subscription at {{institute_name}} ({{branch_name}}) has been extended until {{expiry_date}}. You have {{remaining_days}} days remaining. Enjoy your study sessions!',
    variables: ['student_name', 'institute_name', 'branch_name', 'expiry_date', 'remaining_days'],
    description: 'Notice when subscription duration has been granted an extension',
    isActive: true,
    isSystem: true,
  },
  {
    name: 'Subscription Cancelled',
    key: 'SUBSCRIPTION_CANCELLED',
    category: 'SUBSCRIPTION',
    template: 'Hello {{student_name}}, your subscription at {{institute_name}} has been cancelled as requested. If this was done in error or you wish to re-enroll in the future, please contact {{admin_name}}.',
    variables: ['student_name', 'institute_name', 'admin_name'],
    description: 'Confirmation of subscription cancellation',
    isActive: true,
    isSystem: true,
  },
  {
    name: 'Subscription Suspended',
    key: 'SUBSCRIPTION_SUSPENDED',
    category: 'SUBSCRIPTION',
    template: 'Dear {{student_name}}, your subscription at {{institute_name}} has been temporarily suspended. Please contact {{admin_name}} or visit the front desk for more information.',
    variables: ['student_name', 'institute_name', 'admin_name'],
    description: 'Notice of temporary account hold or suspension',
    isActive: true,
    isSystem: true,
  },
  {
    name: 'Subscription Reactivated',
    key: 'SUBSCRIPTION_REACTIVATED',
    category: 'SUBSCRIPTION',
    template: 'Great news {{student_name}}! Your subscription at {{institute_name}} has been reactivated. Your membership is active until {{expiry_date}} for Seat #{{seat_number}} ({{batch_name}}). Welcome back!',
    variables: ['student_name', 'institute_name', 'expiry_date', 'seat_number', 'batch_name'],
    description: 'Notice when a paused or suspended membership is restored',
    isActive: true,
    isSystem: true,
  },
  {
    name: 'Seat Changed',
    key: 'SEAT_CHANGED',
    category: 'ALLOCATION',
    template: 'Hello {{student_name}}, your desk allocation at {{institute_name}} ({{branch_name}}) has been updated. Your newly assigned seat is Seat #{{seat_number}} for {{batch_name}}. Have a productive day!',
    variables: ['student_name', 'institute_name', 'branch_name', 'seat_number', 'batch_name'],
    description: 'Notification whenever student seat assignment is updated',
    isActive: true,
    isSystem: true,
  },
  {
    name: 'Batch Changed',
    key: 'BATCH_CHANGED',
    category: 'ALLOCATION',
    template: 'Hello {{student_name}}, your study batch at {{institute_name}} ({{branch_name}}) has been updated to {{batch_name}}. Your seat is Seat #{{seat_number}}. Please adhere to your new timing schedule.',
    variables: ['student_name', 'institute_name', 'branch_name', 'batch_name', 'seat_number'],
    description: 'Notification when student batch timing is changed',
    isActive: true,
    isSystem: true,
  },
  {
    name: 'New Student Enrollment',
    key: 'NEW_STUDENT_ENROLLMENT',
    category: 'ENROLLMENT',
    template: 'Welcome {{student_name}} to {{institute_name}}! You have been successfully enrolled in {{branch_name}} for {{batch_name}} with Seat #{{seat_number}}. Your plan is valid until {{expiry_date}}.',
    variables: ['student_name', 'institute_name', 'branch_name', 'batch_name', 'seat_number', 'expiry_date'],
    description: 'Sent right upon student registration',
    isActive: true,
    isSystem: true,
  },
  {
    name: 'Enrollment Confirmation',
    key: 'ENROLLMENT_CONFIRMATION',
    category: 'ENROLLMENT',
    template: 'Dear {{student_name}}, your enrollment confirmation at {{institute_name}} is complete. Assigned Branch: {{branch_name}}, Batch: {{batch_name}}, Seat: #{{seat_number}}, Expiry Date: {{expiry_date}}.',
    variables: ['student_name', 'institute_name', 'branch_name', 'batch_name', 'seat_number', 'expiry_date'],
    description: 'Official record summary of enrollment details',
    isActive: true,
    isSystem: true,
  },
  {
    name: 'Welcome Message',
    key: 'WELCOME_MESSAGE',
    category: 'ENROLLMENT',
    template: 'A warm welcome to {{institute_name}}, {{student_name}}! We are delighted to support your study goals at {{branch_name}}. Reach out to {{admin_name}} whenever you need assistance.',
    variables: ['institute_name', 'student_name', 'branch_name', 'admin_name'],
    description: 'Warm greeting to new library patrons',
    isActive: true,
    isSystem: true,
  },
  {
    name: 'Important Announcement',
    key: 'IMPORTANT_ANNOUNCEMENT',
    category: 'ANNOUNCEMENT',
    template: 'Important announcement from {{institute_name}} ({{branch_name}}) for all students in {{batch_name}}: {{custom_message}}. Thank you for your cooperation!',
    variables: ['institute_name', 'branch_name', 'batch_name', 'custom_message'],
    description: 'Broadcast or important notice for a branch or batch',
    isActive: true,
    isSystem: true,
  },
  {
    name: 'General Custom Message',
    key: 'GENERAL_CUSTOM',
    category: 'GENERAL',
    template: 'Hello {{student_name}}, message from {{institute_name}}: {{custom_message}}',
    variables: ['student_name', 'institute_name', 'custom_message'],
    description: 'General free-text custom message with personalized greeting',
    isActive: true,
    isSystem: true,
  },
];

export async function initializeSystem(): Promise<void> {
  try {
    // 1. Check and create default SuperAdmin
    const existingSuperAdmin = await SuperAdmin.findOne();
    if (!existingSuperAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ENV.SUPERADMIN_PASSWORD, salt);

      await SuperAdmin.create({
        name: ENV.SUPERADMIN_NAME,
        email: ENV.SUPERADMIN_EMAIL,
        password: hashedPassword,
        mustChangePassword: true,
      });
    }

    // 2. Check and create default SuperAdmin PaymentConfig
    const existingPaymentConfig = await PaymentConfig.findOne({ scope: 'SUPERADMIN' });
    if (!existingPaymentConfig) {
      await PaymentConfig.create({
        scope: 'SUPERADMIN',
        upiId: 'superadmin@upi',
        paymentName: 'Aapka Library',
        paymentInstructions: 'Transfer the plan subscription fee to the UPI ID or scan QR code. Then submit your 12-digit UTR and payment screenshot for instant account approval.',
      });
    }

    // 3. Check and create starter plans if none exist so new admins have plans available
    const planCount = await Plan.countDocuments();
    if (planCount === 0) {
      await Plan.create([
        {
          name: 'Starter Library',
          price: 999,
          currency: 'INR',
          validity: 30,
          validityUnit: 'Days',
          features: [
            'Up to 1 Branch',
            'Up to 2 Managers',
            'Up to 100 Students/Patrons',
            'Up to 50 Seats',
            'Queue Management',
            'WhatsApp Reminders',
          ],
          maxBranches: 1,
          maxManagers: 2,
          maxUsers: 100,
          maxSeats: 50,
          maxMessages: 500,
          maxQueueEntries: 50,
          maxStorageMB: 500,
          isActive: true,
        },
        {
          name: 'Growth Pro',
          price: 2499,
          currency: 'INR',
          validity: 30,
          validityUnit: 'Days',
          features: [
            'Up to 3 Branches',
            'Up to 6 Managers',
            'Up to 500 Students/Patrons',
            'Up to 250 Seats',
            'Queue Management',
            'WhatsApp Reminders',
            'Expense Tracking',
          ],
          maxBranches: 3,
          maxManagers: 6,
          maxUsers: 500,
          maxSeats: 250,
          maxMessages: 2000,
          maxQueueEntries: 200,
          maxStorageMB: 2048,
          isActive: true,
        },
        {
          name: 'Enterprise Multi-Chain',
          price: 5999,
          currency: 'INR',
          validity: 30,
          validityUnit: 'Days',
          features: [
            'Up to 10 Branches',
            'Up to 20 Managers',
            'Up to 2,000 Students/Patrons',
            'Up to 1,000 Seats',
            'Unlimited Queue',
            'Priority WhatsApp Reminders',
            'Custom Staff Permissions',
            'Full Audit Trail',
          ],
          maxBranches: 10,
          maxManagers: 20,
          maxUsers: 2000,
          maxSeats: 1000,
          maxMessages: 10000,
          maxQueueEntries: 1000,
          maxStorageMB: 10240,
          isActive: true,
        },
      ]);
    }

    // 4. Check and seed default WhatsApp message templates
    for (const t of DEFAULT_WHATSAPP_TEMPLATES) {
      await WhatsAppTemplate.findOneAndUpdate(
        { key: t.key },
        { $setOnInsert: t },
        { upsert: true }
      );
    }
  } catch (error) {
    console.error('❌ [Init] System initialization error:', error);
  }
}
