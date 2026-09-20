import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as Tabs from '@radix-ui/react-tabs';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Avatar from '@radix-ui/react-avatar';
import { Building2, Settings, ArrowLeft, MoreHorizontal, UserPlus, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { AddMemberModal } from '@/features/organizations/components/AddMemberModal';
import { RemoveMemberModal } from '@/features/organizations/components/RemoveMemberModal';

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'PM' | 'Member';
}

const mockMembers: Member[] = [
  { id: '1', name: 'Anoir Baya', email: 'anoir@mail.com', role: 'Admin' },
  { id: '2', name: 'Douaa E.', email: 'douaa@mail.com', role: 'PM' },
  { id: '3', name: 'Anas K.', email: 'anas@mail.com', role: 'Member' },
];

export default function OrganizationDetailsPage() {
  const { id } = useParams();
  
  // Modal state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);

  // Mock org data based on ID
  const orgName = id === '1' ? 'Acme Corp' : id === '2' ? 'Startup Inc' : 'Side Project';

  return (
    <div className="space-y-6">
      {/* Top Nav */}
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link to="/organizations" className="hover:text-primary hover:underline">
          <ArrowLeft className="inline-block h-4 w-4 mr-1 mb-0.5" />
          Organizations
        </Link>
        <span>/</span>
        <span className="font-medium text-primary">{orgName}</span>
      </div>

      {/* Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border bg-white p-6 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-indigo-50 text-secondary shrink-0">
            <Building2 className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">{orgName}</h1>
            <p className="text-sm text-muted mt-1">
              Created Jan 2025 · {mockMembers.length} members · 5 projects
            </p>
          </div>
        </div>
        <Button variant="secondary" className="shrink-0">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>

      {/* Tabs */}
      <Tabs.Root defaultValue="members" className="flex flex-col w-full">
        <Tabs.List className="flex shrink-0 border-b border-border">
          <Tabs.Trigger
            value="members"
            className="flex h-11 items-center justify-center bg-transparent px-5 text-sm font-medium text-muted hover:text-primary data-[state=active]:border-b-2 data-[state=active]:border-secondary data-[state=active]:text-secondary outline-none transition-colors"
          >
            Members
          </Tabs.Trigger>
          <Tabs.Trigger
            value="projects"
            className="flex h-11 items-center justify-center bg-transparent px-5 text-sm font-medium text-muted hover:text-primary data-[state=active]:border-b-2 data-[state=active]:border-secondary data-[state=active]:text-secondary outline-none transition-colors"
          >
            Projects
          </Tabs.Trigger>
          <Tabs.Trigger
            value="settings"
            className="flex h-11 items-center justify-center bg-transparent px-5 text-sm font-medium text-muted hover:text-primary data-[state=active]:border-b-2 data-[state=active]:border-secondary data-[state=active]:text-secondary outline-none transition-colors"
          >
            Settings
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="members" className="py-6 outline-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <h2 className="text-lg font-semibold text-primary">Members ({mockMembers.length})</h2>
            <Button onClick={() => setIsAddMemberOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-white shadow-sm overflow-hidden text-sm">
            {/* Table Header */}
            <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,2fr)_100px_60px] sm:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_150px_60px] gap-4 bg-slate-50 px-6 py-3 font-semibold text-muted uppercase tracking-wider text-xs border-b border-border">
              <div>Name</div>
              <div className="hidden sm:block">Email</div>
              <div>Role</div>
              <div className="text-right">Actions</div>
            </div>
            
            {/* Table Body */}
            <div className="divide-y divide-border">
              {mockMembers.map((member) => (
                <div key={member.id} className="grid grid-cols-[minmax(0,2fr)_minmax(0,2fr)_100px_60px] sm:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_150px_60px] gap-4 items-center px-6 py-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar.Root className="h-8 w-8 shrink-0 rounded-full overflow-hidden bg-slate-100 hidden sm:flex items-center justify-center">
                      <Avatar.Image className="h-full w-full object-cover" src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.name}`} />
                      <Avatar.Fallback className="text-xs font-medium text-primary">{member.name.charAt(0)}</Avatar.Fallback>
                    </Avatar.Root>
                    <span className="font-medium text-primary truncate">{member.name}</span>
                  </div>
                  
                  <div className="hidden sm:block text-muted truncate">
                    {member.email}
                  </div>
                  
                  <div>
                    <Badge variant={member.role === 'Admin' ? 'error' : member.role === 'PM' ? 'warning' : 'default'} className="text-xs font-medium">
                      {member.role}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-end">
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted hover:bg-slate-200 hover:text-primary outline-none transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content align="end" className="z-50 min-w-[160px] bg-white rounded-md p-1 shadow-md border border-border animate-in fade-in-80">
                          <DropdownMenu.Item className="flex items-center px-2 py-1.5 text-sm outline-none cursor-pointer hover:bg-slate-100 rounded-sm">
                            <User className="mr-2 h-4 w-4 text-muted" />
                            View Profile
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator className="h-px bg-border my-1" />
                          <DropdownMenu.Item 
                            className="flex items-center px-2 py-1.5 text-sm text-error outline-none cursor-pointer hover:bg-red-50 hover:text-red-700 rounded-sm"
                            onSelect={() => setMemberToRemove(member)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove Member
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Tabs.Content>

        <Tabs.Content value="projects" className="py-6 outline-none">
          <EmptyState
            icon={Building2}
            title="No projects here yet"
            description="Create a project to start organizing your work in this organization."
            actionLabel="Create Project"
            onAction={() => {}}
          />
        </Tabs.Content>

        <Tabs.Content value="settings" className="py-6 outline-none">
          <EmptyState
            icon={Settings}
            title="Organization Settings"
            description="Manage your organization's preferences, billing, and global settings here."
          />
        </Tabs.Content>
      </Tabs.Root>
      
      {/* Modals */}
      <AddMemberModal
        open={isAddMemberOpen}
        onOpenChange={setIsAddMemberOpen}
        orgName={orgName}
      />
      
      {memberToRemove && (
        <RemoveMemberModal
          open={!!memberToRemove}
          onOpenChange={(open) => !open && setMemberToRemove(null)}
          memberName={memberToRemove.name}
          orgName={orgName}
        />
      )}
    </div>
  );
}
