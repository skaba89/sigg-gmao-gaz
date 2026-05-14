export async function POST(request: Request) {
  try {
    // For now, just return success. Client should discard the token.
    // When JWT with proper session management is added, invalidate the token here.
    return Response.json({ message: 'Déconnexion réussie' });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
