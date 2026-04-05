import { useState, useEffect } from "react";

export default function ImageCarousel({ images, alt }) {
  const [index, setIndex] = useState(0);
  const list = images?.length ? images : ["/placeholder-boarding.jpg"];

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % list.length);
    }, 4000);
    return () => clearInterval(t);
  }, [list.length]);

  return (
    <div className="relative overflow-hidden rounded-[16px] bg-[#F2EBE8] shadow-inner ring-1 ring-[#E0E0E0]/80">
      <div className="aspect-[16/10] w-full relative">
        {list.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt={`${alt || "Boarding"} ${i + 1}`}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 rounded-[16px] ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
        {list.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index
                ? "w-6 bg-[#FECE51] shadow-md shadow-[#008080]/25"
                : "w-2 bg-[#BED9D8]/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}