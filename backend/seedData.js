// 📁 FILE: backend/seedData.js

// Fix SSL BEFORE anything else
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// ── Models ────────────────────────────────────────────────────
const User   = require('./models/User');
const Expert = require('./models/Expert');

// ── Connect and seed ──────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS:          45000,
  family:                   4,
})
.then(async () => {
  console.log('✅ MongoDB Connected');
  await seed();
  process.exit(0);
})
.catch(err => {
  console.error('❌ Connection failed:', err.message);
  process.exit(1);
});

async function seed() {
  try {
    console.log('🌱 Starting seed...');

    // Clear existing data
    await User.deleteMany({});
    await Expert.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // ── Create Users ──────────────────────────────────────────
    const salt = await bcrypt.genSalt(10);

    const adminUser = await User.create({
      name:            'Admin User',
      email:           'admin@expertsworld.com',
      password:        await bcrypt.hash('Admin@1234', salt),
      role:            'admin',
      isEmailVerified: true,
    });

    const regularUser = await User.create({
      name:            'Test User',
      email:           'user@test.com',
      password:        await bcrypt.hash('Test@1234', salt),
      role:            'user',
      isEmailVerified: true,
    });

    // Expert users
    const expertUsers = await User.insertMany([
      { name: 'Arjun Sharma',   email: 'arjun@test.com',   password: await bcrypt.hash('Test@1234', salt), role: 'expert', isEmailVerified: true },
      { name: 'Priya Mehta',    email: 'priya@test.com',   password: await bcrypt.hash('Test@1234', salt), role: 'expert', isEmailVerified: true },
      { name: 'Rahul Kumar',    email: 'rahul@test.com',   password: await bcrypt.hash('Test@1234', salt), role: 'expert', isEmailVerified: true },
      { name: 'Sneha Patel',    email: 'sneha@test.com',   password: await bcrypt.hash('Test@1234', salt), role: 'expert', isEmailVerified: true },
      { name: 'Vikram Singh',   email: 'vikram@test.com',  password: await bcrypt.hash('Test@1234', salt), role: 'expert', isEmailVerified: true },
      { name: 'Ananya Reddy',   email: 'ananya@test.com',  password: await bcrypt.hash('Test@1234', salt), role: 'expert', isEmailVerified: true },
    ]);

    console.log('✅ Created users');

    // ── Create Expert Profiles ────────────────────────────────
    const experts = [
      {
        user:       expertUsers[0]._id,
        name:       'Arjun Sharma',
        role:       'Full Stack Developer',
        category:   'dev',
        about:      'Senior full stack developer with 8+ years experience in React, Node.js, and cloud technologies. Helped 500+ developers solve complex problems.',
        tags:       ['React', 'Node.js', 'MongoDB', 'AWS', 'TypeScript'],
        experience: '8 years',
        price:      899,
        rating:     4.9,
        sessions:   1240,
        isOnline:   true,
        isApproved: true,
        location:   'Mumbai, Maharashtra',
        languages:  ['English', 'Hindi'],
        reviews: [
          { userName: 'Test User', rating: 5, text: 'Excellent session! Very helpful.' },
          { userName: 'Rahul K',   rating: 5, text: 'Great explanation of concepts.' },
        ],
      },
      {
        user:       expertUsers[1]._id,
        name:       'Priya Mehta',
        role:       'UI/UX Designer',
        category:   'design',
        about:      'Creative UI/UX designer with 6 years of experience. Specialist in Figma, design systems, and user research for mobile and web applications.',
        tags:       ['Figma', 'UI/UX', 'Prototyping', 'Design Systems', 'Adobe XD'],
        experience: '6 years',
        price:      749,
        rating:     4.8,
        sessions:   876,
        isOnline:   true,
        isApproved: true,
        location:   'Bangalore, Karnataka',
        languages:  ['English', 'Hindi', 'Gujarati'],
        reviews: [
          { userName: 'Sneha P', rating: 5, text: 'Amazing design insights!' },
        ],
      },
      {
        user:       expertUsers[2]._id,
        name:       'Rahul Kumar',
        role:       'Blockchain Developer',
        category:   'blockchain',
        about:      'Blockchain expert specializing in Ethereum, Solidity, and DeFi protocols. Experience with Hyperledger Fabric and Stellar.',
        tags:       ['Ethereum', 'Solidity', 'Web3.js', 'DeFi', 'Smart Contracts'],
        experience: '5 years',
        price:      1199,
        rating:     4.7,
        sessions:   543,
        isOnline:   false,
        isApproved: true,
        location:   'Pune, Maharashtra',
        languages:  ['English', 'Hindi'],
        reviews: [
          { userName: 'Arjun S', rating: 5, text: 'Best blockchain session ever!' },
        ],
      },
      {
        user:       expertUsers[3]._id,
        name:       'Sneha Patel',
        role:       'DSA & Competitive Programming',
        category:   'dsa',
        about:      'Competitive programmer with expertise in algorithms and data structures. Solved 2000+ problems on LeetCode and Codeforces.',
        tags:       ['Data Structures', 'Algorithms', 'LeetCode', 'Dynamic Programming', 'Graphs'],
        experience: '4 years',
        price:      699,
        rating:     4.9,
        sessions:   2100,
        isOnline:   true,
        isApproved: true,
        location:   'Ahmedabad, Gujarat',
        languages:  ['English', 'Hindi', 'Gujarati'],
        reviews: [
          { userName: 'Test User', rating: 5, text: 'Explained DP so clearly!' },
        ],
      },
      {
        user:       expertUsers[4]._id,
        name:       'Vikram Singh',
        role:       'System Design Expert',
        category:   'system',
        about:      'Principal engineer with 10+ years designing large-scale distributed systems. Previously at Amazon and Microsoft.',
        tags:       ['System Design', 'Microservices', 'Kubernetes', 'Redis', 'Kafka'],
        experience: '10 years',
        price:      1499,
        rating:     4.8,
        sessions:   734,
        isOnline:   true,
        isApproved: true,
        location:   'Hyderabad, Telangana',
        languages:  ['English', 'Hindi'],
        reviews: [
          { userName: 'Priya M', rating: 5, text: 'Best system design mentor!' },
        ],
      },
      {
        user:       expertUsers[5]._id,
        name:       'Ananya Reddy',
        role:       'AI / ML Engineer',
        category:   'ai',
        about:      'Machine learning engineer specializing in NLP, computer vision, and LLMs. PhD in Computer Science from IIT Bombay.',
        tags:       ['Python', 'TensorFlow', 'PyTorch', 'NLP', 'LLMs'],
        experience: '7 years',
        price:      999,
        rating:     4.9,
        sessions:   421,
        isOnline:   false,
        isApproved: true,
        location:   'Chennai, Tamil Nadu',
        languages:  ['English', 'Telugu', 'Tamil'],
        reviews: [
          { userName: 'Vikram S', rating: 5, text: 'Brilliant AI expert!' },
        ],
      },
    ];

    await Expert.insertMany(experts);
    console.log('✅ Created 6 experts');

    // ── Summary ───────────────────────────────────────────────
    console.log('\n🎉 Seed completed successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 User:   user@test.com         / Test@1234');
    console.log('🧑‍💼 Expert: arjun@test.com        / Test@1234');
    console.log('🔐 Admin:  admin@expertsworld.com / Admin@1234');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    throw err;
  }
}