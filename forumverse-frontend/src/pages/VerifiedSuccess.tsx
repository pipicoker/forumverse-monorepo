import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const VerifiedSuccess = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">✅ Email Verified!</h2>
        <p className="text-gray-600">Your email has been successfully verified. You can now log in to your account.</p>
        <Link to="/login">
          <Button>Go to Login</Button>
        </Link>
      </div>
    </div>
  );
};

export default VerifiedSuccess;
