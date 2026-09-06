import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../contexts/AdminAuthProvider";

export default function AdminLogin() {
  const { login, isAdmin, loading } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#F8F4EC] text-[#1B2A46]">Loading…</div>;
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(email, password);
      navigate("/admin", { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F4EC] px-4 py-10 text-[#1B2A46]">
      <div className="mx-auto max-w-[440px] rounded-[28px] border border-[#1B2A46]/10 bg-[#F3EDE1] p-6 shadow-[0_18px_60px_rgba(27,42,70,0.08)] sm:p-10">
        <div className="text-center">
          <div className="font-display text-[2rem] tracking-[0.14em] uppercase">SOLENNE</div>
          <div className="mt-3 font-sans text-[11px] tracking-[0.22em] uppercase text-[#C6A369]">Administration</div>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <label htmlFor="email" className="mb-2 block font-sans text-[11px] tracking-[0.18em] uppercase text-[#1B2A46]/70">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border border-[#1B2A46]/15 bg-[#F8F4EC] px-4 py-3 font-sans text-sm text-[#1B2A46] outline-none transition focus:border-[#C6A369]"
              placeholder="admin@solenne.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block font-sans text-[11px] tracking-[0.18em] uppercase text-[#1B2A46]/70">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full border border-[#1B2A46]/15 bg-[#F8F4EC] px-4 py-3 font-sans text-sm text-[#1B2A46] outline-none transition focus:border-[#C6A369]"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="font-sans text-sm text-[#9b2c2c]">{error}</div>}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center border border-[#1B2A46] bg-[#1B2A46] px-6 py-4 font-sans text-[11px] tracking-[0.2em] uppercase text-[#F8F4EC] transition-colors hover:bg-[#101B30] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in →"}
          </button>
        </form>

      </div>
    </div>
  );
}
