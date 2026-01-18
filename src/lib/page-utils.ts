import { prisma } from '@/lib/prisma';

export interface PageTreeNode {
  id: string;
  title: string;
  slug: string;
  path: string | null;
  status: string;
  sortOrder: number;
  children: PageTreeNode[];
}

export interface FlatPageItem {
  id: string;
  title: string;
  slug: string;
  path: string | null;
  depth: number;
}

/**
 * Generate full path from page's slug chain
 * e.g., "teamet" with parent "om-oss" -> "/om-oss/teamet"
 */
export async function generatePagePath(page: {
  slug: string;
  parentId: string | null;
}): Promise<string> {
  if (!page.parentId) {
    return `/${page.slug}`;
  }

  const parent = await prisma.page.findUnique({
    where: { id: page.parentId },
    select: { path: true },
  });

  return `${parent?.path || ''}/${page.slug}`;
}

/**
 * Update paths for a page and all its descendants when parent changes
 */
export async function updateDescendantPaths(pageId: string): Promise<void> {
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: {
      id: true,
      slug: true,
      parentId: true,
      children: {
        select: { id: true },
      },
    },
  });

  if (!page) return;

  // Generate new path for this page
  const newPath = await generatePagePath({ slug: page.slug, parentId: page.parentId });

  // Update this page's path
  await prisma.page.update({
    where: { id: pageId },
    data: { path: newPath },
  });

  // Recursively update all children
  for (const child of page.children) {
    await updateDescendantPaths(child.id);
  }
}

/**
 * Update path for a single page (call this when creating/updating)
 */
export async function updatePagePath(pageId: string): Promise<string> {
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: { slug: true, parentId: true },
  });

  if (!page) throw new Error('Page not found');

  const path = await generatePagePath(page);

  await prisma.page.update({
    where: { id: pageId },
    data: { path },
  });

  return path;
}

/**
 * Build page tree for admin UI
 * Returns nested structure for tree display
 */
export async function getPageTree(): Promise<PageTreeNode[]> {
  const pages = await prisma.page.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      path: true,
      status: true,
      sortOrder: true,
      parentId: true,
    },
    orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
  });

  // Build tree structure
  const pageMap = new Map<string, PageTreeNode>();
  const rootNodes: PageTreeNode[] = [];

  // First pass: create all nodes
  for (const page of pages) {
    pageMap.set(page.id, {
      id: page.id,
      title: page.title,
      slug: page.slug,
      path: page.path,
      status: page.status,
      sortOrder: page.sortOrder,
      children: [],
    });
  }

  // Second pass: build hierarchy
  for (const page of pages) {
    const node = pageMap.get(page.id)!;
    if (page.parentId) {
      const parent = pageMap.get(page.parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        rootNodes.push(node);
      }
    } else {
      rootNodes.push(node);
    }
  }

  return rootNodes;
}

/**
 * Build flat list with indentation for parent selector
 * Returns: [{ id, title, depth }] where depth controls "— " prefixes
 * WordPress-style flat list with indentation
 */
export async function getFlatPageList(excludeId?: string): Promise<FlatPageItem[]> {
  const tree = await getPageTree();
  const result: FlatPageItem[] = [];

  function flatten(nodes: PageTreeNode[], depth: number) {
    for (const node of nodes) {
      // Skip the excluded ID (to prevent a page being its own parent)
      if (node.id !== excludeId) {
        result.push({
          id: node.id,
          title: node.title,
          slug: node.slug,
          path: node.path,
          depth,
        });
        flatten(node.children, depth + 1);
      }
    }
  }

  flatten(tree, 0);
  return result;
}

/**
 * Get next sort order for a given parent
 */
export async function getNextSortOrder(parentId: string | null): Promise<number> {
  const lastSibling = await prisma.page.findFirst({
    where: { parentId },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true },
  });

  return (lastSibling?.sortOrder ?? -1) + 1;
}

/**
 * Reorder pages within a parent
 */
export async function reorderPages(
  parentId: string | null,
  orderedIds: string[]
): Promise<void> {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.page.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );
}

/**
 * Validate that setting parentId won't create a circular reference
 */
export async function validateParentId(
  pageId: string,
  newParentId: string | null
): Promise<boolean> {
  if (!newParentId) return true; // No parent is always valid
  if (pageId === newParentId) return false; // Can't be own parent

  // Check if newParentId is a descendant of pageId
  let currentId: string | null = newParentId;
  while (currentId) {
    const pageRecord: { parentId: string | null } | null = await prisma.page.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    });

    if (!pageRecord) break;
    if (pageRecord.parentId === pageId) return false; // Would create cycle
    currentId = pageRecord.parentId;
  }

  return true;
}
