import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import User from '../src/models/User.js';
import AppSettings from '../src/models/AppSettings.js';

const ADMINS_TO_SEED = [
    {
        phoneNumber: '911111111111',
        name: 'Dil Mate Admin',
        role: 'admin',
        gender: 'male',
        isVerified: true,
        isActive: true,
        isBlocked: false,
    },
    {
        phoneNumber: '919981331303',
        name: 'Ujjawal (Admin)',
        role: 'admin',
        gender: 'male',
        isVerified: true,
        isActive: true,
        isBlocked: false,
    },
    {
        phoneNumber: '919999999999',
        name: 'Super Admin',
        role: 'admin',
        gender: 'male',
        isVerified: true,
        isActive: true,
        isBlocked: false,
    }
];

async function run() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            console.error('MONGODB_URI not found in environment!');
            process.exit(1);
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log(`Connected successfully to database: "${mongoose.connection.name}" on host: "${mongoose.connection.host}"`);

        // 1. Seed/Update AppSettings
        console.log('\n--- Checking AppSettings ---');
        let settings = await AppSettings.findOne();
        if (!settings) {
            settings = await AppSettings.create({
                adminSecret: '123456',
                adminPhones: ADMINS_TO_SEED.map(a => a.phoneNumber)
            });
            console.log('Created default AppSettings with adminSecret: 123456');
        } else {
            settings.adminSecret = '123456';
            const existingPhones = new Set(settings.adminPhones || []);
            ADMINS_TO_SEED.forEach(a => existingPhones.add(a.phoneNumber));
            settings.adminPhones = Array.from(existingPhones);
            await settings.save();
            console.log('Updated AppSettings. adminPhones:', settings.adminPhones, 'adminSecret:', settings.adminSecret);
        }

        // 2. Seed / Update Admin Users
        console.log('\n--- Seeding Admin Users ---');
        for (const adminData of ADMINS_TO_SEED) {
            let user = await User.findOne({ phoneNumber: adminData.phoneNumber });
            if (user) {
                user.role = 'admin';
                user.isVerified = true;
                user.isActive = true;
                user.isBlocked = false;
                user.isDeleted = false;
                if (!user.profile) user.profile = {};
                user.profile.name = adminData.name;
                await user.save();
                console.log(`✅ Updated existing user to admin: ${adminData.phoneNumber} (${adminData.name})`);
            } else {
                user = await User.create({
                    phoneNumber: adminData.phoneNumber,
                    role: 'admin',
                    gender: adminData.gender,
                    isVerified: true,
                    isActive: true,
                    isBlocked: false,
                    isDeleted: false,
                    profile: {
                        name: adminData.name,
                        age: 30,
                        bio: 'System Administrator'
                    }
                });
                console.log(`✅ Created new admin user: ${adminData.phoneNumber} (${adminData.name})`);
            }
        }

        // 3. Verify All Admins in DB
        console.log('\n--- Current Admins in Database ---');
        const admins = await User.find({ role: 'admin' }, 'phoneNumber role profile.name isVerified isActive isBlocked');
        console.table(admins.map(a => ({
            id: a._id.toString(),
            phoneNumber: a.phoneNumber,
            name: a.profile?.name,
            role: a.role,
            isVerified: a.isVerified,
            isActive: a.isActive
        })));

        console.log('\n🎉 Admin seeding complete successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding admins:', err);
        process.exit(1);
    }
}

run();

