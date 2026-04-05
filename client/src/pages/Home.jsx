import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { StarRow } from "../components/StarRow.jsx";

export default function Home() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/feedback/home");
        if (!cancelled) setFeedback(data);
      } catch {
        if (!cancelled) setFeedback([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openRandom = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/boarding/random");
      navigate(`/boarding/${data.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative overflow-hidden"
      style={{ backgroundColor: "#FCF5F3" }}
    >
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p
          className="inline-block px-4 py-1 rounded-full text-xs font-bold mb-4"
          style={{
            backgroundColor: "#F7C14B",
            color: "#2F2A27",
          }}
        >
          SLIIT · Malabe
        </p>

        <h1
          className="text-4xl font-bold"
          style={{ color: "#2F2A27" }}
        >
          Boardings near campus,{" "}
          <span style={{ color: "#008080" }}>simplified</span>
        </h1>

        <p
          className="mt-4 text-lg"
          style={{ color: "#605853" }}
        >
          Browse listings, send requests, and connect with owners easily.
        </p>

        {/* BUTTONS */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            onClick={openRandom}
            disabled={loading}
            className="px-6 py-3 rounded-full font-bold shadow"
            style={{
              backgroundColor: "#008080",
              color: "#FFFFFF",
            }}
          >
            {loading ? "Loading..." : "🎯 Random Boarding"}
          </button>

          <Link
            to="/boardings"
            className="px-6 py-3 rounded-full font-bold border"
            style={{
              borderColor: "#E0E0E0",
              color: "#605853",
              backgroundColor: "#FFFFFF",
            }}
          >
            View All
          </Link>

          <Link
            to="/feedback"
            className="px-6 py-3 rounded-full font-bold"
            style={{
              backgroundColor: "#F7C14B",
              color: "#2F2A27",
            }}
          >
            Leave Feedback
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-5xl px-4 pb-16 grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "Distance",
            desc: "Know how far from SLIIT in meters.",
          },
          {
            title: "Room Types",
            desc: "Single & sharing availability.",
          },
          {
            title: "Live Chat",
            desc: "Talk directly with owners.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="p-6 rounded-xl shadow-sm"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E0E0E0",
            }}
          >
            <h3
              className="font-semibold"
              style={{ color: "#2F2A27" }}
            >
              {item.title}
            </h3>
            <p
              className="mt-2 text-sm"
              style={{ color: "#7A716D" }}
            >
              {item.desc}
            </p>
          </div>
        ))}
      </section>

      {/* FEEDBACK */}
      <section
        className="py-16"
        style={{ backgroundColor: "#F2EBE8" }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <h2
              className="text-2xl font-bold"
              style={{ color: "#2F2A27" }}
            >
              Community Feedback
            </h2>

            <Link
              to="/feedback"
              className="px-4 py-2 rounded-full text-sm font-bold"
              style={{
                backgroundColor: "#008080",
                color: "#FFFFFF",
              }}
            >
              Add yours
            </Link>
          </div>

          {feedback.length === 0 ? (
            <p
              className="mt-8 text-center"
              style={{ color: "#7A716D" }}
            >
              No feedback yet.
            </p>
          ) : (
            <div className="mt-8 grid md:grid-cols-2 gap-4">
              {feedback.map((f) => (
                <div
                  key={f._id}
                  className="p-5 rounded-xl shadow-sm"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E0E0E0",
                  }}
                >
                  <div className="flex justify-between">
                    <div>
                      <p
                        className="font-semibold"
                        style={{ color: "#2F2A27" }}
                      >
                        {f.user?.name || "User"}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "#7A716D" }}
                      >
                        {f.user?.role}
                      </p>
                    </div>

                    <StarRow value={f.rating} size="sm" />
                  </div>

                  <p
                    className="mt-3 text-sm"
                    style={{ color: "#605853" }}
                  >
                    {f.comment}
                  </p>

                  <p
                    className="mt-3 text-xs"
                    style={{ color: "#999999" }}
                  >
                    {new Date(f.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}