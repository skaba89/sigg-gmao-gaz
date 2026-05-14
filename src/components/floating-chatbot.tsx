'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Loader2,
  X,
  Trash2,
  Minimize2,
  Maximize2,
  MessageCircle,
  Wrench,
  AlertTriangle,
  Package,
  DollarSign,
  CalendarClock,
  Server,
  LayoutDashboard,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAppStore, type ModuleKey } from '@/store/app-store';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// Context-aware suggested prompts based on active module
const modulePrompts: Record<ModuleKey, { icon: React.ElementType; prompts: string[] }> = {
  dashboard: {
    icon: LayoutDashboard,
    prompts: [
      "Quels sont les KPIs les plus critiques aujourd'hui ?",
      "Analyse la tendance des incidents ce mois",
      "Résumé de l'état général du parc",
    ],
  },
  equipment: {
    icon: Server,
    prompts: [
      "Analyse l'état de mes équipements critiques",
      "Quels équipements nécessitent une inspection ?",
      "Diagnostic du compresseur C-101",
    ],
  },
  'work-orders': {
    icon: Wrench,
    prompts: [
      "Quels ordres de travail sont en retard ?",
      "Aide-moi à rédiger un ordre de travail",
      "Priorise les OT en attente",
    ],
  },
  incidents: {
    icon: AlertTriangle,
    prompts: [
      "Résumé des incidents récents",
      "Analyse les causes racines fréquentes",
      "Procédure de déclaration d'incident",
    ],
  },
  maintenance: {
    icon: CalendarClock,
    prompts: [
      "Recommandations de maintenance préventive",
      "Planification des interventions cette semaine",
      "Optimisation du planning maintenance",
    ],
  },
  stock: {
    icon: Package,
    prompts: [
      "Quelles pièces sont en stock critique ?",
      "Recommandations de réapprovisionnement",
      "Analyse des mouvements de stock",
    ],
  },
  financial: {
    icon: DollarSign,
    prompts: [
      "Analyse des coûts de maintenance",
      "Prévisions budgétaires pour le trimestre",
      "Optimisation des dépenses",
    ],
  },
  'ai-assistant': {
    icon: Bot,
    prompts: [
      "Comment fonctionne l'analyse prédictive ?",
      "Aide-moi à interpréter les données maintenance",
      "Bonnes pratiques industrielles gaz",
    ],
  },
  settings: {
    icon: Settings,
    prompts: [
      "Comment configurer les alertes ?",
      "Aide sur la gestion des utilisateurs",
      "Paramètres de sécurité recommandés",
    ],
  },
};

const moduleLabels: Record<ModuleKey, string> = {
  dashboard: 'Tableau de bord',
  equipment: 'Équipements',
  'work-orders': 'Ordres de travail',
  incidents: 'Incidents',
  maintenance: 'Plans maintenance',
  stock: 'Stock',
  financial: 'Financier',
  'ai-assistant': 'Assistant IA',
  settings: 'Paramètres',
};

// Proactive welcome messages when switching modules (shown once per module)
const moduleWelcomeMessages: Record<ModuleKey, string> = {
  dashboard: "Bienvenue sur le tableau de bord ! Je peux vous aider à analyser les KPIs et tendances. Que souhaitez-vous explorer ?",
  equipment: "Vous consultez les équipements. Je peux analyser leur état de santé, identifier les inspections nécessaires ou diagnostiquer un problème. Par quoi commencer ?",
  'work-orders': "Section ordres de travail. Je peux vous aider à rédiger, prioriser ou suivre vos OT. Que puis-je faire pour vous ?",
  incidents: "Module incidents activé. Je peux analyser les causes racines, résumer les incidents récents ou vous guider dans la déclaration. Comment puis-je aider ?",
  maintenance: "Plans de maintenance. Je peux recommander des actions préventives, optimiser le planning ou planifier des interventions. Que vous faut-il ?",
  stock: "Gestion du stock. Je peux identifier les pièces critiques, recommander des réapprovisionnements ou analyser les mouvements. Votre besoin ?",
  financial: "Volet financier. Je peux analyser les coûts, établir des prévisions ou optimiser les dépenses de maintenance. Par quoi commencer ?",
  'ai-assistant': "Vous êtes dans l'assistant IA complet. Ici, nous pouvons approfondir n'importe quel sujet maintenance. Posez votre question !",
  settings: "Paramètres de la plateforme. Je peux vous guider dans la configuration des alertes, la gestion des utilisateurs ou les options de sécurité.",
};

