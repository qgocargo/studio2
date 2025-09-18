
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { auth } from '@/lib/firebase/firebase'; 
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { createSession } from '@/lib/actions';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    try {
      let userCredential;
      if (isLogin) {
        if (!email || !password) {
          setError('Please enter both email and password.');
          setLoading(false);
          return;
        }
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (!email || !password || !name) {
          setError('Please fill all fields.');
          setLoading(false);
          return;
        }
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await updateProfile(userCredential.user, { displayName: name });
        // Also set the role for new user if needed, via a server action or firestore trigger
      }

      // If login/signup is successful, get the ID token and create a session cookie.
      const idToken = await userCredential.user.getIdToken();
      await createSession(idToken);
      
      // The server action `createSession` will handle the redirect.
      // No need for router.push('/') here.

    } catch (error: any) {
      console.error('Firebase Auth Error:', error);
      if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password'
      ) {
        setError('Invalid email or password.');
      } else if (error.code === 'auth/email-already-in-use') {
        setError('This email is already in use.');
      } else {
        setError('An unknown error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-center text-2xl font-bold text-gray-900 mb-6">
        {isLogin ? 'Sign in to your account' : 'Create a new account'}
      </h2>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          {!isLogin && (
            <div>
              <Label htmlFor="full-name" className="sr-only">
                Full Name
              </Label>
              <Input
                id="full-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="Full Name"
                disabled={loading}
                suppressHydrationWarning
              />
            </div>
          )}
          <div>
            <Label htmlFor="email-address" className="sr-only">
              Email address
            </Label>
            <Input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Email address"
              disabled={loading}
              suppressHydrationWarning
            />
          </div>
          <div>
            <Label htmlFor="password" className="sr-only">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              required
              placeholder="Password"
              disabled={loading}
              suppressHydrationWarning
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div>
          <Button className="w-full" type="submit" disabled={loading} suppressHydrationWarning>
            {loading ? 'Submitting...' : isLogin ? 'Sign in' : 'Create an account'}
          </Button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
          }}
          className="font-medium text-primary hover:text-primary/90 focus:outline-none"
          disabled={loading}
          suppressHydrationWarning
        >
          {isLogin
            ? 'Create a new account'
            : 'Already have an account? Sign in'}
        </button>
      </p>
    </>
  );
}
