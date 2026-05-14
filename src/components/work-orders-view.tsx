'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus, Search, Eye, ClipboardList, Play, Pause, CheckCircle, Calendar,
} from 'lucide-react';
import { api, formatDate, formatGNF } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const statusLabels: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  PLANIFIEE: 'Planifiée',
  EN_COURS: 'En cours',
  SUSPENDUE: 'Suspendue',
  TERMINEE: 'Terminée',
  VALIDEE: 'Validée',
  CRITIQUE: 'Critique',
};

const statusBadgeClass: Record<string, string> = {
  EN_ATTENTE: 'bg-slate-500',
  PLANIFIEE: 'bg-blue-500',
  EN_COURS: 'bg-teal-600',
  SUSPENDUE: 'bg-amber-500',
  TERMINEE: 'bg-green-600',
  VALIDEE: 'bg-emerald-700',
  CRITIQUE: 'bg-red-600',
};

const typeLabels: Record<string, string> = {
  PREVENTIVE: 'Préventif',
  CORRECTIVE: 'Correctif',
  AMELIORATIVE: 'Amélioratif',
  URGENTE: 'Urgent',
};

const priorityLabels: Record<string, string> = {
  P1_CRITIQUE: 'P1 Critique',
  P2_HAUTE: 'P2 Haute',
  P3_MOYENNE: 'P3 Moyenne',
  P4_BASSE: 'P4 Basse',
};

const priorityBadgeClass: Record<string, string> = {
  P1_CRITIQUE: 'bg-red-600',
  P2_HAUTE: 'bg-orange-500',
  P3_MOYENNE: 'bg-yellow-500',
  P4_BASSE: 'bg-slate-400',
};

