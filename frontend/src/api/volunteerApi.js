import axiosClient from './axiosClient';

const INITIAL_MOCK_VOLUNTEERS = [
  { id: 'VOL-101', name: 'Vikram Singh', email: 'vikram@vol.org', phone: '+91 98200 11223', status: 'AVAILABLE', zone: 'Kurla West', activeTasksCount: 0 },
  { id: 'VOL-102', name: 'Neha Sharma', email: 'neha@vol.org', phone: '+91 98333 44556', status: 'BUSY', zone: 'Andheri East', activeTasksCount: 1 },
  { id: 'VOL-103', name: 'Rohan Gupta', email: 'rohan@vol.org', phone: '+91 98777 88990', status: 'AVAILABLE', zone: 'Dadar', activeTasksCount: 0 },
  { id: 'VOL-104', name: 'Pooja Mehta', email: 'pooja@vol.org', phone: '+91 98111 22334', status: 'OFFLINE', zone: 'Bandra West', activeTasksCount: 0 },
];

function getStoredVolunteers() {
  const stored = localStorage.getItem('mock_volunteers');
  if (stored) {
    try { return JSON.parse(stored); } catch { /* fallback */ }
  }
  localStorage.setItem('mock_volunteers', JSON.stringify(INITIAL_MOCK_VOLUNTEERS));
  return INITIAL_MOCK_VOLUNTEERS;
}

function saveStoredVolunteers(data) {
  localStorage.setItem('mock_volunteers', JSON.stringify(data));
}

export const volunteerApi = {
  list: async (params = {}) => {
    try {
      const res = await axiosClient.get('/volunteers', { params });
      return res.data;
    } catch {
      let items = getStoredVolunteers();
      if (params.status && params.status !== 'ALL') {
        items = items.filter(v => v.status === params.status);
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        items = items.filter(v => v.name.toLowerCase().includes(q) || v.zone.toLowerCase().includes(q));
      }
      return { content: items, totalElements: items.length, totalPages: 1, number: 0 };
    }
  },

  updateStatus: async (id, status) => {
    try {
      const res = await axiosClient.patch(`/volunteers/${id}/status`, { status });
      return res.data;
    } catch {
      const items = getStoredVolunteers();
      const idx = items.findIndex(v => v.id === id);
      if (idx !== -1) {
        items[idx].status = status;
        saveStoredVolunteers(items);
        return items[idx];
      }
      throw new Error('Volunteer not found');
    }
  },
};
