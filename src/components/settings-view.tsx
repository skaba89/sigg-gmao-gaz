'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, MapPin, FileText, Shield } from 'lucide-react';
import { api, formatDate } from '@/lib/api';

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

export function SettingsView() {
  const [users, setUsers] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getUsers(),
      api.getSites(),
    ]).then(([usersRes, sitesRes]) => {
      setUsers(Array.isArray(usersRes) ? usersRes : usersRes?.data || []);
      setSites(Array.isArray(sitesRes) ? sitesRes : sitesRes?.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users"><Users className="w-4 h-4 mr-1.5" />Utilisateurs</TabsTrigger>
          <TabsTrigger value="sites"><MapPin className="w-4 h-4 mr-1.5" />Sites</TabsTrigger>
          <TabsTrigger value="audit"><FileText className="w-4 h-4 mr-1.5" />Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
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
                      users.map((user) => (
                        <TableRow key={user.id}>
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

        <TabsContent value="audit">
          <Card>
            <CardContent className="py-12 text-center">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-1">Journal d&apos;Audit</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Les événements d&apos;audit seront affichés ici. Toutes les actions utilisateurs sont tracées pour la conformité et la sécurité.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
