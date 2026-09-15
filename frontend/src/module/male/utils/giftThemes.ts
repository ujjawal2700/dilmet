import type { Gift } from '../types/male.types';

export interface GiftTheme {
  primary: string; // Main color
  secondary: string; // Secondary/light color
  dark: string; // Dark mode variant
  iconColor: string; // Icon color
}

export const getGiftTheme = (gift: Gift): GiftTheme => {
  const name = (gift?.name || '').toLowerCase();
  const category = (gift?.category || '').toLowerCase();

  // Category Based Themes
  if (category === 'romantic') {
    return {
      primary: 'from-pink-500 to-pink-600',
      secondary: 'from-pink-400 to-pink-500',
      dark: 'from-pink-600 to-pink-700',
      iconColor: 'text-pink-500 dark:text-pink-400',
    };
  }

  if (category === 'funny' || category === 'fun') {
    return {
      primary: 'from-amber-400 to-orange-500',
      secondary: 'from-amber-300 to-orange-400',
      dark: 'from-amber-500 to-orange-600',
      iconColor: 'text-amber-500 dark:text-amber-400',
    };
  }

  if (category === 'celebration' || category === 'party') {
    return {
      primary: 'from-purple-500 to-indigo-600',
      secondary: 'from-purple-400 to-indigo-500',
      dark: 'from-purple-600 to-indigo-700',
      iconColor: 'text-purple-500 dark:text-purple-400',
    };
  }

  if (category === 'special' || category === 'luxury') {
    return {
      primary: 'from-yellow-500 to-amber-600',
      secondary: 'from-yellow-400 to-amber-500',
      dark: 'from-yellow-600 to-amber-700',
      iconColor: 'text-yellow-500 dark:text-yellow-400',
    };
  }

  // Name Based Themes (Fallback)
  if (name.includes('rose')) {
    return {
      primary: 'from-pink-500 to-pink-600',
      secondary: 'from-pink-400 to-pink-500',
      dark: 'from-pink-600 to-pink-700',
      iconColor: 'text-pink-500 dark:text-pink-400',
    };
  }

  // Chocolate - Brown/Chocolate
  if (name.includes('chocolate')) {
    return {
      primary: 'from-amber-700 to-amber-800',
      secondary: 'from-amber-600 to-amber-700',
      dark: 'from-amber-800 to-amber-900',
      iconColor: 'text-amber-700 dark:text-amber-500',
    };
  }

  // Diamond - Blue/Cyan
  if (name.includes('diamond')) {
    return {
      primary: 'from-cyan-400 to-blue-500',
      secondary: 'from-cyan-300 to-blue-400',
      dark: 'from-cyan-500 to-blue-600',
      iconColor: 'text-cyan-400 dark:text-cyan-300',
    };
  }

  // Heart - Red/Pink
  if (name.includes('heart')) {
    return {
      primary: 'from-red-500 to-pink-500',
      secondary: 'from-red-400 to-pink-400',
      dark: 'from-red-600 to-pink-600',
      iconColor: 'text-red-500 dark:text-red-400',
    };
  }

  // Star - Yellow/Gold
  if (name.includes('star')) {
    return {
      primary: 'from-yellow-400 to-yellow-500',
      secondary: 'from-yellow-300 to-yellow-400',
      dark: 'from-yellow-500 to-yellow-600',
      iconColor: 'text-yellow-400 dark:text-yellow-300',
    };
  }

  // Crown - Gold/Yellow
  if (name.includes('crown')) {
    return {
      primary: 'from-yellow-500 to-amber-500',
      secondary: 'from-yellow-400 to-amber-400',
      dark: 'from-yellow-600 to-amber-600',
      iconColor: 'text-yellow-500 dark:text-yellow-400',
    };
  }

  // Balloon - Colorful/Rainbow
  if (name.includes('balloon')) {
    return {
      primary: 'from-purple-400 via-pink-400 to-red-400',
      secondary: 'from-purple-300 via-pink-300 to-red-300',
      dark: 'from-purple-500 via-pink-500 to-red-500',
      iconColor: 'text-purple-500 dark:text-purple-400',
    };
  }

  // Ring - Silver/Gray
  if (name.includes('ring')) {
    return {
      primary: 'from-gray-400 to-gray-500',
      secondary: 'from-gray-300 to-gray-400',
      dark: 'from-gray-500 to-gray-600',
      iconColor: 'text-gray-400 dark:text-gray-300',
    };
  }

  // Default - Pink (for unknown gifts)
  return {
    primary: 'from-pink-500 to-pink-600',
    secondary: 'from-pink-400 to-pink-500',
    dark: 'from-pink-600 to-pink-700',
    iconColor: 'text-pink-500 dark:text-pink-400',
  };
};

export const getGiftImage = (giftName: string): string => {
  // CDN URLs for gift images
  const name = (giftName || '').toLowerCase();

  if (name.includes('bouquet')) return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRV8XtmBcY7iDWHrRvq2HbnuRMXTufJOLLZqg&s';
  if (name.includes('thumbs')) return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvSSwzDVs8q2Rdgy5zAHe_d34cmq2FxfbrNQ&s';
  if (name.includes('laugh')) return 'https://static.vecteezy.com/system/resources/thumbnails/014/438/856/small/rolling-on-the-floor-laughing-large-size-of-yellow-emoji-smile-vector.jpg';
  if (name.includes('rose')) return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTX2X2b9R5sx_RhsX2VbHIQ7UcTPu5e9SpVKg&s';
  if (name.includes('heart')) return 'https://cdn-icons-png.flaticon.com/512/833/833472.png';
  if (name.includes('teddy')) return 'https://cdn-icons-png.flaticon.com/512/3069/3069172.png';
  if (name.includes('cake')) return 'https://cdn-icons-png.flaticon.com/512/3132/3132693.png';
  if (name.includes('ring')) return 'https://cdn.pixabay.com/photo/2021/03/24/13/24/ring-6120138_1280.png';
  if (name.includes('diamond')) return 'https://cdn.pixabay.com/photo/2021/03/24/13/24/ring-6120138_1280.png';
  if (name.includes('flower')) return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRV8XtmBcY7iDWHrRvq2HbnuRMXTufJOLLZqg&s';

  // Default
  return 'https://cdn-icons-png.flaticon.com/512/2143/2143150.png';
};
