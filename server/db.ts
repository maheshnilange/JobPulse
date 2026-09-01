import { Job, WalkInDrive, JobSourceConfig, UserAlert, NotificationItem, SavedJobItem, Company } from './types';
import { TRACKED_COMPANIES, INITIAL_SOURCE_CONFIGS } from './adapters/sourceAdapters';
import { FresherIntelligenceService } from './services/fresherIntelligenceService';

class InMemoryDB {
  public companies: Company[] = [...TRACKED_COMPANIES];
  public sources: JobSourceConfig[] = [...INITIAL_SOURCE_CONFIGS];
  public jobs: Job[] = [];
  public walkIns: WalkInDrive[] = [];
  public alerts: UserAlert[] = [];
  public notifications: NotificationItem[] = [];
  public savedJobs: SavedJobItem[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    const now = Date.now();
    const minMs = 60 * 1000;
    const hourMs = 60 * minMs;

    // Helper to produce ISO string offset
    const timeAgo = (minutes: number) => new Date(now - minutes * minMs).toISOString();
    const hoursAgo = (hours: number) => new Date(now - hours * hourMs).toISOString();

    // Seed Jobs
    this.jobs = [
      {
        id: 'job-tcs-001',
        externalJobId: 'TCS-IND-2026-0941',
        companyId: 'tcs',
        companyName: 'Tata Consultancy Services (TCS)',
        companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=60',
        title: 'Java Full Stack Developer (Fresher 2025/2026 Batch)',
        description: 'TCS is hiring entry-level Java Full Stack Developers for our Enterprise Solutions Unit. You will develop modern web applications using Spring Boot microservices, Angular/React, and relational databases. Comprehensive onboarding and training provided at TCS Sahyadri Park.',
        responsibilities: [
          'Design and develop RESTful microservices using Core Java, Spring Boot, and JPA/Hibernate',
          'Write unit tests using JUnit and Mockito to ensure code quality',
          'Collaborate with frontend teams to integrate React components with backend endpoints',
          'Participate in code reviews, sprint planning, and CI/CD deployment pipelines'
        ],
        location: 'Pune, Maharashtra',
        city: 'Pune',
        experience: '0–1 Years (Freshers Eligible)',
        minExperienceYears: 0,
        maxExperienceYears: 1,
        salary: '₹4.5 – 6.5 LPA',
        employmentType: 'Full-time',
        workMode: 'Hybrid',
        eligibility: {
          degree: ['B.E', 'B.Tech', 'M.Tech', 'MCA', 'M.Sc (IT/CS)'],
          branches: ['Computer Science', 'Information Technology', 'Electronics & Telecom', 'Data Science'],
          graduationYears: [2024, 2025, 2026],
          cgpaRequirement: 'Minimum 60% or 6.0 CGPA throughout 10th, 12th, and Graduation',
          backlogRequirement: 'No active backlogs at the time of joining (Max 1 allowed during interview)',
          experienceRequirement: 'Freshers (0-1 year experience)',
          requiredCertifications: ['Java Certification (Optional but preferred)', 'Oracle Certified Associate (Bonus)'],
          otherCriteria: ['Strong problem-solving ability', 'Basic understanding of Object-Oriented Programming (OOP) and Data Structures']
        },
        skills: ['Java', 'Core Java', 'Spring Boot', 'REST API', 'Hibernate', 'SQL', 'Git', 'React'],
        jobUrl: 'https://www.tcs.com/careers/india/entry-level',
        primarySource: 'COMPANY_PORTAL',
        primarySourceName: 'TCS iBegin Careers Portal',
        sourceConfidence: 'OFFICIAL_CAREER_PAGE',
        discoveredSources: [
          {
            sourceName: 'Naukri Feed',
            sourceType: 'NAUKRI',
            originalUrl: 'https://www.naukri.com/tcs-fresher-jobs',
            postedAt: timeAgo(25),
            firstSeenAt: timeAgo(18),
            confidence: 'VERIFIED_JOB_SOURCE'
          },
          {
            sourceName: 'TCS Official Career Portal',
            sourceType: 'COMPANY_PORTAL',
            originalUrl: 'https://www.tcs.com/careers/india/entry-level',
            postedAt: timeAgo(20),
            firstSeenAt: timeAgo(12),
            confidence: 'OFFICIAL_CAREER_PAGE'
          }
        ],
        postedAt: timeAgo(20),
        firstDetectedAt: timeAgo(4), // Detected 4 minutes ago -> VERY FRESH 🔥
        lastCheckedAt: timeAgo(1),
        lastUpdatedAt: timeAgo(4),
        status: 'ACTIVE',
        categories: ['Fresher', 'Java', 'Software'],
        isFresher: true,
        isJava: true,
        isSoftware: true,
        timeline: [
          { stage: 'POSTED_BY_SOURCE', timestamp: timeAgo(20), description: 'Job listed on TCS iBegin talent pool', status: 'completed' },
          { stage: 'DETECTED_BY_JOBPULSE', timestamp: timeAgo(4), description: 'Crawled and detected by JobPulse monitor engine', status: 'completed' },
          { stage: 'PROCESSED_NORMALIZED', timestamp: timeAgo(4), description: 'Parsed eligibility, skills (Java, Spring Boot), and location Pune', status: 'completed' },
          { stage: 'DUPLICATE_CHECK_PASSED', timestamp: timeAgo(4), description: 'Merged Naukri feed and Official Portal listings into single canonical profile', status: 'completed' },
          { stage: 'ALERT_MATCHED', timestamp: timeAgo(3), description: 'Matched rule "Java Pune Fresher"', status: 'completed' },
          { stage: 'NOTIFICATION_SENT', timestamp: timeAgo(3), description: 'Dispatched in-app and browser notifications', status: 'completed' },
          { stage: 'LAST_VERIFIED', timestamp: timeAgo(1), description: 'Verified official domain tcs.com link is active', status: 'completed' }
        ],
        isDemoData: true
      },
      {
        id: 'job-acc-002',
        externalJobId: 'ACC-IN-2026-8812',
        companyId: 'accenture',
        companyName: 'Accenture',
        companyLogo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&auto=format&fit=crop&q=60',
        title: 'Associate Software Engineer - Java & Spring Boot',
        description: 'Join Accenture Technology as an Associate Software Engineer. You will build resilient enterprise services, cloud integrations on AWS/Azure, and high-performance Java APIs. You will undergo industry-leading training at our Advanced Technology Center.',
        responsibilities: [
          'Develop, test, and maintain enterprise Java applications using Spring Boot and Microservices',
          'Optimize database queries in PostgreSQL/Oracle for high throughput',
          'Deploy services onto containerized Kubernetes environments',
          'Debug production issues and participate in agile sprints'
        ],
        location: 'Bengaluru, Karnataka',
        city: 'Bengaluru',
        experience: '0–1 Years (Freshers & 2025/2026 Grads)',
        minExperienceYears: 0,
        maxExperienceYears: 1,
        salary: '₹5.0 – 7.2 LPA',
        employmentType: 'Full-time',
        workMode: 'Hybrid',
        eligibility: {
          degree: ['B.E', 'B.Tech', 'MCA', 'M.Tech'],
          branches: ['All engineering streams / IT / Computer Applications'],
          graduationYears: [2024, 2025, 2026],
          cgpaRequirement: '6.5 CGPA or 65% aggregate with no active backlogs',
          backlogRequirement: 'Zero active backlogs at time of joining',
          experienceRequirement: '0-1 year',
          requiredCertifications: ['None required'],
          otherCriteria: ['Good written and oral communication skills in English', 'Willingness to work across flexible project shifts']
        },
        skills: ['Java', 'Core Java', 'Spring Boot', 'Microservices', 'PostgreSQL', 'Docker', 'AWS', 'Git'],
        jobUrl: 'https://www.accenture.com/in-en/careers/jobsearch?jk=software+engineer+fresher',
        primarySource: 'COMPANY_PORTAL',
        primarySourceName: 'Accenture Career Gateway',
        sourceConfidence: 'OFFICIAL_CAREER_PAGE',
        discoveredSources: [
          {
            sourceName: 'Accenture ATS Feed',
            sourceType: 'COMPANY_PORTAL',
            originalUrl: 'https://www.accenture.com/in-en/careers/jobsearch?jk=software+engineer+fresher',
            postedAt: timeAgo(30),
            firstSeenAt: timeAgo(11),
            confidence: 'OFFICIAL_CAREER_PAGE'
          }
        ],
        postedAt: timeAgo(30),
        firstDetectedAt: timeAgo(11), // Detected 11 minutes ago -> VERY FRESH 🔥
        lastCheckedAt: timeAgo(2),
        lastUpdatedAt: timeAgo(11),
        status: 'ACTIVE',
        categories: ['Fresher', 'Java', 'Software'],
        isFresher: true,
        isJava: true,
        isSoftware: true,
        timeline: [
          { stage: 'POSTED_BY_SOURCE', timestamp: timeAgo(30), description: 'Published on Accenture global career portal', status: 'completed' },
          { stage: 'DETECTED_BY_JOBPULSE', timestamp: timeAgo(11), description: 'Detected in ATS sync batch', status: 'completed' },
          { stage: 'PROCESSED_NORMALIZED', timestamp: timeAgo(11), description: 'Skills parsed: Java, Spring Boot, Microservices', status: 'completed' },
          { stage: 'DUPLICATE_CHECK_PASSED', timestamp: timeAgo(11), description: 'Verified unique listing', status: 'completed' },
          { stage: 'ALERT_MATCHED', timestamp: timeAgo(10), description: 'Matched alert rules for Bengaluru & Java', status: 'completed' },
          { stage: 'NOTIFICATION_SENT', timestamp: timeAgo(10), description: 'Notification sent', status: 'completed' },
          { stage: 'LAST_VERIFIED', timestamp: timeAgo(2), description: 'Domain verification passed', status: 'completed' }
        ],
        isDemoData: true
      },
      {
        id: 'job-inf-003',
        externalJobId: 'INF-SP-2026-4421',
        companyId: 'infosys',
        companyName: 'Infosys',
        companyLogo: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=100&auto=format&fit=crop&q=60',
        title: 'Systems Engineer / Graduate Trainee - Java & Cloud',
        description: 'Infosys is recruiting Systems Engineers and Graduate Engineer Trainees. Selected candidates undergo world-class training at the Infosys Mysore Global Education Centre, followed by deployment in Java enterprise modernization projects.',
        responsibilities: [
          'Develop Java backend logic and services following Infosys coding standards',
          'Learn and apply Spring Boot, Hibernate, and Cloud Fundamentals (AWS/Azure)',
          'Perform unit testing, code optimization, and defect resolution in Jira'
        ],
        location: 'Hyderabad, Telangana',
        city: 'Hyderabad',
        experience: '0 Years (Freshers Only)',
        minExperienceYears: 0,
        maxExperienceYears: 0,
        salary: '₹4.0 – 5.5 LPA',
        employmentType: 'Full-time',
        workMode: 'Hybrid',
        eligibility: {
          degree: ['B.E', 'B.Tech', 'M.E', 'M.Tech', 'MCA'],
          branches: ['CS', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil (All branches eligible)'],
          graduationYears: [2025, 2026],
          cgpaRequirement: '60% or 6.0 CGPA throughout 10th, 12th, Diploma, and Graduation',
          backlogRequirement: 'No active backlogs allowed at graduation',
          experienceRequirement: 'Freshers only',
          otherCriteria: ['Candidate should not have participated in Infosys selection process in past 6 months']
        },
        skills: ['Java', 'Core Java', 'SQL', 'OOP', 'HTML/CSS', 'Data Structures', 'Spring Boot Basics'],
        jobUrl: 'https://career.infosys.com/jobs?skill=Java',
        primarySource: 'COMPANY_PORTAL',
        primarySourceName: 'Infosys Careers Springboard',
        sourceConfidence: 'OFFICIAL_CAREER_PAGE',
        discoveredSources: [
          {
            sourceName: 'Infosys Career Portal',
            sourceType: 'COMPANY_PORTAL',
            originalUrl: 'https://career.infosys.com/jobs?skill=Java',
            postedAt: timeAgo(45),
            firstSeenAt: timeAgo(32),
            confidence: 'OFFICIAL_CAREER_PAGE'
          }
        ],
        postedAt: timeAgo(45),
        firstDetectedAt: timeAgo(32), // 32 min ago -> FRESH 🟢
        lastCheckedAt: timeAgo(5),
        lastUpdatedAt: timeAgo(32),
        status: 'ACTIVE',
        categories: ['Fresher', 'Java', 'Software'],
        isFresher: true,
        isJava: true,
        isSoftware: true,
        timeline: [
          { stage: 'POSTED_BY_SOURCE', timestamp: timeAgo(45), description: 'Listed on Infosys Springboard', status: 'completed' },
          { stage: 'DETECTED_BY_JOBPULSE', timestamp: timeAgo(32), description: 'Discovered by Springboard adapter', status: 'completed' },
          { stage: 'PROCESSED_NORMALIZED', timestamp: timeAgo(32), description: 'Normalized role & eligibility requirements', status: 'completed' },
          { stage: 'DUPLICATE_CHECK_PASSED', timestamp: timeAgo(32), description: 'No duplicates found', status: 'completed' },
          { stage: 'ALERT_MATCHED', timestamp: timeAgo(31), description: 'Matched fresher alerts', status: 'completed' },
          { stage: 'NOTIFICATION_SENT', timestamp: timeAgo(31), description: 'Dispatched to matched subscribers', status: 'completed' },
          { stage: 'LAST_VERIFIED', timestamp: timeAgo(5), description: 'Link verified valid', status: 'completed' }
        ],
        isDemoData: true
      },
      {
        id: 'job-per-004',
        externalJobId: 'PER-PUN-9920',
        companyId: 'persistent',
        companyName: 'Persistent Systems',
        companyLogo: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=100&auto=format&fit=crop&q=60',
        title: 'Junior Java Developer (Product Engineering)',
        description: 'Persistent Systems is looking for aspiring Java Software Engineers to join our Software Product Engineering team in Pune. You will work on cutting-edge SaaS products, cloud native architectures, and microservices.',
        responsibilities: [
          'Develop Java backend services using Spring Boot and Hibernate',
          'Write database stored procedures and optimize queries in MySQL and MongoDB',
          'Implement RESTful endpoints with OpenAPI/Swagger documentation',
          'Participate in sprint retrospectives and unit testing'
        ],
        location: 'Pune, Maharashtra',
        city: 'Pune',
        experience: '0–1 Years',
        minExperienceYears: 0,
        maxExperienceYears: 1,
        salary: '₹5.5 – 7.5 LPA',
        employmentType: 'Full-time',
        workMode: 'On-site',
        eligibility: {
          degree: ['B.E', 'B.Tech', 'MCA'],
          branches: ['Computer Science', 'IT', 'AI & ML'],
          graduationYears: [2024, 2025],
          cgpaRequirement: '6.5 CGPA and above',
          backlogRequirement: 'Zero backlogs',
          experienceRequirement: '0 to 1 year',
          requiredCertifications: ['Java / AWS knowledge is an added advantage']
        },
        skills: ['Java', 'Spring Boot', 'Hibernate', 'REST API', 'MySQL', 'MongoDB', 'Git'],
        jobUrl: 'https://www.persistent.com/careers/',
        primarySource: 'COMPANY_PORTAL',
        primarySourceName: 'Persistent Systems Careers',
        sourceConfidence: 'OFFICIAL_CAREER_PAGE',
        discoveredSources: [
          {
            sourceName: 'LinkedIn Public Feed',
            sourceType: 'LINKEDIN',
            originalUrl: 'https://www.linkedin.com/company/persistent-systems/jobs/',
            postedAt: hoursAgo(2),
            firstSeenAt: hoursAgo(1),
            confidence: 'VERIFIED_JOB_SOURCE'
          },
          {
            sourceName: 'Persistent Careers Portal',
            sourceType: 'COMPANY_PORTAL',
            originalUrl: 'https://www.persistent.com/careers/',
            postedAt: hoursAgo(2),
            firstSeenAt: hoursAgo(1),
            confidence: 'OFFICIAL_CAREER_PAGE'
          }
        ],
        postedAt: hoursAgo(2),
        firstDetectedAt: hoursAgo(1), // 1 hour ago -> RECENT 🟡
        lastCheckedAt: timeAgo(10),
        lastUpdatedAt: hoursAgo(1),
        status: 'ACTIVE',
        categories: ['Fresher', 'Java', 'Software'],
        isFresher: true,
        isJava: true,
        isSoftware: true,
        timeline: [
          { stage: 'POSTED_BY_SOURCE', timestamp: hoursAgo(2), description: 'Posted on LinkedIn & Company Portal', status: 'completed' },
          { stage: 'DETECTED_BY_JOBPULSE', timestamp: hoursAgo(1), description: 'Detected by source crawler', status: 'completed' },
          { stage: 'PROCESSED_NORMALIZED', timestamp: hoursAgo(1), description: 'Normalized skills & Pune location', status: 'completed' },
          { stage: 'DUPLICATE_CHECK_PASSED', timestamp: hoursAgo(1), description: 'Merged LinkedIn and Official Portal URLs', status: 'completed' },
          { stage: 'ALERT_MATCHED', timestamp: hoursAgo(1), description: 'Matched user alerts for Pune & Java', status: 'completed' },
          { stage: 'NOTIFICATION_SENT', timestamp: hoursAgo(1), description: 'Alert dispatched', status: 'completed' },
          { stage: 'LAST_VERIFIED', timestamp: timeAgo(10), description: 'Application link confirmed active', status: 'completed' }
        ],
        isDemoData: true
      },
      {
        id: 'job-amz-005',
        externalJobId: 'AMZ-HYD-SDE-1082',
        companyId: 'amazon',
        companyName: 'Amazon',
        companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=60',
        title: 'Software Development Engineer I (SDE 1) - Freshers',
        description: 'Amazon is hiring Software Development Engineers (SDE I) for our AWS Core Services team in Hyderabad. We are looking for engineers with strong fundamentals in Data Structures, Algorithms, and Object-Oriented Design in Java/C++.',
        responsibilities: [
          'Design and build massively scalable distributed services in Java',
          'Write high-quality, maintainable, and robust code tested with automation',
          'Solve complex real-world distributed caching, database, and concurrency challenges',
          'Work alongside Principal Engineers to define technical roadmaps'
        ],
        location: 'Hyderabad, Telangana',
        city: 'Hyderabad',
        experience: '0–1 Years (2025/2026 Batch)',
        minExperienceYears: 0,
        maxExperienceYears: 1,
        salary: '₹14.0 – 22.0 LPA (Base + Stock + Bonus)',
        employmentType: 'Full-time',
        workMode: 'On-site',
        eligibility: {
          degree: ['B.E', 'B.Tech', 'M.Tech', 'MS in Computer Science'],
          branches: ['Computer Science', 'IT', 'Circuital Branches'],
          graduationYears: [2025, 2026],
          cgpaRequirement: '7.0 CGPA or equivalent',
          backlogRequirement: 'No active backlogs',
          experienceRequirement: '0-1 year',
          requiredCertifications: ['Not required'],
          otherCriteria: ['Exceptional proficiency in Data Structures and Algorithms', 'System design basics and multi-threading knowledge']
        },
        skills: ['Java', 'Data Structures', 'Algorithms', 'Distributed Systems', 'AWS', 'Multi-threading', 'System Design'],
        jobUrl: 'https://www.amazon.jobs/en/search?base_query=Software+Development+Engineer+fresher&loc_query=India',
        primarySource: 'COMPANY_PORTAL',
        primarySourceName: 'Amazon.jobs Portal',
        sourceConfidence: 'OFFICIAL_CAREER_PAGE',
        discoveredSources: [
          {
            sourceName: 'Amazon Jobs Portal',
            sourceType: 'COMPANY_PORTAL',
            originalUrl: 'https://www.amazon.jobs/en/search?base_query=Software+Development+Engineer+fresher&loc_query=India',
            postedAt: hoursAgo(3),
            firstSeenAt: hoursAgo(2),
            confidence: 'OFFICIAL_CAREER_PAGE'
          }
        ],
        postedAt: hoursAgo(3),
        firstDetectedAt: hoursAgo(2),
        lastCheckedAt: timeAgo(15),
        lastUpdatedAt: hoursAgo(2),
        status: 'ACTIVE',
        categories: ['Fresher', 'Java', 'Software'],
        isFresher: true,
        isJava: true,
        isSoftware: true,
        timeline: [
          { stage: 'POSTED_BY_SOURCE', timestamp: hoursAgo(3), description: 'Published on amazon.jobs', status: 'completed' },
          { stage: 'DETECTED_BY_JOBPULSE', timestamp: hoursAgo(2), description: 'Scanned from Amazon career feed', status: 'completed' },
          { stage: 'PROCESSED_NORMALIZED', timestamp: hoursAgo(2), description: 'Normalized high-priority fresher SDE role', status: 'completed' },
          { stage: 'DUPLICATE_CHECK_PASSED', timestamp: hoursAgo(2), description: 'Unique verified listing', status: 'completed' },
          { stage: 'ALERT_MATCHED', timestamp: hoursAgo(2), description: 'Matched SDE & Hyderabad alerts', status: 'completed' },
          { stage: 'NOTIFICATION_SENT', timestamp: hoursAgo(2), description: 'High-priority notification sent', status: 'completed' },
          { stage: 'LAST_VERIFIED', timestamp: timeAgo(15), description: 'Application link active', status: 'completed' }
        ],
        isDemoData: true
      },
      {
        id: 'job-cap-006',
        externalJobId: 'CAP-MUM-7731',
        companyId: 'capgemini',
        companyName: 'Capgemini',
        companyLogo: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=100&auto=format&fit=crop&q=60',
        title: 'Software Trainee - Java & Microservices',
        description: 'Capgemini Exceller hiring is now open for Freshers. Selected candidates will be onboarded into our Financial Services Java practice to build secure digital banking solutions.',
        responsibilities: [
          'Develop Java backend logic using Spring Boot and REST standards',
          'Write automated JUnit test cases and integrate with Jenkins pipeline',
          'Assist in database design and indexing in PostgreSQL'
        ],
        location: 'Mumbai, Maharashtra',
        city: 'Mumbai',
        experience: '0 Years (2025/2026 Batch)',
        minExperienceYears: 0,
        maxExperienceYears: 0,
        salary: '₹4.25 – 5.75 LPA',
        employmentType: 'Full-time',
        workMode: 'Hybrid',
        eligibility: {
          degree: ['B.E', 'B.Tech', 'MCA'],
          branches: ['All streams'],
          graduationYears: [2025, 2026],
          cgpaRequirement: '60% throughout',
          backlogRequirement: 'Max 1 active backlog during application; zero at joining',
          experienceRequirement: 'Freshers',
          otherCriteria: ['Good problem-solving and aptitude skills']
        },
        skills: ['Java', 'Core Java', 'Spring Boot', 'SQL', 'PostgreSQL', 'Git', 'Maven'],
        jobUrl: 'https://www.capgemini.com/in-en/careers/job-search/?country_code=in-en&technology=Java',
        primarySource: 'COMPANY_PORTAL',
        primarySourceName: 'Capgemini Exceller Portal',
        sourceConfidence: 'OFFICIAL_CAREER_PAGE',
        discoveredSources: [
          {
            sourceName: 'Naukri Feed',
            sourceType: 'NAUKRI',
            originalUrl: 'https://www.naukri.com/capgemini-fresher-jobs',
            postedAt: hoursAgo(5),
            firstSeenAt: hoursAgo(4),
            confidence: 'VERIFIED_JOB_SOURCE'
          },
          {
            sourceName: 'Capgemini Portal',
            sourceType: 'COMPANY_PORTAL',
            originalUrl: 'https://www.capgemini.com/in-en/careers/job-search/?country_code=in-en&technology=Java',
            postedAt: hoursAgo(5),
            firstSeenAt: hoursAgo(4),
            confidence: 'OFFICIAL_CAREER_PAGE'
          }
        ],
        postedAt: hoursAgo(5),
        firstDetectedAt: hoursAgo(4),
        lastCheckedAt: timeAgo(20),
        lastUpdatedAt: hoursAgo(4),
        status: 'ACTIVE',
        categories: ['Fresher', 'Java', 'Software'],
        isFresher: true,
        isJava: true,
        isSoftware: true,
        timeline: [
          { stage: 'POSTED_BY_SOURCE', timestamp: hoursAgo(5), description: 'Listed on Capgemini careers', status: 'completed' },
          { stage: 'DETECTED_BY_JOBPULSE', timestamp: hoursAgo(4), description: 'Detected from Capgemini Exceller feed', status: 'completed' },
          { stage: 'PROCESSED_NORMALIZED', timestamp: hoursAgo(4), description: 'Normalized fresher requirements', status: 'completed' },
          { stage: 'DUPLICATE_CHECK_PASSED', timestamp: hoursAgo(4), description: 'Source merged with Naukri posting', status: 'completed' },
          { stage: 'ALERT_MATCHED', timestamp: hoursAgo(4), description: 'Matched Mumbai alerts', status: 'completed' },
          { stage: 'NOTIFICATION_SENT', timestamp: hoursAgo(4), description: 'Sent notification', status: 'completed' },
          { stage: 'LAST_VERIFIED', timestamp: timeAgo(20), description: 'Active status confirmed', status: 'completed' }
        ],
        isDemoData: true
      },
      {
        id: 'job-cog-007',
        externalJobId: 'COG-CHE-4991',
        companyId: 'cognizant',
        companyName: 'Cognizant',
        companyLogo: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=100&auto=format&fit=crop&q=60',
        title: 'Programmer Analyst Trainee (Java / Cloud)',
        description: 'Cognizant GenC is hiring Programmer Analyst Trainees for Java cloud solutions. Join our modern engineering pods working on Spring Cloud, containerization, and REST APIs.',
        responsibilities: [
          'Implement Java backend microservices and integrate with relational databases',
          'Write unit tests and automate API testing using Postman',
          'Participate in agile ceremonies and sprint deliverables'
        ],
        location: 'Chennai, Tamil Nadu',
        city: 'Chennai',
        experience: '0–1 Years',
        minExperienceYears: 0,
        maxExperienceYears: 1,
        salary: '₹4.0 – 5.4 LPA',
        employmentType: 'Full-time',
        workMode: 'Hybrid',
        eligibility: {
          degree: ['B.E', 'B.Tech', 'MCA', 'M.Sc (CS/IT)'],
          branches: ['All engineering streams'],
          graduationYears: [2024, 2025, 2026],
          cgpaRequirement: 'Minimum 60% or 6.0 CGPA',
          backlogRequirement: 'Zero active backlogs at time of joining',
          experienceRequirement: '0-1 year'
        },
        skills: ['Java', 'Spring Framework', 'SQL', 'Hibernate', 'REST API', 'Git'],
        jobUrl: 'https://careers.cognizant.com/global-en/jobs?keywords=Java+trainee',
        primarySource: 'COMPANY_PORTAL',
        primarySourceName: 'Cognizant Careers Portal',
        sourceConfidence: 'OFFICIAL_CAREER_PAGE',
        discoveredSources: [
          {
            sourceName: 'Cognizant Gateway',
            sourceType: 'COMPANY_PORTAL',
            originalUrl: 'https://careers.cognizant.com/global-en/jobs?keywords=Java+trainee',
            postedAt: hoursAgo(8),
            firstSeenAt: hoursAgo(6),
            confidence: 'OFFICIAL_CAREER_PAGE'
          }
        ],
        postedAt: hoursAgo(8),
        firstDetectedAt: hoursAgo(6),
        lastCheckedAt: timeAgo(30),
        lastUpdatedAt: hoursAgo(6),
        status: 'ACTIVE',
        categories: ['Fresher', 'Java', 'Software'],
        isFresher: true,
        isJava: true,
        isSoftware: true,
        timeline: [
          { stage: 'POSTED_BY_SOURCE', timestamp: hoursAgo(8), description: 'Posted on Cognizant careers', status: 'completed' },
          { stage: 'DETECTED_BY_JOBPULSE', timestamp: hoursAgo(6), description: 'Captured in scheduled batch', status: 'completed' },
          { stage: 'PROCESSED_NORMALIZED', timestamp: hoursAgo(6), description: 'Normalized Java Trainee role', status: 'completed' },
          { stage: 'DUPLICATE_CHECK_PASSED', timestamp: hoursAgo(6), description: 'Duplicate check clean', status: 'completed' },
          { stage: 'ALERT_MATCHED', timestamp: hoursAgo(6), description: 'Matched Chennai & Fresher alerts', status: 'completed' },
          { stage: 'NOTIFICATION_SENT', timestamp: hoursAgo(6), description: 'Notification sent to users', status: 'completed' },
          { stage: 'LAST_VERIFIED', timestamp: timeAgo(30), description: 'Domain verified', status: 'completed' }
        ],
        isDemoData: true
      },
      {
        id: 'job-wip-008',
        externalJobId: 'WIP-HYD-QA-3310',
        companyId: 'wipro',
        companyName: 'Wipro',
        companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=60',
        title: 'Associate Software Engineer - QA & Test Automation (Java / Selenium)',
        description: 'Wipro Elite National Talent Hunt hiring for QA Engineers and Test Automation Trainees. Work on automating enterprise application testing using Java, Selenium WebDriver, TestNG, and CI/CD pipelines.',
        responsibilities: [
          'Design and execute automated test scripts using Java and Selenium WebDriver',
          'Create test plans, test cases, and log defects in Jira',
          'Perform API testing using Postman and RestAssured'
        ],
        location: 'Hyderabad, Telangana',
        city: 'Hyderabad',
        experience: '0–1 Years',
        minExperienceYears: 0,
        maxExperienceYears: 1,
        salary: '₹3.8 – 5.0 LPA',
        employmentType: 'Full-time',
        workMode: 'On-site',
        eligibility: {
          degree: ['B.E', 'B.Tech', 'MCA', 'M.Tech'],
          branches: ['All engineering disciplines'],
          graduationYears: [2024, 2025, 2026],
          cgpaRequirement: '60% throughout 10th, 12th, and UG',
          backlogRequirement: 'Max 1 active backlog at application stage',
          experienceRequirement: '0-1 year'
        },
        skills: ['Java', 'Selenium', 'TestNG', 'Automation Testing', 'SQL', 'Postman', 'RestAssured', 'Git'],
        jobUrl: 'https://careers.wipro.com/careers-home/jobs?keywords=Software+Engineer',
        primarySource: 'COMPANY_PORTAL',
        primarySourceName: 'Wipro Elite Gateway',
        sourceConfidence: 'OFFICIAL_CAREER_PAGE',
        discoveredSources: [
          {
            sourceName: 'Wipro Portal',
            sourceType: 'COMPANY_PORTAL',
            originalUrl: 'https://careers.wipro.com/careers-home/jobs?keywords=Software+Engineer',
            postedAt: hoursAgo(12),
            firstSeenAt: hoursAgo(10),
            confidence: 'OFFICIAL_CAREER_PAGE'
          }
        ],
        postedAt: hoursAgo(12),
        firstDetectedAt: hoursAgo(10),
        lastCheckedAt: timeAgo(40),
        lastUpdatedAt: hoursAgo(10),
        status: 'ACTIVE',
        categories: ['Fresher', 'Java', 'Software', 'QA_Testing'],
        isFresher: true,
        isJava: true,
        isSoftware: true,
        timeline: [
          { stage: 'POSTED_BY_SOURCE', timestamp: hoursAgo(12), description: 'Published on Wipro Elite portal', status: 'completed' },
          { stage: 'DETECTED_BY_JOBPULSE', timestamp: hoursAgo(10), description: 'Ingested into QA & Testing stream', status: 'completed' },
          { stage: 'PROCESSED_NORMALIZED', timestamp: hoursAgo(10), description: 'Normalized QA automation & Java skills', status: 'completed' },
          { stage: 'DUPLICATE_CHECK_PASSED', timestamp: hoursAgo(10), description: 'Clean deduplication result', status: 'completed' },
          { stage: 'ALERT_MATCHED', timestamp: hoursAgo(10), description: 'Matched QA & Fresher alerts', status: 'completed' },
          { stage: 'NOTIFICATION_SENT', timestamp: hoursAgo(10), description: 'Dispatched to QA alert channels', status: 'completed' },
          { stage: 'LAST_VERIFIED', timestamp: timeAgo(40), description: 'Status confirmed active', status: 'completed' }
        ],
        isDemoData: true
      },
      {
        id: 'job-del-009',
        externalJobId: 'DEL-USI-2026-664',
        companyId: 'deloitte',
        companyName: 'Deloitte',
        companyLogo: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=100&auto=format&fit=crop&q=60',
        title: 'Associate Consultant - Java & Enterprise Cloud',
        description: 'Deloitte USI is hiring Associate Consultants for our Enterprise Technology & Performance practice. You will architect and implement microservices in Java, Spring Boot, and integrate with enterprise ERP and cloud platforms.',
        responsibilities: [
          'Build scalable enterprise backend services in Java and Spring Boot',
          'Participate in cloud migrations to AWS and Azure',
          'Collaborate with global clients across US, Europe, and Asia-Pacific'
        ],
        location: 'Hyderabad / Bengaluru / Pune',
        city: 'Hyderabad',
        experience: '0–1 Years',
        minExperienceYears: 0,
        maxExperienceYears: 1,
        salary: '₹7.5 – 10.0 LPA',
        employmentType: 'Full-time',
        workMode: 'Hybrid',
        eligibility: {
          degree: ['B.Tech', 'B.E', 'MCA'],
          branches: ['CSE', 'IT', 'ECE'],
          graduationYears: [2024, 2025],
          cgpaRequirement: '6.5 CGPA and above',
          backlogRequirement: 'Zero backlogs',
          experienceRequirement: '0-1 year'
        },
        skills: ['Java', 'Spring Boot', 'Microservices', 'REST API', 'Oracle SQL', 'AWS', 'Git'],
        jobUrl: 'https://jobsindia.deloitte.com/search/?q=Java',
        primarySource: 'COMPANY_PORTAL',
        primarySourceName: 'Deloitte USI Recruiting',
        sourceConfidence: 'OFFICIAL_CAREER_PAGE',
        discoveredSources: [
          {
            sourceName: 'Naukri Feed',
            sourceType: 'NAUKRI',
            originalUrl: 'https://www.naukri.com/deloitte-fresher-jobs',
            postedAt: hoursAgo(16),
            firstSeenAt: hoursAgo(14),
            confidence: 'VERIFIED_JOB_SOURCE'
          },
          {
            sourceName: 'Deloitte USI Portal',
            sourceType: 'COMPANY_PORTAL',
            originalUrl: 'https://jobsindia.deloitte.com/search/?q=Java',
            postedAt: hoursAgo(16),
            firstSeenAt: hoursAgo(14),
            confidence: 'OFFICIAL_CAREER_PAGE'
          }
        ],
        postedAt: hoursAgo(16),
        firstDetectedAt: hoursAgo(14),
        lastCheckedAt: timeAgo(45),
        lastUpdatedAt: hoursAgo(14),
        status: 'ACTIVE',
        categories: ['Fresher', 'Java', 'Software'],
        isFresher: true,
        isJava: true,
        isSoftware: true,
        timeline: [
          { stage: 'POSTED_BY_SOURCE', timestamp: hoursAgo(16), description: 'Listed on Deloitte USI portal', status: 'completed' },
          { stage: 'DETECTED_BY_JOBPULSE', timestamp: hoursAgo(14), description: 'Detected and validated against deloitte.com domain', status: 'completed' },
          { stage: 'PROCESSED_NORMALIZED', timestamp: hoursAgo(14), description: 'Normalized Java consultant profile', status: 'completed' },
          { stage: 'DUPLICATE_CHECK_PASSED', timestamp: hoursAgo(14), description: 'Source merged with Naukri', status: 'completed' },
          { stage: 'ALERT_MATCHED', timestamp: hoursAgo(14), description: 'Matched high-package fresher alert', status: 'completed' },
          { stage: 'NOTIFICATION_SENT', timestamp: hoursAgo(14), description: 'Notifications dispatched', status: 'completed' },
          { stage: 'LAST_VERIFIED', timestamp: timeAgo(45), description: 'Link verified valid', status: 'completed' }
        ],
        isDemoData: true
      },
      {
        id: 'job-ora-010',
        externalJobId: 'ORA-BLR-DEV-901',
        companyId: 'oracle',
        companyName: 'Oracle',
        companyLogo: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=100&auto=format&fit=crop&q=60',
        title: 'Software Engineer - Java Backend & Oracle Database',
        description: 'Oracle Database & Cloud Engineering group is hiring Junior Software Engineers. Work with core Java, Helidon framework, multithreaded systems, and modern Oracle Autonomous Database backends.',
        responsibilities: [
          'Design and implement high-performance Java APIs and Helidon microservices',
          'Work on multi-tenant cloud storage and transaction engines',
          'Write automated tests and benchmarks for latency and throughput'
        ],
        location: 'Bengaluru, Karnataka',
        city: 'Bengaluru',
        experience: '0–1 Years',
        minExperienceYears: 0,
        maxExperienceYears: 1,
        salary: '₹12.0 – 16.5 LPA',
        employmentType: 'Full-time',
        workMode: 'Hybrid',
        eligibility: {
          degree: ['B.E', 'B.Tech', 'M.Tech', 'MCA'],
          branches: ['Computer Science', 'Information Science'],
          graduationYears: [2024, 2025],
          cgpaRequirement: '7.0 CGPA or 70%',
          backlogRequirement: 'Zero active backlogs',
          experienceRequirement: '0-1 year'
        },
        skills: ['Java', 'Core Java', 'Oracle Database', 'SQL', 'Multithreading', 'Helidon', 'REST API', 'Git'],
        jobUrl: 'https://careers.oracle.com/jobs/search?keyword=Java',
        primarySource: 'COMPANY_PORTAL',
        primarySourceName: 'Oracle Careers Portal',
        sourceConfidence: 'OFFICIAL_CAREER_PAGE',
        discoveredSources: [
          {
            sourceName: 'Oracle Career Portal',
            sourceType: 'COMPANY_PORTAL',
            originalUrl: 'https://careers.oracle.com/jobs/search?keyword=Java',
            postedAt: hoursAgo(20),
            firstSeenAt: hoursAgo(18),
            confidence: 'OFFICIAL_CAREER_PAGE'
          }
        ],
        postedAt: hoursAgo(20),
        firstDetectedAt: hoursAgo(18),
        lastCheckedAt: timeAgo(50),
        lastUpdatedAt: hoursAgo(18),
        status: 'ACTIVE',
        categories: ['Fresher', 'Java', 'Software'],
        isFresher: true,
        isJava: true,
        isSoftware: true,
        timeline: [
          { stage: 'POSTED_BY_SOURCE', timestamp: hoursAgo(20), description: 'Published on Oracle careers portal', status: 'completed' },
          { stage: 'DETECTED_BY_JOBPULSE', timestamp: hoursAgo(18), description: 'Detected by Oracle adapter', status: 'completed' },
          { stage: 'PROCESSED_NORMALIZED', timestamp: hoursAgo(18), description: 'Extracted skills: Java, Helidon, Oracle DB', status: 'completed' },
          { stage: 'DUPLICATE_CHECK_PASSED', timestamp: hoursAgo(18), description: 'Verified clean record', status: 'completed' },
          { stage: 'ALERT_MATCHED', timestamp: hoursAgo(18), description: 'Matched Bengaluru Java Engineer alerts', status: 'completed' },
          { stage: 'NOTIFICATION_SENT', timestamp: hoursAgo(18), description: 'Dispatched to alert queue', status: 'completed' },
          { stage: 'LAST_VERIFIED', timestamp: timeAgo(50), description: 'Domain verification passed', status: 'completed' }
        ],
        isDemoData: true
      },
      {
        id: 'job-hcl-011',
        externalJobId: 'HCL-NOI-2026-112',
        companyId: 'hcltech',
        companyName: 'HCLTech',
        companyLogo: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=100&auto=format&fit=crop&q=60',
        title: 'Graduate Engineer Trainee - Java Full Stack',
        description: 'HCLTech is onboarding fresh Graduate Engineer Trainees for our Digital & Software Engineering division. Full training on Spring Boot, Angular, and PostgreSQL will be provided at HCL Noida campus.',
        responsibilities: [
          'Develop Java backend logic and REST endpoints using Spring Boot',
          'Build responsive UI pages with Angular/HTML/CSS',
          'Write database scripts in PostgreSQL and debug client issues'
        ],
        location: 'Noida, Uttar Pradesh (Delhi NCR)',
        city: 'Noida',
        experience: '0–1 Years',
        minExperienceYears: 0,
        maxExperienceYears: 1,
        salary: '₹4.25 – 5.5 LPA',
        employmentType: 'Full-time',
        workMode: 'Hybrid',
        eligibility: {
          degree: ['B.Tech', 'B.E', 'MCA'],
          branches: ['All streams'],
          graduationYears: [2024, 2025, 2026],
          cgpaRequirement: '60% throughout (10th, 12th, and Degree)',
          backlogRequirement: 'Max 1 active backlog during drive, 0 at joining',
          experienceRequirement: 'Freshers (0-1 year)'
        },
        skills: ['Java', 'Core Java', 'Spring Boot', 'Angular', 'PostgreSQL', 'Git', 'REST API'],
        jobUrl: 'https://www.hcltech.com/careers/careers-in-india',
        primarySource: 'COMPANY_PORTAL',
        primarySourceName: 'HCLTech Graduate Portal',
        sourceConfidence: 'OFFICIAL_CAREER_PAGE',
        discoveredSources: [
          {
            sourceName: 'Naukri Feed',
            sourceType: 'NAUKRI',
            originalUrl: 'https://www.naukri.com/hcl-fresher-jobs',
            postedAt: hoursAgo(24),
            firstSeenAt: hoursAgo(22),
            confidence: 'VERIFIED_JOB_SOURCE'
          }
        ],
        postedAt: hoursAgo(24),
        firstDetectedAt: hoursAgo(22),
        lastCheckedAt: timeAgo(55),
        lastUpdatedAt: hoursAgo(22),
        status: 'ACTIVE',
        categories: ['Fresher', 'Java', 'Software'],
        isFresher: true,
        isJava: true,
        isSoftware: true,
        timeline: [
          { stage: 'POSTED_BY_SOURCE', timestamp: hoursAgo(24), description: 'Posted on Naukri by HCL recruiter', status: 'completed' },
          { stage: 'DETECTED_BY_JOBPULSE', timestamp: hoursAgo(22), description: 'Captured by Naukri RSS feed parser', status: 'completed' },
          { stage: 'PROCESSED_NORMALIZED', timestamp: hoursAgo(22), description: 'Extracted Noida location and Java Full Stack skills', status: 'completed' },
          { stage: 'DUPLICATE_CHECK_PASSED', timestamp: hoursAgo(22), description: 'Verified unique record', status: 'completed' },
          { stage: 'ALERT_MATCHED', timestamp: hoursAgo(22), description: 'Matched Delhi NCR & Noida alerts', status: 'completed' },
          { stage: 'NOTIFICATION_SENT', timestamp: hoursAgo(22), description: 'Notifications dispatched', status: 'completed' },
          { stage: 'LAST_VERIFIED', timestamp: timeAgo(55), description: 'Application link active', status: 'completed' }
        ],
        isDemoData: true
      },
      {
        id: 'job-msft-012',
        externalJobId: 'MSFT-HYD-NCG-551',
        companyId: 'microsoft',
        companyName: 'Microsoft',
        companyLogo: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=100&auto=format&fit=crop&q=60',
        title: 'Software Engineer (New College Graduate) - Cloud & Distributed Systems',
        description: 'Microsoft India Development Center (IDC) is hiring New College Graduates (NCG) for Software Engineer roles in Azure and Microsoft 365. Strong foundations in Java/C#, algorithms, and distributed caching are desired.',
        responsibilities: [
          'Design and implement hyperscale cloud backend services',
          'Write resilient code with automated unit and integration test coverage',
          'Troubleshoot and optimize performance of cloud infrastructure'
        ],
        location: 'Hyderabad / Bengaluru / Noida',
        city: 'Hyderabad',
        experience: '0–1 Years (2025/2026 Batch)',
        minExperienceYears: 0,
        maxExperienceYears: 1,
        salary: '₹18.0 – 26.0 LPA (Base + Equity + Bonus)',
        employmentType: 'Full-time',
        workMode: 'Hybrid',
        eligibility: {
          degree: ['B.Tech', 'B.E', 'M.Tech', 'MS in Computer Science'],
          branches: ['Computer Science', 'IT', 'Software Engineering'],
          graduationYears: [2025, 2026],
          cgpaRequirement: '7.5 CGPA or equivalent',
          backlogRequirement: 'Zero backlogs',
          experienceRequirement: '0-1 year',
          otherCriteria: ['Deep understanding of Data Structures, Algorithms, and Object-Oriented Design']
        },
        skills: ['Java', 'C#', 'Data Structures', 'Algorithms', 'Azure', 'Distributed Systems', 'Git'],
        jobUrl: 'https://careers.microsoft.com/v2/global/en/home.html',
        primarySource: 'COMPANY_PORTAL',
        primarySourceName: 'Microsoft Careers Portal',
        sourceConfidence: 'OFFICIAL_CAREER_PAGE',
        discoveredSources: [
          {
            sourceName: 'Microsoft Careers',
            sourceType: 'COMPANY_PORTAL',
            originalUrl: 'https://careers.microsoft.com/v2/global/en/home.html',
            postedAt: hoursAgo(30),
            firstSeenAt: hoursAgo(26),
            confidence: 'OFFICIAL_CAREER_PAGE'
          }
        ],
        postedAt: hoursAgo(30),
        firstDetectedAt: hoursAgo(26),
        lastCheckedAt: timeAgo(60),
        lastUpdatedAt: hoursAgo(26),
        status: 'ACTIVE',
        categories: ['Fresher', 'Java', 'Software'],
        isFresher: true,
        isJava: true,
        isSoftware: true,
        timeline: [
          { stage: 'POSTED_BY_SOURCE', timestamp: hoursAgo(30), description: 'Published on careers.microsoft.com', status: 'completed' },
          { stage: 'DETECTED_BY_JOBPULSE', timestamp: hoursAgo(26), description: 'Scanned from Microsoft NCG API feed', status: 'completed' },
          { stage: 'PROCESSED_NORMALIZED', timestamp: hoursAgo(26), description: 'Normalized high-scale SDE role', status: 'completed' },
          { stage: 'DUPLICATE_CHECK_PASSED', timestamp: hoursAgo(26), description: 'Verified clean duplicate check', status: 'completed' },
          { stage: 'ALERT_MATCHED', timestamp: hoursAgo(26), description: 'Matched Tier-1 Fresher alerts', status: 'completed' },
          { stage: 'NOTIFICATION_SENT', timestamp: hoursAgo(26), description: 'Sent to subscribers', status: 'completed' },
          { stage: 'LAST_VERIFIED', timestamp: timeAgo(60), description: 'Domain verification passed', status: 'completed' }
        ],
        isDemoData: true
      }
    ];

    // Seed Walk-In Drives (Completely Separate Module)
    this.walkIns = [
      {
        id: 'walkin-tcs-01',
        companyId: 'tcs',
        companyName: 'Tata Consultancy Services (TCS)',
        companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=60',
        role: 'Walk-In Drive for Java Freshers & Trainees (0–1 Yrs)',
        experience: '0–1 Years',
        minExperienceYears: 0,
        maxExperienceYears: 1,
        location: 'Pune, Maharashtra',
        city: 'Pune',
        venue: 'TCS Sahyadri Park, Gate No. 2, Rajiv Gandhi Infotech Park, Hinjewadi Phase 3, Pune, Maharashtra 411057',
        interviewDate: '2026-09-02',
        dayOfWeek: 'Wednesday',
        startTime: '09:30 AM',
        endTime: '02:00 PM',
        salary: '₹4.5 – 6.0 LPA',
        eligibility: 'B.E/B.Tech (CSE/IT/ECE), MCA (2024, 2025, 2026 Batches). Minimum 60% aggregate with max 1 active backlog.',
        skills: ['Core Java', 'Spring Boot', 'SQL', 'OOP Concepts', 'Data Structures', 'REST API'],
        registrationRequired: true,
        registrationUrl: 'https://www.tcs.com/careers/india/entry-level',
        sourceUrl: 'https://www.tcs.com/careers/india',
        sourceName: 'TCS Official Career Portal',
        sourceConfidence: 'OFFICIAL_CAREER_PAGE',
        lastVerifiedAt: '2026-08-30 11:30 AM',
        status: 'UPCOMING',
        openingsCount: 85,
        contactInfo: 'recruitment.pune@tcs.com | Helpdesk: 1800-209-3111',
        requiredDocuments: [
          'Updated Resume (2 hard copies)',
          'Govt ID Proof (Aadhaar / Passport / Voter ID original + copy)',
          '10th, 12th, and Semester Marksheets (original + photocopy)',
          '2 Recent Passport Size Photographs',
          'TCS iBegin Registration Confirmation Printout'
        ],
        dressCode: 'Strictly Business Formal (Collared shirt, formal trousers/suit, formal shoes)',
        isDemoData: true
      },
      {
        id: 'walkin-per-02',
        companyId: 'persistent',
        companyName: 'Persistent Systems',
        companyLogo: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=100&auto=format&fit=crop&q=60',
        role: 'Mega Walk-In Drive for Java & Spring Boot Developers',
        experience: '0–1 Years',
        minExperienceYears: 0,
        maxExperienceYears: 1,
        location: 'Pune, Maharashtra',
        city: 'Pune',
        venue: 'Persistent Systems, Pingala - Aryabhata Campus, 9A, 12, Off Senapati Bapat Road, Pune, Maharashtra 411016',
        interviewDate: '2026-08-30',
        dayOfWeek: 'Sunday (Today)',
        startTime: '10:00 AM',
        endTime: '03:00 PM',
        salary: '₹5.0 – 7.5 LPA',
        eligibility: 'B.E/B.Tech (CS/IT), MCA (2024/2025/2026 batches). 60% and above in 10th, 12th, and Graduation.',
        skills: ['Java', 'Spring Boot', 'Hibernate', 'RESTful Services', 'MySQL', 'Git'],
        registrationRequired: false,
        sourceUrl: 'https://www.persistent.com/careers/',
        sourceName: 'Persistent Systems Career Page',
        sourceConfidence: 'OFFICIAL_CAREER_PAGE',
        lastVerifiedAt: '2026-08-30 08:15 AM',
        status: 'TODAY',
        openingsCount: 40,
        contactInfo: 'careers@persistent.com',
        requiredDocuments: [
          'Hard copy of updated Resume',
          'Valid Photo ID Proof (PAN / Aadhaar / Passport)',
          'Latest degree provisional certificate or marksheets',
          'Passport size photograph'
        ],
        dressCode: 'Smart Casuals / Formals',
        isDemoData: true
      },
      {
        id: 'walkin-cap-03',
        companyId: 'capgemini',
        companyName: 'Capgemini',
        companyLogo: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=100&auto=format&fit=crop&q=60',
        role: 'Exclusive Walk-In Drive for Java Backend Freshers',
        experience: '0–1 Years',
        minExperienceYears: 0,
        maxExperienceYears: 1,
        location: 'Navi Mumbai, Maharashtra',
        city: 'Mumbai',
        venue: 'Capgemini Knowledge Park, IT-1 / IT-2, TTC Industrial Area, Thane-Belapur Road, Airoli, Navi Mumbai 400708',
        interviewDate: '2026-08-31',
        dayOfWeek: 'Monday (Tomorrow)',
        startTime: '09:00 AM',
        endTime: '01:30 PM',
        salary: '₹4.25 – 5.5 LPA',
        eligibility: 'B.Tech/B.E (Any branch), MCA with minimum 60% aggregate. No pending backlogs.',
        skills: ['Core Java', 'Spring Boot Basics', 'SQL Queries', 'Basic Web Technologies'],
        registrationRequired: true,
        registrationUrl: 'https://www.capgemini.com/in-en/careers/job-search/',
        sourceUrl: 'https://www.capgemini.com/in-en/careers/',
        sourceName: 'Capgemini Official Career Gateway',
        sourceConfidence: 'OFFICIAL_CAREER_PAGE',
        lastVerifiedAt: '2026-08-30 10:45 AM',
        status: 'TOMORROW',
        openingsCount: 60,
        contactInfo: 'freshers.hiring@capgemini.com',
        requiredDocuments: [
          'Capgemini Walk-In Registration Pass (Printout)',
          '2 copies of updated CV',
          'All academic marksheets and degree certificate',
          'Govt issued photo ID proof'
        ],
        dressCode: 'Formal attire mandatory',
        isDemoData: true
      },
      {
        id: 'walkin-inf-04',
        companyId: 'infosys',
        companyName: 'Infosys',
        companyLogo: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=100&auto=format&fit=crop&q=60',
        role: 'Off-Campus Walk-In Drive for System Associate / Java Trainee',
        experience: '0 Years (Freshers Only)',
        minExperienceYears: 0,
        maxExperienceYears: 0,
        location: 'Bengaluru, Karnataka',
        city: 'Bengaluru',
        venue: 'Infosys Limited, Gate No. 1, 44 Electronics City, Hosur Road, Bengaluru, Karnataka 560100',
        interviewDate: '2026-09-04',
        dayOfWeek: 'Friday',
        startTime: '09:00 AM',
        endTime: '02:00 PM',
        salary: '₹4.0 – 5.25 LPA',
        eligibility: 'B.Sc (Comp Sci/IT), BCA, B.E/B.Tech (All engineering branches). 65% in 10th, 12th, and Degree.',
        skills: ['Java Fundamentals', 'Logical Reasoning', 'SQL Basics', 'Communication Skills'],
        registrationRequired: true,
        registrationUrl: 'https://career.infosys.com',
        sourceUrl: 'https://career.infosys.com',
        sourceName: 'Infosys Career Portal',
        sourceConfidence: 'OFFICIAL_CAREER_PAGE',
        lastVerifiedAt: '2026-08-30 09:00 AM',
        status: 'UPCOMING',
        openingsCount: 120,
        contactInfo: 'talent.acquisition@infosys.com',
        requiredDocuments: [
          'Infosys Application Form barcode printout',
          'Original and copies of all mark sheets (10th, 12th, Graduation)',
          'Aadhaar card and PAN card original',
          '2 passport photos'
        ],
        dressCode: 'Formals',
        isDemoData: true
      },
      {
        id: 'walkin-acc-05',
        companyId: 'accenture',
        companyName: 'Accenture',
        companyLogo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&auto=format&fit=crop&q=60',
        role: 'National Walk-In Drive for Associate Software Engineers',
        experience: '0–1 Years',
        minExperienceYears: 0,
        maxExperienceYears: 1,
        location: 'Bengaluru, Karnataka',
        city: 'Bengaluru',
        venue: 'Accenture Bang 3, IBC Knowledge Park, Bannerghatta Main Road, Bengaluru, Karnataka 560029',
        interviewDate: '2026-09-05',
        dayOfWeek: 'Saturday',
        startTime: '09:00 AM',
        endTime: '04:00 PM',
        salary: '₹5.0 – 7.2 LPA',
        eligibility: 'B.E/B.Tech/MCA/M.Tech (2024, 2025, 2026 batches). Aggregate 65% or 6.5 CGPA throughout with no active backlog.',
        skills: ['Java', 'Spring Boot', 'Data Structures', 'Cloud Concepts', 'Problem Solving'],
        registrationRequired: true,
        registrationUrl: 'https://www.accenture.com/in-en/careers',
        sourceUrl: 'https://www.accenture.com/in-en/careers',
        sourceName: 'Accenture Career Gateway',
        sourceConfidence: 'OFFICIAL_CAREER_PAGE',
        lastVerifiedAt: '2026-08-30 11:00 AM',
        status: 'UPCOMING',
        openingsCount: 150,
        contactInfo: 'india.campus@accenture.com',
        requiredDocuments: [
          'Accenture Registration Hall Ticket',
          'Updated Resume with project details',
          'Degree provisional certificate or last semester marksheet',
          'Original Government Photo ID'
        ],
        dressCode: 'Business Formal',
        isDemoData: true
      },
      {
        id: 'walkin-cog-06',
        companyId: 'cognizant',
        companyName: 'Cognizant',
        companyLogo: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=100&auto=format&fit=crop&q=60',
        role: 'Off-Campus Walk-In Hiring for Java Trainees',
        experience: '0–1 Years',
        minExperienceYears: 0,
        maxExperienceYears: 1,
        location: 'Chennai, Tamil Nadu',
        city: 'Chennai',
        venue: 'Cognizant Technology Solutions, MEPZ - Special Economic Zone, Tambaram, Chennai, Tamil Nadu 600045',
        interviewDate: '2026-09-06',
        dayOfWeek: 'Sunday',
        startTime: '09:30 AM',
        endTime: '01:30 PM',
        salary: '₹4.0 – 5.4 LPA',
        eligibility: 'B.E/B.Tech/MCA/M.Sc IT (2024/2025). Minimum 60% throughout with zero active backlogs.',
        skills: ['Core Java', 'SQL', 'HTML/CSS', 'OOPs', 'Aptitude & Reasoning'],
        registrationRequired: false,
        sourceUrl: 'https://careers.cognizant.com/global-en/jobs',
        sourceName: 'Cognizant Careers Portal',
        sourceConfidence: 'OFFICIAL_CAREER_PAGE',
        lastVerifiedAt: '2026-08-30 08:40 AM',
        status: 'UPCOMING',
        openingsCount: 75,
        contactInfo: 'campusrecruitment@cognizant.com',
        requiredDocuments: [
          'Updated Resume (2 hard copies)',
          'All academic certificates (original & copies)',
          'Govt ID proof',
          'Passport photographs'
        ],
        dressCode: 'Formal',
        isDemoData: true
      },
      {
        id: 'walkin-wip-07',
        companyId: 'wipro',
        companyName: 'Wipro',
        companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=60',
        role: 'Fresher Java Developer Walk-In Interview (Past Session)',
        experience: '0–1 Years',
        minExperienceYears: 0,
        maxExperienceYears: 1,
        location: 'Hyderabad, Telangana',
        city: 'Hyderabad',
        venue: 'Wipro Campus, Survey No. 115/1, ISB Road, Financial District, Gachibowli, Hyderabad, Telangana 500032',
        interviewDate: '2026-08-25',
        dayOfWeek: 'Tuesday',
        startTime: '09:00 AM',
        endTime: '01:00 PM',
        salary: '₹3.8 – 5.0 LPA',
        eligibility: 'B.E/B.Tech/MCA (2024/2025). 60% throughout.',
        skills: ['Java', 'SQL', 'OOPs'],
        registrationRequired: true,
        sourceUrl: 'https://careers.wipro.com/careers-home',
        sourceName: 'Wipro Elite Gateway',
        sourceConfidence: 'OFFICIAL_CAREER_PAGE',
        lastVerifiedAt: '2026-08-25 02:00 PM',
        status: 'EXPIRED',
        openingsCount: 50,
        requiredDocuments: ['Resume', 'ID proof', 'Mark sheets'],
        dressCode: 'Formal',
        isDemoData: true
      }
    ];

    // Seed User Alerts
    this.alerts = [
      {
        id: 'alert-1',
        name: 'Java Pune Fresher',
        keywords: ['Java', 'Spring Boot', 'Hibernate'],
        locations: ['Pune', 'Maharashtra'],
        experienceLevels: ['Fresher', '0–1 years', '0 years'],
        jobCategories: ['Fresher', 'Java', 'Software'],
        sources: ['Naukri', 'LinkedIn', 'COMPANY_PORTAL'],
        channels: ['in_app', 'browser', 'email'],
        active: true,
        createdAt: hoursAgo(48),
        lastTriggeredAt: timeAgo(3),
        matchCount: 14
      },
      {
        id: 'alert-2',
        name: '0-1 Years SDE Bengaluru',
        keywords: ['Software Engineer', 'SDE', 'Associate Software Engineer', 'Java'],
        locations: ['Bengaluru', 'Bangalore'],
        experienceLevels: ['Fresher', '0–1 years'],
        jobCategories: ['Fresher', 'Software'],
        sources: ['COMPANY_PORTAL', 'LINKEDIN'],
        channels: ['in_app', 'browser', 'telegram'],
        active: true,
        createdAt: hoursAgo(24),
        lastTriggeredAt: timeAgo(10),
        matchCount: 9
      },
      {
        id: 'alert-3',
        name: 'All Walk-In Drives (Pune / Mumbai)',
        keywords: ['Walk-in', 'Walkin', 'Drive', 'Java'],
        locations: ['Pune', 'Mumbai', 'Navi Mumbai'],
        experienceLevels: ['Fresher', '0–1 years'],
        jobCategories: ['Fresher', 'Java'],
        sources: ['COMPANY_PORTAL'],
        channels: ['in_app', 'email'],
        active: true,
        createdAt: hoursAgo(72),
        lastTriggeredAt: hoursAgo(2),
        matchCount: 6
      }
    ];

    // Seed Notifications
    this.notifications = [
      {
        id: 'notif-1',
        alertId: 'alert-1',
        jobId: 'job-tcs-001',
        title: '🔥 NEW JAVA FRESHER JOB DETECTED',
        companyName: 'Tata Consultancy Services (TCS)',
        role: 'Java Full Stack Developer (Fresher 2025/2026 Batch)',
        experience: '0–1 Years',
        location: 'Pune, Maharashtra',
        salary: '₹4.5 – 6.5 LPA',
        sourceName: 'TCS iBegin & Naukri',
        jobUrl: 'https://ibegin.tcs.com/iBegin/jobs/TCS-IND-2026-0941',
        detectedAt: timeAgo(4),
        read: false,
        channelsSent: ['In-App Toast', 'Browser Web Notification', 'Email Alert']
      },
      {
        id: 'notif-2',
        alertId: 'alert-2',
        jobId: 'job-acc-002',
        title: '🔥 NEW SOFTWARE ENGINEER OPENING',
        companyName: 'Accenture',
        role: 'Associate Software Engineer - Java & Spring Boot',
        experience: '0–1 Years',
        location: 'Bengaluru, Karnataka',
        salary: '₹5.0 – 7.2 LPA',
        sourceName: 'Accenture Career Gateway',
        jobUrl: 'https://www.accenture.com/in-en/careers/jobdetails?id=ACC-IN-2026-8812',
        detectedAt: timeAgo(11),
        read: false,
        channelsSent: ['In-App Toast', 'Browser Web Notification', 'Telegram Bot']
      },
      {
        id: 'notif-3',
        alertId: 'alert-3',
        jobId: 'job-per-004',
        title: '🟢 PERSISTENT SYSTEMS POSTING DETECTED',
        companyName: 'Persistent Systems',
        role: 'Junior Java Developer (Product Engineering)',
        experience: '0–1 Years',
        location: 'Pune, Maharashtra',
        salary: '₹5.5 – 7.5 LPA',
        sourceName: 'Persistent Systems Talent Portal',
        jobUrl: 'https://www.persistent.com/careers/job-detail/?id=PER-PUN-9920',
        detectedAt: hoursAgo(1),
        read: true,
        channelsSent: ['In-App Toast', 'Email Alert']
      }
    ];

    // Seed Saved Jobs Tracker
    this.savedJobs = [
      {
        id: 'save-1',
        jobId: 'job-tcs-001',
        job: this.jobs[0],
        status: 'Applied',
        notes: 'Applied on TCS iBegin with Resume v3. Awaiting test link for NQT.',
        savedAt: hoursAgo(1),
        updatedAt: hoursAgo(1)
      },
      {
        id: 'save-2',
        jobId: 'job-acc-002',
        job: this.jobs[1],
        status: 'Assessment',
        notes: 'Cognitive & Technical assessment scheduled for this weekend. Practiced Java & pseudocode questions.',
        savedAt: hoursAgo(4),
        updatedAt: hoursAgo(2)
      }
    ];
  }
}

export const db = new InMemoryDB();
