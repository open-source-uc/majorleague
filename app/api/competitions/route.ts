import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { Competition } from '@/lib/types';

export async function GET() {
  const { data, error } = await supabase.from('Competition').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data as Competition[]);
} 