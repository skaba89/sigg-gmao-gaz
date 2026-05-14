import ZAI from 'z-ai-web-dev-sdk';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: Request) {
  try {
    const { message, context, history } = await request.json();

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
- L'analyse prédictive et la détection d'anomalies
- L'optimisation des coûts de maintenance

Tu réponds en français de manière professionnelle, structurée et détaillée. Tu utilises un vocabulaire technique approprié au domaine de la maintenance industrielle et du gaz. Tu structures tes réponses avec des titres, listes et sections quand c'est pertinent. Tu donnes des exemples concrets et des recommandations actionnables.${context ? `\n\nContexte additionnel: ${context}` : ''}`;

    // Build conversation messages with history support
    const conversationMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: systemPrompt,
      },
    ];

    // Add conversation history for multi-turn context (keep last 10 messages)
    if (history && Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-10);
      for (const msg of recentHistory) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          conversationMessages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      }
    }

    // Add the current user message
    conversationMessages.push({
      role: 'user',
      content: message,
    });

    const completion = await zai.chat.completions.create({
      messages: conversationMessages,
    });

    return Response.json({ response: completion.choices[0]?.message?.content });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return Response.json(
      { error: error.message || "Erreur lors de la communication avec l'assistant IA" },
      { status: 500 }
    );
  }
}
