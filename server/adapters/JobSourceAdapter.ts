import { Job, WalkInDrive, SourceType } from '../types';

export interface RawJobPayload {
  externalJobId: string;
  companyId: string;
  companyName: string;
  title: string;
  description: string;
  responsibilities: string[];
  location: string;
  city: string;
  experience: string;
  minExperienceYears: number;
  maxExperienceYears: number;
  salary: string;
  employmentType: 'Full-time' | 'Internship' | 'Contract' | 'Trainee';
  workMode: 'Remote' | 'Hybrid' | 'On-site';
  eligibility: {
    degree: string[];
    branches: string[];
    graduationYears: number[];
    cgpaRequirement: string;
    backlogRequirement: string;
    experienceRequirement: string;
    requiredCertifications?: string[];
    otherCriteria?: string[];
  };
  skills: string[];
  jobUrl: string;
  sourceType: SourceType;
  sourceName: string;
  postedAt?: string;
}

export interface RawWalkInPayload {
  companyId: string;
  companyName: string;
  role: string;
  experience: string;
  minExperienceYears: number;
  maxExperienceYears: number;
  location: string;
  city: string;
  venue: string;
  interviewDate: string; // YYYY-MM-DD
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  salary: string;
  eligibility: string;
  skills: string[];
  registrationRequired: boolean;
  registrationUrl?: string;
  sourceUrl: string;
  sourceName: string;
  openingsCount?: number;
  contactInfo?: string;
  requiredDocuments: string[];
  dressCode?: string;
}

export interface JobSourceAdapter {
  id: string;
  name: string;
  sourceType: SourceType;
  baseUrl: string;
  fetchJobs(): Promise<RawJobPayload[]>;
  fetchWalkIns?(): Promise<RawWalkInPayload[]>;
}
