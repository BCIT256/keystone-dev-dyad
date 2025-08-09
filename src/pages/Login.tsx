import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/components/AuthProvider';
import { useEffect } from 'react';
import { PageLoader } from '@/components/PageLoader';

const Login = () => {
  const navigate = useNavigate();
  const session = useSession();

  useEffect(() => {
    if (session) {
      navigate('/', { replace: true });
    }
  }, [session, navigate]);

  if (session) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <div className="max-w-md w-full space-y-8">
        <header className="text-center">
            <h1 className="text-4xl font-bold tracking-tighter">Welcome Back</h1>
            <p className="text-lg text-muted-foreground mt-2">Sign in to continue your journey.</p>
        </header>
        <div className="p-8 rounded-lg shadow-lg bg-card">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={[]}
            theme="light"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;