'use client';
import { useParams } from 'next/navigation';
import { UserEditView } from '@/sections/user/view';

// ----------------------------------------------------------------------

export default function UserEditPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <title> enableD: User Edit</title>

      <UserEditView id={`${id}`} />
    </>
  );
}
