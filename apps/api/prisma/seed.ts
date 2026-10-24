import { PrismaClient } from "./generated/client";
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

//@ts-ignore
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed...');

  const projectsPath = path.join(__dirname, '../../../frontend.shifaul.dev/public/data/projects.json');
  const blogpostsPath = path.join(__dirname, '../../../frontend.shifaul.dev/public/data/blogposts.json');

  console.log(`Reading projects from: ${projectsPath}`);
  console.log(`Reading blogposts from: ${blogpostsPath}`);

  let projectsData: any[] = [];
  let blogpostsData: any[] = [];

  try {
    const projectsFile = fs.readFileSync(projectsPath, 'utf-8');
    projectsData = JSON.parse(projectsFile).data;
    console.log(`Loaded ${projectsData.length} projects.`);
  } catch (error) {
    console.error(`Failed to read projects file:`, error);
  }

  try {
    const blogpostsFile = fs.readFileSync(blogpostsPath, 'utf-8');
    blogpostsData = JSON.parse(blogpostsFile).data;
    console.log(`Loaded ${blogpostsData.length} blog posts.`);
  } catch (error) {
    console.error(`Failed to read blog posts file:`, error);
  }

  // Seed Projects
  for (const project of projectsData) {
    const { tags, _count, github, ...rest } = project;
    
    const tagConnects: { id: string }[] = [];
    if (tags && Array.isArray(tags)) {
      for (const t of tags) {
        const dbTag = await prisma.tag.upsert({
          where: { name: t.name },
          update: {},
          create: { name: t.name },
        });
        tagConnects.push({ id: dbTag.id });
      }
    }

    await prisma.project.upsert({
      where: { slug: rest.slug },
      update: {
        ...rest,
        website: rest.website || "",
        tags: {
          connect: tagConnects,
        },
      },
      create: {
        ...rest,
        website: rest.website || "",
        tags: {
          connect: tagConnects,
        },
      },
    });
    console.log(`Seeded project: ${rest.title}`);
  }

  // Seed Blog Posts
  for (const post of blogpostsData) {
    const { tags, _count, ...rest } = post;

    const tagConnects: { id: string }[] = [];
    if (tags && Array.isArray(tags)) {
      for (const t of tags) {
        const dbTag = await prisma.tag.upsert({
          where: { name: t.name },
          update: {},
          create: { name: t.name },
        });
        tagConnects.push({ id: dbTag.id });
      }
    }

    await prisma.blogPost.upsert({
      where: { slug: rest.slug },
      update: {
        ...rest,
        tags: {
          connect: tagConnects,
        },
      },
      create: {
        ...rest,
        tags: {
          connect: tagConnects,
        },
      },
    });
    console.log(`Seeded blog post: ${rest.title}`);
  }

  console.log('Seed completed successfully.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
