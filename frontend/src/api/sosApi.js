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

export function normalizeSos(s) {
  if (!s) return s;
  let supplies = [];
  if (Array.isArray(s.requiredSupplies)) {
    supplies = s.requiredSupplies;
  } else if (typeof s.suppliesNeeded === 'string' && s.suppliesNeeded.trim()) {
    supplies = s.suppliesNeeded.split(',').map((item) => item.trim()).filter(Boolean);
  } else if (typeof s.requiredSupplies === 'string' && s.requiredSupplies.trim()) {
    supplies = s.requiredSupplies.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return {
    ...s,
    id: s.id !== undefined && s.id !== null ? String(s.id) : '',
    citizenName: s.citizenName || 'Citizen',
    citizenPhone: s.phoneNumber || s.citizenPhone || '',
    locationName: s.locationAddress || s.locationName || '',
    urgencyLevel: s.urgencyLevel || 'MEDIUM',
    requiredSupplies: supplies,
    notes: s.notes || '',
    status: s.status || 'PENDING',
  };
}

export const sosApi = {
  list: async (params = {}) => {
    try {
      const res = await axiosClient.get('/sos', { params });
      const rawContent = res.data?.content || (Array.isArray(res.data) ? res.data : []);
      const normalizedContent = rawContent.map(normalizeSos);
      return {
        content: normalizedContent,
        totalElements: res.data?.totalElements ?? normalizedContent.length,
        totalPages: res.data?.totalPages ?? 1,
        number: res.data?.number ?? 0,
      };
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
          String(s.id).toLowerCase().includes(q) ||
          s.requiredSupplies?.some(sup => sup.toLowerCase().includes(q))
        );
      }
      return { content: items.map(normalizeSos), totalElements: items.length, totalPages: 1, number: 0 };
    }
  },

  my: async (params = {}) => {
    try {
      const res = await axiosClient.get('/sos/my', { params });
      const rawList = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      const normalizedList = rawList.map(normalizeSos);
      return {
        content: normalizedList,
        totalElements: normalizedList.length,
        totalPages: 1,
        number: 0,
      };
    } catch {
      let items = getStoredSos();
      if (params.status && params.status !== 'ALL') {
        items = items.filter(s => s.status === params.status);
      }
      if (params.urgencyLevel && params.urgencyLevel !== 'ALL') {
        items = items.filter(s => s.urgencyLevel === params.urgencyLevel);
      }
      return { content: items.map(normalizeSos), totalElements: items.length, totalPages: 1, number: 0 };
    }
  },

  get: async (id) => {
    try {
      const res = await axiosClient.get(`/sos/${id}`);
      return normalizeSos(res.data);
    } catch {
      const items = getStoredSos();
      const item = items.find(s => String(s.id) === String(id));
      if (item) return normalizeSos(item);
      throw new Error(`SOS request ${id} not found.`);
    }
  },

  create: async (data) => {
    try {
      const payload = {
        urgencyLevel: data.urgencyLevel,
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        locationAddress: data.locationName || data.locationAddress || 'Captured Geolocation',
        suppliesNeeded: Array.isArray(data.requiredSupplies) ? data.requiredSupplies.join(', ') : (data.requiredSupplies || ''),
        phoneNumber: data.citizenPhone || data.phoneNumber || '',
      };
      const res = await axiosClient.post('/sos', payload);
      return normalizeSos(res.data);
    } catch {
      const items = getStoredSos();
      const newSos = {
        id: `SOS-2026-${(items.length + 1).toString().padStart(3, '0')}`,
        citizenName: data.citizenName || 'Citizen',
        citizenPhone: data.citizenPhone || '+91 98000 00000',
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        locationName: data.locationName || 'Captured Geolocation',
        urgencyLevel: data.urgencyLevel || 'MEDIUM',
        requiredSupplies: data.requiredSupplies || [],
        notes: data.notes || '',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };
      items.unshift(newSos);
      saveStoredSos(items);
      return normalizeSos(newSos);
    }
  },

  update: async (id, data) => {
    try {
      const statusValue = typeof data === 'string' ? data : data?.status;
      const res = await axiosClient.patch(`/sos/${id}/status`, { status: statusValue });
      return normalizeSos(res.data);
    } catch {
      const items = getStoredSos();
      const idx = items.findIndex(s => String(s.id) === String(id));
      if (idx !== -1) {
        const updateVal = typeof data === 'string' ? { status: data } : data;
        items[idx] = { ...items[idx], ...updateVal };
        saveStoredSos(items);
        return normalizeSos(items[idx]);
      }
      throw new Error('SOS request not found');
    }
  },

  delete: async (id) => {
    try {
      await axiosClient.delete(`/sos/${id}`);
    } catch {
      const items = getStoredSos().filter(s => String(s.id) !== String(id));
      saveStoredSos(items);
    }
  },
};