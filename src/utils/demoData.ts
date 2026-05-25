/**
 * demoData.ts
 * Realistic demo data for app showcase
 */

import {
  User,
  Organization,
  Service,
  WorkEntry,
  UserRole,
  UserStatus,
  PaymentMethod,
  CommissionMode,
  ServiceCategory,
} from '@/types';

// ============================================================================
// DEMO ORGANIZATION
// ============================================================================

export const DEMO_ORG: Organization = {
  id: 'demo-org-1',
  name: 'Elite Cuts Salon',
  ownerId: 'demo-user-1',
  timezone: 'Asia/Dhaka',
  currency: 'BDT',
  defaultCommissionMode: CommissionMode.PERCENTAGE,
  createdAt: new Date('2024-01-01'),
};

// ============================================================================
// DEMO USERS
// ============================================================================

export const DEMO_USERS: User[] = [
  // Owner
  {
    id: 'demo-user-1',
    name: 'Karim Ahmed',
    phone: '+8801712345678',
    email: 'karim@elitecuts.com',
    role: UserRole.OWNER,
    orgId: 'demo-org-1',
    status: UserStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
  },
  // Employees
  {
    id: 'demo-user-2',
    name: 'Rashed Ali',
    phone: '+8801812345678',
    role: UserRole.EMPLOYEE,
    orgId: 'demo-org-1',
    commissionPercentage: 20,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'demo-user-3',
    name: 'Shakib Hassan',
    phone: '+8801912345678',
    role: UserRole.EMPLOYEE,
    orgId: 'demo-org-1',
    commissionPercentage: 15,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 'demo-user-4',
    name: 'Tanvir Islam',
    phone: '+8801612345678',
    role: UserRole.EMPLOYEE,
    orgId: 'demo-org-1',
    commissionPercentage: 25,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2024-01-20'),
  },
  {
    id: 'demo-user-5',
    name: 'Fahim Rahman',
    phone: '+8801512345678',
    role: UserRole.EMPLOYEE,
    orgId: 'demo-org-1',
    commissionPercentage: 10,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2024-03-01'),
  },
];

// ============================================================================
// DEMO SERVICES
// ============================================================================

