
export type UserRole = 'admin' | 'agent';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
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
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string; // e.g., 'Lead', 'Negotiation', 'Closed'
  agentId?: string; // Assigned agent
  budget: number;
  propertyId?: string; // Linked sold property
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  title: string;
  address: string;
  price: number;
  type: 'House' | 'Apartment' | 'Condo' | 'Land';
  status: 'Available' | 'Pending' | 'Sold';
  quantity: number; // Inventory count
  agentId?: string;
  images?: string[];
  createdAt: string;
  vatTax?: number;
  otherCost?: number;
}

export interface Status {
  id: string;
  label: string;
  color: string;
}

export interface Message {
  id: string;
  fromId: string;
  toId: string;
  text: string;
  timestamp: string;
  read: boolean;
  images?: string[];
  edited?: boolean;
}

export interface FinancialConfig {
  // Income
  interestIncome: number;
  otherIncome: number;
  
  // Expenses (Manual)
  rent: number;
  utilities: number;
  supplies: number;
  marketing: number;
  insurance: number;
  maintenance: number;
  misc: number;
  baseSalaries: number; // Fixed staff salaries (Agents are calc'd separately)
  depreciation: number;
  taxes: number; // Now manual
}