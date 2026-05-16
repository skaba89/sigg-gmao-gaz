import { blacklistToken, getTokenFromHeaders } from '@/lib/auth-utils';

export async function POST(request: Request) {
  try {
    const token = getTokenFromHeaders(request);
    if (token) {
      await blacklistToken(token);
    }
    return Response.json({ message: 'Déconnexion réussie' });
  } catch (error: any) {
    // Even if blacklisting fails, still return success to client
    return Response.json({ message: 'Déconnexion réussie' });
  }
}
