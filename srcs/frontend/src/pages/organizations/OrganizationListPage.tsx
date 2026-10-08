import { Link } from 'react-router-dom';
import { Building2, Plus, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

import { useEffect } from 'react';
import { useOrganizationStore } from '@/stores/organizationStore';

export default function OrganizationListPage() {
  const { user } = useAuthStore();
  const canCreate = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';
  const { organizations, fetchOrganizations, isLoading } = useOrganizationStore();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Organizations</h1>
          <p className="text-sm text-muted mt-1">Manage your teams and workspaces</p>
        </div>
        {canCreate && (
          <Button className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Create Organization
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : organizations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {organizations.map((org) => (
            <div key={org.id} className="flex flex-col justify-between rounded-lg border border-border bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-indigo-200 group">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-secondary">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <Badge variant="default" className="text-xs">
                    Org
                  </Badge>
                </div>
                
                <h3 className="mt-4 text-lg font-semibold text-primary">{org.name}</h3>
                <p className="mt-1 text-sm text-muted">
                  {org.description || 'No description provided'}
                </p>
              </div>
              
              <div className="mt-6">
                <Link to={`/organizations/${org.id}`}>
                  <Button variant="secondary" className="w-full group-hover:bg-indigo-50 transition-colors">
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center bg-white">
          <Building2 className="mx-auto h-12 w-12 text-muted/50" />
          <h3 className="mt-4 text-lg font-semibold text-primary">No organizations</h3>
          <p className="mt-2 text-sm text-muted max-w-sm">
            You don't belong to any organizations yet. Create one to start collaborating.
          </p>
          {canCreate && (
            <Button className="mt-6">
              <Plus className="mr-2 h-4 w-4" />
              Create Organization
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
