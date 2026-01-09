import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyConnection() {
  try {
    console.log('🔍 Verifying database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Check tables
    const userCount = await prisma.user.count();
    const taskCount = await prisma.task.count();
    
    console.log(`📊 Database Status:`);
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Tasks: ${taskCount}`);
    
    // List all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true
      }
    });
    
    if (users.length > 0) {
      console.log(`\n👥 Users in database:`);
      users.forEach(user => {
        console.log(`   - ${user.username} (${user.role}) - Created: ${user.createdAt.toISOString().split('T')[0]}`);
      });
    } else {
      console.log(`\n📝 No users found - ready for first registration`);
    }
    
    await prisma.$disconnect();
    console.log('\n✅ Verification complete!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

verifyConnection();
