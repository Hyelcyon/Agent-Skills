'use server';

import { cookies } from 'next/headers';
import { revalidatePath, revalidateTag } from 'next/cache';

interface MutationResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function createTenantProject(
  _prevState: MutationResult,
  formData: FormData
): Promise<MutationResult> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('tenant_auth');

  if (!sessionToken?.value) {
    return {
      success: false,
      error: 'Authentication session expired. Please sign in.'
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

  const tenantId = cookieStore.get('active_tenant')?.value || 'default';

  try {
    const response = await fetch(`https://api.internal/tenants/${tenantId}/projects`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sessionToken.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: sanitizedTitle })
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Server rejected mutation: ${response.statusText}`
      };
    }

    revalidateTag(`projects:${tenantId}`);
    revalidatePath(`/tenants/${tenantId}/projects`);

    return {
      success: true,
      message: `Project "${sanitizedTitle}" created successfully.`
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown network failure during project creation.'
    };
  }
}
