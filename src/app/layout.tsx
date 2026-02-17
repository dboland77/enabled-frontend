import React from 'react';
import AuthModernLayout from '@/app/auth/layouts/AuthModernLayout';

type Props = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: Props) {
  return <AuthModernLayout>{children}</AuthModernLayout>;
}
