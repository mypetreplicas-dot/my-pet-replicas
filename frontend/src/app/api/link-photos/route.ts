import { NextRequest, NextResponse } from 'next/server';

const ADMIN_API = process.env.NEXT_PUBLIC_VENDURE_API_URL?.replace('/shop-api', '/admin-api') || 'http://localhost:3021/admin-api';

export async function POST(request: NextRequest) {
  try {
    const { orderLineId, petPhotosIds } = await request.json();

    if (!orderLineId || !petPhotosIds?.length) {
      return NextResponse.json({ error: 'Missing orderLineId or petPhotosIds' }, { status: 400 });
    }

    // Login to admin API
    const loginResponse = await fetch(ADMIN_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `mutation { login(username: "${process.env.VENDURE_SUPERADMIN_USERNAME}", password: "${process.env.VENDURE_SUPERADMIN_PASSWORD}") { ... on CurrentUser { id identifier } } }`,
      }),
    });

    const loginCookie = loginResponse.headers.get('set-cookie')?.split(';')[0] || '';
    if (!loginCookie) {
      throw new Error('Failed to authenticate');
    }

    // Set petPhotos on the order line via Admin API
    const response = await fetch(ADMIN_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cookie': loginCookie,
      },
      body: JSON.stringify({
        query: `
          mutation SetOrderLinePhotos($orderLineId: ID!, $customFields: OrderLineCustomFieldsInput!) {
            setOrderLineCustomFields(orderLineId: $orderLineId, customFields: $customFields) {
              ... on Order { id }
              ... on ErrorResult { errorCode message }
            }
          }
        `,
        variables: {
          orderLineId,
          customFields: {
            petPhotosIds,
          },
        },
      }),
    });

    const data = await response.json();
    if (data.errors) {
      console.error('Link photos errors:', data.errors);
      throw new Error('Failed to link photos to order line');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Link photos error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to link photos' },
      { status: 500 },
    );
  }
}
