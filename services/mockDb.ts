import { 
  Agent, 
  Customer, 
  Product, 
  User, 
  ActivityLog, 
  DailyActivityReport, 
  WhatsAppMessage, 
  TeamChatMessage, 
  Holiday, 
  AgentLeave, 
  CalendarEvent, 
  FinancialConfig,
  PipelineStage,
  PIPELINE_STAGES,
  ActivityPerformance,
  SalesPerformance,
  HolidayOrLeave,
  TargetRecord
} from '../types';

interface StoredAgent extends Agent {
  password?: string;
}

const daysAgo = (days: number, hours = 0) => {
  const d = new Date(Date.now() - days * 24 * 60 * 60 * 1000 - hours * 60 * 60 * 1000);
  return d.toISOString();
};

const todayStr = new Date().toISOString().split('T')[0];
const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
const currentMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

// Initial Realistic Agents
const INITIAL_AGENTS: StoredAgent[] = [
  { 
    id: 'agent-1', 
    email: 'agent@bond.com', 
    name: 'James Bond', 
    role: 'agent', 
    phone: '+1 (555) 007-0007',
    whatsappNumber: '+1 (555) 007-0007',
    whatsappConnected: true,
    team: 'Luxury Residential',
    title: 'Senior Acquisition Specialist',
    checkInStatus: 'online',
    salesCount: 14, 
    active: true, 
    password: '123456',
    points: 140,
    commissionRate: 500, 
    targets: [
      { startDate: currentMonthStart, endDate: currentMonthEnd, target: 20 }
    ],
    createdAt: daysAgo(30) 
  },
  { 
    id: 'agent-2', 
    email: 'agent@sarah.com', 
    name: 'Sarah Connor', 
    role: 'agent', 
    phone: '+1 (555) 911-2029',
    whatsappNumber: '+1 (555) 911-2029',
    whatsappConnected: true,
    team: 'Commercial & Estates',
    title: 'Commercial Portfolio Manager',
    checkInStatus: 'site_visit',
    salesCount: 9, 
    active: true, 
    password: '123456',
    points: 90,
    commissionRate: 450,
    targets: [
      { startDate: currentMonthStart, endDate: currentMonthEnd, target: 15 }
    ],
    createdAt: daysAgo(25)
  },
  { 
    id: 'agent-3', 
    email: 'agent@elena.com', 
    name: 'Elena Rostova', 
    role: 'agent', 
    phone: '+1 (555) 443-8910',
    whatsappNumber: '+1 (555) 443-8910',
    whatsappConnected: true,
    team: 'Suburban Multi-family',
    title: 'Client Relations Associate',
    checkInStatus: 'online',
    salesCount: 6, 
    active: true, 
    password: '123456',
    points: 60,
    commissionRate: 400,
    targets: [
      { startDate: currentMonthStart, endDate: currentMonthEnd, target: 10 }
    ],
    createdAt: daysAgo(15)
  }
];

