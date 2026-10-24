import { getPublicProjects } from '@/lib/actions/projectsApi';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');
    const search = searchParams.get('search') || undefined;
    const client = searchParams.get('client') || undefined;
    const services = searchParams.getAll('services');
    const technologies = searchParams.getAll('technologies');
    const tags = searchParams.getAll('tags');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const result = await getPublicProjects({
      page,
      limit,
      search: search || undefined,
      client: client || undefined,
      services: services.length > 0 ? services : undefined,
      technologies: technologies.length > 0 ? technologies : undefined,
      tags: tags.length > 0 ? tags : undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
    });

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}