import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import axios from '@/lib/axios';

const VerifyEmailSent = () => {
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    if (!email) {
      toast({ title: 'Enter your email', variant: 'destructive' });
      return;
    }

    setResending(true);
    try {
      await axios.post('/auth/resend-verification', { email });
      toast({ title: 'Verification email resent', description: 'Check your inbox.' });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full text-center space-y-4">
        <h2 className="text-2xl font-bold">Check your inbox ✉️</h2>
        <p className="text-gray-600">We sent a verification email. Please verify your email before logging in.</p>

        <Input
          type="email"
          placeholder="Enter your email to resend"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button onClick={handleResend} disabled={resending}>
          {resending ? 'Resending...' : 'Resend Verification Email'}
        </Button>
      </div>
    </div>
  );
};

export default VerifyEmailSent;
