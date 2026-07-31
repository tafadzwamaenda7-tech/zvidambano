/**
 * Concurrency Control — Prevent race conditions
 * Optimistic locking for safe concurrent updates
 */

import { supabase } from './supabase';

// Optimistic locking — check updated_at before updating
export async function updateWithOptimisticLock(
  table: string,
  id: string,
  updates: any,
  expectedUpdatedAt: string
) {
  const { data, error } = await supabase
    .from(table)
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('updated_at', expectedUpdatedAt)
    .select()
    .single();

  if (error) throw error;
  if (!data) {
    throw new Error('Record was modified by another user. Please refresh and try again.');
  }

  return data;
}

// Retry logic for failed operations
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
      }
    }
  }

  throw lastError;
}