'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  CalendarClock, Plus, Clock, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import { api, formatDate } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const freqLabels: Record<string, string> = {
  JOUR: 'Journalier',
  SEMAINE: 'Hebdomadaire',
  MOIS: 'Mensuel',
  TRIMESTRE: 'Trimestriel',
  SEMESTRE: 'Semestriel',
  ANNUEL: 'Annuel',
};

const typeLabels: Record<string, string> = {
  PERIODIQUE: 'Périodique',
  CONDITIONNELLE: 'Conditionnelle',
  PREDICTIVE: 'Prédictive',
};

export function MaintenanceView() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [createForm, setCreateForm] = useState<any>({
    name: '', equipmentId: '', type: 'PERIODIQUE', frequency: 'MOIS', frequencyValue: '1',
    nextDueDate: '', description: '', estimatedDuration: '',
  });

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const res = await api.getMaintenancePlans();
        if (!cancelled) {
          setPlans(res.data || []);
          setLoading(false);
        }
      } catch (e: any) {
        if (!cancelled) {
          toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
          setLoading(false);
        }
      }
    };
    fetchData();
    api.getEquipment('?pageSize=100').then((res) => { if (!cancelled) setEquipment(res.data || []); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const loadData = () => {
    setLoading(true);
    api.getMaintenancePlans().then((res) => {
      setPlans(res.data || []);
      setLoading(false);
    }).catch((e: any) => {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
      setLoading(false);
    });
  };

  const handleCreate = async () => {
    try {
      if (!createForm.equipmentId) {
        toast({ title: 'Erreur', description: 'Veuillez sélectionner un équipement', variant: 'destructive' });
        return;
      }
      await api.createMaintenancePlan({
        ...createForm,
        code: `MP-${String(plans.length + 1).padStart(5, '0')}`,
        frequencyValue: parseInt(createForm.frequencyValue),
        estimatedDuration: createForm.estimatedDuration ? parseInt(createForm.estimatedDuration) : undefined,
        nextDueDate: createForm.nextDueDate ? new Date(createForm.nextDueDate) : new Date(),
      });
      toast({ title: 'Succès', description: 'Plan de maintenance créé' });
      setShowCreate(false);
      loadData();
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    }
  };

  const isOverdue = (date: string) => new Date(date) < new Date();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{plans.length} plan(s) de maintenance actif(s)</p>
        </div>
        <Button onClick={() => setShowCreate(true)} size="sm" className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-1.5" />
          Nouveau Plan
        </Button>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6"><div className="h-32 bg-muted rounded" /></CardContent>
            </Card>
          ))
        ) : plans.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">Aucun plan de maintenance</div>
        ) : (
          plans.map((plan, idx) => {
            const overdue = isOverdue(plan.nextDueDate);
            return (
              <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Card className={`hover:shadow-md transition-shadow ${overdue ? 'border-red-500/30' : ''}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${overdue ? 'bg-red-500/15' : 'bg-primary/15'}`}>
                          <CalendarClock className={`w-4 h-4 ${overdue ? 'text-red-500' : 'text-primary'}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{plan.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{plan.code}</p>
                        </div>
                      </div>
                      {overdue ? (
                        <Badge className="text-[10px] bg-red-600 text-white border-0 animate-pulse-critical">En retard</Badge>
                      ) : (
                        <Badge className="text-[10px] bg-green-600 text-white border-0">Actif</Badge>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Équipement</span>
                        <span className="font-medium text-xs">{plan.equipment?.name || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">{typeLabels[plan.type] || plan.type}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fréquence</span>
                        <span className="text-xs">{plan.frequencyValue}x {freqLabels[plan.frequency] || plan.frequency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Prochaine échéance</span>
                        <span className={`text-xs font-medium ${overdue ? 'text-red-500' : ''}`}>
                          {formatDate(plan.nextDueDate)}
                        </span>
                      </div>
                      {plan.estimatedDuration && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Durée estimée</span>
                          <span className="text-xs">{plan.estimatedDuration} min</span>
                        </div>
                      )}
                    </div>

                    {/* Tasks preview */}
                    {plan.tasks?.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground mb-1.5">Tâches ({plan.tasks.length})</p>
                        <div className="space-y-1">
                          {plan.tasks.slice(0, 3).map((task: any) => (
                            <div key={task.id} className="flex items-center gap-1.5 text-xs">
                              <CheckCircle2 className="w-3 h-3 text-muted-foreground" />
                              <span className="text-muted-foreground truncate">{task.description}</span>
                            </div>
                          ))}
                          {plan.tasks.length > 3 && (
                            <p className="text-xs text-muted-foreground">+{plan.tasks.length - 3} autres</p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Nouveau Plan de Maintenance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Nom du plan *</Label>
              <Input value={createForm.name} onChange={(e) => setCreateForm({...createForm, name: e.target.value})} className="h-9" />
            </div>
            <div>
              <Label className="text-xs">Équipement *</Label>
              <Select value={createForm.equipmentId} onValueChange={(v) => setCreateForm({...createForm, equipmentId: v})}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>
                  {equipment.map((eq) => <SelectItem key={eq.id} value={eq.id}>{eq.code} - {eq.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Type</Label>
                <Select value={createForm.type} onValueChange={(v) => setCreateForm({...createForm, type: v})}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Fréquence</Label>
                <div className="flex gap-2">
                  <Input value={createForm.frequencyValue} onChange={(e) => setCreateForm({...createForm, frequencyValue: e.target.value})} className="h-9 w-16" type="number" />
                  <Select value={createForm.frequency} onValueChange={(v) => setCreateForm({...createForm, frequency: v})}>
                    <SelectTrigger className="h-9 flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(freqLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div>
              <Label className="text-xs">Prochaine échéance</Label>
              <Input value={createForm.nextDueDate} onChange={(e) => setCreateForm({...createForm, nextDueDate: e.target.value})} className="h-9" type="date" />
            </div>
            <div>
              <Label className="text-xs">Durée estimée (min)</Label>
              <Input value={createForm.estimatedDuration} onChange={(e) => setCreateForm({...createForm, estimatedDuration: e.target.value})} className="h-9" type="number" />
            </div>
            <div>
              <Label className="text-xs">Description</Label>
              <Textarea value={createForm.description} onChange={(e) => setCreateForm({...createForm, description: e.target.value})} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Annuler</Button>
            <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
