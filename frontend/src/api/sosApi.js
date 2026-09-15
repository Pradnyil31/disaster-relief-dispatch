import axiosClient from './axiosClient';

const INITIAL_MOCK_SOS = [
  {
    id: 'SOS-2026-001',
    citizenName: 'Rahul Sharma',
    citizenPhone: '+91 98765 43210',
    latitude: 19.0760,
    longitude: 72.8777,
    locationName: 'Kurla West, Mumbai',
    urgencyLevel: 'High',
    requiredSupplies: ['Drinking Water (20L Cans)', 'First Aid Medical Kit', 'Emergency Blankets'],
    notes: 'Ground floor submerged in floodwater. 3 family members including an elderly person.',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'SOS-2026-002',
    citizenName: 'Anita Desai',
    citizenPhone: '+91 98222 33445',
    latitude: 19.0330,
    longitude: 72.8636,
    locationName: 'Sion East, Mumbai',
    urgencyLevel: 'High',
    requiredSupplies: ['First Aid Medical Kit', 'Drinking Water (20L Cans)'],
    notes: 'Urgent medical assistance required for diabetic patient.',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'SOS-2026-003',
    citizenName: 'Priya Patel',
    citizenPhone: '+91 98123 45678',
    latitude: 19.1197,
    longitude: 72.8464,
    locationName: 'Andheri East, Mumbai',
    urgencyLevel: 'Medium',
    requiredSupplies: ['Ready-to-Eat Food Packets', 'LED Flashlights & Batteries'],
    notes: 'Power outage since yesterday. Require ready-to-eat meals for children.',
    status: 'DISPATCHED',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'SOS-2026-004',
    citizenName: 'Suresh Nair',
    citizenPhone: '+91 98999 11223',
    latitude: 19.0596,
    longitude: 72.8895,
    locationName: 'Chembur, Mumbai',
    urgencyLevel: 'Medium',
    requiredSupplies: ['Emergency Blankets', 'Drinking Water (20L Cans)'],
    notes: 'Roof leaking heavily, need emergency tarpaulin sheets and dry blankets.',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'SOS-2026-005',
    citizenName: 'Amit Verma',
    citizenPhone: '+91 97654 32109',
    latitude: 19.0178,
    longitude: 72.8478,
    locationName: 'Dadar, Mumbai',
    urgencyLevel: 'Low',
    requiredSupplies: ['Sanitary Hygiene Packs', 'Drinking Water (20L Cans)'],
    notes: 'Water level receding, need clean drinking water supplies.',
    status: 'RESOLVED',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

function getStoredSos() {
  const stored = localStorage.getItem('mock_sos_requests');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  localStorage.setItem('mock_sos_requests', JSON.stringify(INITIAL_MOCK_SOS));
  return INITIAL_MOCK_SOS;
}

function saveStoredSos(data) {
  localStorage.setItem('mock_sos_requests', JSON.stringify(data));
}

export const sosApi = {
  list: async (params = {}) => {
    try {
      const res = await axiosClient.get('/sos', { params });
      return res.data;
    } catch {
      let items = getStoredSos();
      if (params.urgency && params.urgency !== 'ALL') {
        items = items.filter(s => s.urgencyLevel === params.urgency);
      }
      if (params.status && params.status !== 'ALL') {
        items = items.filter(s => s.status === params.status);
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        items = items.filter(s =>
          s.citizenName.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.requiredSupplies?.some(sup => sup.toLowerCase().includes(q))
        );
      }
      return { content: items, totalElements: items.length, totalPages: 1, number: 0 };
    }
  },

  get: async (id) => {
    try {
      const res = await axiosClient.get(`/sos/${id}`);
      return res.data;
    } catch {
      const items = getStoredSos();
      const item = items.find(s => s.id === id);
      if (item) return item;
      throw new Error(`SOS request ${id} not found.`);
    }
  },

  create: async (data) => {
    try {
      const res = await axiosClient.post('/sos', data);
      return res.data;
    } catch {
      const items = getStoredSos();
      const newSos = {
        id: `SOS-2026-${(items.length + 1).toString().padStart(3, '0')}`,
        citizenName: data.citizenName || 'Citizen',
        citizenPhone: data.citizenPhone || '+91 98000 00000',
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        locationName: data.locationName || 'Captured Geolocation',
        urgencyLevel: data.urgencyLevel || 'Medium',
        requiredSupplies: data.requiredSupplies || [],
        notes: data.notes || '',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };
      items.unshift(newSos);
      saveStoredSos(items);
      return newSos;
    }
  },

  update: async (id, data) => {
    try {
      const res = await axiosClient.put(`/sos/${id}`, data);
      return res.data;
    } catch {
      const items = getStoredSos();
      const idx = items.findIndex(s => s.id === id);
      if (idx !== -1) {
        items[idx] = { ...items[idx], ...data };
        saveStoredSos(items);
        return items[idx];
      }
      throw new Error('SOS request not found');
    }
  },

  delete: async (id) => {
    try {
      await axiosClient.delete(`/sos/${id}`);
    } catch {
      const items = getStoredSos().filter(s => s.id !== id);
      saveStoredSos(items);
    }
  },
};