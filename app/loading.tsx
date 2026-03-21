import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">加载中...</p>
      </div>
    </div>
  );
}
