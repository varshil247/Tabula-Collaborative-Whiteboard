import React, { useState, useCallback, useMemo } from "react";
import Navbar from "../components/navbar";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks";

// ------------------------------------------------------------------------------------------------
// Component
const Register: React.FC = () => {
  const { signUp, isLoading, errorMessage, setErrorMessage } = useAuth();

  // Form state management
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password and form validation logic
  const passwordsMatch = useMemo(
    () => password === confirmPassword,
    [password, confirmPassword],
  );

  const passwordRequirements = useMemo(() => {
    return {
      length: password.length >= 6,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^a-zA-Z0-9]/.test(password),
    };
  }, [password]);

  const isPasswordValid = useMemo(
    () => Object.values(passwordRequirements).every(Boolean),
    [passwordRequirements],
  );

  const isFormValid = useMemo(
    () =>
      email.trim() !== "" &&
      isPasswordValid &&
      confirmPassword.trim() !== "" &&
      passwordsMatch,
    [email, isPasswordValid, confirmPassword, passwordsMatch],
  );

  // Event handlers
  const handleSignUp = useCallback(async () => {
    if (!isFormValid) {
      setErrorMessage("Please fill in all fields correctly");
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage("Passwords do not match");
      return;
    }

    await signUp(email, password, email.split("@")[0]); // Using email prefix as default username
  }, [email, password, isFormValid, passwordsMatch, signUp, setErrorMessage]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && isFormValid) {
        handleSignUp();
      }
    },
    [isFormValid, handleSignUp],
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary p-4 max-sm:p-2 relative">
      <div className="w-full max-w-[400px] relative">
        <Navbar />

        <div className="bg-secondary rounded-box shadow-box p-10 max-sm:p-8 animate-in slide-in-from-bottom-5 duration-300 ease-out">
          <div className="text-center mb-9">
            <h1 className="text-2xl font-semibold text-primary opacity-90 m-0 mb-1 leading-[1.2]">
              Let's get started
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
                className="peer w-full px-4 py-3.5 border border-border rounded-input bg-primary text-primary text-base font-medium tracking-tight transition-all duration-300 ease-in focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60 disabled:cursor-not-allowed"
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
              <div className="relative flex items-center rounded-input group">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={handleKeyPress}
                  placeholder=" "
                  className="peer w-full pr-11 px-4 py-3.5 border border-border rounded-input bg-primary text-primary text-base font-medium tracking-tight transition-all duration-300 ease-in focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isLoading}
                  autoComplete="new-password"
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

            <div className="flex flex-col gap-2">
              <div className="relative flex items-center rounded-input group">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyUp={handleKeyPress}
                  placeholder=" "
                  className={`peer w-full pr-11 px-4 py-3.5 border ${!passwordsMatch && confirmPassword ? "border-danger" : "border-border"} rounded-input bg-primary text-primary text-base font-medium tracking-tight transition-all duration-300 ease-in focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60 disabled:cursor-not-allowed`}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <label
                  htmlFor="confirmPassword"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-transparent px-1.5 text-secondary text-base font-medium tracking-tight transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none peer-focus:top-0 peer-focus:text-[0.7rem] peer-focus:text-brand peer-focus:font-bold peer-focus:bg-secondary peer-focus:rounded-[2px] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[0.7rem] peer-[:not(:placeholder-shown)]:text-brand peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:bg-secondary peer-[:not(:placeholder-shown)]:rounded-[2px]"
                >
                  Confirm password
                </label>
                <button
                  type="button"
                  className="absolute right-4 bg-transparent border-none text-brand cursor-pointer text-sm font-semibold py-2 transition-colors duration-200 hover:not(:disabled):text-brand-hover disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? (
                    <IoEyeOutline size={20} />
                  ) : (
                    <IoEyeOffOutline size={20} />
                  )}
                </button>
              </div>

              <div className="flex justify-between items-center mt-1 px-1">
                <span
                  className={
                    passwordRequirements.length
                      ? "text-success text-[0.6rem] font-medium flex items-center gap-1 transition-colors duration-300"
                      : "text-secondary text-[0.6rem] font-medium flex items-center gap-1 transition-colors duration-300"
                  }
                >
                  {passwordRequirements.length ? "✓" : "○"} 6+ chars
                </span>
                <span
                  className={
                    passwordRequirements.lowercase
                      ? "text-success text-[0.6rem] font-medium flex items-center gap-1 transition-colors duration-300"
                      : "text-secondary text-[0.6rem] font-medium flex items-center gap-1 transition-colors duration-300"
                  }
                >
                  {passwordRequirements.lowercase ? "✓" : "○"} Lowercase
                </span>
                <span
                  className={
                    passwordRequirements.uppercase
                      ? "text-success text-[0.6rem] font-medium flex items-center gap-1 transition-colors duration-300"
                      : "text-secondary text-[0.6rem] font-medium flex items-center gap-1 transition-colors duration-300"
                  }
                >
                  {passwordRequirements.uppercase ? "✓" : "○"} Uppercase
                </span>
                <span
                  className={
                    passwordRequirements.number
                      ? "text-success text-[0.6rem] font-medium flex items-center gap-1 transition-colors duration-300"
                      : "text-secondary text-[0.6rem] font-medium flex items-center gap-1 transition-colors duration-300"
                  }
                >
                  {passwordRequirements.number ? "✓" : "○"} Number
                </span>
                <span
                  className={
                    passwordRequirements.special
                      ? "text-success text-[0.6rem] font-medium flex items-center gap-1 transition-colors duration-300"
                      : "text-secondary text-[0.6rem] font-medium flex items-center gap-1 transition-colors duration-300"
                  }
                >
                  {passwordRequirements.special ? "✓" : "○"} Special
                </span>
                <span
                  className={
                    passwordsMatch && confirmPassword.length > 0
                      ? "text-success text-[0.6rem] font-medium flex items-center gap-1 transition-colors duration-300"
                      : "text-secondary text-[0.6rem] font-medium flex items-center gap-1 transition-colors duration-300"
                  }
                >
                  {passwordsMatch && confirmPassword.length > 0 ? "✓" : "○"} Match
                </span>
              </div>
            </div>

            {errorMessage && (
              <div
                className="px-4 py-3.5 bg-danger/10 border-l-4 border-l-danger rounded-lg text-danger text-sm font-medium"
                role="alert"
              >
                {errorMessage}
              </div>
            )}

            <button
              className="w-full px-4 py-3.5 bg-brand text-white border-none rounded-input text-base font-semibold tracking-tight cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:not(:disabled):bg-brand-hover hover:not(:disabled):-translate-y-[2px] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              onClick={handleSignUp}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? "Creating account..." : "Continue"}
            </button>

            <div className="h-[1px] bg-[var(--border-color)] border-none m-0" />

            <div className="text-center text-secondary text-sm font-medium">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-brand font-semibold no-underline transition-colors duration-200 hover:text-brand-hover hover:underline"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};  

export default Register;
