import { useState } from 'react';
import {
  Modal, ModalPortal, ModalOverlay, ModalContent,
  ModalTitle, ModalDescription, ModalFooter, ModalClose
} from '@/components/ui/Modal';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Save, LogOut, Shield, Trash2, AlertTriangle } from 'lucide-react';
import apiClient from '@/services/api/client';
import { toast } from '@/stores/toastStore';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const setProfileField = (key: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const setPasswordField = (key: keyof typeof passwordData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setPasswordData((prev) => ({ ...prev, [key]: e.target.value }));

  const isPasswordReady = Object.values(passwordData).every(Boolean);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await apiClient.patch('/api/auth/me/', formData);
      const { token, refreshToken, login } = useAuthStore.getState();
      if (token) login(response.data, token, refreshToken);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      await apiClient.post('/api/auth/change-password/', {
        old_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.non_field_errors?.[0] || error.response?.data?.old_password?.[0] || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/auth/login';
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await apiClient.delete('/api/auth/me/');
      toast.success('Your account has been deleted.');
      logout();
      localStorage.clear();
      window.location.href = '/auth/login';
    } catch (error: any) {
      toast.error(error.response?.data?.detail || error.response?.data?.error || 'Failed to delete account');
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="page-wrapper">
      <h2 className="text-3xl font-bold tracking-tight text-primary">My Profile</h2>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Column: Avatar & Quick Info */}
        <div className="md:col-span-4 space-y-6">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="relative group cursor-pointer">
                <Avatar
                  fallback={(formData.first_name?.[0] || 'A').toUpperCase()}
                  size="xl"
                  className="h-24 w-24 mb-4 ring-4 ring-white shadow-lg"
                />
              </div>
              <h3 className="font-semibold text-lg text-primary">{formData.first_name} {formData.last_name}</h3>
              <p className="text-sm text-muted mb-4">{formData.email}</p>

              <div className="role-pill">
                <Shield className="h-4 w-4" />
                {user?.role === 'ADMIN' ? 'Administrator' : 'Member'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Forms */}
        <div className="md:col-span-8 space-y-6">
          {/* General Information */}
          <Card>
            <form onSubmit={handleProfileUpdate}>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and how others see you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="First Name" value={formData.first_name} onChange={setProfileField('first_name')} disabled={isLoading} />
                  <Input label="Last Name" value={formData.last_name} onChange={setProfileField('last_name')} disabled={isLoading} />
                </div>
                <Input label="Email Address" type="email" value={formData.email} onChange={setProfileField('email')} disabled={isLoading} />
              </CardContent>
              <CardFooter className="justify-end border-t p-6">
                <Button type="submit" isLoading={isLoading} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Change Password */}
          <Card>
            <form onSubmit={handlePasswordUpdate}>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Update your password to keep your account secure.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input label="Current Password" type="password" value={passwordData.currentPassword} onChange={setPasswordField('currentPassword')} disabled={isLoading} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="New Password" type="password" value={passwordData.newPassword} onChange={setPasswordField('newPassword')} disabled={isLoading} />
                  <Input label="Confirm Password" type="password" value={passwordData.confirmPassword} onChange={setPasswordField('confirmPassword')} disabled={isLoading} />
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t p-6">
                <Button type="submit" isLoading={isLoading} disabled={!isPasswordReady}>
                  Update Password
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Account Actions */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-primary">Account Actions</CardTitle>
              <CardDescription>Manage your account actions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="action-row action-row-sep">
                <div>
                  <h4 className="font-medium text-primary text-sm">Sign Out</h4>
                  <p className="text-xs text-muted">Log out of your account on this device.</p>
                </div>
                <Button variant="secondary" onClick={handleLogout} className="gap-2 shrink-0">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>

              <div className="action-row">
                <div>
                  <h4 className="font-medium text-red-600 text-sm">Delete Account</h4>
                  <p className="text-xs text-muted">Permanently delete your account and all associated data.</p>
                </div>
                <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} className="gap-2 shrink-0">
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <Modal open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <ModalPortal>
          <ModalOverlay />
          <ModalContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-error">
                <AlertTriangle className="h-5 w-5" />
                <ModalTitle>Delete Account</ModalTitle>
              </div>
              <ModalDescription>
                Are you sure you want to delete your account? This action is permanent and cannot be undone. All your personal data and access will be permanently removed.
              </ModalDescription>
            </div>

            <ModalFooter className="mt-4">
              <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteAccount} isLoading={isDeleting}>
                Delete Account
              </Button>
            </ModalFooter>

            <ModalClose disabled={isDeleting} />
          </ModalContent>
        </ModalPortal>
      </Modal>
    </div>
  );
}
