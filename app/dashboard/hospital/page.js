"use client"
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Hospital, Users, Activity, AlertTriangle, Package, TrendingUp } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

const HospitalDashboard = () => {
  const { data: session } = useSession();
  const [inventoryStats, setInventoryStats] = useState({
    totalUnits: 0,
    bloodTypes: 0,
    expiringSoon: 0,
    lowStock: 0
  });
  const [bloodTypeBreakdown, setBloodTypeBreakdown] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventoryStats();
  }, []);

  const fetchInventoryStats = async () => {
    try {
      const response = await fetch('/api/hospital-inventory');
      if (response.ok) {
        const data = await response.json();
        const inventory = data.inventory || [];
        
        const today = new Date();
        const expiringSoon = inventory.filter(item => {
          const expiry = new Date(item.expiry_date);
          const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
        }).length;
        
        const lowStock = inventory.filter(item => 
          item.units_available <= item.minimum_stock_level
        ).length;
        
        const bloodTypes = [...new Set(inventory.map(item => item.blood_type))].length;
        const totalUnits = inventory.reduce((sum, item) => sum + item.units_available, 0);
        
        // Calculate blood type breakdown
        const breakdown = {};
        const allBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        
        // Initialize all blood types with 0
        allBloodTypes.forEach(type => {
          breakdown[type] = 0;
        });
        
        // Add actual units from inventory
        inventory.forEach(item => {
          if (breakdown.hasOwnProperty(item.blood_type)) {
            breakdown[item.blood_type] += item.units_available;
          }
        });
        
        setInventoryStats({
          totalUnits,
          bloodTypes,
          expiringSoon,
          lowStock
        });
        setBloodTypeBreakdown(breakdown);
      }
    } catch (error) {
      console.error('Error fetching inventory stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['hospital']}>
      <div className="min-h-screen bg-[var(--background)] py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Hospital className="h-8 w-8 text-[#ef4444]" />
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">Hospital Dashboard</h1>
            </div>
            <p className="text-[var(--text-secondary)]">Welcome back, {session?.user?.name || session?.user?.email}!</p>
          </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Total Units</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{loading ? '...' : inventoryStats.totalUnits}</p>
              </div>
              <Activity className="h-8 w-8 text-[#ef4444]" />
            </div>
          </div>
          
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Blood Types</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{loading ? '...' : inventoryStats.bloodTypes}</p>
              </div>
              <Package className="h-8 w-8 text-[#ef4444]" />
            </div>
          </div>
          
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-500">{loading ? '...' : inventoryStats.expiringSoon}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Low Stock Items</p>
                <p className="text-2xl font-bold text-red-500">{loading ? '...' : inventoryStats.lowStock}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Blood Type Breakdown */}
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Blood Type Inventory
            </h2>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-[var(--text-secondary)]">Loading inventory...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(bloodTypeBreakdown).map(([bloodType, units]) => (
                  <div key={bloodType} className="flex justify-between items-center p-3 bg-[var(--background)] rounded-lg border border-[var(--border-color)]">
                    <span className="font-medium text-[var(--text-primary)]">{bloodType}</span>
                    <span className={`font-bold ${units > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {units} units
                    </span>
                  </div>
                ))}
              </div>
            )}
            {!loading && Object.values(bloodTypeBreakdown).every(units => units === 0) && (
              <div className="text-center py-4 mt-4 bg-[var(--background)] rounded-lg border border-[var(--border-color)]">
                <p className="text-[var(--text-secondary)]">No inventory available</p>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Start by adding blood units to your inventory
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-[var(--card-background)] p-6 rounded-lg border border-[var(--border-color)]">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/emergency">
                <button className="w-full text-left p-4 bg-[#ef4444] text-white rounded-lg hover:bg-[#ef4444]/90 transition-colors">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-3" />
                    <div>
                      <div className="font-medium">Emergency Request</div>
                      <div className="text-sm opacity-90">Create urgent blood request</div>
                    </div>
                  </div>
                </button>
              </Link>
              
              <Link href="/hospital-inventory">
                <button className="w-full text-left p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 mr-3" />
                    <div>
                      <div className="font-medium">Manage Inventory</div>
                      <div className="text-sm opacity-90">Blood inventory management</div>
                    </div>
                  </div>
                </button>
              </Link>
              
              <Link href="/requests">
                <button className="w-full text-left p-4 bg-[var(--background)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--card-background)] transition-colors">
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 mr-3 text-[var(--text-secondary)]" />
                    <div>
                      <div className="font-medium text-[var(--text-primary)]">View All Requests</div>
                      <div className="text-sm text-[var(--text-secondary)]">Manage blood requests</div>
                    </div>
                  </div>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
};

export default HospitalDashboard;
