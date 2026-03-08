import { NextRequest, NextResponse } from 'next/server';

const VENDURE_BASE = (process.env.NEXT_PUBLIC_VENDURE_API_URL || 'http://localhost:3021/shop-api')
  .replace('/shop-api', '');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const assetPath = path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${VENDURE_BASE}/assets/${assetPath}${searchParams ? `?${searchParams}` : ''}`;

  const response = await fetch(url);

  if (!response.ok) {
    return new NextResponse(null, { status: response.status });
  }

  const headers = new Headers();
  const contentType = response.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  headers.set('cache-control', 'public, max-age=31536000, immutable');

  return new NextResponse(response.body, { status: 200, headers });
}
