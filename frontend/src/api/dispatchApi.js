import axiosClient from './axiosClient';

// Fallback initial mock dispatches for local development / prototype demo
const INITIAL_MOCK_DISPATCHES = [
  {
    id: 'DSP-1001',
    sosId: 'SOS-2026-001',
    citizenName: 'Rahul Sharma',
    citizenPhone: '+91 98765 43210',
    latitude: 19.0760,
    longitude: 72.8777,
    locationName: 'Kurla West, Mumbai',
    urgencyLevel: 'High',
    requiredSupplies: ['Drinking Water (20L)', 'First Aid Kits', 'Emergency Blankets'],
    notes: 'Ground floor submerged in floodwater. 3 family members including an elderly person.',
    status: 'ASSIGNED',
    assignedAt: new Date(Date.now() - 3600000).toISOString(),
    history: [
      {
        status: 'ASSIGNED',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        updatedBy: 'Admin (System Dispatch)',
        note: 'Task assigned to volunteer'
      }
    ]
  },
  {
    id: 'DSP-1002',
    sosId: 'SOS-2026-003',
    citizenName: 'Priya Patel',
    citizenPhone: '+91 98123 45678',
    latitude: 19.1197,
    longitude: 72.8464,
    locationName: 'Andheri East, Mumbai',
    urgencyLevel: 'Medium',
    requiredSupplies: ['Food Packets', 'Flashlight'],
    notes: 'Power outage since yesterday. Require ready-to-eat meals for children.',
    status: 'EN_ROUTE',
    assignedAt: new Date(Date.now() - 7200000).toISOString(),
    enRouteAt: new Date(Date.now() - 1800000).toISOString(),
    history: [
      {
        status: 'ASSIGNED',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        updatedBy: 'Admin (System Dispatch)',
        note: 'Task assigned to volunteer'
      },
      {
        status: 'EN_ROUTE',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        updatedBy: 'Volunteer (Self)',
        note: 'Volunteer dispatched and en route to location'
      }
    ]
  },
  {
    id: 'DSP-1003',
    sosId: 'SOS-2026-005',
    citizenName: 'Amit Verma',
    citizenPhone: '+91 97654 32109',
    latitude: 19.0178,
    longitude: 72.8478,
    locationName: 'Dadar, Mumbai',
    urgencyLevel: 'Low',
    requiredSupplies: ['Sanitary Pads', 'Drinking Water (20L)'],
    notes: 'Water level receding, need clean drinking water supplies.',
    status: 'DELIVERED',
    assignedAt: new Date(Date.now() - 86400000).toISOString(),
    enRouteAt: new Date(Date.now() - 80000000).toISOString(),
    deliveredAt: new Date(Date.now() - 72000000).toISOString(),
    history: [
      {
        status: 'ASSIGNED',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        updatedBy: 'Admin (System Dispatch)',
        note: 'Task assigned to volunteer'
      },
      {
        status: 'EN_ROUTE',
        timestamp: new Date(Date.now() - 80000000).toISOString(),
        updatedBy: 'Volunteer (Self)',
        note: 'Volunteer dispatched and en route to location'
      },
      {
        status: 'DELIVERED',
        timestamp: new Date(Date.now() - 72000000).toISOString(),
        updatedBy: 'Volunteer (Self)',
        note: 'Relief supplies handed over successfully to citizen'
      }
    ]
  }
];

function getStoredMockDispatches() {
  const stored = localStorage.getItem('mock_dispatches');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  localStorage.setItem('mock_dispatches', JSON.stringify(INITIAL_MOCK_DISPATCHES));
  return INITIAL_MOCK_DISPATCHES;
}

function saveStoredMockDispatches(data) {
  localStorage.setItem('mock_dispatches', JSON.stringify(data));
}

export function normalizeDispatch(d) {
  if (!d) return d;
  return {
    ...d,
    id: d.id !== undefined && d.id !== null ? String(d.id) : '',
    sosId: d.sosRequestId !== undefined && d.sosRequestId !== null ? String(d.sosRequestId) : (d.sosId || ''),
    citizenName: d.citizenName || 'Citizen Requester',
    citizenPhone: d.citizenPhone || '',
    locationName: d.locationAddress || d.locationName || '',
    urgencyLevel: d.urgencyLevel || 'MEDIUM',
    requiredSupplies: Array.isArray(d.requiredSupplies) ? d.requiredSupplies : (d.suppliesNeeded ? [d.suppliesNeeded] : []),
    status: d.status || 'ASSIGNED',
    notes: d.notes || '',
    assignedAt: d.assignedAt || new Date().toISOString(),
    enRouteAt: d.enRouteAt || null,
    deliveredAt: d.deliveredAt || null,
  };
}

