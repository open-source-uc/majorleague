export default function PlanilleroLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
