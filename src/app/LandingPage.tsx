'use client';
import Link from '@mui/material/Link';

export default function LandingPage() {
  return (
    <main>
      <h1>Welcome to enableD</h1>
      <ul>
        <li>
          <Link href="/auth/signin">Sign In</Link>
        </li>
        {/* TODO: Re-enable sign up after testing phase
        <li>
          <Link href="/auth/signup">Sign Up</Link>
        </li>
        */}
      </ul>
    </main>
  );
}
