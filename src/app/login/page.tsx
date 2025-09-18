
'use client'

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { signIn, signUp } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react';
import Image from 'next/image';

function SubmitButton({ isLogin }: { isLogin: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" type="submit" aria-disabled={pending}>
      {pending ? 'Submitting...' : (isLogin ? 'Sign in' : 'Create an account')}
    </Button>
  );
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [signInState, signInAction] = useFormState(signIn, { message: null });
  const [signUpState, signUpAction] = useFormState(signUp, { message: null });

  const state = isLogin ? signInState : signUpState;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
           <Image 
                src="http://qgocargo.com/logo.png" 
                alt="Q'go Cargo Logo" 
                width={96} 
                height={96} 
                className="mx-auto h-24 w-auto"
            />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" action={isLogin ? signInAction : signUpAction}>
            <div className="rounded-md shadow-sm -space-y-px">
                {!isLogin && (
                    <div>
                        <Label htmlFor="full-name" className="sr-only">Full Name</Label>
                        <Input
                        id="full-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Full Name"
                        />
                    </div>
                )}
                <div>
                    <Label htmlFor="email-address" className="sr-only">Email address</Label>
                    <Input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${isLogin ? 'rounded-t-md' : ''} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                    placeholder="Email address"
                    />
                </div>
                <div>
                    <Label htmlFor="password" className="sr-only">Password</Label>
                    <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Password"
                    />
                </div>
            </div>

            {state?.message && (
                 <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Authentication Error</AlertTitle>
                    <AlertDescription>
                        {state.message}
                    </AlertDescription>
                </Alert>
            )}

          <div>
            <SubmitButton isLogin={isLogin} />
          </div>
          <p className="mt-2 text-center text-sm text-gray-600">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
            >
              {isLogin ? 'Create a new account' : 'Already have an account? Sign in'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
