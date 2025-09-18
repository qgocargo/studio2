
'use client'

import { useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { signIn, signUp } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';


function SubmitButton({ isLogin }: { isLogin: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" type="submit" aria-disabled={pending} suppressHydrationWarning>
      {pending ? 'Submitting...' : (isLogin ? 'Sign in' : 'Create an account')}
    </Button>
  );
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [signInState, signInAction] = useActionState(signIn, { message: null });
  const [signUpState, signUpAction] = useActionState(signUp, { message: null });

  const state = isLogin ? signInState : signUpState;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full">
             <CardHeader className="text-center">
                 <Image 
                    src="http://qgocargo.com/logo.png" 
                    alt="Q'go Cargo Logo" 
                    width={150} 
                    height={60} 
                    className="mx-auto mb-4"
                />
                <h2 className="text-2xl font-bold text-gray-900">
                    {isLogin ? 'Sign in to your account' : 'Create a new account'}
                </h2>
            </CardHeader>
            <CardContent>
                <form className="space-y-6" action={isLogin ? signInAction : signUpAction}>
                    <div className="space-y-4">
                        {!isLogin && (
                            <div>
                                <Label htmlFor="full-name" className="sr-only">Full Name</Label>
                                <Input
                                id="full-name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                placeholder="Full Name"
                                suppressHydrationWarning
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
                            placeholder="Email address"
                            suppressHydrationWarning
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
                            placeholder="Password"
                            suppressHydrationWarning
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
                </form>
                 <p className="mt-6 text-center text-sm text-gray-600">
                    <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="font-medium text-primary hover:text-primary/90 focus:outline-none"
                    suppressHydrationWarning
                    >
                    {isLogin ? 'Create a new account' : 'Already have an account? Sign in'}
                    </button>
                </p>
            </CardContent>
        </Card>
    </div>
  );
}
