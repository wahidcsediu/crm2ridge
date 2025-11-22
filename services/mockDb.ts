
import { Agent, Customer, Product, Status, User, Message, FinancialConfig, TargetRecord } from '../types';

// Internal type for storage to include passwords
interface StoredAgent extends Agent {
  password?: string;
}

// Helper to get relative dates
// We make initial data VERY recent (last 2-5 days) so shifting to previous month shows nothing
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

// Initial Mock Data
const INITIAL_ADMIN: User = {
  id: 'admin-1',
  email: 'admin@user.com',
  name: 'System Admin',
  role: 'admin',
};

// Helper for current month range
const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
const currentMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

// NOTE: Agents created 1-2 days ago. In previous months, they did not exist.
const INITIAL_AGENTS: StoredAgent[] = [
  { 
    id: 'agent-1', 
    email: 'agent@bond.com', 
    name: 'James Bond', 
    role: 'agent', 
    salesCount: 12, 
    active: true, 
    password: '123456',
    points: 120,
    commissionRate: 500, 
    targets: [
      { startDate: currentMonthStart, endDate: currentMonthEnd, target: 20 }
    ],
    createdAt: daysAgo(2) 
  },
  { 
    id: 'agent-2', 
    email: 'agent@sarah.com', 
    name: 'Sarah Connor', 
    role: 'agent', 
    salesCount: 8, 
    active: true, 
    password: '123456',
    points: 80,
    commissionRate: 450,
    targets: [
      { startDate: currentMonthStart, endDate: currentMonthEnd, target: 12 }
    ],
    createdAt: daysAgo(1)
  },
];

const INITIAL_CUSTOMERS: Customer[] = [
  { 
    id: 'cust-1', 
    name: 'Alice Wonderland', 
    email: 'alice@example.com', 
    phone: '555-0101', 
    status: 'Negotiation', 
    budget: 450000, 
    agentId: 'agent-1',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(1)
  },
  { 
    id: 'cust-2', 
    name: 'Bob Builder', 
    email: 'bob@example.com', 
    phone: '555-0102', 
    status: 'Lead', 
    budget: 300000, 
    agentId: 'agent-2',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2)
  },
  { 
    id: 'cust-3', 
    name: 'Charlie Bucket', 
    email: 'charlie@example.com', 
    phone: '555-0103', 
    status: 'Closed', 
    budget: 1200000, 
    agentId: 'agent-1',
    createdAt: daysAgo(4),
    updatedAt: daysAgo(0) 
  },
];

const INITIAL_PRODUCTS: Product[] = [
  { 
    id: 'prod-1', 
    title: 'Sunset Villa', 
    address: '123 Ocean Dr', 
    price: 12000000, 
    type: 'House', 
    status: 'Available', 
    quantity: 1,
    agentId: 'agent-1',
    images: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80', // Modern Villa
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'  // Pool/Patio
    ],
    createdAt: daysAgo(3),
    vatTax: 50000,
    otherCost: 10000
  },
  { 
    id: 'prod-2', 
    title: 'Downtown Loft', 
    address: '456 Main St', 
    price: 8500000, 
    type: 'Apartment', 
    status: 'Pending', 
    quantity: 5,
    agentId: 'agent-2',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80' // Loft Interior
    ],
    createdAt: daysAgo(2),
    vatTax: 25000,
    otherCost: 5000
  },
  { 
    id: 'prod-3', 
    title: 'Lakeside Cabin', 
    address: '789 Lakeview Rd', 
    price: 15000000, 
    type: 'House', 
    status: 'Sold', 
    quantity: 0,
    agentId: 'agent-1',
    images: [
      'https://images.unsplash.com/photo-1449156493391-d2cfa28e468b?auto=format&fit=crop&w=800&q=80' // Cabin
    ],
    createdAt: daysAgo(4),
    vatTax: 75000,
    otherCost: 15000
  },
];

// Initial Manual Ledger set to 0
const INITIAL_FINANCIAL_CONFIG: FinancialConfig = {
  interestIncome: 0,
  otherIncome: 0,
  rent: 0,
  utilities: 0,
  supplies: 0,
  marketing: 0,
  insurance: 0,
  maintenance: 0,
  misc: 0,
  baseSalaries: 0,
  depreciation: 0,
  taxes: 0,
};

class MockDatabase {
  private agents: StoredAgent[] = [...INITIAL_AGENTS];
  private customers: Customer[] = [...INITIAL_CUSTOMERS];
  private products: Product[] = [...INITIAL_PRODUCTS];
  private messages: Message[] = [];
  private financialSettings: FinancialConfig = { ...INITIAL_FINANCIAL_CONFIG };

