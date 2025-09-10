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
  X,
  Activity,
  Eye,
  RefreshCw,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  ShieldAlert
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useToast } from '@/context/ToastContext';

const HospitalInventoryManagement = () => {
  const { data: session } = useSession();
  const { success, error } = useToast();
  const [inventory, setInventory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory');
  const [formData, setFormData] = useState({
    blood_type: '',
    units_available: '',
    expiry_date: '',
    batch_number: '',
    minimum_stock_level: 5,
    maximum_capacity: 100
  });
  const [actionData, setActionData] = useState({
    itemId: '',
    action: '',
    units: '',
    patient_id: '',
    notes: ''
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const actions = [
    { value: 'use', label: 'Use Blood Units', icon: Users, color: 'text-blue-600' },
    { value: 'reserve', label: 'Reserve for Patient', icon: ShieldAlert, color: 'text-yellow-600' },
    { value: 'unreserve', label: 'Unreserve Units', icon: RefreshCw, color: 'text-green-600' },
    { value: 'expire', label: 'Mark as Expired', icon: AlertTriangle, color: 'text-red-600' }
  ];

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/hospital-inventory');
      if (response.ok) {
        const data = await response.json();
        setInventory(data.inventory || []);
        setSummary(data.summary || {});
        if (data.summary?.lowStockAlerts?.length > 0) {
          error(`Low stock alert: ${data.summary.lowStockAlerts.length} blood type(s) below minimum level`);
        }
        if (data.summary?.expiringItems?.length > 0) {
          error(`Expiring soon: ${data.summary.expiringItems.length} item(s) expire within 7 days`);
        }
      } else {
        const errorData = await response.json();
        error(errorData.error || 'Failed to fetch inventory');
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
      error('Failed to fetch inventory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      const response = await fetch('/api/hospital-inventory/logs?limit=50');
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      } else {
        error('Failed to fetch inventory logs');
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
      error('Failed to fetch logs');
    } finally {
      setLogsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/hospital-inventory', {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingItem ? { ...formData, itemId: editingItem._id } : formData),
      });

      if (response.ok) {
        const data = await response.json();
        success(data.message);
        setShowAddForm(false);
        setEditingItem(null);
        setFormData({
          blood_type: '',
          units_available: '',
          expiry_date: '',
          batch_number: '',
          minimum_stock_level: 5,
          maximum_capacity: 100
        });
        fetchInventory();
      } else {
        const errorData = await response.json();
        error(errorData.error || 'Failed to save inventory item');
      }
    } catch (err) {
      console.error('Error saving inventory item:', err);
      error('Failed to save inventory item. Please try again.');
    }
  };

  const handleAction = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/hospital-inventory', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(actionData),
      });

      if (response.ok) {
        const data = await response.json();
        success(data.message);
        setShowActionModal(false);
        setActionData({
          itemId: '',
          action: '',
          units: '',
          patient_id: '',
          notes: ''
        });
        fetchInventory();
      } else {
        const errorData = await response.json();
        error(errorData.error || 'Failed to perform action');
      }
    } catch (err) {
      console.error('Error performing action:', err);
      error('Failed to perform action. Please try again.');
    }
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Are you sure you want to delete this inventory item?')) return;
    
    try {
      const response = await fetch(`/api/hospital-inventory?id=${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        success('Inventory item deleted successfully');
        fetchInventory();
      } else {
        const errorData = await response.json();
        error(errorData.error || 'Failed to delete inventory item');
      }
    } catch (err) {
      console.error('Error deleting inventory item:', err);
      error('Failed to delete inventory item. Please try again.');
    }
  };

  const openActionModal = (item) => {
    setActionData({
      itemId: item._id,
      action: '',
      units: '',
      patient_id: '',
      notes: ''
    });
    setShowActionModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStockLevelColor = (available, minimum) => {
    if (available <= minimum) return 'text-red-600 bg-red-50';
    if (available <= minimum * 1.5) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getExpiryColor = (daysUntilExpiry) => {
    if (daysUntilExpiry <= 3) return 'text-red-600 bg-red-50';
    if (daysUntilExpiry <= 7) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[#ef4444]" />
          <span className="text-[var(--text-primary)]">Loading inventory...</span>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['hospital']}>
      <div className="min-h-screen bg-[var(--background)] py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
              Hospital Blood Inventory
            </h1>
            <p className="text-[var(--text-secondary)]">
              Manage your hospital's blood inventory, track usage, and monitor stock levels
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-[var(--card-background)] rounded-lg p-6 border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">Total Units</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {summary.totalUnits || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Droplet className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-[var(--card-background)] rounded-lg p-6 border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">Reserved Units</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {summary.reservedUnits || 0}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <ShieldAlert className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-[var(--card-background)] rounded-lg p-6 border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">Blood Types</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {Object.keys(summary.bloodTypes || {}).length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-[var(--card-background)] rounded-lg p-6 border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">Low Stock Alerts</p>
                  <p className="text-2xl font-bold text-red-600">
                    {summary.lowStockAlerts?.length || 0}
                  </p>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-[var(--border-color)]">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'inventory'
                      ? 'border-[#ef4444] text-[#ef4444]'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-gray-300'
                  }`}
                >
                  <Package className="w-4 h-4 inline mr-2" />
                  Inventory Management
                </button>
                <button
                  onClick={() => {
                    setActiveTab('logs');
                    if (logs.length === 0) fetchLogs();
                  }}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'logs'
                      ? 'border-[#ef4444] text-[#ef4444]'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-gray-300'
                  }`}
                >
                  <Activity className="w-4 h-4 inline mr-2" />
                  Activity Logs
                </button>
              </nav>
            </div>
          </div>

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <>
              {/* Action Buttons */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center space-x-2 bg-[#ef4444] text-white px-4 py-2 rounded-lg hover:bg-[#ef4444]/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Blood Units</span>
                  </button>
                  <button
                    onClick={fetchInventory}
                    className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* Alerts */}
              {(summary.lowStockAlerts?.length > 0 || summary.expiringItems?.length > 0) && (
                <div className="mb-6 space-y-3">
                  {summary.lowStockAlerts?.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                        <div>
                          <h3 className="font-medium text-red-800">Low Stock Alert</h3>
                          <p className="text-red-700 text-sm mt-1">
                            The following blood types are below minimum stock levels:
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {summary.lowStockAlerts.map((alert, index) => (
                              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {alert.bloodType}: {alert.currentUnits} units (min: {alert.minimumLevel})
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {summary.expiringItems?.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <Clock className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                        <div>
                          <h3 className="font-medium text-yellow-800">Expiring Soon</h3>
                          <p className="text-yellow-700 text-sm mt-1">
                            The following items expire within 7 days:
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {summary.expiringItems.map((item, index) => (
                              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                {item.bloodType}: {item.units} units ({item.daysUntilExpiry} days)
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Inventory Table */}
              <div className="bg-[var(--card-background)] rounded-lg shadow-sm border border-[var(--border-color)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[var(--border-color)]">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                          Blood Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                          Available Units
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                          Reserved Units
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                          Expiry Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                          Stock Level
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-[var(--card-background)] divide-y divide-[var(--border-color)]">
                      {inventory.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center">
                            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-[var(--text-secondary)]">No inventory items found</p>
                            <p className="text-sm text-[var(--text-secondary)] mt-1">
                              Add your first blood units to get started
                            </p>
                          </td>
                        </tr>
                      ) : (
                        inventory.map((item) => {
                          const daysUntilExpiry = getDaysUntilExpiry(item.expiry_date);
                          return (
                            <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-[#ef4444] rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                                    {item.blood_type}
                                  </div>
                                  <span className="font-medium text-[var(--text-primary)]">{item.blood_type}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStockLevelColor(item.units_available, item.minimum_stock_level)}`}>
                                  {item.units_available} units
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-[var(--text-primary)]">
                                  {item.units_reserved || 0} units
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getExpiryColor(daysUntilExpiry)}`}>
                                  {formatDate(item.expiry_date)}
                                  <br />
                                  <span className="text-xs">
                                    ({daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : 'Expired'})
                                  </span>
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {item.units_available <= item.minimum_stock_level ? (
                                    <div className="flex items-center text-red-600">
                                      <TrendingDown className="w-4 h-4 mr-1" />
                                      <span className="text-xs">Low Stock</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center text-green-600">
                                      <TrendingUp className="w-4 h-4 mr-1" />
                                      <span className="text-xs">Good</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={() => openActionModal(item)}
                                    className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                    title="Manage Units"
                                  >
                                    <Activity className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item._id)}
                                    className="text-red-600 hover:text-red-900 p-1 rounded"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="bg-[var(--card-background)] rounded-lg shadow-sm border border-[var(--border-color)]">
              <div className="p-6 border-b border-[var(--border-color)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">Inventory Activity Logs</h3>
                  <button
                    onClick={fetchLogs}
                    className="flex items-center space-x-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                {logsLoading ? (
                  <div className="p-8 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#ef4444] mx-auto mb-2" />
                    <p className="text-[var(--text-secondary)]">Loading activity logs...</p>
                  </div>
                ) : logs.length === 0 ? (
                  <div className="p-8 text-center">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-[var(--text-secondary)]">No activity logs found</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-[var(--border-color)]">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                          Blood Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                          Units Changed
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-[var(--card-background)] divide-y divide-[var(--border-color)]">
                      {logs.map((log) => (
                        <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ef4444]/10 text-[#ef4444]">
                              {log.blood_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              log.action === 'received' ? 'bg-green-100 text-green-800' :
                              log.action === 'used' ? 'bg-blue-100 text-blue-800' :
                              log.action === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                              log.action === 'expired' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${
                              log.units_changed > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {log.units_changed > 0 ? '+' : ''}{log.units_changed}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                            {log.notes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-[var(--card-background)] rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-[var(--border-color)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    Add Blood Units
                  </h3>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-500 hover:text-gray-700 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Blood Type *
                  </label>
                  <select
                    value={formData.blood_type}
                    onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[#ef4444] focus:border-[#ef4444] bg-[var(--card-background)] text-[var(--text-primary)]"
                    required
                  >
                    <option value="">Select blood type</option>
                    {bloodTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Units Available *
                  </label>
                  <input
                    type="number"
                    value={formData.units_available}
                    onChange={(e) => setFormData({ ...formData, units_available: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[#ef4444] focus:border-[#ef4444] bg-[var(--card-background)] text-[var(--text-primary)]"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[#ef4444] focus:border-[#ef4444] bg-[var(--card-background)] text-[var(--text-primary)]"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Batch Number
                  </label>
                  <input
                    type="text"
                    value={formData.batch_number}
                    onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[#ef4444] focus:border-[#ef4444] bg-[var(--card-background)] text-[var(--text-primary)]"
                    placeholder="Optional batch number"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                      Minimum Stock Level
                    </label>
                    <input
                      type="number"
                      value={formData.minimum_stock_level}
                      onChange={(e) => setFormData({ ...formData, minimum_stock_level: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[#ef4444] focus:border-[#ef4444] bg-[var(--card-background)] text-[var(--text-primary)]"
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                      Maximum Capacity
                    </label>
                    <input
                      type="number"
                      value={formData.maximum_capacity}
                      onChange={(e) => setFormData({ ...formData, maximum_capacity: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[#ef4444] focus:border-[#ef4444] bg-[var(--card-background)] text-[var(--text-primary)]"
                      min="1"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-[#ef4444] text-white py-2 px-4 rounded-lg hover:bg-[#ef4444]/90 transition-colors font-medium"
                  >
                    Add Units
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Action Modal */}
        {showActionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-[var(--card-background)] rounded-lg max-w-md w-full">
              <div className="p-6 border-b border-[var(--border-color)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    Manage Blood Units
                  </h3>
                  <button
                    onClick={() => setShowActionModal(false)}
                    className="text-gray-500 hover:text-gray-700 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleAction} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Action *
                  </label>
                  <select
                    value={actionData.action}
                    onChange={(e) => setActionData({ ...actionData, action: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[#ef4444] focus:border-[#ef4444] bg-[var(--card-background)] text-[var(--text-primary)]"
                    required
                  >
                    <option value="">Select action</option>
                    {actions.map(action => (
                      <option key={action.value} value={action.value}>
                        {action.label}
                      </option>
                    ))}
                  </select>
                </div>

                {actionData.action !== 'expire' && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                      Number of Units *
                    </label>
                    <input
                      type="number"
                      value={actionData.units}
                      onChange={(e) => setActionData({ ...actionData, units: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[#ef4444] focus:border-[#ef4444] bg-[var(--card-background)] text-[var(--text-primary)]"
                      min="1"
                      required
                    />
                  </div>
                )}

                {(actionData.action === 'use' || actionData.action === 'reserve') && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                      Patient ID
                    </label>
                    <input
                      type="text"
                      value={actionData.patient_id}
                      onChange={(e) => setActionData({ ...actionData, patient_id: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[#ef4444] focus:border-[#ef4444] bg-[var(--card-background)] text-[var(--text-primary)]"
                      placeholder="Optional patient identifier"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Notes
                  </label>
                  <textarea
                    value={actionData.notes}
                    onChange={(e) => setActionData({ ...actionData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[#ef4444] focus:border-[#ef4444] bg-[var(--card-background)] text-[var(--text-primary)]"
                    rows="3"
                    placeholder="Optional notes about this action"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-[#ef4444] text-white py-2 px-4 rounded-lg hover:bg-[#ef4444]/90 transition-colors font-medium"
                  >
                    Confirm Action
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowActionModal(false)}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default HospitalInventoryManagement;
