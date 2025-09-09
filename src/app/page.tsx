"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-24 h-24">
            <Logo />
        </div>
        <h1 className="text-3xl font-bold text-primary font-headline">FieldForce Manager</h1>
        <div className="flex items-center gap-2 mt-4 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading your experience...</span>
        </div>
      </div>
    </div>
  );
}
