import { useState, useEffect } from "react";

interface BackendWakeUpProps {
  children: React.ReactNode;
  maxWaitSeconds?: number; // Maximum wait time
  retryIntervalMs?: number; // Interval between retries
}

export default function BackendWakeUp({
  children,
  maxWaitSeconds = 30,
  retryIntervalMs = 1000,
}: BackendWakeUpProps) {
  const [backendReady, setBackendReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const wakeUpBackend = async () => {
      const startTime = Date.now();
      try {
        while (isMounted) {
          try {
            const res = await fetch(`${import.meta.env.VITE_ARI_API_URL}/health`);
            if (res.ok) {
              setBackendReady(true);
              return;
            }
          } catch {
            // backend still waking up
          }

          // Check timeout
          const elapsed = (Date.now() - startTime) / 1000;
          if (elapsed >= maxWaitSeconds) {
            setError(
              "Backend is taking too long to start. Please try refreshing in a moment."
            );
            return;
          }

          await new Promise((r) => setTimeout(r, retryIntervalMs));
        }
      } catch (err) {
        setError("Unexpected error contacting backend.");
      }
    };

    wakeUpBackend();

    return () => {
      isMounted = false;
    };
  }, [maxWaitSeconds, retryIntervalMs]);

  if (error) return <div className="text-red-600 p-4">{error}</div>;
  if (!backendReady)
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin mb-4">⏳</div>
        <div>Waking up backend… please wait a few seconds</div>
      </div>
    );

  return <>{children}</>;
}
