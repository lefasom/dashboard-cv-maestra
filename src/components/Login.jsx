// src/components/Login.jsx
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");

  const entrar = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, clave);
    } catch {
      setError("Email o contraseña incorrectos.");
    }
  };

  return (
    <form className="login" onSubmit={entrar}>
      <h1>Dash CV Master</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={clave}
        onChange={(e) => setClave(e.target.value)}
        required
      />

      <button type="submit">Entrar</button>

      {error && <p className="error">{error}</p>}
    </form>
  );
}
