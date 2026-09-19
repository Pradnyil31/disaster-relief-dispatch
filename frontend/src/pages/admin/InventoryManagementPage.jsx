import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { inventoryApi } from '../../api/inventoryApi';
import { getStockBadgeClass, getStockBadgeText } from '../../utils/helpers';
import toast from 'react-hot-toast';

export function InventoryManagementPage() {
  const { user, logout } = useAuthContext();
  const [items, setItems] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showLowStock, setShowLowStock] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'WATER_AND_HYDRATION',
    quantity: '',
    minimumThreshold: '20',
  });
  const [saving, setSaving] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const [allRes, lowRes] = await Promise.all([
        inventoryApi.list({ category: categoryFilter }),
        inventoryApi.lowStock(),
      ]);
      setItems(allRes.content || []);
      setLowStockItems(lowRes || []);
    } catch {
      toast.error('Failed to load inventory items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [categoryFilter]);

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'WATER_AND_HYDRATION',
      quantity: '',
      minimumThreshold: '20',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      minimumThreshold: item.minimumThreshold.toString(),
    });
    setShowModal(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.quantity) {
      toast.error('Item name and quantity are required');
      return;
    }

    try {
      setSaving(true);
      if (editingItem) {
        await inventoryApi.update(editingItem.id, formData);
        toast.success('Inventory item updated successfully');
      } else {
        await inventoryApi.create(formData);
        toast.success('New inventory item added successfully');
      }
      setShowModal(false);
      await fetchInventory();
    } catch {
      toast.error('Failed to save inventory item');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await inventoryApi.delete(id);
      toast.success('Item removed from inventory');
      await fetchInventory();
    } catch {
      toast.error('Failed to delete inventory item');
    }
  };

  return (
    <div className="min-vh-100 bg-light animate-fade-in">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm glass">
        <div className="container max-w-6xl">
          <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/admin">
            <i className="bi bi-shield-lock-fill text-warning"></i>
            Admin Command Center
          </Link>
          <button 
            className="navbar-toggler border-0 shadow-none" 
            type="button" 
            onClick={() => setIsNavCollapsed(!isNavCollapsed)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse justify-content-end mt-3 mt-lg-0`}>
            <div className="navbar-nav align-items-center gap-2">
              <Link to="/admin" className="nav-custom-link">
                <i className="bi bi-speedometer2"></i> Dashboard
              </Link>
              <div className="nav-custom-badge">
                <i className="bi bi-person-circle fs-5"></i>
                <span className="text-truncate" style={{ maxWidth: '120px' }}>{user?.name || 'Admin'}</span>
              </div>
              <button
                type="button"
                className="nav-logout-btn"
                onClick={logout}
              >
                Logout <i className="bi bi-box-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container max-w-6xl py-4">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="fw-bolder text-dark mb-1">Relief Inventory Management (FR-3.3/3.4)</h2>
            <p className="text-muted mb-0">Track warehouse supplies, configure low-stock threshold triggers, and update stock counts.</p>
          </div>
          <button
            type="button"
            className="btn btn-primary rounded-pill px-4 shadow-sm fw-bold align-self-start align-self-md-center"
            onClick={handleOpenCreateModal}
          >
            <i className="bi bi-plus-circle me-2"></i>Add New Stock Item
          </button>
        </div>

        {/* Low Stock Alert Banner */}
        {lowStockItems.length > 0 && (
          <div className="alert alert-danger border-0 shadow-sm rounded-3 d-flex align-items-center mb-4 p-3" role="alert">
            <div className="bg-danger text-white rounded-circle p-2 me-3 flex-shrink-0 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
              <i className="bi bi-exclamation-triangle-fill fs-5"></i>
            </div>
            <div className="flex-grow-1">
              <h6 className="fw-bold mb-1 text-danger">Low Stock Warning Alert</h6>
              <div className="fs-7 text-dark">
                The following {lowStockItems.length} item(s) are at or below their minimum threshold:{' '}
                <strong className="text-danger">
                  {lowStockItems.map(i => `${i.name} (${i.quantity} left, min: ${i.minimumThreshold})`).join(', ')}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="card border-0 shadow-sm rounded-3 mb-4 p-3 bg-white">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-6">
              <label className="form-label fs-7 text-uppercase fw-semibold text-muted mb-1">Filter by Category</label>
              <select
                className="form-select form-select-sm"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                <option value="WATER_AND_HYDRATION">Water & Hydration</option>
                <option value="FOOD_AND_RATIONS">Food & Rations</option>
                <option value="MEDICAL_SUPPLIES">Medical Supplies</option>
                <option value="SHELTER_AND_BLANKETS">Shelter & Blankets</option>
                <option value="CLOTHING">Clothing</option>
                <option value="FUEL_AND_ENERGY">Fuel & Energy</option>
                <option value="RESCUE_EQUIPMENT">Rescue Equipment</option>
                <option value="COMMUNICATION_DEVICES">Communication Devices</option>
              </select>
            </div>


          </div>
        </div>

        {/* Inventory Items Table */}
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0 text-dark">Warehouse Inventory Stock ({items.length})</h5>
          </div>

          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-2 mb-0">Loading stock items...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-box-seam fs-1 text-muted d-block mb-2 opacity-50"></i>
                <h5 className="fw-bold text-dark mb-1">No Stock Items Found</h5>
                <p className="text-muted mb-0">Click "Add New Stock Item" to create your first inventory item.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light fs-7 text-uppercase text-muted">
                    <tr>
                      <th className="ps-4">Item Ref</th>
                      <th>Stock Name</th>
                      <th>Category</th>
                      <th>Current Quantity</th>
                      <th>Min Threshold</th>
                      <th>Stock Status</th>
                      <th className="pe-4 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((i) => {
                      const isLow = i.quantity <= i.minimumThreshold;
                      return (
                        <tr key={i.id} className={isLow ? 'table-danger bg-opacity-10' : ''}>
                          <td className="ps-4 fw-bold text-secondary fs-7">{i.id}</td>
                          <td>
                            <div className="fw-bold text-dark">{i.name}</div>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border fw-normal">{i.category}</span>
                          </td>
                          <td>
                            <span className="fs-6 fw-bold text-dark">{i.quantity}</span>
                          </td>
                          <td className="fs-7 text-muted">{i.minimumThreshold}</td>
                          <td>
                            <span className={`badge ${getStockBadgeClass(i.quantity, i.minimumThreshold)} px-2 py-1`}>
                              {getStockBadgeText(i.quantity, i.minimumThreshold)}
                            </span>
                          </td>
                          <td className="pe-4 text-end">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary rounded-circle me-1"
                              title="Edit item"
                              onClick={() => handleOpenEditModal(i)}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger rounded-circle"
                              title="Delete item"
                              onClick={() => handleDeleteItem(i.id, i.name)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add / Edit Inventory Modal */}
      {showModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <form onSubmit={handleSaveItem}>
                <div className="modal-header bg-primary text-white py-3">
                  <h5 className="modal-title fw-bold">
                    {editingItem ? 'Edit Inventory Item' : 'Add New Inventory Stock'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark fs-7">Item Name (Custom) *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Paracetamol"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold text-dark fs-7">Category *</label>
                      <select
                        className="form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="WATER_AND_HYDRATION">Water & Hydration</option>
                        <option value="FOOD_AND_RATIONS">Food & Rations</option>
                        <option value="MEDICAL_SUPPLIES">Medical Supplies</option>
                        <option value="SHELTER_AND_BLANKETS">Shelter & Blankets</option>
                        <option value="CLOTHING">Clothing</option>
                        <option value="FUEL_AND_ENERGY">Fuel & Energy</option>
                        <option value="RESCUE_EQUIPMENT">Rescue Equipment</option>
                        <option value="COMMUNICATION_DEVICES">Communication Devices</option>
                      </select>
                    </div>
                  </div>



                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold text-dark fs-7">Stock Quantity *</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        placeholder="0"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label fw-semibold text-dark fs-7">Low Stock Alert Threshold *</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        placeholder="10"
                        value={formData.minimumThreshold}
                        onChange={(e) => setFormData({ ...formData, minimumThreshold: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light py-2">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm px-3 rounded-pill"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm px-4 rounded-pill fw-bold"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}