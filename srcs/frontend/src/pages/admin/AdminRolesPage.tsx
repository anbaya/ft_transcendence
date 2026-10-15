import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { 
  Shield, 
  ShieldAlert, 
  Check, 
  AlertCircle, 
  Edit3, 
  X,
  Lock,
  Layers
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useRoleStore } from '@/stores/roleStore';
import type { RolePermission } from '@/types/role';

const ALL_MODULES = ['Users', 'Projects', 'Tasks', 'Documents'];
const ALL_ACTIONS = ['Create', 'Read', 'Update', 'Delete'];

export default function AdminRolesPage() {
  const { 
    roles, 
    selectedRole, 
    isLoading, 
    error, 
    fetchRoles, 
    selectRole, 
    updateRole 
  } = useRoleStore();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [draftPermissions, setDraftPermissions] = useState<RolePermission[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Fetch roles on mount
  useEffect(() => {
    fetchRoles();
  }, []);

  // When opening edit modal, initialize draft permissions from selectedRole
  const handleOpenEdit = () => {
    if (!selectedRole) return;
    
    // Ensure all standard modules exist in the draft permissions
    const existingMap = new Map(selectedRole.permissions.map((p) => [p.module, p.actions]));
    const initialDraft: RolePermission[] = ALL_MODULES.map((mod) => ({
      module: mod,
      actions: existingMap.get(mod) || [],
    }));

    setDraftPermissions(initialDraft);
    setModalError(null);
    setIsEditOpen(true);
  };

  // Toggle a single permission action in the modal draft
  const handleToggleAction = (moduleName: string, action: string) => {
    setDraftPermissions((prev) =>
      prev.map((perm) => {
        if (perm.module !== moduleName) return perm;
        const exists = perm.actions.includes(action);
        const nextActions = exists
          ? perm.actions.filter((a) => a !== action)
          : [...perm.actions, action];
        return { ...perm, actions: nextActions };
      })
    );
  };

  // Save updated permissions
  const handleSavePermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    setIsSubmitting(true);
    setModalError(null);
    try {
      await updateRole(selectedRole.id, {
        permissions: draftPermissions,
      });
      setIsEditOpen(false);
    } catch (err: any) {
      setModalError(err.message || 'Failed to update permissions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Role Management</h2>
        <p className="text-muted-foreground mt-1">Configure system roles and their associated module permissions.</p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => fetchRoles()}>
            Retry
          </Button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Column: Roles list */}
        <div className="md:col-span-4 space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg">System Roles</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col">
                {isLoading && roles.length === 0 ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 border-b last:border-0 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-3 w-48" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  ))
                ) : roles.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">
                    No roles configured on the server.
                  </div>
                ) : (
                  roles.map((role) => {
                    const isSelected = selectedRole?.id === role.id;
                    const isAdmin = role.id === 'ADMIN' || role.name.toLowerCase().includes('admin');

                    return (
                      <button
                        key={role.id}
                        onClick={() => selectRole(role)}
                        className={`flex items-start gap-3 p-4 text-left border-b last:border-0 transition-colors hover:bg-slate-50 ${
                          isSelected ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'
                        }`}
                      >
                        <div className={`mt-1 rounded-full p-1.5 ${
                          isAdmin ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isAdmin ? <ShieldAlert className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">{role.name}</h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{role.description}</p>
                          {role.users_count !== undefined && (
                            <p className="text-xs font-medium text-slate-700 mt-2">
                              {role.users_count} active {role.users_count === 1 ? 'user' : 'users'}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Permissions Matrix */}
        <div className="md:col-span-8">
          {selectedRole ? (
            <Card className="h-full">
              <CardHeader className="border-b bg-slate-50/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {selectedRole.name} Permissions
                      {selectedRole.id === 'ADMIN' && (
                        <span className="text-xs font-normal bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                          Full Access
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">{selectedRole.description}</CardDescription>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={handleOpenEdit}
                    className="gap-1.5 shrink-0"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit Permissions
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <h4 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="h-4 w-4 text-slate-500" />
                  Module Access Matrix
                </h4>
                
                {selectedRole.permissions.length === 0 ? (
                  <div className="py-12 text-center text-sm text-slate-500">
                    No custom permissions specified for this role.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedRole.permissions.map((perm, idx) => (
                      <div key={idx} className="border border-border rounded-lg overflow-hidden">
                        <div className="bg-slate-50/80 px-4 py-2 border-b border-border flex items-center justify-between">
                          <span className="font-medium text-slate-800 text-sm">{perm.module}</span>
                          <span className="text-xs text-slate-400">
                            {perm.actions.length} / 4 actions granted
                          </span>
                        </div>
                        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {ALL_ACTIONS.map((action) => {
                            const hasPermission = perm.actions.includes(action);
                            return (
                              <div key={action} className="flex items-center gap-2">
                                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                                  hasPermission 
                                    ? 'bg-emerald-600 border-emerald-600 text-white' 
                                    : 'border-slate-300 bg-slate-50 text-transparent'
                                }`}>
                                  <Check className="h-3.5 w-3.5" />
                                </div>
                                <span className={`text-sm ${hasPermission ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                                  {action}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center p-12 text-center text-slate-500">
              Select a system role to view its permissions.
            </Card>
          )}
        </div>
      </div>

      {/* Edit Permissions Modal Dialog */}
      <Dialog.Root open={isEditOpen} onOpenChange={setIsEditOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-white p-6 shadow-xl duration-200 sm:rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary/10 text-secondary">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <Dialog.Title className="text-lg font-semibold text-slate-900">
                    Edit Role Permissions: {selectedRole?.name}
                  </Dialog.Title>
                  <Dialog.Description className="text-xs text-slate-500">
                    Configure granted actions per module for this role.
                  </Dialog.Description>
                </div>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalError && (
              <div className="rounded-md bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSavePermissions} className="space-y-4 pt-2">
              <div className="space-y-3">
                {draftPermissions.map((perm) => (
                  <div key={perm.module} className="border border-border rounded-lg p-3 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900">{perm.module}</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setDraftPermissions((prev) =>
                              prev.map((p) =>
                                p.module === perm.module ? { ...p, actions: [...ALL_ACTIONS] } : p
                              )
                            );
                          }}
                          className="text-[11px] text-blue-600 hover:underline"
                        >
                          Select All
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            setDraftPermissions((prev) =>
                              prev.map((p) =>
                                p.module === perm.module ? { ...p, actions: [] } : p
                              )
                            );
                          }}
                          className="text-[11px] text-slate-500 hover:underline"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {ALL_ACTIONS.map((action) => {
                        const checked = perm.actions.includes(action);
                        return (
                          <label
                            key={action}
                            className={`flex items-center gap-2 p-2 rounded-md border text-xs font-medium cursor-pointer transition-colors ${
                              checked 
                                ? 'bg-white border-primary/40 text-primary shadow-sm' 
                                : 'bg-white/60 border-slate-200 text-slate-500 hover:bg-white'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggleAction(perm.module, action)}
                              className="rounded border-slate-300 text-primary focus:ring-primary/20 h-3.5 w-3.5"
                            />
                            <span>{action}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setIsEditOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Permissions'}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
