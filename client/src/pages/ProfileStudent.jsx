import { useEffect, useState, useCallback } from "react";
import api from "../api/axios.js";
import { downloadBookingPdf } from "../api/downloadPdf.js";
import LiveChat from "../components/LiveChat.jsx";
import Loader from "../components/Loader.jsx";
import { useSocket } from "../hooks/useSocket.js";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE = import.meta.env.VITE_API_ORIGIN || "";

export default function ProfileStudent() {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [bookings, setBookings] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [chatFor, setChatFor] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await api.get("/bookings/student");
    setBookings(data);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await load();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => (cancelled = true);
  }, [load]);

  useEffect(() => {
    if (!socket || !user?.id) return;

    const onNote = (payload) => {
      setToasts((t) => [...t, { id: Date.now(), ...payload }]);

      if (
        payload.type === "booking_status" ||
        payload.type === "booking_submitted"
      ) {
        load();
      }
    };

    socket.on("notification", onNote);
    return () => socket.off("notification", onNote);
  }, [socket, user?.id, load]);

  const dismiss = (id) =>
    setToasts((t) => t.filter((x) => x.id !== id));

  const imgSrc = (path) =>
    path?.startsWith("http") ? path : `${API_BASE}${path}`;

  return (
    <div
      className="min-h-screen px-4 py-10"
      style={{ backgroundColor: "#FCF5F3" }}
    >
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold" style={{ color: "#2F2A27" }}>
          Student Dashboard
        </h1>

        {/* 🔔 Notifications */}
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
          {toasts.map((n) => (
            <div
              key={n.id}
              className="rounded-xl p-3 shadow"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E0E0E0",
              }}
            >
              <p className="text-sm" style={{ color: "#605853" }}>
                {n.message}
              </p>
              <button
                onClick={() => dismiss(n.id)}
                className="text-xs mt-2 font-semibold"
                style={{ color: "#008080" }}
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <Loader />
        ) : bookings.length === 0 ? (
          <p className="mt-10 text-center" style={{ color: "#7E736D" }}>
            No bookings yet.
          </p>
        ) : (
          <ul className="mt-6 space-y-6">
            {bookings.map((b) => (
              <li
                key={b._id}
                className="p-6 rounded-[24px] shadow-lg"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E0E0E0",
                }}
              >
                <h2
                  className="font-semibold text-lg"
                  style={{ color: "#2F2A27" }}
                >
                  {b.boardingTitle}
                </h2>

                <p className="text-sm mt-1" style={{ color: "#605853" }}>
                  Room: {b.roomType} · Owner: {b.owner?.email}
                </p>

                <p className="text-xs mt-1" style={{ color: "#7E736D" }}>
                  {new Date(b.createdAt).toLocaleString()}
                </p>

                {/* Status */}
                <span
                  className="inline-block mt-3 text-xs px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: "#F2EBE8",
                    color: "#605853",
                  }}
                >
                  {b.status}
                </span>

                {/* Owner Phone */}
                {b.status === "accepted" && b.ownerPhone && (
                  <p
                    className="mt-2 text-sm font-medium"
                    style={{ color: "#008080" }}
                  >
                    📞 Owner Phone: {b.ownerPhone}
                  </p>
                )}

                {/* Actions */}
                <div className="mt-5 flex flex-wrap gap-3">
                  {/* PDF */}
                  <button
                    onClick={() => downloadBookingPdf(b._id)}
                    className="px-4 rounded-[16px] font-semibold"
                    style={{
                      height: "48px",
                      backgroundColor: "#2F2A27",
                      color: "#FFFFFF",
                    }}
                  >
                    Download PDF
                  </button>

                  {/* Chat */}
                  <button
                    onClick={() =>
                      setChatFor(chatFor === b._id ? null : b._id)
                    }
                    className="px-4 rounded-[16px] font-semibold border"
                    style={{
                      height: "48px",
                      borderColor: "#008080",
                      color: "#008080",
                    }}
                  >
                    Live Chat
                  </button>
                </div>

                {/* Chat Box */}
                {chatFor === b._id && (
                  <div className="mt-5">
                    <LiveChat bookingId={b._id} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}