import { Logo } from "@/components/logo";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
            <Link href="/" className="flex items-center gap-2">
                <Logo className="h-10 w-10"/>
                <span className="text-2xl font-bold text-primary font-headline">FieldForce Manager</span>
            </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
