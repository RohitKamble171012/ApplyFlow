import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-5 px-4">
        <div className="text-8xl font-bold text-gray-200 select-none">404</div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Page not found</h1>
          <p className="text-sm text-gray-500 mt-1">This page doesn't exist or has been moved.</p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-secondary text-sm">
            <ArrowLeft className="h-4 w-4" /> Go back
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-primary text-sm">
            <Home className="h-4 w-4" /> Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
