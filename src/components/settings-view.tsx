'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Users, MapPin, FileText, Shield, Plus, Eye } from 'lucide-react';
import { api, formatDate, formatDateTime } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  DIRECTION_GENERALE: 'Direction Générale',
  RESP_MAINTENANCE: 'Resp. Maintenance',
  RESP_STOCK: 'Resp. Stock',
  TECHNICIEN: 'Technicien',
  AUDITEUR: 'Auditeur',
  FINANCE: 'Finance',
  PRESTATAIRE: 'Prestataire',
};

const roleBadgeClass: Record<string, string> = {
  SUPER_ADMIN: 'bg-red-600',
  DIRECTION_GENERALE: 'bg-purple-600',
  RESP_MAINTENANCE: 'bg-teal-600',
  RESP_STOCK: 'bg-orange-500',
  TECHNICIEN: 'bg-blue-500',
  AUDITEUR: 'bg-amber-500',
  FINANCE: 'bg-green-600',
  PRESTATAIRE: 'bg-slate-500',
};

const siteTypeLabels: Record<string, string> = {
  CENTRAL: 'Central',
  DISTRIBUTION: 'Distribution',
  PRODUCTION: 'Production',
  STOCKAGE: 'Stockage',
};

const actionLabels: Record<string, string> = {
  CREATE: 'Création',
  UPDATE: 'Modification',
  DELETE: 'Suppression',
  LOGIN: 'Connexion',
  LOGOUT: 'Déconnexion',
  STATUS_CHANGE: 'Changement de statut',
  ASSIGN: 'Assignation',
};

const actionColors: Record<string, string> = {
  CREATE: 'bg-green-600',
  UPDATE: 'bg-blue-500',
  DELETE: 'bg-red-600',
  LOGIN: 'bg-teal-600',
  LOGOUT: 'bg-slate-500',
  STATUS_CHANGE: 'bg-amber-500',
  ASSIGN: 'bg-purple-500',
};

const entityLabels: Record<string, string> = {
  equipment: 'Équipement',
  work_order: 'Ordre de travail',
  incident: 'Incident',
  maintenance_plan: 'Plan maintenance',
  part: 'Pièce',
  stock_movement: 'Mouvement stock',
  user: 'Utilisateur',
  site: 'Site',
};

