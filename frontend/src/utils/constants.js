export const ROLES = {
  ADMINISTRATOR: 'ADMINISTRATOR',
  VOLUNTEER: 'VOLUNTEER',
  CITIZEN: 'CITIZEN',
  DONOR: 'DONOR',
};

export const REGISTERABLE_ROLES = [
  ROLES.CITIZEN,
  ROLES.VOLUNTEER,
  ROLES.DONOR,
];

export const URGENCY_LEVELS = ['HIGH', 'MEDIUM', 'LOW'];

export const DISPATCH_STATUS = ['ASSIGNED', 'EN_ROUTE', 'DELIVERED'];

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';