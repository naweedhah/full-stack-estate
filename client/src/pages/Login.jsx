import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const openProfileTab = (role) => {
    if (role === "admin") window.open("/admin", "_blank");
    else if (role === "student") window.open("/profile/student", "_blank");
    else if (role === "owner") window.open("/profile/owner", "_blank");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const user = await login(email, password);
      openProfileTab(user.role);
      navigate("/");
    } catch {
      setErr("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#FCF5F3" }}
    >
      {/* Background glow */}
      <div className="absolute inset-x-0 top-10 mx-auto h-40 max-w-md rounded-full blur-3xl"
        style={{ background: "linear-gradient(to right, #FECE51, #BED9D8)" }}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-md rounded-[24px] border p-8 shadow-xl"
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: "#E0E0E0",
        }}
      >
        <h1
          className="text-2xl font-bold"
          style={{ color: "#2F2A27" }}
        >
          Sign in
        </h1>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {err && (
            <div
              className="rounded-lg px-3 py-2 text-sm"
              style={{
                backgroundColor: "#FFE5E7",
                color: "#C1121F",
              }}
            >
              {err}
            </div>
          )}

          {/* Email */}
          <div>
            <label
              className="text-sm font-semibold"
              style={{ color: "#544B47" }}
            >
              Email
            </label>
            <input
              type="email"
              required
              className="mt-1 w-full rounded-xl border px-3 py-3 text-sm outline-none transition"
              style={{
                borderColor: "#E0E0E0",
                backgroundColor: "#FFFFFF",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#008080";
                e.target.style.boxShadow = "0 0 0 2px #BED9D8";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#E0E0E0";
                e.target.style.boxShadow = "none";
              }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <label
              className="text-sm font-semibold"
              style={{ color: "#544B47" }}
            >
              Password
            </label>
            <input
              type="password"
              required
              className="mt-1 w-full rounded-xl border px-3 py-3 text-sm outline-none transition"
              style={{
                borderColor: "#E0E0E0",
                backgroundColor: "#FFFFFF",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#008080";
                e.target.style.boxShadow = "0 0 0 2px #BED9D8";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#E0E0E0";
                e.target.style.boxShadow = "none";
              }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[16px] font-bold transition"
            style={{
              height: "48px",
              backgroundColor: loading ? "#BED9D8" : "#FECE51",
              color: "#2F2A27",
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.backgroundColor = "#F7C14B";
            }}
            onMouseLeave={(e) => {
              if (!loading) e.target.style.backgroundColor = "#FECE51";
            }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {/* Footer */}
        <p
          className="mt-6 text-center text-sm"
          style={{ color: "#7E736D" }}
        >
          No account?{" "}
          <Link
            to="/register"
            className="font-bold"
            style={{ color: "#008080" }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}