import { useEffect, useState } from "react";
import api from "../api/axios.js";
import { StarRow } from "../components/StarRow.jsx";
import Loader from "../components/Loader.jsx";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, b, u, f] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/bookings"),
          api.get("/admin/users"),
          api.get("/admin/feedback"),
        ]);
        if (!cancelled) {
          setStats(s.data);
          setBookings(b.data);
          setUsers(u.data);
          setFeedback(f.data);
        }
      } catch {
        if (!cancelled) setErr("Could not load admin data.");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (err) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center text-[#C1121F]">
        {err}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 bg-[#FCF5F3]">
        <div className="w-full max-w-md">
          <Loader
            variant="inline"
            title="Admin console"
            subtitle="Loading stats, bookings, users, and feedback…"
            tips={[
              "Aggregating platform metrics",
              "Pulling latest reservations",
              "Securing your admin view",
            ]}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 bg-[#FCF5F3]">
      <h1 className="text-2xl font-bold text-[#332D2A]">Admin dashboard · Campus Admin</h1>
      <p className="text-sm text-[#7A716D]">Overview of users and reservations across the demo platform.</p>

      {/* Stats cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total users", value: stats.users },
          { label: "Students", value: stats.students },
          { label: "Owners", value: stats.owners },
          { label: "Bookings", value: stats.bookings },
        ].map((c) => (
          <div key={c.label} className="rounded-[16px] border border-[#E0E0E0] bg-[#FFFFFF] p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7A716D]">{c.label}</p>
            <p className="mt-2 text-3xl font-bold text-[#008080]">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Booking stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[16px] border border-[#FECE51]/50 bg-[#FECE51]/10 p-4">
          <p className="text-sm font-medium text-[#FECE51]">Pending</p>
          <p className="mt-1 text-2xl font-bold text-[#FECE51]">{stats.pending}</p>
        </div>
        <div className="rounded-[16px] border border-[#008080]/50 bg-[#008080]/10 p-4">
          <p className="text-sm font-medium text-[#008080]">Accepted</p>
          <p className="mt-1 text-2xl font-bold text-[#008080]">{stats.accepted}</p>
        </div>
        <div className="rounded-[16px] border border-[#E63946]/50 bg-[#E63946]/10 p-4">
          <p className="text-sm font-medium text-[#E63946]">Rejected</p>
          <p className="mt-1 text-2xl font-bold text-[#E63946]">{stats.rejected}</p>
        </div>
      </div>

      {/* Feedback table */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold text-[#332D2A]">Feedback · stars & comments</h2>
        <p className="text-sm text-[#7A716D]">Full audit trail of user feedback.</p>
        <div className="mt-4 max-h-96 overflow-auto rounded-[16px] border border-[#E0E0E0] bg-[#FFFFFF] shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-[#F2EBE8] text-xs uppercase text-[#7A716D]">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Rating</th>
                <th className="p-3">Comment</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {feedback.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-[#7A716D]">No feedback yet.</td>
                </tr>
              ) : (
                feedback.map((fb) => (
                  <tr key={fb._id} className="border-t border-[#E0E0E0]">
                    <td className="p-3 align-top">
                      <span className="font-medium text-[#605853]">{fb.user?.name}</span>
                      <br />
                      <span className="text-xs text-[#7A716D]">{fb.user?.email}</span>
                    </td>
                    <td className="p-3 align-top"><StarRow value={fb.rating} size="sm" /></td>
                    <td className="max-w-md p-3 align-top text-[#605853]">{fb.comment}</td>
                    <td className="whitespace-nowrap p-3 align-top text-xs text-[#7A716D]">{new Date(fb.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent bookings and accounts */}
      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-[#332D2A]">Recent bookings</h2>
          <div className="mt-4 max-h-80 overflow-auto rounded-[16px] border border-[#E0E0E0] bg-[#FFFFFF]">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-[#F2EBE8] text-xs uppercase text-[#7A716D]">
                <tr>
                  <th className="p-3">Boarding</th>
                  <th className="p-3">Student</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 20).map((b) => (
                  <tr key={b._id} className="border-t border-[#E0E0E0]">
                    <td className="p-3 text-[#605853]">{b.boardingTitle}</td>
                    <td className="p-3 text-[#605853]">{b.student?.email}</td>
                    <td className="p-3 capitalize text-[#008080]">{b.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-[#332D2A]">Accounts</h2>
          <div className="mt-4 max-h-80 overflow-auto rounded-[16px] border border-[#E0E0E0] bg-[#FFFFFF]">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-[#F2EBE8] text-xs uppercase text-[#7A716D]">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-t border-[#E0E0E0]">
                    <td className="p-3 text-[#605853]">{u.name}</td>
                    <td className="p-3 text-[#605853]">{u.email}</td>
                    <td className="p-3 capitalize text-[#008080]">{u.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}