export function SettingsView() {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(false);
  const [entityFilter, setEntityFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [createUserForm, setCreateUserForm] = useState<any>({
    name: '', email: '', password: '', role: 'TECHNICIEN', department: '', phone: '',
  });

  useEffect(() => {
    Promise.all([
      api.getUsers(),
      api.getSites(),
      api.getAuditLogs('?pageSize=50'),
    ]).then(([usersRes, sitesRes, auditRes]) => {
      setUsers(Array.isArray(usersRes) ? usersRes : usersRes?.data || []);
      setSites(Array.isArray(sitesRes) ? sitesRes : sitesRes?.data || []);
      setAuditLogs(auditRes?.data || []);
      setAuditTotal(auditRes?.total || 0);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const loadAuditLogs = (entity?: string) => {
    setAuditLoading(true);
    const params = entity ? `?entity=${entity}&pageSize=50` : '?pageSize=50';
    api.getAuditLogs(params).then((res) => {
      setAuditLogs(res?.data || []);
      setAuditTotal(res?.total || 0);
      setAuditLoading(false);
    }).catch(() => setAuditLoading(false));
  };

  const handleEntityFilterChange = (value: string) => {
    setEntityFilter(value);
    loadAuditLogs(value || undefined);
  };

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setShowUserDetail(true);
  };

  const handleCreateUser = async () => {
    try {
      if (!createUserForm.name || !createUserForm.email || !createUserForm.password) {
        toast({ title: 'Erreur', description: 'Nom, email et mot de passe requis', variant: 'destructive' });
        return;
      }
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createUserForm),
      });
      toast({ title: 'Succès', description: 'Utilisateur créé avec succès' });
      setShowCreateUser(false);
      setCreateUserForm({ name: '', email: '', password: '', role: 'TECHNICIEN', department: '', phone: '' });
      // Reload users
      const usersRes = await api.getUsers();
      setUsers(Array.isArray(usersRes) ? usersRes : usersRes?.data || []);
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users"><Users className="w-4 h-4 mr-1.5" />Utilisateurs</TabsTrigger>
          <TabsTrigger value="sites"><MapPin className="w-4 h-4 mr-1.5" />Sites</TabsTrigger>
          <TabsTrigger value="audit"><FileText className="w-4 h-4 mr-1.5" />Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowCreateUser(true)} size="sm" className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-1.5" />Nouvel Utilisateur
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead className="hidden md:table-cell">Département</TableHead>
                      <TableHead className="hidden lg:table-cell">Site</TableHead>
                      <TableHead className="hidden lg:table-cell">Dernière connexion</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 7 }).map((_, j) => (
                            <TableCell key={j}><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewUser(user)}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs font-semibold bg-primary/15 text-primary">
                                  {user.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-[10px] px-2 py-0 h-5 ${roleBadgeClass[user.role] || 'bg-slate-400'} text-white border-0`}>
                              {roleLabels[user.role] || user.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{user.department || '-'}</TableCell>
                          <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{user.site?.name || '-'}</TableCell>
                          <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                            {user.lastLogin ? formatDate(user.lastLogin) : 'Jamais'}
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-[10px] px-2 py-0 h-5 ${user.isActive ? 'bg-green-600' : 'bg-slate-400'} text-white border-0`}>
                              {user.isActive ? 'Actif' : 'Inactif'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleViewUser(user); }}>
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

        <TabsContent value="sites">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sites.map((site: any) => (
              <Card key={site.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/15">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{site.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{site.code}</p>
                      </div>
                    </div>
                    <Badge className={`text-[10px] ${
                      site.type === 'CENTRAL' ? 'bg-red-600' :
                      site.type === 'PRODUCTION' ? 'bg-teal-600' :
                      site.type === 'DISTRIBUTION' ? 'bg-blue-500' :
                      'bg-amber-500'
                    } text-white border-0`}>
                      {siteTypeLabels[site.type] || site.type}
                    </Badge>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ville</span>
                      <span className="text-xs">{site.city || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pays</span>
                      <span className="text-xs">{site.country || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Statut</span>
                      <Badge className={`text-[10px] px-1.5 py-0 h-4 ${site.isActive ? 'bg-green-600' : 'bg-slate-400'} text-white border-0`}>
                        {site.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{auditTotal} entrée(s) dans le journal</p>
            <Select value={entityFilter} onValueChange={handleEntityFilterChange}>
              <SelectTrigger className="h-9 w-48">
                <SelectValue placeholder="Filtrer par entité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Toutes les entités</SelectItem>
                {Object.entries(entityLabels).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-40">Date & Heure</TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Entité</TableHead>
                      <TableHead className="hidden lg:table-cell">Détails</TableHead>
                      <TableHead className="hidden xl:table-cell">IP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 6 }).map((_, j) => (
                            <TableCell key={j}><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : auditLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Aucune entrée d&apos;audit trouvée
                        </TableCell>
                      </TableRow>
                    ) : (
                      auditLogs.map((log: any) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDateTime(log.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-[9px] bg-primary/15 text-primary">
                                  {log.user?.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-medium">{log.user?.name || 'Système'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-[10px] ${actionColors[log.action] || 'bg-slate-400'} text-white border-0`}>
                              {actionLabels[log.action] || log.action}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs">{entityLabels[log.entity] || log.entity}</span>
                            {log.entityId && (
                              <span className="text-[10px] text-muted-foreground ml-1 font-mono">#{log.entityId.substring(0, 8)}</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-xs text-muted-foreground max-w-[200px] truncate">
                            {log.details || '-'}
                          </TableCell>
                          <TableCell className="hidden xl:table-cell text-xs font-mono text-muted-foreground">
                            {log.ipAddress || '-'}
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
      </Tabs>

      {/* User Detail Dialog */}
      <Dialog open={showUserDetail} onOpenChange={setShowUserDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Profil Utilisateur
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="text-lg font-semibold bg-primary/15 text-primary">
                    {selectedUser.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  <Badge className={`text-[10px] mt-1 ${roleBadgeClass[selectedUser.role] || 'bg-slate-400'} text-white border-0`}>
                    {roleLabels[selectedUser.role] || selectedUser.role}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Téléphone</Label>
                  <p className="text-sm">{selectedUser.phone || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Département</Label>
                  <p className="text-sm">{selectedUser.department || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Site</Label>
                  <p className="text-sm">{selectedUser.site?.name || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Statut</Label>
                  <Badge className={`text-xs ${selectedUser.isActive ? 'bg-green-600' : 'bg-slate-400'} text-white border-0`}>
                    {selectedUser.isActive ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Dernière connexion</Label>
                  <p className="text-sm">{selectedUser.lastLogin ? formatDateTime(selectedUser.lastLogin) : 'Jamais'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Créé le</Label>
                  <p className="text-sm">{formatDate(selectedUser.createdAt)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Nouvel Utilisateur</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Nom complet *</Label>
              <Input value={createUserForm.name} onChange={(e) => setCreateUserForm({...createUserForm, name: e.target.value})} className="h-9" />
            </div>
            <div>
              <Label className="text-xs">Email *</Label>
              <Input value={createUserForm.email} onChange={(e) => setCreateUserForm({...createUserForm, email: e.target.value})} className="h-9" type="email" />
            </div>
            <div>
              <Label className="text-xs">Mot de passe *</Label>
              <Input value={createUserForm.password} onChange={(e) => setCreateUserForm({...createUserForm, password: e.target.value})} className="h-9" type="password" />
            </div>
            <div>
              <Label className="text-xs">Rôle</Label>
              <Select value={createUserForm.role} onValueChange={(v) => setCreateUserForm({...createUserForm, role: v})}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(roleLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Téléphone</Label>
              <Input value={createUserForm.phone} onChange={(e) => setCreateUserForm({...createUserForm, phone: e.target.value})} className="h-9" />
            </div>
            <div>
              <Label className="text-xs">Département</Label>
              <Input value={createUserForm.department} onChange={(e) => setCreateUserForm({...createUserForm, department: e.target.value})} className="h-9" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateUser(false)}>Annuler</Button>
            <Button onClick={handleCreateUser} className="bg-primary hover:bg-primary/90">Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
