import { useEffect, useState, useRef } from "react";
import api from "../api/axios.js";
import { useSocket } from "../hooks/useSocket.js";
import { useAuth } from "../context/AuthContext.jsx";
import { LoaderInline } from "./Loader.jsx";

export default function LiveChat({ bookingId, onClose }) {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!bookingId) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`/bookings/${bookingId}/messages`);
        if (!cancelled) setMessages(data);
      } catch {
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  useEffect(() => {
    if (!socket || !bookingId) return;
    socket.emit("join:booking", bookingId);
    const handler = (msg) => {
      setMessages((prev) =>
        prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]
      );
    };
    socket.on("chat:message", handler);
    return () => {
      socket.emit("leave:booking", bookingId);
      socket.off("chat:message", handler);
    };
  }, [socket, bookingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || !bookingId) return;
    setText("");
    try {
      const { data } = await api.post(`/bookings/${bookingId}/messages`, {
        text: t,
      });
      setMessages((prev) =>
        prev.some((m) => m._id === data._id) ? prev : [...prev, data]
      );
    } catch {
      setText(t);
    }
  };

  return (
    <div className="flex max-h-[420px] flex-col overflow-hidden rounded-2xl border border-[#E0E0E0] bg-white shadow-lg shadow-[#008080]/10">
      <div className="flex items-center justify-between bg-gradient-to-r from-[#008080] to-[#006666] px-4 py-3 text-white">
        <div>
          <p className="font-display text-sm font-semibold">Live chat</p>
          <p className="text-xs text-[#BED9D8]">
            {connected ? "● Online" : "○ Connecting…"}
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-white/90 hover:bg-white/15"
          >
            Close
          </button>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
        {loading && <LoaderInline label="Loading messages…" />}
        {!loading && messages.length === 0 && (
          <p className="text-center text-[#7E736D]">
            Say hello and discuss rules before the owner decides.
          </p>
        )}

        {messages.map((m) => {
          const mine =
            m.sender?._id === user?.id || m.sender?.id === user?.id;
          return (
            <div
              key={m._id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                  mine
                    ? "rounded-br-md bg-gradient-to-br from-[#008080] to-[#006666] text-white shadow-md"
                    : "rounded-bl-md bg-[#F2EBE8] text-[#605853] shadow-sm"
                }`}
              >
                {!mine && (
                  <p className="mb-0.5 text-xs font-medium text-[#008080]">
                    {m.sender?.name}
                  </p>
                )}
                <p className="whitespace-pre-wrap">{m.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="border-t border-[#E0E0E0] p-2">
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 rounded-xl border border-[#E0E0E0] bg-[#FCF5F3] px-3 py-2 text-sm outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#BED9D8]"
          />
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-[#008080] to-[#006666] px-4 py-2 text-sm font-semibold text-white shadow-md hover:opacity-95"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}