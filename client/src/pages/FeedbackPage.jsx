import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { StarRow } from "../components/StarRow.jsx";

function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className="flex gap-2" onMouseLeave={() => setHover(0)} role="group" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          className="rounded-[12px] p-1 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008080]"
        >
          <svg
            className={`h-9 w-9 ${i <= display ? "text-[#FECE51] drop-shadow-md" : "text-[#E0E0E0]"} transition-colors`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const { isAuthenticated, user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setOk("");

    if (!isAuthenticated || !["student", "owner"].includes(user?.role)) {
      setErr("Sign in as a student or owner to post feedback.");
      return;
    }
    if (comment.trim().length < 3) {
      setErr("Comment must be at least 3 characters.");
      return;
    }

    setSaving(true);
    try {
      await api.post("/feedback", { rating, comment: comment.trim() });
      setOk("Thank you — your feedback is visible on the home page.");
      setComment("");
    } catch (ex) {
      setErr(ex.response?.data?.message || "Could not submit.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-lg px-4 py-14 sm:px-6 bg-[#FCF5F3] min-h-screen">
      <div className="absolute left-1/2 top-0 h-48 w-[120%] -translate-x-1/2 bg-gradient-to-b from-[#008080]/20 to-transparent blur-2xl" />

      <div className="relative rounded-[24px] border border-[#E0E0E0] bg-[#FFFFFF] p-[24px] shadow-xl shadow-[#008080]/10 backdrop-blur-xl">
        <h1 className="font-display text-2xl font-bold text-[#332D2A]">Rate your experience</h1>
        <p className="mt-2 text-sm text-[#605853]">
          Stars and comments appear on the home page. Admins review the full feedback log in the dashboard.
        </p>

        {!isAuthenticated && (
          <p className="mt-6 rounded-[16px] bg-[#FECE51]/20 px-4 py-3 text-sm text-[#332D2A]">
            <Link to="/login" className="font-semibold text-[#008080] underline">Sign in</Link>{" "}to leave feedback.{" "}
            <Link to="/register" className="font-semibold text-[#008080]">Create an account</Link>{" "}if you are new.
          </p>
        )}

        <form onSubmit={submit} className="mt-8 space-y-6">
          {err && <p className="rounded-[16px] bg-[#C1121F]/20 px-3 py-2 text-sm text-[#C1121F]">{err}</p>}
          {ok && <p className="rounded-[16px] bg-[#008080]/20 px-3 py-2 text-sm text-[#008080]">{ok}</p>}

          <div>
            <p className="text-sm font-semibold text-[#544B47]">Star rating</p>
            <div className="mt-3">
              <StarInput value={rating} onChange={setRating} />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-[#544B47]">Your comment</label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-2 w-full rounded-[16px] border border-[#E0E0E0] bg-[#FFFFFF] px-4 py-3 text-sm outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20"
              placeholder="What went well? What could improve?"
            />
          </div>

          <button
            type="submit"
            disabled={saving || !isAuthenticated || user?.role === "admin"}
            className="w-full rounded-[16px] bg-gradient-to-r from-[#FECE51] to-[#F7C14B] py-[20px] font-bold text-[#332D2A] shadow-md transition hover:translate-y-[-2px] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Sending…" : "Submit feedback"}
          </button>
        </form>

        <div className="mt-8 border-t border-[#E0E0E0] pt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7E736D]">Preview</p>
          <div className="mt-3 flex items-start gap-3 rounded-[16px] bg-[#F2EBE8] p-4">
            <StarRow value={rating} />
            <p className="text-sm text-[#605853]">{comment.trim() || "Your comment preview…"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}