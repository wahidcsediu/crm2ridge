export type UserRole = 'admin' | 'manager' | 'agent' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  whatsappNumber?: string;
  whatsappConnected?: boolean;
  avatar?: string;
  team?: string;
  title?: string;
}

export interface TargetRecord {
  startDate: string;
  endDate: string;
  target: number;
}

export interface Agent extends User {
  salesCount: number;
  active: boolean;
  points: number;
  commissionRate: number; // Dollar amount per 10 points
  targets: TargetRecord[]; // List of targets with date ranges
  createdAt: string;
  phone?: string;
  whatsappNumber?: string;
  whatsappConnected?: boolean;
  checkInStatus?: 'online' | 'in_meeting' | 'site_visit' | 'offline';
  todayActivitiesCount?: number;
}

// 11 Specific CRM Pipeline Stages
export type PipelineStage = 
  | 'New / Unassigned'
  | 'Attempted Contact'
  | 'Connected / Contacted'
  | 'Requirement Collected / Qualified'
  | 'Brochure / Details Sent'
  | 'Profile / Brochure Sent'
  | 'Inbound Interest / Call Back Received'
  | 'Interested / In Discussion'
  | 'Follow-up / Warm Stage'
  | 'Site Visit Scheduled'
  | 'Site Visit Completed'
  | 'Negotiation / Offer Stage'
  | 'Closed - Won / Deal Booked'
  | 'Closed - Lost / Cancelled / Cold';

export const PIPELINE_STAGES: PipelineStage[] = [
  'New / Unassigned',
  'Attempted Contact',
  'Connected / Contacted',
  'Requirement Collected / Qualified',
  'Brochure / Details Sent',
  'Interested / In Discussion',
  'Site Visit Scheduled',
  'Site Visit Completed',
  'Negotiation / Offer Stage',
  'Closed - Won / Deal Booked',
  'Closed - Lost / Cancelled / Cold'
];

export type LeadCategory = 'Prospective Client' | 'Outbound Lead' | 'Inbound Lead' | 'VIP Investor' | 'Referral' | string;

export type LeadSource = 
  | 'WhatsApp'
  | 'Facebook Ads'
  | 'Google Search'
  | 'Website Inquiry'
  | 'Referral'
  | 'Cold Call'
  | 'Property Expo'
  | 'Walk-In'
  | 'Broker Network'
  | 'Other';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface SharedMaterial {
  id: string;
  type: 'Brochure' | 'Project Profile' | 'Price Sheet' | 'Floor Plan' | 'Video Tour' | 'Payment Plan' | 'Image Gallery' | 'Legal Documents';
  title: string;
  url?: string;
  size?: string;
  sentAt: string;
  sentBy: string;
  sentByName: string;
  channel: 'WhatsApp' | 'Email' | 'SMS';
}

export interface DealInfo {
  project: string;
  unit: string;
  finalPrice: number;
  discount: number;
  paymentPlan: string;
  bookingAmount: number;
  bookingDate: string;
  responsibleAgentId: string;
  responsibleAgentName: string;
  dealValue: number;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsappNumber?: string;
  category: LeadCategory;
  source: LeadSource;
  status: PipelineStage | string;
  priority: PriorityLevel;
  agentId?: string;
  agentName?: string;
  budget: number;
  preferredLocation?: string;
  projectType?: 'Apartment' | 'House' | 'Villa' | 'Commercial' | 'Land' | 'Penthouse' | 'Duplex';
  unitSize?: string;
  interestedProject?: string;
  preferredUnit?: string;
  timeline?: 'Immediate (0-30 days)' | '1-3 Months' | '3-6 Months' | 'Exploring / Flexible';
  requirementsNotes?: string;
  propertyId?: string;
  createdAt: string;
  updatedAt: string;
  lastActivityDate?: string;
  nextFollowUpDate?: string;
  nextFollowUpTime?: string;
  nextFollowUpNotes?: string;
  contactAttemptsCount?: number;
  callCount?: number;
  whatsappCount?: number;
  siteVisitCount?: number;
  negotiationCount?: number;
  materialsSent?: SharedMaterial[];
  lossReason?: string;
  lossNotes?: string;
  dealInfo?: DealInfo;
}

