/**
 * Mock User Credentials for Testing
 * Use these credentials to test the app
 */

export interface MockCredential {
  phone: string;
  password: string;
  name: string;
  role: 'owner' | 'employee';
  orgName?: string;
}

/**
 * Test Accounts - Use these to login
 */
export const TEST_ACCOUNTS: MockCredential[] = [
  // Owner Accounts
  {
    phone: '+8801712345678',
    password: '123456',
    name: 'Ahmed Khan',
    role: 'owner',
    orgName: 'Elite Hair Salon',
  },
  {
    phone: '+8801912345678',
    password: '123456',
    name: 'Fatima Begum',
    role: 'owner',
    orgName: 'Royal Cuts',
  },
  {
    phone: '+8801612345678',
    password: '123456',
    name: 'Rashid Ali',
    role: 'owner',
    orgName: 'Premium Salon',
  },

  // Employee Accounts
  {
    phone: '+8801812345678',
    password: '123456',
    name: 'Karim Rahman',
    role: 'employee',
    orgName: 'Elite Hair Salon',
  },
  {
    phone: '+8801712345679',
    password: '123456',
    name: 'Rahim Mia',
    role: 'employee',
    orgName: 'Elite Hair Salon',
  },
  {
    phone: '+8801512345678',
    password: '123456',
    name: 'Jamal Uddin',
    role: 'employee',
    orgName: 'Royal Cuts',
  },
];

/**
 * Quick reference for login testing
 */
export const QUICK_LOGIN = {
  owner: {
    phone: '+8801712345678',
    password: '123456',
  },
  employee: {
    phone: '+8801812345678',
    password: '123456',
  },
};

/**
 * Get test account by role
 */
export const getTestAccount = (role: 'owner' | 'employee'): MockCredential => {
  const account = TEST_ACCOUNTS.find(acc => acc.role === role);
  if (!account) {
    throw new Error(`No test account found for role: ${role}`);
  }
  return account;
};

/**
 * Print all test accounts (for development console)
 */
export const printTestAccounts = (): void => {
  console.log('\n========================================');
  console.log('🔑 CutBook - Test Accounts');
  console.log('========================================\n');

  console.log('👨‍💼 OWNER ACCOUNTS:');
  TEST_ACCOUNTS.filter(acc => acc.role === 'owner').forEach(acc => {
    console.log(`  📱 ${acc.phone} | 🔒 ${acc.password}`);
    console.log(`     Name: ${acc.name} | Org: ${acc.orgName}\n`);
  });

  console.log('👨‍🔧 EMPLOYEE ACCOUNTS:');
  TEST_ACCOUNTS.filter(acc => acc.role === 'employee').forEach(acc => {
    console.log(`  📱 ${acc.phone} | 🔒 ${acc.password}`);
    console.log(`     Name: ${acc.name} | Org: ${acc.orgName}\n`);
  });

  console.log('========================================\n');
};

/**
 * Export for use in AuthContext
 */
export const MOCK_PASSWORDS: Record<string, string> = TEST_ACCOUNTS.reduce(
  (acc, account) => {
    acc[account.phone] = account.password;
    return acc;
  },
  {} as Record<string, string>,
);
