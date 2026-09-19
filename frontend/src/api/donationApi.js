import axiosClient from './axiosClient';
import { inventoryApi } from './inventoryApi';

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
    const queryParams = { ...params };
    if (queryParams.status === 'ALL') delete queryParams.status;
    if (queryParams.type === 'ALL') delete queryParams.type;
    const res = await axiosClient.get('/donations', { params: queryParams });
    const rawList = Array.isArray(res.data) ? res.data : (res.data?.content || []);
    let items = rawList.map(normalizeDonation);
    if (params.type && params.type !== 'ALL') {
      items = items.filter(d => d.type === params.type);
    }
    if (params.status && params.status !== 'ALL') {
      items = items.filter(d => d.status === params.status);
    }
    return { content: items, totalElements: items.length, totalPages: 1, number: 0 };
  },

  my: async (params = {}) => {
    const queryParams = { ...params };
    if (queryParams.status === 'ALL') delete queryParams.status;
    if (queryParams.type === 'ALL') delete queryParams.type;
    const res = await axiosClient.get('/donations/my', { params: queryParams });
    const rawList = Array.isArray(res.data) ? res.data : (res.data?.content || []);
    let items = rawList.map(normalizeDonation);
    if (params.type && params.type !== 'ALL') {
      items = items.filter(d => d.type === params.type);
    }
    return { content: items, totalElements: items.length, totalPages: 1, number: 0 };
  },

  get: async (id) => {
    const res = await axiosClient.get(`/donations/${id}`);
    return normalizeDonation(res.data);
  },

  createPledge: async (data) => {
    const payload = {
      type: data.type,
      amount: data.amount ? Number(data.amount) : null,
      itemName: data.itemName || null,
      category: data.category || null,
      quantity: data.quantity ? Number(data.quantity) : null,
    };
    const res = await axiosClient.post('/donations/pledge', payload);
    return normalizeDonation(res.data);
  },

  approvePledge: async (id) => {
    const res = await axiosClient.patch(`/donations/${id}/approve`);
    return normalizeDonation(res.data);
  },

  verifyPayment: async (id) => {
    const res = await axiosClient.post(`/donations/${id}/verify-payment`);
    return normalizeDonation(res.data);
  },
};