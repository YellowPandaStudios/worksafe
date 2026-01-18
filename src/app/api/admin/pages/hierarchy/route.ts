import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getFlatPageList, getPageTree } from '@/lib/page-utils';

/**
 * GET /api/admin/pages/hierarchy
 * Returns page hierarchy data for admin UI
 * Query params:
 *   - format: 'flat' (default) | 'tree'
 *   - exclude: page ID to exclude (for parent selector)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Verify admin access
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'flat';
  const excludeId = searchParams.get('exclude') || undefined;

  try {
    if (format === 'tree') {
      const tree = await getPageTree();
      return NextResponse.json(tree);
    }

    const flatList = await getFlatPageList(excludeId);
    return NextResponse.json(flatList);
  } catch (error) {
    console.error('Failed to fetch page hierarchy:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page hierarchy' },
      { status: 500 }
    );
  }
}
