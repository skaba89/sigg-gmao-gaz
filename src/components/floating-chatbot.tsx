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
  FileDown,
  File,
  Table2,
  FileCode,
  FileArchive,
  Copy,
  Check,
  MoreHorizontal,
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

type FileType = 'csv' | 'json' | 'txt' | 'xml' | 'html' | 'sql' | 'md' | 'yaml' | 'xlsx' | 'pdf' | 'tsv';

interface GeneratedFile {
  name: string;
  content: string;
  type: FileType;
}

// ─── Chatbot Identity ──────────────────────────────────────────
const CHATBOT_NAME = 'MANTIS';
const CHATBOT_FULL_NAME = 'Maintenance Analysis & Technical Intelligence System';
const CHATBOT_VERSION = 'v2.0';

// ─── Supported file formats ────────────────────────────────────
const FILE_FORMATS: Record<FileType, { label: string; icon: React.ElementType; color: string; mimeType: string; ext: string }> = {
  csv:   { label: 'CSV',    icon: FileSpreadsheet, color: '#16A34A', mimeType: 'text/csv;charset=utf-8;',            ext: 'csv' },
  xlsx:  { label: 'Excel',  icon: FileSpreadsheet, color: '#0D7C3E', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ext: 'xlsx' },
  pdf:   { label: 'PDF',    icon: FileText,        color: '#DC2626', mimeType: 'application/pdf',                     ext: 'pdf' },
  json:  { label: 'JSON',   icon: FileCode,        color: '#3B82F6', mimeType: 'application/json;charset=utf-8;',   ext: 'json' },
  xml:   { label: 'XML',    icon: FileCode,        color: '#8B5CF6', mimeType: 'application/xml;charset=utf-8;',    ext: 'xml' },
  html:  { label: 'HTML',   icon: FileCode,        color: '#F97316', mimeType: 'text/html;charset=utf-8;',           ext: 'html' },
  sql:   { label: 'SQL',    icon: FileCode,        color: '#06B6D4', mimeType: 'text/plain;charset=utf-8;',          ext: 'sql' },
  md:    { label: 'Markdown', icon: FileText,      color: '#6366F1', mimeType: 'text/markdown;charset=utf-8;',       ext: 'md' },
  yaml:  { label: 'YAML',   icon: FileCode,        color: '#EC4899', mimeType: 'text/yaml;charset=utf-8;',           ext: 'yaml' },
  txt:   { label: 'TXT',    icon: FileText,        color: '#6B7280', mimeType: 'text/plain;charset=utf-8;',          ext: 'txt' },
  tsv:   { label: 'TSV',    icon: FileSpreadsheet, color: '#14B8A6', mimeType: 'text/tab-separated-values;charset=utf-8;', ext: 'tsv' },
};

