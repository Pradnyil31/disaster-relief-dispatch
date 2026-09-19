import axiosClient from './axiosClient';

export function normalizeInventory(item) {
  if (!item) return item;
  return {
    ...item,
    id: item.id !== undefined && item.id !== null ? String(item.id) : '',
    name: item.name || '',
    category: item.category || 'OTHER',
    quantity: item.quantity ?? 0,
    minimumThreshold: item.minimumThreshold ?? item.threshold ?? 0,
  };
}

export const inventoryApi = {
  list: async (params = {}) => {
    const queryParams = { ...params };
    if (queryParams.category === 'ALL') delete queryParams.category;
    const res = await axiosClient.get('/inventory', { params: queryParams });
    const rawContent = res.data?.content || (Array.isArray(res.data) ? res.data : []);
    const normalizedContent = rawContent.map(normalizeInventory);
    return {
      content: normalizedContent,
      totalElements: res.data?.totalElements ?? normalizedContent.length,
      totalPages: res.data?.totalPages ?? 1,
      number: res.data?.number ?? 0,
    };
  },

  get: async (id) => {
    const res = await axiosClient.get(`/inventory/${id}`);
    return normalizeInventory(res.data);
  },

  create: async (data) => {
    const payload = {
      name: data.name,
      category: data.category,
      quantity: Number(data.quantity) || 0,
      minimumThreshold: Number(data.minimumThreshold) || 10,
    };
    const res = await axiosClient.post('/inventory', payload);
    return normalizeInventory(res.data);
  },

  update: async (id, data) => {
    const payload = {
      name: data.name,
      category: data.category,
      quantity: Number(data.quantity) || 0,
      minimumThreshold: Number(data.minimumThreshold) || 10,
    };
    const res = await axiosClient.put(`/inventory/${id}`, payload);
    return normalizeInventory(res.data);
  },

  delete: async (id) => {
    await axiosClient.delete(`/inventory/${id}`);
  },

  lowStock: async () => {
    const res = await axiosClient.get('/inventory', { params: { lowStock: true } });
    const raw = Array.isArray(res.data) ? res.data : (res.data?.content || []);
    return raw.map(normalizeInventory);
  },
};