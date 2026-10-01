import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';

export async function requireAdmin(req, res) {
  const session = await getServerSession(req, res, authOptions);
  return session?.user?.role === 'ADMIN' ? session : null;
}
