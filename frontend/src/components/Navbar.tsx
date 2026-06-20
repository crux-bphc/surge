import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav>
      {/* Desktop Navbar */}
      <div className="hidden fixed inset-y-0 left-0 w-30 bg-highlight-dark text-white md:flex flex-col items-center justify-between py-4 shadow-lg z-50">
        <Link to="/" className="mt-6">
          <img src="/logo-v2.png" alt="Logo" className="w-14 h-14" />
        </Link>

        <div className="flex flex-col items-center justify-center gap-12 flex-grow mt-4">
          <Link
            to="/"
            className="group transition-all duration-200 hover:scale-110"
            activeProps={{
              className:
                "group transition-all duration-200 hover:scale-110 active",
            }}
          >
            <span className="material-symbols-outlined text-highlight-light group-hover:text-white transition-colors duration-200 [.active_&]:text-white [.active_&]:drop-shadow-lg">
              home
            </span>
          </Link>
          <Link
            to="/leaderboard"
            search={{ batch: undefined, level: undefined }}
            className="group transition-all duration-200 hover:scale-110"
            activeProps={{
              className:
                "group transition-all duration-200 hover:scale-110 active",
            }}
          >
            <span className="material-symbols-outlined text-highlight-light group-hover:text-white transition-colors duration-200 [.active_&]:text-white [.active_&]:drop-shadow-lg">
              emoji_events
            </span>
          </Link>
          <Link
            to="/events"
            className="group transition-all duration-200 hover:scale-110"
            activeProps={{
              className:
                "group transition-all duration-200 hover:scale-110 active",
            }}
          >
            <span className="material-symbols-outlined text-highlight-light group-hover:text-white transition-colors duration-200 [.active_&]:text-white [.active_&]:drop-shadow-lg">
              event
            </span>
          </Link>
          <Link
            to="/potd"
            className="group transition-all duration-200 hover:scale-110"
            activeProps={{
              className:
                "group transition-all duration-200 hover:scale-110 active",
            }}
          >
            <span className="material-symbols-outlined text-highlight-light group-hover:text-white transition-colors duration-200 [.active_&]:text-white [.active_&]:drop-shadow-lg">
              mode_heat
            </span>
          </Link>
          <Link
            to="/resource"
            className="group transition-all duration-200 hover:scale-110"
            activeProps={{
              className:
                "group transition-all duration-200 hover:scale-110 active",
            }}
          >
            <span className="material-symbols-outlined text-highlight-light group-hover:text-white transition-colors duration-200 [.active_&]:text-white [.active_&]:drop-shadow-lg">
              book_ribbon
            </span>
          </Link>
        </div>

        <div className="mb-4">
          <Link
            to="/profile"
            className="group transition-all duration-200 hover:scale-110"
            activeProps={{
              className:
                "group transition-all duration-200 hover:scale-110 active",
            }}
          >
            <div>
              <span className="material-symbols-outlined text-highlight-light group-hover:text-white transition-colors duration-200 [.active_&]:text-white [.active_&]:drop-shadow-lg">
                account_circle
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Mobile Navbar */}
      <div className="md:hidden top-0 left-0 right-0 z-50 bg-highlight-dark text-white flex flex-row justify-between px-4 h-16 items-center max-w-screen">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
        >
          <Menu className="h-8 w-8" />
        </button>

        <Link to="/" className="p-2">
          <img src="/logo-v2.png" alt="Logo" className="w-8 h-8" />
        </Link>
      </div>

      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-200 ease-out ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`fixed inset-0 bg-black/50`}
          onClick={toggleMobileMenu}
        />

        <div
          className={`fixed top-0 left-0 bottom-0 w-72 bg-highlight-dark transform transition-transform duration-200 ease-out ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <h1 className="text-3xl text-accent-purple p-6 font-medium">Surge</h1>
          <div className="flex flex-col items-start pl-6 gap-6 flex-grow">
            <Link
              to="/"
              className="group transition-all duration-200 hover:scale-110 flex gap-4 text-xl text-highlight-light items-center w-52"
              activeProps={{
                className:
                  "group transition-all duration-200 hover:scale-110 active",
              }}
              onClick={toggleMobileMenu}
            >
              <span className="!text-3xl material-symbols-outlined text-higlight-light group-hover:text-white transition-colors duration-200 [.active_&]:text-white [.active_&]:drop-shadow-lg">
                home
              </span>
              <p className="[.active_&]:text-white [.active_&]:drop-shadow-lg">
                Home
              </p>
            </Link>
            <Link
              to="/leaderboard"
              search={{ batch: undefined, level: undefined }}
              className="group transition-all duration-200 hover:scale-110 flex gap-4 text-xl text-highlight-light items-center w-52"
              activeProps={{
                className:
                  "group transition-all duration-200 hover:scale-110 active",
              }}
              onClick={toggleMobileMenu}
            >
              <span className="!text-3xl material-symbols-outlined text-highlight-light group-hover:text-white transition-colors duration-200 [.active_&]:text-white [.active_&]:drop-shadow-lg">
                emoji_events
              </span>
              <p className="[.active_&]:text-white [.active_&]:drop-shadow-lg">
                Leaderboard
              </p>
            </Link>
            <Link
              to="/events"
              className="group transition-all duration-200 hover:scale-110 flex gap-4 text-xl text-highlight-light items-center w-52"
              activeProps={{
                className:
                  "group transition-all duration-200 hover:scale-110 active",
              }}
              onClick={toggleMobileMenu}
            >
              <span className="!text-3xl material-symbols-outlined text-highlight-light group-hover:text-white transition-colors duration-200 [.active_&]:text-white [.active_&]:drop-shadow-lg">
                event
              </span>
              <p className="[.active_&]:text-white [.active_&]:drop-shadow-lg">
                Events
              </p>
            </Link>
            <Link
              to="/potd"
              className="group transition-all duration-200 hover:scale-110 flex gap-4 text-xl text-highlight-light items-center w-52"
              activeProps={{
                className:
                  "group transition-all duration-200 hover:scale-110 active",
              }}
              onClick={toggleMobileMenu}
            >
              <span className="!text-3xl material-symbols-outlined text-highlight-light group-hover:text-white transition-colors duration-200 [.active_&]:text-white [.active_&]:drop-shadow-lg">
                mode_heat
              </span>
              <p className="[.active_&]:text-white [.active_&]:drop-shadow-lg">
                Potd
              </p>
            </Link>
            <Link
              to="/resource"
              className="group transition-all duration-200 hover:scale-110 flex gap-4 text-xl text-highlight-light items-center w-52"
              activeProps={{
                className:
                  "group transition-all duration-200 hover:scale-110 active",
              }}
              onClick={toggleMobileMenu}
            >
              <span className="!text-3xl material-symbols-outlined text-highlight-light group-hover:text-white transition-colors duration-200 [.active_&]:text-white [.active_&]:drop-shadow-lg">
                book_ribbon
              </span>
              <p className="[.active_&]:text-white [.active_&]:drop-shadow-lg">
                Resources
              </p>
            </Link>
            <Link
              to="/profile"
              className="group transition-all duration-200 hover:scale-110 flex gap-4 text-xl text-highlight-light items-center w-52"
              activeProps={{
                className:
                  "group transition-all duration-200 hover:scale-110 active",
              }}
              onClick={toggleMobileMenu}
            >
              <span className="!text-3xl material-symbols-outlined text-highlight-light group-hover:text-white transition-colors duration-200 [.active_&]:text-white [.active_&]:drop-shadow-lg">
                account_circle
              </span>
              <p className="[.active_&]:text-white [.active_&]:drop-shadow-lg">
                Profile
              </p>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
