
import { Link } from "react-router-dom";

export function LoginLink() {
  return (
    <div className="text-center text-sm">
      <span className="text-muted-foreground">¿No tienes cuenta? </span>
      <Link to="/register" className="text-primary hover:underline">
        Regístrate
      </Link>
    </div>
  );
}
