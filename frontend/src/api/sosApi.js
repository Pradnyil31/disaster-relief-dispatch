import axiosClient from './axiosClient';

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
    const queryParams = { ...params };
    if (queryParams.status === 'ALL') delete queryParams.status;
    if (queryParams.urgency === 'ALL') delete queryParams.urgency;
    
    // Map frontend 'urgency' to backend 'urgencyLevel'
    if (queryParams.urgency) {
      queryParams.urgencyLevel = queryParams.urgency;
      delete queryParams.urgency;
    }
    
    const search = queryParams.search ? queryParams.search.toLowerCase() : '';
    delete queryParams.search;

    const res = await axiosClient.get('/sos', { params: queryParams });
    const rawContent = res.data?.content || (Array.isArray(res.data) ? res.data : []);
    let normalizedContent = rawContent.map(normalizeSos);

    // Client-side search filter
    if (search) {
      normalizedContent = normalizedContent.filter(s => 
        s.citizenName.toLowerCase().includes(search) ||
        s.citizenPhone.includes(search) ||
        s.requiredSupplies.some(supply => supply.toLowerCase().includes(search))
      );
    }

    return {
      content: normalizedContent,
      totalElements: res.data?.totalElements ?? normalizedContent.length,
      totalPages: res.data?.totalPages ?? 1,
      number: res.data?.number ?? 0,
    };
  },

  my: async (params = {}) => {
    const queryParams = { ...params };
    if (queryParams.status === 'ALL') delete queryParams.status;
    const res = await axiosClient.get('/sos/my', { params: queryParams });
    const rawList = Array.isArray(res.data) ? res.data : (res.data?.content || []);
    const normalizedList = rawList.map(normalizeSos);
    return {
      content: normalizedList,
      totalElements: normalizedList.length,
      totalPages: 1,
      number: 0,
    };
  },

  get: async (id) => {
    const res = await axiosClient.get(`/sos/${id}`);
    return normalizeSos(res.data);
  },

  create: async (data, currentUser = null) => {
    const payload = {
      urgencyLevel: data.urgencyLevel,
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      locationName: data.locationName || data.locationAddress || 'Captured Geolocation',
      requiredSupplies: Array.isArray(data.requiredSupplies) ? data.requiredSupplies : (data.requiredSupplies ? [data.requiredSupplies] : []),
      citizenPhone: data.citizenPhone || data.phoneNumber || currentUser?.phone || '',
    };
    const res = await axiosClient.post('/sos', payload);
    return normalizeSos(res.data);
  },

  update: async (id, data) => {
    const statusValue = typeof data === 'string' ? data : data?.status;
    const res = await axiosClient.patch(`/sos/${id}/status`, { status: statusValue });
    return normalizeSos(res.data);
  },

  delete: async (id) => {
    await axiosClient.delete(`/sos/${id}`);
  },
};