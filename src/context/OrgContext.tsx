/**
 * OrgContext - Organization State Management
 * Handles organization data, services, and users using Firestore
 */

import React, {createContext, useContext, useState, useEffect, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import type {Organization, User, Service} from '@/types';
import {UserRole, CommissionMode} from '@/types';
import {STORAGE_KEYS, ERROR_MESSAGES} from '@/constants';
import {useAuth} from './AuthContext';

// ============================================================================
// TYPES
// ============================================================================

interface CreateOrganizationPayload {
  name: string;
  timezone: string;
  currency: string;
  defaultCommissionMode: CommissionMode;
  defaultCommissionValue?: number;
  phone?: string;
  address?: string;
}

interface OrgContextValue {
  // State
  currentOrg: Organization | null;
  orgUsers: User[];
  orgServices: Service[];
  loading: boolean;
  error: string | null;

  // Methods
  createOrg: (payload: CreateOrganizationPayload) => Promise<void>;
  joinOrg: (inviteCode: string) => Promise<void>;
  updateOrg: (data: Partial<Organization>) => Promise<void>;
  fetchOrgData: () => Promise<void>;
  addService: (service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Service>;
  updateService: (id: string, data: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'orgId'>) => Promise<User>;
  updateUserInOrg: (id: string, data: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  clearError: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const OrgContext = createContext<OrgContextValue | undefined>(undefined);

// ============================================================================
// HELPERS
// ============================================================================

// Generate invite code
const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export const OrgProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const {user, updateUser} = useAuth(); // Need updateUser to update orgId on user
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [orgUsers, setOrgUsers] = useState<User[]>([]);
  const [orgServices, setOrgServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // INITIALIZATION & SYNC
  // ============================================================================

  useEffect(() => {
    let orgUnsubscribe: () => void;
    let usersUnsubscribe: () => void;
    let servicesUnsubscribe: () => void;

    if (user?.orgId) {
      setLoading(true);
      const orgId = user.orgId;

      // 1. Listen to Organization Document
      orgUnsubscribe = firestore()
        .collection('organizations')
        .doc(orgId)
        .onSnapshot(
          (docSnapshot: any) => {
            if (docSnapshot.exists()) {
              const orgData = docSnapshot.data() as Organization;
              orgData.id = docSnapshot.id;
              // Handle timestamps
              if (
                orgData.createdAt &&
                typeof orgData.createdAt === 'object' &&
                'toDate' in orgData.createdAt
              ) {
                orgData.createdAt = (orgData.createdAt as any).toDate();
              }
              if (
                orgData.updatedAt &&
                typeof orgData.updatedAt === 'object' &&
                'toDate' in orgData.updatedAt
              ) {
                orgData.updatedAt = (orgData.updatedAt as any).toDate();
              }

              setCurrentOrg(orgData);
              AsyncStorage.setItem(STORAGE_KEYS.CURRENT_ORG, JSON.stringify(orgData));
            } else {
              // Org might have been deleted
              setCurrentOrg(null);
              AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_ORG);
            }
            setLoading(false);
          },
          (err: any) => {
            console.error('Error listening to org:', err);
            setError('Failed to sync organization data');
            setLoading(false);
          },
        );

      // 2. Listen to Users in this Org
      usersUnsubscribe = firestore()
        .collection('users')
        .where('orgId', '==', orgId)
        .onSnapshot(
          (querySnapshot: any) => {
            const users: User[] = [];
            querySnapshot.forEach((docSnap: any) => {
              const userData = docSnap.data() as User;
              userData.id = docSnap.id;
              if (userData.createdAt && 'toDate' in (userData.createdAt as any))
                userData.createdAt = (userData.createdAt as any).toDate();
              if (userData.updatedAt && 'toDate' in (userData.updatedAt as any))
                userData.updatedAt = (userData.updatedAt as any).toDate();
              users.push(userData);
            });
            setOrgUsers(users);
          },
          (err: any) => console.error('Error listening to org users:', err),
        );

      // 3. Listen to Services
      servicesUnsubscribe = firestore()
        .collection('services')
        .where('orgId', '==', orgId)
        .onSnapshot(
          (querySnapshot: any) => {
            const services: Service[] = [];
            querySnapshot.forEach((docSnap: any) => {
              const sData = docSnap.data() as Service;
              sData.id = docSnap.id;
              if (sData.createdAt && 'toDate' in (sData.createdAt as any))
                sData.createdAt = (sData.createdAt as any).toDate();
              if (sData.updatedAt && 'toDate' in (sData.updatedAt as any))
                sData.updatedAt = (sData.updatedAt as any).toDate();
              services.push(sData);
            });
            setOrgServices(services);
          },
          (err: any) => console.error('Error listening to services:', err),
        );
    } else {
      setCurrentOrg(null);
      setOrgUsers([]);
      setOrgServices([]);
    }

    return () => {
      if (orgUnsubscribe) orgUnsubscribe();
      if (usersUnsubscribe) usersUnsubscribe();
      if (servicesUnsubscribe) servicesUnsubscribe();
    };
  }, [user?.orgId]);

  // ============================================================================
  // CREATE ORGANIZATION
  // ============================================================================

  const createOrg = useCallback(
    async (payload: CreateOrganizationPayload) => {
      if (!user) {
        throw new Error('Must be logged in to create organization');
      }

      setLoading(true);
      setError(null);

      try {
        const inviteCode = generateInviteCode();
        // Check uniqueness of invite code? (Skip for now, low collision probability for 6 chars small scale)

        const newOrgRef = firestore().collection('organizations').doc();

        // Build org object with only defined values
        const newOrg: Organization = {
          id: newOrgRef.id,
          name: payload.name,
          ownerId: user.id,
          timezone: payload.timezone,
          currency: payload.currency,
          defaultCommissionMode: payload.defaultCommissionMode,
          inviteCode: inviteCode,
          createdAt: new Date(), // Firestore converts Date to Timestamp
          updatedAt: new Date(),
        };

        // Only add optional fields if they're defined
        if (payload.defaultCommissionValue !== undefined) {
          newOrg.defaultCommissionValue = payload.defaultCommissionValue;
        }
        if (payload.phone !== undefined) {
          newOrg.phone = payload.phone;
        }
        if (payload.address !== undefined) {
          newOrg.address = payload.address;
        }

        console.log('📝 Creating organization:', {
          id: newOrgRef.id,
          name: newOrg.name,
          inviteCode: newOrg.inviteCode,
          type: typeof newOrg.inviteCode,
        });

        const batch = firestore().batch();

        // 1. Create Org
        batch.set(newOrgRef, newOrg);

        // 2. Update User
        const userRef = firestore().collection('users').doc(user.id);
        batch.update(userRef, {orgId: newOrgRef.id, role: UserRole.OWNER});

        await batch.commit();

        console.log(
          '✅ Organization created and saved to Firestore:',
          newOrg.name,
          'InviteCode:',
          newOrg.inviteCode,
        );

        // Update local user state via AuthContext to trigger useEffect
        await updateUser({orgId: newOrgRef.id, role: UserRole.OWNER});

        console.log('✅ Organization created:', newOrg.name);
      } catch (err: any) {
        const errorMessage = err.message || ERROR_MESSAGES.somethingWentWrong;
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [user, updateUser],
  );

  // ============================================================================
  // JOIN ORGANIZATION
  // ============================================================================

  const joinOrg = useCallback(
    async (inviteCode: string) => {
      if (!user) {
        throw new Error('Must be logged in to join organization');
      }

      setLoading(true);
      setError(null);

      try {
        // Find org by invite code
        console.log('🔍 Searching for inviteCode:', inviteCode.toUpperCase());

        const querySnapshot = await firestore()
          .collection('organizations')
          .where('inviteCode', '==', inviteCode.toUpperCase())
          .limit(1)
          .get();

        console.log(
          '📊 Query result - empty:',
          querySnapshot.empty,
          'docs count:',
          querySnapshot.docs.length,
        );

        if (querySnapshot.empty) {
          // Debug: fetch all organizations to see what exists
          console.log('⚠️ No organization found with inviteCode:', inviteCode.toUpperCase());
          const allOrgsSnapshot = await firestore().collection('organizations').limit(10).get();
          console.log('📋 All organizations in database:');
          allOrgsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            console.log(
              `  - ID: ${doc.id}, Name: ${data.name}, InviteCode: ${data.inviteCode}, Type: ${typeof data.inviteCode}`,
            );
          });
          throw new Error(ERROR_MESSAGES.invalidInviteCode);
        }

        const orgDoc = querySnapshot.docs[0];
        const orgId = orgDoc.id;
        const orgData = orgDoc.data() as Organization;
        console.log('✅ Found organization:', orgData.name, 'with inviteCode:', orgData.inviteCode);

        // Check if already in org
        if (user.orgId) {
          throw new Error(ERROR_MESSAGES.alreadyInOrg);
        }

        // Add user to org (Update User Doc)
        await firestore().collection('users').doc(user.id).update({
          orgId: orgId,
          role: UserRole.EMPLOYEE, // Default role when joining
        });

        // Update local user state
        await updateUser({orgId: orgId, role: UserRole.EMPLOYEE});

        console.log('✅ Joined organization:', orgData.name);
      } catch (err: any) {
        const errorMessage = err.message || ERROR_MESSAGES.somethingWentWrong;
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [user, updateUser],
  );

  // ============================================================================
  // UPDATE ORGANIZATION
  // ============================================================================

  const updateOrg = useCallback(
    async (data: Partial<Organization>) => {
      if (!currentOrg) {
        throw new Error(ERROR_MESSAGES.orgNotFound);
      }

      setLoading(true);
      setError(null);

      try {
        const updatedData = {
          ...data,
          updatedAt: new Date(),
        };

        await firestore().collection('organizations').doc(currentOrg.id).update(updatedData);
        // Listener updates state
        console.log('✅ Organization updated:', currentOrg.id);
      } catch (err: any) {
        const errorMessage = err.message || ERROR_MESSAGES.somethingWentWrong;
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [currentOrg],
  );

  // ============================================================================
  // FETCH ORG DATA (Refresh)
  // ============================================================================

  const fetchOrgData = useCallback(async () => {
    // With real-time listeners, manual fetch is less needed but can be used to re-trigger or check connectivity
    console.log('Refreshing org data...');
    // No-op effectively as listeners handle sync
  }, []);

  // ============================================================================
  // SERVICE MANAGEMENT
  // ============================================================================

  const addService = useCallback(
    async (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> => {
      if (!currentOrg) {
        throw new Error(ERROR_MESSAGES.orgNotFound);
      }

      setLoading(true);
      setError(null);

      try {
        const newServiceRef = firestore().collection('services').doc();
        
        // Clean up the data to remove undefined values (Firestore doesn't support undefined)
        const cleanedData = Object.fromEntries(
          Object.entries(serviceData).filter(([_, value]) => value !== undefined)
        ) as any;
        
        const newService: Service = {
          ...cleanedData,
          id: newServiceRef.id,
          orgId: currentOrg.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await newServiceRef.set(newService);
        // Listener upates state

        console.log('✅ Service added:', newService.name);
        return newService;
      } catch (err: any) {
        const errorMessage = err.message || ERROR_MESSAGES.somethingWentWrong;
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [currentOrg],
  );

  const updateService = useCallback(async (id: string, data: Partial<Service>) => {
    setLoading(true);
    setError(null);

    try {
      const updatedData = {
        ...data,
        updatedAt: new Date(),
      };
      await firestore().collection('services').doc(id).update(updatedData);
      console.log('✅ Service updated:', id);
    } catch (err: any) {
      const errorMessage = err.message || ERROR_MESSAGES.somethingWentWrong;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteService = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await firestore().collection('services').doc(id).delete();
      console.log('✅ Service deleted:', id);
    } catch (err: any) {
      const errorMessage = err.message || ERROR_MESSAGES.somethingWentWrong;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // USER MANAGEMENT (IN ORG)
  // ============================================================================

  const addUser = useCallback(
    async (_userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'orgId'>): Promise<User> => {
      // This functionality is weird with Auth. Usually invite based.
      // If adding a "shadow" user or pre-creating?
      // For now implementation assumes full Firebase Auth users.
      throw new Error('Direct user creation not supported with Firebase Auth. Use Invite.');
    },
    [],
  );

  const updateUserInOrg = useCallback(async (id: string, data: Partial<User>) => {
    setLoading(true);
    setError(null);

    try {
      const updatedData = {
        ...data,
        updatedAt: new Date(),
      };
      await firestore().collection('users').doc(id).update(updatedData);
      console.log('✅ User updated in org:', id);
    } catch (err: any) {
      const errorMessage = err.message || ERROR_MESSAGES.somethingWentWrong;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      // Remove from org (don't delete user auth generally, just unset orgId)
      await firestore().collection('users').doc(id).update({
        orgId: '',
        role: null, // or whatever default
      });

      console.log('✅ User removed from org');
    } catch (err: any) {
      const errorMessage = err.message || ERROR_MESSAGES.somethingWentWrong;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const clearError = useCallback(() => setError(null), []);

  const value: OrgContextValue = {
    currentOrg,
    orgUsers,
    orgServices,
    loading,
    error,
    createOrg,
    joinOrg,
    updateOrg,
    fetchOrgData,
    addService,
    updateService,
    deleteService,
    addUser,
    updateUserInOrg,
    deleteUser,
    clearError,
  };

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
};

export const useOrg = (): OrgContextValue => {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error('useOrg must be used within OrgProvider');
  }
  return context;
};

export default OrgContext;
