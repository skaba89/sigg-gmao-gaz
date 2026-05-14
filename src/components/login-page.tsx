'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Flame,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  Server,
  AlertTriangle,
  ChevronRight,
  Lock,
  Mail,
  Activity,
  Wrench,
  ClipboardList,
  Crown,
  UserCog,
  HardHat,
  BarChart3,
  Cpu,
  Bell,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { api } from '@/lib/api';

interface LoginProps {
  onLogin: (user: any, token: string) => void;
}

// SIGG role profiles with icons and permissions
const roleProfiles = [
  {
    key: 'admin',
    label: 'Dir. Général',
    sublabel: 'Direction Générale',
    icon: Crown,
    color: '#0F766E',
    bgColor: 'rgba(15, 118, 110, 0.15)',
    borderColor: 'rgba(15, 118, 110, 0.3)',
    email: 'admin@sigg-gn.com',
    password: 'admin123',
    permissions: ['Toutes lectures', 'Tableau de bord exécutif', 'Validation budgétaire'],
  },
  {
    key: 'resp-maint',
    label: 'Resp. Maintenance',
    sublabel: 'Service Maintenance',
    icon: Wrench,
    color: '#F97316',
    bgColor: 'rgba(249, 115, 22, 0.15)',
    borderColor: 'rgba(249, 115, 22, 0.3)',
    email: 'resp.maint@sigg-gn.com',
    password: 'demo123',
    permissions: ['Gestion OT', 'Plans maintenance', 'Rapports techniques'],
  },
  {
    key: 'technicien',
    label: 'Technicien',
    sublabel: 'Équipe terrain',
    icon: HardHat,
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    email: 'tech1@sigg-gn.com',
    password: 'demo123',
    permissions: ['Ordres de travail', 'Signalements', 'Consultation équipements'],
  },
  {
    key: 'resp-stock',
    label: 'Resp. Stock',
    sublabel: 'Service Logistique',
    icon: UserCog,
    color: '#A855F7',
    bgColor: 'rgba(168, 85, 247, 0.15)',
    borderColor: 'rgba(168, 85, 247, 0.3)',
    email: 'resp.stock@sigg-gn.com',
    password: 'demo123',
    permissions: ['Mouvements stock', 'Commandes fournisseur', 'Inventaire'],
  },
];

// Feature cards for left panel
const featureCards = [
  {
    icon: Activity,
    title: 'Supervision Équipements',
    description: 'Surveillance en temps réel des actifs gaziers',
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.12)',
  },
  {
    icon: Cpu,
    title: 'Maintenance Prédictive',
    description: 'Intelligence artificielle et analyse prédictive',
    color: '#A855F7',
    bgColor: 'rgba(168, 85, 247, 0.12)',
  },
  {
    icon: ClipboardList,
    title: 'Gestion Interventions',
    description: 'Planification et suivi des ordres de travail',
    color: '#F97316',
    bgColor: 'rgba(249, 115, 22, 0.12)',
  },
  {
    icon: Bell,
    title: 'Alertes & Incidents',
    description: 'Détection proactive et gestion des urgences',
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.12)',
  },
];

