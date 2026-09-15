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

export const dispatchApi = {
  list: async (params = {}) => {
    try {
      const res = await axiosClient.get('/dispatch', { params });
      return res.data;
    } catch {
      // Fallback to local mock data
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
          d.id.toLowerCase().includes(search) ||
          d.sosId.toLowerCase().includes(search) ||
          d.requiredSupplies.some(s => s.toLowerCase().includes(search))
        );
      }

      return {
        content: filtered,
        totalElements: filtered.length,
        totalPages: 1,
        number: 0,
      };
    }
  },

  get: async (id) => {
    try {
      const res = await axiosClient.get(`/dispatch/${id}`);
      return res.data;
    } catch {
      const dispatches = getStoredMockDispatches();
      const item = dispatches.find(d => d.id === id || d.sosId === id);
      if (item) return item;
      throw new Error(`Dispatch task ${id} not found.`);
    }
  },

  assign: async (data) => {
    try {
      const res = await axiosClient.post('/dispatch/assign', data);
      return res.data;
    } catch {
      const dispatches = getStoredMockDispatches();
      const newDispatch = {
        id: `DSP-${Date.now().toString().slice(-4)}`,
        sosId: data.sosId || `SOS-${Date.now().toString().slice(-4)}`,
        citizenName: data.citizenName || 'Requestor',
        citizenPhone: data.citizenPhone || '+91 99000 00000',
        latitude: data.latitude || 19.0760,
        longitude: data.longitude || 72.8777,
        urgencyLevel: data.urgencyLevel || 'Medium',
        requiredSupplies: data.requiredSupplies || ['General Relief Kit'],
        notes: data.notes || '',
        status: 'ASSIGNED',
        assignedAt: new Date().toISOString(),
        history: [
          {
            status: 'ASSIGNED',
            timestamp: new Date().toISOString(),
            updatedBy: 'Admin',
            note: 'Assigned to volunteer'
          }
        ]
      };
      dispatches.unshift(newDispatch);
      saveStoredMockDispatches(dispatches);
      return newDispatch;
    }
  },

  updateStatus: async (id, status, note = '') => {
    try {
      const res = await axiosClient.patch(`/dispatch/${id}/status`, { status, note });
      return res.data;
    } catch {
      const dispatches = getStoredMockDispatches();
      const index = dispatches.findIndex(d => d.id === id || d.sosId === id);
      if (index === -1) throw new Error('Task not found');

      const now = new Date().toISOString();
      const current = dispatches[index];

      current.status = status;
      if (status === 'EN_ROUTE') current.enRouteAt = now;
      if (status === 'DELIVERED') current.deliveredAt = now;

      const historyItem = {
        status,
        timestamp: now,
        updatedBy: 'Volunteer (Self)',
        note: note || (status === 'EN_ROUTE' ? 'Updated status to En Route' : 'Updated status to Delivered')
      };

      current.history = current.history || [];
      current.history.push(historyItem);

      dispatches[index] = current;
      saveStoredMockDispatches(dispatches);
      return current;
    }
  },

  history: async (id) => {
    try {
      const res = await axiosClient.get(`/dispatch/${id}/history`);
      return res.data;
    } catch {
      const dispatches = getStoredMockDispatches();
      const item = dispatches.find(d => d.id === id || d.sosId === id);
      return item ? item.history : [];
    }
  },
};