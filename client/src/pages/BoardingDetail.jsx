import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import Loader from "../components/Loader.jsx";
import ImageCarousel from "../components/ImageCarousel.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function RoomOption({ label, available, selected, onSelect }) {
  const baseClasses =
    "flex flex-1 items-center justify-center rounded-lg border-2 px-4 py-3 text-sm font-semibold transition";

  if (!available) {
    return (
      <div
        className={`${baseClasses} cursor-not-allowed border-gray-300 bg-[#F2EBE8] text-gray-400 line-through`}
      >
        {label}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`${baseClasses} ${
        selected
          ? "border-[#008080] bg-[#008080]/10 text-[#008080] ring-2 ring-[#008080]/30"
          : "border-[#008080]/50 bg-[#008080]/10 text-[#008080] hover:border-[#008080]"
      }`}
    >
      {label}
      <span
        className={`ml-2 h-2 w-2 rounded-full ${selected ? "bg-[#008080]" : "bg-[#008080]/60"}`}
      />
    </button>
  );
}

export default function BoardingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [boarding, setBoarding] = useState(null);
  const [loadErr, setLoadErr] = useState("");
  const [hint, setHint] = useState("");
  const [roomChoice, setRoomChoice] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`/boarding/${id}`);
        if (!cancelled) {
          setBoarding(data);
          if (data.singleAvailable && !data.sharingAvailable) {
            setRoomChoice("single");
          } else if (!data.singleAvailable && data.sharingAvailable) {
            setRoomChoice("sharing");
          } else {
            setRoomChoice(null);
          }
        }
      } catch {
        if (!cancelled) setLoadErr("Could not load this boarding.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const goRequest = () => {
    setHint("");
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (user?.role !== "student") {
      setHint("Only student accounts can send a reservation request.");
      return;
    }
    if (!roomChoice) {
      setHint("Choose single or sharing when both are open.");
      return;
    }
    navigate(`/boarding/${id}/request?type=${roomChoice}`);
  };

  if (loadErr && !boarding) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-[#C1121F]">{loadErr}</p>
        <Link
          to="/"
          className="mt-4 inline-block text-[#FECE51] hover:underline"
        >
          Back home
        </Link>
      </div>
    );
  }

  if (!boarding) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <Loader
          variant="inline"
          title="Opening listing"
          subtitle="Fetching photos, distance, and room options…"
          tips={["Carousel images loading", "Owner preferences in sync", "Hang tight"]}
        />
      </div>
    );
  }

  const both = boarding.singleAvailable && boarding.sharingAvailable;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 bg-[#FCF5F3]">
      <Link to="/" className="text-sm font-medium text-[#FECE51] hover:text-[#F7C14B]">
        ← Back
      </Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <ImageCarousel images={boarding.images} alt={boarding.title} />
          <h1 className="mt-6 font-display text-3xl font-bold text-[#544B47]">
            {boarding.title}
          </h1>
          <p className="mt-2 text-[#605853]">{boarding.address}</p>
          <p className="mt-4 text-sm leading-relaxed text-[#7E736D]">
            {boarding.description}
          </p>
        </div>
        <div className="space-y-6">
          <div className="rounded-lg border border-[#E0E0E0] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7A716D]">
              Distance from SLIIT campus
            </p>
            <p className="mt-2 font-display text-3xl font-bold text-[#008080]">
              {boarding.distanceMeters.toLocaleString()}{" "}
              <span className="text-lg font-semibold text-[#605853]">meters</span>
            </p>
          </div>

          <div className="rounded-lg border border-[#E0E0E0] bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-[#544B47]">Availability</p>
            <p className="mt-1 text-xs text-[#7A716D]">
              Options the owner opened show in teal; closed types are disabled.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <RoomOption
                label="Single room"
                available={boarding.singleAvailable}
                selected={roomChoice === "single"}
                onSelect={() => setRoomChoice("single")}
              />
              <RoomOption
                label="Sharing"
                available={boarding.sharingAvailable}
                selected={roomChoice === "sharing"}
                onSelect={() => setRoomChoice("sharing")}
              />
            </div>
            {both && (
              <p className="mt-3 text-xs text-[#7A716D]">
                Selected:{" "}
                <span className="font-medium text-[#008080]">
                  {roomChoice || "tap an option"}
                </span>
              </p>
            )}
          </div>

          {hint && (
            <p className="rounded-lg bg-[#FECE51]/20 px-3 py-2 text-sm text-[#008080]">
              {hint}
            </p>
          )}

          <button
            type="button"
            onClick={goRequest}
            className="w-full rounded-lg bg-[#FECE51] py-4 font-semibold text-[#332D2A] shadow-lg transition hover:bg-[#F7C14B]"
          >
            Request this boarding
          </button>
          {!isAuthenticated && (
            <p className="text-center text-xs text-[#7E736D]">
              You can browse freely; signing in as a student unlocks the request form.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}