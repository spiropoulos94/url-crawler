import React, { useState } from "react";
import { useAuth } from "./providers/AuthProvider";
import { Globe, AlertCircle } from "lucide-react";

export const Login: React.FC = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }

    if (isRegisterMode && password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (isRegisterMode && username.length < 3) {
      setError("Username must be at least 3 characters long");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (isRegisterMode) {
        await register({ username: username.trim(), password });
        setError("");
        alert("Registration successful! Please log in.");
        setIsRegisterMode(false);
      } else {
        await login({ username: username.trim(), password });
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          `${isRegisterMode ? "Registration" : "Login"} failed`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-primary-500 to-blue-600 rounded-2xl shadow-lg">
                <Globe className="h-12 w-12 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
              {isRegisterMode ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="mt-3 text-gray-600 font-medium">
              {isRegisterMode ? "Join Sykell Web Crawler" : "Sign in to continue"}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-bold text-gray-700 mb-2"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError("");
                  }}
                  className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-white/50 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 transition-all duration-200 placeholder-gray-500 text-lg backdrop-blur-sm"
                  placeholder="Enter your username"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-bold text-gray-700 mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-white/50 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 transition-all duration-200 placeholder-gray-500 text-lg backdrop-blur-sm"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="p-1 bg-red-100 rounded-full">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <span className="text-sm font-medium text-red-700">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center text-lg"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : isRegisterMode ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </button>

            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="text-primary-600 hover:text-primary-700 font-semibold transition-colors duration-200"
                disabled={isLoading}
              >
                {isRegisterMode
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Create one"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