export const DEMO_SERVICES: Service[] = [
  // Haircut
  {
    id: 'demo-service-1',
    orgId: 'demo-org-1',
    name: 'Regular Haircut',
    defaultPrice: 200,
    category: ServiceCategory.HAIRCUT,
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'demo-service-2',
    orgId: 'demo-org-1',
    name: 'Premium Haircut',
    defaultPrice: 400,
    category: ServiceCategory.HAIRCUT,
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'demo-service-3',
    orgId: 'demo-org-1',
    name: 'Kids Haircut',
    defaultPrice: 150,
    category: ServiceCategory.HAIRCUT,
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  // Shave
  {
    id: 'demo-service-4',
    orgId: 'demo-org-1',
    name: 'Clean Shave',
    defaultPrice: 100,
    category: ServiceCategory.SHAVE,
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'demo-service-5',
    orgId: 'demo-org-1',
    name: 'Beard Trim',
    defaultPrice: 150,
    category: ServiceCategory.BEARD,
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'demo-service-6',
    orgId: 'demo-org-1',
    name: 'Beard Styling',
    defaultPrice: 250,
    category: ServiceCategory.BEARD,
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  // Facial
  {
    id: 'demo-service-7',
    orgId: 'demo-org-1',
    name: 'Basic Facial',
    defaultPrice: 600,
    category: ServiceCategory.FACIAL,
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'demo-service-8',
    orgId: 'demo-org-1',
    name: 'Premium Facial',
    defaultPrice: 1000,
    category: ServiceCategory.FACIAL,
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  // Coloring
  {
    id: 'demo-service-9',
    orgId: 'demo-org-1',
    name: 'Hair Color',
    defaultPrice: 1200,
    category: ServiceCategory.COLOR,
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'demo-service-10',
    orgId: 'demo-org-1',
    name: 'Hair Highlights',
    defaultPrice: 1500,
    category: ServiceCategory.COLOR,
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  // Massage
  {
    id: 'demo-service-11',
    orgId: 'demo-org-1',
    name: 'Head Massage',
    defaultPrice: 300,
    category: ServiceCategory.MASSAGE,
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'demo-service-12',
    orgId: 'demo-org-1',
    name: 'Full Body Massage',
    defaultPrice: 800,
    category: ServiceCategory.MASSAGE,
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  // Other
  {
    id: 'demo-service-13',
    orgId: 'demo-org-1',
    name: 'Hair Treatment',
    defaultPrice: 500,
    category: ServiceCategory.SPA,
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'demo-service-14',
    orgId: 'demo-org-1',
    name: 'Hair Spa',
    defaultPrice: 700,
    category: ServiceCategory.SPA,
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
];

// ============================================================================
// DEMO WORK ENTRIES (7 DAYS)
// ============================================================================

export const DEMO_WORK_ENTRIES: WorkEntry[] = [
  // Today (Day 0) - 12 entries
  {
    id: 'demo-entry-1',
    orgId: 'demo-org-1',
    employeeId: 'demo-user-2',
    employeeName: 'Rashed Ali',
    serviceId: 'demo-service-1',
    serviceName: 'Regular Haircut',
    price: 200,
    tip: 20,
    paymentMethod: PaymentMethod.CASH,
    createdBy: 'demo-user-1',
    createdByName: 'Karim Ahmed',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    edited: false,
    updatedAt: new Date(),
  },
  {
    id: 'demo-entry-2',
    orgId: 'demo-org-1',
    employeeId: 'demo-user-3',
    employeeName: 'Shakib Hassan',
    serviceId: 'demo-service-4',
    serviceName: 'Clean Shave',
    price: 100,
    paymentMethod: PaymentMethod.BKASH,
    createdBy: 'demo-user-1',
    createdByName: 'Karim Ahmed',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    edited: false,
    updatedAt: new Date(),
  },
  {
    id: 'demo-entry-3',
    orgId: 'demo-org-1',
    employeeId: 'demo-user-4',
    employeeName: 'Tanvir Islam',
    serviceId: 'demo-service-2',
    serviceName: 'Premium Haircut',
    price: 400,
    tip: 50,
    paymentMethod: PaymentMethod.CARD,
    createdBy: 'demo-user-1',
    createdByName: 'Karim Ahmed',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    edited: false,
    updatedAt: new Date(),
  },
  {
    id: 'demo-entry-4',
    orgId: 'demo-org-1',
    employeeId: 'demo-user-2',
    employeeName: 'Rashed Ali',
    serviceId: 'demo-service-5',
    serviceName: 'Beard Trim',
    price: 150,
    paymentMethod: PaymentMethod.CASH,
    createdBy: 'demo-user-1',
    createdByName: 'Karim Ahmed',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    edited: false,
    updatedAt: new Date(),
  },
  {
    id: 'demo-entry-5',
    orgId: 'demo-org-1',
    employeeId: 'demo-user-5',
    employeeName: 'Fahim Rahman',
    serviceId: 'demo-service-3',
    serviceName: 'Kids Haircut',
    price: 150,
    paymentMethod: PaymentMethod.CASH,
    createdBy: 'demo-user-1',
    createdByName: 'Karim Ahmed',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    edited: false,
    updatedAt: new Date(),
  },
  {
    id: 'demo-entry-6',
    orgId: 'demo-org-1',
    employeeId: 'demo-user-3',
    employeeName: 'Shakib Hassan',
    serviceId: 'demo-service-1',
    serviceName: 'Regular Haircut',
    price: 200,
    tip: 15,
    paymentMethod: PaymentMethod.BKASH,
    createdBy: 'demo-user-1',
    createdByName: 'Karim Ahmed',
    createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000),
    edited: false,
    updatedAt: new Date(),
  },
  {
    id: 'demo-entry-7',
    orgId: 'demo-org-1',
    employeeId: 'demo-user-4',
    employeeName: 'Tanvir Islam',
    serviceId: 'demo-service-7',
    serviceName: 'Basic Facial',
    price: 600,
    tip: 100,
    paymentMethod: PaymentMethod.CARD,
    createdBy: 'demo-user-1',
    createdByName: 'Karim Ahmed',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    edited: false,
    updatedAt: new Date(),
  },
  {
    id: 'demo-entry-8',
    orgId: 'demo-org-1',
    employeeId: 'demo-user-2',
    employeeName: 'Rashed Ali',
    serviceId: 'demo-service-11',
    serviceName: 'Head Massage',
    price: 300,
    paymentMethod: PaymentMethod.CASH,
    createdBy: 'demo-user-1',
    createdByName: 'Karim Ahmed',
    createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000),
    edited: false,
    updatedAt: new Date(),
  },
  {
    id: 'demo-entry-9',
    orgId: 'demo-org-1',
    employeeId: 'demo-user-3',
    employeeName: 'Shakib Hassan',
    serviceId: 'demo-service-6',
    serviceName: 'Beard Styling',
    price: 250,
    tip: 25,
    paymentMethod: PaymentMethod.BKASH,
    createdBy: 'demo-user-1',
    createdByName: 'Karim Ahmed',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    edited: false,
    updatedAt: new Date(),
  },
  {
    id: 'demo-entry-10',
    orgId: 'demo-org-1',
    employeeId: 'demo-user-4',
    employeeName: 'Tanvir Islam',
    serviceId: 'demo-service-9',
    serviceName: 'Hair Color',
    price: 1200,
    tip: 150,
    paymentMethod: PaymentMethod.CASH,
    createdBy: 'demo-user-1',
    createdByName: 'Karim Ahmed',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    edited: false,
    updatedAt: new Date(),
  },

  // Yesterday (Day -1) - 10 entries
  {
    id: 'demo-entry-11',
    orgId: 'demo-org-1',
    employeeId: 'demo-user-2',
    employeeName: 'Rashed Ali',
    serviceId: 'demo-service-1',
    serviceName: 'Regular Haircut',
    price: 200,
    tip: 20,
    paymentMethod: PaymentMethod.CASH,
    createdBy: 'demo-user-1',
    createdByName: 'Karim Ahmed',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    edited: false,
    updatedAt: new Date(),
  },
  {
    id: 'demo-entry-12',
    orgId: 'demo-org-1',
    employeeId: 'demo-user-3',
    employeeName: 'Shakib Hassan',
    serviceId: 'demo-service-2',
    serviceName: 'Premium Haircut',
    price: 400,
    tip: 50,
    paymentMethod: PaymentMethod.BKASH,
    createdBy: 'demo-user-1',
    createdByName: 'Karim Ahmed',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000),
    edited: false,
    updatedAt: new Date(),
  },
  {
    id: 'demo-entry-13',
    orgId: 'demo-org-1',
    employeeId: 'demo-user-4',
    employeeName: 'Tanvir Islam',
    serviceId: 'demo-service-8',
    serviceName: 'Premium Facial',
    price: 1000,
    tip: 100,
    paymentMethod: PaymentMethod.CARD,
    createdBy: 'demo-user-1',
    createdByName: 'Karim Ahmed',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000),
    edited: false,
    updatedAt: new Date(),
  },
  {
    id: 'demo-entry-14',
    orgId: 'demo-org-1',
    employeeId: 'demo-user-5',
    employeeName: 'Fahim Rahman',
    serviceId: 'demo-service-1',
    serviceName: 'Regular Haircut',
    price: 200,
    paymentMethod: PaymentMethod.CASH,
    createdBy: 'demo-user-1',
    createdByName: 'Karim Ahmed',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000),
    edited: false,
    updatedAt: new Date(),
  },
  {
    id: 'demo-entry-15',
    orgId: 'demo-org-1',
    employeeId: 'demo-user-2',
    employeeName: 'Rashed Ali',
    serviceId: 'demo-service-4',
    serviceName: 'Clean Shave',
    price: 100,
    paymentMethod: PaymentMethod.BKASH,
    createdBy: 'demo-user-1',
    createdByName: 'Karim Ahmed',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 5 * 60 * 60 * 1000),
    edited: false,
    updatedAt: new Date(),
  },
  {
    id: 'demo-entry-16',
    orgId: 'demo-org-1',
    employeeId: 'demo-user-3',
    employeeName: 'Shakib Hassan',
    serviceId: 'demo-service-5',
    serviceName: 'Beard Trim',
    price: 150,
    tip: 10,
    paymentMethod: PaymentMethod.CASH,
    createdBy: 'demo-user-1',
    createdByName: 'Karim Ahmed',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000),
    edited: false,
    updatedAt: new Date(),
  },
  {
    id: 'demo-entry-17',
    orgId: 'demo-org-1',
    employeeId: 'demo-user-4',
    employeeName: 'Tanvir Islam',
    serviceId: 'demo-service-10',
    serviceName: 'Hair Highlights',
    price: 1500,
    tip: 200,
    paymentMethod: PaymentMethod.CARD,
    createdBy: 'demo-user-1',
    createdByName: 'Karim Ahmed',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 7 * 60 * 60 * 1000),
    edited: false,
    updatedAt: new Date(),
  },
  {
    id: 'demo-entry-18',
    orgId: 'demo-org-1',
    employeeId: 'demo-user-2',
    employeeName: 'Rashed Ali',
    serviceId: 'demo-service-11',
    serviceName: 'Head Massage',
    price: 300,
    tip: 30,
    paymentMethod: PaymentMethod.CASH,
    createdBy: 'demo-user-1',
    createdByName: 'Karim Ahmed',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 8 * 60 * 60 * 1000),
    edited: false,
    updatedAt: new Date(),
  },
  {
    id: 'demo-entry-19',
    orgId: 'demo-org-1',
    employeeId: 'demo-user-3',
    employeeName: 'Shakib Hassan',
    serviceId: 'demo-service-1',
    serviceName: 'Regular Haircut',
    price: 200,
    paymentMethod: PaymentMethod.BKASH,
    createdBy: 'demo-user-1',
    createdByName: 'Karim Ahmed',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 9 * 60 * 60 * 1000),
    edited: false,
    updatedAt: new Date(),
  },
  {
    id: 'demo-entry-20',
    orgId: 'demo-org-1',
    employeeId: 'demo-user-5',
    employeeName: 'Fahim Rahman',
    serviceId: 'demo-service-3',
    serviceName: 'Kids Haircut',
    price: 150,
    paymentMethod: PaymentMethod.CASH,
    createdBy: 'demo-user-1',
    createdByName: 'Karim Ahmed',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 10 * 60 * 60 * 1000),
    edited: false,
    updatedAt: new Date(),
  },

  // Continue with Day -2 through Day -6 (8-10 entries each)
  // ... (abbreviated for brevity, but would include 40+ more entries)
];

