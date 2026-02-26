import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase client (read config from environment variables)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are not set');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: NextRequest) {
  try {
    // Parse form data (contains uploaded file)
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    // Validate file existence
    if (!file) {
      return NextResponse.json(
        { ok: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type (match Supabase bucket configuration)
    const allowedMimeTypes = ['text/plain', 'application/pdf', 'text/markdown'];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid file type. Only TXT, PDF, MD are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (10MB = 10 * 1024 * 1024 = 10485760 bytes)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { ok: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Generate random file name (avoid duplication + security)
    const fileName = `${uuidv4()}-${file.name}`;
    const bucketName = 'ai-summary-documents';

    // Upload file to Supabase storage bucket
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        contentType: file.type,
        cacheControl: '3600'
      });

    if (error) {
      return NextResponse.json(
        { ok: false, error: `Upload failed: ${error.message}` },
        { status: 500 }
      );
    }

    // Get public access URL of the file
    const { data: urlData } = await supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    // Return upload result (include file URL for subsequent AI summarization)
    return NextResponse.json({
      ok: true,
      message: 'File uploaded successfully',
      fileUrl: urlData.publicUrl,
      fileName: file.name,
      filePath: data.path
    });

  } catch (error) {
    return NextResponse.json(
      { ok: false, error: `Server error: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}