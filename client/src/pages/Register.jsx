import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { nameLettersOnly, gmailValid } from "../utils/validation.js";

const PASS_MIN = 4;

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student");
  const [fieldErrors, setFieldErrors] = useState({});
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const openProfileTab = (r) => {
    if (r === "student") window.open("/profile/student", "_blank");
    else window.open("/profile/owner", "_blank");
  };

  const validate = () => {
    const e = {};
    if (!nameLettersOnly(name)) e.name = "Full name: letters and spaces only.";
    if (!gmailValid(email)) e.email = "Use Gmail ending with @gmail.com.";
    if (password.length < PASS_MIN)
      e.password = `Password must be at least ${PASS_MIN} characters.`;
    if (password !== confirmPassword) e.confirmPassword = "Passwords do not match.";
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setErr("");
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        role,
      });
      openProfileTab(user.role);
      setToasts((t) => [
        ...t,
        { id: Date.now(), message: "Account created successfully!" },
      ]);
      navigate("/");
    } catch (ex) {
      setErr(ex.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const dismissToast = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  const input =
    "mt-1 w-full rounded-[16px] border border-[#E0E0E0] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#605853] outline-none transition focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20";
  const fe = "mt-1 text-xs text-[#E63946]";

  return (
    <div className="relative mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-4 py-12 bg-[#FCF5F3]">
      {/* Top gradient halo */}
      <div className="absolute inset-x-0 top-0 mx-auto h-40 max-w-lg rounded-full bg-gradient-to-r from-[#F7C14B]/40 to-[#FECE51]/40 blur-3xl" />

      {/* Card */}
      <div className="relative rounded-[24px] border border-[#E0E0E0] bg-[#FFFFFF] p-6 shadow-lg shadow-[#999999]/10">
        <h1 className="text-2xl font-bold text-[#332D2A]">Create account</h1>
        <p className="mt-2 text-sm text-[#7E736D]">
          Gmail only, passwords at least {PASS_MIN} characters, and matching confirmation.
        </p>

        {err && (
          <p className="rounded-lg bg-[#E63946]/10 px-3 py-2 mt-4 text-sm text-[#C1121F]">
            {err}
          </p>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {/* Full Name */}
          <div>
            <label className="text-sm font-semibold text-[#544B47]">Full name</label>
            <input
              required
              className={input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Letters and spaces only"
            />
            {fieldErrors.name && <p className={fe}>{fieldErrors.name}</p>}
          </div>

          {/* Gmail */}
          <div>
            <label className="text-sm font-semibold text-[#544B47]">Gmail</label>
            <input
              type="email"
              required
              className={input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com"
            />
            {fieldErrors.email && <p className={fe}>{fieldErrors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-semibold text-[#544B47]">Password (min {PASS_MIN})</label>
            <input
              type="password"
              required
              className={input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {fieldErrors.password && <p className={fe}>{fieldErrors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-semibold text-[#544B47]">Confirm password</label>
            <input
              type="password"
              required
              className={input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {fieldErrors.confirmPassword && <p className={fe}>{fieldErrors.confirmPassword}</p>}
          </div>

          {/* Role */}
          <div>
            <span className="text-sm font-semibold text-[#544B47]">I am a</span>
            <div className="mt-2 flex gap-4">
              {[
                { value: "student", label: "Student" },
                { value: "owner", label: "Owner" },
              ].map((o) => (
                <label
                  key={o.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-[16px] border px-3 py-2 text-sm transition ${
                    role === o.value
                      ? "border-[#008080] bg-[#BED9D8]"
                      : "border-[#E0E0E0] bg-[#FFFFFF] hover:border-[#008080]"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    checked={role === o.value}
                    onChange={() => setRole(o.value)}
                    className="text-[#008080]"
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[24px] bg-[#008080] py-3 text-white font-bold shadow-md shadow-[#008080]/25 transition hover:-translate-y-0.5 disabled:bg-[#BED9D8]"
          >
            {loading ? "Creating…" : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#7A716D]">
          Have an account?{" "}
          <Link to="/login" className="font-bold text-[#FECE51] hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="rounded-[16px] border border-[#E0E0E0] bg-[#FFFFFF] p-3 shadow"
          >
            <p className="text-sm text-[#605853]">{t.message}</p>
            <button
              onClick={() => dismissToast(t.id)}
              className="text-xs text-[#008080] mt-2"
            >
              Dismiss
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}