// ─── Module-aware prompts ──────────────────────────────────────
const modulePrompts: Record<ModuleKey, { icon: React.ElementType; prompts: string[] }> = {
  dashboard: {
    icon: LayoutDashboard,
    prompts: [
      "Génère un rapport KPI téléchargeable",
      "Rapport exécutif avec tableaux",
      "Analyse la tendance des incidents",
    ],
  },
  equipment: {
    icon: Server,
    prompts: [
      "Tableau des équipements critiques",
      "Rapport état des équipements",
      "Diagnostic compresseur GA90+",
    ],
  },
  'work-orders': {
    icon: Wrench,
    prompts: [
      "Rapport des OT en retard",
      "Aide-moi à rédiger un OT",
      "Tableau priorisation des interventions",
    ],
  },
  incidents: {
    icon: AlertTriangle,
    prompts: [
      "Rapport des incidents récents",
      "Analyse causes racines avec tableau",
      "Procédure déclaration incident",
    ],
  },
  maintenance: {
    icon: CalendarClock,
    prompts: [
      "Planning maintenance téléchargeable",
      "Recommandations préventives",
      "Optimisation planning semaine",
    ],
  },
  stock: {
    icon: Package,
    prompts: [
      "Rapport stock critique",
      "Réapprovisionnement recommandé",
      "Tableau mouvements de stock",
    ],
  },
  financial: {
    icon: DollarSign,
    prompts: [
      "Rapport coûts maintenance",
      "Tableau répartition des dépenses",
      "Prévisions budgétaires",
    ],
  },
  'ai-assistant': {
    icon: Bot,
    prompts: [
      "Génère un rapport complet téléchargeable",
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
  dashboard: `Bonjour ! Je suis **MANTIS**, votre assistant maintenance autonome. Sur le Tableau de bord, je peux analyser les KPIs, générer des rapports et tableaux. Que puis-je faire pour vous ?`,
  equipment: `Module Équipements activé. Je peux créer des **tableaux interactifs**, des **rapports téléchargeables**, et diagnostiquer des pannes. Demandez-moi un rapport !`,
  'work-orders': `Section Ordres de travail. Je peux rédiger des OT, générer des **rapports téléchargeables**, et prioriser vos interventions.`,
  incidents: `Module Incidents. Je peux créer des **rapports téléchargeables** et vous guider dans les procédures. Comment aider ?`,
  maintenance: `Plans de maintenance. Je peux générer des **plannings et rapports téléchargeables**, recommander des actions préventives et optimiser vos interventions.`,
  stock: `Gestion du stock. Je peux produire des **rapports téléchargeables**, recommander des réapprovisionnements et analyser les mouvements.`,
  financial: `Volet financier. Je peux générer des **rapports de coûts téléchargeables**, établir des prévisions et optimiser les dépenses.`,
  'ai-assistant': `Bienvenue dans l'espace MANTIS complet. Je peux générer des **fichiers téléchargeables** dans le format de votre choix, créer des **tableaux de données** et répondre à toutes vos questions maintenance.`,
  settings: `Paramètres de la plateforme. Je peux générer des **documentations et configurations**, et vous guider dans les réglages.`,
};

// ─── Utility: Extract downloadable files from AI response ──────
function extractFilesFromContent(content: string): { cleanContent: string; files: GeneratedFile[] } {
  const files: GeneratedFile[] = [];
  // Match code blocks with format identifiers
  const codeBlockRegex = /```(csv|json|txt|xml|html|sql|md|markdown|yaml|yml|tsv)\n([\s\S]*?)```/gi;
  let match;
  let cleanContent = content;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const rawType = match[1].toLowerCase();
    // Normalize markdown/yml
    const fileType: FileType = rawType === 'markdown' ? 'md' : rawType === 'yml' ? 'yaml' : rawType as FileType;
    const fileContent = match[2].trim();

    // Extract filename from <!-- FILE: name --> comment or generate one
    const fileMatch = fileContent.match(/<!--\s*FILE:\s*(.+?)\s*-->/i);
    const fileName = fileMatch
      ? fileMatch[1].trim()
      : `rapport_sigg_${new Date().toISOString().slice(0, 10)}.${FILE_FORMATS[fileType]?.ext || fileType}`;

    const cleanFileContent = fileContent.replace(/<!--\s*FILE:\s*.+?\s*-->\n?/i, '');

    if (FILE_FORMATS[fileType]) {
      files.push({ name: fileName, content: cleanFileContent, type: fileType });
    }
  }

  // Also check for explicit file markers without code blocks
  const fileMarkerRegex = /<!--\s*FILE:\s*(.+?)\s*-->\n([\s\S]*?)(?=<!--\s*FILE:|$)/gi;
  while ((match = fileMarkerRegex.exec(content)) !== null) {
    const fileName = match[1].trim();
    const ext = fileName.split('.').pop()?.toLowerCase() as FileType;
    if (ext && FILE_FORMATS[ext] && !files.find(f => f.name === fileName)) {
      files.push({ name: fileName, content: match[2].trim(), type: ext });
    }
  }

  return { cleanContent, files };
}

// ─── Utility: Generate XLSX from CSV data ─────────────────────
async function generateXLSX(csvContent: string, fileName: string): Promise<void> {
  const XLSX = await import('xlsx');
  // Parse CSV (semicolon or comma separated)
  const lines = csvContent.split('\n').filter(l => l.trim());
  const separator = lines[0]?.includes(';') ? ';' : ',';
  const data = lines.map(line => line.split(separator).map(cell => cell.trim().replace(/^"|"$/g, '')));
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Auto-size columns
  const colWidths = data[0]?.map((_, colIdx) => {
    const maxLen = Math.max(...data.map(row => (row[colIdx] || '').toString().length));
    return { wch: Math.min(maxLen + 2, 40) };
  }) || [];
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Données');
  XLSX.writeFile(wb, fileName.replace(/\.csv$/i, '.xlsx'));
}

// ─── Utility: Generate PDF from text/table data ───────────────
async function generatePDF(content: string, fileName: string, title?: string): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Title
  const reportTitle = title || fileName.replace(/\.[^.]+$/, '').replace(/_/g, ' ');
  doc.setFontSize(16);
  doc.setTextColor(15, 118, 110);
  doc.text(`SIGG GMAO - ${reportTitle}`, 14, 15);

  // Date
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Généré par MANTIS le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 14, 21);

  // Try to parse as table (CSV/TSV)
  const lines = content.split('\n').filter(l => l.trim());
  const separator = content.includes('\t') ? '\t' : content.includes(';') ? ';' : ',';

  if (lines.length > 1 && lines[0].includes(separator)) {
    const tableData = lines.map(line => line.split(separator).map(cell => cell.trim().replace(/^"|"$/g, '')));
    const headers = tableData[0];
    const rows = tableData.slice(1);

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 26,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [15, 118, 110], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 247, 246] },
      margin: { left: 14, right: 14 },
    });
  } else {
    // Plain text content
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    const splitText = doc.splitTextToSize(content, 260);
    doc.text(splitText, 14, 30);
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`MANTIS — SIGG GMAO | Page ${i}/${pageCount}`, 14, doc.internal.pageSize.height - 8);
  }

  doc.save(fileName.replace(/\.[^.]+$/, '.pdf'));
}

