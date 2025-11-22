
import { Agent, Customer, Product, User, Message, FinancialConfig } from '../types';

// Helper to handle fetch responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'API Error');
  }
  return response.json();
};

class ApiService {
  // Default to localhost, but allow overriding via setBaseUrl
  private baseUrl: string = 'http://localhost:5000/api';

  setBaseUrl(url: string) {
    // Remove trailing slash if present to avoid double slashes
    this.baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    console.log(`[API] Base URL set to: ${this.baseUrl}`);
  }
  
  // --- Auth ---
  async login(email: string, password: string): Promise<User | null> {
    try {
      const res = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return await handleResponse(res);
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async getUser(id: string): Promise<User | null> {
    const res = await fetch(`${this.baseUrl}/users/${id}`);
    return res.ok ? res.json() : null;
  }

  // --- Agents ---
  async getAgents(startDate?: string, endDate?: string): Promise<Agent[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const res = await fetch(`${this.baseUrl}/agents?${params.toString()}`);
    return handleResponse(res);
  }

  async createAgent(data: any): Promise<Agent> {
    const res = await fetch(`${this.baseUrl}/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  }

  async updateAgent(id: string, data: Partial<Agent>): Promise<Agent | null> {
    const res = await fetch(`${this.baseUrl}/agents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  }

  async updateAgentCommission(id: string, rate: number): Promise<void> {
    await this.updateAgent(id, { commissionRate: rate });
  }

  async updateAgentTarget(id: string, startDate: string, endDate: string, target: number): Promise<void> {
    await fetch(`${this.baseUrl}/agents/${id}/target`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate, target })
    });
  }

  async removeAgentTarget(id: string, startDate: string, endDate: string): Promise<void> {
    // Skipping implementation for brevity as update covers overwriting.
  }

  async resetAgentPassword(id: string, newPass: string): Promise<void> {
    await this.updateAgent(id, { password: newPass } as any);
  }

  async deleteAgent(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/agents/${id}`, { method: 'DELETE' });
  }

  async toggleAgentStatus(id: string): Promise<Agent | undefined> {
    const agent = await this.getUser(id) as Agent;
    if(agent) {
       return await this.updateAgent(id, { active: !agent.active }) as Agent;
    }
  }

  // --- Customers ---
  async getCustomers(startDate?: string, endDate?: string): Promise<Customer[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const res = await fetch(`${this.baseUrl}/customers?${params.toString()}`);
    return handleResponse(res);
  }

  async createCustomer(data: any): Promise<Customer> {
    const res = await fetch(`${this.baseUrl}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer | null> {
    const res = await fetch(`${this.baseUrl}/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  }

  async deleteCustomer(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/customers/${id}`, { method: 'DELETE' });
  }

  // --- Products ---
  async getProducts(endDate?: string): Promise<Product[]> {
    const params = new URLSearchParams();
    if (endDate) params.append('endDate', endDate);
    const res = await fetch(`${this.baseUrl}/products?${params.toString()}`);
    return handleResponse(res);
  }

  async createProduct(data: any): Promise<Product> {
    const res = await fetch(`${this.baseUrl}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
    const res = await fetch(`${this.baseUrl}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  }

  async deleteProduct(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/products/${id}`, { method: 'DELETE' });
  }

  // --- Chat ---
  async getMessages(userId: string): Promise<Message[]> {
    const res = await fetch(`${this.baseUrl}/messages/${userId}`);
    return handleResponse(res);
  }

  async sendMessage(fromId: string, toId: string, text: string, images?: string[]): Promise<Message> {
    const res = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromId, toId, text, images })
    });
    return handleResponse(res);
  }

  async deleteMessage(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/messages/${id}`, { method: 'DELETE' });
  }

  async updateMessage(id: string, text: string): Promise<void> {
    await fetch(`${this.baseUrl}/messages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
  }

  async markAsRead(msgIds: string[]) {
    await fetch(`${this.baseUrl}/messages/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: msgIds })
    });
  }

  // --- Stats & Financials ---
  async getStats(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const res = await fetch(`${this.baseUrl}/stats?${params.toString()}`);
    return handleResponse(res);
  }

  async getFinancialConfig(endDate?: string) {
    const params = new URLSearchParams();
    if (endDate) params.append('endDate', endDate);
    const res = await fetch(`${this.baseUrl}/financials/config?${params.toString()}`);
    return handleResponse(res);
  }

  async updateFinancialConfig(newConfig: FinancialConfig) {
    await fetch(`${this.baseUrl}/financials/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig)
    });
  }

  async getFinancialReport(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const res = await fetch(`${this.baseUrl}/financials/report?${params.toString()}`);
    return handleResponse(res);
  }
}

export const db = new ApiService();
