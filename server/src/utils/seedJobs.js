const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Job = require('../models/Job');
const { normalizeSkills } = require('../services/skillExtractor');

const sampleJobs = [
  {
    title: 'Senior MERN Stack Developer',
    company: 'TechWave Solutions',
    description: 'We are seeking a senior full-stack developer experienced in building scalable enterprise web applications using MongoDB, Express.js, React, and Node.js. Experience with Docker containerization, REST API design, and Redis caching is preferred.',
    requiredSkills: ['react', 'node.js', 'express.js', 'mongodb', 'docker', 'redis', 'javascript'],
    minExperience: 3,
    maxExperience: 7,
    location: 'Bangalore',
    jobType: 'Hybrid',
    salaryRange: { min: 1400000, max: 2400000, currency: 'INR' },
  },
  {
    title: 'Junior React Frontend Engineer',
    company: 'InnoApp Labs',
    description: 'Looking for a passionate React frontend developer with hands-on proficiency in React, JavaScript (ES6+), Tailwind CSS, Redux Toolkit, and HTML5. Fresher or 1 year experience welcome.',
    requiredSkills: ['react', 'javascript', 'tailwind', 'redux', 'html5', 'css3', 'git'],
    minExperience: 0,
    maxExperience: 2,
    location: 'Remote',
    jobType: 'Remote',
    salaryRange: { min: 500000, max: 900000, currency: 'INR' },
  },
  {
    title: 'Backend Node.js & Microservices Engineer',
    company: 'FinSecure Technologies',
    description: 'Design and implement high-performance, fault-tolerant microservices using Node.js, Express, PostgreSQL, Redis, and Docker. Experience with JWT auth and REST APIs required.',
    requiredSkills: ['node.js', 'express.js', 'postgresql', 'redis', 'docker', 'microservices', 'jwt'],
    minExperience: 2,
    maxExperience: 5,
    location: 'Hyderabad',
    jobType: 'Hybrid',
    salaryRange: { min: 1100000, max: 1900000, currency: 'INR' },
  },
  {
    title: 'Python Full Stack Developer',
    company: 'DataPulse Corp',
    description: 'Responsible for building end-to-end data analytics web portals with Python, Django, PostgreSQL, and React on the frontend. Knowledge of Docker and REST APIs is essential.',
    requiredSkills: ['python', 'django', 'react', 'postgresql', 'docker', 'rest_api', 'git'],
    minExperience: 2,
    maxExperience: 6,
    location: 'Pune',
    jobType: 'Onsite',
    salaryRange: { min: 1000000, max: 1800000, currency: 'INR' },
  },
  {
    title: 'Cloud DevOps & Infrastructure Engineer',
    company: 'CloudMatrix Global',
    description: 'Manage production cloud infrastructure across AWS, Docker, Kubernetes, CI/CD pipelines with GitHub Actions, Linux administration, and Nginx reverse proxies.',
    requiredSkills: ['aws', 'docker', 'kubernetes', 'cicd', 'linux', 'nginx', 'git'],
    minExperience: 3,
    maxExperience: 8,
    location: 'Bangalore',
    jobType: 'Remote',
    salaryRange: { min: 1500000, max: 2800000, currency: 'INR' },
  },
  {
    title: 'Full Stack JavaScript Engineer',
    company: 'NextGen Ventures',
    description: 'Build fast, responsive web applications using Next.js, React, Node.js, TypeScript, and MongoDB. Experience in Tailwind CSS and Git workflow required.',
    requiredSkills: ['react', 'next.js', 'typescript', 'node.js', 'mongodb', 'tailwind', 'git'],
    minExperience: 1,
    maxExperience: 4,
    location: 'Noida',
    jobType: 'Hybrid',
    salaryRange: { min: 800000, max: 1500000, currency: 'INR' },
  },
  {
    title: 'Data Scientist & NLP Specialist',
    company: 'Cognitive AI Research',
    description: 'Build NLP algorithms, text preprocessing pipelines, TF-IDF vectorizers, and sentiment classifiers using Python, Pandas, NumPy, Scikit-Learn, and PyTorch.',
    requiredSkills: ['python', 'nlp', 'machine_learning', 'scikit_learn', 'pandas', 'numpy', 'pytorch'],
    minExperience: 2,
    maxExperience: 5,
    location: 'Bangalore',
    jobType: 'Remote',
    salaryRange: { min: 1300000, max: 2200000, currency: 'INR' },
  },
  {
    title: 'Java Spring Boot Enterprise Developer',
    company: 'LegacyCore Financial',
    description: 'Build secure, scalable banking APIs and backend workflows using Core Java, Spring Boot, MySQL, Microservices, and Docker.',
    requiredSkills: ['java', 'spring boot', 'mysql', 'microservices', 'docker', 'rest_api'],
    minExperience: 3,
    maxExperience: 7,
    location: 'Mumbai',
    jobType: 'Onsite',
    salaryRange: { min: 1200000, max: 2100000, currency: 'INR' },
  },
  {
    title: 'Associate Software Engineer (Freshers)',
    company: 'Zeta Innovations',
    description: 'Entry-level opening for graduates with strong fundamentals in JavaScript or Python, HTML5, CSS3, SQL databases, and problem-solving.',
    requiredSkills: ['javascript', 'html5', 'css3', 'mysql', 'git'],
    minExperience: 0,
    maxExperience: 1,
    location: 'Gurgaon',
    jobType: 'Onsite',
    salaryRange: { min: 450000, max: 700000, currency: 'INR' },
  },
  {
    title: 'Lead Full Stack Architect',
    company: 'HyperScale Systems',
    description: 'Architecting high-scale distributed systems with React, Node.js, Kubernetes, AWS, Redis, GraphQL, and microservice patterns.',
    requiredSkills: ['react', 'node.js', 'kubernetes', 'aws', 'redis', 'graphql', 'microservices', 'typescript'],
    minExperience: 6,
    maxExperience: 12,
    location: 'Bangalore',
    jobType: 'Remote',
    salaryRange: { min: 3000000, max: 5000000, currency: 'INR' },
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('[Seeder]: Preparing admin user...');
    let admin = await User.findOne({ email: 'admin@aijobmatch.com' });

    if (!admin) {
      admin = await User.create({
        name: 'System Administrator',
        email: 'admin@aijobmatch.com',
        password: 'AdminPassword123!',
        role: 'admin',
      });
      console.log('[Seeder]: Created default Admin account: admin@aijobmatch.com / AdminPassword123!');
    }

    // Clear existing jobs to ensure clean slate
    await Job.deleteMany({});
    console.log('[Seeder]: Cleared existing jobs.');

    // Normalize skills and attach admin user ID
    const jobsWithAdmin = sampleJobs.map((job) => ({
      ...job,
      requiredSkills: normalizeSkills(job.requiredSkills),
      postedBy: admin._id,
    }));

    const insertedJobs = await Job.insertMany(jobsWithAdmin);
    console.log(`[Seeder]: Successfully inserted ${insertedJobs.length} realistic jobs into MongoDB!`);

    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Error]: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
