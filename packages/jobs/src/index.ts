export type Event =
  | { type: "SESSION_CREATED"; payload: { sesion_id: string; organization_id: string } }
  | { type: "SESSION_UPDATED"; payload: { sesion_id: string } }
  | { type: "SESSION_CANCELLED"; payload: { sesion_id: string } };

export async function emit(event: Event): Promise<void> {
  // Stub: log event — conectar Trigger.dev cuando esté listo
  console.log("[Jobs] event:", event.type, event.payload);
}
