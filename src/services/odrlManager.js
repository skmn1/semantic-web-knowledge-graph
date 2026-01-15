/**
 * ODRL Policy Manager
 * Manages usage policies for photos using ODRL standard
 */

import { v4 as uuidv4 } from 'uuid';

// ODRL Policy definitions for each photo
export const odrlPolicies = {
  photo1: {
    '@context': 'http://www.w3.org/ns/odrl.jsonld',
    '@type': 'Set',
    'uid': 'http://example.org/policy/photo1',
    'profile': 'http://example.org/odrl:profile:01',
    'permission': [
      {
        'target': 'http://example.org/photos/photo1',
        'action': 'display',
        'assigner': 'http://example.org/photos/alice',
        'assignee': 'http://example.org/photos/anyUser'
      },
      {
        'target': 'http://example.org/photos/photo1',
        'action': 'use',
        'assigner': 'http://example.org/photos/alice',
        'constraint': [{
          'leftOperand': 'purpose',
          'operator': 'eq',
          'rightOperand': 'research'
        }],
        'duty': [{
          'action': 'attribute',
          'attributedParty': 'http://example.org/photos/alice'
        }]
      }
    ],
    'prohibition': [
      {
        'target': 'http://example.org/photos/photo1',
        'action': 'commercialize',
        'assigner': 'http://example.org/photos/alice'
      }
    ]
  },
  photo2: {
    '@context': 'http://www.w3.org/ns/odrl.jsonld',
    '@type': 'Set',
    'uid': 'http://example.org/policy/photo2',
    'profile': 'http://example.org/odrl:profile:01',
    'permission': [
      {
        'target': 'http://example.org/photos/photo2',
        'action': 'display',
        'assigner': 'http://example.org/photos/bob'
      },
      {
        'target': 'http://example.org/photos/photo2',
        'action': 'use',
        'assigner': 'http://example.org/photos/bob',
        'duty': [{
          'action': 'attribute',
          'attributedParty': 'http://example.org/photos/bob'
        }]
      },
      {
        'target': 'http://example.org/photos/photo2',
        'action': 'commercialize',
        'assigner': 'http://example.org/photos/bob',
        'duty': [{
          'action': 'compensate',
          'compensatedParty': 'http://example.org/photos/bob',
          'payAmount': [{
            'amount': '100',
            'unit': 'USD'
          }]
        }]
      }
    ]
  },
  photo3: {
    '@context': 'http://www.w3.org/ns/odrl.jsonld',
    '@type': 'Set',
    'uid': 'http://example.org/policy/photo3',
    'profile': 'http://example.org/odrl:profile:01',
    'permission': [
      {
        'target': 'http://example.org/photos/photo3',
        'action': 'display',
        'assigner': 'http://example.org/photos/carol',
        'constraint': [{
          'leftOperand': 'dateTime',
          'operator': 'lteq',
          'rightOperand': '2026-12-31T23:59:59'
        }]
      },
      {
        'target': 'http://example.org/photos/photo3',
        'action': 'use',
        'assigner': 'http://example.org/photos/carol',
        'constraint': [{
          'leftOperand': 'purpose',
          'operator': 'eq',
          'rightOperand': 'education'
        }],
        'duty': [{
          'action': 'attribute',
          'attributedParty': 'http://example.org/photos/carol'
        }]
      }
    ],
    'prohibition': [
      {
        'target': 'http://example.org/photos/photo3',
        'action': 'distribute',
        'assigner': 'http://example.org/photos/carol'
      },
      {
        'target': 'http://example.org/photos/photo3',
        'action': 'commercialize',
        'assigner': 'http://example.org/photos/carol'
      }
    ]
  },
  photo4: {
    '@context': 'http://www.w3.org/ns/odrl.jsonld',
    '@type': 'Set',
    'uid': 'http://example.org/policy/photo4',
    'profile': 'http://example.org/odrl:profile:01',
    'permission': [
      {
        'target': 'http://example.org/photos/photo4',
        'action': 'display',
        'assigner': 'http://example.org/photos/alice'
      },
      {
        'target': 'http://example.org/photos/photo4',
        'action': 'use',
        'assigner': 'http://example.org/photos/alice',
        'duty': [{
          'action': 'attribute',
          'attributedParty': 'http://example.org/photos/alice'
        }]
      },
      {
        'target': 'http://example.org/photos/photo4',
        'action': 'commercialize',
        'assigner': 'http://example.org/photos/alice',
        'duty': [{
          'action': 'attribute',
          'attributedParty': 'http://example.org/photos/alice'
        }]
      }
    ]
  },
  photo5: {
    '@context': 'http://www.w3.org/ns/odrl.jsonld',
    '@type': 'Set',
    'uid': 'http://example.org/policy/photo5',
    'profile': 'http://example.org/odrl:profile:01',
    'permission': [
      {
        'target': 'http://example.org/photos/photo5',
        'action': 'display',
        'assigner': 'http://example.org/photos/david',
        'assignee': 'http://example.org/photos/anyUser'
      }
    ],
    'prohibition': [
      {
        'target': 'http://example.org/photos/photo5',
        'action': 'use',
        'assigner': 'http://example.org/photos/david'
      },
      {
        'target': 'http://example.org/photos/photo5',
        'action': 'commercialize',
        'assigner': 'http://example.org/photos/david'
      },
      {
        'target': 'http://example.org/photos/photo5',
        'action': 'modify',
        'assigner': 'http://example.org/photos/david'
      }
    ]
  }
};

class ODRLPolicyManager {
  constructor() {
    this.policies = { ...odrlPolicies };
  }

  // Get policy for a photo
  getPolicy(photoId) {
    return this.policies[photoId] || null;
  }

