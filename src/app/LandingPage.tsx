'use client';
import Link from '@mui/material/Link';

export default function LandingPage() {
  return (
    <main>
      <h1>Welcome to MyApp</h1>
      <ul>
        <li>
          <Link href="/login">Login</Link>
        </li>
        <li>
          <Link href="/register">Register</Link>
        </li>
      </ul>
    </main>
  );
}
