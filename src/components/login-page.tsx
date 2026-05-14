'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
} from 'lucide-react';
import { api } from '@/lib/api';

interface LoginProps {
  onLogin: (user: any, token: string) => void;
}

export function LoginPage({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

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

  // Demo credentials quick-fill
  const fillDemo = (role: string) => {
    const demoCreds: Record<string, { email: string; password: string }> = {
      admin: { email: 'admin@sigg-gn.com', password: 'admin123' },
      tech: { email: 'tech1@sigg-gn.com', password: 'demo123' },
      manager: { email: 'resp.maint@sigg-gn.com', password: 'demo123' },
    };
    const cred = demoCreds[role];
    if (cred) {
      setEmail(cred.email);
      setPassword(cred.password);
      setError('');
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-[oklch(0.13_0.015_250)]">
      {/* Animated background patterns */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Guinea flag colors - subtle gradient bars */}
        <div className="absolute top-0 left-0 w-2 h-full bg-[#CE1126] opacity-30" />
        <div className="absolute top-0 left-2 w-2 h-full bg-[#FCD116] opacity-30" />
        <div className="absolute top-0 left-4 w-2 h-full bg-[#009460] opacity-30" />

        {/* Large gradient orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.08, 0.15, 0.08],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, oklch(0.55 0.14 175 / 20%) 0%, transparent 70%)',
          }}
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.05, 0.12, 0.05],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, oklch(0.65 0.18 45 / 15%) 0%, transparent 70%)',
          }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(oklch(1 0 0 / 100%) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 100%) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Floating geometric shapes */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              x: [0, (i % 2 === 0 ? 15 : -15), 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 15 + i * 3,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 2,
            }}
            className="absolute border border-primary/10 rounded-lg"
            style={{
              width: 30 + i * 15,
              height: 30 + i * 15,
              top: `${15 + i * 14}%`,
              left: `${10 + i * 15}%`,
            }}
          />
        ))}
      </div>

      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-[55%] relative z-10 flex-col justify-between p-12">
        <div>
          {/* Guinea flag badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 mb-8"
          >
            <div className="flex h-6 w-10 rounded overflow-hidden shadow-md">
              <div className="w-1/3 bg-[#CE1126]" />
              <div className="w-1/3 bg-[#FCD116]" />
              <div className="w-1/3 bg-[#009460]" />
            </div>
            <span className="text-xs font-medium text-muted-foreground/70 tracking-wide">
              RÉPUBLIQUE DE GUINÉE
            </span>
          </motion.div>
        </div>

        {/* Main branding content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="space-y-8"
        >
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl teal-gradient flex items-center justify-center shadow-lg shadow-primary/25">
              <Flame className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">SIGG GMAO</h1>
              <p className="text-sm text-muted-foreground">
                Société Interprofessionnelle du Gaz de Guinée
              </p>
            </div>
          </div>

          {/* Tagline */}
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-foreground leading-tight">
              Smart Maintenance
              <br />
              <span className="text-primary">Platform</span>
            </h2>
            <p className="text-base text-muted-foreground max-w-md leading-relaxed">
              Plateforme intelligente de gestion de maintenance assistée par ordinateur.
              Surveillance prédictive, gestion des interventions et optimisation des actifs
              pour le secteur gazier guinéen.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="flex flex-col gap-3">
            {[
              { icon: Shield, text: 'Maintenance prédictive par IA', color: 'text-primary' },
              { icon: Server, text: 'Supervision temps réel des équipements', color: 'text-sigg-orange' },
              { icon: AlertTriangle, text: 'Gestion proactive des incidents', color: 'text-sigg-green' },
            ].map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.15 }}
                className="flex items-center gap-3 text-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feat.icon className={`w-4 h-4 ${feat.color}`} />
                </div>
                <span className="text-foreground/80">{feat.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex items-center gap-3"
        >
          <div className="flex h-5 w-8 rounded overflow-hidden">
            <div className="w-1/3 bg-[#CE1126]" />
            <div className="w-1/3 bg-[#FCD116]" />
            <div className="w-1/3 bg-[#009460]" />
          </div>
          <span className="text-[11px] text-muted-foreground/50">
            SIGG — Conakry, République de Guinée © {new Date().getFullYear()}
          </span>
        </motion.div>
      </div>

      {/* Right panel - Login form */}
      <div className="w-full lg:w-[45%] relative z-10 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl teal-gradient flex items-center justify-center shadow-lg shadow-primary/25">
              <Flame className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">SIGG GMAO</h1>
              <p className="text-xs text-muted-foreground">Smart Maintenance Platform</p>
            </div>
          </div>

          {/* Login card */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl shadow-black/20">
            <CardContent className="p-8">
              {/* Card header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="w-14 h-14 rounded-2xl teal-gradient flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20"
                >
                  <Lock className="w-7 h-7 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold text-foreground">Connexion</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Accédez à votre plateforme de maintenance
                </p>
              </div>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                    Adresse email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre.email@sigg-gn.com"
                    className="h-11 bg-background/50 border-border/50 focus:border-primary/50"
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Entrez votre mot de passe"
                      className="h-11 bg-background/50 border-border/50 focus:border-primary/50 pr-10"
                      autoComplete="current-password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 teal-gradient text-white font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
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

              {/* Demo accounts */}
              <div className="mt-6 pt-5 border-t border-border/30">
                <p className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-3 text-center">
                  Comptes de démonstration
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { role: 'admin', label: 'Admin', color: 'bg-primary/15 text-primary border-primary/20' },
                    { role: 'tech', label: 'Technicien', color: 'bg-sigg-orange/15 text-sigg-orange-light border-sigg-orange/20' },
                    { role: 'manager', label: 'Manager', color: 'bg-sigg-green/15 text-sigg-green-light border-sigg-green/20' },
                  ].map((demo) => (
                    <button
                      key={demo.role}
                      onClick={() => fillDemo(demo.role)}
                      className={`text-xs py-2 px-3 rounded-lg border font-medium transition-all hover:scale-105 ${demo.color}`}
                    >
                      {demo.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom branding */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="flex h-4 w-6 rounded overflow-hidden">
                <div className="w-1/3 bg-[#CE1126]" />
                <div className="w-1/3 bg-[#FCD116]" />
                <div className="w-1/3 bg-[#009460]" />
              </div>
              <span className="text-[10px] text-muted-foreground/40 tracking-wide">
                RÉPUBLIQUE DE GUINÉE
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground/30">
              SIGG GMAO v2.0 — Plateforme de Maintenance Intelligente
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
