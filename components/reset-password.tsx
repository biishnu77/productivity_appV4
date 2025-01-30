

// pages/reset-password.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, KeyRound, Mail } from 'lucide-react';
import { resetPassword, getUsernameByEmail } from '@/lib/auth';

interface ResetPasswordProps {
  onBack: () => void;
}

export default function ResetPassword({ onBack }: ResetPasswordProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUsernameRequesting, setIsUsernameRequesting] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [emailForUsername, setEmailForUsername] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { username, email, newPassword, confirmPassword } = formData;

    if (!username.trim() || !email.trim() || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(username.trim(), email.trim(), newPassword);
      toast.success('Password reset successful! Please login with your new password.');
      onBack();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUsernameRequest = async () => {
    if (!emailForUsername.trim()) {
      toast.error('Please enter your email to request your username.');
      return;
    }
  
    setIsUsernameRequesting(true);
    try {
      await getUsernameByEmail(emailForUsername.trim());
      // Always show success message regardless of email existence
      toast.success('If your email is registered, you will receive your username shortly.');
      setEmailForUsername('');
    } catch (error) {
      toast.error('Failed to process your request. Please try again later.');
    } finally {
      setIsUsernameRequesting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
        <CardDescription className="text-center">
          Enter your username and email to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="space-y-2 border-b border-gray-200 pb-4"> {/* Username Request Section */}
            <Input
              type="email"
              placeholder="Email for Username Retrieval"
              value={emailForUsername}
              onChange={(e) => setEmailForUsername(e.target.value)}
              disabled={isUsernameRequesting}
            />
            <Button
              type="button"
              className="w-full"
              onClick={handleUsernameRequest}
              disabled={isUsernameRequesting}
            >
              {isUsernameRequesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Request Username
                </>
              )}
            </Button>
          </div> {/* End Username Request Section */}


          <div className="space-y-2">
            <Input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <Input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={formData.newPassword}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Button type="submit" className="w-full" disabled={isLoading || isUsernameRequesting}> {/* Disable during both processes */}
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                <>
                  <KeyRound className="mr-2 h-4 w-4" />
                  Reset Password
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onBack}
              disabled={isLoading || isUsernameRequesting} // Disable during both processes
            >
              Back to Login
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
