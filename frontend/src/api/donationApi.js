import axiosClient from './axiosClient';
import { inventoryApi } from './inventoryApi';

const INITIAL_MOCK_DONATIONS = [
  {
    id: 'DON-501',
    donorName: 'Anil Kumar',
    donorEmail: 'anil@example.com',
    type: 'GOODS',
    itemName: 'Emergency Blankets',
    quantity: 50,
    unit: 'Pcs',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'DON-502',
    donorName: 'Sunita Rao',
    donorEmail: 'sunita@example.com',
    type: 'MONEY',
    amount: 5000,
    currency: 'INR',
    transactionRef: 'PAY-987654321',
    status: 'VERIFIED',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'DON-503',
    donorName: 'Care Foundation',
    donorEmail: 'contact@carefdn.org',
    type: 'GOODS',
    itemName: 'Drinking Water (20L Cans)',
    quantity: 100,
    unit: 'Cans',
    status: 'APPROVED',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

function getStoredDonations() {
  const stored = localStorage.getItem('mock_donations');
  if (stored) {
    try { return JSON.parse(stored); } catch { /* fallback */ }
  }
  localStorage.setItem('mock_donations', JSON.stringify(INITIAL_MOCK_DONATIONS));
  return INITIAL_MOCK_DONATIONS;
}

function saveStoredDonations(data) {
  localStorage.setItem('mock_donations', JSON.stringify(data));
}

export function normalizeDonation(d) {
  if (!d) return d;
  return {
    ...d,
    id: d.id !== undefined && d.id !== null ? String(d.id) : '',
    donorName: d.donorName || 'Anonymous Donor',
    donorEmail: d.donorEmail || '',
    type: d.type || 'GOODS',
    itemName: d.itemName || '',
    quantity: d.quantity ?? 0,
    amount: d.amount ?? 0,
    status: d.status || 'PENDING',
    transactionRef: d.transactionId || d.transactionRef || '',
    createdAt: d.createdAt || new Date().toISOString(),
  };
}

export const donationApi = {
  list: async (params = {}) => {
    try {
      const res = await axiosClient.get('/donations', { params });
      const rawList = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      let items = rawList.map(normalizeDonation);
      if (params.type && params.type !== 'ALL') {
        items = items.filter(d => d.type === params.type);
      }
      if (params.status && params.status !== 'ALL') {
        items = items.filter(d => d.status === params.status);
      }
      return { content: items, totalElements: items.length, totalPages: 1, number: 0 };
    } catch {
      let items = getStoredDonations();
      if (params.type && params.type !== 'ALL') {
        items = items.filter(d => d.type === params.type);
      }
      if (params.status && params.status !== 'ALL') {
        items = items.filter(d => d.status === params.status);
      }
      return { content: items.map(normalizeDonation), totalElements: items.length, totalPages: 1, number: 0 };
    }
  },

  my: async (params = {}) => {
    try {
      const res = await axiosClient.get('/donations/my', { params });
      const rawList = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      let items = rawList.map(normalizeDonation);
      if (params.type && params.type !== 'ALL') {
        items = items.filter(d => d.type === params.type);
      }
      return { content: items, totalElements: items.length, totalPages: 1, number: 0 };
    } catch {
      let items = getStoredDonations();
      if (params.type && params.type !== 'ALL') {
        items = items.filter(d => d.type === params.type);
      }
      return { content: items.map(normalizeDonation), totalElements: items.length, totalPages: 1, number: 0 };
    }
  },

  get: async (id) => {
    try {
      const res = await axiosClient.get(`/donations/${id}`);
      return normalizeDonation(res.data);
    } catch {
      const items = getStoredDonations();
      const item = items.find(d => String(d.id) === String(id));
      return normalizeDonation(item);
    }
  },

  createPledge: async (data) => {
    try {
      const payload = {
        type: data.type,
        amount: data.amount ? Number(data.amount) : null,
        itemName: data.itemName || null,
        quantity: data.quantity ? Number(data.quantity) : null,
      };
      const res = await axiosClient.post('/donations/pledge', payload);
      return normalizeDonation(res.data);
    } catch {
      const items = getStoredDonations();
      const newDonation = {
        id: `DON-${Date.now().toString().slice(-3)}`,
        ...data,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };
      items.unshift(newDonation);
      saveStoredDonations(items);
      return normalizeDonation(newDonation);
    }
  },

  approvePledge: async (id) => {
    try {
      const res = await axiosClient.patch(`/donations/${id}/approve`);
      return normalizeDonation(res.data);
    } catch {
      const items = getStoredDonations();
      const idx = items.findIndex(d => String(d.id) === String(id));
      if (idx !== -1) {
        items[idx].status = 'APPROVED';
        saveStoredDonations(items);

        if (items[idx].type === 'GOODS') {
          const invList = await inventoryApi.list();
          const existingInv = invList.content.find(i => i.name.toLowerCase() === items[idx].itemName.toLowerCase());
          if (existingInv) {
            await inventoryApi.update(existingInv.id, {
              ...existingInv,
              quantity: Number(existingInv.quantity) + Number(items[idx].quantity)
            });
          } else {
            await inventoryApi.create({
              name: items[idx].itemName,
              category: 'Donated Goods',
              quantity: Number(items[idx].quantity),
              minimumThreshold: 10,
              unit: items[idx].unit || 'Units'
            });
          }
        }
        return normalizeDonation(items[idx]);
      }
      throw new Error('Pledge not found');
    }
  },

  verifyPayment: async (id) => {
    try {
      const res = await axiosClient.post(`/donations/${id}/verify-payment`);
      return normalizeDonation(res.data);
    } catch {
      const items = getStoredDonations();
      const idx = items.findIndex(d => String(d.id) === String(id));
      if (idx !== -1) {
        items[idx].status = 'VERIFIED';
        saveStoredDonations(items);
        return normalizeDonation(items[idx]);
      }
      throw new Error('Donation not found');
    }
  },
};