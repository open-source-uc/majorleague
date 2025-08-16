"use client";

interface RefreshButtonProps {
  title?: string;
  className?: string;
  showText?: boolean;
}

export function RefreshButton({
  title = "Actualizar estado",
  className = "bg-background hover:bg-background-header border-border-header text-foreground rounded-lg border px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2",
  showText = true,
}: RefreshButtonProps) {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <button onClick={handleRefresh} className={className} title={title}>
      <span className="text-base">🔄</span>
      {showText ? <span className="hidden sm:inline">Actualizar</span> : null}
    </button>
  );
}