export type ActivityType = 
  | 'call'
  | 'whatsapp'
  | 'whatsapp_message'
  | 'whatsapp_material_sent'
  | 'sms'
  | 'email'
  | 'site_visit_scheduled'
  | 'site_visit_completed'
  | 'meeting'
  | 'office_visit'
  | 'brochure_sent'
  | 'negotiation'
  | 'stage_change'
  | 'deal_won'
  | 'deal_closed_won'
  | 'deal_lost'
  | 'deal_closed_lost'
  | 'lead_created'
  | 'lead_assigned'
  | 'daily_activity_report'
  | 'note';

export type ActivityOutcome = 
  | 'Connected'
  | 'No Answer'
  | 'Busy'
  | 'Unreachable'
  | 'Interested'
  | 'Not Interested'
  | 'Follow Up Scheduled'
  | 'Brochure Sent'
  | 'Visit Scheduled'
  | 'Visit Done'
  | 'Negotiation Ongoing'
  | 'Won'
  | 'Lost'
  | 'Info Sent'
  | 'Rescheduled'
  | 'Completed'
  | 'None';

export interface SiteVisitDetails {
  project: string;
  visitDate: string;
  visitTime: string;
  durationHours: number;
  attendeesCount: number;
  clientFeedback?: string;
  interestLevel?: 'High' | 'Medium' | 'Low';
  objections?: string;
  nextAction?: string;
}

export interface NegotiationDetails {
  offerAmount: number;
  discountRequested?: number;
  paymentPlanProposed?: string;
  bookingAmountProposed?: number;
  unitProposed?: string;
  termsDiscussed?: string;
  clientCounterOffer?: number;
}

export interface ActivityLog {
  id: string;
  leadId: string;
  leadName: string;
  agentId: string;
  agentName: string;
  type: ActivityType;
  title: string;
  description: string;
  outcome?: ActivityOutcome | string;
  previousStatus?: string;
  newStatus?: string;
  durationMinutes?: number;
  siteVisitDetails?: SiteVisitDetails;
  negotiationDetails?: NegotiationDetails;
  lossReason?: string;
  nextFollowUpDate?: string;
  sharedMaterials?: SharedMaterial[];
  timestamp: string;
}

export interface DailyActivityReport {
  id: string;
  agentId: string;
  agentName: string;
  date: string; // YYYY-MM-DD
  checkInTime?: string;
  checkOutTime?: string;
  leadsWorkedCount?: number;
  leadsWorked?: number;
  newLeadsAddedCount?: number;
  callsCompleted?: number;
  callsTotal?: number;
  callsConnected?: number;
  callsNoAnswer?: number;
  callsBusy?: number;
  whatsappSent?: number;
  whatsappSentCount?: number;
  smsSentCount?: number;
  emailsSentCount?: number;
  followUpsCompleted?: number;
  meetingsCount?: number;
  officeVisitsCount?: number;
  siteVisitsScheduled?: number;
  siteVisitsCompleted?: number;
  siteVisitHours?: number;
  negotiationsConducted?: number;
  negotiationsCount?: number;
  offersSentCount?: number;
  dealsWon?: number;
  dealsClosedCount?: number;
  dealsLostCount?: number;
  dealsValueClosed?: number;
  summaryNotes?: string;
  notesAndRemarks?: string;
  keyAccomplishments?: string;
  pendingTasksTomorrow?: string;
  pendingTasks?: string;
  status?: 'Approved' | 'Reviewed' | 'Pending';
  rating?: number;
  managerComments?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  submittedAt: string;
  managerReview?: {
    reviewedBy: string;
    reviewerName: string;
    comments: string;
    rating?: number;
    reviewedAt?: string;
    status?: string;
  };
}

export interface WhatsAppMessage {
  id: string;
  leadId?: string;
  leadName?: string;
  senderType: 'agent' | 'client' | 'system';
  senderId: string;
  senderName: string;
  phone: string;
  text: string;
  attachments?: {
    type: 'brochure' | 'price_sheet' | 'floor_plan' | 'video' | 'image' | 'payment_plan' | 'doc';
    name: string;
    url?: string;
    size?: string;
  }[];
  status: 'sent' | 'delivered' | 'read' | 'replied';
  timestamp: string;
  templateName?: string;
}

