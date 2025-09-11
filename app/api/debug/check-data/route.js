import { NextResponse } from 'next/server';
import connectDB from '@/db/connectDB.mjs';
import BloodBank from '@/model/BloodBank';
import BloodInventory from '@/model/BloodInventory';
import User from '@/model/user';

export async function GET(req) {
  try {
    await connectDB();
    
    // Get all blood banks
    const bloodBanks = await BloodBank.find({}).populate('user_id', 'name email role');
    
    // Get all blood inventory
    const inventory = await BloodInventory.find({}).populate('blood_bank_id', 'name email role');
    
    // Get all blood bank users
    const bloodBankUsers = await User.find({ role: 'bloodbank_admin' }).select('name email role');
    
    return NextResponse.json({
      success: true,
      bloodBanks: bloodBanks.length,
      bloodBankDetails: bloodBanks,
      inventory: inventory.length,
      inventoryDetails: inventory,
      bloodBankUsers: bloodBankUsers.length,
      bloodBankUserDetails: bloodBankUsers
    });
    
  } catch (error) {
    console.error('Error checking data:', error);
    return NextResponse.json({ 
      error: 'Failed to check data',
      details: error.message 
    }, { status: 500 });
  }
}
