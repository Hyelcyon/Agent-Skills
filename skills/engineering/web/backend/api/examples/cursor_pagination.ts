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

const MAX_PAGE_SIZE = 100;

function encodeCursor(cursor: PageCursor): string {
  if (!cursor.id || Number.isNaN(Date.parse(cursor.createdAt))) {
    throw new RangeError('Cursor requires a valid timestamp and non-empty id');
  }
  const json = JSON.stringify({ createdAt: cursor.createdAt, id: cursor.id });
  return Buffer.from(json, 'utf8').toString('base64url');
}

function decodeCursor(encodedCursor: string): PageCursor {
  if (!encodedCursor || !/^[A-Za-z0-9_-]+$/.test(encodedCursor)) {
    throw new Error('Malformed pagination cursor');
  }

  let parsed: unknown;
  try {
    const raw = Buffer.from(encodedCursor, 'base64url').toString('utf8');
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Malformed pagination cursor');
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    typeof (parsed as Record<string, unknown>).createdAt !== 'string' ||
    typeof (parsed as Record<string, unknown>).id !== 'string'
  ) {
    throw new Error('Invalid cursor shape');
  }

  const { createdAt, id } = parsed as PageCursor;
  if (!id || Number.isNaN(Date.parse(createdAt))) {
    throw new Error('Invalid cursor values');
  }

  return { createdAt, id };
}

function buildPaginatedResponse<T extends ItemWithTimestamp>(
  rows: T[],
  pageSize: number
): PaginatedResult<T> {
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
    throw new RangeError(`pageSize must be an integer between 1 and ${MAX_PAGE_SIZE}`);
  }

  const hasMore = rows.length > pageSize;
  const items = hasMore ? rows.slice(0, pageSize) : rows;

  let nextCursor: string | null = null;
  const lastItem = hasMore ? items[items.length - 1] : undefined;
  if (lastItem) {
    if (Number.isNaN(lastItem.createdAt.getTime())) {
      throw new RangeError('Item createdAt must be a valid Date');
    }
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

export { encodeCursor, decodeCursor, buildPaginatedResponse, MAX_PAGE_SIZE };
export type { PageCursor, PaginatedResult, ItemWithTimestamp };
