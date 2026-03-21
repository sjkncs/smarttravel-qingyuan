"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-6">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-bold mb-2">页面出了点问题</h2>
        <p className="text-sm text-muted-foreground mb-6">
          {error.message || "发生了意外错误，请稍后重试。"}
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            重试
          </Button>
          <Button onClick={() => (window.location.href = "/")} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            返回首页
          </Button>
        </div>
        {error.digest && (
          <p className="text-[10px] text-muted-foreground/50 mt-4">错误ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
