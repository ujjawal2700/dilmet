// Auth and Onboarding Types

export interface SignupData {
  fullName: string;
  phone: string; // Without +91 prefix
}

export interface BasicProfileData {
  dateOfBirth: string; // ISO date string
  gender: 'male' | 'female' | 'prefer-not-to-say';
  location: string; // User location (City, Area) - Google Maps Integration Future
}

export interface InterestsData {
  interests: string[];
  bio: string;
  photos: File[]; // At least 1 required
}

export interface OnboardingData {
  signup: SignupData;
  basicProfile: BasicProfileData;
  interests: InterestsData;
}

export interface LoginData {
  phone: string; // Without +91 prefix
  // password? for later
}

