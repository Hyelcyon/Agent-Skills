'use server';

import { cookies } from 'next/headers';
import { revalidatePath, revalidateTag } from 'next/cache';

const TENANT_ID_PATTERN = /^[a-z0-9_-]{1,64}$/;

interface MutationResult {
  success: boolean;
  message?: string;
  error?: string;
}

interface VerifiedSession {
  userId: string;
  accessToken: string;
  authorizedTenantIds: readonly string[];
}

async function verifySessionAndTenant(
  sessionToken: string,
  tenantId: string
): Promise<VerifiedSession | null> {
  // Replace with real cryptographic JWT/session verification and tenant ACL lookup
  if (!sessionToken || !TENANT_ID_PATTERN.test(tenantId)) {
    return null;
  }
  return {
    userId: 'verified-user',
    accessToken: sessionToken,
    authorizedTenantIds: [tenantId]
  };
}

export async function createTenantProject(
  _prevState: MutationResult,
  formData: FormData
): Promise<MutationResult> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('tenant_auth')?.value;

  if (!sessionToken) {
    return {
      success: false,
      error: 'Authentication session expired. Please sign in.'
    };
  }

  const rawTenantId = cookieStore.get('active_tenant')?.value;
  if (!rawTenantId || !TENANT_ID_PATTERN.test(rawTenantId)) {
    return {
      success: false,
      error: 'Valid active tenant selection is required.'
    };
  }

  const session = await verifySessionAndTenant(sessionToken, rawTenantId);
  if (!session || !session.authorizedTenantIds.includes(rawTenantId)) {
    return {
      success: false,
      error: 'Forbidden: caller lacks access to the requested tenant.'
    };
  }

  const rawTitle = formData.get('title');
  if (typeof rawTitle !== 'string' || rawTitle.trim().length === 0) {
    return {
      success: false,
      error: 'Project title cannot be empty.'
    };
  }

  const sanitizedTitle = rawTitle.trim();
  if (sanitizedTitle.length > 80) {
    return {
      success: false,
      error: 'Project title cannot exceed 80 characters.'
    };
  }

  const tenantId = encodeURIComponent(rawTenantId);

  try {
    const response = await fetch(`https://api.internal/tenants/${tenantId}/projects`, {
      method: 'POST',
      signal: AbortSignal.timeout(5000),
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: sanitizedTitle, actorUserId: session.userId })
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Unable to create project (HTTP ${response.status}).`
      };
    }

    revalidateTag(`projects:${tenantId}`);
    revalidatePath(`/tenants/${tenantId}/projects`);

    return {
      success: true,
      message: `Project "${sanitizedTitle}" created successfully.`
    };
  } catch (err) {
    console.error('[createTenantProject] upstream error:', err);
    return {
      success: false,
      error: 'Network failure during project creation. Please retry.'
    };
  }
}
