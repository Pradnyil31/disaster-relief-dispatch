import axiosClient from './axiosClient';

export function normalizeVolunteer(v) {
  if (!v) return v;
  return {
    ...v,
    id: v.id !== undefined && v.id !== null ? String(v.id) : '',
    name: v.name || 'Volunteer',
    email: v.email || '',
    phone: v.phone || v.phoneNumber || '',
    status: v.status || 'AVAILABLE',
    zone: v.zone || 'General',
  };
}

export const volunteerApi = {
  list: async (params = {}) => {
    const queryParams = { ...params };
    if (queryParams.status === 'ALL') delete queryParams.status;
    const res = await axiosClient.get('/volunteers', { params: queryParams });
    const rawList = Array.isArray(res.data) ? res.data : (res.data?.content || []);
    let items = rawList.map(normalizeVolunteer);
    if (params.status && params.status !== 'ALL') {
      items = items.filter(v => v.status === params.status);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(v => v.name.toLowerCase().includes(q) || v.zone.toLowerCase().includes(q));
    }
    return { content: items, totalElements: items.length, totalPages: 1, number: 0 };
  },

  updateStatus: async (id, status) => {
    const res = await axiosClient.patch(`/volunteers/${id}/status`, { status });
    return normalizeVolunteer(res.data);
  },
};
