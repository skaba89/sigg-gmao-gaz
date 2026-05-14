import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: Request) {
  try {
    const { message, context } = await request.json();

    if (!message) {
      return Response.json({ error: 'Message requis' }, { status: 400 });
    }

    const zai = await ZAI.create();

    const systemPrompt = `Tu es un assistant IA spécialisé en maintenance industrielle pour la Société Interprofessionnelle du Gaz de Guinée (SIGG). Tu aides les techniciens et ingénieurs avec:
- Le diagnostic de pannes sur les équipements gaziers (compresseurs, turbines, pipelines, vannes, etc.)
- Les recommandations de maintenance préventive et corrective
- L'analyse des équipements et de leur état de santé
- Les meilleures pratiques industrielles pour le secteur du gaz
- L'interprétation des KPIs de maintenance (MTTR, MTBF, taux de disponibilité, etc.)
- La gestion des stocks de pièces de rechange
- La planification des interventions de maintenance
- Les normes de sécurité dans l'industrie gazière

Tu réponds en français de manière professionnelle et détaillée. Tu utilises un vocabulaire technique approprié au domaine de la maintenance industrielle et du gaz.${context ? `\n\nContexte additionnel: ${context}` : ''}`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: message,
        },
      ],
    });

    return Response.json({ response: completion.choices[0]?.message?.content });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return Response.json({ error: error.message || 'Erreur lors de la communication avec l\'assistant IA' }, { status: 500 });
  }
}
