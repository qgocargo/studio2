import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LoginForm } from './login-form';

export default function LoginPage() {
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
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
