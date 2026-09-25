import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Shield, ShieldAlert, Check } from 'lucide-react';

const MOCK_ROLES = [
  { 
    id: 'ADMIN', 
    name: 'Administrator', 
    description: 'Full access to all platform features, settings, and user management.',
    users: 2,
    permissions: [
      { module: 'Users', actions: ['Create', 'Read', 'Update', 'Delete'] },
      { module: 'Roles', actions: ['Create', 'Read', 'Update', 'Delete'] },
      { module: 'Projects', actions: ['Create', 'Read', 'Update', 'Delete'] },
    ]
  },
  { 
    id: 'PROJECT_MANAGER', 
    name: 'Project Manager', 
    description: 'Can manage organizations, projects, project members, tasks, and deadlines.',
    users: 8,
    permissions: [
      { module: 'Users', actions: ['Read'] },
      { module: 'Roles', actions: [] },
      { module: 'Projects', actions: ['Create', 'Read', 'Update', 'Delete'] },
    ]
  },
  { 
    id: 'MEMBER', 
    name: 'Member', 
    description: 'Can participate in projects, manage assigned tasks, and communicate.',
    users: 24,
    permissions: [
      { module: 'Users', actions: ['Read'] },
      { module: 'Roles', actions: [] },
      { module: 'Projects', actions: ['Read'] },
    ]
  },
];

export default function AdminRolesPage() {
  const [selectedRole, setSelectedRole] = useState(MOCK_ROLES[0]);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Role Management</h2>
        <p className="text-muted-foreground mt-1">Configure roles and their associated permissions.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-4 space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg">System Roles</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col">
                {MOCK_ROLES.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role)}
                    className={`flex items-start gap-3 p-4 text-left border-b last:border-0 transition-colors hover:bg-slate-50 ${
                      selectedRole.id === role.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className={`mt-1 rounded-full p-1.5 ${
                      role.id === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {role.id === 'ADMIN' ? <ShieldAlert className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{role.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{role.description}</p>
                      <p className="text-xs font-medium text-slate-700 mt-2">{role.users} active users</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-8">
          <Card className="h-full">
            <CardHeader className="border-b bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedRole.name} Permissions</CardTitle>
                  <CardDescription className="mt-1">{selectedRole.description}</CardDescription>
                </div>
                <Button variant="secondary" size="sm">Edit Role</Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <h4 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Module Permissions</h4>
              <div className="space-y-6">
                {selectedRole.permissions.map((perm, idx) => (
                  <div key={idx} className="border rounded-lg overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 border-b">
                      <span className="font-medium text-slate-700">{perm.module}</span>
                    </div>
                    <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['Create', 'Read', 'Update', 'Delete'].map((action) => {
                        const hasPermission = perm.actions.includes(action);
                        return (
                          <div key={action} className="flex items-center gap-2">
                            <div className={`flex h-5 w-5 items-center justify-center rounded border ${
                              hasPermission ? 'bg-primary border-primary text-white' : 'border-slate-300 bg-slate-50 text-transparent'
                            }`}>
                              <Check className="h-3 w-3" />
                            </div>
                            <span className="text-sm text-slate-700">{action}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