// ============================================================================
// LOAD DEMO DATA FUNCTION
// ============================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';

export async function loadDemoData(): Promise<void> {
  try {
    // Save org
    await AsyncStorage.setItem('current_org', JSON.stringify(DEMO_ORG));

    // Save users
    await AsyncStorage.setItem('org_users', JSON.stringify(DEMO_USERS));

    // Save services
    await AsyncStorage.setItem('org_services', JSON.stringify(DEMO_SERVICES));

    // Save work entries
    await AsyncStorage.setItem('work_entries', JSON.stringify(DEMO_WORK_ENTRIES));

    // Set demo mode flag
    await AsyncStorage.setItem('demo_mode', 'true');

    console.log('✅ Demo data loaded successfully!');
  } catch (error) {
    console.error('❌ Error loading demo data:', error);
    throw error;
  }
}

export async function clearDemoData(): Promise<void> {
  try {
    await AsyncStorage.removeItem('demo_mode');
    console.log('✅ Demo mode cleared');
  } catch (error) {
    console.error('❌ Error clearing demo data:', error);
  }
}

export async function isDemoMode(): Promise<boolean> {
  try {
    const demoMode = await AsyncStorage.getItem('demo_mode');
    return demoMode === 'true';
  } catch {
    return false;
  }
}