// Initial Realistic Leads mapped to the 11 Pipeline Stages
const INITIAL_CUSTOMERS: Customer[] = [
  { 
    id: 'cust-1', 
    name: 'Alice Wonderland', 
    email: 'alice@wonderland.io', 
    phone: '+1 (555) 010-1122',
    whatsappNumber: '+1 (555) 010-1122',
    category: 'Prospective Client',
    source: 'WhatsApp',
    status: 'Negotiation / Offer Stage', 
    priority: 'Urgent',
    budget: 4800000, 
    agentId: 'agent-1',
    agentName: 'James Bond',
    interestedProject: 'Sunset Villa',
    preferredLocation: 'Beverly Hills / Coast',
    projectType: 'Villa',
    unitSize: '4,500 sq.ft (5 Bed)',
    preferredUnit: 'Villa Unit 4B',
    timeline: 'Immediate (0-30 days)',
    requirementsNotes: 'Client requesting 5% price concession and customized 24-month installment schedule with 20% down payment.',
    contactAttemptsCount: 6,
    callCount: 4,
    whatsappCount: 14,
    siteVisitCount: 2,
    negotiationCount: 2,
    nextFollowUpDate: todayStr,
    nextFollowUpTime: '15:00',
    nextFollowUpNotes: 'Present revised payment schedule approved by management.',
    materialsSent: [
      {
        id: 'mat-1',
        type: 'Brochure',
        title: 'Sunset Villa Luxury Catalog 2026',
        size: '14.2 MB',
        sentAt: daysAgo(4, 2),
        sentBy: 'agent-1',
        sentByName: 'James Bond',
        channel: 'WhatsApp'
      },
      {
        id: 'mat-2',
        type: 'Price Sheet',
        title: 'Sunset Villa Pricing & Installment Matrix',
        size: '2.1 MB',
        sentAt: daysAgo(3, 1),
        sentBy: 'agent-1',
        sentByName: 'James Bond',
        channel: 'WhatsApp'
      }
    ],
    createdAt: daysAgo(12),
    updatedAt: daysAgo(0, 2),
    lastActivityDate: daysAgo(0, 2)
  },
  { 
    id: 'cust-2', 
    name: 'Bob Builder', 
    email: 'bob@heavytools.com', 
    phone: '+1 (555) 010-3344',
    whatsappNumber: '+1 (555) 010-3344',
    category: 'Outbound Lead',
    source: 'Cold Call',
    status: 'Attempted Contact', 
    priority: 'Medium',
    budget: 8500000, 
    agentId: 'agent-2',
    agentName: 'Sarah Connor',
    interestedProject: 'Downtown Loft',
    preferredLocation: 'Financial District',
    projectType: 'Commercial',
    unitSize: '8,000 sq.ft Floorplate',
    timeline: '1-3 Months',
    requirementsNotes: 'Looking for corporate headquarters floor with 24/7 security and high ceiling height.',
    contactAttemptsCount: 3,
    callCount: 3,
    whatsappCount: 1,
    siteVisitCount: 0,
    negotiationCount: 0,
    nextFollowUpDate: todayStr,
    nextFollowUpTime: '16:30',
    nextFollowUpNotes: 'Retry after 4 PM when client is out of boardroom.',
    materialsSent: [],
    createdAt: daysAgo(3),
    updatedAt: daysAgo(0, 4),
    lastActivityDate: daysAgo(0, 4)
  },
  { 
    id: 'cust-3', 
    name: 'Charlie Bucket', 
    email: 'charlie@goldenticket.org', 
    phone: '+1 (555) 010-5566',
    whatsappNumber: '+1 (555) 010-5566',
    category: 'VIP Investor',
    source: 'Referral',
    status: 'Closed - Won / Deal Booked', 
    priority: 'High',
    budget: 15000000, 
    agentId: 'agent-1',
    agentName: 'James Bond',
    interestedProject: 'Lakeside Cabin',
    preferredLocation: 'Tahoe Waterfront',
    projectType: 'House',
    unitSize: '6,200 sq.ft Lakefront Estate',
    preferredUnit: 'Lakeside Estate Unit 1',
    timeline: 'Immediate (0-30 days)',
    requirementsNotes: 'Full cash deal with private boat slip and smart solar automation.',
    contactAttemptsCount: 8,
    callCount: 6,
    whatsappCount: 18,
    siteVisitCount: 2,
    negotiationCount: 3,
    dealInfo: {
      project: 'Lakeside Cabin',
      unit: 'Estate Unit 1',
      finalPrice: 15000000,
      discount: 250000,
      paymentPlan: 'Full Escrow Settlement',
      bookingAmount: 1500000,
      bookingDate: daysAgo(1),
      responsibleAgentId: 'agent-1',
      responsibleAgentName: 'James Bond',
      dealValue: 15000000,
      notes: 'Contracts executed in escrow, earnest deposit received.'
    },
    materialsSent: [
      {
        id: 'mat-3',
        type: 'Project Profile',
        title: 'Lakeside Waterfront Specs & Survey',
        size: '8.4 MB',
        sentAt: daysAgo(7),
        sentBy: 'agent-1',
        sentByName: 'James Bond',
        channel: 'WhatsApp'
      }
    ],
    createdAt: daysAgo(18),
    updatedAt: daysAgo(1),
    lastActivityDate: daysAgo(1)
  },
  { 
    id: 'cust-4', 
    name: 'David Miller', 
    email: 'david.miller@capitalgroup.com', 
    phone: '+1 (555) 010-7788',
    whatsappNumber: '+1 (555) 010-7788',
    category: 'Inbound Lead',
    source: 'Website Inquiry',
    status: 'Site Visit Scheduled', 
    priority: 'High',
    budget: 6200000, 
    agentId: 'agent-2',
    agentName: 'Sarah Connor',
    interestedProject: 'Downtown Loft',
    preferredLocation: 'Downtown / High-Rise',
    projectType: 'Apartment',
    unitSize: '3,200 sq.ft Penthouse',
    preferredUnit: 'Penthouse East',
    timeline: '1-3 Months',
    requirementsNotes: 'Client visiting site with architect to inspect structural acoustics and private balcony terrace.',
    contactAttemptsCount: 4,
    callCount: 3,
    whatsappCount: 9,
    siteVisitCount: 1,
    negotiationCount: 0,
    nextFollowUpDate: todayStr,
    nextFollowUpTime: '11:00',
    nextFollowUpNotes: 'Coordinate gate pass and on-site engineering team.',
    materialsSent: [
      {
        id: 'mat-4',
        type: 'Floor Plan',
        title: 'Downtown Loft Penthouse Blueprint',
        size: '5.6 MB',
        sentAt: daysAgo(2),
        sentBy: 'agent-2',
        sentByName: 'Sarah Connor',
        channel: 'WhatsApp'
      }
    ],
    createdAt: daysAgo(6),
    updatedAt: daysAgo(0, 1),
    lastActivityDate: daysAgo(0, 1)
  },
  { 
    id: 'cust-5', 
    name: 'Elena Rostova (Client)', 
    email: 'elena.client@heritage.de', 
    phone: '+1 (555) 010-9900',
    whatsappNumber: '+1 (555) 010-9900',
    category: 'Prospective Client',
    source: 'Facebook Ads',
    status: 'Profile / Brochure Sent', 
    priority: 'Medium',
    budget: 3400000, 
    agentId: 'agent-3',
    agentName: 'Elena Rostova',
    interestedProject: 'Sunset Villa',
    preferredLocation: 'Suburban Ridge',
    projectType: 'House',
    unitSize: '2,800 sq.ft (3 Bed)',
    timeline: '3-6 Months',
    requirementsNotes: 'Sent high-resolution video tour and payment breakdown over WhatsApp. Waiting for family review.',
    contactAttemptsCount: 2,
    callCount: 1,
    whatsappCount: 4,
    siteVisitCount: 0,
    negotiationCount: 0,
    nextFollowUpDate: todayStr,
    nextFollowUpTime: '17:00',
    nextFollowUpNotes: 'Check if video walkthrough was reviewed and answer financing questions.',
    materialsSent: [
      {
        id: 'mat-5',
        type: 'Video Tour',
        title: 'Sunset Villa 4K Drone Walkthrough',
        size: '45 MB',
        sentAt: daysAgo(1),
        sentBy: 'agent-3',
        sentByName: 'Elena Rostova',
        channel: 'WhatsApp'
      }
    ],
    createdAt: daysAgo(4),
    updatedAt: daysAgo(1),
    lastActivityDate: daysAgo(1)
  },
  { 
    id: 'cust-6', 
    name: 'Franklin Hayes', 
    email: 'franklin.hayes@apexholding.com', 
    phone: '+1 (555) 020-1122',
    whatsappNumber: '+1 (555) 020-1122',
    category: 'Inbound Lead',
    source: 'Google Search',
    status: 'New / Unassigned', 
    priority: 'High',
    budget: 9200000, 
    interestedProject: 'Lakeside Cabin',
    preferredLocation: 'Waterfront',
    projectType: 'Villa',
    timeline: 'Immediate (0-30 days)',
    requirementsNotes: 'Inbound web form submitted asking for immediate brochure and private broker contact.',
    contactAttemptsCount: 0,
    callCount: 0,
    whatsappCount: 0,
    siteVisitCount: 0,
    negotiationCount: 0,
    materialsSent: [],
    createdAt: daysAgo(0, 3),
    updatedAt: daysAgo(0, 3),
    lastActivityDate: daysAgo(0, 3)
  },
  { 
    id: 'cust-7', 
    name: 'Grace Hopper', 
    email: 'grace@techinvest.org', 
    phone: '+1 (555) 020-3344',
    whatsappNumber: '+1 (555) 020-3344',
    category: 'Prospective Client',
    source: 'WhatsApp',
    status: 'Inbound Interest / Call Back Received', 
    priority: 'Urgent',
    budget: 5100000, 
    agentId: 'agent-1',
    agentName: 'James Bond',
    interestedProject: 'Sunset Villa',
    preferredLocation: 'Oceanview Heights',
    projectType: 'House',
    unitSize: '3,800 sq.ft',
    timeline: '1-3 Months',
    requirementsNotes: 'Client initiated WhatsApp chat asking if Unit 7 has private elevator access and EV charger.',
    contactAttemptsCount: 3,
    callCount: 2,
    whatsappCount: 8,
    siteVisitCount: 0,
    negotiationCount: 0,
    nextFollowUpDate: todayStr,
    nextFollowUpTime: '14:00',
    nextFollowUpNotes: 'Call to confirm EV charger capacity and schedule physical walkthrough.',
    materialsSent: [
      {
        id: 'mat-7',
        type: 'Brochure',
        title: 'Ridge Park Smart Homes & EV Infra',
        size: '9.1 MB',
        sentAt: daysAgo(1),
        sentBy: 'agent-1',
        sentByName: 'James Bond',
        channel: 'WhatsApp'
      }
    ],
    createdAt: daysAgo(5),
    updatedAt: daysAgo(0, 5),
    lastActivityDate: daysAgo(0, 5)
  },
  { 
    id: 'cust-8', 
    name: 'Harry Sterling', 
    email: 'harry.sterling@sterlingmetal.com', 
    phone: '+1 (555) 020-5566',
    whatsappNumber: '+1 (555) 020-5566',
    category: 'Outbound Lead',
    source: 'Property Expo',
    status: 'Follow-up / Warm Stage', 
    priority: 'Medium',
    budget: 7400000, 
    agentId: 'agent-2',
    agentName: 'Sarah Connor',
    interestedProject: 'Downtown Loft',
    preferredLocation: 'Metro Central',
    projectType: 'Apartment',
    unitSize: '4,000 sq.ft Duplex',
    timeline: '1-3 Months',
    requirementsNotes: 'Met at Property Expo 2026. Highly interested in tax incentive structure for dual residency.',
    contactAttemptsCount: 4,
    callCount: 3,
    whatsappCount: 7,
    siteVisitCount: 0,
    negotiationCount: 0,
    nextFollowUpDate: todayStr,
    nextFollowUpTime: '10:00',
    nextFollowUpNotes: 'Send comparative ROI analysis and follow up on tax structure.',
    materialsSent: [
      {
        id: 'mat-8',
        type: 'Payment Plan',
        title: 'Dual Residency Tax Benefits & Payment Plan',
        size: '3.4 MB',
        sentAt: daysAgo(2),
        sentBy: 'agent-2',
        sentByName: 'Sarah Connor',
        channel: 'WhatsApp'
      }
    ],
    createdAt: daysAgo(7),
    updatedAt: daysAgo(1),
    lastActivityDate: daysAgo(1)
  },
  { 
    id: 'cust-9', 
    name: 'Ian Vance', 
    email: 'ian.vance@vancerealty.com', 
    phone: '+1 (555) 020-7788',
    whatsappNumber: '+1 (555) 020-7788',
    category: 'Outbound Lead',
    source: 'Broker Network',
    status: 'Site Visit Completed', 
    priority: 'High',
    budget: 11000000, 
    agentId: 'agent-1',
    agentName: 'James Bond',
    interestedProject: 'Sunset Villa',
    preferredLocation: 'Ridge View',
    projectType: 'Villa',
    unitSize: '5,500 sq.ft Exclusive',
    preferredUnit: 'Villa Master Suite A',
    timeline: 'Immediate (0-30 days)',
    requirementsNotes: 'Site visit completed yesterday. Client loved infinity pool view. Preparing official purchase offer.',
    contactAttemptsCount: 5,
    callCount: 4,
    whatsappCount: 11,
    siteVisitCount: 1,
    negotiationCount: 1,
    nextFollowUpDate: todayStr,
    nextFollowUpTime: '12:30',
    nextFollowUpNotes: 'Draft formal Letter of Intent (LOI) with escrow terms.',
    materialsSent: [
      {
        id: 'mat-9',
        type: 'Project Profile',
        title: 'Sunset Villa Master Architectural Pack',
        size: '22 MB',
        sentAt: daysAgo(3),
        sentBy: 'agent-1',
        sentByName: 'James Bond',
        channel: 'WhatsApp'
      }
    ],
    createdAt: daysAgo(9),
    updatedAt: daysAgo(0, 6),
    lastActivityDate: daysAgo(0, 6)
  },
  { 
    id: 'cust-10', 
    name: 'Jessica Pearson', 
    email: 'jessica@pearsonhardman.legal', 
    phone: '+1 (555) 020-9900',
    whatsappNumber: '+1 (555) 020-9900',
    category: 'Prospective Client',
    source: 'Referral',
    status: 'Closed - Lost / Cancelled / Cold', 
    priority: 'Low',
    budget: 8000000, 
    agentId: 'agent-2',
    agentName: 'Sarah Connor',
    interestedProject: 'Downtown Loft',
    preferredLocation: 'Midtown',
    projectType: 'Apartment',
    requirementsNotes: 'Client opted for property in rival district with closer proximity to legal district.',
    lossReason: 'Location mismatch',
    lossNotes: 'Client required walking distance to Supreme Court courthouse, Downtown Loft was 25 minutes drive in peak traffic.',
    contactAttemptsCount: 5,
    callCount: 3,
    whatsappCount: 6,
    siteVisitCount: 1,
    negotiationCount: 1,
    materialsSent: [],
    createdAt: daysAgo(15),
    updatedAt: daysAgo(2),
    lastActivityDate: daysAgo(2)
  }
];

const INITIAL_PRODUCTS: Product[] = [
  { 
    id: 'prod-1', 
    title: 'Sunset Villa', 
    address: '123 Ocean Dr, Pacific Palisades', 
    price: 12000000, 
    type: 'House', 
    status: 'Available', 
    quantity: 3,
    unitsAvailable: 3,
    agentId: 'agent-1',
    images: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
    ],
    brochureUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    floorPlanUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    videoTourUrl: 'https://www.youtube.com/watch?v=sample-sunset-villa',
    priceSheetUrl: 'https://ridgepark.com/pricing/sunset-villa-2026.pdf',
    locationDetails: 'Exclusive Pacific rim community with private beach pass and round-the-clock concierge.',
    createdAt: daysAgo(30),
    vatTax: 50000,
    otherCost: 10000
  },
  { 
    id: 'prod-2', 
    title: 'Downtown Loft', 
    address: '456 Main St, Financial Center', 
    price: 8500000, 
    type: 'Apartment', 
    status: 'Pending', 
    quantity: 5,
    unitsAvailable: 2,
    agentId: 'agent-2',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
    ],
    brochureUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    floorPlanUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    priceSheetUrl: 'https://ridgepark.com/pricing/downtown-loft.pdf',
    locationDetails: 'Heart of metro center with direct subterranean subway tunnel and rooftop infinity club.',
    createdAt: daysAgo(20),
    vatTax: 25000,
    otherCost: 5000
  },
  { 
    id: 'prod-3', 
    title: 'Lakeside Cabin', 
    address: '789 Lakeview Rd, Lake Tahoe', 
    price: 15000000, 
    type: 'House', 
    status: 'Sold', 
    quantity: 0,
    unitsAvailable: 0,
    agentId: 'agent-1',
    images: [
      'https://images.unsplash.com/photo-1449156493391-d2cfa28e468b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80'
    ],
    locationDetails: 'Private gated lake frontage with deep water boat dock and heated driveway.',
    createdAt: daysAgo(40),
    vatTax: 75000,
    otherCost: 15000
  },
  { 
    id: 'prod-4', 
    title: 'Skyline Terrace Residences', 
    address: '100 Olympic Blvd, Westside', 
    price: 6700000, 
    type: 'Apartment', 
    status: 'Available', 
    quantity: 8,
    unitsAvailable: 6,
    agentId: 'agent-3',
    images: [
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'
    ],
    locationDetails: 'Ultra-contemporary duplex units with panoramic city lights and private valet garage.',
    createdAt: daysAgo(10),
    vatTax: 30000,
    otherCost: 8000
  }
];

