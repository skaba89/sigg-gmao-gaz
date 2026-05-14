'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Plus, Search, Eye, AlertTriangle, Play, CheckCircle, XCircle } from 'lucide-react';
import { api, formatDate } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const severityLabels: Record<string, string> = {
  CRITIQUE: 'Critique',
  MAJEURE: 'Majeure',
  MINEURE: 'Mineure',
};

const severityBadgeClass: Record<string, string> = {
  CRITIQUE: 'bg-red-600',
  MAJEURE: 'bg-orange-500',
  MINEURE: 'bg-yellow-500',
};

const incStatusLabels: Record<string, string> = {
  OUVERT: 'Ouvert',
  EN_COURS: 'En cours',
  RESOLU: 'Résolu',
  CLOTURE: 'Clôturé',
};

const incStatusBadgeClass: Record<string, string> = {
  OUVERT: 'bg-red-500',
  EN_COURS: 'bg-blue-500',
  RESOLU: 'bg-green-500',
  CLOTURE: 'bg-slate-400',
};

export function IncidentsView() {
  const { toast } = useToast();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedInc, setSelectedInc] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [rcaForm, setRcaForm] = useState({ rootCause: '', correctiveAction: '' });
  const [createForm, setCreateForm] = useState<any>({
    title: '', severity: 'MAJEURE', equipmentId: '', description: '',
  });

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        if (severityFilter) params.set('severity', severityFilter);
        if (statusFilter) params.set('status', statusFilter);
        const res = await api.getIncidents(params.toString() ? `?${params.toString()}` : '');
        if (!cancelled) {
          setIncidents(res.data || []);
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
  }, [severityFilter, statusFilter]);

  const loadData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (severityFilter) params.set('severity', severityFilter);
    if (statusFilter) params.set('status', statusFilter);
    api.getIncidents(params.toString() ? `?${params.toString()}` : '').then((res) => {
      setIncidents(res.data || []);
      setLoading(false);
    }).catch((e: any) => {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
      setLoading(false);
    });
  };

  const handleViewDetail = async (inc: any) => {
    try {
      const detail = await api.getIncidentById(inc.id);
      setSelectedInc(detail);
      setRcaForm({
        rootCause: detail.rootCause || '',
        correctiveAction: detail.correctiveAction || '',
      });
      setShowDetail(true);
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedInc) return;
    setSaving(true);
    try {
      const updateData: any = { status: newStatus };
      // When resolving, include RCA fields if filled
      if (newStatus === 'RESOLU') {
        updateData.rootCause = rcaForm.rootCause;
        updateData.correctiveAction = rcaForm.correctiveAction;
      }
      const updated = await api.updateIncident(selectedInc.id, updateData);
      toast({ title: 'Succès', description: `Statut changé en ${incStatusLabels[newStatus]}` });
      setSelectedInc(updated);
      setRcaForm({
        rootCause: updated.rootCause || '',
        correctiveAction: updated.correctiveAction || '',
      });
      loadData();
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRCA = async () => {
    if (!selectedInc) return;
    setSaving(true);
    try {
      const updated = await api.updateIncident(selectedInc.id, {
        rootCause: rcaForm.rootCause,
        correctiveAction: rcaForm.correctiveAction,
      });
      toast({ title: 'Succès', description: 'Analyse des causes racines sauvegardée' });
      setSelectedInc(updated);
      loadData();
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (!createForm.equipmentId) {
        toast({ title: 'Erreur', description: 'Veuillez sélectionner un équipement', variant: 'destructive' });
        return;
      }
      const eq = equipment.find(e => e.id === createForm.equipmentId);
      await api.createIncident({ ...createForm, siteId: eq?.siteId });
      toast({ title: 'Succès', description: 'Incident créé' });
      setShowCreate(false);
      setCreateForm({ title: '', severity: 'MAJEURE', equipmentId: '', description: '' });
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
          <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v === 'ALL' ? '' : v)}>
            <SelectTrigger className="h-9 w-40"><SelectValue placeholder="Sévérité" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Toutes</SelectItem>
              {Object.entries(severityLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === 'ALL' ? '' : v)}>
            <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous</SelectItem>
              {Object.entries(incStatusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowCreate(true)} size="sm" className="bg-red-600 hover:bg-red-700">
          <Plus className="w-4 h-4 mr-1.5" />
          Signaler Incident
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
                  <TableHead className="hidden md:table-cell">Équipement</TableHead>
                  <TableHead>Sévérité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="hidden lg:table-cell">Signalé par</TableHead>
                  <TableHead className="hidden xl:table-cell">Date</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j}><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : incidents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Aucun incident</TableCell>
                  </TableRow>
                ) : (
                  incidents.map((inc) => (
                    <TableRow key={inc.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewDetail(inc)}>
                      <TableCell className="font-mono text-xs">{inc.code}</TableCell>
                      <TableCell>
                        <p className="font-medium text-sm max-w-[200px] truncate">{inc.title}</p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-xs text-muted-foreground">{inc.equipment?.name || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] px-2 py-0 h-5 ${severityBadgeClass[inc.severity] || 'bg-slate-400'} text-white border-0 ${
                          inc.severity === 'CRITIQUE' ? 'animate-pulse-critical' : ''
                        }`}>
                          {severityLabels[inc.severity] || inc.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] px-2 py-0 h-5 ${incStatusBadgeClass[inc.status] || 'bg-slate-400'} text-white border-0`}>
                          {incStatusLabels[inc.status] || inc.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">{inc.reportedBy?.name || '-'}</span>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <span className="text-xs text-muted-foreground">{formatDate(inc.detectedAt)}</span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleViewDetail(inc); }}>
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
      <Dialog open={showDetail} onOpenChange={(open) => { setShowDetail(open); if (!open) setSelectedInc(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              {selectedInc?.code} — {selectedInc?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedInc && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-xs text-muted-foreground">Sévérité</Label>
                  <Badge className={`text-xs ${severityBadgeClass[selectedInc.severity]} text-white border-0`}>{severityLabels[selectedInc.severity]}</Badge>
                </div>
                <div><Label className="text-xs text-muted-foreground">Statut</Label>
                  <Badge className={`text-xs ${incStatusBadgeClass[selectedInc.status]} text-white border-0`}>{incStatusLabels[selectedInc.status]}</Badge>
                </div>
                <div><Label className="text-xs text-muted-foreground">Équipement</Label><p className="text-sm">{selectedInc.equipment?.name || '-'}</p></div>
                <div><Label className="text-xs text-muted-foreground">Signalé par</Label><p className="text-sm">{selectedInc.reportedBy?.name || '-'}</p></div>
                <div><Label className="text-xs text-muted-foreground">Date de détection</Label><p className="text-sm">{formatDate(selectedInc.detectedAt)}</p></div>
                <div><Label className="text-xs text-muted-foreground">Date de résolution</Label><p className="text-sm">{selectedInc.resolvedAt ? formatDate(selectedInc.resolvedAt) : '-'}</p></div>
              </div>
              {selectedInc.description && (
                <div><Label className="text-xs text-muted-foreground">Description</Label>
                  <p className="text-sm mt-1 p-3 bg-muted/50 rounded-lg">{selectedInc.description}</p>
                </div>
              )}

              {/* Status Workflow Buttons */}
              <div className="border-t pt-4">
                <Label className="text-xs text-muted-foreground mb-2 block">Actions</Label>
                <div className="flex gap-2">
                  {selectedInc.status === 'OUVERT' && (
                    <Button
                      onClick={() => handleStatusChange('EN_COURS')}
                      disabled={saving}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Play className="w-4 h-4 mr-1.5" />
                      Prendre en charge
                    </Button>
                  )}
                  {selectedInc.status === 'EN_COURS' && (
                    <Button
                      onClick={() => handleStatusChange('RESOLU')}
                      disabled={saving}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1.5" />
                      Résoudre
                    </Button>
                  )}
                  {selectedInc.status === 'RESOLU' && (
                    <Button
                      onClick={() => handleStatusChange('CLOTURE')}
                      disabled={saving}
                      size="sm"
                      className="bg-slate-600 hover:bg-slate-700"
                    >
                      <XCircle className="w-4 h-4 mr-1.5" />
                      Clôturer
                    </Button>
                  )}
                  {selectedInc.status === 'CLOTURE' && (
                    <span className="text-sm text-muted-foreground italic">Incident clôturé</span>
                  )}
                </div>
              </div>

              {/* Root Cause Analysis - Editable */}
              <div className="border-t pt-4 space-y-3">
                <h4 className="text-sm font-semibold">Analyse des Causes Racines</h4>
                <div>
                  <Label className="text-xs text-muted-foreground">Cause racine</Label>
                  <Textarea
                    value={rcaForm.rootCause}
                    onChange={(e) => setRcaForm({...rcaForm, rootCause: e.target.value})}
                    placeholder="Décrivez la cause racine de l'incident..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Action corrective</Label>
                  <Textarea
                    value={rcaForm.correctiveAction}
                    onChange={(e) => setRcaForm({...rcaForm, correctiveAction: e.target.value})}
                    placeholder="Décrivez l'action corrective mise en place..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleSaveRCA} disabled={saving} size="sm" variant="outline">
                  {saving ? 'Sauvegarde...' : 'Sauvegarder RCA'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={(open) => { setShowCreate(open); if (!open) setCreateForm({ title: '', severity: 'MAJEURE', equipmentId: '', description: '' }); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Signaler un Incident</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Titre *</Label>
              <Input value={createForm.title} onChange={(e) => setCreateForm({...createForm, title: e.target.value})} className="h-9" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Sévérité</Label>
                <Select value={createForm.severity} onValueChange={(v) => setCreateForm({...createForm, severity: v})}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(severityLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
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
            </div>
            <div>
              <Label className="text-xs">Description</Label>
              <Textarea value={createForm.description} onChange={(e) => setCreateForm({...createForm, description: e.target.value})} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreate(false); setCreateForm({ title: '', severity: 'MAJEURE', equipmentId: '', description: '' }); }}>Annuler</Button>
            <Button onClick={handleCreate} className="bg-red-600 hover:bg-red-700">Signaler</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
