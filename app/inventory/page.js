"use client"
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Droplet,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

const InventoryManagement = () => {
  const { data: session } = useSession();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    blood_type: '',
    units_available: '',
    expiry_date: ''
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory');
      if (response.ok) {
        const data = await response.json();
        setInventory(data.inventory || []);
      } else {
        console.error('Failed to fetch inventory');
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem 
        ? { ...formData, itemId: editingItem._id }
        : formData;

      const response = await fetch('/api/inventory', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        await fetchInventory();
        resetForm();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save inventory item');
      }
    } catch (error) {
      console.error('Error saving inventory item:', error);
      alert('Failed to save inventory item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      blood_type: item.blood_type,
      units_available: item.units_available.toString(),
      expiry_date: new Date(item.expiry_date).toISOString().split('T')[0]
    });
    setShowAddForm(true);
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Are you sure you want to delete this inventory item?')) {
      return;
    }

    try {
      const response = await fetch(`/api/inventory?itemId=${itemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchInventory();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete inventory item');
      }
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      alert('Failed to delete inventory item');
    }
  };

  const resetForm = () => {
    setFormData({ blood_type: '', units_available: '', expiry_date: '' });
    setEditingItem(null);
    setShowAddForm(false);
  };

  const isExpiringSoon = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30;
  };

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) <= new Date();
  };

  // Group inventory by blood type
  const groupedInventory = inventory.reduce((acc, item) => {
    const type = item.blood_type;
    if (!acc[type]) {
      acc[type] = { items: [], total: 0 };
    }
    acc[type].items.push(item);
    acc[type].total += item.units_available;
    return acc;
  }, {});

  const totalUnits = inventory.reduce((sum, item) => sum + item.units_available, 0);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['bloodbank_admin']}>
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#ef4444] mx-auto"></div>
            <p className="mt-4 text-[var(--text-secondary)]">Loading inventory...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['bloodbank_admin']}>
      <div className="min-h-screen bg-[var(--background)] py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Package className="h-8 w-8 text-[#ef4444]" />
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Blood Inventory Management</h1>
              </div>
              <p className="text-[var(--text-secondary)]">Manage your blood bank's inventory</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-[#ef4444] text-white rounded-lg hover:bg-[#ef4444]/90 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add Inventory</span>
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Total Units</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{totalUnits}</p>
                </div>
                <Droplet className="h-8 w-8 text-[#ef4444]" />
              </div>
            </div>
            
            <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Blood Types</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{Object.keys(groupedInventory).length}</p>
                </div>
                <Package className="h-8 w-8 text-[#ef4444]" />
              </div>
            </div>
            
            <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Expiring Soon</p>
                  <p className="text-2xl font-bold text-orange-500">
                    {inventory.filter(item => isExpiringSoon(item.expiry_date) && !isExpired(item.expiry_date)).length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </div>
            
            <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Expired</p>
                  <p className="text-2xl font-bold text-red-500">
                    {inventory.filter(item => isExpired(item.expiry_date)).length}
                  </p>
                </div>
                <X className="h-8 w-8 text-red-500" />
              </div>
            </div>
          </div>

          {/* Inventory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {bloodTypes.map(bloodType => (
              <div key={bloodType} className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Droplet className="h-5 w-5 text-[#ef4444]" />
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">{bloodType}</h3>
                  </div>
                  <span className="text-2xl font-bold text-[var(--text-primary)]">
                    {groupedInventory[bloodType]?.total || 0}
                  </span>
                </div>
                
                {groupedInventory[bloodType]?.items?.length > 0 ? (
                  <div className="space-y-2">
                    {groupedInventory[bloodType].items.map(item => (
                      <div key={item._id} className={`p-3 rounded border ${
                        isExpired(item.expiry_date) 
                          ? 'border-red-200 bg-red-50 dark:bg-red-900/20' 
                          : isExpiringSoon(item.expiry_date)
                          ? 'border-orange-200 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-[var(--border-color)] bg-[var(--background)]'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.units_available} units</span>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                          <Calendar className="h-3 w-3 text-[var(--text-secondary)]" />
                          <span className={`text-xs ${
                            isExpired(item.expiry_date) 
                              ? 'text-red-600' 
                              : isExpiringSoon(item.expiry_date)
                              ? 'text-orange-600'
                              : 'text-[var(--text-secondary)]'
                          }`}>
                            {new Date(item.expiry_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--text-secondary)]">No stock</p>
                )}
              </div>
            ))}
          </div>

          {/* Add/Edit Form Modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-[var(--card-background)] p-6 rounded-lg w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                    {editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Blood Type
                    </label>
                    <select
                      value={formData.blood_type}
                      onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                      className="w-full p-3 border border-[var(--border-color)] rounded-lg bg-[var(--background)] text-[var(--text-primary)] focus:ring-2 focus:ring-[#ef4444] focus:border-transparent"
                      required
                    >
                      <option value="">Select Blood Type</option>
                      {bloodTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Units Available
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.units_available}
                      onChange={(e) => setFormData({ ...formData, units_available: e.target.value })}
                      className="w-full p-3 border border-[var(--border-color)] rounded-lg bg-[var(--background)] text-[var(--text-primary)] focus:ring-2 focus:ring-[#ef4444] focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={formData.expiry_date}
                      onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                      className="w-full p-3 border border-[var(--border-color)] rounded-lg bg-[var(--background)] text-[var(--text-primary)] focus:ring-2 focus:ring-[#ef4444] focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-[#ef4444] text-white py-2 px-4 rounded-lg hover:bg-[#ef4444]/90 transition-colors"
                    >
                      {editingItem ? 'Update' : 'Add'} Item
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 bg-[var(--background)] border border-[var(--border-color)] text-[var(--text-primary)] py-2 px-4 rounded-lg hover:bg-[var(--card-background)] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default InventoryManagement;