export interface TeamChatMessage {
  id: string;
  channelId?: string; // 'direct' | 'general' | 'deals' | 'announcements'
  fromId: string;
  fromName: string;
  fromRole?: string;
  toId?: string;
  toName?: string;
  toPhone?: string;
  text: string;
  timestamp: string;
  read: boolean;
  images?: string[];
  edited?: boolean;
  linkedLeadId?: string;
  linkedLeadName?: string;
  linkedLeadStage?: string;
  pinned?: boolean;
  viaWhatsApp?: boolean;
  whatsAppStatus?: 'synced' | 'delivered' | 'pending';
  whatsAppDeliveryPhone?: string;
  messageType?: 'text' | 'dar_reminder' | 'deal_alert' | 'urgent_ping' | 'broadcast' | 'milestone';
}

export type Message = TeamChatMessage;

export interface Holiday {
  id: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  name: string;
  type: 'public' | 'office' | 'weekly' | 'public_holiday' | 'office_holiday' | 'agent_leave';
  description?: string;
  isRecurringWeekly?: boolean;
  agentName?: string;
  status?: string;
}

export interface AgentLeave {
  id: string;
  agentId?: string;
  agentName?: string;
  startDate: string;
  endDate: string;
  type: 'casual' | 'sick' | 'vacation' | 'unpaid' | 'official_duty' | 'agent_leave';
  status: 'Approved' | 'Pending' | 'Rejected';
  notes?: string;
  name?: string;
}

export type HolidayOrLeave = Holiday & AgentLeave & {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  type: string;
  agentName?: string;
  status?: string;
};

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'site_visit' | 'call' | 'follow_up' | 'meeting' | 'holiday' | 'deadline' | 'negotiation';
  date: string;
  time?: string;
  agentId?: string;
  agentName?: string;
  leadId?: string;
  leadName?: string;
  clientName?: string;
  projectName?: string;
  location?: string;
  status?: 'Scheduled' | 'Completed' | 'Cancelled';
  notes?: string;
}

export interface Product {
  id: string;
  title: string;
  address: string;
  price: number;
  type: 'House' | 'Apartment' | 'Condo' | 'Land' | 'Commercial' | 'Villa';
  status: 'Available' | 'Pending' | 'Sold';
  quantity: number;
  agentId?: string;
  images?: string[];
  brochureUrl?: string;
  floorPlanUrl?: string;
  videoTourUrl?: string;
  priceSheetUrl?: string;
  locationDetails?: string;
  unitsAvailable?: number;
  createdAt: string;
  vatTax?: number;
  otherCost?: number;
}

export interface FinancialConfig {
  interestIncome: number;
  otherIncome: number;
  rent: number;
  utilities: number;
  supplies: number;
  marketing: number;
  insurance: number;
  maintenance: number;
  misc: number;
  baseSalaries: number;
  depreciation: number;
  taxes: number;
}

export interface ActivityPerformance {
  agentId: string;
  agentName: string;
  leadsAssigned: number;
  newLeadsCollected?: number;
  leadsContacted?: number;
  callsCompleted?: number;
  whatsappSent?: number;
  contactAttemptRate?: number;
  connectionRate?: number;
  requirementCollectionRate?: number;
  brochureSentCount?: number;
  inboundInterestCount?: number;
  followUpCompletionRate?: number;
  overdueFollowUpCount?: number;
  siteVisitsScheduled?: number;
  siteVisitsCompleted: number;
  siteVisitHours?: number;
  totalSiteVisitHours?: number;
  negotiationsConducted?: number;
  negotiationCount?: number;
  leadToVisitRate?: number;
  visitToNegotiationRate?: number;
  dealsWon?: number;
  dealsLost?: number;
  totalSalesValue?: number;
  conversionRate?: number;
}

export interface SalesPerformance {
  agentId: string;
  agentName: string;
  dealsWonCount: number;
  dealsLostCount: number;
  totalDealValue: number;
  averageDealValue: number;
  dealClosureRate: number;
  negotiationToSaleRate: number;
  overallLeadConversionRate: number;
  commissionEarned: number;
}

export interface PerformanceReport {
  totalLeads: number;
  totalWonDeals: number;
  totalSalesVolume: number;
  averageDealSize: number;
  totalSiteVisits: number;
  overallConversionRate: number;
  agents: any[];
  stageFunnel: { stage: string; count: number }[];
  lostReasonBreakdown: Record<string, number>;
}
