import React, { useState, useCallback, useMemo } from "react";
import Navbar from "../components/navbar";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks";

// ------------------------------------------------------------------------------------------------
// Component
const Login: React.FC = () => {
  const { signIn, isLoading, errorMessage } = useAuth();

  // Form state management
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isFormValid = useMemo(
    () => email.trim() && password.trim(),
    [email, password],
  );

  // Event handlers
  const handleSignIn = useCallback(async () => {
    if (!isFormValid) return;
    await signIn(email, password);
  }, [email, password, isFormValid, signIn]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && isFormValid) {
        handleSignIn();
      }
    },
    [isFormValid, handleSignIn],
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary p-4 max-sm:p-2 relative">
      <div className="w-full max-w-[400px] relative">
        <Navbar />

        <div className="bg-secondary rounded-2xl shadow-box p-10 max-sm:p-8 animate-in slide-in-from-bottom-5 duration-300 ease-out">
          <div className="text-center mb-9">
            <h1 className="text-2xl font-semibold text-primary opacity-90 m-0 mb-1 leading-[1.2]">
              Welcome back
            </h1>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 relative group">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyUp={handleKeyPress}
                placeholder=" "
                className="peer w-full px-4 py-3.5 border border-border rounded-xl bg-primary text-primary text-base font-medium tracking-tight transition-all duration-300 ease-in focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isLoading}
                autoComplete="email"
              />
              <label
                htmlFor="email"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-transparent px-1.5 text-secondary text-base font-medium tracking-tight transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none peer-focus:top-0 peer-focus:text-[0.7rem] peer-focus:text-brand peer-focus:font-bold peer-focus:bg-secondary peer-focus:rounded-[2px] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[0.7rem] peer-[:not(:placeholder-shown)]:text-brand peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:bg-secondary peer-[:not(:placeholder-shown)]:rounded-[2px]"
              >
                Email
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <div className="relative flex items-center rounded-[var(--border-radius-1)] group">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={handleKeyPress}
                  placeholder=" "
                  className="peer w-full pr-11 px-4 py-3.5 border border-border rounded-xl bg-primary text-primary text-base font-medium tracking-tight transition-all duration-300 ease-in focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <label
                  htmlFor="password"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-transparent px-1.5 text-secondary text-base font-medium tracking-tight transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none peer-focus:top-0 peer-focus:text-[0.7rem] peer-focus:text-brand peer-focus:font-bold peer-focus:bg-secondary peer-focus:rounded-[2px] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[0.7rem] peer-[:not(:placeholder-shown)]:text-brand peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:bg-secondary peer-[:not(:placeholder-shown)]:rounded-[2px]"
                >
                  Password
                </label>
                <button
                  type="button"
                  className="absolute right-4 bg-transparent border-none text-brand cursor-pointer text-sm font-semibold py-2 transition-colors duration-200 hover:not(:disabled):text-brand-hover disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <IoEyeOutline size={20} />
                  ) : (
                    <IoEyeOffOutline size={20} />
                  )}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div
                className="px-4 py-3.5 bg-[rgba(225,29,72,0.1)] border-l-4 border-l-[var(--color-danger)] rounded-lg text-danger text-sm font-medium"
                role="alert"
              >
                {errorMessage}
              </div>
            )}

            <button
              className="w-full px-4 py-3.5 bg-brand text-white border-none rounded-xl text-base font-semibold tracking-tight cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-md hover:not(:disabled):-translate-y-[2px] hover:not(:disabled):shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              onClick={handleSignIn}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? "Signing in..." : "Continue"}
            </button>

            <div className="h-[1px] bg-[var(--border-color)] border-none m-0" />

            <div className="text-center text-secondary text-sm font-medium">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-brand font-semibold no-underline transition-colors duration-200 hover:text-brand-hover hover:underline"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
