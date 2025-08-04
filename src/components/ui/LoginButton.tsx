
'use client';

import { useState, useEffect } from 'react';
import { signInWithGoogle, logout, onAuthChange } from '@/lib/auth';
import type { User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';


export default function LoginButton() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
       if (user) {
        // Redirect to main page after login
        router.push('/');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async () => {
    try {
        await signInWithGoogle();
        router.push('/');
    } catch (error) {
        console.error("Error during Google Sign In:", error)
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (user) {
    return (
       <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-muted-foreground">Logueado como {user.displayName || user.email}</p>
        <Button onClick={handleLogout} variant="secondary">
          <LogOut className="mr-2" />
          Cerrar sesión
        </Button>
       </div>
    )
  }

  return (
    <Button onClick={handleLogin} size="lg">
      <LogIn className="mr-2" />
      Iniciar sesión con Google
    </Button>
  );
}
