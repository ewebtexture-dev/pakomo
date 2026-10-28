import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-5 py-12">
      <div className="max-w-xl text-center rounded-3xl border border-border bg-card p-12 shadow-xl shadow-black/5">
        <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground mb-4">Page not found</p>
        <h1 className="text-5xl font-bold text-foreground mb-4">404</h1>
        <p className="text-base text-muted-foreground mb-8">The page you are looking for does not exist. Return to the homepage to continue exploring our products and services.</p>
        <Link href="/" className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          Back to home
        </Link>
      </div>
    </div>
  );
}