export function LoginPage({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);

    try {
      const res = await api.login(email, password);
      if (res.token && res.user) {
        onLogin(res.user, res.token);
      } else {
        setError(res.error || 'Identifiants invalides');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion au serveur');
    }

    setLoading(false);
  };

  const selectProfile = (profile: typeof roleProfiles[0]) => {
    setSelectedProfile(profile.key);
    setEmail(profile.email);
    setPassword(profile.password);
    setError('');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-[#0a1628]">
      {/* Network pattern background */}
      <div className="absolute inset-0">
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#3b82f6" strokeWidth="0.5" />
            </pattern>
            <pattern id="dots" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="0" cy="0" r="1.5" fill="#3b82f6" opacity="0.5" />
              <circle cx="80" cy="0" r="1.5" fill="#3b82f6" opacity="0.5" />
              <circle cx="0" cy="80" r="1.5" fill="#3b82f6" opacity="0.5" />
              <circle cx="80" cy="80" r="1.5" fill="#3b82f6" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        {/* Animated gradient orbs */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.06, 0.12, 0.06] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-[20%] -right-[10%] w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(15, 118, 110, 0.25) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.1, 0.04] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute -bottom-[15%] -left-[10%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)' }}
        />

        {/* Map outline of Guinea - simplified */}
        <svg
          className="absolute bottom-[5%] left-[8%] w-[300px] h-[350px] opacity-[0.04]"
          viewBox="0 0 200 230"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 10 C60 20, 20 60, 30 110 C40 160, 70 200, 100 220 C130 200, 170 160, 180 110 C190 60, 150 20, 100 10Z"
            stroke="#3b82f6"
            strokeWidth="1.5"
            fill="rgba(59, 130, 246, 0.05)"
          />
          {/* Conakry dot */}
          <circle cx="65" cy="185" r="4" fill="#3b82f6" opacity="0.8" />
          <circle cx="65" cy="185" r="8" fill="none" stroke="#3b82f6" strokeWidth="0.5" opacity="0.4" />
          {/* Kamsar dot */}
          <circle cx="55" cy="130" r="3" fill="#0F766E" opacity="0.7" />
          {/* Boké dot */}
          <circle cx="40" cy="105" r="3" fill="#F97316" opacity="0.7" />
          {/* Nzérékoré dot */}
          <circle cx="150" cy="60" r="3" fill="#A855F7" opacity="0.7" />
        </svg>
      </div>

      {/* ==================== LEFT PANEL ==================== */}
      <div className="hidden lg:flex lg:w-[58%] relative z-10 flex-col justify-between py-10 px-12">
        {/* Top: Guinea branding */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-1"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-12 rounded overflow-hidden shadow-md">
              <div className="w-1/3 bg-[#CE1126]" />
              <div className="w-1/3 bg-[#FCD116]" />
              <div className="w-1/3 bg-[#009460]" />
            </div>
            <span className="text-[#CE1126] font-semibold italic text-lg tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
              Guinée
            </span>
          </div>
          <p className="text-[11px] tracking-[0.2em] text-slate-500 uppercase ml-[60px]">
            République de Guinée
          </p>
        </motion.div>

        {/* Middle: Main branding */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="space-y-6 -mt-4"
        >
          {/* Logo + title */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #0F766E, #14B8A6)' }}>
              <Flame className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">SIGG GMAO</h1>
              <p className="text-xs text-slate-400 tracking-wide">
                Société Interprofessionnelle du Gaz de Guinée
              </p>
            </div>
          </div>

          {/* Main heading */}
          <div>
            <h2 className="text-[28px] font-bold text-white leading-tight">
              Plateforme Nationale de Gestion
              <br />
              de <span style={{ color: '#14B8A6' }}>Maintenance Assistée par Ordinateur</span>
            </h2>
            <p className="text-sm text-slate-400 mt-3 max-w-lg leading-relaxed">
              Système intégré de surveillance prédictive, gestion des interventions et optimisation
              des actifs pour le secteur gazier de la République de Guinée.
            </p>
          </div>

          {/* Color bar separator */}
          <div className="flex gap-0.5 h-1 w-32 rounded-full overflow-hidden">
            <div className="w-1/4 bg-[#CE1126]" />
            <div className="w-1/4 bg-[#F97316]" />
            <div className="w-1/4 bg-[#FCD116]" />
            <div className="w-1/4 bg-[#009460]" />
          </div>

          {/* Feature cards grid */}
          <div className="grid grid-cols-2 gap-3 max-w-lg">
            {featureCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="rounded-xl p-3.5 border border-white/[0.06] transition-all duration-200 hover:border-white/[0.12] cursor-default"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)' }}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: card.bgColor }}
                  >
                    <card.icon className="w-4 h-4" style={{ color: card.color }} />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-medium text-white">{card.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{card.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom: Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex items-center gap-3"
        >
          <div className="flex h-4 w-6 rounded overflow-hidden">
            <div className="w-1/3 bg-[#CE1126]" />
            <div className="w-1/3 bg-[#FCD116]" />
            <div className="w-1/3 bg-[#009460]" />
          </div>
          <span className="text-[10px] text-slate-600 tracking-wide">
            SIGG — Conakry, République de Guinée © {new Date().getFullYear()}
          </span>
        </motion.div>
      </div>

      {/* ==================== RIGHT PANEL ==================== */}
      <div className="w-full lg:w-[42%] relative z-10 flex items-center justify-center p-5 lg:p-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #0F766E, #14B8A6)' }}>
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">SIGG GMAO</h1>
              <p className="text-[10px] text-slate-400">Smart Maintenance Platform</p>
            </div>
          </div>

          {/* Login card - glassmorphism */}
          <div
            className="rounded-2xl p-7 border border-white/[0.08]"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Header */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white">Connexion</h3>
              <p className="text-sm text-slate-400 mt-1">Accédez à votre espace de travail</p>
            </div>

            {/* Profile selection */}
            <div className="mb-5">
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-3">
                Sélectionnez votre profil
              </p>
              <div className="grid grid-cols-2 gap-2">
                {roleProfiles.map((profile) => (
                  <motion.button
                    key={profile.key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => selectProfile(profile)}
                    className={`rounded-xl p-3 text-left border transition-all duration-200 ${
                      selectedProfile === profile.key
                        ? 'border-white/20 shadow-lg'
                        : 'border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                    style={{
                      backgroundColor:
                        selectedProfile === profile.key
                          ? profile.bgColor
                          : 'rgba(255, 255, 255, 0.03)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <profile.icon className="w-4 h-4 flex-shrink-0" style={{ color: profile.color }} />
                      <span className="text-[12px] font-medium text-white">{profile.label}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 ml-6">{profile.sublabel}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Permissions display */}
            <AnimatePresence>
              {selectedProfile && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="mb-5 overflow-hidden"
                >
                  <div className="rounded-xl p-3 border border-white/[0.06]" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-3.5 h-3.5" style={{ color: roleProfiles.find(p => p.key === selectedProfile)?.color }} />
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Permissions {roleProfiles.find(p => p.key === selectedProfile)?.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {roleProfiles
                        .find(p => p.key === selectedProfile)
                        ?.permissions.map((perm) => (
                          <span
                            key={perm}
                            className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border border-white/[0.08]"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8' }}
                          >
                            <CheckCircle2 className="w-2.5 h-2.5" style={{ color: roleProfiles.find(p => p.key === selectedProfile)?.color }} />
                            {perm}
                          </span>
                        ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 rounded-lg border text-sm flex items-center gap-2"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderColor: 'rgba(239, 68, 68, 0.2)',
                    color: '#fca5a5',
                  }}
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  Adresse email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@sigg-gn.com"
                  className="h-11 text-sm text-white placeholder:text-slate-600 border-white/[0.08] focus:border-[#0F766E]/50"
                  style={{ backgroundColor: 'rgba(30, 41, 59, 0.6)' }}
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  Mot de passe
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Entrez votre mot de passe"
                    className="h-11 text-sm text-white placeholder:text-slate-600 border-white/[0.08] focus:border-[#0F766E]/50 pr-10"
                    style={{ backgroundColor: 'rgba(30, 41, 59, 0.6)' }}
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Login button with gradient */}
              <Button
                type="submit"
                className="w-full h-11 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #0F766E 100%)',
                  boxShadow: '0 8px 25px -5px rgba(15, 118, 110, 0.35)',
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    Se connecter
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </form>

            {/* Forgot password */}
            <div className="mt-4 text-center">
              <button className="text-[12px] text-[#60a5fa] hover:text-[#93bbfd] transition-colors">
                Mot de passe oublié ?
              </button>
            </div>

            {/* Demo info */}
            <div className="mt-5 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-3 h-3 text-[#FCD116]" />
                <p className="text-[10px] text-slate-600">
                  Sélectionnez un profil ci-dessus pour remplir automatiquement les identifiants de démonstration
                </p>
              </div>
            </div>
          </div>

          {/* Bottom branding */}
          <div className="mt-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <div className="flex h-3.5 w-5 rounded overflow-hidden">
                <div className="w-1/3 bg-[#CE1126]" />
                <div className="w-1/3 bg-[#FCD116]" />
                <div className="w-1/3 bg-[#009460]" />
              </div>
              <span className="text-[9px] text-slate-700 tracking-[0.15em] uppercase">
                République de Guinée
              </span>
            </div>
            <p className="text-[9px] text-slate-700">
              SIGG GMAO v2.0 — Plateforme de Maintenance Intelligente
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