  // Check if an action is permitted for a user
  checkPermission(photoId, userId, action, context = {}) {
    const policy = this.getPolicy(photoId);
    if (!policy) {
      return { permitted: false, reason: 'No policy found' };
    }

    const userUri = `http://example.org/photos/${userId}`;

    // Check prohibitions first
    if (policy.prohibition) {
      for (const prohibition of policy.prohibition) {
        if (prohibition.action === action) {
          return { 
            permitted: false, 
            reason: `Action "${action}" is prohibited by policy`,
            duty: null
          };
        }
      }
    }

    // Check permissions
    if (policy.permission) {
      for (const permission of policy.permission) {
        if (permission.action === action) {
          // Check assignee if specified
          if (permission.assignee && permission.assignee !== 'http://example.org/photos/anyUser') {
            if (permission.assignee !== userUri) {
              continue;
            }
          }

          // Check constraints
          if (permission.constraint) {
            const constraintMet = this.evaluateConstraints(permission.constraint, context);
            if (!constraintMet.satisfied) {
              return {
                permitted: false,
                reason: constraintMet.reason,
                duty: null
              };
            }
          }

          // Extract duties
          const duties = permission.duty ? permission.duty.map(d => this.formatDuty(d)) : [];

          return {
            permitted: true,
            reason: 'Permission granted',
            duties: duties
          };
        }
      }
    }

    return { 
      permitted: false, 
      reason: `No permission found for action "${action}"`,
      duties: null
    };
  }

  // Evaluate policy constraints
  evaluateConstraints(constraints, context) {
    for (const constraint of constraints) {
      const { leftOperand, operator, rightOperand } = constraint;

      if (leftOperand === 'purpose') {
        const userPurpose = context.purpose || 'general';
        if (operator === 'eq' && userPurpose !== rightOperand) {
          return { 
            satisfied: false, 
            reason: `Purpose must be "${rightOperand}", but is "${userPurpose}"` 
          };
        }
      }

      if (leftOperand === 'dateTime') {
        const currentDate = new Date();
        const constraintDate = new Date(rightOperand);
        
        if (operator === 'lteq' && currentDate > constraintDate) {
          return { 
            satisfied: false, 
            reason: `Access expired on ${constraintDate.toLocaleDateString()}` 
          };
        }
        if (operator === 'gteq' && currentDate < constraintDate) {
          return { 
            satisfied: false, 
            reason: `Access not available until ${constraintDate.toLocaleDateString()}` 
          };
        }
      }
    }

    return { satisfied: true };
  }

  // Format duty for display
  formatDuty(duty) {
    if (duty.action === 'attribute') {
      return {
        type: 'attribution',
        description: `Must attribute to ${duty.attributedParty}`
      };
    }
    if (duty.action === 'compensate') {
      const amount = duty.payAmount?.[0];
      return {
        type: 'compensation',
        description: `Must pay ${amount?.amount} ${amount?.unit} to ${duty.compensatedParty}`
      };
    }
    return {
      type: duty.action,
      description: `Must ${duty.action}`
    };
  }

  // Get human-readable policy summary
  getPolicySummary(photoId) {
    const policy = this.getPolicy(photoId);
    if (!policy) return null;

    const summary = {
      permissions: [],
      prohibitions: [],
      duties: []
    };

    // Summarize permissions
    if (policy.permission) {
      for (const perm of policy.permission) {
        let permText = `${this.capitalizeAction(perm.action)} allowed`;
        
        if (perm.constraint) {
          const constraints = perm.constraint.map(c => this.formatConstraint(c)).join(', ');
          permText += ` (${constraints})`;
        }

        if (perm.duty) {
          const duties = perm.duty.map(d => this.formatDuty(d).description).join('; ');
          permText += ` - Requires: ${duties}`;
        }

        summary.permissions.push(permText);
      }
    }

    // Summarize prohibitions
    if (policy.prohibition) {
      for (const prohib of policy.prohibition) {
        summary.prohibitions.push(`${this.capitalizeAction(prohib.action)} prohibited`);
      }
    }

    return summary;
  }

  formatConstraint(constraint) {
    if (constraint.leftOperand === 'purpose') {
      return `for ${constraint.rightOperand} purposes only`;
    }
    if (constraint.leftOperand === 'dateTime') {
      const date = new Date(constraint.rightOperand);
      if (constraint.operator === 'lteq') {
        return `until ${date.toLocaleDateString()}`;
      }
      if (constraint.operator === 'gteq') {
        return `from ${date.toLocaleDateString()}`;
      }
    }
    return `${constraint.leftOperand} ${constraint.operator} ${constraint.rightOperand}`;
  }

  capitalizeAction(action) {
    return action.charAt(0).toUpperCase() + action.slice(1);
  }

  // Create a new policy
  createPolicy(photoId, permissions, prohibitions) {
    const policy = {
      '@context': 'http://www.w3.org/ns/odrl.jsonld',
      '@type': 'Set',
      'uid': `http://example.org/policy/${photoId}`,
      'profile': 'http://example.org/odrl:profile:01',
      'permission': permissions,
      'prohibition': prohibitions
    };

    this.policies[photoId] = policy;
    return policy;
  }

  // Update an existing policy
  updatePolicy(photoId, updates) {
    if (this.policies[photoId]) {
      this.policies[photoId] = {
        ...this.policies[photoId],
        ...updates
      };
      return this.policies[photoId];
    }
    return null;
  }

  // Get all policies
  getAllPolicies() {
    return this.policies;
  }
}

// Create singleton instance
export const odrlManager = new ODRLPolicyManager();
export default odrlManager;
