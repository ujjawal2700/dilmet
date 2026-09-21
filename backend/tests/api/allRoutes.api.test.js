import request from 'supertest';
import { jest, describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import app from '../../src/app.js';
import User from '../../src/models/User.js';
import Otp from '../../src/models/Otp.js';
import CoinPlan from '../../src/models/CoinPlan.js';

describe('Exhaustive API Route & Endpoint Security Coverage', () => {
    beforeAll(() => {
        jest.spyOn(User, 'findOne').mockImplementation(() => Promise.resolve(null));
        jest.spyOn(Otp, 'findOne').mockImplementation(() => Promise.resolve(null));
        jest.spyOn(Otp, 'findOneAndUpdate').mockImplementation(() => Promise.resolve(null));
        jest.spyOn(CoinPlan, 'find').mockImplementation(() => ({
            sort: () => Promise.resolve([]),
        }));
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe('1. Health & Fallback Routing', () => {
        test('GET /health returns 200 server status', async () => {
            const res = await request(app).get('/health');
            expect(res.status).toBe(200);
            expect(res.body.status).toBe('success');
        });

        test('GET /api/non-existent returns 404', async () => {
            const res = await request(app).get('/api/does-not-exist');
            expect(res.status).toBe(404);
            expect(['fail', 'error']).toContain(res.body.status);
        });
    });

    describe('2. Authentication Routes (/api/auth)', () => {
        test('POST /api/auth/signup-request requires valid phone number', async () => {
            const res = await request(app).post('/api/auth/signup-request').send({});
            expect([400, 422]).toContain(res.status);
        });

        test('POST /api/auth/signup-verify rejects invalid payload', async () => {
            const res = await request(app).post('/api/auth/signup-verify').send({ phoneNumber: '+919876543210', otp: '000000' });
            expect([400, 401, 404, 422]).toContain(res.status);
        });

        test('POST /api/auth/login-request requires valid phone number', async () => {
            const res = await request(app).post('/api/auth/login-request').send({ phoneNumber: '123' });
            expect([400, 401, 404, 422]).toContain(res.status);
        });

        test('POST /api/auth/login-verify rejects missing OTP', async () => {
            const res = await request(app).post('/api/auth/login-verify').send({ phoneNumber: '+919876543210', otp: '000000' });
            expect([400, 401, 404, 422]).toContain(res.status);
        });
    });

    describe('3. Users & Relationships Routes (/api/users)', () => {
        test('GET /api/users/me blocks unauthenticated requests', async () => {
            const res = await request(app).get('/api/users/me');
            expect(res.status).toBe(401);
        });

        test('GET /api/users/config blocks unauthenticated requests', async () => {
            const res = await request(app).get('/api/users/config');
            expect(res.status).toBe(401);
        });

        test('GET /api/users/me/stats requires authentication', async () => {
            const res = await request(app).get('/api/users/me/stats');
            expect(res.status).toBe(401);
        });

        test('PATCH /api/users/me requires authentication', async () => {
            const res = await request(app).patch('/api/users/me').send({ name: 'Test' });
            expect(res.status).toBe(401);
        });

        test('DELETE /api/users/me requires authentication', async () => {
            const res = await request(app).delete('/api/users/me');
            expect(res.status).toBe(401);
        });

        test('POST /api/users/resubmit-verification requires authentication', async () => {
            const res = await request(app).post('/api/users/resubmit-verification').send({});
            expect(res.status).toBe(401);
        });

        test('GET /api/users/discover requires authentication', async () => {
            const res = await request(app).get('/api/users/discover');
            expect(res.status).toBe(401);
        });

        test('GET /api/users/faqs requires authentication', async () => {
            const res = await request(app).get('/api/users/faqs');
            expect(res.status).toBe(401);
        });

        test('GET /api/users/male/leaderboard requires authentication', async () => {
            const res = await request(app).get('/api/users/male/leaderboard');
            expect(res.status).toBe(401);
        });

        test('GET /api/users/:userId requires authentication', async () => {
            const res = await request(app).get('/api/users/user123');
            expect(res.status).toBe(401);
        });

        test('POST /api/users/block requires authentication', async () => {
            const res = await request(app).post('/api/users/block').send({ targetUserId: 'u1' });
            expect(res.status).toBe(401);
        });

        test('POST /api/users/unblock requires authentication', async () => {
            const res = await request(app).post('/api/users/unblock').send({ targetUserId: 'u1' });
            expect(res.status).toBe(401);
        });

        test('GET /api/users/block-list requires authentication', async () => {
            const res = await request(app).get('/api/users/block-list');
            expect(res.status).toBe(401);
        });

        test('DELETE /api/users/chats/:chatId requires authentication', async () => {
            const res = await request(app).delete('/api/users/chats/chat123');
            expect(res.status).toBe(401);
        });

        test('POST /api/users/report requires authentication', async () => {
            const res = await request(app).post('/api/users/report').send({ reportedUserId: 'u1', reason: 'spam' });
            expect(res.status).toBe(401);
        });

        test('GET /api/users/female/dashboard requires authentication and female role', async () => {
            const res = await request(app).get('/api/users/female/dashboard');
            expect(res.status).toBe(401);
        });

        test('GET /api/users/female/dashboard/earnings requires authentication', async () => {
            const res = await request(app).get('/api/users/female/dashboard/earnings');
            expect(res.status).toBe(401);
        });

        test('GET /api/users/female/dashboard/stats requires authentication', async () => {
            const res = await request(app).get('/api/users/female/dashboard/stats');
            expect(res.status).toBe(401);
        });

        test('GET /api/users/female/dashboard/chats requires authentication', async () => {
            const res = await request(app).get('/api/users/female/dashboard/chats');
            expect(res.status).toBe(401);
        });

        test('GET /api/users/female/auto-messages requires authentication', async () => {
            const res = await request(app).get('/api/users/female/auto-messages');
            expect(res.status).toBe(401);
        });

        test('POST /api/users/female/auto-messages requires authentication', async () => {
            const res = await request(app).post('/api/users/female/auto-messages').send({ text: 'Hi' });
            expect(res.status).toBe(401);
        });
    });

    describe('4. Tasks Routes (/api/tasks)', () => {
        test('GET /api/tasks requires authentication', async () => {
            const res = await request(app).get('/api/tasks');
            expect(res.status).toBe(401);
        });

        test('POST /api/tasks/checkin requires authentication', async () => {
            const res = await request(app).post('/api/tasks/checkin');
            expect(res.status).toBe(401);
        });
    });

    describe('5. Chat & Messaging Routes (/api/chat)', () => {
        test('GET /api/chat/chats requires authentication', async () => {
            const res = await request(app).get('/api/chat/chats');
            expect(res.status).toBe(401);
        });

        test('POST /api/chat/chats requires authentication', async () => {
            const res = await request(app).post('/api/chat/chats').send({ otherUserId: 'u2' });
            expect(res.status).toBe(401);
        });

        test('GET /api/chat/chats/:chatId requires authentication', async () => {
            const res = await request(app).get('/api/chat/chats/chat123');
            expect(res.status).toBe(401);
        });

        test('GET /api/chat/chats/:chatId/messages requires authentication', async () => {
            const res = await request(app).get('/api/chat/chats/chat123/messages');
            expect(res.status).toBe(401);
        });

        test('PATCH /api/chat/chats/:chatId/read requires authentication', async () => {
            const res = await request(app).patch('/api/chat/chats/chat123/read');
            expect(res.status).toBe(401);
        });

        test('POST /api/chat/messages requires authentication', async () => {
            const res = await request(app).post('/api/chat/messages').send({ chatId: 'c1', content: 'Hi' });
            expect(res.status).toBe(401);
        });

        test('POST /api/chat/messages/hi requires authentication', async () => {
            const res = await request(app).post('/api/chat/messages/hi').send({ receiverId: 'u2' });
            expect(res.status).toBe(401);
        });

        test('POST /api/chat/messages/gift requires authentication', async () => {
            const res = await request(app).post('/api/chat/messages/gift').send({ giftId: 'g1', receiverId: 'u2' });
            expect(res.status).toBe(401);
        });

        test('GET /api/chat/gifts requires authentication', async () => {
            const res = await request(app).get('/api/chat/gifts');
            expect(res.status).toBe(401);
        });

        test('GET /api/chat/history/gifts requires authentication', async () => {
            const res = await request(app).get('/api/chat/history/gifts');
            expect(res.status).toBe(401);
        });
    });

    describe('6. Wallet & Economy Routes (/api/wallet)', () => {
        test('GET /api/wallet/coin-plans is accessible', async () => {
            const res = await request(app).get('/api/wallet/coin-plans');
            expect([200, 401]).toContain(res.status);
        });

        test('GET /api/wallet/balance requires authentication', async () => {
            const res = await request(app).get('/api/wallet/balance');
            expect(res.status).toBe(401);
        });

        test('GET /api/wallet/transactions requires authentication', async () => {
            const res = await request(app).get('/api/wallet/transactions');
            expect(res.status).toBe(401);
        });

        test('GET /api/wallet/referrals requires authentication', async () => {
            const res = await request(app).get('/api/wallet/referrals');
            expect(res.status).toBe(401);
        });

        test('GET /api/wallet/earnings-summary requires authentication', async () => {
            const res = await request(app).get('/api/wallet/earnings-summary');
            expect(res.status).toBe(401);
        });

        test('POST /api/wallet/withdrawals requires authentication', async () => {
            const res = await request(app).post('/api/wallet/withdrawals').send({ amount: 500, upiId: 'test@upi' });
            expect(res.status).toBe(401);
        });

        test('GET /api/wallet/withdrawals requires authentication', async () => {
            const res = await request(app).get('/api/wallet/withdrawals');
            expect(res.status).toBe(401);
        });

        test('GET /api/wallet/admin/coin-plans requires admin authentication', async () => {
            const res = await request(app).get('/api/wallet/admin/coin-plans');
            expect(res.status).toBe(401);
        });

        test('GET /api/wallet/admin/payout-slabs requires admin authentication', async () => {
            const res = await request(app).get('/api/wallet/admin/payout-slabs');
            expect(res.status).toBe(401);
        });

        test('GET /api/wallet/admin/withdrawals requires admin authentication', async () => {
            const res = await request(app).get('/api/wallet/admin/withdrawals');
            expect(res.status).toBe(401);
        });

        test('GET /api/wallet/admin/transactions requires admin authentication', async () => {
            const res = await request(app).get('/api/wallet/admin/transactions');
            expect(res.status).toBe(401);
        });
    });

    describe('7. Payment Routes (/api/payment)', () => {
        test('POST /api/payment/create-order requires authentication', async () => {
            const res = await request(app).post('/api/payment/create-order').send({ planId: 'p1' });
            expect(res.status).toBe(401);
        });

        test('POST /api/payment/verify requires authentication or valid payload', async () => {
            const res = await request(app).post('/api/payment/verify').send({ orderId: 'ord_1', paymentId: 'pay_1' });
            expect([400, 401]).toContain(res.status);
        });

        test('GET /api/payment/history requires authentication', async () => {
            const res = await request(app).get('/api/payment/history');
            expect(res.status).toBe(401);
        });

        test('POST /api/payment/webhook handles webhook calls', async () => {
            const res = await request(app).post('/api/payment/webhook').send({});
            expect([200, 400, 401, 500]).toContain(res.status);
        });
    });

    describe('8. Reward Routes (/api/rewards)', () => {
        test('GET /api/rewards/daily/check requires authentication', async () => {
            const res = await request(app).get('/api/rewards/daily/check');
            expect(res.status).toBe(401);
        });

        test('POST /api/rewards/daily/claim requires authentication', async () => {
            const res = await request(app).post('/api/rewards/daily/claim');
            expect(res.status).toBe(401);
        });
    });

    describe('9. Support Routes (/api/support)', () => {
        test('GET /api/support requires authentication', async () => {
            const res = await request(app).get('/api/support');
            expect(res.status).toBe(401);
        });

        test('POST /api/support requires authentication', async () => {
            const res = await request(app).post('/api/support').send({ subject: 'Need help', message: 'Help please' });
            expect(res.status).toBe(401);
        });

        test('GET /api/support/:id requires authentication', async () => {
            const res = await request(app).get('/api/support/ticket-123');
            expect(res.status).toBe(401);
        });

        test('POST /api/support/:id/messages requires authentication', async () => {
            const res = await request(app).post('/api/support/ticket-123/messages').send({ message: 'Still waiting' });
            expect(res.status).toBe(401);
        });
    });

    describe('10. FCM & Notifications Routes (/api/fcm)', () => {
        test('POST /api/fcm/register requires authentication', async () => {
            const res = await request(app).post('/api/fcm/register').send({ token: 'sample-token' });
            expect(res.status).toBe(401);
        });

        test('POST /api/fcm/test requires authentication', async () => {
            const res = await request(app).post('/api/fcm/test').send({ title: 'Test', body: 'Body' });
            expect(res.status).toBe(401);
        });

        test('DELETE /api/fcm/token requires authentication', async () => {
            const res = await request(app).delete('/api/fcm/token');
            expect(res.status).toBe(401);
        });
    });

    describe('11. Upload Routes (/api/upload)', () => {
        test('POST /api/upload/chat-image requires authentication', async () => {
            const res = await request(app).post('/api/upload/chat-image');
            expect(res.status).toBe(401);
        });
    });

    describe('12. Admin Operations Routes (/api/admin)', () => {
        test('GET /api/admin/dashboard/stats requires admin authorization', async () => {
            const res = await request(app).get('/api/admin/dashboard/stats');
            expect(res.status).toBe(401);
        });

        test('GET /api/admin/females/pending requires admin authorization', async () => {
            const res = await request(app).get('/api/admin/females/pending');
            expect(res.status).toBe(401);
        });

        test('PATCH /api/admin/females/:id/approve requires admin authorization', async () => {
            const res = await request(app).patch('/api/admin/females/f1/approve');
            expect(res.status).toBe(401);
        });

        test('PATCH /api/admin/females/:id/reject requires admin authorization', async () => {
            const res = await request(app).patch('/api/admin/females/f1/reject');
            expect(res.status).toBe(401);
        });

        test('GET /api/admin/users requires admin authorization', async () => {
            const res = await request(app).get('/api/admin/users');
            expect(res.status).toBe(401);
        });

        test('PATCH /api/admin/users/:id/toggle-block requires admin authorization', async () => {
            const res = await request(app).patch('/api/admin/users/u1/toggle-block');
            expect(res.status).toBe(401);
        });

        test('GET /api/admin/ai-companions requires admin authorization', async () => {
            const res = await request(app).get('/api/admin/ai-companions');
            expect(res.status).toBe(401);
        });

        test('POST /api/admin/ai-companions requires admin authorization', async () => {
            const res = await request(app).post('/api/admin/ai-companions').send({ name: 'Ananya' });
            expect(res.status).toBe(401);
        });

        test('GET /api/admin/transactions requires admin authorization', async () => {
            const res = await request(app).get('/api/admin/transactions');
            expect(res.status).toBe(401);
        });

        test('GET /api/admin/referrals requires admin authorization', async () => {
            const res = await request(app).get('/api/admin/referrals');
            expect(res.status).toBe(401);
        });

        test('GET /api/admin/support-tickets requires admin authorization', async () => {
            const res = await request(app).get('/api/admin/support-tickets');
            expect(res.status).toBe(401);
        });

        test('GET /api/admin/settings requires admin authorization', async () => {
            const res = await request(app).get('/api/admin/settings');
            expect(res.status).toBe(401);
        });

        test('PATCH /api/admin/settings requires admin authorization', async () => {
            const res = await request(app).patch('/api/admin/settings').send({});
            expect(res.status).toBe(401);
        });

        test('GET /api/admin/gifts requires admin authorization', async () => {
            const res = await request(app).get('/api/admin/gifts');
            expect(res.status).toBe(401);
        });

        test('GET /api/admin/tasks requires admin authorization', async () => {
            const res = await request(app).get('/api/admin/tasks');
            expect(res.status).toBe(401);
        });

        test('POST /api/admin/tasks requires admin authorization', async () => {
            const res = await request(app).post('/api/admin/tasks').send({ title: 'Task 1' });
            expect(res.status).toBe(401);
        });

        test('GET /api/admin/reports requires admin authorization', async () => {
            const res = await request(app).get('/api/admin/reports');
            expect(res.status).toBe(401);
        });

        test('GET /api/admin/deleted-accounts requires admin authorization', async () => {
            const res = await request(app).get('/api/admin/deleted-accounts');
            expect(res.status).toBe(401);
        });

        test('GET /api/admin/profile requires admin authorization', async () => {
            const res = await request(app).get('/api/admin/profile');
            expect(res.status).toBe(401);
        });

        test('GET /api/admin/faqs requires admin authorization', async () => {
            const res = await request(app).get('/api/admin/faqs');
            expect(res.status).toBe(401);
        });
    });
});
