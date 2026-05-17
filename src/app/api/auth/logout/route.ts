import { withAuth, blacklistToken, getTokenFromHeaders, type TokenPayload } from '@/lib/auth-utils';

export const POST = withAuth(
  async (request: Request, _context, user: TokenPayload) => {
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
);