  // Helper to simulate network delay
  private async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private isDateInRange(dateStr: string, startDate?: string, endDate?: string): boolean {
    if (!startDate && !endDate) return true;
    
    const targetTime = new Date(dateStr).getTime();
    let start = -Infinity;
    let end = Infinity;

    if (startDate) start = new Date(startDate).getTime();
    if (endDate) end = new Date(endDate).getTime();
    
    return targetTime >= start && targetTime <= end;
  }

  // Used for checking if an entity existed by the end of the requested period
  private existedBy(dateStr: string, endDate?: string): boolean {
      if (!endDate) return true;
      return new Date(dateStr).getTime() <= new Date(endDate).getTime();
  }

  // --- Auth ---
  async login(email: string, password: string): Promise<User | null> {
    await this.delay(800);
    if (email === INITIAL_ADMIN.email && password === '123456') return INITIAL_ADMIN;
    const agent = this.agents.find(a => a.email === email);
    if (agent && agent.active && agent.password === password) {
      const { password: _, ...userWithoutPass } = agent;
      return userWithoutPass;
    }
    return null;
  }

  async getUser(id: string): Promise<User | null> {
    if (id === INITIAL_ADMIN.id) return INITIAL_ADMIN;
    const agent = this.agents.find(a => a.id === id);
    if (agent) {
        const { password: _, ...userWithoutPass } = agent;
        return userWithoutPass;
    }
    return null;
  }

  // --- Agents ---
  async getAgents(startDate?: string, endDate?: string): Promise<Agent[]> {
    await this.delay();
    return this.agents
        .filter(a => this.existedBy(a.createdAt, endDate))
        .map(({ password, ...agent }) => agent);
  }

  async createAgent(agentData: { name: string; email: string; password?: string }): Promise<Agent> {
    await this.delay();
    const newAgent: StoredAgent = {
      id: `agent-${Date.now()}`,
      name: agentData.name,
      email: agentData.email,
      role: 'agent',
      salesCount: 0,
      active: true,
      points: 0,
      commissionRate: 100,
      targets: [],
      password: agentData.password || '123456',
      createdAt: new Date().toISOString(),
    };
    this.agents.push(newAgent);
    const { password, ...createdAgent } = newAgent;
    return createdAgent;
  }

  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent | null> {
    await this.delay();
    const index = this.agents.findIndex(a => a.id === id);
    if (index === -1) return null;
    this.agents[index] = { ...this.agents[index], ...updates };
    const { password, ...updatedAgent } = this.agents[index];
    return updatedAgent;
  }

  async updateAgentCommission(id: string, rate: number): Promise<void> {
    await this.delay();
    const agent = this.agents.find(a => a.id === id);
    if (agent) agent.commissionRate = rate;
  }

  async updateAgentTarget(id: string, startDate: string, endDate: string, target: number): Promise<void> {
      await this.delay();
      const agent = this.agents.find(a => a.id === id);
      if (agent) {
          if (!agent.targets) agent.targets = [];
          const existingIndex = agent.targets.findIndex(t => t.startDate === startDate && t.endDate === endDate);
          if (existingIndex >= 0) {
              agent.targets[existingIndex].target = target;
          } else {
              agent.targets.push({ startDate, endDate, target });
          }
      }
  }

  async removeAgentTarget(id: string, startDate: string, endDate: string): Promise<void> {
    await this.delay();
    const agent = this.agents.find(a => a.id === id);
    if (agent && agent.targets) {
        agent.targets = agent.targets.filter(t => !(t.startDate === startDate && t.endDate === endDate));
    }
  }

  async resetAgentPassword(id: string, newPass: string): Promise<void> {
    await this.delay();
    const agent = this.agents.find(a => a.id === id);
    if (agent) agent.password = newPass;
  }

  async deleteAgent(id: string): Promise<void> {
    await this.delay();
    this.agents = this.agents.filter(a => a.id !== id);
  }

  async toggleAgentStatus(id: string): Promise<Agent | undefined> {
    await this.delay();
    const agent = this.agents.find(a => a.id === id);
    if (agent) agent.active = !agent.active;
    return agent;
  }