export function WorkOrdersView() {
  const { toast } = useToast();
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedWO, setSelectedWO] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [detailTab, setDetailTab] = useState('details');
  const [createForm, setCreateForm] = useState<any>({
    title: '', type: 'CORRECTIVE', priority: 'P3_MOYENNE', equipmentId: '',
    description: '', estimatedHours: '',
  });
  const [equipment, setEquipment] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        if (statusFilter) params.set('status', statusFilter);
        if (typeFilter) params.set('type', typeFilter);
        const res = await api.getWorkOrders(params.toString() ? `?${params.toString()}` : '');
        if (!cancelled) {
          setWorkOrders(res.data || []);
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
  }, [statusFilter, typeFilter]);

  const loadData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (typeFilter) params.set('type', typeFilter);
    api.getWorkOrders(params.toString() ? `?${params.toString()}` : '').then((res) => {
      setWorkOrders(res.data || []);
      setLoading(false);
    }).catch((e: any) => {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
      setLoading(false);
    });
  };

  const handleViewDetail = async (wo: any) => {
    try {
      const detail = await api.getWorkOrderById(wo.id);
      setSelectedWO(detail);
      setShowDetail(true);
      setDetailTab('details');
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    }
  };

  const handleStatusChange = async (woId: string, newStatus: string) => {
    try {
      await api.updateWorkOrder(woId, { status: newStatus });
      toast({ title: 'Succès', description: `Statut mis à jour: ${statusLabels[newStatus]}` });
      loadData();
      if (selectedWO?.id === woId) {
        const detail = await api.getWorkOrderById(woId);
        setSelectedWO(detail);
      }
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    }
  };

  const handleCreate = async () => {
    try {
      if (!createForm.equipmentId) {
        toast({ title: 'Erreur', description: 'Veuillez sélectionner un équipement', variant: 'destructive' });
        return;
      }
      const eq = equipment.find(e => e.id === createForm.equipmentId);
      await api.createWorkOrder({
        ...createForm,
        siteId: eq?.siteId,
        estimatedHours: createForm.estimatedHours ? parseFloat(createForm.estimatedHours) : undefined,
      });
      toast({ title: 'Succès', description: 'Ordre de travail créé' });
      setShowCreate(false);
      loadData();
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher OT..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9 w-56" />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === 'ALL' ? '' : v)}>
            <SelectTrigger className="h-9 w-40"><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les statuts</SelectItem>
              {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v === 'ALL' ? '' : v)}>
            <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous</SelectItem>
              {Object.entries(typeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowCreate(true)} size="sm" className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-1.5" />
          Nouvel OT
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Code</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead className="hidden lg:table-cell">Équipement</TableHead>
                  <TableHead className="hidden lg:table-cell">Assigné à</TableHead>
                  <TableHead className="hidden xl:table-cell">Date prévue</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 9 }).map((_, j) => (
                        <TableCell key={j}><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : workOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Aucun ordre de travail</TableCell>
                  </TableRow>
                ) : (
                  workOrders.map((wo) => (
                    <TableRow key={wo.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewDetail(wo)}>
                      <TableCell className="font-mono text-xs">{wo.code}</TableCell>
                      <TableCell>
                        <p className="font-medium text-sm max-w-[200px] truncate">{wo.title}</p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-xs text-muted-foreground">{typeLabels[wo.type] || wo.type}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] px-2 py-0 h-5 ${statusBadgeClass[wo.status] || 'bg-slate-400'} text-white border-0`}>
                          {statusLabels[wo.status] || wo.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] px-2 py-0 h-5 ${priorityBadgeClass[wo.priority] || 'bg-slate-400'} text-white border-0`}>
                          {priorityLabels[wo.priority] || wo.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground max-w-[120px] truncate block">{wo.equipment?.name || '-'}</span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">{wo.assignedTo?.name || '-'}</span>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <span className="text-xs text-muted-foreground">{wo.plannedStartDate ? formatDate(wo.plannedStartDate) : '-'}</span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleViewDetail(wo); }}>
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              {selectedWO?.code} — {selectedWO?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedWO && (
            <Tabs value={detailTab} onValueChange={setDetailTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="details">Détails</TabsTrigger>
                <TabsTrigger value="checklist">Checklist</TabsTrigger>
                <TabsTrigger value="parts">Pièces</TabsTrigger>
                <TabsTrigger value="comments">Commentaires</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-xs text-muted-foreground">Type</Label><p className="text-sm">{typeLabels[selectedWO.type]}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Statut</Label>
                    <Badge className={`text-xs ${statusBadgeClass[selectedWO.status]} text-white border-0`}>{statusLabels[selectedWO.status]}</Badge>
                  </div>
                  <div><Label className="text-xs text-muted-foreground">Priorité</Label>
                    <Badge className={`text-xs ${priorityBadgeClass[selectedWO.priority]} text-white border-0`}>{priorityLabels[selectedWO.priority]}</Badge>
                  </div>
                  <div><Label className="text-xs text-muted-foreground">Équipement</Label><p className="text-sm">{selectedWO.equipment?.name || '-'}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Assigné à</Label><p className="text-sm">{selectedWO.assignedTo?.name || '-'}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Superviseur</Label><p className="text-sm">{selectedWO.supervisor?.name || '-'}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Heures estimées</Label><p className="text-sm">{selectedWO.estimatedHours || '-'}h</p></div>
                  <div><Label className="text-xs text-muted-foreground">Heures réelles</Label><p className="text-sm">{selectedWO.actualHours || '-'}h</p></div>
                  <div><Label className="text-xs text-muted-foreground">Début prévu</Label><p className="text-sm">{selectedWO.plannedStartDate ? formatDate(selectedWO.plannedStartDate) : '-'}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Fin prévue</Label><p className="text-sm">{selectedWO.plannedEndDate ? formatDate(selectedWO.plannedEndDate) : '-'}</p></div>
                </div>
                {selectedWO.description && (
                  <div><Label className="text-xs text-muted-foreground">Description</Label>
                    <p className="text-sm mt-1 p-3 bg-muted/50 rounded-lg">{selectedWO.description}</p>
                  </div>
                )}
                {/* Status workflow buttons */}
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  {selectedWO.status === 'EN_ATTENTE' && (
                    <Button size="sm" onClick={() => handleStatusChange(selectedWO.id, 'PLANIFIEE')} className="bg-blue-600 hover:bg-blue-700">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" /> Planifier
                    </Button>
                  )}
                  {(selectedWO.status === 'PLANIFIEE' || selectedWO.status === 'EN_ATTENTE') && (
                    <Button size="sm" onClick={() => handleStatusChange(selectedWO.id, 'EN_COURS')} className="bg-teal-600 hover:bg-teal-700">
                      <Play className="w-3.5 h-3.5 mr-1.5" /> Démarrer
                    </Button>
                  )}
                  {selectedWO.status === 'EN_COURS' && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleStatusChange(selectedWO.id, 'SUSPENDUE')}>
                        <Pause className="w-3.5 h-3.5 mr-1.5" /> Suspendre
                      </Button>
                      <Button size="sm" onClick={() => handleStatusChange(selectedWO.id, 'TERMINEE')} className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Terminer
                      </Button>
                    </>
                  )}
                  {selectedWO.status === 'SUSPENDUE' && (
                    <Button size="sm" onClick={() => handleStatusChange(selectedWO.id, 'EN_COURS')} className="bg-teal-600 hover:bg-teal-700">
                      <Play className="w-3.5 h-3.5 mr-1.5" /> Reprendre
                    </Button>
                  )}
                  {selectedWO.status === 'TERMINEE' && (
                    <Button size="sm" onClick={() => handleStatusChange(selectedWO.id, 'VALIDEE')} className="bg-emerald-700 hover:bg-emerald-800">
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Valider
                    </Button>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="checklist">
                <div className="space-y-2">
                  {selectedWO.checklists?.length > 0 ? selectedWO.checklists.map((cl: any) => (
                    <div key={cl.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                      <input type="checkbox" checked={cl.completed} readOnly className="rounded" />
                      <span className={`text-sm ${cl.completed ? 'line-through text-muted-foreground' : ''}`}>{cl.item}</span>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucune checklist</p>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="parts">
                <div className="space-y-2">
                  {selectedWO.parts?.length > 0 ? selectedWO.parts.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <span className="text-sm">{p.part?.name || 'Pièce'}</span>
                      <span className="text-sm text-muted-foreground">Qté: {p.quantity}</span>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucune pièce utilisée</p>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="comments">
                <div className="space-y-3">
                  {selectedWO.comments?.length > 0 ? selectedWO.comments.map((c: any) => (
                    <div key={c.id} className="p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{c.user?.name || 'Utilisateur'}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(c.createdAt)}</span>
                      </div>
                      <p className="text-sm">{c.content}</p>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucun commentaire</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Nouvel Ordre de Travail</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Titre *</Label>
              <Input value={createForm.title} onChange={(e) => setCreateForm({...createForm, title: e.target.value})} className="h-9" />
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
                <Label className="text-xs">Priorité</Label>
                <Select value={createForm.priority} onValueChange={(v) => setCreateForm({...createForm, priority: v})}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
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
            <div>
              <Label className="text-xs">Heures estimées</Label>
              <Input value={createForm.estimatedHours} onChange={(e) => setCreateForm({...createForm, estimatedHours: e.target.value})} className="h-9" type="number" />
            </div>
            <div>
              <Label className="text-xs">Description</Label>
              <Textarea value={createForm.description} onChange={(e) => setCreateForm({...createForm, description: e.target.value})} rows={3} />
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