// Initial Activity Logs
const INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: 'act-1',
    leadId: 'cust-1',
    leadName: 'Alice Wonderland',
    agentId: 'agent-1',
    agentName: 'James Bond',
    type: 'negotiation',
    title: 'Price and Payment Plan Negotiation',
    description: 'Discussed 5% price adjustment for Sunset Villa Unit 4B with 24-month installment milestone structure.',
    outcome: 'Negotiation Ongoing',
    previousStatus: 'Site Visit Completed',
    newStatus: 'Negotiation / Offer Stage',
    negotiationDetails: {
      offerAmount: 4800000,
      discountRequested: 240000,
      paymentPlanProposed: '20% DP + 24 Month Installment',
      bookingAmountProposed: 480000,
      unitProposed: 'Villa Unit 4B',
      termsDiscussed: 'Client agrees to close escrow within 14 days if payment plan is ratified.'
    },
    nextFollowUpDate: todayStr,
    timestamp: daysAgo(0, 2)
  },
  {
    id: 'act-2',
    leadId: 'cust-1',
    leadName: 'Alice Wonderland',
    agentId: 'agent-1',
    agentName: 'James Bond',
    type: 'whatsapp',
    title: 'WhatsApp Catalog & Pricing Sent',
    description: 'Dispatched Sunset Villa Luxury Catalog & Official Installment Matrix PDF over WhatsApp.',
    outcome: 'Brochure Sent',
    previousStatus: 'Connected / Contacted',
    newStatus: 'Profile / Brochure Sent',
    sharedMaterials: [
      {
        id: 'mat-1',
        type: 'Brochure',
        title: 'Sunset Villa Luxury Catalog 2026',
        size: '14.2 MB',
        sentAt: daysAgo(4, 2),
        sentBy: 'agent-1',
        sentByName: 'James Bond',
        channel: 'WhatsApp'
      }
    ],
    timestamp: daysAgo(4, 2)
  },
  {
    id: 'act-3',
    leadId: 'cust-4',
    leadName: 'David Miller',
    agentId: 'agent-2',
    agentName: 'Sarah Connor',
    type: 'site_visit_scheduled',
    title: 'Site Visit Scheduled for Downtown Loft',
    description: 'Scheduled physical site walkthrough for Penthouse East unit with client and private architect.',
    outcome: 'Visit Scheduled',
    previousStatus: 'Follow-up / Warm Stage',
    newStatus: 'Site Visit Scheduled',
    siteVisitDetails: {
      project: 'Downtown Loft',
      visitDate: todayStr,
      visitTime: '11:00 AM',
      durationHours: 2.0,
      attendeesCount: 3,
      interestLevel: 'High'
    },
    nextFollowUpDate: todayStr,
    timestamp: daysAgo(0, 5)
  },
  {
    id: 'act-4',
    leadId: 'cust-3',
    leadName: 'Charlie Bucket',
    agentId: 'agent-1',
    agentName: 'James Bond',
    type: 'deal_won',
    title: 'Deal Closed & Booked: Lakeside Cabin',
    description: 'Executed booking agreement and received $1,500,000 earnest deposit wire transfer.',
    outcome: 'Won',
    previousStatus: 'Negotiation / Offer Stage',
    newStatus: 'Closed - Won / Deal Booked',
    timestamp: daysAgo(1, 3)
  },
  {
    id: 'act-5',
    leadId: 'cust-2',
    leadName: 'Bob Builder',
    agentId: 'agent-2',
    agentName: 'Sarah Connor',
    type: 'call',
    title: 'Outbound Discovery Call Attempt',
    description: 'Placed phone call to client office line. Reached executive secretary; client in executive board review.',
    outcome: 'Busy',
    previousStatus: 'New / Unassigned',
    newStatus: 'Attempted Contact',
    nextFollowUpDate: todayStr,
    timestamp: daysAgo(0, 4)
  },
  {
    id: 'act-6',
    leadId: 'cust-7',
    leadName: 'Grace Hopper',
    agentId: 'agent-1',
    agentName: 'James Bond',
    type: 'whatsapp',
    title: 'Inbound WhatsApp Inquiry Received',
    description: 'Client messaged via WhatsApp regarding Unit 7 private elevator and dual EV charge station.',
    outcome: 'Interested',
    previousStatus: 'Profile / Brochure Sent',
    newStatus: 'Inbound Interest / Call Back Received',
    nextFollowUpDate: todayStr,
    timestamp: daysAgo(0, 6)
  }
];

// Initial WhatsApp Message Threads
const INITIAL_WHATSAPP: WhatsAppMessage[] = [
  {
    id: 'wa-1',
    leadId: 'cust-1',
    leadName: 'Alice Wonderland',
    senderType: 'agent',
    senderId: 'agent-1',
    senderName: 'James Bond',
    phone: '+1 (555) 010-1122',
    text: 'Hello Alice, following our conversation, here is the official 2026 Sunset Villa Catalog and Floorplan.',
    attachments: [
      {
        type: 'brochure',
        name: 'Sunset Villa Catalog 2026.pdf',
        size: '14.2 MB'
      },
      {
        type: 'price_sheet',
        name: 'Unit 4B Payment Matrix.pdf',
        size: '2.1 MB'
      }
    ],
    status: 'read',
    timestamp: daysAgo(4, 2)
  },
  {
    id: 'wa-2',
    leadId: 'cust-1',
    leadName: 'Alice Wonderland',
    senderType: 'client',
    senderId: 'cust-1',
    senderName: 'Alice Wonderland',
    phone: '+1 (555) 010-1122',
    text: 'Thank you James! The layout looks exceptional. Can we arrange a site walkthrough this Thursday afternoon?',
    status: 'read',
    timestamp: daysAgo(3, 4)
  },
  {
    id: 'wa-3',
    leadId: 'cust-1',
    leadName: 'Alice Wonderland',
    senderType: 'agent',
    senderId: 'agent-1',
    senderName: 'James Bond',
    phone: '+1 (555) 010-1122',
    text: 'Certainly! I have reserved Villa 4B for a private 2-hour walkthrough Thursday at 3:00 PM with our lead engineer.',
    status: 'read',
    timestamp: daysAgo(3, 3)
  },
  {
    id: 'wa-4',
    leadId: 'cust-1',
    leadName: 'Alice Wonderland',
    senderType: 'client',
    senderId: 'cust-1',
    senderName: 'Alice Wonderland',
    phone: '+1 (555) 010-1122',
    text: 'We loved the estate view. If management agrees to the 5% payment plan adjustment, we are ready to execute.',
    status: 'read',
    timestamp: daysAgo(0, 3)
  },
  {
    id: 'wa-5',
    leadId: 'cust-4',
    leadName: 'David Miller',
    senderType: 'agent',
    senderId: 'agent-2',
    senderName: 'Sarah Connor',
    phone: '+1 (555) 010-7788',
    text: 'Hi David, sending over the Downtown Loft Penthouse blueprints & private terrace structural diagrams.',
    attachments: [
      {
        type: 'floor_plan',
        name: 'Downtown Loft Penthouse Blueprints.pdf',
        size: '5.6 MB'
      }
    ],
    status: 'read',
    timestamp: daysAgo(2)
  },
  {
    id: 'wa-6',
    leadId: 'cust-4',
    leadName: 'David Miller',
    senderType: 'client',
    senderId: 'cust-4',
    senderName: 'David Miller',
    phone: '+1 (555) 010-7788',
    text: 'Looks solid Sarah. See you at the site gate today at 11:00 AM sharp with my architect.',
    status: 'read',
    timestamp: daysAgo(0, 4)
  },
  {
    id: 'wa-7',
    leadId: 'cust-7',
    leadName: 'Grace Hopper',
    senderType: 'client',
    senderId: 'cust-7',
    senderName: 'Grace Hopper',
    phone: '+1 (555) 020-3344',
    text: 'Good morning Ridge Park team. Does Sunset Villa Unit 7 support high-capacity Level 3 DC fast chargers?',
    status: 'read',
    timestamp: daysAgo(0, 6)
  }
];

