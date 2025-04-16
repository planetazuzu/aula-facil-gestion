
import { Link } from "react-router-dom";

export function RegisterLink() {
  return (
    <div className="text-center text-sm">
      <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
      <Link to="/login" className="text-primary hover:underline">
        Inicia sesión
      </Link>
    </div>
  );
}
