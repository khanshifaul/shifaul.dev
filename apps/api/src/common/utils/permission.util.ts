import { ForbiddenException } from '@nestjs/common';

/**
 * User role types for the system
 */
export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  SUPPORT_AGENT = 'support',
  DEVELOPER = 'developer',
  USER = 'user',
}

/**
 * Permission utility class for consistent role-based access control
 */
export class PermissionUtils {
  /**
   * Check if user has admin role
   */
  static isAdmin(roles: string[]): boolean {
    return roles.includes(UserRole.ADMIN);
  }

  /**
   * Check if user has staff role (admin, staff, or support agent)
   */
  static isStaff(roles: string[]): boolean {
    return roles.some(role => 
      role === UserRole.ADMIN || 
      role === UserRole.STAFF || 
      role === UserRole.SUPPORT_AGENT ||
      role === UserRole.DEVELOPER
    );
  }

  /**
   * Check if user has support agent role
   */
  static isSupportAgent(roles: string[]): boolean {
    return roles.includes(UserRole.SUPPORT_AGENT) || 
           roles.includes(UserRole.ADMIN);
  }

  /**
   * Check if user has developer role
   */
  static isDeveloper(roles: string[]): boolean {
    return roles.includes(UserRole.DEVELOPER) || 
           roles.includes(UserRole.ADMIN);
  }

  /**
   * Check if user has any of the specified roles
   */
  static hasAnyRole(roles: string[], requiredRoles: string[]): boolean {
    return requiredRoles.some(role => roles.includes(role));
  }

  /**
   * Check if user has all of the specified roles
   */
  static hasAllRoles(roles: string[], requiredRoles: string[]): boolean {
    return requiredRoles.every(role => roles.includes(role));
  }

  /**
   * Throw ForbiddenException if user doesn't have required role
   */
  static requireRole(roles: string[], requiredRole: string): void {
    if (!roles.includes(requiredRole)) {
      throw new ForbiddenException(`Access denied. Required role: ${requiredRole}`);
    }
  }

  /**
   * Throw ForbiddenException if user doesn't have any of the required roles
   */
  static requireAnyRole(roles: string[], requiredRoles: string[]): void {
    if (!this.hasAnyRole(roles, requiredRoles)) {
      throw new ForbiddenException(`Access denied. Required roles: ${requiredRoles.join(', ')}`);
    }
  }

  /**
   * Throw ForbiddenException if user doesn't have admin role
   */
  static requireAdmin(roles: string[]): void {
    if (!this.isAdmin(roles)) {
      throw new ForbiddenException('Access denied. Admin role required.');
    }
  }

  /**
   * Throw ForbiddenException if user doesn't have staff role
   */
  static requireStaff(roles: string[]): void {
    if (!this.isStaff(roles)) {
      throw new ForbiddenException('Access denied. Staff role required.');
    }
  }

  /**
   * Throw ForbiddenException if user doesn't have support agent role
   */
  static requireSupportAgent(roles: string[]): void {
    if (!this.isSupportAgent(roles)) {
      throw new ForbiddenException('Access denied. Support agent role required.');
    }
  }

  /**
   * Throw ForbiddenException if user doesn't have developer role
   */
  static requireDeveloper(roles: string[]): void {
    if (!this.isDeveloper(roles)) {
      throw new ForbiddenException('Access denied. Developer role required.');
    }
  }

  /**
   * Get user permission level (0=user, 1=support, 2=staff, 3=admin, 4=developer)
   */
  static getPermissionLevel(roles: string[]): number {
    if (this.isDeveloper(roles)) return 4;
    if (this.isAdmin(roles)) return 3;
    if (roles.includes(UserRole.STAFF)) return 2;
    if (this.isSupportAgent(roles)) return 1;
    return 0;
  }

  /**
   * Check if user has minimum permission level
   */
  static hasMinPermissionLevel(roles: string[], minLevel: number): boolean {
    return this.getPermissionLevel(roles) >= minLevel;
  }

  /**
   * Throw ForbiddenException if user doesn't have minimum permission level
   */
  static requireMinPermissionLevel(roles: string[], minLevel: number): void {
    if (!this.hasMinPermissionLevel(roles, minLevel)) {
      throw new ForbiddenException(`Access denied. Minimum permission level required: ${minLevel}`);
    }
  }
}

/**
 * Custom exception for permission errors
 */
export class PermissionException extends ForbiddenException {
  constructor(message: string, code?: string) {
    super(message, code);
  }
}

/**
 * Decorator for requiring specific roles
 */
export function RequireRoles(...roles: string[]) {
  return (_target: any, _propertyName: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const user = args.find(arg => arg?.id && arg?.roles);
      if (!user || !Array.isArray(user.roles)) {
        throw new PermissionException('User authentication required');
      }
      
      PermissionUtils.requireAnyRole(user.roles, roles);
      return originalMethod.apply(this, args);
    };
  };
}