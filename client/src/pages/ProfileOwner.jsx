import { useEffect, useState, useCallback } from "react";
import api from "../api/axios.js";
import { downloadBookingPdf } from "../api/downloadPdf.js";
import LiveChat from "../components/LiveChat.jsx";
import Loader from "../components/Loader.jsx";
import { useSocket } from "../hooks/useSocket.js";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE = import.meta.env.VITE_API_ORIGIN || "";

export default function ProfileOwner() {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [bookings, setBookings] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [chatFor, setChatFor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phoneInputs, setPhoneInputs] = useState({});

  const load = useCallback(async () => {
    const { data } = await api.get("/bookings/owner");
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
      if (payload.type === "new_booking") load();
    };

    socket.on("notification", onNote);
    return () => socket.off("notification", onNote);
  }, [socket, user?.id, load]);

  const dismiss = (id) =>
    setToasts((t) => t.filter((x) => x.id !== id));

  const handlePhoneChange = (id, value) => {
    setPhoneInputs((prev) => ({ ...prev, [id]: value }));
  };

  const isValidPhone = (phone) => /^07\d{8}$/.test(phone);

  const setStatus = async (id, status) => {
    const phone = phoneInputs[id];

    await api.patch(`/bookings/${id}/status`, {
      status,
      phone,
    });

    setPhoneInputs((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });

    await load();
  };

  const imgSrc = (path) =>
    path?.startsWith("http") ? path : `${API_BASE}${path}`;

  return (
    <div
      className="min-h-screen px-4 py-10"
      style={{ backgroundColor: "#FCF5F3" }}
    >
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold" style={{ color: "#2F2A27" }}>
          Owner dashboard
        </h1>

        <p className="text-sm mt-1" style={{ color: "#7E736D" }}>
          {user?.name} — manage all booking requests here.
        </p>

        {/* 🔔 Notifications */}
        <div className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2">
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

        {/* 🔄 Loading */}
        {loading ? (
          <Loader />
        ) : bookings.length === 0 ? (
          <p className="mt-10 text-center" style={{ color: "#7E736D" }}>
            No requests yet.
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
                <div className="flex justify-between gap-4">
                  <div>
                    <h2
                      className="font-semibold text-lg"
                      style={{ color: "#2F2A27" }}
                    >
                      {b.boardingTitle}
                    </h2>

                    <p className="text-sm mt-1" style={{ color: "#605853" }}>
                      Student: {b.student?.name} ({b.student?.email})
                    </p>

                    <p className="text-sm" style={{ color: "#7E736D" }}>
                      {b.fullName} · {b.gmail} · {b.phone}
                    </p>

                    <span
                      className="inline-block mt-3 text-xs px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: "#F2EBE8",
                        color: "#605853",
                      }}
                    >
                      {b.status}
                    </span>

                    {b.status === "accepted" && b.ownerPhone && (
                      <p
                        className="mt-2 text-sm"
                        style={{ color: "#008080" }}
                      >
                        Your phone shared: {b.ownerPhone}
                      </p>
                    )}
                  </div>

                  {b.attachmentUrl && (
                    <img
                      src={imgSrc(b.attachmentUrl)}
                      className="h-24 w-24 rounded-xl object-cover"
                    />
                  )}
                </div>

                {/* 🎯 Actions */}
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

                  {b.status === "pending" && (
                    <>
                      {/* Phone input */}
                      {phoneInputs[b._id] !== undefined && (
                        <input
                          type="text"
                          placeholder="07XXXXXXXX"
                          maxLength={10}
                          value={phoneInputs[b._id]}
                          onChange={(e) =>
                            handlePhoneChange(b._id, e.target.value)
                          }
                          className="rounded-xl px-3"
                          style={{
                            height: "48px",
                            border: "1px solid #E0E0E0",
                          }}
                        />
                      )}

                      {/* Accept */}
                      <button
                        onClick={() => {
                          if (phoneInputs[b._id] === undefined) {
                            handlePhoneChange(b._id, "");
                          } else {
                            if (!isValidPhone(phoneInputs[b._id])) {
                              alert("Enter valid phone (07XXXXXXXX)");
                              return;
                            }
                            setStatus(b._id, "accepted");
                          }
                        }}
                        className="px-4 rounded-[16px] font-semibold"
                        style={{
                          height: "48px",
                          backgroundColor: "#FECE51",
                          color: "#2F2A27",
                        }}
                      >
                        {phoneInputs[b._id] === undefined
                          ? "Accept"
                          : "Confirm"}
                      </button>

                      {/* Reject */}
                      <button
                        onClick={() => setStatus(b._id, "rejected")}
                        className="px-4 rounded-[16px] font-semibold"
                        style={{
                          height: "48px",
                          backgroundColor: "#E63946",
                          color: "#FFFFFF",
                        }}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>

                {/* Chat */}
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