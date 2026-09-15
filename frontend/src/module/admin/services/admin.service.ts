import apiClient from '../../../core/api/client';
import type { FemaleApproval } from '../types/admin.types';

export const getPendingFemales = async (status = 'pending', page = 1, limit = 20): Promise<{ users: FemaleApproval[], total: number, stats: any }> => {
    const response = await apiClient.get('/admin/females/pending', {
        params: { status, page, limit }
    });

    // Transform backend user format to FemaleApproval format
    const users = response.data.data.users.map((u: any) => ({
        userId: u._id,
        user: {
            id: u._id,
            phoneNumber: u.phoneNumber,
            name: u.profile.name,
            role: u.role,
            isBlocked: u.isBlocked,
            isVerified: u.isVerified,
            createdAt: u.createdAt,
            lastLoginAt: u.lastSeen
        },
        profile: {
            age: u.profile.age,
            city: u.profile.location?.city || '',
            bio: u.profile.bio || '',
            photos: u.profile.photos?.map((p: any) => p.url) || [],
            location: u.profile.location?.coordinates ? {
                lat: u.profile.location.coordinates[1],
                lng: u.profile.location.coordinates[0]
            } : undefined
        },
        verificationDocuments: u.verificationDocuments,
        approvalStatus: u.approvalStatus,
        submittedAt: u.createdAt
    }));

    return { users, total: response.data.data.total, stats: response.data.data.stats };
};

export const approveFemale = async (userId: string) => {
    const response = await apiClient.patch(`/admin/females/${userId}/approve`);
    return response.data;
};

export const rejectFemale = async (userId: string, reason: string) => {
    const response = await apiClient.patch(`/admin/females/${userId}/reject`, { reason });
    return response.data;
};

export const requestResubmit = async (userId: string, reason: string) => {
    const response = await apiClient.patch(`/admin/females/${userId}/request-resubmit`, { reason });
    return response.data;
};
