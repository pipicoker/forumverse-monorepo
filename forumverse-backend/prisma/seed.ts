import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash the demo password
  const hashedPassword = await bcrypt.hash('sophia123', 12);

  // Create or update the demo user
  const user = await prisma.user.upsert({
    where: { email: 'sarahekere79@gmail.com' },
    update: {
      emailVerified: true, // Make sure email is verified
    },
    create: {
      email: 'sarahekere79@gmail.com',
      username: 'coker',
      password: hashedPassword,
      emailVerified: true,
      role: 'USER',
      reputation: 0,
    },
  });

  console.log('✅ Demo user created/updated:', {
    id: user.id,
    email: user.email,
    username: user.username,
    emailVerified: user.emailVerified,
  });

  // Create a sample post (optional)
  const post = await prisma.post.create({
    data: {
      title: 'Welcome to ForumVerse!',
      content: 'This is a sample post to help you get started. Feel free to create your own posts!',
      excerpt: 'This is a sample post to help you get started...',
      authorId: user.id,
    },
  });

  console.log('✅ Sample post created:', post.title);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

