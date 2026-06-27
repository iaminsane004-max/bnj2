import React from 'react';
import { createClient } from '@/lib/supabase-server';
import BakewareForm from '@/components/BakewareForm';
import { notFound } from 'next/navigation';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

interface EditBakewarePageProps {
  params: {
    id: string;
  };
}

export default async function EditBakewarePage({ params }: EditBakewarePageProps) {
  const supabase = createClient();
  const { data: item } = await supabase
    .from('bakeware')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!item) {
    notFound();
  }

  return <BakewareForm bakewareItem={item} />;
}