  // --- Customers ---
  async getCustomers(startDate?: string, endDate?: string): Promise<Customer[]> {
    await this.delay();
    let filtered = [...this.customers];
    if (startDate && endDate) {
        filtered = filtered.filter(c => this.isDateInRange(c.createdAt, startDate, endDate));
    } else if (endDate) {
        filtered = filtered.filter(c => this.existedBy(c.createdAt, endDate));
    }
    return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async createCustomer(data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    await this.delay();
    const now = new Date().toISOString();
    const newCust: Customer = { 
        ...data, 
        id: `cust-${Date.now()}`,
        createdAt: now,
        updatedAt: now
    };
    this.customers.push(newCust);
    return newCust;
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer | null> {
    await this.delay();
    const index = this.customers.findIndex(c => c.id === id);
    if (index === -1) return null;

    const oldStatus = this.customers[index].status;
    const newStatus = data.status;
    
    if (newStatus === 'Closed' && oldStatus !== 'Closed') {
        const agentId = this.customers[index].agentId;
        if (agentId) {
            const agentIndex = this.agents.findIndex(a => a.id === agentId);
            if (agentIndex !== -1) {
                this.agents[agentIndex].points += 10;
                this.agents[agentIndex].salesCount += 1;
            }
        }
    }

    if (data.propertyId) {
        const prodIndex = this.products.findIndex(p => p.id === data.propertyId);
        if (prodIndex !== -1) {
            const product = this.products[prodIndex];
            if (newStatus === 'Closed' && oldStatus !== 'Closed') {
                if (product.quantity > 0) product.quantity -= 1;
                if (product.quantity === 0) product.status = 'Sold';
            }
        }
    }

    this.customers[index] = { 
        ...this.customers[index], 
        ...data,
        updatedAt: new Date().toISOString()
    };
    
    return this.customers[index];
  }

  async deleteCustomer(id: string): Promise<void> {
    await this.delay();
    this.customers = this.customers.filter(c => c.id !== id);
  }

  // --- Products ---
  async getProducts(endDate?: string): Promise<Product[]> {
    await this.delay();
    return this.products
        .filter(p => this.existedBy(p.createdAt, endDate))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createProduct(data: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    await this.delay();
    const newProd: Product = { 
        ...data, 
        id: `prod-${Date.now()}`,
        quantity: data.quantity ?? 1, 
        createdAt: new Date().toISOString() 
    };
    this.products.push(newProd);
    return newProd;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
    await this.delay();
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    const updatedProduct = { ...this.products[index], ...data };
    
    if (typeof data.quantity === 'number') {
        if (updatedProduct.quantity === 0) {
            updatedProduct.status = 'Sold';
        } else if (updatedProduct.status === 'Sold' && updatedProduct.quantity > 0) {
            updatedProduct.status = 'Available';
        }
    }

    this.products[index] = updatedProduct;
    return this.products[index];
  }

  async deleteProduct(id: string): Promise<void> {
    await this.delay();
    this.products = this.products.filter(p => p.id !== id);
  }

  // --- Chat System ---
  async getMessages(userId: string): Promise<Message[]> {
    return this.messages.filter(m => m.fromId === userId || m.toId === userId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async sendMessage(fromId: string, toId: string, text: string, images?: string[]): Promise<Message> {
      const msg: Message = {
          id: `msg-${Date.now()}`,
          fromId,
          toId,
          text,
          timestamp: new Date().toISOString(),
          read: false,
          images: images || [],
          edited: false
      };
      this.messages.push(msg);
      return msg;
  }

  async deleteMessage(id: string): Promise<void> {
      this.messages = this.messages.filter(m => m.id !== id);
  }

  async updateMessage(id: string, text: string): Promise<void> {
      const msg = this.messages.find(m => m.id === id);
      if (msg) {
          msg.text = text;
          msg.edited = true;
      }
  }

  async markAsRead(msgIds: string[]) {
      this.messages.forEach(m => {
          if (msgIds.includes(m.id)) {
              m.read = true;
          }
      });
  }

  // --- Financials & Stats ---
  async getStats(startDate?: string, endDate?: string) {
    await this.delay();
    
    const visibleProducts = this.products.filter(p => this.existedBy(p.createdAt, endDate));
    const activeListings = visibleProducts.filter(p => p.status === 'Available' || p.quantity > 0).length;
    const visibleAgents = this.agents.filter(a => this.existedBy(a.createdAt, endDate));
    const customersInRange = this.customers.filter(c => this.isDateInRange(c.createdAt, startDate, endDate));
    
    const closedCustomersInRange = this.customers.filter(c => 
        c.status === 'Closed' && this.isDateInRange(c.updatedAt, startDate, endDate)
    );
    
    let totalSalesRevenue = 0;
    closedCustomersInRange.forEach(c => {
        if (c.propertyId) {
            const p = this.products.find(prod => prod.id === c.propertyId);
            if (p) totalSalesRevenue += p.price;
        }
    });

    return {
      totalSales: totalSalesRevenue,
      activeListings: activeListings,
      totalCustomers: customersInRange.length,
      totalAgents: visibleAgents.length,
    };
  }

  async getFinancialConfig(endDate?: string) {
    await this.delay();
    
    if (endDate) {
        const earliestEntity = this.agents.reduce((earliest, current) => {
            return new Date(current.createdAt).getTime() < new Date(earliest).getTime() ? current.createdAt : earliest;
        }, new Date().toISOString());

        if (new Date(endDate).getTime() < new Date(earliestEntity).getTime()) {
            return { ...INITIAL_FINANCIAL_CONFIG };
        }
    }

    return { ...this.financialSettings };
  }

  async updateFinancialConfig(newConfig: FinancialConfig) {
    await this.delay();
    this.financialSettings = newConfig;
  }

  async getFinancialReport(startDate?: string, endDate?: string) {
    await this.delay();
    
    const closedCustomersInRange = this.customers.filter(c => 
        c.status === 'Closed' && this.isDateInRange(c.updatedAt, startDate, endDate)
    );

    let salesRevenue = 0;
    const soldItems: any[] = [];

    closedCustomersInRange.forEach(c => {
        if (c.propertyId) {
            const p = this.products.find(prod => prod.id === c.propertyId);
            if (p) {
                salesRevenue += p.price;
                soldItems.push({ title: p.title, price: p.price, date: c.updatedAt });
            }
        }
    });

    const config = await this.getFinancialConfig(endDate);
    
    const agentsExist = this.agents.some(a => this.existedBy(a.createdAt, endDate));
    
    if (!agentsExist && salesRevenue === 0) {
        return {
            income: { salesRevenue: 0, serviceRevenue: 0, interestIncome: 0, otherIncome: 0, totalIncome: 0, details: { soldProducts: [] } },
            expenses: { rent: 0, salariesWages: 0, utilities: 0, suppliesRawMaterials: 0, depreciation: 0, taxes: 0, insurance: 0, marketingAdvertising: 0, maintenanceRepairs: 0, miscellaneousExpenses: 0, propertyTransactionCosts: 0, totalExpenses: 0, details: { baseSalaries: 0, commissions: [], propertyCosts: [] } },
            netProfitLoss: 0
        };
    }

    const serviceRevenue = salesRevenue * 0.03; 
    const totalIncome = salesRevenue + serviceRevenue + config.interestIncome + config.otherIncome;

    let totalCommissions = 0;
    const agentCommissions: {name: string, amount: number, points: number}[] = [];
    
    const visibleAgents = this.agents.filter(a => this.existedBy(a.createdAt, endDate));

    visibleAgents.forEach(agent => {
        const agentClosedCount = closedCustomersInRange.filter(c => c.agentId === agent.id).length;
        const pointsEarned = agentClosedCount * 10; 
        const amount = (pointsEarned / 10) * agent.commissionRate;
        totalCommissions += amount;
        agentCommissions.push({ name: agent.name, amount, points: pointsEarned });
    });

    const totalSalaries = config.baseSalaries + totalCommissions;
    
    let totalPropertyTransactionCosts = 0;
    const propertyCosts = soldItems.map(item => {
        const p = this.products.find(prod => prod.title === item.title);
        if (p) {
            const cost = (p.vatTax || 0) + (p.otherCost || 0);
            totalPropertyTransactionCosts += cost;
            return { title: p.title, cost, breakdown: `VAT: ${p.vatTax || 0}, Other: ${p.otherCost || 0}` };
        }
        return { title: item.title, cost: 0, breakdown: 'N/A' };
    });

    const taxes = config.taxes;
    
    const totalExpenses = 
        config.rent + 
        totalSalaries + 
        config.utilities + 
        config.supplies + 
        config.depreciation + 
        taxes + 
        config.insurance + 
        config.marketing + 
        config.maintenance + 
        config.misc + 
        totalPropertyTransactionCosts;

    const netProfitLoss = totalIncome - totalExpenses;

    return {
        income: {
            salesRevenue,
            serviceRevenue,
            interestIncome: config.interestIncome,
            otherIncome: config.otherIncome,
            totalIncome,
            details: {
                soldProducts: soldItems
            }
        },
        expenses: {
            rent: config.rent,
            salariesWages: totalSalaries,
            utilities: config.utilities,
            suppliesRawMaterials: config.supplies,
            depreciation: config.depreciation,
            taxes,
            insurance: config.insurance,
            marketingAdvertising: config.marketing,
            maintenanceRepairs: config.maintenance,
            miscellaneousExpenses: config.misc,
            propertyTransactionCosts: totalPropertyTransactionCosts,
            totalExpenses,
            details: {
                baseSalaries: config.baseSalaries,
                commissions: agentCommissions,
                propertyCosts
            }
        },
        netProfitLoss
    };
  }
}

export const db = new MockDatabase();
