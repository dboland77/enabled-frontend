'use client';
import { useParams } from 'next/navigation';
import { DisabilityEditView } from '@/sections/disability/view';

export default function DisabilityEditPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <title> enableD: Disability Edit</title>

      <DisabilityEditView id={`${id}`} />
    </>
  );
}
