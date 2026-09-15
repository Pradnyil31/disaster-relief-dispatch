import axiosClient from './axiosClient';

const INITIAL_MOCK_INVENTORY = [
  { id: 'INV-101', name: 'Drinking Water (20L Cans)', category: 'Water', quantity: 15, minimumThreshold: 20, unit: 'Cans' },
  { id: 'INV-102', name: 'First Aid Medical Kit', category: 'Medical', quantity: 45, minimumThreshold: 15, unit: 'Kits' },
  { id: 'INV-103', name: 'Emergency Blankets', category: 'Shelter', quantity: 8, minimumThreshold: 25, unit: 'Pcs' },
  { id: 'INV-104', name: 'Ready-to-Eat Food Packets', category: 'Food', quantity: 120, minimumThreshold: 50, unit: 'Packets' },
  { id: 'INV-105', name: 'Sanitary Hygiene Packs', category: 'Hygiene', quantity: 5, minimumThreshold: 30, unit: 'Packs' },
  { id: 'INV-106', name: 'LED Flashlights & Batteries', category: 'Equipment', quantity: 60, minimumThreshold: 20, unit: 'Units' },
];

function getStoredInventory() {
  const stored = localStorage.getItem('mock_inventory');
  if (stored) {
    try { return JSON.parse(stored); } catch { /* fallback */ }
  }
  localStorage.setItem('mock_inventory', JSON.stringify(INITIAL_MOCK_INVENTORY));
  return INITIAL_MOCK_INVENTORY;
}

function saveStoredInventory(data) {
  localStorage.setItem('mock_inventory', JSON.stringify(data));
}

export const inventoryApi = {
  list: async (params = {}) => {
    try {
      const res = await axiosClient.get('/inventory', { params });
      return res.data;
    } catch {
      let items = getStoredInventory();
      if (params.category && params.category !== 'ALL') {
        items = items.filter(i => i.category === params.category);
      }
      if (params.lowStockOnly) {
        items = items.filter(i => i.quantity <= i.minimumThreshold);
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        items = items.filter(i => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
      }
      return { content: items, totalElements: items.length, totalPages: 1, number: 0 };
    }
  },

  get: async (id) => {
    try {
      const res = await axiosClient.get(`/inventory/${id}`);
      return res.data;
    } catch {
      const items = getStoredInventory();
      return items.find(i => i.id === id);
    }
  },

  create: async (data) => {
    try {
      const res = await axiosClient.post('/inventory', data);
      return res.data;
    } catch {
      const items = getStoredInventory();
      const newItem = {
        id: `INV-${Date.now().toString().slice(-3)}`,
        ...data,
        quantity: Number(data.quantity) || 0,
        minimumThreshold: Number(data.minimumThreshold) || 10,
      };
      items.unshift(newItem);
      saveStoredInventory(items);
      return newItem;
    }
  },

  update: async (id, data) => {
    try {
      const res = await axiosClient.put(`/inventory/${id}`, data);
      return res.data;
    } catch {
      const items = getStoredInventory();
      const idx = items.findIndex(i => i.id === id);
      if (idx !== -1) {
        items[idx] = { ...items[idx], ...data, quantity: Number(data.quantity), minimumThreshold: Number(data.minimumThreshold) };
        saveStoredInventory(items);
        return items[idx];
      }
      throw new Error('Item not found');
    }
  },

  delete: async (id) => {
    try {
      await axiosClient.delete(`/inventory/${id}`);
    } catch {
      const items = getStoredInventory().filter(i => i.id !== id);
      saveStoredInventory(items);
    }
  },

  lowStock: async () => {
    try {
      const res = await axiosClient.get('/inventory/low-stock');
      return res.data;
    } catch {
      const items = getStoredInventory();
      return items.filter(i => i.quantity <= i.minimumThreshold);
    }
  },
};