// ─── Utility: Download a file ──────────────────────────────────
async function downloadFile(file: GeneratedFile, targetFormat?: FileType) {
  // If requesting conversion to XLSX
  if (targetFormat === 'xlsx' || (file.type === 'xlsx' && !targetFormat)) {
    if (file.type === 'csv' || file.type === 'tsv') {
      await generateXLSX(file.content, file.name);
      return;
    }
  }

  // If requesting conversion to PDF
  if (targetFormat === 'pdf' || (file.type === 'pdf' && !targetFormat)) {
    await generatePDF(file.content, file.name);
    return;
  }

  // Standard text-based download
  const fmt = FILE_FORMATS[targetFormat || file.type];
  const blob = new Blob([file.content], { type: fmt?.mimeType || 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = targetFormat
    ? file.name.replace(/\.[^.]+$/, `.${FILE_FORMATS[targetFormat].ext}`)
    : file.name;
  link.click();
  URL.revokeObjectURL(url);
}

// ─── File icon component ───────────────────────────────────────
function FileDownloadCard({ file }: { file: GeneratedFile }) {
  const [showFormats, setShowFormats] = useState(false);
  const [copied, setCopied] = useState(false);
  const fmt = FILE_FORMATS[file.type] || FILE_FORMATS.txt;
  const FileIcon = fmt.icon;

  const availableConversions: FileType[] = [];
  if (file.type === 'csv' || file.type === 'tsv') {
    availableConversions.push('xlsx', 'pdf', 'json', 'html', 'xml');
  } else if (file.type === 'json') {
    availableConversions.push('csv', 'xlsx', 'pdf', 'xml', 'yaml');
  } else if (file.type === 'xml') {
    availableConversions.push('json', 'csv', 'xlsx', 'html');
  } else if (file.type === 'sql') {
    availableConversions.push('csv', 'json', 'xlsx');
  } else if (file.type === 'md') {
    availableConversions.push('pdf', 'html');
  } else if (file.type === 'txt') {
    availableConversions.push('pdf', 'csv', 'json');
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="rounded-lg p-2.5 mt-2"
      style={{
        backgroundColor: '#0D2818',
        border: '1px solid #1A4D2E',
      }}
    >
      {/* File info row */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: fmt.color + '20' }}
        >
          <FileIcon className="w-4.5 h-4.5" style={{ color: fmt.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-emerald-300 truncate">{file.name}</p>
          <p className="text-[10px] text-slate-400">
            {fmt.label} — {(file.content.length / 1024).toFixed(1)} Ko
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-slate-400 hover:text-white hover:bg-white/10"
            onClick={handleCopy}
            title="Copier"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
          <Button
            size="sm"
            className="h-7 px-3 text-[11px] gap-1.5 text-white font-medium"
            style={{ backgroundColor: '#0F766E' }}
            onClick={() => downloadFile(file)}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#14B8A6')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0F766E')}
          >
            <Download className="w-3 h-3" />
            Télécharger
          </Button>
          {availableConversions.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-slate-400 hover:text-white hover:bg-white/10"
              onClick={() => setShowFormats(!showFormats)}
              title="Autres formats"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Format conversion row */}
      <AnimatePresence>
        {showFormats && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-1.5 mt-2 pt-2" style={{ borderTop: '1px solid #1A4D2E' }}>
              <span className="text-[9px] text-slate-500 self-center mr-1">Convertir en :</span>
              {availableConversions.map((fmt) => {
                const targetFmt = FILE_FORMATS[fmt];
                const TargetIcon = targetFmt.icon;
                return (
                  <button
                    key={fmt}
                    onClick={() => downloadFile(file, fmt)}
                    className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md font-medium transition-colors"
                    style={{
                      backgroundColor: targetFmt.color + '15',
                      color: targetFmt.color,
                      border: `1px solid ${targetFmt.color}30`,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = targetFmt.color + '30')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = targetFmt.color + '15')}
                  >
                    <TargetIcon className="w-2.5 h-2.5" />
                    {targetFmt.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
  const panelWidth = isExpanded ? 560 : 420;
  const panelHeight = isExpanded ? 680 : 540;

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
            className="fixed bottom-6 right-6 z-50 w-[68px] h-[68px] rounded-2xl flex items-center justify-center group shadow-2xl transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 50%, #0EA5E9 100%)',
              boxShadow: '0 8px 32px rgba(15, 118, 110, 0.5), 0 0 0 4px rgba(20, 184, 166, 0.2)',
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
                style={{ background: '#DC2626' }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
            {/* Name badge */}
            <span
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-bold tracking-[0.2em] text-white px-3 py-1 rounded-full shadow-lg"
              style={{ background: '#0A4F47', border: '1px solid #14B8A6' }}
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
            className="fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-2xl shadow-2xl"
            style={{
              width: panelWidth,
              height: panelHeight,
              backgroundColor: '#0B1929',
              border: '2px solid #1A3A4A',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(15, 118, 110, 0.15)',
            }}
          >
            {/* ─── Header ─── */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #0A4F47 0%, #0C6B5F 50%, #0F766E 100%)',
                borderBottom: '2px solid #14B8A6',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #14B8A6, #0EA5E9)', border: '2px solid #5EEAD4' }}
                >
                  <Cpu className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white tracking-wider">{CHATBOT_NAME}</h3>
                    <span
                      className="text-[8px] font-bold px-2 py-0.5 rounded-full tracking-wider"
                      style={{ backgroundColor: '#14B8A6', color: '#022C22' }}
                    >
                      AUTONOME
                    </span>
                    <span
                      className="text-[8px] font-medium px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: '#164E3E', color: '#5EEAD4', border: '1px solid #1A6B5A' }}
                    >
                      {CHATBOT_VERSION}
                    </span>
                  </div>
                  <p className="text-[10px] text-teal-200 flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
                    <span className="font-medium">En ligne</span>
                    <span style={{ color: '#0D5C52' }}>|</span>
                    <span style={{ color: '#5EEAD4' }}>{moduleLabels[activeModule]}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 text-teal-300 hover:text-white hover:bg-teal-700/50"
                  onClick={clearChat}
                  title="Effacer la conversation"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 text-teal-300 hover:text-white hover:bg-teal-700/50"
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? 'Réduire' : 'Agrandir'}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 text-teal-300 hover:text-white hover:bg-teal-700/50"
                  onClick={() => setIsOpen(false)}
                  title="Fermer"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>



            {/* ─── Messages ─── */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
              style={{ backgroundColor: '#0B1929' }}
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
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #0F766E, #14B8A6, #0EA5E9)', border: '2px solid #5EEAD4' }}
                    >
                      <Cpu className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-white tracking-wider">{CHATBOT_NAME}</h4>
                    <p className="text-[10px] text-teal-400 mt-0.5 tracking-wide">{CHATBOT_FULL_NAME}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{CHATBOT_VERSION}</p>
                    <p className="text-xs text-slate-300 mt-3 max-w-[300px] leading-relaxed">
                      Assistant IA autonome spécialisé en maintenance industrielle gaz.
                      Génération de rapports, tableaux et fichiers téléchargeables.
                    </p>
                  </motion.div>

                  {/* Capability badges */}
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {[
                      { icon: Table2, label: 'Tableaux', color: '#F97316' },
                      { icon: FileDown, label: 'Rapports', color: '#14B8A6' },
                      { icon: Shield, label: 'Diagnostic', color: '#8B5CF6' },
                    ].map((cap) => (
                      <span
                        key={cap.label}
                        className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-medium"
                        style={{
                          backgroundColor: cap.color + '18',
                          color: cap.color,
                          border: `1px solid ${cap.color}30`,
                        }}
                      >
                        <cap.icon className="w-2.5 h-2.5" />
                        {cap.label}
                      </span>
                    ))}
                  </div>

                  {/* Suggested prompts */}
                  <div className="flex flex-col gap-1.5 w-full max-w-[340px]">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-teal-400" />
                      Suggestions — {moduleLabels[activeModule]}
                    </p>
                    {currentPrompts.prompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => sendMessage(prompt)}
                        className="flex items-center gap-2 h-auto py-2.5 px-3 text-left text-xs rounded-lg transition-all hover:scale-[1.02] font-medium"
                        style={{
                          backgroundColor: '#0F2937',
                          color: '#94A3B8',
                          border: '1px solid #1A3A4A',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#143040';
                          e.currentTarget.style.borderColor = '#14B8A6';
                          e.currentTarget.style.color = '#E2E8F0';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#0F2937';
                          e.currentTarget.style.borderColor = '#1A3A4A';
                          e.currentTarget.style.color = '#94A3B8';
                        }}
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
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
                          className="max-w-[92%] rounded-xl px-4 py-3 text-xs text-center"
                          style={{
                            backgroundColor: '#0A3D34',
                            border: '1px solid #14B8A6',
                          }}
                        >
                          <div className="flex items-center justify-center gap-2 mb-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                            <span className="font-bold text-teal-200 tracking-wider">{CHATBOT_NAME}</span>
                          </div>
                          <div
                            className="text-slate-200 prose prose-sm prose-invert max-w-none
                              [&_p]:mb-1 [&_strong]:text-teal-200
                              [&_table]:w-full [&_table]:border-collapse [&_table]:my-2
                              [&_th]:bg-teal-800 [&_th]:text-teal-100 [&_th]:text-[11px] [&_th]:font-bold [&_th]:px-3 [&_th]:py-2 [&_th]:border [&_th]:border-teal-600 [&_th]:text-left
                              [&_td]:text-[11px] [&_td]:px-3 [&_td]:py-2 [&_td]:border [&_td]:border-teal-700/50 [&_td]:text-slate-200
                              [&_tr:nth-child(even)_td]:bg-teal-900/30"
                          >
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                          <span className="text-[9px] text-teal-500 mt-1.5 block font-medium">{formatTime(msg.timestamp)}</span>
                        </div>
                      )}

                      {/* Assistant message */}
                      {msg.role === 'assistant' && (
                        <>
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md"
                            style={{ background: 'linear-gradient(135deg, #0F766E, #14B8A6)', border: '1px solid #5EEAD4' }}
                          >
                            <Cpu className="w-4 h-4 text-white" />
                          </div>
                          <div
                            className="max-w-[82%] rounded-xl px-4 py-3 text-sm"
                            style={{
                              backgroundColor: '#112240',
                              border: '1px solid #1A3A5C',
                            }}
                          >
                            {/* Markdown content with enhanced table styling */}
                            <div
                              className="prose prose-sm prose-invert max-w-none text-slate-200
                                [&_p]:mb-2 [&_p:last-child]:mb-0
                                [&_ul]:mb-2 [&_ol]:mb-2 [&_li]:mb-0.5
                                [&_strong]:text-teal-200 [&_em]:text-amber-300
                                [&_code]:text-teal-300 [&_code]:bg-teal-900/40 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded
                                [&_pre]:bg-[#0A1628] [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:text-xs [&_pre]:border [&_pre]:border-teal-800/50
                                [&_h1]:text-base [&_h1]:text-teal-200 [&_h1]:font-bold [&_h1]:mt-3 [&_h1]:mb-1.5 [&_h1]:pb-1 [&_h1]:border-b [&_h1]:border-teal-800/30
                                [&_h2]:text-sm [&_h2]:text-teal-300 [&_h2]:font-semibold [&_h2]:mt-2.5 [&_h2]:mb-1
                                [&_h3]:text-sm [&_h3]:text-cyan-300 [&_h3]:font-medium [&_h3]:mt-2 [&_h3]:mb-1

                                [&_table]:w-full [&_table]:border-collapse [&_table]:my-3 [&_table]:rounded-lg [&_table]:overflow-hidden
                                [&_thead]:bg-teal-800
                                [&_th]:text-teal-100 [&_th]:text-[11px] [&_th]:font-bold [&_th]:px-3 [&_th]:py-2.5 [&_th]:border [&_th]:border-teal-600 [&_th]:text-left [&_th]:uppercase [&_th]:tracking-wider
                                [&_td]:text-[11px] [&_td]:px-3 [&_td]:py-2 [&_td]:border [&_td]:border-slate-700/50 [&_td]:text-slate-200
                                [&_tbody_tr:nth-child(even)_td]:bg-slate-800/30
                                [&_tbody_tr:hover_td]:bg-teal-900/30
                                [&_blockquote]:border-l-3 [&_blockquote]:border-teal-500 [&_blockquote]:pl-3 [&_blockquote]:text-slate-300 [&_blockquote]:bg-teal-900/10 [&_blockquote]:py-1 [&_blockquote]:rounded-r
                                [&_hr]:border-slate-700/50 [&_hr]:my-2"
                            >
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>

                            {/* Downloadable files */}
                            {msg.files && msg.files.length > 0 && (
                              <div className="mt-3 space-y-2">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <FileDown className="w-3 h-3 text-emerald-400" />
                                  <span className="text-[10px] font-semibold text-emerald-300 uppercase tracking-wider">
                                    Fichiers générés ({msg.files.length})
                                  </span>
                                </div>
                                {msg.files.map((file) => (
                                  <FileDownloadCard key={file.name} file={file} />
                                ))}
                              </div>
                            )}

                            <span className="text-[9px] text-slate-600 mt-2 block">{formatTime(msg.timestamp)}</span>
                          </div>
                        </>
                      )}

                      {/* User message */}
                      {msg.role === 'user' && (
                        <>
                          <div
                            className="max-w-[80%] rounded-xl px-4 py-2.5 text-sm text-white shadow-md"
                            style={{
                              background: 'linear-gradient(135deg, #0F766E, #0D9488)',
                              border: '1px solid #14B8A6',
                            }}
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            <span className="text-[9px] opacity-60 mt-1 block">{formatTime(msg.timestamp)}</span>
                          </div>
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
                          >
                            <User className="w-4 h-4 text-slate-300" />
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}

                  {/* Typing indicator */}
                  {sending && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
                        style={{ background: 'linear-gradient(135deg, #0F766E, #14B8A6)', border: '1px solid #5EEAD4' }}
                      >
                        <Cpu className="w-4 h-4 text-white" />
                      </div>
                      <div
                        className="rounded-xl px-4 py-3"
                        style={{ backgroundColor: '#112240', border: '1px solid #1A3A5C' }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-[10px] text-teal-300 font-medium ml-1">{CHATBOT_NAME} analyse...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>

            {/* ─── Quick prompts ─── */}
            {messages.length > 0 && !sending && (
              <div
                className="px-3 pb-1.5 flex gap-1.5 overflow-x-auto flex-shrink-0"
                style={{ backgroundColor: '#0B1929' }}
              >
                {currentPrompts.prompts.slice(0, 3).map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="flex-shrink-0 text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors whitespace-nowrap font-medium"
                    style={{
                      backgroundColor: '#0F2937',
                      color: '#5EEAD4',
                      border: '1px solid #1A3A4A',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#143040';
                      e.currentTarget.style.borderColor = '#14B8A6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#0F2937';
                      e.currentTarget.style.borderColor = '#1A3A4A';
                    }}
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    {prompt.length > 30 ? prompt.substring(0, 30) + '...' : prompt}
                  </button>
                ))}
              </div>
            )}

            {/* ─── Input ─── */}
            <div
              className="p-3 flex-shrink-0"
              style={{
                backgroundColor: '#091420',
                borderTop: '2px solid #1A3A4A',
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
                  className="h-11 text-sm text-white placeholder:text-slate-500 border-slate-600 focus:border-teal-500"
                  style={{
                    backgroundColor: '#0F2937',
                    borderColor: '#1A3A4A',
                  }}
                  disabled={sending}
                />
                <Button
                  type="submit"
                  disabled={sending || !input.trim()}
                  size="icon"
                  className="h-11 w-11 flex-shrink-0 text-white shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #0F766E, #14B8A6)',
                    border: '1px solid #5EEAD4',
                  }}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <div className="flex items-center justify-between mt-2 px-1">
                <span className="text-[9px] font-bold text-teal-500 tracking-wider">{CHATBOT_NAME}</span>
                <span className="text-[8px] text-slate-600">{CHATBOT_VERSION}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