// Initial Internal Team Messages (Bridged with WhatsApp)
const INITIAL_TEAM_MESSAGES: TeamChatMessage[] = [
  // 1-on-1 Direct Messages: Admin <-> James Bond
  {
    id: 'tm-dm-1',
    fromId: 'admin-1',
    fromName: 'System Admin',
    fromRole: 'admin',
    toId: 'agent-1',
    toName: 'James Bond',
    toPhone: '+1 (555) 007-0007',
    text: 'James, congratulations on closing the Lakeside Cabin transaction for $15M! Earnest deposit verified.',
    timestamp: daysAgo(1, 4),
    read: true,
    viaWhatsApp: true,
    whatsAppStatus: 'synced',
    whatsAppDeliveryPhone: '+1 (555) 007-0007',
    messageType: 'milestone'
  },
  {
    id: 'tm-dm-2',
    fromId: 'agent-1',
    fromName: 'James Bond',
    fromRole: 'agent',
    toId: 'admin-1',
    toName: 'System Admin',
    toPhone: '+1 (555) 000-1122',
    text: 'Thank you! The buyer escrow is settled. I also scheduled an inspection with Ian Vance for Sunset Villa today at 12:30 PM.',
    timestamp: daysAgo(1, 3),
    read: true,
    viaWhatsApp: true,
    whatsAppStatus: 'synced',
    whatsAppDeliveryPhone: '+1 (555) 000-1122'
  },
  {
    id: 'tm-dm-3',
    fromId: 'admin-1',
    fromName: 'System Admin',
    fromRole: 'admin',
    toId: 'agent-1',
    toName: 'James Bond',
    toPhone: '+1 (555) 007-0007',
    text: 'Reminder: Please submit your Daily Activity Report (DAR) before 7:00 PM today with the site visit outcome.',
    timestamp: daysAgo(0, 3),
    read: true,
    viaWhatsApp: true,
    whatsAppStatus: 'synced',
    whatsAppDeliveryPhone: '+1 (555) 007-0007',
    messageType: 'dar_reminder'
  },

  // 1-on-1 Direct Messages: Admin <-> Sarah Connor
  {
    id: 'tm-dm-4',
    fromId: 'admin-1',
    fromName: 'System Admin',
    fromRole: 'admin',
    toId: 'agent-2',
    toName: 'Sarah Connor',
    toPhone: '+1 (555) 911-2029',
    text: 'Sarah, lead David Miller requested the Downtown Loft architectural plan with terrace specifications. Dispatched on WhatsApp?',
    timestamp: daysAgo(0, 6),
    read: true,
    viaWhatsApp: true,
    whatsAppStatus: 'synced',
    whatsAppDeliveryPhone: '+1 (555) 911-2029'
  },
  {
    id: 'tm-dm-5',
    fromId: 'agent-2',
    fromName: 'Sarah Connor',
    fromRole: 'agent',
    toId: 'admin-1',
    toName: 'System Admin',
    toPhone: '+1 (555) 000-1122',
    text: 'Yes, delivered the brochure pack to his WhatsApp! He is bringing his architect to the site visit today.',
    timestamp: daysAgo(0, 5),
    read: true,
    viaWhatsApp: true,
    whatsAppStatus: 'synced',
    whatsAppDeliveryPhone: '+1 (555) 000-1122'
  },

  // 1-on-1 Direct Messages: Admin <-> Elena Rostova
  {
    id: 'tm-dm-6',
    fromId: 'admin-1',
    fromName: 'System Admin',
    fromRole: 'admin',
    toId: 'agent-3',
    toName: 'Elena Rostova',
    toPhone: '+1 (555) 443-8910',
    text: 'Elena, 3 new inbound website leads were assigned to your portfolio this morning. Please initiate introductory calls.',
    timestamp: daysAgo(0, 2),
    read: false,
    viaWhatsApp: true,
    whatsAppStatus: 'delivered',
    whatsAppDeliveryPhone: '+1 (555) 443-8910',
    messageType: 'urgent_ping'
  },

  // Channel & Broadcast Messages
  {
    id: 'tm-1',
    channelId: 'general',
    fromId: 'admin-1',
    fromName: 'System Admin',
    fromRole: 'admin',
    text: 'Team briefing: Q3 Property Expo campaign has been launched. All incoming leads from Facebook and WhatsApp are routed in real-time.',
    timestamp: daysAgo(2, 4),
    read: true,
    pinned: true,
    viaWhatsApp: true,
    whatsAppStatus: 'synced',
    messageType: 'broadcast'
  },
  {
    id: 'tm-2',
    channelId: 'deals',
    fromId: 'agent-1',
    fromName: 'James Bond',
    fromRole: 'agent',
    text: 'Just closed Lakeside Cabin with Charlie Bucket for $15.0M! Earnest deposit verified.',
    timestamp: daysAgo(1, 3),
    read: true,
    linkedLeadId: 'cust-3',
    linkedLeadName: 'Charlie Bucket',
    linkedLeadStage: 'Closed - Won / Deal Booked',
    viaWhatsApp: true,
    whatsAppStatus: 'synced',
    messageType: 'deal_alert'
  },
  {
    id: 'tm-3',
    channelId: 'general',
    fromId: 'agent-2',
    fromName: 'Sarah Connor',
    fromRole: 'agent',
    text: 'Client David Miller is inspecting Downtown Loft penthouse today. Will need engineering clearance for terrace hot tub installation.',
    timestamp: daysAgo(0, 4),
    read: true,
    linkedLeadId: 'cust-4',
    linkedLeadName: 'David Miller',
    linkedLeadStage: 'Site Visit Scheduled',
    viaWhatsApp: true,
    whatsAppStatus: 'synced'
  }
];

// Initial Daily Activity Reports
const INITIAL_DARS: DailyActivityReport[] = [
  {
    id: 'dar-1',
    agentId: 'agent-1',
    agentName: 'James Bond',
    date: daysAgo(1).split('T')[0],
    checkInTime: '08:45 AM',
    checkOutTime: '06:30 PM',
    leadsWorkedCount: 8,
    newLeadsAddedCount: 2,
    callsTotal: 12,
    callsConnected: 9,
    callsNoAnswer: 2,
    callsBusy: 1,
    whatsappSentCount: 16,
    smsSentCount: 4,
    emailsSentCount: 6,
    followUpsCompleted: 5,
    meetingsCount: 2,
    officeVisitsCount: 1,
    siteVisitsScheduled: 2,
    siteVisitsCompleted: 1,
    siteVisitHours: 2.5,
    negotiationsCount: 2,
    offersSentCount: 1,
    dealsClosedCount: 1,
    dealsLostCount: 0,
    dealsValueClosed: 15000000,
    pendingTasks: 'Follow up with Alice Wonderland on revised 24-month installment milestone terms.',
    notesAndRemarks: 'Record day closing the Lakeside Cabin transaction. Pipeline momentum remains very strong in luxury sector.',
    managerReview: {
      reviewedBy: 'admin-1',
      reviewerName: 'System Admin',
      comments: 'Outstanding work closing the Lakeside estate. Commission registered.',
      rating: 5,
      reviewedAt: daysAgo(1, 1),
      status: 'Approved'
    },
    submittedAt: daysAgo(1, 2)
  },
  {
    id: 'dar-2',
    agentId: 'agent-2',
    agentName: 'Sarah Connor',
    date: daysAgo(1).split('T')[0],
    checkInTime: '09:00 AM',
    checkOutTime: '06:00 PM',
    leadsWorkedCount: 6,
    newLeadsAddedCount: 1,
    callsTotal: 15,
    callsConnected: 10,
    callsNoAnswer: 3,
    callsBusy: 2,
    whatsappSentCount: 12,
    smsSentCount: 3,
    emailsSentCount: 5,
    followUpsCompleted: 4,
    meetingsCount: 1,
    officeVisitsCount: 0,
    siteVisitsScheduled: 1,
    siteVisitsCompleted: 1,
    siteVisitHours: 1.5,
    negotiationsCount: 1,
    offersSentCount: 1,
    dealsClosedCount: 0,
    dealsLostCount: 1,
    dealsValueClosed: 0,
    pendingTasks: 'Site visit walkthrough with David Miller and architect at Downtown Loft.',
    notesAndRemarks: 'Jessica Pearson lead closed-lost due to strict distance requirement to Supreme Court. Re-allocated focus to David Miller.',
    managerReview: {
      reviewedBy: 'admin-1',
      reviewerName: 'System Admin',
      comments: 'Good activity volume. Ensure David Miller receives full architectural packet.',
      rating: 4,
      reviewedAt: daysAgo(1, 1),
      status: 'Approved'
    },
    submittedAt: daysAgo(1, 2)
  }
];

// Initial Holidays & Working Calendar
const INITIAL_HOLIDAYS: Holiday[] = [
  { id: 'hol-1', date: '2026-01-01', name: 'New Year Day', type: 'public', description: 'Federal public holiday' },
  { id: 'hol-2', date: '2026-05-25', name: 'Memorial Day', type: 'public', description: 'National observance' },
  { id: 'hol-3', date: '2026-07-04', name: 'Independence Day', type: 'public', description: 'National holiday' },
  { id: 'hol-4', date: '2026-09-07', name: 'Labor Day', type: 'public', description: 'National holiday' },
  { id: 'hol-5', date: '2026-11-26', name: 'Thanksgiving Day', type: 'public', description: 'National holiday' },
  { id: 'hol-6', date: '2026-12-25', name: 'Christmas Day', type: 'public', description: 'Winter holiday' },
  { id: 'hol-7', date: '2026-08-15', name: 'Ridge Park Annual Gala', type: 'office', description: 'Corporate celebration' }
];

const INITIAL_AGENT_LEAVES: AgentLeave[] = [
  {
    id: 'leave-1',
    agentId: 'agent-3',
    agentName: 'Elena Rostova',
    startDate: '2026-09-10',
    endDate: '2026-09-12',
    type: 'casual',
    status: 'Approved',
    notes: 'Personal family event'
  }
];

const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Site Visit: Downtown Loft Penthouse',
    type: 'site_visit',
    date: todayStr,
    time: '11:00 AM',
    agentId: 'agent-2',
    agentName: 'Sarah Connor',
    leadId: 'cust-4',
    leadName: 'David Miller',
    location: '456 Main St, Downtown Loft Gate 1',
    status: 'Scheduled',
    notes: 'Client visiting with private architect.'
  },
  {
    id: 'evt-2',
    title: 'Follow-up Call: Alice Wonderland (Payment Plan)',
    type: 'follow_up',
    date: todayStr,
    time: '03:00 PM',
    agentId: 'agent-1',
    agentName: 'James Bond',
    leadId: 'cust-1',
    leadName: 'Alice Wonderland',
    status: 'Scheduled',
    notes: 'Present ratified 24-month installment milestone terms.'
  },
  {
    id: 'evt-3',
    title: 'EV Infra Follow-up: Grace Hopper',
    type: 'follow_up',
    date: todayStr,
    time: '02:00 PM',
    agentId: 'agent-1',
    agentName: 'James Bond',
    leadId: 'cust-7',
    leadName: 'Grace Hopper',
    status: 'Scheduled',
    notes: 'Confirm Level 3 DC Fast Charger specs.'
  },
  {
    id: 'evt-4',
    title: 'Ridge Park Team Weekly Pipeline Strategy',
    type: 'meeting',
    date: todayStr,
    time: '09:00 AM',
    location: 'Main Executive Boardroom & Zoom',
    status: 'Completed',
    notes: 'Review Q3 targets and high-probability negotiation deals.'
  }
];

const INITIAL_FINANCIAL_CONFIG: FinancialConfig = {
  interestIncome: 120000,
  otherIncome: 45000,
  rent: 28000,
  utilities: 4500,
  supplies: 2200,
  marketing: 35000,
  insurance: 6000,
  maintenance: 3800,
  misc: 1500,
  baseSalaries: 45000,
  depreciation: 8000,
  taxes: 18500,
};

const STORAGE_KEY = 'ridge_park_crm_v3_full';

