// controllers/clients/get-all.controller.ts
import { prisma } from "@/utils/prisma";

// Define comprehensive types
interface BusinessAccount {
  type: string;
  balance: number;
  currency: string;
}

interface BusinessUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: {
    name: string;
  };
  lastLogin: string | null;
  isActive: boolean;
}

interface BusinessCount {
  users: number;
  smsMessages: number;
  otpMessages: number;
  apiKeys: number;
  webhooks: number;
  senderIds: number;
  templates: number;
  contactGroups: number;
}

interface PrismaBusiness {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  address: string | null;
  businessType: string | null;
  businessSector: string | null;
  description: string | null;
  website: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  users: BusinessUser[];
  accounts: BusinessAccount[];
  _count: BusinessCount;
}

export const getAll = async ({ query, set }: any) => {
  try {
    const { 
      search, 
      status = "all", 
      page = 1, 
      limit = 10 
    } = query;
    
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Status filter - only isActive since there's no status field
    if (status !== 'all') {
      if (status === 'active') {
        where.isActive = true;
      } else if (status === 'inactive') {
        where.isActive = false;
      }
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get businesses with related data
    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        include: {
          users: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: {
                select: {
                  name: true
                }
              },
              lastLogin: true,
              isActive: true
            },
            take: 1
          },
          accounts: {
            select: {
              type: true,
              balance: true,
              currency: true
            }
          },
          _count: {
            select: {
              users: true,
              smsMessages: true,
              otpMessages: true,
              apiKeys: true,
              webhooks: true,
              senderIds: true,
              templates: true,
              contactGroups: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.business.count({ where })
    ]);

    // Format response with proper typing
    const formattedClients = (businesses as PrismaBusiness[]).map((business: PrismaBusiness) => {
      const walletAccount = business.accounts.find((acc: BusinessAccount) => acc.type === 'WALLET');
      const smsAccount = business.accounts.find((acc: BusinessAccount) => acc.type === 'SMS');
      
      const status = business.isActive ? 'active' : 'inactive';
      
      return {
        id: business.id,
        name: business.name,
        email: business.email,
        phone: business.phone,
        address: business.address,
        businessType: business.businessType,
        businessSector: business.businessSector,
        description: business.description,
        website: business.website,
        isActive: business.isActive,
        status: status,
        createdAt: business.createdAt,
        updatedAt: business.updatedAt,
        lastActive: business.users[0]?.lastLogin || business.updatedAt,
        primaryUser: business.users[0] ? {
          firstName: business.users[0].firstName,
          lastName: business.users[0].lastName,
          email: business.users[0].email,
          role: business.users[0].role.name,
          lastLogin: business.users[0].lastLogin,
          isActive: business.users[0].isActive
        } : null,
        walletBalance: walletAccount?.balance || 0,
        smsBalance: smsAccount?.balance || 0,
        stats: {
          users: business._count.users,
          smsMessages: business._count.smsMessages,
          otpMessages: business._count.otpMessages,
          apiKeys: business._count.apiKeys,
          webhooks: business._count.webhooks,
          senderIds: business._count.senderIds,
          templates: business._count.templates,
          contactGroups: business._count.contactGroups
        }
      };
    });

    set.status = 200;
    return {
      success: true,
      data: formattedClients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error: any) {
    console.error("Get Clients Error:", error);
    set.status = 500;
    return { 
      success: false, 
      message: "Failed to fetch clients",
      error: error.message 
    };
  }
};