import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      application: 'devops-cicd-dashboard',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    }
  );
}

