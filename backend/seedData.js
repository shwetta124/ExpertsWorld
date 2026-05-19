process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// ── Connect directly here (not via connectDB) ────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    seed();
  })
  .catch((err) => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });

// ── Seed function ─────────────────────────────────────────
const seed = async () => {
  try {
    const User   = require('./models/User');
    const Expert = require('./models/Expert');

    // Clear old data
    await Expert.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Cleared old data');

    // Hash passwords
    const salt     = await bcrypt.genSalt(12);
    const password = await bcrypt.hash('Test@1234', salt);
    const adminPwd = await bcrypt.hash('Admin@1234', salt);

    // Create users
    const users = await User.insertMany([
      { name: 'Arjun Sharma', email: 'arjun@test.com',           password, role: 'expert', isEmailVerified: true },
      { name: 'Priya Nair',   email: 'priya@test.com',           password, role: 'expert', isEmailVerified: true },
      { name: 'Vikram Menon', email: 'vikram@test.com',          password, role: 'expert', isEmailVerified: true },
      { name: 'Neha Gupta',   email: 'neha@test.com',            password, role: 'expert', isEmailVerified: true },
      { name: 'Ravi Teja',    email: 'ravi@test.com',            password, role: 'expert', isEmailVerified: true },
      { name: 'Anjali Singh', email: 'anjali@test.com',          password, role: 'expert', isEmailVerified: true },
      { name: 'Admin User',   email: 'admin@expertsworld.com',   password: adminPwd, role: 'admin', isEmailVerified: true },
      { name: 'Test User',    email: 'user@test.com',            password, role: 'user',   isEmailVerified: true },
    ]);
    console.log(`✅ Created ${users.length} users`);

    // Create experts
    const experts = await Expert.insertMany([
      {
        user: users[0]._id, name: 'Arjun Sharma',
        role: 'MERN Stack Developer',
        about: 'Full-stack developer with 6 years building scalable React & Node.js apps.',
        category: 'dev', tags: ['React', 'Node.js', 'MongoDB', 'Express'],
        experience: '6 years', price: 599, rating: 4.9, sessions: 320,
        isApproved: true, isOnline: true,
        location: 'Bangalore, India', languages: ['English', 'Hindi'],
      },
      {
        user: users[1]._id, name: 'Priya Nair',
        role: 'UI/UX Designer',
        about: 'Senior designer expert in Figma, user research, and design systems.',
        category: 'design', tags: ['Figma', 'Prototyping', 'Design Systems', 'UX Research'],
        experience: '5 years', price: 499, rating: 4.8, sessions: 210,
        isApproved: true, isOnline: true,
        location: 'Pune, India', languages: ['English', 'Malayalam'],
      },
      {
        user: users[2]._id, name: 'Vikram Menon',
        role: 'Blockchain Developer',
        about: 'Built 10+ dApps on Ethereum & Polygon. Expert in smart contracts.',
        category: 'blockchain', tags: ['Solidity', 'Web3.js', 'Ethereum', 'DeFi'],
        experience: '4 years', price: 799, rating: 4.9, sessions: 180,
        isApproved: true, isOnline: false,
        location: 'Hyderabad, India', languages: ['English'],
      },
      {
        user: users[3]._id, name: 'Neha Gupta',
        role: 'DSA & CP Expert',
        about: 'Cracked FAANG interviews twice. Placed 200+ students in top companies.',
        category: 'dsa', tags: ['LeetCode', 'Interview Prep', 'Java', 'Algorithms'],
        experience: '7 years', price: 399, rating: 5.0, sessions: 450,
        isApproved: true, isOnline: true,
        location: 'Delhi, India', languages: ['English', 'Hindi'],
      },
      {
        user: users[4]._id, name: 'Ravi Teja',
        role: 'System Design Lead',
        about: 'Staff engineer teaching scalable architecture patterns used in production.',
        category: 'system', tags: ['HLD', 'LLD', 'Scalability', 'Microservices'],
        experience: '9 years', price: 899, rating: 4.8, sessions: 290,
        isApproved: true, isOnline: true,
        location: 'Chennai, India', languages: ['English', 'Telugu'],
      },
      {
        user: users[5]._id, name: 'Anjali Singh',
        role: 'AI/ML Engineer',
        about: 'Research engineer working on LLMs and RAG systems.',
        category: 'ai', tags: ['Python', 'TensorFlow', 'LLMs', 'RAG'],
        experience: '4 years', price: 699, rating: 4.7, sessions: 160,
        isApproved: true, isOnline: false,
        location: 'Pune, India', languages: ['English', 'Hindi'],
      },
    ]);
    console.log(`✅ Created ${experts.length} experts`);

    console.log('\n─────────────────────────────────────────');
    console.log('🔑 Login credentials:');
    console.log('─────────────────────────────────────────');
    console.log('👤 User:   user@test.com           / Test@1234');
    console.log('🧑‍💼 Expert: arjun@test.com         / Test@1234');
    console.log('🔐 Admin:  admin@expertsworld.com  / Admin@1234');
    console.log('─────────────────────────────────────────\n');

    await mongoose.disconnect();
    console.log('✅ Done! Database disconnected.');
    process.exit(0);

  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};