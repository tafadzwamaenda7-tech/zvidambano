/**
 * Supabase Storage — File upload utilities
 * Handles listing photos, weighbridge tickets, avatars, and documents
 */

import { supabase } from './supabase';

// Upload listing photo (public bucket)
export async function uploadListingPhoto(file: File, userId: string): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('listing-photos')
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('listing-photos')
    .getPublicUrl(path);

  return urlData.publicUrl;
}

// Upload weighbridge ticket (private bucket — returns signed URL)
export async function uploadWeighbridgeTicket(file: File, deliveryId: string, userId: string) {
  const ext = file.name.split('.').pop();
  const path = `${userId}/${deliveryId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('weighbridge-tickets')
    .upload(path, file);

  if (error) throw error;

  const { data: signedUrl } = await supabase.storage
    .from('weighbridge-tickets')
    .createSignedUrl(path, 3600);

  return { path, url: signedUrl?.signedUrl };
}

// Upload avatar (public bucket, upsert)
export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${userId}/avatar.${ext}`;

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(path);

  await supabase.from('users').update({ avatar_url: urlData.publicUrl }).eq('id', userId);

  return urlData.publicUrl;
}

// Upload document (private bucket)
export async function uploadDocument(file: File, contractId: string, userId: string) {
  const path = `${userId}/${contractId}/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage.from('documents').upload(path, file);
  if (error) throw error;

  const { data: doc, error: dbError } = await supabase.from('documents').insert({
    contract_id: contractId,
    type: file.name.split('.').pop(),
    name: file.name,
    file_url: path,
    uploaded_by: userId,
  }).select().single();

  if (dbError) throw dbError;
  return doc;
}

// Delete file from storage
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

// Generic upload — paths are scoped under an owning folder (usually the user id)
// so storage RLS policies can enforce owner-only writes. Returns the object path
// and, for public buckets, a working public URL.
export async function uploadToStorage(
  bucket: string,
  file: File,
  folder: string
): Promise<{ path: string; url: string }> {
  const ext = file.name.split('.').pop();
  const path = `${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

// List files in a folder
export async function listFiles(bucket: string, folder: string) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
  if (error) throw error;
  return data;
}

// Download file
export async function downloadFile(bucket: string, path: string) {
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error) throw error;
  return data;
}

// Signed URL for private bucket objects (weighbridge tickets, documents)
export async function getSignedUrl(bucket: string, path: string, expiresIn = 3600): Promise<string | null> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) return null;
  return data?.signedUrl || null;
}

// Get optimized image URL
export function getOptimizedImageUrl(path: string, width: number = 300, height: number = 300) {
  const { data } = supabase.storage
    .from('listing-photos')
    .getPublicUrl(path, {
      transform: { width, height, resize: 'cover', quality: 80 } as any,
    });
  return data.publicUrl;
}
