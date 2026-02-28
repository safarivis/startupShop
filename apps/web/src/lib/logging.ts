export interface ApiLogEvent {
  endpoint: string;
  method: string;
  status: number;
  latency_ms: number;
  startup_id?: string;
  error_code?: string;
  cache?: 'hit' | 'miss';
  upstream_status?: number;
}

export function logApiEvent(event: ApiLogEvent): void {
  console.log(
    JSON.stringify({
      type: 'api_event',
      ts: new Date().toISOString(),
      ...event
    })
  );
}
