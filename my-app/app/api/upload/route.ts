import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  // 1. 在函数内部初始化 Supabase 客户端
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { ok: false, error: 'Server configuration error: Supabase variables missing' },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { ok: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const allowedMimeTypes = ['text/plain', 'application/pdf', 'text/markdown'];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid file type. Only TXT, PDF, MD are allowed' },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { ok: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    const fileName = `${uuidv4()}-${file.name}`;
    const bucketName = 'ai-summary-documents';

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

    const { data: urlData } = await supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

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