export const dispatchApi = {
  list: async (params = {}) => {
    try {
      const res = await axiosClient.get('/dispatch', { params });
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
    } catch {
      const dispatches = getStoredMockDispatches();
      const statusFilter = params.status;
      const search = params.search?.toLowerCase();

      let filtered = [...dispatches];
      if (statusFilter && statusFilter !== 'ALL') {
        filtered = filtered.filter(d => d.status === statusFilter);
      }
      if (search) {
        filtered = filtered.filter(d =>
          d.citizenName.toLowerCase().includes(search) ||
          String(d.id).toLowerCase().includes(search) ||
          String(d.sosId).toLowerCase().includes(search) ||
          d.requiredSupplies.some(s => s.toLowerCase().includes(search))
        );
      }

      return {
        content: filtered.map(normalizeDispatch),
        totalElements: filtered.length,
        totalPages: 1,
        number: 0,
      };
    }
  },

  myTasks: async (params = {}) => {
    try {
      const res = await axiosClient.get('/dispatch/my', { params });
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
    } catch {
      const dispatches = getStoredMockDispatches();
      return { content: dispatches.map(normalizeDispatch), totalElements: dispatches.length, totalPages: 1, number: 0 };
    }
  },

  get: async (id) => {
    try {
      const res = await axiosClient.get(`/dispatch/${id}`);
      return normalizeDispatch(res.data);
    } catch {
      const dispatches = getStoredMockDispatches();
      const item = dispatches.find(d => String(d.id) === String(id) || String(d.sosId) === String(id));
      if (item) return normalizeDispatch(item);
      throw new Error(`Dispatch task ${id} not found.`);
    }
  },

  assign: async (data) => {
    try {
      const payload = {
        sosRequestId: Number(data.sosId || data.sosRequestId),
        volunteerId: Number(data.volunteerId),
        inventoryItemId: data.inventoryItemId ? Number(data.inventoryItemId) : null,
        quantityDeducted: data.quantityDeducted ? Number(data.quantityDeducted) : null,
        notes: data.notes || '',
      };
      const res = await axiosClient.post('/dispatch', payload);
      return normalizeDispatch(res.data);
    } catch {
      const dispatches = getStoredMockDispatches();
      const newDispatch = {
        id: `DSP-${Date.now().toString().slice(-4)}`,
        sosId: data.sosId || `SOS-${Date.now().toString().slice(-4)}`,
        citizenName: data.citizenName || 'Requestor',
        citizenPhone: data.citizenPhone || '+91 99000 00000',
        latitude: data.latitude || 19.0760,
        longitude: data.longitude || 72.8777,
        urgencyLevel: data.urgencyLevel || 'MEDIUM',
        requiredSupplies: data.requiredSupplies || ['General Relief Kit'],
        notes: data.notes || '',
        status: 'ASSIGNED',
        assignedAt: new Date().toISOString(),
      };
      dispatches.unshift(newDispatch);
      saveStoredMockDispatches(dispatches);
      return normalizeDispatch(newDispatch);
    }
  },

  updateStatus: async (id, status, notes = '') => {
    try {
      const res = await axiosClient.patch(`/dispatch/${id}/status`, { status, notes });
      return normalizeDispatch(res.data);
    } catch {
      const dispatches = getStoredMockDispatches();
      const index = dispatches.findIndex(d => String(d.id) === String(id) || String(d.sosId) === String(id));
      if (index === -1) throw new Error('Task not found');

      const now = new Date().toISOString();
      const current = dispatches[index];

      current.status = status;
      if (status === 'EN_ROUTE') current.enRouteAt = now;
      if (status === 'DELIVERED') current.deliveredAt = now;

      dispatches[index] = current;
      saveStoredMockDispatches(dispatches);
      return normalizeDispatch(current);
    }
  },

  history: async (id) => {
    try {
      const res = await axiosClient.get(`/dispatch/${id}/history`);
      return res.data;
    } catch {
      const dispatches = getStoredMockDispatches();
      const item = dispatches.find(d => String(d.id) === String(id) || String(d.sosId) === String(id));
      return item ? item.history : [];
    }
  },
};