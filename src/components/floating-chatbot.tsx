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
  Download,
  FileText,
  FileSpreadsheet,
  Cpu,
  Shield,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAppStore, type ModuleKey } from '@/store/app-store';
import ReactMarkdown from 'react-markdown';

// ─── Types ─────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  files?: GeneratedFile[];
}

interface GeneratedFile {
  name: string;
  content: string;
  type: 'csv' | 'json' | 'txt';
}

// ─── Chatbot Identity ──────────────────────────────────────────
const CHATBOT_NAME = 'MANTIS';
const CHATBOT_FULL_NAME = 'Maintenance Analysis & Technical Intelligence System';

// ─── Module-aware prompts ──────────────────────────────────────
const modulePrompts: Record<ModuleKey, { icon: React.ElementType; prompts: string[] }> = {
  dashboard: {
    icon: LayoutDashboard,
    prompts: [
      "Génère un rapport KPI en CSV",
      "Analyse la tendance des incidents",
      "Tableau de bord exécutif résumé",
    ],
  },
  equipment: {
    icon: Server,
    prompts: [
      "Tableau des équipements critiques",
      "Génère CSV état des équipements",
      "Diagnostic compresseur GA90+",
    ],
  },
  'work-orders': {
    icon: Wrench,
    prompts: [
      "Rapport OT en retard en CSV",
      "Aide-moi à rédiger un OT",
      "Tableau priorisation des OT",
    ],
  },
  incidents: {
    icon: AlertTriangle,
    prompts: [
      "Rapport incidents en CSV",
      "Analyse causes racines",
      "Procédure déclaration incident",
    ],
  },
  maintenance: {
    icon: CalendarClock,
    prompts: [
      "Planning maintenance en CSV",
      "Recommandations préventives",
      "Optimisation planning semaine",
    ],
  },
  stock: {
    icon: Package,
    prompts: [
      "Rapport stock critique en CSV",
      "Réapprovisionnement recommandé",
      "Tableau mouvements de stock",
    ],
  },
  financial: {
    icon: DollarSign,
    prompts: [
      "Rapport coûts maintenance CSV",
      "Prévisions budgétaires",
      "Tableau répartition des dépenses",
    ],
  },
  'ai-assistant': {
    icon: Bot,
    prompts: [
      "Génère un rapport complet en CSV",
      "Analyse prédictive équipements",
      "Bonnes pratiques industrielles gaz",
    ],
  },
  settings: {
    icon: Settings,
    prompts: [
      "Guide configuration alertes",
      "Gestion des utilisateurs",
      "Paramètres sécurité recommandés",
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

const moduleWelcomeMessages: Record<ModuleKey, string> = {
  dashboard: `Bonjour ! Je suis **MANTIS**, votre assistant maintenance autonome. Sur le Tableau de bord, je peux analyser les KPIs, générer des rapports CSV et vous alerter sur les tendances critiques. Que puis-je faire pour vous ?`,
  equipment: `Module Équipements activé. Je peux générer des **tableaux d'état**, des **rapports CSV** d'équipements, et diagnostiquer des pannes. Demandez-moi un rapport !`,
  'work-orders': `Section Ordres de travail. Je peux rédiger des OT, générer des **rapports de retard en CSV**, et prioriser vos interventions. Votre besoin ?`,
  incidents: `Module Incidents. Je peux créer des **rapports d'incidents téléchargeables**, analyser les causes racines et vous guider dans les procédures. Comment aider ?`,
  maintenance: `Plans de maintenance. Je peux générer des **plannings en CSV**, recommander des actions préventives et optimiser vos interventions. Par quoi commencer ?`,
  stock: `Gestion du stock. Je peux produire des **rapports de stock critique en CSV**, recommander des réapprovisionnements et analyser les mouvements. Votre besoin ?`,
  financial: `Volet financier. Je peux générer des **rapports de coûts en CSV**, établir des prévisions et optimiser les dépenses. Quel rapport souhaitez-vous ?`,
  'ai-assistant': `Bienvenue dans l'espace MANTIS complet. Je peux générer des **fichiers téléchargeables** (CSV, rapports), créer des **tableaux de données** et répondre à toutes vos questions maintenance.`,
  settings: `Paramètres de la plateforme. Je peux vous guider dans la configuration, la gestion des utilisateurs et les options de sécurité.`,
};

// ─── Utility: Extract downloadable files from AI response ──────
function extractFilesFromContent(content: string): { cleanContent: string; files: GeneratedFile[] } {
  const files: GeneratedFile[] = [];
  const codeBlockRegex = /```(csv|json|txt)\n([\s\S]*?)```/gi;
  let match;
  let cleanContent = content;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const fileType = match[1].toLowerCase() as 'csv' | 'json' | 'txt';
    const fileContent = match[2].trim();

    // Extract filename from <!-- FILE: name --> comment or generate one
    const fileMatch = fileContent.match(/<!--\s*FILE:\s*(.+?)\s*-->/i);
    const fileName = fileMatch
      ? fileMatch[1].trim()
      : `rapport_sigg_${new Date().toISOString().slice(0, 10)}.${fileType}`;

    const cleanFileContent = fileContent.replace(/<!--\s*FILE:\s*.+?\s*-->\n?/i, '');

    files.push({ name: fileName, content: cleanFileContent, type: fileType });
  }

  return { cleanContent, files };
}

// ─── Utility: Download a file ──────────────────────────────────
function downloadFile(file: GeneratedFile) {
  const blob = new Blob([file.content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  link.click();
  URL.revokeObjectURL(url);
}

// ─── File icon component ───────────────────────────────────────
function FileDownloadCard({ file }: { file: GeneratedFile }) {
  const iconMap = {
    csv: FileSpreadsheet,
    json: FileText,
    txt: FileText,
  };
  const FileIcon = iconMap[file.type] || FileText;
  const colorMap = {
    csv: '#16A34A',
    json: '#3B82F6',
    txt: '#6B7280',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 rounded-lg p-2.5 mt-2 border border-emerald-800/40"
      style={{ backgroundColor: 'rgba(22, 163, 74, 0.08)' }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${colorMap[file.type]}15` }}
      >
        <FileIcon className="w-4.5 h-4.5" style={{ color: colorMap[file.type] }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-emerald-300 truncate">{file.name}</p>
        <p className="text-[10px] text-slate-500">
          {file.type.toUpperCase()} — {(file.content.length / 1024).toFixed(1)} Ko
        </p>
      </div>
      <Button
        size="sm"
        className="h-7 px-3 text-[11px] gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
        onClick={() => downloadFile(file)}
      >
        <Download className="w-3 h-3" />
        Télécharger
      </Button>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────
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

  // Proactive message on module change
  useEffect(() => {
    if (activeModule !== prevModule) {
      setPrevModule(activeModule);
      if (!visitedModules.has(activeModule)) {
        setVisitedModules((prev) => new Set(prev).add(activeModule));
        const welcomeMsg: Message = {
          id: `welcome-${activeModule}-${Date.now()}`,
          role: 'system',
          content: moduleWelcomeMessages[activeModule],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, welcomeMsg]);
        if (!isOpen) setUnreadCount((prev) => prev + 1);
      }
    }
  }, [activeModule, prevModule, visitedModules, isOpen]);

  useEffect(() => { if (isOpen) setUnreadCount(0); }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) setTimeout(() => inputRef.current?.focus(), 300);
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
      const conversationHistory = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role, content: m.content }));

      const contextInfo = `L'utilisateur consulte le module "${moduleLabels[activeModule]}" de la plateforme GMAO SIGG.`;

      const res = await api.sendAIChat(content, conversationHistory, contextInfo);
      const rawContent = res.response || res.message || res.data || "Je suis MANTIS, votre assistant maintenance. Comment puis-je vous aider ?";

      // Extract downloadable files from the response
      const { cleanContent, files } = extractFilesFromContent(rawContent);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: cleanContent,
        timestamp: new Date(),
        files: files.length > 0 ? files : undefined,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Désolé, une erreur s'est produite. Veuillez réessayer.",
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
  const panelWidth = isExpanded ? 'w-[540px]' : 'w-[400px]';
  const panelHeight = isExpanded ? 'h-[660px]' : 'h-[520px]';

  const formatTime = (date: Date) =>
    new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(date);

  return (
    <>
      {/* ─── FAB Button ─── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-2xl flex items-center justify-center group shadow-2xl transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 50%, #0EA5E9 100%)',
              boxShadow: '0 8px 32px rgba(15, 118, 110, 0.45), 0 0 0 3px rgba(20, 184, 166, 0.15)',
            }}
          >
            <Cpu className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
            {/* Pulse ring */}
            <span
              className="absolute inset-0 rounded-2xl animate-ping opacity-20"
              style={{ background: 'linear-gradient(135deg, #0F766E, #14B8A6)' }}
            />
            {/* Unread badge */}
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg"
                style={{ background: '#EA580C' }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
            {/* Name badge */}
            <span
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-bold tracking-widest text-white px-2 py-0.5 rounded-full"
              style={{ background: '#0F766E' }}
            >
              MANTIS
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ─── Chat Panel ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className={`fixed bottom-6 right-6 z-50 ${panelWidth} ${panelHeight} flex flex-col overflow-hidden rounded-2xl shadow-2xl`}
            style={{
              backgroundColor: '#0c1a2e',
              border: '2px solid rgba(20, 184, 166, 0.3)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(15, 118, 110, 0.15)',
            }}
          >
            {/* ─── Header ─── */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{
                background: 'linear-gradient(135deg, #0F766E 0%, #0C4A44 100%)',
                borderBottom: '1px solid rgba(20, 184, 166, 0.2)',
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #14B8A6, #0EA5E9)' }}
                >
                  <Cpu className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white tracking-wide">{CHATBOT_NAME}</h3>
                    <span
                      className="text-[8px] font-medium px-1.5 py-0.5 rounded-full tracking-wider"
                      style={{ backgroundColor: 'rgba(20, 184, 166, 0.25)', color: '#5EEAD4' }}
                    >
                      AUTONOME
                    </span>
                  </div>
                  <p className="text-[9px] text-teal-300/60 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    En ligne — {moduleLabels[activeModule]}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 text-teal-300/60 hover:text-white hover:bg-white/10"
                  onClick={clearChat}
                  title="Effacer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 text-teal-300/60 hover:text-white hover:bg-white/10"
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? 'Réduire' : 'Agrandir'}
                >
                  {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 text-teal-300/60 hover:text-white hover:bg-white/10"
                  onClick={() => setIsOpen(false)}
                  title="Fermer"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* ─── Messages ─── */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
              style={{ backgroundColor: '#0c1a2e' }}
            >
              {messages.length === 0 ? (
                /* Welcome screen */
                <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: 'linear-gradient(135deg, #0F766E, #14B8A6, #0EA5E9)' }}
                    >
                      <Cpu className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="text-base font-bold text-white tracking-wide">{CHATBOT_NAME}</h4>
                    <p className="text-[10px] text-teal-400/60 mt-0.5 tracking-wide">{CHATBOT_FULL_NAME}</p>
                    <p className="text-xs text-slate-400 mt-3 max-w-[280px] leading-relaxed">
                      Assistant IA autonome spécialisé en maintenance industrielle gaz.
                      Génération de rapports, tableaux et fichiers téléchargeables.
                    </p>
                  </motion.div>

                  {/* Capability badges */}
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {[
                      { icon: FileSpreadsheet, label: 'Rapports CSV', color: '#16A34A' },
                      { icon: Shield, label: 'Diagnostic', color: '#3B82F6' },
                      { icon: Download, label: 'Fichiers', color: '#F97316' },
                    ].map((cap) => (
                      <span
                        key={cap.label}
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border"
                        style={{
                          borderColor: `${cap.color}30`,
                          backgroundColor: `${cap.color}10`,
                          color: cap.color,
                        }}
                      >
                        <cap.icon className="w-2.5 h-2.5" />
                        {cap.label}
                      </span>
                    ))}
                  </div>

                  {/* Suggested prompts */}
                  <div className="flex flex-col gap-1.5 w-full max-w-[310px]">
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-teal-400" />
                      Suggestions — {moduleLabels[activeModule]}
                    </p>
                    {currentPrompts.prompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => sendMessage(prompt)}
                        className="flex items-center gap-2 h-auto py-2 px-3 text-left text-xs rounded-lg border transition-all hover:scale-[1.02]"
                        style={{
                          borderColor: 'rgba(20, 184, 166, 0.15)',
                          backgroundColor: 'rgba(20, 184, 166, 0.05)',
                          color: '#94a3b8',
                        }}
                      >
                        <ChevronRight className="w-3 h-3 text-teal-500 flex-shrink-0" />
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Message list */
                <>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex gap-2.5 ${
                        msg.role === 'user'
                          ? 'justify-end'
                          : msg.role === 'system'
                          ? 'justify-center'
                          : 'justify-start'
                      }`}
                    >
                      {/* System message */}
                      {msg.role === 'system' && (
                        <div
                          className="max-w-[90%] rounded-xl px-3.5 py-2.5 text-xs text-center"
                          style={{
                            backgroundColor: 'rgba(20, 184, 166, 0.1)',
                            border: '1px solid rgba(20, 184, 166, 0.2)',
                          }}
                        >
                          <div className="flex items-center justify-center gap-1.5 mb-1">
                            <Sparkles className="w-3 h-3 text-teal-400" />
                            <span className="font-semibold text-teal-300">{CHATBOT_NAME}</span>
                          </div>
                          <div className="text-slate-300 prose prose-sm prose-invert max-w-none [&_p]:mb-1 [&_strong]:text-teal-300">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                          <span className="text-[9px] text-slate-600 mt-1 block">{formatTime(msg.timestamp)}</span>
                        </div>
                      )}

                      {/* Assistant message */}
                      {msg.role === 'assistant' && (
                        <>
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ background: 'linear-gradient(135deg, #0F766E, #14B8A6)' }}
                          >
                            <Cpu className="w-4 h-4 text-white" />
                          </div>
                          <div
                            className="max-w-[82%] rounded-xl px-3.5 py-2.5 text-sm"
                            style={{
                              backgroundColor: '#162032',
                              border: '1px solid rgba(20, 184, 166, 0.12)',
                            }}
                          >
                            {/* Markdown content with table styling */}
                            <div
                              className="prose prose-sm prose-invert max-w-none text-slate-200
                                [&_p]:mb-1.5 [&_p:last-child]:mb-0
                                [&_ul]:mb-1.5 [&_ol]:mb-1.5 [&_li]:mb-0.5
                                [&_strong]:text-teal-300 [&_em]:text-amber-300
                                [&_code]:text-teal-300 [&_pre]:bg-[#0a1220] [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:text-xs [&_pre]:border [&_pre]:border-teal-900/30
                                [&_h1]:text-base [&_h1]:text-teal-300 [&_h1]:font-bold [&_h1]:mt-3 [&_h1]:mb-1.5
                                [&_h2]:text-sm [&_h2]:text-teal-400 [&_h2]:font-semibold [&_h2]:mt-2.5 [&_h2]:mb-1
                                [&_h3]:text-sm [&_h3]:text-cyan-400 [&_h3]:font-medium [&_h3]:mt-2 [&_h3]:mb-1
                                [&_table]:w-full [&_table]:border-collapse [&_table]:my-2
                                [&_th]:bg-teal-900/30 [&_th]:text-teal-300 [&_th]:text-[11px] [&_th]:font-semibold [&_th]:px-2.5 [&_th]:py-1.5 [&_th]:border [&_th]:border-teal-800/30 [&_th]:text-left
                                [&_td]:text-[11px] [&_td]:px-2.5 [&_td]:py-1.5 [&_td]:border [&_td]:border-slate-700/30 [&_td]:text-slate-300
                                [&_tr:hover_td]:bg-teal-900/10
                                [&_blockquote]:border-l-2 [&_blockquote]:border-teal-500 [&_blockquote]:pl-3 [&_blockquote]:text-slate-400
                                [&_hr]:border-teal-800/30 [&_hr]:my-2"
                            >
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>

                            {/* Downloadable files */}
                            {msg.files && msg.files.length > 0 && (
                              <div className="mt-2 space-y-1.5">
                                {msg.files.map((file) => (
                                  <FileDownloadCard key={file.name} file={file} />
                                ))}
                              </div>
                            )}

                            <span className="text-[9px] text-slate-600 mt-1.5 block">{formatTime(msg.timestamp)}</span>
                          </div>
                        </>
                      )}

                      {/* User message */}
                      {msg.role === 'user' && (
                        <>
                          <div
                            className="max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm text-white"
                            style={{
                              background: 'linear-gradient(135deg, #0F766E, #0D9488)',
                            }}
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            <span className="text-[9px] opacity-50 mt-1 block">{formatTime(msg.timestamp)}</span>
                          </div>
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: '#1e293b' }}
                          >
                            <User className="w-4 h-4 text-slate-400" />
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}

                  {/* Typing indicator */}
                  {sending && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #0F766E, #14B8A6)' }}
                      >
                        <Cpu className="w-4 h-4 text-white" />
                      </div>
                      <div
                        className="rounded-xl px-4 py-3"
                        style={{ backgroundColor: '#162032', border: '1px solid rgba(20, 184, 166, 0.12)' }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-[10px] text-slate-500 ml-1">{CHATBOT_NAME} analyse...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>

            {/* ─── Quick prompts ─── */}
            {messages.length > 0 && !sending && (
              <div className="px-3 pb-1.5 flex gap-1.5 overflow-x-auto" style={{ backgroundColor: '#0c1a2e' }}>
                {currentPrompts.prompts.slice(0, 2).map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="flex-shrink-0 text-[10px] px-2.5 py-1 rounded-full border flex items-center gap-1 transition-colors whitespace-nowrap"
                    style={{
                      borderColor: 'rgba(20, 184, 166, 0.15)',
                      backgroundColor: 'rgba(20, 184, 166, 0.06)',
                      color: '#5EEAD4',
                    }}
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    {prompt.length > 35 ? prompt.substring(0, 35) + '...' : prompt}
                  </button>
                ))}
              </div>
            )}

            {/* ─── Input ─── */}
            <div
              className="p-3"
              style={{
                backgroundColor: '#0a1628',
                borderTop: '1px solid rgba(20, 184, 166, 0.1)',
              }}
            >
              <form
                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                className="flex gap-2"
              >
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Demander à ${CHATBOT_NAME}...`}
                  className="h-10 text-sm text-white placeholder:text-slate-600 border-teal-800/30 focus:border-teal-600/50"
                  style={{ backgroundColor: '#162032' }}
                  disabled={sending}
                />
                <Button
                  type="submit"
                  disabled={sending || !input.trim()}
                  size="icon"
                  className="h-10 w-10 flex-shrink-0 text-white"
                  style={{
                    background: 'linear-gradient(135deg, #0F766E, #14B8A6)',
                  }}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-[9px] text-slate-700">
                  {CHATBOT_NAME} — {CHATBOT_FULL_NAME}
                </p>
                <div className="flex items-center gap-1">
                  <FileSpreadsheet className="w-2.5 h-2.5 text-emerald-700" />
                  <Download className="w-2.5 h-2.5 text-blue-700" />
                  <span className="text-[8px] text-slate-700">CSV • Rapports</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
