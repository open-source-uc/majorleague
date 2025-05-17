import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { Match } from '@/lib/types';

export async function GET() {
  const { data, error } = await supabase.from('Match').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data as Match[]);
} 