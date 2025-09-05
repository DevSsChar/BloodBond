import { getToken } from 'next-auth/jwt';
import connectDB from '@/db/connectDB.mjs';
import User from '@/model/user.js';

export async function authenticateRole(req, allowedRoles = [], allowIncompleteRegistration = false) {
  try {
    // Get the JWT token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.email) {
      return {
        success: false,
        error: 'Unauthorized - No valid session',
        status: 401
      };
    }

    // Connect to database
    await connectDB();

    // Find user in database
    const user = await User.findOne({ email: token.email });
    
    if (!user) {
      return {
        success: false,
        error: 'User not found',
        status: 404
      };
    }

    // Check if user has a role
    if (!user.role) {
      return {
        success: false,
        error: 'Access denied - Role required',
        status: 403
      };
    }

    // Check if user completed registration (skip this check if allowIncompleteRegistration is true)
    if (!allowIncompleteRegistration && !user.isRegistrationComplete) {
      return {
        success: false,
        error: 'Access denied - Registration incomplete',
        status: 403
      };
    }

    // Check if user role is in allowed roles (if specified)
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return {
        success: false,
        error: `Access denied - Required roles: ${allowedRoles.join(', ')}`,
        status: 403
      };
    }

    return {
      success: true,
      user: user,
      role: user.role
    };
  } catch (error) {
    console.error('Role authentication error:', error);
    return {
      success: false,
      error: 'Internal server error',
      status: 500
    };
  }
}

// Helper function to create protected API route handlers
export function createProtectedRoute(allowedRoles = []) {
  return async function(req, handler) {
    const auth = await authenticateRole(req, allowedRoles);
    
    if (!auth.success) {
      return Response.json(
        { error: auth.error },
        { status: auth.status }
      );
    }
    
    // Add user info to request
    req.user = auth.user;
    req.userRole = auth.role;
    
    return handler(req);
  };
}
