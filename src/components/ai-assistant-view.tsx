'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Bot, Send, Sparkles, User, Loader2, Cpu,
  Download, FileText, FileSpreadsheet, FileDown,
  FileCode, Copy, Check, MoreHorizontal,
} from 'lucide-react';
import { api } from '@/lib/api';
import ReactMarkdown from 'react-markdown';

// ─── Types ─────────────────────────────────────────────────────
type FileType = 'csv' | 'json' | 'txt' | 'xml' | 'html' | 'sql' | 'md' | 'yaml' | 'xlsx' | 'pdf' | 'tsv';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  files?: GeneratedFile[];
}

interface GeneratedFile {
  name: string;
  content: string;
  type: FileType;
}

const FILE_FORMATS: Record<FileType, { label: string; icon: React.ElementType; color: string; mimeType: string }> = {
  csv:   { label: 'CSV',      icon: FileSpreadsheet, color: '#16A34A', mimeType: 'text/csv;charset=utf-8;' },
  xlsx:  { label: 'Excel',    icon: FileSpreadsheet, color: '#0D7C3E', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  pdf:   { label: 'PDF',      icon: FileText,        color: '#DC2626', mimeType: 'application/pdf' },
  json:  { label: 'JSON',     icon: FileCode,        color: '#3B82F6', mimeType: 'application/json;charset=utf-8;' },
  xml:   { label: 'XML',      icon: FileCode,        color: '#8B5CF6', mimeType: 'application/xml;charset=utf-8;' },
  html:  { label: 'HTML',     icon: FileCode,        color: '#F97316', mimeType: 'text/html;charset=utf-8;' },
  sql:   { label: 'SQL',      icon: FileCode,        color: '#06B6D4', mimeType: 'text/plain;charset=utf-8;' },
  md:    { label: 'Markdown', icon: FileText,        color: '#6366F1', mimeType: 'text/markdown;charset=utf-8;' },
  yaml:  { label: 'YAML',     icon: FileCode,        color: '#EC4899', mimeType: 'text/yaml;charset=utf-8;' },
  txt:   { label: 'TXT',      icon: FileText,        color: '#6B7280', mimeType: 'text/plain;charset=utf-8;' },
  tsv:   { label: 'TSV',      icon: FileSpreadsheet, color: '#14B8A6', mimeType: 'text/tab-separated-values;charset=utf-8;' },
};

// ─── Utility: Extract files from AI response ──────────────────
function extractFilesFromContent(content: string): { cleanContent: string; files: GeneratedFile[] } {
  const files: GeneratedFile[] = [];
  const codeBlockRegex = /```(csv|json|txt|xml|html|sql|md|markdown|yaml|yml|tsv)\n([\s\S]*?)```/gi;
  let match;
  let cleanContent = content;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const rawType = match[1].toLowerCase();
    const fileType: FileType = rawType === 'markdown' ? 'md' : rawType === 'yml' ? 'yaml' : rawType as FileType;
    const fileContent = match[2].trim();
    const fileMatch = fileContent.match(/<!--\s*FILE:\s*(.+?)\s*-->/i);
    const fileName = fileMatch ? fileMatch[1].trim() : `rapport_sigg_${new Date().toISOString().slice(0, 10)}.${FILE_FORMATS[fileType]?.ext || fileType}`;
    const cleanFileContent = fileContent.replace(/<!--\s*FILE:\s*.+?\s*-->\n?/i, '');
    if (FILE_FORMATS[fileType]) {
      files.push({ name: fileName, content: cleanFileContent, type: fileType });
    }
  }

  return { cleanContent, files };
}

// ─── Utility: Generate XLSX ───────────────────────────────────
async function generateXLSX(csvContent: string, fileName: string): Promise<void> {
  const XLSX = await import('xlsx');
  const lines = csvContent.split('\n').filter(l => l.trim());
  const separator = lines[0]?.includes(';') ? ';' : ',';
  const data = lines.map(line => line.split(separator).map(cell => cell.trim().replace(/^"|"$/g, '')));
  const ws = XLSX.utils.aoa_to_sheet(data);
  const colWidths = data[0]?.map((_, colIdx) => ({
    wch: Math.min(Math.max(...data.map(row => (row[colIdx] || '').toString().length)) + 2, 40),
  })) || [];
  ws['!cols'] = colWidths;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Données');
  XLSX.writeFile(wb, fileName.replace(/\.csv$/i, '.xlsx'));
}

