import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    const currentLikes = (project.caseStudy && project.caseStudy.likes) || 0;
    
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { 
        $set: { 
          'caseStudy.likes': currentLikes + 1 
        } 
      },
      { new: true }
    );

    return NextResponse.json({ success: true, likes: updatedProject.caseStudy.likes });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
