interface PageCursor {
  createdAt: string;
  id: string;
}

interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface ItemWithTimestamp {
  id: string;
  createdAt: Date;
}

function encodeCursor(cursor: PageCursor): string {
  const json = JSON.stringify(cursor);
  return Buffer.from(json, 'utf8').toString('base64url');
}

function decodeCursor(encodedCursor: string): PageCursor {
  try {
    const raw = Buffer.from(encodedCursor, 'base64url').toString('utf8');
    const parsed = JSON.parse(raw);
    if (typeof parsed?.createdAt === 'string' && typeof parsed?.id === 'string') {
      return parsed as PageCursor;
    }
    throw new Error('Invalid cursor shape');
  } catch (err) {
    throw new Error('Malformed pagination cursor');
  }
}

function buildPaginatedResponse<T extends ItemWithTimestamp>(
  rows: T[],
  pageSize: number
): PaginatedResult<T> {
  const hasMore = rows.length > pageSize;
  const items = hasMore ? rows.slice(0, pageSize) : rows;

  let nextCursor: string | null = null;
  if (hasMore && items.length > 0) {
    const lastItem = items[items.length - 1];
    nextCursor = encodeCursor({
      createdAt: lastItem.createdAt.toISOString(),
      id: lastItem.id
    });
  }

  return {
    items,
    nextCursor,
    hasMore
  };
}

export { encodeCursor, decodeCursor, buildPaginatedResponse };
export type { PageCursor, PaginatedResult, ItemWithTimestamp };