// ─── Utility: Generate PDF ────────────────────────────────────
async function generatePDF(content: string, fileName: string, title?: string): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const reportTitle = title || fileName.replace(/\.[^.]+$/, '').replace(/_/g, ' ');
  doc.setFontSize(16);
  doc.setTextColor(15, 118, 110);
  doc.text(`SIGG GMAO - ${reportTitle}`, 14, 15);
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Généré par MANTIS le ${new Date().toLocaleDateString('fr-FR')}`, 14, 21);
  const lines = content.split('\n').filter(l => l.trim());
  const separator = content.includes('\t') ? '\t' : content.includes(';') ? ';' : ',';
  if (lines.length > 1 && lines[0].includes(separator)) {
    const tableData = lines.map(line => line.split(separator).map(cell => cell.trim().replace(/^"|"$/g, '')));
    autoTable(doc, {
      head: [tableData[0]],
      body: tableData.slice(1),
      startY: 26,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [15, 118, 110], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 247, 246] },
    });
  } else {
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(doc.splitTextToSize(content, 260), 14, 30);
  }
  doc.save(fileName.replace(/\.[^.]+$/, '.pdf'));
}

// ─── Utility: Download file ────────────────────────────────────
async function downloadFile(file: GeneratedFile, targetFormat?: FileType) {
  if (targetFormat === 'xlsx' || (file.type === 'xlsx' && !targetFormat)) {
    if (file.type === 'csv' || file.type === 'tsv') { await generateXLSX(file.content, file.name); return; }
  }
  if (targetFormat === 'pdf' || (file.type === 'pdf' && !targetFormat)) {
    await generatePDF(file.content, file.name); return;
  }
  const fmt = FILE_FORMATS[targetFormat || file.type];
  const blob = new Blob([file.content], { type: fmt?.mimeType || 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = targetFormat ? file.name.replace(/\.[^.]+$/, `.${FILE_FORMATS[targetFormat].label.toLowerCase()}`) : file.name;
  link.click();
  URL.revokeObjectURL(url);
}

// ─── File Download Card ────────────────────────────────────────
function FileDownloadCard({ file }: { file: GeneratedFile }) {
  const [showFormats, setShowFormats] = useState(false);
  const [copied, setCopied] = useState(false);
  const fmt = FILE_FORMATS[file.type] || FILE_FORMATS.txt;
  const FileIcon = fmt.icon;

  const availableConversions: FileType[] = [];
  if (file.type === 'csv' || file.type === 'tsv') availableConversions.push('xlsx', 'pdf', 'json', 'html', 'xml');
  else if (file.type === 'json') availableConversions.push('csv', 'xlsx', 'pdf', 'yaml');
  else if (file.type === 'xml') availableConversions.push('json', 'csv', 'xlsx');
  else if (file.type === 'md') availableConversions.push('pdf', 'html');
  else if (file.type === 'txt') availableConversions.push('pdf', 'csv', 'json');

  return (
    <div className="rounded-lg p-3 mt-2 border" style={{ backgroundColor: '#0D2818', borderColor: '#1A4D2E' }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: fmt.color + '20' }}>
          <FileIcon className="w-4.5 h-4.5" style={{ color: fmt.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-emerald-300 truncate">{file.name}</p>
          <p className="text-[10px] text-slate-400">{fmt.label} — {(file.content.length / 1024).toFixed(1)} Ko</p>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-slate-400 hover:text-white" onClick={() => { navigator.clipboard.writeText(file.content); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
          <Button size="sm" className="h-7 px-3 text-[11px] gap-1 text-white font-medium" style={{ backgroundColor: '#0F766E' }} onClick={() => downloadFile(file)}>
            <Download className="w-3 h-3" /> Télécharger
          </Button>
          {availableConversions.length > 0 && (
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-slate-400 hover:text-white" onClick={() => setShowFormats(!showFormats)}>
              <MoreHorizontal className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
      <AnimatePresence>
        {showFormats && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="flex flex-wrap gap-1.5 mt-2 pt-2" style={{ borderTop: '1px solid #1A4D2E' }}>
              <span className="text-[9px] text-slate-500 self-center mr-1">Convertir en :</span>
              {availableConversions.map((f) => {
                const tf = FILE_FORMATS[f];
                return (
                  <button key={f} onClick={() => downloadFile(file, f)} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md font-medium" style={{ backgroundColor: tf.color + '15', color: tf.color, border: `1px solid ${tf.color}30` }}>
                    <tf.icon className="w-2.5 h-2.5" /> {tf.label}
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
const suggestedPrompts = [
  "Génère un rapport KPI en CSV ou Excel",
  "Rapport complet des équipements en PDF",
  "Export SQL de la base équipements",
  "Rapport incidents en XML ou JSON",
];

export function AIAssistantView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = useCallback(async (text?: string) => {
    const content = text || input.trim();
    if (!content || sending) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const conversationHistory = messages.map((m) => ({ role: m.role, content: m.content }));
      const contextInfo = `L'utilisateur utilise le module Assistant IA de la plateforme GMAO SIGG. Il a accès à la génération de fichiers en 11 formats: CSV, Excel, PDF, JSON, XML, HTML, SQL, Markdown, YAML, TXT, TSV.`;
      const res = await api.sendAIChat(content, conversationHistory, contextInfo);
      const rawContent = res.response || res.message || res.data || 'Je suis MANTIS, votre assistant maintenance. Comment puis-je vous aider ?';
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
  }, [input, sending, messages]);

  const formatTime = (date: Date) =>
    new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(date);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Chat area */}
      <Card className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: '#0B1929', borderColor: '#1A3A4A' }}>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-6">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #0F766E, #14B8A6, #0EA5E9)', border: '2px solid #5EEAD4' }}
                >
                  <Cpu className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">MANTIS — Assistant IA</h3>
                <p className="text-[10px] text-teal-400 mt-1">Maintenance Analysis & Technical Intelligence System</p>
                <p className="text-sm text-slate-300 mt-3 max-w-md">
                  Génération de rapports et fichiers en <strong className="text-teal-300">11 formats</strong> : CSV, Excel, PDF, JSON, XML, HTML, SQL, Markdown, YAML, TXT, TSV
                </p>
              </motion.div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="flex items-center gap-2 h-auto py-3 px-4 text-left text-xs rounded-lg font-medium transition-colors whitespace-normal"
                    style={{ backgroundColor: '#0F2937', color: '#94A3B8', border: '1px solid #1A3A4A' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#14B8A6'; e.currentTarget.style.color = '#E2E8F0'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1A3A4A'; e.currentTarget.style.color = '#94A3B8'; }}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
                      style={{ background: 'linear-gradient(135deg, #0F766E, #14B8A6)', border: '1px solid #5EEAD4' }}
                    >
                      <Cpu className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-xl px-4 py-3 text-sm ${
                      msg.role === 'user'
                        ? 'text-white'
                        : ''
                    }`}
                    style={msg.role === 'user' ? {
                      background: 'linear-gradient(135deg, #0F766E, #0D9488)',
                      border: '1px solid #14B8A6',
                    } : {
                      backgroundColor: '#112240',
                      border: '1px solid #1A3A5C',
                    }}
                  >
                    {msg.role === 'assistant' ? (
                      <>
                        <div
                          className="prose prose-sm prose-invert max-w-none text-slate-200
                            [&_p]:mb-2 [&_p:last-child]:mb-0
                            [&_strong]:text-teal-200 [&_em]:text-amber-300
                            [&_code]:text-teal-300 [&_code]:bg-teal-900/40 [&_code]:px-1 [&_code]:rounded
                            [&_pre]:bg-[#0A1628] [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:text-xs [&_pre]:border [&_pre]:border-teal-800/50
                            [&_h1]:text-base [&_h1]:text-teal-200 [&_h1]:font-bold [&_h1]:mt-3 [&_h1]:mb-1.5
                            [&_h2]:text-sm [&_h2]:text-teal-300 [&_h2]:font-semibold [&_h2]:mt-2.5 [&_h2]:mb-1
                            [&_h3]:text-sm [&_h3]:text-cyan-300 [&_h3]:font-medium
                            [&_table]:w-full [&_table]:border-collapse [&_table]:my-3
                            [&_thead]:bg-teal-800
                            [&_th]:text-teal-100 [&_th]:text-[11px] [&_th]:font-bold [&_th]:px-3 [&_th]:py-2 [&_th]:border [&_th]:border-teal-600 [&_th]:text-left
                            [&_td]:text-[11px] [&_td]:px-3 [&_td]:py-2 [&_td]:border [&_td]:border-slate-700/50 [&_td]:text-slate-200
                            [&_tbody_tr:nth-child(even)_td]:bg-slate-800/30
                            [&_tr:hover_td]:bg-teal-900/30
                            [&_blockquote]:border-l-3 [&_blockquote]:border-teal-500 [&_blockquote]:pl-3 [&_blockquote]:text-slate-300"
                        >
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
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
                      </>
                    ) : (
                      <>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <span className="text-[9px] opacity-60 mt-1 block">{formatTime(msg.timestamp)}</span>
                      </>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}>
                      <User className="w-4 h-4 text-slate-300" />
                    </div>
                  )}
                </motion.div>
              ))}
              {sending && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md" style={{ background: 'linear-gradient(135deg, #0F766E, #14B8A6)', border: '1px solid #5EEAD4' }}>
                    <Cpu className="w-4 h-4 text-white" />
                  </div>
                  <div className="rounded-xl px-4 py-3" style={{ backgroundColor: '#112240', border: '1px solid #1A3A5C' }}>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-sm text-teal-300 font-medium ml-1">MANTIS analyse...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Input area */}
      <div className="mt-3 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Demander à MANTIS..."
          className="h-11 text-white placeholder:text-slate-500"
          style={{ backgroundColor: '#0F2937', borderColor: '#1A3A4A' }}
          disabled={sending}
        />
        <Button
          onClick={() => sendMessage()}
          disabled={sending || !input.trim()}
          size="icon"
          className="h-11 w-11 text-white shadow-lg"
          style={{ background: 'linear-gradient(135deg, #0F766E, #14B8A6)', border: '1px solid #5EEAD4' }}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
