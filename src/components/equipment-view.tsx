'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
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
  Plus, Search, Filter, Eye, Edit, Server, X,
} from 'lucide-react';
import { api, formatDate } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const statusLabels: Record<string, string> = {
  OPERATIONNEL: 'Opérationnel',
  HORS_SERVICE: 'Hors service',
  EN_MAINTENANCE: 'En maintenance',
  EN_PANNE: 'En panne',
  MIS_AU_REBUT: 'Mis au rebut',
};

const statusBadgeClass: Record<string, string> = {
  OPERATIONNEL: 'bg-green-600',
  HORS_SERVICE: 'bg-red-600',
  EN_MAINTENANCE: 'bg-amber-500',
  EN_PANNE: 'bg-orange-600',
  MIS_AU_REBUT: 'bg-slate-500',
};

const critLabels: Record<string, string> = {
  CRITIQUE: 'Critique',
  IMPORTANTE: 'Importante',
  MOYENNE: 'Moyenne',
  FAIBLE: 'Faible',
};

const critBadgeClass: Record<string, string> = {
  CRITIQUE: 'bg-red-600',
  IMPORTANTE: 'bg-orange-500',
  MOYENNE: 'bg-yellow-500',
  FAIBLE: 'bg-slate-400',
};

export function EquipmentView() {
  const { toast } = useToast();
  const [equipment, setEquipment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [critFilter, setCritFilter] = useState('');
  const [selectedEq, setSelectedEq] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [sites, setSites] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [createForm, setCreateForm] = useState<any>({
    name: '', code: '', serialNumber: '', categoryId: '', siteId: '',
    manufacturer: '', model: '', year: '', criticality: 'MOYENNE', status: 'OPERATIONNEL',
    description: '', currentHealthScore: 100,
  });

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (statusFilter) params.set('status', statusFilter);
        if (critFilter) params.set('criticality', critFilter);
        params.set('pageSize', '50');
        const res = await api.getEquipment(params.toString() ? `?${params.toString()}` : '');
        if (!cancelled) {
          setEquipment(res.data || []);
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
    api.getSites().then((d) => { if (!cancelled) setSites(Array.isArray(d) ? d : d?.data || []); }).catch(() => {});
    return () => { cancelled = true; };
  }, [search, statusFilter, critFilter]);

  const loadData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    if (critFilter) params.set('criticality', critFilter);
    params.set('pageSize', '50');
    api.getEquipment(params.toString() ? `?${params.toString()}` : '').then((res) => {
      setEquipment(res.data || []);
      setLoading(false);
    }).catch((e: any) => {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
      setLoading(false);
    });
  };

  const handleViewDetail = async (eq: any) => {
    try {
      const detail = await api.getEquipmentById(eq.id);
      setSelectedEq(detail);
      setShowDetail(true);
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    }
  };

  const handleCreate = async () => {
    try {
      await api.createEquipment({
        ...createForm,
        year: createForm.year ? parseInt(createForm.year) : undefined,
      });
      toast({ title: 'Succès', description: 'Équipement créé avec succès' });
      setShowCreate(false);
      setCreateForm({
        name: '', code: '', serialNumber: '', categoryId: '', siteId: '',
        manufacturer: '', model: '', year: '', criticality: 'MOYENNE', status: 'OPERATIONNEL',
        description: '', currentHealthScore: 100,
      });
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
            <Input
              placeholder="Rechercher équipement..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === 'ALL' ? '' : v)}>
            <SelectTrigger className="h-9 w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les statuts</SelectItem>
              <SelectItem value="OPERATIONNEL">Opérationnel</SelectItem>
              <SelectItem value="EN_MAINTENANCE">En maintenance</SelectItem>
              <SelectItem value="EN_PANNE">En panne</SelectItem>
              <SelectItem value="HORS_SERVICE">Hors service</SelectItem>
              <SelectItem value="MIS_AU_REBUT">Mis au rebut</SelectItem>
            </SelectContent>
          </Select>
          <Select value={critFilter} onValueChange={(v) => setCritFilter(v === 'ALL' ? '' : v)}>
            <SelectTrigger className="h-9 w-40">
              <SelectValue placeholder="Criticialité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Toutes</SelectItem>
              <SelectItem value="CRITIQUE">Critique</SelectItem>
              <SelectItem value="IMPORTANTE">Importante</SelectItem>
              <SelectItem value="MOYENNE">Moyenne</SelectItem>
              <SelectItem value="FAIBLE">Faible</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowCreate(true)} size="sm" className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-1.5" />
          Nouvel Équipement
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
                  <TableHead>Nom</TableHead>
                  <TableHead className="hidden md:table-cell">Catégorie</TableHead>
                  <TableHead className="hidden lg:table-cell">Site</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Criticité</TableHead>
                  <TableHead className="hidden md:table-cell">Santé</TableHead>
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
                ) : equipment.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Aucun équipement trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  equipment.map((eq) => (
                    <TableRow key={eq.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewDetail(eq)}>
                      <TableCell className="font-mono text-xs">{eq.code}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{eq.name}</p>
                          <p className="text-xs text-muted-foreground hidden sm:block">{eq.manufacturer} {eq.model}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-xs text-muted-foreground">{eq.category?.name || '-'}</span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">{eq.site?.name || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] px-2 py-0 h-5 ${statusBadgeClass[eq.status] || 'bg-slate-400'} text-white border-0`}>
                          {statusLabels[eq.status] || eq.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] px-2 py-0 h-5 ${critBadgeClass[eq.criticality] || 'bg-slate-400'} text-white border-0`}>
                          {critLabels[eq.criticality] || eq.criticality}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <Progress
                            value={eq.currentHealthScore}
                            className={`h-1.5 flex-1 ${
                              eq.currentHealthScore >= 80 ? '[&>div]:bg-green-500' :
                              eq.currentHealthScore >= 50 ? '[&>div]:bg-amber-500' :
                              '[&>div]:bg-red-500'
                            }`}
                          />
                          <span className={`text-xs font-medium w-8 text-right ${
                            eq.currentHealthScore >= 80 ? 'text-green-600' :
                            eq.currentHealthScore >= 50 ? 'text-amber-600' :
                            'text-red-600'
                          }`}>{eq.currentHealthScore}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleViewDetail(eq); }}>
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
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              {selectedEq?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedEq && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Code</Label>
                  <p className="text-sm font-mono">{selectedEq.code}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Numéro de série</Label>
                  <p className="text-sm">{selectedEq.serialNumber || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Statut</Label>
                  <Badge className={`text-xs ${statusBadgeClass[selectedEq.status] || 'bg-slate-400'} text-white border-0`}>
                    {statusLabels[selectedEq.status] || selectedEq.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Criticité</Label>
                  <Badge className={`text-xs ${critBadgeClass[selectedEq.criticality] || 'bg-slate-400'} text-white border-0`}>
                    {critLabels[selectedEq.criticality] || selectedEq.criticality}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Fabricant</Label>
                  <p className="text-sm">{selectedEq.manufacturer || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Modèle</Label>
                  <p className="text-sm">{selectedEq.model || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Catégorie</Label>
                  <p className="text-sm">{selectedEq.category?.name || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Site</Label>
                  <p className="text-sm">{selectedEq.site?.name || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Score de santé</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={selectedEq.currentHealthScore} className="h-2 flex-1" />
                    <span className="text-sm font-bold">{selectedEq.currentHealthScore}%</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Année</Label>
                  <p className="text-sm">{selectedEq.year || '-'}</p>
                </div>
                {selectedEq.purchaseDate && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Date d&apos;achat</Label>
                    <p className="text-sm">{formatDate(selectedEq.purchaseDate)}</p>
                  </div>
                )}
                {selectedEq.warrantyEnd && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Fin de garantie</Label>
                    <p className="text-sm">{formatDate(selectedEq.warrantyEnd)}</p>
                  </div>
                )}
              </div>
              {selectedEq.description && (
                <div>
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <p className="text-sm mt-1 p-3 bg-muted/50 rounded-lg">{selectedEq.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvel Équipement</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Nom *</Label>
              <Input value={createForm.name} onChange={(e) => setCreateForm({...createForm, name: e.target.value})} className="h-9" />
            </div>
            <div>
              <Label className="text-xs">Code *</Label>
              <Input value={createForm.code} onChange={(e) => setCreateForm({...createForm, code: e.target.value})} className="h-9" placeholder="EQ-XXX" />
            </div>
            <div>
              <Label className="text-xs">Numéro de série</Label>
              <Input value={createForm.serialNumber} onChange={(e) => setCreateForm({...createForm, serialNumber: e.target.value})} className="h-9" />
            </div>
            <div>
              <Label className="text-xs">Fabricant</Label>
              <Input value={createForm.manufacturer} onChange={(e) => setCreateForm({...createForm, manufacturer: e.target.value})} className="h-9" />
            </div>
            <div>
              <Label className="text-xs">Modèle</Label>
              <Input value={createForm.model} onChange={(e) => setCreateForm({...createForm, model: e.target.value})} className="h-9" />
            </div>
            <div>
              <Label className="text-xs">Année</Label>
              <Input value={createForm.year} onChange={(e) => setCreateForm({...createForm, year: e.target.value})} className="h-9" type="number" />
            </div>
            <div>
              <Label className="text-xs">Criticité</Label>
              <Select value={createForm.criticality} onValueChange={(v) => setCreateForm({...createForm, criticality: v})}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CRITIQUE">Critique</SelectItem>
                  <SelectItem value="IMPORTANTE">Importante</SelectItem>
                  <SelectItem value="MOYENNE">Moyenne</SelectItem>
                  <SelectItem value="FAIBLE">Faible</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Statut</Label>
              <Select value={createForm.status} onValueChange={(v) => setCreateForm({...createForm, status: v})}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPERATIONNEL">Opérationnel</SelectItem>
                  <SelectItem value="EN_MAINTENANCE">En maintenance</SelectItem>
                  <SelectItem value="EN_PANNE">En panne</SelectItem>
                  <SelectItem value="HORS_SERVICE">Hors service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
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
