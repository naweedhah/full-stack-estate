import { Outlet, NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import BrandLogo from "./BrandLogo.jsx";

function SignInIcon({ to = "/login" }) {
  return (
    <Link
      to={to}
      title="Sign in"
      className="group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#008080] to-[#007373] text-white shadow-lg shadow-[#008080]/25 transition-all duration-300 hover:-translate-y-0.5 hover:from-[#FECE51] hover:to-[#F7C14B] hover:shadow-[#FECE51]/30 active:translate-y-0"
    >
      <svg
        className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
      <span className="absolute inset-0 rounded-full ring-2 ring-white/30 transition group-hover:ring-[#FECE51]/60" />
    </Link>
  );
}

export default function Layout() {
  const { user, logout, isAuthenticated } = useAuth();

  const profileHref =
    user?.role === "student"
      ? "/profile/student"
      : user?.role === "owner"
      ? "/profile/owner"
      : "/admin";

  const navClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg font-semibold text-sm transition ${
      isActive
        ? "bg-[#FECE51] text-[#332D2A] shadow-sm"
        : "text-[#605853] hover:bg-[#F2EBE8]"
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-[#FCF5F3] text-[#605853]">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-[#E0E0E0] shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:gap-8">
          <BrandLogo />

          <nav className="hidden items-center gap-2 sm:flex ml-40">
            <NavLink to="/" className={navClass} end>
              Home
            </NavLink>
            <NavLink to="/boardings" className={navClass}>
              Boardings
            </NavLink>
            <NavLink to="/feedback" className={navClass}>
              Feedback
            </NavLink>
          </nav>

          <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
            <nav className="flex md:hidden gap-2">
              <NavLink
                to="/boardings"
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-[#605853] hover:bg-[#F2EBE8]"
              >
                List
              </NavLink>
              <NavLink
                to="/feedback"
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-[#605853] hover:bg-[#F2EBE8]"
              >
                Rate
              </NavLink>
            </nav>

            {isAuthenticated ? (
              <>
                <a
                  href={profileHref}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden sm:inline-flex rounded-full border border-[#BED9D8] bg-white px-4 py-2 text-sm font-semibold text-[#008080] shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-[#008080] hover:shadow-md"
                >
                  Profile
                </a>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full border border-[#E0E0E0] bg-white/70 px-3 py-2 text-xs font-semibold text-[#605853] shadow-sm backdrop-blur transition hover:bg-[#F2EBE8] sm:text-sm"
                >
                  Sign out
                </button>
              </>
            ) : (
              <SignInIcon />
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-[#E0E0E0] bg-[#F2EBE8] py-8 text-center text-xs text-[#7E736D]">
        <p className="font-medium text-[#544B47]">SLIIT Boarding Finder</p>
        <p className="mt-1">Reservations · Live chat · Community feedback</p>
      </footer>
    </div>
  );
}