
export function LoginDemoCredentials() {
  return (
    <div className="mt-8 border-t pt-6">
      <p className="text-center text-xs font-semibold text-muted-foreground">
        Credenciales de demostración
      </p>
      <div className="mt-2 space-y-2 text-xs">
        <div className="flex items-center justify-between rounded border p-2">
          <span className="font-medium">Administrador</span>
          <code className="rounded bg-muted px-1 py-0.5">
            admin@example.com
          </code>
        </div>
        <div className="flex items-center justify-between rounded border p-2">
          <span className="font-medium">Profesor</span>
          <code className="rounded bg-muted px-1 py-0.5">
            teacher@example.com
          </code>
        </div>
        <div className="flex items-center justify-between rounded border p-2">
          <span className="font-medium">Usuario</span>
          <code className="rounded bg-muted px-1 py-0.5">
            student@example.com
          </code>
        </div>
        <p className="mt-2 text-center">
          <span>Contraseña para todos: </span>
          <code className="rounded bg-muted px-1 py-0.5">password</code>
        </p>
      </div>
    </div>
  );
}
