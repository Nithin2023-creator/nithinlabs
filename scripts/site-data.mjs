/**
 * Shared brand / catalogue data for site and OG generators.
 */
export const SITE = 'https://nithinlabs.tech';
export const BRAND = 'NithinLabs';
export const EMAIL = 'hello@nithinlabs.tech';
export const PHONE = '+91 90000 00000';
export const PHONE_TEL = '+919000000000';
export const CITY = 'Hyderabad, Telangana';

export const REFERRAL = {
  amount: 500,
  display: '₹500',
  payout: 'UPI or bank transfer',
  payoutShort: 'UPI',
  phone: '8125611565',
  phoneTel: '918125611565',
};

export const ICON_PATHS = {
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  message: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  bot: '<rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><path d="M8 16h.01M16 16h.01"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 8v8M11 8v8M14 8v8M17 8v8"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M8 7h8M8 11h8M8 15h5"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
  calculator: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14v4M8 18h.01M12 18h.01"/>',
  box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7Z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
  briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  chart: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
  phone: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
  cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowUpRight: '<path d="M7 17 17 7M8 7h9v9"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  call: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/>',
  sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>',
  gift: '<rect x="3" y="8" width="18" height="13" rx="1"/><path d="M12 8v13M3 12h18"/><path d="M12 8H7.5a2.5 2.5 0 1 1 0-5C11 3 12 8 12 8zM12 8h4.5a2.5 2.5 0 1 0 0-5C13 3 12 8 12 8z"/>',
};

export const PILLARS = [
  { key: 'grow', num: '01', title: 'Grow & Retain', blurb: 'Bring customers back.' },
  { key: 'sell', num: '02', title: 'Sell', blurb: 'Sites, stores, counters.' },
  { key: 'money', num: '03', title: 'Money', blurb: 'Billing, UPI, books.' },
  { key: 'operate', num: '04', title: 'Operate', blurb: 'Stock, ERP, people.' },
  { key: 'build', num: '05', title: 'Build & Run', blurb: 'Apps, hosting, AMC.' },
];

