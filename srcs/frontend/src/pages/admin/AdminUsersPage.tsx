import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Search, Plus, MoreVertical, Edit2, Shield, Trash2, Mail } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

// Mock Data
const MOCK_USERS = [
  { id: '1', name: 'Anoir Oulid', email: 'anoir@example.com', role: 'ADMIN', status: 'ACTIVE', avatar: 'https://i.pravatar.cc/150?u=anoir' },
  { id: '2', name: 'Douaa', email: 'douaa@example.com', role: 'PROJECT_MANAGER', status: 'ACTIVE', avatar: 'https://i.pravatar.cc/150?u=douaa' },
  { id: '3', name: 'Mohammed', email: 'mohammed@example.com', role: 'MEMBER', status: 'INACTIVE', avatar: 'https://i.pravatar.cc/150?u=mo' },
  { id: '4', name: 'Fatima', email: 'fatima@example.com', role: 'MEMBER', status: 'ACTIVE', avatar: 'https://i.pravatar.cc/150?u=fatima' },
];

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = MOCK_USERS.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h2>
          <p className="text-muted-foreground mt-1">Manage platform users, roles, and access.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Invite User
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b bg-slate-50/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">All Users</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b">
                <tr>
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No users found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={user.avatar} fallback={user.name.charAt(0)} size="sm" />
                          <div>
                            <div className="font-medium text-slate-900">{user.name}</div>
                            <div className="text-xs text-slate-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {user.role === 'ADMIN' && <Shield className="h-3.5 w-3.5 text-purple-500" />}
                          <span className="font-medium text-slate-700">
                            {user.role.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={user.status === 'ACTIVE' ? 'success' : 'default'} className="text-xs">
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content align="end" className="z-50 min-w-[160px] rounded-md border border-border bg-white p-1 shadow-md animate-in fade-in-80">
                              <DropdownMenu.Item className="flex cursor-pointer items-center rounded-sm px-2 py-2 text-sm outline-none focus:bg-slate-100">
                                <Edit2 className="mr-2 h-4 w-4 text-slate-500" />
                                Edit Details
                              </DropdownMenu.Item>
                              <DropdownMenu.Item className="flex cursor-pointer items-center rounded-sm px-2 py-2 text-sm outline-none focus:bg-slate-100">
                                <Mail className="mr-2 h-4 w-4 text-slate-500" />
                                Resend Invite
                              </DropdownMenu.Item>
                              <DropdownMenu.Separator className="my-1 h-px bg-border" />
                              <DropdownMenu.Item className="flex cursor-pointer items-center rounded-sm px-2 py-2 text-sm text-red-600 outline-none focus:bg-red-50">
                                <Trash2 className="mr-2 h-4 w-4" />
                                {user.status === 'ACTIVE' ? 'Deactivate' : 'Delete'}
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
