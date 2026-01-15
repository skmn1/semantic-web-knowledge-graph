/**
 * UMA Access Control Manager
 * Implements User-Managed Access (UMA) style authorization
 */

import { v4 as uuidv4 } from 'uuid';
import { sessionManager } from './sessionManager';

// Mock user database (used in demo mode when OIDC is not configured)
export const users = {
  alice: {
    id: 'alice',
    name: 'Alice Johnson',
    email: 'alice@research.org',
    role: 'researcher'
  },
  bob: {
    id: 'bob',
    name: 'Bob Smith',
    email: 'bob@research.org',
    role: 'researcher'
  },
  carol: {
    id: 'carol',
    name: 'Carol Davis',
    email: 'carol@research.org',
    role: 'researcher'
  },
  david: {
    id: 'david',
    name: 'David Chen',
    email: 'david@research.org',
    role: 'researcher'
  }
};

/**
 * Get current user (from OIDC or demo mode)
 * @param {Object} currentUser - Current user object passed from App
 * @returns {Object} User object with id, name, email
 */
export function getCurrentUser(currentUser) {
  // If we have a real OIDC user, use it
  if (sessionManager.isAuthenticated()) {
    return {
      id: sessionManager.getUserId(),
      name: sessionManager.getUserName(),
      email: sessionManager.getUserEmail(),
      role: 'researcher'
    };
  }
  
  // Otherwise use the provided demo user
  return currentUser || users.alice;
}

// Resource ownership mapping
const resourceOwnership = {
  photo1: 'alice',
  photo2: 'bob',
  photo3: 'carol',
  photo4: 'alice',
  photo5: 'david'
};

class UMAAccessControl {
  constructor() {
    // Access requests: { requestId: { resourceId, requesterId, status, timestamp, purpose } }
    this.accessRequests = {};
    
    // Granted permissions: { permissionId: { resourceId, userId, actions, grantedAt, expiresAt } }
    this.permissions = {};
    
    // Initialize some sample access requests and permissions
    this.initializeSampleData();
  }

  initializeSampleData() {
    // Sample access request from Bob for photo1
    const request1 = {
      id: uuidv4(),
      resourceId: 'photo1',
      requesterId: 'bob',
      ownerId: 'alice',
      status: 'pending',
      timestamp: new Date('2026-01-10T10:00:00'),
      purpose: 'research',
      message: 'I would like to use this photo in my climate research paper.'
    };
    this.accessRequests[request1.id] = request1;

    // Sample granted permission for Carol to access photo2
    const permission1 = {
      id: uuidv4(),
      resourceId: 'photo2',
      userId: 'carol',
      actions: ['display', 'use'],
      grantedAt: new Date('2026-01-08T14:00:00'),
      expiresAt: new Date('2027-01-08T14:00:00'),
      conditions: {
        purpose: 'research',
        attribution: true
      }
    };
    this.permissions[permission1.id] = permission1;

    // Sample granted permission for Alice to access photo3
    const permission2 = {
      id: uuidv4(),
      resourceId: 'photo3',
      userId: 'alice',
      actions: ['display', 'use'],
      grantedAt: new Date('2026-01-05T09:00:00'),
      expiresAt: new Date('2026-12-31T23:59:59'),
      conditions: {
        purpose: 'education',
        attribution: true
      }
    };
    this.permissions[permission2.id] = permission2;
  }

  // Request access to a resource
  requestAccess(resourceId, requesterId, purpose, message) {
    const ownerId = resourceOwnership[resourceId];
    
    if (!ownerId) {
      return { success: false, error: 'Resource not found' };
    }

    if (ownerId === requesterId) {
      return { success: false, error: 'You already own this resource' };
    }

    // Check if there's already a pending request
    const existingRequest = Object.values(this.accessRequests).find(
      req => req.resourceId === resourceId && 
             req.requesterId === requesterId && 
             req.status === 'pending'
    );

    if (existingRequest) {
      return { success: false, error: 'You already have a pending request for this resource' };
    }

    const request = {
      id: uuidv4(),
      resourceId,
      requesterId,
      ownerId,
      status: 'pending',
      timestamp: new Date(),
      purpose: purpose || 'general',
      message: message || ''
    };

    this.accessRequests[request.id] = request;

    return { 
      success: true, 
      requestId: request.id,
      message: 'Access request submitted successfully'
    };
  }