export const SERVICES = [
  { slug: 'customer-retention', pillar: 'grow', icon: 'users', name: 'Customer Retention & CRM', short: 'Loyalty, follow-ups and one customer view.', tags: 'crm loyalty rewards leads', features: ['Lead and deal pipelines', 'Loyalty points and rewards', 'Due and renewal reminders', 'Segments and lifetime value', 'WhatsApp and email sequences', 'Purchase history on every profile'], outcomes: ['Higher repeat purchase rate', 'Fewer lost leads', 'Clear view of who buys'], timeline: '3–6 weeks', stack: 'CRM, WhatsApp API' },
  { slug: 'whatsapp-automation', pillar: 'grow', icon: 'message', name: 'WhatsApp Business Automation', short: 'Bills, updates and reminders on WhatsApp.', tags: 'whatsapp api reminders udhaar broadcast', features: ['Invoice and receipt sharing', 'Order status notifications', 'Payment and udhaar reminders', 'Template broadcasts', 'Chatbot with human handoff', 'Opt-in tracking'], outcomes: ['Faster collections', 'Lower support load', 'Messages that get read'], timeline: '2–4 weeks', stack: 'WhatsApp Cloud API' },
  { slug: 'digital-marketing', pillar: 'grow', icon: 'megaphone', name: 'Digital Marketing & SEO', short: 'Local SEO and ads that bring real enquiries.', tags: 'seo google ads meta marketing local', features: ['Google Business Profile', 'Local SEO', 'Meta and Google Ads', 'Landing pages that convert', 'Call and form tracking', 'Monthly reports'], outcomes: ['More inbound enquiries', 'Known cost per lead', 'Local search visibility'], timeline: 'Ongoing', stack: 'Google, Meta, GA4' },
  { slug: 'ai-chatbots', pillar: 'grow', icon: 'bot', name: 'AI Chatbots & Support Desk', short: '24×7 answers, with a human when needed.', tags: 'ai chatbot support helpdesk tickets', features: ['Website and WhatsApp bots', 'Answers from your FAQ', 'Ticket and SLA tracking', 'Live-agent handoff', 'Multilingual replies', 'Conversation analytics'], outcomes: ['Always-on first response', 'Fewer repetitive queries', 'Clean support history'], timeline: '3–5 weeks', stack: 'LLM + helpdesk' },
  { slug: 'brand-websites', pillar: 'sell', icon: 'globe', name: 'Brand Websites', short: 'Fast sites that turn visitors into leads.', tags: 'website design brand landing cms', features: ['Custom design', 'Mobile-first performance', 'Easy content edits', 'Lead forms', 'On-page SEO', 'Analytics'], outcomes: ['Stronger first impression', 'More qualified leads', 'A site you can update'], timeline: '3–6 weeks', stack: 'Static / headless CMS' },
  { slug: 'ecommerce', pillar: 'sell', icon: 'cart', name: 'E-commerce & Online Stores', short: 'Catalogue, cart and UPI checkout.', tags: 'ecommerce store shop online d2c checkout', features: ['Catalogue with variants', 'UPI and card checkout', 'Stock sync', 'Order workflows', 'Coupons and cart recovery', 'COD controls'], outcomes: ['New online revenue', 'One stock count', 'India-ready checkout'], timeline: '6–10 weeks', stack: 'Shopify / custom' },
  { slug: 'pos', pillar: 'sell', icon: 'scan', name: 'POS & Counter Billing', short: 'Barcode billing, printers and tax-ready receipts.', tags: 'pos counter billing barcode retail restaurant', features: ['Barcode and quick search', 'Thermal printers', 'Multi-counter stores', 'Cash, UPI and card', 'Offline-friendly', 'Day-end reports'], outcomes: ['Shorter queues', 'Accurate daily sales', 'Tax-ready receipts'], timeline: '3–6 weeks', stack: 'Web / Android POS' },
  { slug: 'booking', pillar: 'sell', icon: 'calendar', name: 'Booking & Appointments', short: 'Calendars, deposits and no-show reminders.', tags: 'booking appointment calendar clinic salon', features: ['Online booking pages', 'Staff calendars', 'SMS and WhatsApp reminders', 'Advance payments', 'Packages', 'No-show tracking'], outcomes: ['Fewer no-shows', 'Fuller schedules', 'Less phone tag'], timeline: '3–5 weeks', stack: 'Custom + payments' },
  { slug: 'billing', pillar: 'money', icon: 'receipt', name: 'Billing & Invoicing', short: 'Invoices, credit notes and tax-ready exports.', tags: 'billing invoice e-invoice eway tax gst', features: ['Tax invoices and notes', 'Multi-tax breakup', 'Digital invoice QR', 'Dispatch documents', 'Item code summaries', 'Return-ready exports'], outcomes: ['Cleaner compliance', 'Faster invoicing', 'Less filing rework'], timeline: '3–6 weeks', stack: 'Billing APIs' },
  { slug: 'payment-gateways', pillar: 'money', icon: 'card', name: 'Payment Gateway Integration', short: 'UPI and cards via Razorpay, Cashfree and more.', tags: 'payment gateway upi razorpay cashfree phonepe payu autopay', features: ['Razorpay, Cashfree, PhonePe, PayU', 'Links and QR', 'Subscriptions and autopay', 'Refunds and settlements', 'Webhook reconciliation', 'Failed-payment retries'], outcomes: ['Fewer failed payments', 'Automated collections', 'Clear settlement trail'], timeline: '2–4 weeks', stack: 'Gateway APIs' },
  { slug: 'accounting', pillar: 'money', icon: 'calculator', name: 'Accounting & Tally Sync', short: 'Sales and tax flowing into your books.', tags: 'accounting tally books ledger expenses', features: ['Tally sync', 'Ledger mapping', 'Expense capture', 'Ageing reports', 'Bank matching', 'CA exports'], outcomes: ['No double entry', 'Faster month-end', 'Books that match ops'], timeline: '2–4 weeks', stack: 'Tally XML / APIs' },
  { slug: 'inventory', pillar: 'operate', icon: 'box', name: 'Inventory & Warehouse', short: 'Live stock, batches, barcodes, multi-branch.', tags: 'inventory stock warehouse godown barcode batch expiry', features: ['Item master with SKUs', 'Batch and expiry', 'Barcode labels', 'Multi-warehouse', 'Low-stock alerts', 'Valuation reports'], outcomes: ['Fewer stockouts', 'Less dead stock', 'Stock you trust'], timeline: '4–8 weeks', stack: 'Custom + scanners' },
  { slug: 'erp', pillar: 'operate', icon: 'layers', name: 'Custom ERP', short: 'Modules shaped around your process.', tags: 'erp custom software process modules', features: ['Discovery workshops', 'Phased rollout', 'Role-based access', 'Approvals', 'Manager reports', 'Integrations'], outcomes: ['One system of record', 'Fewer spreadsheets', 'Processes that scale'], timeline: 'Phased', stack: 'Custom' },
  { slug: 'hr-payroll', pillar: 'operate', icon: 'briefcase', name: 'HR & Payroll', short: 'Attendance, salary, PF, ESI and TDS.', tags: 'hr payroll attendance pf esi tds salary', features: ['Attendance and leave', 'Salary structures', 'PF, ESI, PT, TDS', 'Payslips', 'Reimbursements', 'Statutory reports'], outcomes: ['On-time payroll', 'Lower compliance risk', 'Fewer HR queries'], timeline: '3–6 weeks', stack: 'Custom' },
  { slug: 'analytics', pillar: 'operate', icon: 'chart', name: 'Analytics Dashboards', short: 'Sales, stock and collections at a glance.', tags: 'analytics dashboard reports kpi data', features: ['Sales and margin views', 'Collection ageing', 'SKU and branch KPIs', 'Custom metrics', 'Scheduled emails', 'Mobile views'], outcomes: ['Faster decisions', 'Leaks spotted early', 'One version of truth'], timeline: '2–5 weeks', stack: 'Metabase / custom' },
  { slug: 'mobile-apps', pillar: 'build', icon: 'phone', name: 'Mobile Apps', short: 'Android and iOS for customers or field teams.', tags: 'mobile app android ios flutter', features: ['Android and iOS', 'Store listings', 'Push notifications', 'Offline-friendly', 'Admin backend', 'Crash analytics'], outcomes: ['Stickier customers', 'Field teams in sync', 'Brand on the home screen'], timeline: '8–14 weeks', stack: 'Flutter / RN' },
  { slug: 'cloud-hosting', pillar: 'build', icon: 'cloud', name: 'Cloud Hosting', short: 'Secure hosting in Indian regions.', tags: 'cloud hosting aws server ssl cdn', features: ['Managed setup', 'India-region hosts', 'SSL and CDN', 'Uptime alerts', 'Staging + production', 'Cost reviews'], outcomes: ['Faster pages', 'Fewer outages', 'Predictable bills'], timeline: '1–2 weeks', stack: 'AWS / GCP / DO' },
  { slug: 'maintenance', pillar: 'build', icon: 'wrench', name: 'Maintenance & AMC', short: 'Updates, monitoring and a named contact.', tags: 'amc maintenance support sla updates', features: ['Bug fixes', 'Security updates', 'Response SLA', 'Monthly health checks', 'Change queue', 'Named contact'], outcomes: ['Predictable support cost', 'Systems that age well', 'Someone who answers'], timeline: 'Annual', stack: 'Any we build' },
  { slug: 'cybersecurity', pillar: 'build', icon: 'shield', name: 'Cybersecurity & Backups', short: 'Access control, hardening and tested backups.', tags: 'security backup cyber mfa data protection', features: ['Access and MFA', 'Backup drills', 'Hardening', 'Code reviews', 'DPDP-aware handling', 'Incident playbooks'], outcomes: ['Lower breach risk', 'Recoverable data', 'Customer trust'], timeline: '2–4 weeks', stack: 'Audit + tooling' },
];

/** Featured services shown on the homepage OG card */
export const HOME_OG_SERVICES = [
  { slug: 'billing', label: 'Billing & Invoicing' },
  { slug: 'brand-websites', label: 'Brand Websites' },
  { slug: 'payment-gateways', label: 'Payment Gateways (UPI)' },
  { slug: 'inventory', label: 'Inventory' },
  { slug: 'customer-retention', label: 'Customer Retention' },
];
