export function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateOnly(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getUrgencyBadgeClass(urgency) {
  const map = {
    High: 'badge-urgency-high',
    Medium: 'badge-urgency-medium',
    Low: 'badge-urgency-low',
  };
  return map[urgency] || 'bg-secondary';
}

export function getDispatchStatusBadgeClass(status) {
  const map = {
    ASSIGNED: 'badge-status-assigned',
    EN_ROUTE: 'badge-status-en_route',
    DELIVERED: 'badge-status-delivered',
  };
  return map[status] || 'bg-secondary';
}

export function getStockBadgeClass(quantity, threshold) {
  return quantity <= threshold ? 'badge-stock-low' : 'badge-stock-ok';
}

export function getStockBadgeText(quantity, threshold) {
  return quantity <= threshold ? 'Low Stock' : 'In Stock';
}

export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}