  // Approve an access request
  approveRequest(requestId, actions, expiresInDays = 365) {
    const request = this.accessRequests[requestId];
    
    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    if (request.status !== 'pending') {
      return { success: false, error: 'Request already processed' };
    }

    // Create permission
    const permission = {
      id: uuidv4(),
      resourceId: request.resourceId,
      userId: request.requesterId,
      actions: actions || ['display', 'use'],
      grantedAt: new Date(),
      expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
      conditions: {
        purpose: request.purpose,
        attribution: true
      }
    };

    this.permissions[permission.id] = permission;

    // Update request status
    request.status = 'approved';
    request.approvedAt = new Date();

    return {
      success: true,
      permissionId: permission.id,
      message: 'Access request approved'
    };
  }

  // Deny an access request
  denyRequest(requestId, reason) {
    const request = this.accessRequests[requestId];
    
    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    if (request.status !== 'pending') {
      return { success: false, error: 'Request already processed' };
    }

    request.status = 'denied';
    request.deniedAt = new Date();
    request.denialReason = reason || 'No reason provided';

    return {
      success: true,
      message: 'Access request denied'
    };
  }

  // Check if a user has permission to perform an action
  hasPermission(userId, resourceId, action) {
    // Resource owners always have full permissions
    if (resourceOwnership[resourceId] === userId) {
      return {
        hasPermission: true,
        reason: 'Resource owner',
        conditions: {}
      };
    }

    // Check granted permissions
    const userPermissions = Object.values(this.permissions).filter(
      perm => perm.resourceId === resourceId && 
              perm.userId === userId &&
              new Date() < new Date(perm.expiresAt)
    );

    for (const permission of userPermissions) {
      if (permission.actions.includes(action)) {
        return {
          hasPermission: true,
          reason: 'Permission granted',
          conditions: permission.conditions,
          expiresAt: permission.expiresAt
        };
      }
    }

    return {
      hasPermission: false,
      reason: 'No permission found'
    };
  }

  // Get all access requests for a resource owner
  getRequestsForOwner(ownerId) {
    return Object.values(this.accessRequests).filter(
      req => req.ownerId === ownerId
    ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Get all access requests made by a user
  getRequestsByUser(userId) {
    return Object.values(this.accessRequests).filter(
      req => req.requesterId === userId
    ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Get all permissions for a user
  getPermissionsForUser(userId) {
    return Object.values(this.permissions).filter(
      perm => perm.userId === userId &&
              new Date() < new Date(perm.expiresAt)
    ).sort((a, b) => new Date(b.grantedAt) - new Date(a.grantedAt));
  }

  // Get all permissions granted by an owner
  getPermissionsByOwner(ownerId) {
    return Object.values(this.permissions).filter(perm => {
      return resourceOwnership[perm.resourceId] === ownerId &&
             new Date() < new Date(perm.expiresAt);
    }).sort((a, b) => new Date(b.grantedAt) - new Date(a.grantedAt));
  }

  // Revoke a permission
  revokePermission(permissionId) {
    const permission = this.permissions[permissionId];
    
    if (!permission) {
      return { success: false, error: 'Permission not found' };
    }

    // Set expiration to now (effectively revoking)
    permission.expiresAt = new Date();
    permission.revokedAt = new Date();

    return {
      success: true,
      message: 'Permission revoked successfully'
    };
  }

  // Grant direct permission (without request)
  grantPermission(resourceId, userId, actions, expiresInDays = 365) {
    const permission = {
      id: uuidv4(),
      resourceId,
      userId,
      actions: actions || ['display', 'use'],
      grantedAt: new Date(),
      expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
      conditions: {
        attribution: true
      }
    };

    this.permissions[permission.id] = permission;

    return {
      success: true,
      permissionId: permission.id,
      message: 'Permission granted successfully'
    };
  }

  // Get resource owner
  getResourceOwner(resourceId) {
    return resourceOwnership[resourceId];
  }

  // Get all resources owned by a user
  getResourcesByOwner(ownerId) {
    return Object.entries(resourceOwnership)
      .filter(([, owner]) => owner === ownerId)
      .map(([resourceId]) => resourceId);
  }

  // Get user by ID
  getUser(userId) {
    return users[userId] || null;
  }

  // Get all users
  getAllUsers() {
    return Object.values(users);
  }
}

// Create singleton instance
export const umaAccessControl = new UMAAccessControl();
export default umaAccessControl;
export { resourceOwnership };
