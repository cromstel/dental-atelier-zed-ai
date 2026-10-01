import { useState } from 'react';
import Head from 'next/head';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const result = await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError('The email or password was not accepted.');
      return;
    }
    router.push('/admin');
  }

  return (
    <>
      <Head><title>Admin Sign In | Dental Atelier</title><meta name="robots" content="noindex,nofollow" /></Head>
      <div className="mx-auto max-w-md px-5 py-16 sm:py-24">
        <div className="rounded-xl border border-gray-200 bg-white p-7 shadow-sm sm:p-9">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-coral">Dental Atelier</p>
          <h1 className="mt-3 text-3xl font-semibold text-brand">Admin sign in</h1>
          <form className="mt-7 space-y-5" onSubmit={submit}>
            <label className="block text-sm font-medium" htmlFor="email">Email<input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5" id="email" name="email" type="email" autoComplete="username" required /></label>
            <label className="block text-sm font-medium" htmlFor="password">Password<input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5" id="password" name="password" type="password" autoComplete="current-password" required /></label>
            {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
            <button className="w-full rounded-md bg-brand px-5 py-3 font-semibold text-white hover:bg-blue-900 disabled:opacity-60" disabled={loading} type="submit">{loading ? 'Signing in…' : 'Sign in'}</button>
          </form>
        </div>
      </div>
    </>
  );
}