export function FloatingChatBot() {
  const { activeModule } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [visitedModules, setVisitedModules] = useState<Set<ModuleKey>>(new Set());
  const [prevModule, setPrevModule] = useState<ModuleKey>(activeModule);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Proactive message when module changes
  useEffect(() => {
    if (activeModule !== prevModule) {
      setPrevModule(activeModule);
      // Only show proactive message if chat is closed or first visit to this module
      if (!visitedModules.has(activeModule)) {
        setVisitedModules((prev) => new Set(prev).add(activeModule));
        const welcomeMsg: Message = {
          id: `welcome-${activeModule}-${Date.now()}`,
          role: 'system',
          content: moduleWelcomeMessages[activeModule],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, welcomeMsg]);
        if (!isOpen) {
          setUnreadCount((prev) => prev + 1);
        }
      }
    }
  }, [activeModule, prevModule, visitedModules, isOpen]);

  // Clear unread when opening chat
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async (text?: string) => {
    const content = text || input.trim();
    if (!content || sending) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      // Build conversation history for multi-turn context
      const conversationHistory = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      // Add context about current module
      const contextInfo = `L'utilisateur consulte actuellement le module "${moduleLabels[activeModule]}" de la plateforme GMAO SIGG.`;

      const res = await api.sendAIChat(content, conversationHistory, contextInfo);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          res.response ||
          res.message ||
          res.data ||
          "Je suis votre assistant maintenance SIGG. Comment puis-je vous aider ?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          "Désolé, une erreur s'est produite lors de la communication avec l'assistant. Veuillez réessayer.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }

    setSending(false);
  }, [input, sending, messages, activeModule]);

  const clearChat = () => {
    setMessages([]);
    setVisitedModules(new Set());
  };

  const currentPrompts = modulePrompts[activeModule];

  // Panel dimensions based on expanded state
  const panelWidth = isExpanded ? 'w-[520px]' : 'w-[380px]';
  const panelHeight = isExpanded ? 'h-[620px]' : 'h-[500px]';

  // Format timestamp for display
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full teal-gradient shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all duration-300 flex items-center justify-center group"
          >
            <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            {/* Pulsing ring */}
            <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping opacity-20" />
            {/* Unread badge */}
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-sigg-orange text-white text-[10px] font-bold flex items-center justify-center"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className={`fixed bottom-6 right-6 z-50 ${panelWidth} ${panelHeight} flex flex-col overflow-hidden rounded-2xl border border-border glass-card shadow-2xl shadow-black/20 dark:shadow-black/40`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-primary/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg teal-gradient flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Assistant SIGG</h3>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-sigg-green animate-pulse" />
                    En ligne — {moduleLabels[activeModule]}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 text-muted-foreground hover:text-foreground"
                  onClick={clearChat}
                  title="Effacer la conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? 'Réduire' : 'Agrandir'}
                >
                  {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                  title="Fermer"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Messages area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="w-12 h-12 rounded-xl teal-gradient flex items-center justify-center mx-auto mb-3">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-sm font-semibold text-foreground">Assistant Maintenance SIGG</h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[260px]">
                      Votre assistant IA autonome, spécialisé en maintenance industrielle gaz. Posez vos questions ou utilisez les suggestions ci-dessous.
                    </p>
                  </motion.div>

                  {/* Context-aware suggested prompts */}
                  <div className="flex flex-col gap-1.5 w-full max-w-[300px]">
                    <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Suggestions — {moduleLabels[activeModule]}
                    </p>
                    {currentPrompts.prompts.map((prompt) => (
                      <Button
                        key={prompt}
                        variant="outline"
                        className="h-auto py-2 px-3 text-left text-xs whitespace-normal hover:bg-primary/5 hover:border-primary/30 justify-start group/prompt"
                        onClick={() => sendMessage(prompt)}
                      >
                        <ChevronRight className="w-3 h-3 mr-1.5 text-primary/50 group-hover/prompt:text-primary flex-shrink-0 transition-colors" />
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex gap-2 ${
                        msg.role === 'user'
                          ? 'justify-end'
                          : msg.role === 'system'
                          ? 'justify-center'
                          : 'justify-start'
                      }`}
                    >
                      {/* System message (proactive) */}
                      {msg.role === 'system' && (
                        <div className="max-w-[90%] rounded-xl px-3.5 py-2 text-xs bg-primary/10 border border-primary/20 text-primary/80 text-center">
                          <div className="flex items-center justify-center gap-1.5 mb-1">
                            <Sparkles className="w-3 h-3" />
                            <span className="font-medium">Suggestion</span>
                          </div>
                          <p>{msg.content}</p>
                          <span className="text-[9px] opacity-60 mt-1 block">{formatTime(msg.timestamp)}</span>
                        </div>
                      )}

                      {/* Assistant message */}
                      {msg.role === 'assistant' && (
                        <>
                          <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Bot className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <div className="max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm bg-muted/60 border border-border/50">
                            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 [&_p]:mb-1.5 [&_p:last-child]:mb-0 [&_ul]:mb-1.5 [&_ol]:mb-1.5 [&_li]:mb-0.5 [&_strong]:text-foreground [&_code]:text-primary [&_pre]:bg-background/50 [&_pre]:rounded-lg [&_pre]:p-2 [&_pre]:text-xs [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                            <span className="text-[9px] text-muted-foreground/50 mt-1 block">{formatTime(msg.timestamp)}</span>
                          </div>
                        </>
                      )}

                      {/* User message */}
                      {msg.role === 'user' && (
                        <>
                          <div className="max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm bg-primary text-primary-foreground">
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            <span className="text-[9px] opacity-60 mt-1 block">{formatTime(msg.timestamp)}</span>
                          </div>
                          <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}

                  {/* Typing indicator */}
                  {sending && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-2"
                    >
                      <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="bg-muted/60 border border-border/50 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-[10px] text-muted-foreground ml-1">Analyse en cours...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>

            {/* Quick prompts bar (when messages exist) */}
            {messages.length > 0 && !sending && (
              <div className="px-3 pb-1.5 flex gap-1.5 overflow-x-auto scrollbar-none">
                {currentPrompts.prompts.slice(0, 2).map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="flex-shrink-0 text-[10px] px-2.5 py-1 rounded-full border border-border/50 bg-muted/30 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors whitespace-nowrap flex items-center gap-1"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    {prompt.length > 35 ? prompt.substring(0, 35) + '...' : prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input area */}
            <div className="p-3 border-t border-border/50 bg-background/50">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Posez votre question..."
                  className="h-9 text-sm bg-background/80"
                  disabled={sending}
                />
                <Button
                  type="submit"
                  disabled={sending || !input.trim()}
                  size="icon"
                  className="h-9 w-9 bg-primary hover:bg-primary/90 flex-shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
              <p className="text-[9px] text-muted-foreground/40 mt-1.5 text-center">
                Assistant IA SIGG — Maintenance industrielle gaz
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
