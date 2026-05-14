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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus, Search, Package, ArrowUpDown, AlertTriangle, Eye, Edit,
} from 'lucide-react';
import { api, formatGNF, formatDate } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const hardcodedPartCategories = [
  { value: 'filtres', label: 'Filtres' },
  { value: 'joints', label: 'Joints' },
  { value: 'capteurs', label: 'Capteurs' },
  { value: 'fusibles', label: 'Fusibles' },
  { value: 'courroies', label: 'Courroies' },
  { value: 'lubrifiants', label: 'Lubrifiants' },
  { value: 'outillage', label: 'Outillage' },
  { value: 'autre', label: 'Autre' },
];

const emptyCreateForm = {
  name: '', code: '', categoryId: '', unit: 'unite', unitPrice: '',
  minStockLevel: '', currentStock: '', description: '',
};

const emptyMovementForm = {
  partId: '', warehouseId: '', type: 'ENTREE', quantity: '', notes: '',
};

export function StockView() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('parts');
  const [parts, setParts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showMovement, setShowMovement] = useState(false);
  const [showPartDetail, setShowPartDetail] = useState(false);
  const [selectedPart, setSelectedPart] = useState<any>(null);
  const [editPartForm, setEditPartForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [createForm, setCreateForm] = useState<any>({ ...emptyCreateForm });
  const [movementForm, setMovementForm] = useState<any>({ ...emptyMovementForm });
  const [categories, setCategories] = useState<any[]>([]);
  const [defaultUserId, setDefaultUserId] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.getParts('?pageSize=100'),
      api.getWarehouses(),
      api.getSuppliers(),
      api.getUsers(),
    ]).then(([partsRes, warehousesRes, suppliersRes, usersRes]) => {
      if (!cancelled) {
        const partsData = partsRes.data || [];
        setParts(partsData);
        setWarehouses(Array.isArray(warehousesRes) ? warehousesRes : warehousesRes?.data || []);
        setSuppliers(Array.isArray(suppliersRes) ? suppliersRes : suppliersRes?.data || []);

        // Extract unique categories from parts
        const cats = partsData
          .map((p: any) => p.category)
          .filter(Boolean)
          .filter((cat: any, idx: number, arr: any[]) => arr.findIndex((c: any) => c.id === cat.id) === idx);
        if (cats.length > 0) setCategories(cats);

        // Pick first SUPER_ADMIN or first user as default performedById
        const users = Array.isArray(usersRes) ? usersRes : usersRes?.data || [];
        const admin = users.find((u: any) => u.role === 'SUPER_ADMIN') || users[0];
        if (admin) setDefaultUserId(admin.id);

        setLoading(false);
      }
    }).catch((e: any) => {
      if (!cancelled) {
        toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
        setLoading(false);
      }
    });

    if (activeTab === 'movements') {
      api.getStockMovements('?pageSize=50').then((movRes) => {
        if (!cancelled) setMovements(movRes.data || []);
      }).catch(() => {});
    }
    return () => { cancelled = true; };
  }, [activeTab]);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.getParts('?pageSize=100'),
      api.getWarehouses(),
      api.getSuppliers(),
    ]).then(([partsRes, warehousesRes, suppliersRes]) => {
      const partsData = partsRes.data || [];
      setParts(partsData);
      setWarehouses(Array.isArray(warehousesRes) ? warehousesRes : warehousesRes?.data || []);
      setSuppliers(Array.isArray(suppliersRes) ? suppliersRes : suppliersRes?.data || []);

      // Extract unique categories from parts
      const cats = partsData
        .map((p: any) => p.category)
        .filter(Boolean)
        .filter((cat: any, idx: number, arr: any[]) => arr.findIndex((c: any) => c.id === cat.id) === idx);
      if (cats.length > 0) setCategories(cats);

      setLoading(false);
    }).catch((e: any) => {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
      setLoading(false);
    });

    if (activeTab === 'movements') {
      api.getStockMovements('?pageSize=50').then((movRes) => {
        setMovements(movRes.data || []);
      }).catch(() => {});
    }
  };

  const handleCreatePart = async () => {
    if (!createForm.name || !createForm.code) {
      toast({ title: 'Erreur', description: 'Le nom et le code sont requis', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await api.createPart({
        ...createForm,
        unitPrice: parseFloat(createForm.unitPrice) || 0,
        minStockLevel: parseInt(createForm.minStockLevel) || 0,
        currentStock: parseInt(createForm.currentStock) || 0,
        maxStockLevel: parseInt(createForm.minStockLevel) * 3 || 0,
      });
      toast({ title: 'Succès', description: 'Pièce créée' });
      setShowCreate(false);
      setCreateForm({ ...emptyCreateForm });
      loadData();
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateMovement = async () => {
    if (!movementForm.partId || !movementForm.warehouseId || !movementForm.quantity) {
      toast({ title: 'Erreur', description: 'Pièce, entrepôt et quantité requis', variant: 'destructive' });
      return;
    }
    if (!defaultUserId) {
      toast({ title: 'Erreur', description: 'Aucun utilisateur disponible pour effectuer le mouvement', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await api.createStockMovement({
        ...movementForm,
        quantity: parseInt(movementForm.quantity),
        performedById: defaultUserId,
      });
      toast({ title: 'Succès', description: 'Mouvement enregistré' });
      setShowMovement(false);
      setMovementForm({ ...emptyMovementForm });
      loadData();
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleViewPart = (part: any) => {
    setSelectedPart(part);
    setEditPartForm({
      currentStock: part.currentStock,
      minStockLevel: part.minStockLevel,
      unitPrice: part.unitPrice,
    });
    setShowPartDetail(true);
  };

  const handleUpdatePart = async () => {
    if (!selectedPart) return;
    setSaving(true);
    try {
      const updated = await api.updatePart(selectedPart.id, {
        currentStock: parseInt(editPartForm.currentStock) || 0,
        minStockLevel: parseInt(editPartForm.minStockLevel) || 0,
        unitPrice: parseFloat(editPartForm.unitPrice) || 0,
      });
      toast({ title: 'Succès', description: 'Pièce mise à jour' });
      setSelectedPart(updated);
      setShowPartDetail(false);
      loadData();
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const isLowStock = (part: any) => part.currentStock <= part.minStockLevel;

  const movementTypeLabels: Record<string, string> = {
    ENTREE: 'Entrée',
    SORTIE: 'Sortie',
    TRANSFERT: 'Transfert',
    AJUSTEMENT: 'Ajustement',
    RETOUR: 'Retour',
  };

  const movementTypeColors: Record<string, string> = {
    ENTREE: 'bg-green-600',
    SORTIE: 'bg-red-500',
    TRANSFERT: 'bg-blue-500',
    AJUSTEMENT: 'bg-amber-500',
    RETOUR: 'bg-purple-500',
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="parts">Pièces</TabsTrigger>
            <TabsTrigger value="movements">Mouvements</TabsTrigger>
            <TabsTrigger value="warehouses">Entrepôts</TabsTrigger>
            <TabsTrigger value="suppliers">Fournisseurs</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            {activeTab === 'parts' && (
              <>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Rechercher pièce..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9 w-56" />
                </div>
                <Button onClick={() => setShowCreate(true)} size="sm" className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-1.5" />Nouvelle Pièce
                </Button>
              </>
            )}
            {activeTab === 'movements' && (
              <Button onClick={() => setShowMovement(true)} size="sm" className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-1.5" />Nouveau Mouvement
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="parts">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Code</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead className="hidden md:table-cell">Catégorie</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="hidden lg:table-cell">Min</TableHead>
                      <TableHead className="hidden lg:table-cell">Prix unitaire</TableHead>
                      <TableHead>Statut</TableHead>
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
                    ) : (
                      parts.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase())).map((part) => (
                        <TableRow
                          key={part.id}
                          className={`cursor-pointer hover:bg-muted/50 ${isLowStock(part) ? 'bg-red-500/5' : ''}`}
                          onClick={() => handleViewPart(part)}
                        >
                          <TableCell className="font-mono text-xs">{part.code}</TableCell>
                          <TableCell>
                            <p className="font-medium text-sm">{part.name}</p>
                            <p className="text-xs text-muted-foreground">{part.manufacturer || ''} {part.partNumber || ''}</p>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="text-xs text-muted-foreground">{part.category?.name || '-'}</span>
                          </TableCell>
                          <TableCell>
                            <span className={`text-sm font-bold ${isLowStock(part) ? 'text-red-600' : ''}`}>
                              {part.currentStock}
                            </span>
                            <span className="text-xs text-muted-foreground"> {part.unit}</span>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className="text-xs text-muted-foreground">{part.minStockLevel}</span>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className="text-xs">{formatGNF(part.unitPrice)}</span>
                          </TableCell>
                          <TableCell>
                            {isLowStock(part) ? (
                              <Badge className="text-[10px] bg-red-600 text-white border-0 animate-pulse-critical">
                                <AlertTriangle className="w-3 h-3 mr-1" />Stock faible
                              </Badge>
                            ) : (
                              <Badge className="text-[10px] bg-green-600 text-white border-0">OK</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleViewPart(part); }}>
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
        </TabsContent>

        <TabsContent value="movements">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pièce</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantité</TableHead>
                      <TableHead className="hidden md:table-cell">Entrepôt</TableHead>
                      <TableHead className="hidden lg:table-cell">Référence</TableHead>
                      <TableHead className="hidden lg:table-cell">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 6 }).map((_, j) => (
                            <TableCell key={j}><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      movements.map((mov) => (
                        <TableRow key={mov.id}>
                          <TableCell className="text-sm">{mov.part?.name || '-'}</TableCell>
                          <TableCell>
                            <Badge className={`text-[10px] ${movementTypeColors[mov.type] || 'bg-slate-400'} text-white border-0`}>
                              {movementTypeLabels[mov.type] || mov.type}
                            </Badge>
                          </TableCell>
                          <TableCell className={`text-sm font-bold ${mov.type === 'ENTREE' ? 'text-green-600' : 'text-red-500'}`}>
                            {mov.type === 'ENTREE' ? '+' : '-'}{mov.quantity}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{mov.warehouse?.name || '-'}</TableCell>
                          <TableCell className="hidden lg:table-cell text-xs font-mono">{mov.reference || '-'}</TableCell>
                          <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{formatDate(mov.createdAt)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warehouses">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {warehouses.map((wh: any) => (
              <Card key={wh.id}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/15"><Package className="w-4 h-4 text-primary" /></div>
                    <div>
                      <p className="font-semibold text-sm">{wh.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{wh.code}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="text-xs">{wh.type}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Adresse</span><span className="text-xs">{wh.address || '-'}</span></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="suppliers">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead className="hidden md:table-cell">Contact</TableHead>
                      <TableHead className="hidden lg:table-cell">Email</TableHead>
                      <TableHead>Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map((sup: any) => (
                      <TableRow key={sup.id}>
                        <TableCell className="font-mono text-xs">{sup.code}</TableCell>
                        <TableCell className="text-sm font-medium">{sup.name}</TableCell>
                        <TableCell className="hidden md:table-cell text-xs">{sup.contactName || '-'}</TableCell>
                        <TableCell className="hidden lg:table-cell text-xs">{sup.email || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div key={i} className={`w-2 h-2 rounded-full ${i < (sup.rating || 0) ? 'bg-amber-400' : 'bg-muted'}`} />
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Part Detail / Edit Dialog */}
      <Dialog open={showPartDetail} onOpenChange={(open) => { setShowPartDetail(open); if (!open) setSelectedPart(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              {selectedPart?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedPart && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Code</Label>
                  <p className="text-sm font-mono">{selectedPart.code}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Catégorie</Label>
                  <p className="text-sm">{selectedPart.category?.name || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Fabricant</Label>
                  <p className="text-sm">{selectedPart.manufacturer || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Référence</Label>
                  <p className="text-sm">{selectedPart.partNumber || '-'}</p>
                </div>
              </div>
              <div className="border-t pt-4 space-y-3">
                <h4 className="text-sm font-semibold">Modifier les informations de stock</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Stock actuel</Label>
                    <Input
                      type="number"
                      value={editPartForm.currentStock}
                      onChange={(e) => setEditPartForm({...editPartForm, currentStock: e.target.value})}
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Stock minimum</Label>
                    <Input
                      type="number"
                      value={editPartForm.minStockLevel}
                      onChange={(e) => setEditPartForm({...editPartForm, minStockLevel: e.target.value})}
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Prix unitaire</Label>
                    <Input
                      type="number"
                      value={editPartForm.unitPrice}
                      onChange={(e) => setEditPartForm({...editPartForm, unitPrice: e.target.value})}
                      className="h-9"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPartDetail(false)}>Fermer</Button>
            <Button onClick={handleUpdatePart} disabled={saving} className="bg-primary hover:bg-primary/90">
              {saving ? 'Enregistrement...' : 'Sauvegarder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Part Dialog */}
      <Dialog open={showCreate} onOpenChange={(open) => { setShowCreate(open); if (!open) setCreateForm({ ...emptyCreateForm }); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Nouvelle Pièce</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-xs">Nom *</Label><Input value={createForm.name} onChange={(e) => setCreateForm({...createForm, name: e.target.value})} className="h-9" /></div>
            <div><Label className="text-xs">Code *</Label><Input value={createForm.code} onChange={(e) => setCreateForm({...createForm, code: e.target.value})} className="h-9" placeholder="P-XXX" /></div>
            <div>
              <Label className="text-xs">Catégorie</Label>
              <Select value={createForm.categoryId} onValueChange={(v) => setCreateForm({...createForm, categoryId: v})}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>
                  {categories.length > 0
                    ? categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)
                    : hardcodedPartCategories.map((cat) => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)
                  }
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Unité</Label><Input value={createForm.unit} onChange={(e) => setCreateForm({...createForm, unit: e.target.value})} className="h-9" /></div>
            <div><Label className="text-xs">Prix unitaire (GNF)</Label><Input value={createForm.unitPrice} onChange={(e) => setCreateForm({...createForm, unitPrice: e.target.value})} className="h-9" type="number" /></div>
            <div><Label className="text-xs">Stock actuel</Label><Input value={createForm.currentStock} onChange={(e) => setCreateForm({...createForm, currentStock: e.target.value})} className="h-9" type="number" /></div>
            <div><Label className="text-xs">Stock minimum</Label><Input value={createForm.minStockLevel} onChange={(e) => setCreateForm({...createForm, minStockLevel: e.target.value})} className="h-9" type="number" /></div>
            <div className="col-span-2"><Label className="text-xs">Description</Label><Textarea value={createForm.description} onChange={(e) => setCreateForm({...createForm, description: e.target.value})} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreate(false); setCreateForm({ ...emptyCreateForm }); }}>Annuler</Button>
            <Button onClick={handleCreatePart} disabled={saving} className="bg-primary hover:bg-primary/90">
              {saving ? 'Création...' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Movement Dialog */}
      <Dialog open={showMovement} onOpenChange={(open) => { setShowMovement(open); if (!open) setMovementForm({ ...emptyMovementForm }); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Nouveau Mouvement de Stock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Pièce *</Label>
              <Select value={movementForm.partId} onValueChange={(v) => setMovementForm({...movementForm, partId: v})}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>
                  {parts.map((p) => <SelectItem key={p.id} value={p.id}>{p.code} - {p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Type</Label>
                <Select value={movementForm.type} onValueChange={(v) => setMovementForm({...movementForm, type: v})}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(movementTypeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Quantité</Label>
                <Input value={movementForm.quantity} onChange={(e) => setMovementForm({...movementForm, quantity: e.target.value})} className="h-9" type="number" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Entrepôt</Label>
              <Select value={movementForm.warehouseId} onValueChange={(v) => setMovementForm({...movementForm, warehouseId: v})}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>
                  {warehouses.map((w: any) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Notes</Label>
              <Textarea value={movementForm.notes} onChange={(e) => setMovementForm({...movementForm, notes: e.target.value})} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowMovement(false); setMovementForm({ ...emptyMovementForm }); }}>Annuler</Button>
            <Button onClick={handleCreateMovement} disabled={saving} className="bg-primary hover:bg-primary/90">
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