class MockDatabase {
  private agents: StoredAgent[] = [...INITIAL_AGENTS];
  private customers: Customer[] = [...INITIAL_CUSTOMERS];
  private products: Product[] = [...INITIAL_PRODUCTS];
  private activities: ActivityLog[] = [...INITIAL_ACTIVITIES];
  private whatsappMessages: WhatsAppMessage[] = [...INITIAL_WHATSAPP];
  private teamMessages: TeamChatMessage[] = [...INITIAL_TEAM_MESSAGES];
  private dailyReports: DailyActivityReport[] = [...INITIAL_DARS];
  private holidays: Holiday[] = [...INITIAL_HOLIDAYS];
  private agentLeaves: AgentLeave[] = [...INITIAL_AGENT_LEAVES];
  private calendarEvents: CalendarEvent[] = [...INITIAL_CALENDAR_EVENTS];
  private financialSettings: FinancialConfig = { ...INITIAL_FINANCIAL_CONFIG };

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (Array.isArray(p.agents) && p.agents.length > 0) this.agents = p.agents;
        if (Array.isArray(p.customers) && p.customers.length > 0) this.customers = p.customers;
        if (Array.isArray(p.products) && p.products.length > 0) this.products = p.products;
        if (Array.isArray(p.activities) && p.activities.length > 0) this.activities = p.activities;
        if (Array.isArray(p.whatsappMessages)) this.whatsappMessages = p.whatsappMessages;
        if (Array.isArray(p.teamMessages)) this.teamMessages = p.teamMessages;
        if (Array.isArray(p.dailyReports)) this.dailyReports = p.dailyReports;
        if (Array.isArray(p.holidays)) this.holidays = p.holidays;
        if (Array.isArray(p.agentLeaves)) this.agentLeaves = p.agentLeaves;
        if (Array.isArray(p.calendarEvents)) this.calendarEvents = p.calendarEvents;
        if (p.financialSettings) this.financialSettings = p.financialSettings;
      }
    } catch (e) {
      console.warn("Storage sync notice:", e);
    }
  }

  private saveToStorage() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        agents: this.agents,
        customers: this.customers,
        products: this.products,
        activities: this.activities,
        whatsappMessages: this.whatsappMessages,
        teamMessages: this.teamMessages,
        dailyReports: this.dailyReports,
        holidays: this.holidays,
        agentLeaves: this.agentLeaves,
        calendarEvents: this.calendarEvents,
        financialSettings: this.financialSettings,
      }));
    } catch (e) {
      console.warn("Failed saving CRM state to localStorage:", e);
    }
  }

  // Fast zero-delay response for instant responsiveness
  private async delay(ms = 0) {
    if (ms <= 0) return Promise.resolve();
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // --- Auth & Users ---
  async login(email: string, password: string): Promise<User | null> {
    await this.delay(0);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (cleanEmail === 'admin@user.com' && cleanPass === '123456') {
      return {
        id: 'admin-1',
        email: 'admin@user.com',
        name: 'System Admin',
        role: 'admin',
        phone: '+1 (555) 000-1122',
        whatsappNumber: '+1 (555) 000-1122',
        whatsappConnected: true,
        title: 'Managing Director & Super Admin'
      };
    }

    const agent = this.agents.find(a => a.email.toLowerCase() === cleanEmail && a.password === cleanPass);
    if (agent) {
      const { password: _, ...userData } = agent;
      return userData;
    }

    return null;
  }

  async getUser(id: string): Promise<User | null> {
    await this.delay(0);
    if (id === 'admin-1' || id === 'admin') {
      return {
        id: 'admin-1',
        email: 'admin@user.com',
        name: 'System Admin',
        role: 'admin',
        phone: '+1 (555) 000-1122',
        whatsappNumber: '+1 (555) 000-1122',
        whatsappConnected: true,
        title: 'Managing Director & Super Admin'
      };
    }
    const agent = this.agents.find(a => a.id === id);
    if (agent) {
      const { password: _, ...userData } = agent;
      return userData;
    }
    return null;
  }

  async getAllUsers(): Promise<User[]> {
    await this.delay(0);
    const adminUser: User = {
      id: 'admin-1',
      email: 'admin@user.com',
      name: 'System Admin',
      role: 'admin',
      phone: '+1 (555) 000-1122',
      whatsappNumber: '+1 (555) 000-1122',
      whatsappConnected: true,
      title: 'Managing Director & Super Admin'
    };
    const agentUsers = this.agents.map(({ password: _, ...a }) => a);
    return [adminUser, ...agentUsers];
  }

  // --- Agents ---
  async getAgents(startDate?: string, endDate?: string): Promise<Agent[]> {
    await this.delay(0);
    return this.agents.map(({ password: _, ...a }) => a);
  }

  async getAgentById(id: string): Promise<Agent | null> {
    await this.delay(0);
    const found = this.agents.find(a => a.id === id);
    if (!found) return null;
    const { password: _, ...agent } = found;
    return agent;
  }

  async addAgent(agentData: Omit<Agent, 'id' | 'salesCount' | 'points' | 'createdAt'> & { password?: string }): Promise<Agent> {
    await this.delay(0);
    const newAgent: StoredAgent = {
      ...agentData,
      id: `agent-${Date.now()}`,
      salesCount: 0,
      points: 0,
      password: agentData.password || '123456',
      createdAt: new Date().toISOString(),
    };
    this.agents.push(newAgent);
    this.saveToStorage();
    const { password: _, ...created } = newAgent;
    return created;
  }

  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent | null> {
    await this.delay(0);
    const index = this.agents.findIndex(a => a.id === id);
    if (index === -1) return null;
    this.agents[index] = { ...this.agents[index], ...updates };
    this.saveToStorage();
    const { password: _, ...updated } = this.agents[index];
    return updated;
  }

  async deleteAgent(id: string): Promise<void> {
    await this.delay(0);
    this.agents = this.agents.filter(a => a.id !== id);
    this.saveToStorage();
  }

  // --- Leads / Customers ---
  async getCustomers(): Promise<Customer[]> {
    await this.delay(0);
    return [...this.customers];
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    await this.delay(0);
    return this.customers.find(c => c.id === id) || null;
  }

  async addCustomer(data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>, actor?: User): Promise<Customer> {
    await this.delay(0);
    const now = new Date().toISOString();
    
    // Auto find agent name if agentId is provided
    let agentName = data.agentName;
    if (data.agentId && !agentName) {
      const ag = this.agents.find(a => a.id === data.agentId);
      if (ag) agentName = ag.name;
    }

    const newCust: Customer = {
      ...data,
      id: `cust-${Date.now()}`,
      status: data.status || 'New / Unassigned',
      category: data.category || 'Prospective Client',
      source: data.source || 'Website Inquiry',
      priority: data.priority || 'Medium',
      agentName,
      contactAttemptsCount: data.contactAttemptsCount || 0,
      callCount: data.callCount || 0,
      whatsappCount: data.whatsappCount || 0,
      siteVisitCount: data.siteVisitCount || 0,
      negotiationCount: data.negotiationCount || 0,
      materialsSent: data.materialsSent || [],
      createdAt: now,
      updatedAt: now,
      lastActivityDate: now
    };

    this.customers.unshift(newCust);

    // Auto log creation activity
    this.logActivityInternal({
      leadId: newCust.id,
      leadName: newCust.name,
      agentId: actor?.id || newCust.agentId || 'system',
      agentName: actor?.name || agentName || 'System',
      type: 'lead_created',
      title: 'New Lead Registered',
      description: `Lead created via ${newCust.source} into ${newCust.status}. Category: ${newCust.category}.`,
      outcome: 'Completed',
      newStatus: newCust.status
    });

    // Auto schedule follow up calendar event if set
    if (newCust.nextFollowUpDate) {
      this.addCalendarEventInternal({
        title: `Follow-up: ${newCust.name}`,
        type: 'follow_up',
        date: newCust.nextFollowUpDate,
        time: newCust.nextFollowUpTime || '10:00 AM',
        agentId: newCust.agentId,
        agentName: newCust.agentName,
        leadId: newCust.id,
        leadName: newCust.name,
        status: 'Scheduled',
        notes: newCust.nextFollowUpNotes || 'Initial contact follow-up'
      });
    }

    this.saveToStorage();
    return newCust;
  }

  async updateCustomer(id: string, updates: Partial<Customer>, actor?: User): Promise<Customer | null> {
    await this.delay(0);
    const index = this.customers.findIndex(c => c.id === id);
    if (index === -1) return null;

    const prev = this.customers[index];
    const now = new Date().toISOString();

    let agentName = updates.agentName || prev.agentName;
    if (updates.agentId && updates.agentId !== prev.agentId) {
      const ag = this.agents.find(a => a.id === updates.agentId);
      if (ag) agentName = ag.name;
    }

    const updatedCustomer: Customer = {
      ...prev,
      ...updates,
      agentName,
      updatedAt: now,
      lastActivityDate: now
    };

    this.customers[index] = updatedCustomer;

    // Check if stage changed
    if (updates.status && updates.status !== prev.status) {
      this.logActivityInternal({
        leadId: updatedCustomer.id,
        leadName: updatedCustomer.name,
        agentId: actor?.id || updatedCustomer.agentId || 'system',
        agentName: actor?.name || updatedCustomer.agentName || 'System',
        type: updates.status === 'Closed - Won / Deal Booked' ? 'deal_won' : (updates.status === 'Closed - Lost / Cancelled / Cold' ? 'deal_lost' : 'stage_change'),
        title: `Pipeline Stage Changed to: ${updates.status}`,
        description: `Lead moved from "${prev.status}" to "${updates.status}". ${updates.lossReason ? `Loss Reason: ${updates.lossReason}.` : ''}`,
        previousStatus: prev.status,
        newStatus: updates.status,
        outcome: updates.status === 'Closed - Won / Deal Booked' ? 'Won' : (updates.status === 'Closed - Lost / Cancelled / Cold' ? 'Lost' : 'Completed'),
        lossReason: updates.lossReason
      });

      // If deal closed won, credit agent points and sales count
      if (updates.status === 'Closed - Won / Deal Booked' && updatedCustomer.agentId) {
        const agIndex = this.agents.findIndex(a => a.id === updatedCustomer.agentId);
        if (agIndex !== -1) {
          this.agents[agIndex].salesCount = (this.agents[agIndex].salesCount || 0) + 1;
          this.agents[agIndex].points = (this.agents[agIndex].points || 0) + 10;
        }
      }
    }

    // Check if assigned agent changed
    if (updates.agentId && updates.agentId !== prev.agentId) {
      this.logActivityInternal({
        leadId: updatedCustomer.id,
        leadName: updatedCustomer.name,
        agentId: actor?.id || 'admin-1',
        agentName: actor?.name || 'System Admin',
        type: 'lead_assigned',
        title: 'Lead Reassigned',
        description: `Assigned to ${agentName} (previously ${prev.agentName || 'Unassigned'}).`,
        outcome: 'Completed'
      });
    }

    // Auto schedule new follow-up if date changed
    if (updates.nextFollowUpDate && updates.nextFollowUpDate !== prev.nextFollowUpDate) {
      this.addCalendarEventInternal({
        title: `Follow-up: ${updatedCustomer.name}`,
        type: 'follow_up',
        date: updates.nextFollowUpDate,
        time: updates.nextFollowUpTime || '10:00 AM',
        agentId: updatedCustomer.agentId,
        agentName: updatedCustomer.agentName,
        leadId: updatedCustomer.id,
        leadName: updatedCustomer.name,
        status: 'Scheduled',
        notes: updates.nextFollowUpNotes || 'Scheduled follow-up action'
      });
    }

    this.saveToStorage();
    return updatedCustomer;
  }

  async deleteCustomer(id: string): Promise<void> {
    await this.delay(0);
    this.customers = this.customers.filter(c => c.id !== id);
    this.saveToStorage();
  }

  // --- Activity Tracking ---
  private logActivityInternal(activity: Omit<ActivityLog, 'id' | 'timestamp'>): ActivityLog {
    const newAct: ActivityLog = {
      ...activity,
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString()
    };
    this.activities.unshift(newAct);
    return newAct;
  }

  async logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<ActivityLog> {
    await this.delay(0);
    const created = this.logActivityInternal(activity);

    // Update lead counters & last activity date
    const custIndex = this.customers.findIndex(c => c.id === activity.leadId);
    if (custIndex !== -1) {
      const c = this.customers[custIndex];
      const now = new Date().toISOString();
      c.lastActivityDate = now;
      c.updatedAt = now;

      if (activity.type === 'call') {
        c.callCount = (c.callCount || 0) + 1;
        c.contactAttemptsCount = (c.contactAttemptsCount || 0) + 1;
      } else if (activity.type === 'whatsapp') {
        c.whatsappCount = (c.whatsappCount || 0) + 1;
      } else if (activity.type === 'site_visit_completed' || activity.type === 'site_visit_scheduled') {
        c.siteVisitCount = (c.siteVisitCount || 0) + 1;
      } else if (activity.type === 'negotiation') {
        c.negotiationCount = (c.negotiationCount || 0) + 1;
      }

      if (activity.newStatus) {
        c.status = activity.newStatus as PipelineStage;
      }
      if (activity.nextFollowUpDate) {
        c.nextFollowUpDate = activity.nextFollowUpDate;
      }
    }

    this.saveToStorage();
    return created;
  }

  async getActivities(filter?: { leadId?: string; agentId?: string; type?: string; date?: string; startDate?: string; endDate?: string; limit?: number }): Promise<ActivityLog[]> {
    await this.delay(0);
    let list = [...this.activities];
    if (filter?.leadId) {
      list = list.filter(a => a.leadId === filter.leadId);
    }
    if (filter?.agentId && filter.agentId !== 'all') {
      list = list.filter(a => a.agentId === filter.agentId);
    }
    if (filter?.type && filter.type !== 'all') {
      list = list.filter(a => a.type === filter.type);
    }
    if (filter?.date) {
      list = list.filter(a => a.timestamp.startsWith(filter.date!));
    }
    if (filter?.startDate && filter?.endDate) {
      list = list.filter(a => {
        const d = a.timestamp.split('T')[0];
        return d >= filter.startDate! && d <= filter.endDate!;
      });
    }
    if (filter?.limit) {
      list = list.slice(0, filter.limit);
    }
    return list;
  }

  // --- WhatsApp Communication Hub ---
  async getWhatsAppMessages(leadId?: string): Promise<WhatsAppMessage[]> {
    await this.delay(0);
    if (leadId) {
      return this.whatsappMessages.filter(m => m.leadId === leadId);
    }
    return [...this.whatsappMessages];
  }

  async sendWhatsAppMessage(msg: Omit<WhatsAppMessage, 'id' | 'timestamp' | 'status'>): Promise<WhatsAppMessage> {
    await this.delay(0);
    const newMsg: WhatsAppMessage = {
      ...msg,
      id: `wa-${Date.now()}`,
      status: 'sent',
      timestamp: new Date().toISOString()
    };
    this.whatsappMessages.push(newMsg);

    // If linked to a lead, log in activity timeline & materials sent
    if (msg.leadId) {
      const lead = this.customers.find(c => c.id === msg.leadId);
      const leadName = lead ? lead.name : (msg.leadName || 'Client');

      // Check if materials were sent
      const shared: any[] = [];
      if (msg.attachments && msg.attachments.length > 0) {
        msg.attachments.forEach(att => {
          const mat = {
            id: `mat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            type: att.type === 'brochure' ? 'Brochure' : (att.type === 'price_sheet' ? 'Price Sheet' : (att.type === 'floor_plan' ? 'Floor Plan' : (att.type === 'video' ? 'Video Tour' : 'Project Profile'))),
            title: att.name,
            size: att.size || '3.2 MB',
            sentAt: new Date().toISOString(),
            sentBy: msg.senderId,
            sentByName: msg.senderName,
            channel: 'WhatsApp' as const
          };
          shared.push(mat);
          if (lead) {
            lead.materialsSent = lead.materialsSent || [];
            lead.materialsSent.push(mat as any);
          }
        });
      }

      this.logActivityInternal({
        leadId: msg.leadId,
        leadName,
        agentId: msg.senderId,
        agentName: msg.senderName,
        type: 'whatsapp',
        title: shared.length > 0 ? `WhatsApp Materials Sent: ${shared.map(s => s.title).join(', ')}` : 'WhatsApp Message Sent',
        description: msg.text || 'Shared information over WhatsApp',
        outcome: shared.length > 0 ? 'Brochure Sent' : 'Info Sent',
        sharedMaterials: shared.length > 0 ? shared : undefined
      });

      if (lead) {
        lead.whatsappCount = (lead.whatsappCount || 0) + 1;
        lead.lastActivityDate = new Date().toISOString();
        if (shared.length > 0 && lead.status === 'Connected / Contacted') {
          lead.status = 'Profile / Brochure Sent';
        }
      }
    }

    this.saveToStorage();
    return newMsg;
  }

  // --- Internal Team Chat (WhatsApp Bridge) ---
  async getTeamMessages(channelId?: string): Promise<TeamChatMessage[]> {
    await this.delay(0);
    if (channelId) {
      return this.teamMessages.filter(m => m.channelId === channelId);
    }
    return [...this.teamMessages];
  }

  async sendTeamMessage(msg: Omit<TeamChatMessage, 'id' | 'timestamp' | 'read'>): Promise<TeamChatMessage> {
    await this.delay(0);
    let toName = msg.toName;
    let toPhone = msg.toPhone;
    let whatsAppDeliveryPhone = msg.whatsAppDeliveryPhone;

    if (msg.toId && (!toName || !toPhone)) {
      const recipient = await this.getUser(msg.toId);
      if (recipient) {
        toName = recipient.name;
        toPhone = recipient.phone || recipient.whatsappNumber;
        whatsAppDeliveryPhone = toPhone;
      }
    }

    const newMsg: TeamChatMessage = {
      ...msg,
      id: `tm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      toName,
      toPhone,
      viaWhatsApp: msg.viaWhatsApp ?? true,
      whatsAppStatus: msg.whatsAppStatus ?? 'synced',
      whatsAppDeliveryPhone: whatsAppDeliveryPhone || toPhone,
      read: true,
      timestamp: new Date().toISOString()
    };
    this.teamMessages.push(newMsg);
    this.saveToStorage();
    return newMsg;
  }

  // --- Daily Activity Reports (DAR) & Legacy Aliases ---
  async getDARs(): Promise<DailyActivityReport[]> {
    return this.getDailyReports();
  }

  async submitDAR(report: Omit<DailyActivityReport, 'id' | 'submittedAt'>): Promise<DailyActivityReport> {
    return this.submitDailyReport(report);
  }

  async reviewDAR(reportId: string, review: { reviewedBy: string; reviewerName: string; comments: string; rating?: number; status?: string }): Promise<DailyActivityReport | null> {
    return this.reviewDailyReport(reportId, review);
  }

  async getHolidaysAndLeaves(): Promise<HolidayOrLeave[]> {
    await this.delay(0);
    const hols: HolidayOrLeave[] = this.holidays.map(h => ({
      ...h,
      startDate: h.startDate || h.date || todayStr,
      endDate: h.endDate || h.date || todayStr,
      type: (h.type === 'public' ? 'public_holiday' : (h.type === 'office' ? 'office_holiday' : h.type)) as any,
      status: 'Approved'
    }));

    const leaves: HolidayOrLeave[] = this.agentLeaves.map(l => ({
      ...l,
      name: `Leave: ${l.agentName || 'Agent'}`,
      startDate: l.startDate,
      endDate: l.endDate,
      type: 'agent_leave' as any,
      status: l.status
    }));

    return [...hols, ...leaves];
  }

  async addHolidayOrLeave(item: any): Promise<any> {
    await this.delay(0);
    if (item.type === 'agent_leave') {
      return this.requestAgentLeave({
        agentId: item.agentId || 'agent-1',
        agentName: item.agentName || 'Agent',
        startDate: item.startDate,
        endDate: item.endDate,
        type: 'vacation',
        status: item.status || 'Approved',
        notes: item.name
      });
    } else {
      return this.addHoliday({
        name: item.name,
        date: item.startDate,
        startDate: item.startDate,
        endDate: item.endDate,
        type: item.type === 'office_holiday' ? 'office' : 'public'
      });
    }
  }

  // --- Legacy Agent & User Methods ---
  async createAgent(agentData: any): Promise<Agent> {
    return this.addAgent(agentData);
  }

  async resetAgentPassword(id: string, newPass: string): Promise<void> {
    await this.delay(0);
    const index = this.agents.findIndex(a => a.id === id);
    if (index !== -1) {
      this.agents[index].password = newPass;
      this.saveToStorage();
    }
  }

  async updateAgentCommission(id: string, rate: number): Promise<void> {
    await this.delay(0);
    const index = this.agents.findIndex(a => a.id === id);
    if (index !== -1) {
      this.agents[index].commissionRate = rate;
      this.saveToStorage();
    }
  }

  async updateAgentTarget(id: string, arg2: any, endDate?: string, target?: number): Promise<void> {
    await this.delay(0);
    const index = this.agents.findIndex(a => a.id === id);
    if (index !== -1) {
      if (Array.isArray(arg2)) {
        this.agents[index].targets = arg2;
      } else if (typeof arg2 === 'string' && endDate && target !== undefined) {
        const targets = this.agents[index].targets || [];
        const tIndex = targets.findIndex(t => t.startDate === arg2 && t.endDate === endDate);
        if (tIndex !== -1) {
          targets[tIndex].target = target;
        } else {
          targets.push({ startDate: arg2, endDate, target });
        }
        this.agents[index].targets = targets;
      }
      this.saveToStorage();
    }
  }

  async toggleAgentStatus(id: string): Promise<Agent | null> {
    await this.delay(0);
    const index = this.agents.findIndex(a => a.id === id);
    if (index === -1) return null;
    this.agents[index].active = !this.agents[index].active;
    this.saveToStorage();
    return this.agents[index];
  }

  async createProduct(productData: any): Promise<Product> {
    return this.addProduct(productData);
  }

  async getStats(): Promise<any> {
    await this.delay(0);
    const sold = this.customers.filter(c => c.status === 'Closed - Won / Deal Booked');
    return {
      activeCustomers: this.customers.length,
      totalAgents: this.agents.length,
      totalProducts: this.products.length,
      monthlyGrowth: 24.5,
      totalRevenue: sold.reduce((acc, c) => acc + (c.dealInfo?.dealValue || c.budget || 0), 0)
    };
  }

  // --- Team Chat Messages & Aliases ---
  async getMessages(fromUserId?: string, toUserId?: string): Promise<TeamChatMessage[]> {
    return this.getTeamMessages();
  }

  async sendMessage(arg1: any, toUserId?: string, text?: string, images?: string[]): Promise<TeamChatMessage> {
    await this.delay(0);
    if (typeof arg1 === 'string') {
      const fromUser = await this.getUser(arg1);
      return this.sendTeamMessage({
        fromId: arg1,
        fromName: fromUser?.name || 'Agent',
        fromRole: fromUser?.role || 'agent',
        toId: toUserId,
        text: text || '',
        images
      });
    } else {
      return this.sendTeamMessage({
        fromId: arg1.fromId || 'admin',
        fromName: arg1.fromName || 'User',
        fromRole: arg1.fromRole || 'admin',
        toId: arg1.toId,
        text: arg1.text || '',
        images: arg1.images,
        channelId: arg1.channelId || 'general'
      });
    }
  }

  async deleteMessage(id: string): Promise<void> {
    await this.delay(0);
    this.teamMessages = this.teamMessages.filter(m => m.id !== id);
    this.saveToStorage();
  }

  async updateMessage(id: string, newText: string): Promise<TeamChatMessage | null> {
    await this.delay(0);
    const index = this.teamMessages.findIndex(m => m.id === id);
    if (index === -1) return null;
    this.teamMessages[index].text = newText;
    this.teamMessages[index].edited = true;
    this.saveToStorage();
    return this.teamMessages[index];
  }

  async markAsRead(idsOrUserId: string | string[]): Promise<void> {
    await this.delay(0);
    if (Array.isArray(idsOrUserId)) {
      this.teamMessages.forEach(m => {
        if (idsOrUserId.includes(m.id)) m.read = true;
      });
    } else {
      this.teamMessages.forEach(m => {
        if (m.toId === idsOrUserId) m.read = true;
      });
    }
    this.saveToStorage();
  }
  async getDailyReports(filter?: { agentId?: string; date?: string }): Promise<DailyActivityReport[]> {
    await this.delay(0);
    let list = [...this.dailyReports];
    if (filter?.agentId) {
      list = list.filter(r => r.agentId === filter.agentId);
    }
    if (filter?.date) {
      list = list.filter(r => r.date === filter.date);
    }
    return list;
  }

  async submitDailyReport(report: Omit<DailyActivityReport, 'id' | 'submittedAt'>): Promise<DailyActivityReport> {
    await this.delay(0);
    const existingIndex = this.dailyReports.findIndex(r => r.agentId === report.agentId && r.date === report.date);
    const now = new Date().toISOString();

    if (existingIndex !== -1) {
      this.dailyReports[existingIndex] = {
        ...this.dailyReports[existingIndex],
        ...report,
        submittedAt: now
      };
      this.saveToStorage();
      return this.dailyReports[existingIndex];
    } else {
      const newRep: DailyActivityReport = {
        ...report,
        id: `dar-${Date.now()}`,
        submittedAt: now
      };
      this.dailyReports.unshift(newRep);
      this.saveToStorage();
      return newRep;
    }
  }

  async reviewDailyReport(reportId: string, review: { reviewedBy: string; reviewerName: string; comments: string; rating?: number; status?: string }): Promise<DailyActivityReport | null> {
    await this.delay(0);
    const index = this.dailyReports.findIndex(r => r.id === reportId);
    if (index === -1) return null;

    this.dailyReports[index].managerReview = {
      ...review,
      reviewedAt: new Date().toISOString(),
      status: 'Approved'
    };
    this.saveToStorage();
    return this.dailyReports[index];
  }

  // --- Calendar, Holidays & Leaves ---
  async getHolidays(): Promise<Holiday[]> {
    await this.delay(0);
    return [...this.holidays];
  }

  async addHoliday(hol: Omit<Holiday, 'id'>): Promise<Holiday> {
    await this.delay(0);
    const newHol: Holiday = { ...hol, id: `hol-${Date.now()}` };
    this.holidays.push(newHol);
    this.saveToStorage();
    return newHol;
  }

  async deleteHoliday(id: string): Promise<void> {
    await this.delay(0);
    this.holidays = this.holidays.filter(h => h.id !== id);
    this.saveToStorage();
  }

  async getAgentLeaves(agentId?: string): Promise<AgentLeave[]> {
    await this.delay(0);
    if (agentId) return this.agentLeaves.filter(l => l.agentId === agentId);
    return [...this.agentLeaves];
  }

  async requestAgentLeave(leave: Omit<AgentLeave, 'id'>): Promise<AgentLeave> {
    await this.delay(0);
    const newLeave: AgentLeave = { ...leave, id: `leave-${Date.now()}` };
    this.agentLeaves.unshift(newLeave);
    this.saveToStorage();
    return newLeave;
  }

  async updateLeaveStatus(id: string, status: 'Approved' | 'Rejected'): Promise<void> {
    await this.delay(0);
    const index = this.agentLeaves.findIndex(l => l.id === id);
    if (index !== -1) {
      this.agentLeaves[index].status = status;
      this.saveToStorage();
    }
  }

  private addCalendarEventInternal(evt: Omit<CalendarEvent, 'id'>): CalendarEvent {
    const newEvt: CalendarEvent = { ...evt, id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` };
    this.calendarEvents.push(newEvt);
    return newEvt;
  }

  async getCalendarEvents(filter?: { date?: string; agentId?: string }): Promise<CalendarEvent[]> {
    await this.delay(0);
    let list = [...this.calendarEvents];
    if (filter?.date) list = list.filter(e => e.date === filter.date);
    if (filter?.agentId) list = list.filter(e => e.agentId === filter.agentId);
    return list;
  }

  async addCalendarEvent(evt: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    await this.delay(0);
    const created = this.addCalendarEventInternal(evt);
    this.saveToStorage();
    return created;
  }

  async updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    await this.delay(0);
    const index = this.calendarEvents.findIndex(e => e.id === id);
    if (index === -1) return null;
    this.calendarEvents[index] = { ...this.calendarEvents[index], ...updates };
    this.saveToStorage();
    return this.calendarEvents[index];
  }

  // Calculates working days, holidays, leaves, and effective days for fair agent appraisal
  async calculateCalendarMetrics(startDate: string, endDate: string, agentId?: string) {
    await this.delay(0);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let totalCalendarDays = 0;
    let weekendHolidays = 0;
    let publicHolidays = 0;
    let approvedLeaveDays = 0;

    const cur = new Date(start);
    while (cur <= end) {
      totalCalendarDays++;
      const dayOfWeek = cur.getDay(); // 0 = Sunday, 6 = Saturday
      const dateStr = cur.toISOString().split('T')[0];

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendHolidays++;
      } else {
        const isHoliday = this.holidays.some(h => h.date === dateStr);
        if (isHoliday) {
          publicHolidays++;
        }
      }
      cur.setDate(cur.getDate() + 1);
    }

    if (agentId) {
      const leaves = this.agentLeaves.filter(l => l.agentId === agentId && l.status === 'Approved');
      leaves.forEach(l => {
        const lStart = new Date(l.startDate);
        const lEnd = new Date(l.endDate);
        const loop = new Date(Math.max(lStart.getTime(), start.getTime()));
        const maxEnd = new Date(Math.min(lEnd.getTime(), end.getTime()));
        while (loop <= maxEnd) {
          const dow = loop.getDay();
          if (dow !== 0 && dow !== 6) {
            approvedLeaveDays++;
          }
          loop.setDate(loop.getDate() + 1);
        }
      });
    }

    const standardWorkingDays = Math.max(0, totalCalendarDays - weekendHolidays - publicHolidays);
    const effectiveWorkingDays = Math.max(0, standardWorkingDays - approvedLeaveDays);

    return {
      totalCalendarDays,
      weekendHolidays,
      publicHolidays,
      approvedLeaveDays,
      standardWorkingDays,
      effectiveWorkingDays
    };
  }

  // --- Products & Properties ---
  async getProducts(endDate?: string): Promise<Product[]> {
    await this.delay(0);
    if (endDate) {
      return this.products.filter(p => !p.createdAt || p.createdAt.split('T')[0] <= endDate);
    }
    return [...this.products];
  }

  async addProduct(prod: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    await this.delay(0);
    const newProd: Product = { ...prod, id: `prod-${Date.now()}`, createdAt: new Date().toISOString() };
    this.products.push(newProd);
    this.saveToStorage();
    return newProd;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    await this.delay(0);
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.products[index] = { ...this.products[index], ...updates };
    this.saveToStorage();
    return this.products[index];
  }

  async deleteProduct(id: string): Promise<void> {
    await this.delay(0);
    this.products = this.products.filter(p => p.id !== id);
    this.saveToStorage();
  }

  // --- Comprehensive Performance Analytics ---
  async getPerformanceReport(options?: { startDate?: string; endDate?: string; agentId?: string }): Promise<any> {
    await this.delay(0);
    let agents = [...this.agents];
    if (options?.agentId && options.agentId !== 'all') {
      agents = agents.filter(a => a.id === options.agentId);
    }

    let leads = [...this.customers];
    if (options?.agentId && options.agentId !== 'all') {
      leads = leads.filter(l => l.agentId === options.agentId);
    }
    if (options?.startDate && options?.endDate) {
      leads = leads.filter(l => {
        const d = (l.updatedAt || l.createdAt || '').split('T')[0];
        return !d || (d >= options.startDate! && d <= options.endDate!);
      });
    }

    let activities = [...this.activities];
    if (options?.agentId && options.agentId !== 'all') {
      activities = activities.filter(a => a.agentId === options.agentId);
    }
    if (options?.startDate && options?.endDate) {
      activities = activities.filter(a => {
        const d = a.timestamp.split('T')[0];
        return d >= options.startDate! && d <= options.endDate!;
      });
    }

    const activityPerformance: ActivityPerformance[] = agents.map(ag => {
      const agLeads = leads.filter(l => l.agentId === ag.id);
      const agActs = activities.filter(a => a.agentId === ag.id);

      const assigned = agLeads.length;
      const newCollected = agActs.filter(a => a.type === 'lead_created').length;
      const contacted = agLeads.filter(l => l.status !== 'New / Unassigned').length;
      const callsTotal = agActs.filter(a => a.type === 'call').length;
      const callsConnected = agActs.filter(a => a.type === 'call' && a.outcome === 'Connected').length;
      const brochureSent = agActs.filter(a => a.type === 'brochure_sent' || (a.type === 'whatsapp' && a.sharedMaterials && a.sharedMaterials.length > 0)).length;
      const inboundGen = agLeads.filter(l => l.status === 'Inbound Interest / Call Back Received' || l.source === 'WhatsApp' || l.source === 'Website Inquiry').length;
      const visitsScheduled = agActs.filter(a => a.type === 'site_visit_scheduled').length;
      const visitsCompleted = agActs.filter(a => a.type === 'site_visit_completed').length;
      const visitHours = agActs.reduce((acc, a) => acc + (a.siteVisitDetails?.durationHours || 0), 0);
      const negotiations = agActs.filter(a => a.type === 'negotiation' || a.newStatus === 'Negotiation / Offer Stage').length;

      const attemptRate = assigned > 0 ? Math.min(100, Math.round((callsTotal / assigned) * 100)) : 0;
      const connRate = callsTotal > 0 ? Math.round((callsConnected / callsTotal) * 100) : 0;
      const reqRate = contacted > 0 ? Math.round((agLeads.filter(l => l.requirementsNotes).length / contacted) * 100) : 0;
      const leadToVisitRate = assigned > 0 ? Math.round((visitsCompleted / assigned) * 100) : 0;
      const visitToNegRate = visitsCompleted > 0 ? Math.round((negotiations / visitsCompleted) * 100) : 0;

      return {
        agentId: ag.id,
        agentName: ag.name,
        leadsAssigned: assigned,
        newLeadsCollected: newCollected,
        leadsContacted: contacted,
        contactAttemptRate: attemptRate,
        connectionRate: connRate,
        requirementCollectionRate: reqRate,
        brochureSentCount: brochureSent,
        inboundInterestCount: inboundGen,
        followUpCompletionRate: 88,
        overdueFollowUpCount: agLeads.filter(l => l.nextFollowUpDate && l.nextFollowUpDate < todayStr && l.status !== 'Closed - Won / Deal Booked' && l.status !== 'Closed - Lost / Cancelled / Cold').length,
        siteVisitsScheduled: visitsScheduled,
        siteVisitsCompleted: visitsCompleted,
        totalSiteVisitHours: Math.round(visitHours * 10) / 10,
        negotiationCount: negotiations,
        leadToVisitRate,
        visitToNegotiationRate: visitToNegRate
      };
    });

    const salesPerformance: SalesPerformance[] = agents.map(ag => {
      const agLeads = leads.filter(l => l.agentId === ag.id);
      const wonLeads = agLeads.filter(l => l.status === 'Closed - Won / Deal Booked');
      const lostLeads = agLeads.filter(l => l.status === 'Closed - Lost / Cancelled / Cold');
      
      const totalVal = wonLeads.reduce((acc, l) => acc + (l.dealInfo?.dealValue || l.budget || 0), 0);
      const avgVal = wonLeads.length > 0 ? Math.round(totalVal / wonLeads.length) : 0;
      const closedDeals = wonLeads.length;
      const totalDecided = wonLeads.length + lostLeads.length;
      const closureRate = totalDecided > 0 ? Math.round((wonLeads.length / totalDecided) * 100) : 0;
      const overallConvRate = agLeads.length > 0 ? Math.round((wonLeads.length / agLeads.length) * 100) : 0;
      const commission = wonLeads.reduce((acc, l) => acc + Math.round((l.dealInfo?.dealValue || l.budget || 0) * 0.02), 0);

      return {
        agentId: ag.id,
        agentName: ag.name,
        dealsWonCount: wonLeads.length,
        dealsLostCount: lostLeads.length,
        totalDealValue: totalVal,
        averageDealValue: avgVal,
        dealClosureRate: closureRate,
        negotiationToSaleRate: 75,
        overallLeadConversionRate: overallConvRate,
        commissionEarned: commission
      };
    });

    // Funnel counts across the 11 stages
    const funnel: Record<string, number> = {};
    const stageFunnel: { stage: string; count: number }[] = [];
    PIPELINE_STAGES.forEach(stage => {
      const count = leads.filter(l => l.status === stage).length;
      funnel[stage] = count;
      stageFunnel.push({ stage, count });
    });

    const wonDeals = leads.filter(l => l.status === 'Closed - Won / Deal Booked');
    const totalWonDeals = wonDeals.length;
    const totalSalesVolume = wonDeals.reduce((sum, l) => sum + (l.dealInfo?.dealValue || l.budget || 0), 0);
    const averageDealSize = totalWonDeals > 0 ? Math.round(totalSalesVolume / totalWonDeals) : 0;
    const totalSiteVisits = activities.filter(a => a.type === 'site_visit_completed').length;
    const overallConversionRate = leads.length > 0 ? (totalWonDeals / leads.length) * 100 : 0;

    const lostReasonBreakdown: Record<string, number> = {};
    leads.filter(l => l.status === 'Closed - Lost / Cancelled / Cold' && l.lossReason).forEach(l => {
      const r = l.lossReason || 'Other';
      lostReasonBreakdown[r] = (lostReasonBreakdown[r] || 0) + 1;
    });

    const agentList = agents.map(ag => {
      const agLeads = leads.filter(l => l.agentId === ag.id);
      const agActs = activities.filter(a => a.agentId === ag.id);
      const won = agLeads.filter(l => l.status === 'Closed - Won / Deal Booked');
      const lost = agLeads.filter(l => l.status === 'Closed - Lost / Cancelled / Cold');
      const totalSales = won.reduce((acc, l) => acc + (l.dealInfo?.dealValue || l.budget || 0), 0);

      return {
        agentId: ag.id,
        agentName: ag.name,
        leadsAssigned: agLeads.length,
        callsCompleted: agActs.filter(a => a.type === 'call').length,
        whatsappSent: agActs.filter(a => a.type === 'whatsapp').length,
        siteVisitsCompleted: agActs.filter(a => a.type === 'site_visit_completed').length,
        siteVisitHours: Math.round(agActs.reduce((acc, a) => acc + (a.siteVisitDetails?.durationHours || 0), 0) * 10) / 10,
        negotiationsConducted: agActs.filter(a => a.type === 'negotiation' || a.newStatus === 'Negotiation / Offer Stage').length,
        dealsWon: won.length,
        dealsLost: lost.length,
        totalSalesValue: totalSales,
        conversionRate: agLeads.length > 0 ? (won.length / agLeads.length) * 100 : 0
      };
    });

    return { 
      activityPerformance, 
      salesPerformance, 
      funnel,
      stageFunnel,
      totalLeads: leads.length,
      totalWonDeals,
      totalSalesVolume,
      averageDealSize,
      totalSiteVisits,
      overallConversionRate,
      agents: agentList,
      lostReasonBreakdown
    };
  }

  setBaseUrl(url: string) {
    // Adapter method for API compatibility
  }

  // --- Financials ---
  async getFinancialConfig(endDate?: string) {
    await this.delay(0);
    return { ...this.financialSettings };
  }

  async updateFinancialConfig(newConfig: FinancialConfig) {
    await this.delay(0);
    this.financialSettings = newConfig;
    this.saveToStorage();
  }

  async getFinancialReport(startDate?: string, endDate?: string) {
    await this.delay(0);
    const sold = this.customers.filter(c => c.status === 'Closed - Won / Deal Booked');
    const salesRevenue = sold.reduce((acc, c) => acc + (c.dealInfo?.dealValue || c.budget || 0), 0);
    const serviceRevenue = Math.round(salesRevenue * 0.03);
    const propertyTransactionCosts = Math.round(salesRevenue * 0.015);

    const soldProducts = sold.map(c => ({
      id: c.id,
      title: `${c.name} - ${c.dealInfo?.project || c.interestedProject || c.projectType || 'Residential Unit'}`,
      price: c.dealInfo?.dealValue || c.budget || 0,
      agentName: this.agents.find(a => a.id === c.agentId)?.name || 'Ridge Park Agent'
    }));

    const commissions = this.agents.map(ag => {
      const agWon = sold.filter(c => c.agentId === ag.id);
      const agSales = agWon.reduce((acc, c) => acc + (c.dealInfo?.dealValue || c.budget || 0), 0);
      const rate = (ag as any).commissionRate || 0.02;
      return {
        name: ag.name,
        amount: Math.round(agSales * rate),
        agentId: ag.id
      };
    });

    const totalCommissions = commissions.reduce((acc, c) => acc + c.amount, 0);
    const netRevenue = salesRevenue + serviceRevenue - propertyTransactionCosts - totalCommissions;

    return {
      grossSales: salesRevenue,
      totalCommissions,
      netRevenue,
      income: {
        salesRevenue,
        serviceRevenue,
        details: {
          soldProducts
        }
      },
      expenses: {
        propertyTransactionCosts,
        details: {
          commissions
        }
      },
      settings: this.financialSettings
    };
  }
}

export const mockDb = new MockDatabase();
export const db = mockDb;
export default mockDb;
