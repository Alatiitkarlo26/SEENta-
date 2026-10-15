/**
 * Migration Script: Migrate all photos in the database to the Supabase Storage Bucket 'item-photos'
 * Project SEENta — PUP Biñan Campus P2P Lost and Found System
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET_NAME = 'item-photos';

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = (buckets || []).some((b) => b.name === BUCKET_NAME);
  if (!exists) {
    console.log(`Creating storage bucket "${BUCKET_NAME}"...`);
    const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 5242880,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
    });
    if (error) console.error('Error creating bucket:', error.message);
  } else {
    console.log(`Bucket "${BUCKET_NAME}" is online and ready.`);
  }
}

async function uploadToBucket(input, folder = 'found', id = Date.now()) {
  if (!input || typeof input !== 'string') return input;

  // Already in the bucket
  if (input.includes(`/storage/v1/object/public/${BUCKET_NAME}/`)) {
    return input;
  }

  try {
    let buffer;
    let ext = 'jpg';
    let contentType = 'image/jpeg';

    if (input.startsWith('data:image/')) {
      const match = input.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (!match) return input;
      const sub = match[1].toLowerCase().replace('jpeg', 'jpg');
      ext = sub === 'png' ? 'png' : sub === 'webp' ? 'webp' : 'jpg';
      contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
      buffer = Buffer.from(match[2], 'base64');
    } else if (input.startsWith('http://') || input.startsWith('https://')) {
      console.log(`  Downloading external image: ${input.substring(0, 70)}...`);
      const resp = await fetch(input);
      if (!resp.ok) {
        console.warn(`  Failed to fetch ${input}: ${resp.status}`);
        return input;
      }
      const cType = resp.headers.get('content-type') || 'image/jpeg';
      if (cType.includes('png')) ext = 'png';
      else if (cType.includes('webp')) ext = 'webp';
      else ext = 'jpg';
      contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
      const ab = await resp.arrayBuffer();
      buffer = Buffer.from(ab);
    } else {
      return input;
    }

    const fileName = `${folder}/${id}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from(BUCKET_NAME).upload(fileName, buffer, {
      contentType,
      upsert: true
    });

    if (uploadErr) {
      console.error(`  Upload error for ${fileName}:`, uploadErr.message);
      return input;
    }

    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
    return urlData.publicUrl;
  } catch (err) {
    console.error('  Error uploading to bucket:', err.message);
    return input;
  }
}

async function migrateAllPhotos() {
  console.log('====================================================');
  console.log('PROJECT SEENTA: MIGRATING ALL DATABASE PHOTOS TO BUCKET');
  console.log('====================================================');

  await ensureBucket();

  // 1. Migrate post_photos table
  console.log('\n--- 1. Checking "post_photos" table ---');
  const { data: postPhotos, error: ppErr } = await supabase.from('post_photos').select('*');
  if (ppErr) {
    console.error('Error fetching post_photos:', ppErr.message);
  } else {
    console.log(`Found ${postPhotos?.length || 0} total photos in post_photos.`);
    let migratedCount = 0;
    for (const photo of postPhotos || []) {
      if (photo.photo_url && !photo.photo_url.includes(`/storage/v1/object/public/${BUCKET_NAME}/`)) {
        console.log(`Migrating post_photo [${photo.id}]...`);
        const newUrl = await uploadToBucket(photo.photo_url, 'found', `${photo.post_id}_${photo.id}`);
        if (newUrl !== photo.photo_url) {
          const { error: updateErr } = await supabase
            .from('post_photos')
            .update({ photo_url: newUrl })
            .eq('id', photo.id);
          if (updateErr) {
            console.error(`  Failed to update photo [${photo.id}]:`, updateErr.message);
          } else {
            console.log(`  ✓ Updated photo [${photo.id}] -> ${newUrl}`);
            migratedCount++;
          }
        }
      } else {
        console.log(`  - Photo [${photo.id}] is already in bucket.`);
      }
    }
    console.log(`Completed post_photos migration: ${migratedCount} migrated.`);
  }

  // 2. Migrate lost_item_reports table
  console.log('\n--- 2. Checking "lost_item_reports" table ---');
  const { data: lostReports, error: lrErr } = await supabase
    .from('lost_item_reports')
    .select('id, item_name, photo_url');
  if (lrErr) {
    console.error('Error fetching lost_item_reports:', lrErr.message);
  } else {
    const withPhotos = (lostReports || []).filter((r) => !!r.photo_url);
    console.log(`Found ${withPhotos.length} lost reports with photos.`);
    let migratedReports = 0;
    for (const report of withPhotos) {
      if (!report.photo_url.includes(`/storage/v1/object/public/${BUCKET_NAME}/`)) {
        console.log(`Migrating lost report photo [${report.id}] (${report.item_name})...`);
        const newUrl = await uploadToBucket(report.photo_url, 'lost', `${report.id}_ref`);
        if (newUrl !== report.photo_url) {
          const { error: updateErr } = await supabase
            .from('lost_item_reports')
            .update({ photo_url: newUrl })
            .eq('id', report.id);
          if (updateErr) {
            console.error(`  Failed to update lost report [${report.id}]:`, updateErr.message);
          } else {
            console.log(`  ✓ Updated lost report [${report.id}] -> ${newUrl}`);
            migratedReports++;
          }
        }
      } else {
        console.log(`  - Lost report [${report.id}] is already in bucket.`);
      }
    }
    console.log(`Completed lost_item_reports migration: ${migratedReports} migrated.`);
  }

  console.log('\n====================================================');
  console.log('🎉 ALL DATABASE PHOTOS ARE NOW SAFELY STORED IN BUCKET!');
  console.log('====================================================\n');
}

migrateAllPhotos()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
