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

export const donationApi = {
  list: async (params = {}) => {
    try {
      const res = await axiosClient.get('/donations', { params });
      return res.data;
    } catch {
      let items = getStoredDonations();
      if (params.type && params.type !== 'ALL') {
        items = items.filter(d => d.type === params.type);
      }
      if (params.status && params.status !== 'ALL') {
        items = items.filter(d => d.status === params.status);
      }
      return { content: items, totalElements: items.length, totalPages: 1, number: 0 };
    }
  },

  get: async (id) => {
    try {
      const res = await axiosClient.get(`/donations/${id}`);
      return res.data;
    } catch {
      const items = getStoredDonations();
      return items.find(d => d.id === id);
    }
  },

  createPledge: async (data) => {
    try {
      const res = await axiosClient.post('/donations/pledge', data);
      return res.data;
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
      return newDonation;
    }
  },

  approvePledge: async (id) => {
    try {
      const res = await axiosClient.post(`/donations/${id}/approve`);
      return res.data;
    } catch {
      const items = getStoredDonations();
      const idx = items.findIndex(d => d.id === id);
      if (idx !== -1) {
        items[idx].status = 'APPROVED';
        saveStoredDonations(items);

        // FR-5.1: Approving a goods pledge automatically increments inventory stock
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
        return items[idx];
      }
      throw new Error('Pledge not found');
    }
  },

  verifyPayment: async (id) => {
    try {
      const res = await axiosClient.post(`/donations/${id}/verify-payment`);
      return res.data;
    } catch {
      const items = getStoredDonations();
      const idx = items.findIndex(d => d.id === id);
      if (idx !== -1) {
        items[idx].status = 'VERIFIED';
        saveStoredDonations(items);
        return items[idx];
      }
      throw new Error('Donation not found');
    }
  },
};