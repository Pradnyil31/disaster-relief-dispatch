import axiosClient from './axiosClient';

// Fallback initial mock dispatches for local development / prototype demo
export function normalizeDispatch(d) {
  return d;
}

export const dispatchApi = {
  list: async (params = {}) => {
    const queryParams = { ...params };
    if (queryParams.status === 'ALL') delete queryParams.status;
    const res = await axiosClient.get('/dispatch', { params: queryParams });
    const rawList = Array.isArray(res.data) ? res.data : (res.data?.content || []);
    let items = rawList;
    if (params.status && params.status !== 'ALL') {
      items = items.filter(d => d.status === params.status);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(d =>
        d.citizenName.toLowerCase().includes(q) ||
        String(d.id).toLowerCase().includes(q) ||
        String(d.sosId).toLowerCase().includes(q) ||
        d.requiredSupplies.some(s => s.toLowerCase().includes(q))
      );
    }
    return { content: items, totalElements: items.length, totalPages: 1, number: 0 };
  },

  myTasks: async (params = {}) => {
    const queryParams = { ...params };
    if (queryParams.status === 'ALL') delete queryParams.status;
    const res = await axiosClient.get('/dispatch/my', { params: queryParams });
    const rawList = Array.isArray(res.data) ? res.data : (res.data?.content || []);
    let items = rawList.map(normalizeDispatch);
    if (params.status && params.status !== 'ALL') {
      items = items.filter(d => d.status === params.status);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(d =>
        d.citizenName.toLowerCase().includes(q) ||
        String(d.id).toLowerCase().includes(q) ||
        String(d.sosId).toLowerCase().includes(q) ||
        d.requiredSupplies.some(s => s.toLowerCase().includes(q))
      );
    }
    return { content: items, totalElements: items.length, totalPages: 1, number: 0 };
  },

  get: async (id) => {
    const res = await axiosClient.get(`/dispatch/${id}`);
    return normalizeDispatch(res.data);
  },

  assign: async (data) => {
    const payload = {
      sosRequestId: Number(data.sosId || data.sosRequestId),
      volunteerId: Number(data.volunteerId),
      inventoryItemId: data.inventoryItemId ? Number(data.inventoryItemId) : null,
      quantityDeducted: data.quantityDeducted ? Number(data.quantityDeducted) : null,
      notes: data.notes || '',
    };
    const res = await axiosClient.post('/dispatch', payload);
    return normalizeDispatch(res.data);
  },

  updateStatus: async (id, status, notes = '') => {
    const res = await axiosClient.patch(`/dispatch/${id}/status`, { status, notes });
    return normalizeDispatch(res.data);
  },

  history: async (id) => {
    const res = await axiosClient.get(`/dispatch/${id}/history`);
    return res.data;
  },
};