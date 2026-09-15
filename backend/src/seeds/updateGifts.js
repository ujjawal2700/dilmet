/**
 * Update Gift Images Script - Final Assets
 * @purpose: Update existing gift image URLs in the database to user-provided assets
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import Gift from '../models/Gift.js';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/toki';

const giftUpdates = [
    { name: 'Rose', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTX2X2b9R5sx_RhsX2VbHIQ7UcTPu5e9SpVKg&s' },
    { name: 'Diamond Ring', imageUrl: 'https://cdn.pixabay.com/photo/2021/03/24/13/24/ring-6120138_1280.png' },
    { name: 'Bouquet', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRV8XtmBcY7iDWHrRvq2HbnuRMXTufJOLLZqg&s' },
    { name: 'Thumbs Up', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvSSwzDVs8q2Rdgy5zAHe_d34cmq2FxfbrNQ&s' },
    { name: 'Laughing Emoji', imageUrl: 'https://static.vecteezy.com/system/resources/thumbnails/014/438/856/small/rolling-on-the-floor-laughing-large-size-of-yellow-emoji-smile-vector.jpg' },
];

async function updateGifts() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        console.log('\n🔄 Updating Gift Image URLs (Final Assets)...');

        for (const update of giftUpdates) {
            const result = await Gift.updateOne(
                { name: update.name },
                { $set: { imageUrl: update.imageUrl } }
            );
            if (result.matchedCount > 0) {
                console.log(`   ✅ Updated ${update.name}`);
            } else {
                console.log(`   ⚠️  Gift "${update.name}" not found`);
            }
        }

        console.log('\n🎉 Gift updates completed!\n');

    } catch (error) {
        console.error('❌ Update failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

updateGifts();
