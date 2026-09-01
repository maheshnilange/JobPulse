import { UserProfile } from '../types';

const USER_PROFILE_KEY = 'jobpulse_user_profile_v1';

export const defaultUserProfile: UserProfile = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  degree: '',
  branch: '',
  graduationYear: 2026,
  cgpa: '',
  skills: [],
  experience: 'Fresher (0–1 Year)',
  resumeFileName: '',
  resumeFileSize: '',
  resumeUploadedAt: '',
  resumeDataUrl: '',
  githubUrl: '',
  linkedinUrl: '',
  portfolioUrl: '',
  coverNote: '',
  instantOneClickApply: false
};

export const sampleFresherTemplate: UserProfile = {
  fullName: 'Candidate Name',
  email: 'candidate@example.com',
  phone: '+91 98765 43210',
  location: 'Pune, Maharashtra, India',
  degree: 'B.E. Computer Science & Engineering',
  branch: 'Computer Engineering',
  graduationYear: 2026,
  cgpa: '8.0 / 10.0',
  skills: ['Java', 'Core Java', 'Spring Boot', 'SQL', 'Hibernate', 'REST API', 'Git', 'Data Structures'],
  experience: 'Fresher (0–1 Year)',
  resumeFileName: 'Resume_Sample.pdf',
  resumeFileSize: '180 KB',
  resumeUploadedAt: new Date().toISOString().split('T')[0],
  resumeDataUrl: '',
  githubUrl: 'https://github.com',
  linkedinUrl: 'https://linkedin.com',
  portfolioUrl: '',
  coverNote: 'Motivated software engineer ready for immediate joining. Built scalable projects and eager to contribute.',
  instantOneClickApply: false
};

export const isProfileConfigured = (profile?: UserProfile): boolean => {
  if (!profile) return false;
  return Boolean(
    profile.fullName?.trim() && 
    profile.email?.trim() && 
    profile.resumeFileName?.trim()
  );
};

export const getUserProfile = (): UserProfile => {
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    if (!raw) return defaultUserProfile;
    const parsed = JSON.parse(raw);
    return { ...defaultUserProfile, ...parsed };
  } catch {
    return defaultUserProfile;
  }
};

export const saveUserProfile = (profile: UserProfile): void => {
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
};

export const clearUserProfile = (): void => {
  try {
    localStorage.removeItem(USER_PROFILE_KEY);
  } catch (e) {
    console.error('Failed to clear profile', e);
  }
};
