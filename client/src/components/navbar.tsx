import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "../context/ThemeContext";
import { IoSunnyOutline, IoMoonOutline, IoLogOutOutline } from "react-icons/io5";
import { logoutUser } from "../redux/slices/userSlice";
import { clearRoomCode } from "../redux/slices/roomCodeSlice";

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useSelector((state: any) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(clearRoomCode());
    dispatch(logoutUser());
    navigate("/");
  };

  const getUserInitials = (name: string) => {
    return name ? name.substring(0, 2).toUpperCase() : "U";
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  return (
    <nav className="fixed left-0 top-0 z-[100] flex w-full justify-center bg-primary">
      {/* Container to enforce the 1200px max width and perfectly align horizontally with the main dashboard container */}
      <div className="flex w-full max-w-[1200px] items-center justify-between px-[var(--padding-1)] py-5 max-md:px-5 max-sm:py-4">
        <div>
          <Link
            to="/"
            className="group flex items-center gap-2 text-2xl font-extrabold tracking-tight text-brand no-underline transition-all duration-200 ease-in hover:text-brand max-sm:text-xl"
          >
            {/* This empty div is your PNG mask */}
            <div
              className="h-6 w-6 translate-y-[2px] bg-brand transition-colors duration-200 ease-in group-hover:bg-brand max-sm:h-5 max-sm:w-5"
              style={{
                WebkitMaskImage: 'url("/tabula_icon_black.png")',
                WebkitMaskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskImage: 'url("/tabula_icon_black.png")',
                maskSize: "contain",
                maskRepeat: "no-repeat",
                maskPosition: "center",
              }}
            ></div>
            {/* Wrapped the text in a span for precision optical alignment */}
            <span className="-translate-y-[1px] leading-none">Tabula</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 max-sm:gap-1">
          {!user ? (
            <>
              <Link
                to="/"
                className="flex h-10 cursor-pointer items-center justify-center rounded-[var(--border-radius-1)] border-none bg-[rgba(150,150,150,0.1)] px-5 text-[0.95rem] font-semibold tracking-tight text-secondary no-underline transition-all duration-200 ease-in hover:bg-[rgba(150,150,150,0.2)] hover:text-primary max-sm:h-[2.1rem] max-sm:px-[0.8rem] max-sm:text-[0.9rem]"
              >
                Collaborate
              </Link>
              <Link
                to="/login"
                className="flex h-10 cursor-pointer items-center justify-center rounded-[var(--border-radius-1)] border-none bg-[rgba(150,150,150,0.1)] px-5 text-[0.95rem] font-semibold tracking-tight text-secondary no-underline transition-all duration-200 ease-in hover:bg-brand hover:text-white max-sm:h-[2.1rem] max-sm:px-[0.8rem] max-sm:text-[0.9rem]"
              >
                Login
              </Link>

              <div className="mx-2 h-[28px] w-[1px] bg-[var(--border-color)]"></div>

              <button
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[var(--border-radius-1)] border-none bg-[rgba(150,150,150,0.1)] text-secondary transition-all duration-200 ease-in hover:bg-[rgba(150,150,150,0.2)] hover:text-primary active:scale-95 max-sm:h-[2.1rem] max-sm:w-[2.1rem]"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? <IoMoonOutline size={20} /> : <IoSunnyOutline size={20} />}
              </button>
            </>
          ) : (
            <>
              <button
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[var(--border-radius-1)] border-none bg-[rgba(150,150,150,0.1)] text-secondary transition-all duration-200 ease-in hover:bg-[rgba(150,150,150,0.2)] hover:text-primary active:scale-95 max-sm:h-[2.1rem] max-sm:w-[2.1rem]"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? <IoMoonOutline size={20} /> : <IoSunnyOutline size={20} />}
              </button>
              <div className="mx-2 h-[28px] w-[1px] bg-[var(--border-color)]"></div>

              <div className="relative flex items-center" ref={dropdownRef}>
                <button
                  className="cursor-pointer rounded-[var(--border-radius-3)] border-none bg-transparent p-0 transition-transform duration-200 ease-in active:scale-95"
                  onClick={toggleDropdown}
                  aria-label="User menu"
                >
                  <div className="flex h-10 w-10 select-none items-center justify-center rounded-[var(--border-radius-1)] bg-[rgba(150,150,150,0.1)] text-xs font-extrabold uppercase tracking-wider text-secondary hover:bg-[rgba(150,150,150,0.2)] hover:text-primary max-sm:h-[2.1rem] max-sm:w-[2.1rem]">
                    {getUserInitials(user.user_email)}
                  </div>
                </button>
                {isDropdownOpen && (
                  <div className="animate-in fade-in zoom-in-95 absolute right-0 top-[calc(100%+0.5rem)] z-10 flex min-w-[180px] origin-top-right flex-col rounded-xl border border-border bg-secondary p-1 shadow-md duration-200">
                    <div className="cursor-default px-3 py-2">
                      <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[0.85rem] font-medium text-secondary">
                        {user.user_email}
                      </span>
                    </div>

                    {/* Replaced subtle divider with an explicit solid grey divider */}
                    <div className="mx-1 my-1 h-[1px] bg-[rgba(150,150,150,0.2)]"></div>

                    <button
                      className="flex w-full cursor-pointer items-center gap-2 rounded-lg border-none bg-transparent px-3 py-2 text-left text-[0.85rem] font-medium text-primary transition-all duration-200 hover:bg-danger/10 hover:text-danger"
                      onClick={handleLogout}
                    >
                      <IoLogOutOutline size={18} className="flex-shrink-0" />
                      {/* Added span with leading-none and optical margin adjustment for perfect vertical centering with the icon */}
                      <span className="-translate-y-[2px] leading-none">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
