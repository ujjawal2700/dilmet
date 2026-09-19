/**
 * Update AI Companion Photos
 * @purpose: Replace DiceBear illustrated avatars with authentic real Indian girl photos.
 * Usage: node src/scripts/updateAiCompanionPhotos.js
 */

import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from '../models/User.js';
import { uploadImageToCloudinary } from '../services/upload/imageUploadService.js';

const COMPANION_REAL_PHOTOS = [
    {
        name: 'Ananya',
        sourceUrl: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=600&h=600&fit=crop&crop=faces',
    },
    {
        name: 'Priya',
        sourceUrl: 'https://images.unsplash.com/photo-1596215143922-eedeaba0d91c?w=600&h=600&fit=crop&crop=faces',
    },
    {
        name: 'Kavya',
        sourceUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=600&fit=crop&crop=faces',
    },
    {
        name: 'Sneha',
        sourceUrl: 'https://images.unsplash.com/photo-1614289371518-722f2615943d?w=600&h=600&fit=crop&crop=faces',
    },
    {
        name: 'Riya',
        sourceUrl: 'https://images.unsplash.com/photo-1621784563330-caee0b138a00?w=600&h=600&fit=crop&crop=faces',
    },
    {
        name: 'Meera',
        sourceUrl: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=600&h=600&fit=crop&crop=faces',
    },
    {
        name: 'Ishita',
        sourceUrl: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=600&h=600&fit=crop&crop=faces',
    },
    {
        name: 'Pooja',
        sourceUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&h=600&fit=crop&crop=faces',
    },
    {
        name: 'Tanvi',
        sourceUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=600&fit=crop&crop=faces',
    },
    {
        name: 'Nisha',
        sourceUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=600&fit=crop&crop=faces',
    },
];

async function updatePhotos() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    let updatedCount = 0;

    for (const item of COMPANION_REAL_PHOTOS) {
        try {
            console.log(`Processing photo for ${item.name}...`);
            const res = await fetch(item.sourceUrl);
            if (!res.ok) {
                console.error(`Failed to fetch photo for ${item.name}: ${res.status}`);
                continue;
            }
            const arrayBuffer = await res.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString('base64');
            const dataUrl = `data:image/jpeg;base64,${base64}`;

            const uploaded = await uploadImageToCloudinary(dataUrl, 'ai-companions');
            const newPhotoUrl = uploaded.url;
            console.log(`Uploaded ${item.name} photo to Cloudinary: ${newPhotoUrl}`);

            const updatedUser = await User.findOneAndUpdate(
                { isAiCompanion: true, isDeleted: false, 'profile.name': item.name },
                {
                    $set: {
                        'profile.photos': [
                            {
                                url: newPhotoUrl,
                                isPrimary: true,
                                uploadedAt: new Date(),
                            },
                        ],
                    },
                },
                { new: true }
            );

            if (updatedUser) {
                console.log(`✅ Successfully updated profile.photos for ${item.name}`);
                updatedCount++;
            } else {
                console.warn(`⚠️ User document not found for AI companion: ${item.name}`);
            }
        } catch (err) {
            console.error(`❌ Error updating photo for ${item.name}:`, err.message);
        }
    }

    console.log(`\n🎉 Finished updating photos! Total companions updated: ${updatedCount}/${COMPANION_REAL_PHOTOS.length}`);
    await mongoose.disconnect();
}

updatePhotos().catch(err => {
    console.error('Fatal error during photo update:', err);
    process.exit(1);
});

