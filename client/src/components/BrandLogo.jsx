import { useState } from "react";
import { Link } from "react-router-dom";

export default function BrandLogo() {
  const [src, setSrc] = useState("/logo.png");

  return (
    <Link
      to="/"
      className="group flex items-center gap-3 outline-none transition-transform duration-300 hover:scale-[1.02]"
    >
      {/* Logo Circle */}
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[16px] ring-2 ring-white/80 shadow-lg shadow-[#008080]/25 transition-[box-shadow,transform] duration-300 group-hover:shadow-[#008080]/40 group-hover:ring-[#FECE51]/50">
        <img
          src={src}
          alt="SLIIT Boarding Finder"
          className="h-full w-full object-cover"
          onError={() => setSrc("/logo.svg")}
        />
        {/* Gradient Overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-[16px] bg-gradient-to-tr from-white/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* Logo Text */}
      <div className="hidden flex-col sm:flex">
        <span className="font-display text-base font-bold leading-tight tracking-tight text-[#332D2A]">
          SLIIT{" "}
          <span className="bg-gradient-to-r from-[#FECE51] via-[#F7C14B] to-[#008080] bg-clip-text text-transparent">
            Stay
          </span>
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#7E736D]">
          Boarding finder
        </span>
      </div>
    </Link>
  );
}