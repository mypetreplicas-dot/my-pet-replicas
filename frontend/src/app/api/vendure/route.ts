import { NextRequest, NextResponse } from 'next/server';

const VENDURE_API = process.env.NEXT_PUBLIC_VENDURE_API_URL || 'http://localhost:3021/shop-api';

export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type') || '';

  // Forward auth header if present
  const headers: Record<string, string> = {};
  const auth = request.headers.get('authorization');
  if (auth) headers['Authorization'] = auth;

  let body: BodyInit;

  if (contentType.includes('multipart/form-data')) {
    // File upload. Forward the raw body as-is with the content-type boundary
    body = await request.arrayBuffer();
    headers['Content-Type'] = contentType;
  } else {
    // Regular JSON GraphQL request
    body = await request.text();
    headers['Content-Type'] = 'application/json';
  }

  const vendureRes = await fetch(VENDURE_API, {
    method: 'POST',
    headers,
    body,
  });

  // Build response, forwarding the vendure-auth-token so the client can capture it
  const resHeaders = new Headers();
  const resContentType = vendureRes.headers.get('content-type');
  if (resContentType) resHeaders.set('content-type', resContentType);

  const vendureToken = vendureRes.headers.get('vendure-auth-token');
  if (vendureToken) resHeaders.set('vendure-auth-token', vendureToken);

  return new NextResponse(vendureRes.body, {
    status: vendureRes.status,
    headers: resHeaders,
  });
}
