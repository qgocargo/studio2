export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          New Project Ready
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Your old project has been cleared. Tell me what to build next!
        </p>
      </div>
    </main>
  );
}
