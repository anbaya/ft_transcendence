import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Camera, Save, LogOut, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'Anoir Oulid',
    email: user?.email || 'anoir@example.com',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Show success toast here in real app
    }, 1000);
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      // Show error
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      // Show success toast here in real app
    }, 1000);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-4xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">My Profile</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Column: Avatar & Quick Info */}
        <div className="md:col-span-4 space-y-6">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="relative group cursor-pointer">
                <Avatar 
                  fallback={formData.name.charAt(0).toUpperCase()} 
                  size="xl" 
                  className="h-24 w-24 mb-4 ring-4 ring-white shadow-lg"
                />
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="font-semibold text-lg text-slate-900">
                {formData.name}
              </h3>
              <p className="text-sm text-slate-500 mb-4">{formData.email}</p>
              
              <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                <Shield className="h-4 w-4" />
                {user?.role === 'ADMIN' ? 'Administrator' : 'Project Manager'}
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
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="name">
                    Full Name
                  </label>
                  <Input 
                    id="name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">
                    Email Address
                  </label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t p-6">
                <Button type="submit" disabled={isLoading} className="gap-2">
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
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="currentPassword">
                    Current Password
                  </label>
                  <Input 
                    id="currentPassword" 
                    type="password" 
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="newPassword">
                      New Password
                    </label>
                    <Input 
                      id="newPassword" 
                      type="password" 
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="confirmPassword">
                      Confirm Password
                    </label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t p-6">
                <Button type="submit" disabled={isLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}>
                  Update Password
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-100">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>Log out of your account on this device.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
