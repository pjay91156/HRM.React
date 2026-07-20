import { useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { login } from "../services/authService";
import { useNavigate } from "react-router-dom";
import Loader from "../components/common/Loader";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.email) {
      newErrors.email = "Email is required";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      const response = await login(form);
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full px-3 py-2.5 border rounded-md text-sm outline-none placeholder-gray-400 dark:placeholder-slate-500 transition-colors
    ${errors[field]
      ? "border-red-500"
      : "border-gray-300 dark:border-slate-600 focus:border-[#4a90e2]"
    }`;

  return (
    <div className="min-h-screen bg-[#112240] flex items-center justify-center p-4 sm:p-6 lg:p-8">

      <div className="w-full max-w-[500px] bg-[#f8f9fa] py-8 sm:py-12 px-6 sm:px-10 rounded-sm shadow-2xl border border-gray-200/20">

        <h1 className="text-3xl font-semibold text-[#09132c] mb-2 text-center">
          Welcome Back
        </h1>

        <p className="text-center text-gray-600 dark:text-slate-400 mb-8">
          Sign in to continue
        </p>

        <div className="bg-white dark:bg-slate-900 border border-[#e9ecef] rounded-lg p-5 sm:p-8 shadow-sm">

          <form onSubmit={handleSubmit} className="space-y-[18px]">

            {/* EMAIL */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-[#333e56] mb-2">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={inputClass("email")}
              />

              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="flex flex-col">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-semibold text-[#333e56]">
                  Password
                </label>

                <a
                  href="#forgot-password"
                  className="text-sm text-[#4a90e2] hover:underline"
                >
                  Forgot Password?
                </a>
              </div>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className={inputClass("password")}
              />

              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* REMEMBER ME */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 accent-[#4a90e2]"
              />

              <label className="text-sm text-gray-600 dark:text-slate-400">
                Remember me
              </label>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#4e91dc] text-white rounded-md text-base font-medium tracking-wide transition-colors hover:bg-[#3b7ec9] active:bg-[#2c6cb3] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader size="sm" />}
              {loading ? "Logging in..." : "Log In"}
            </button>

          </form>
        </div>

        <p className="mt-6 text-sm text-gray-600 dark:text-slate-400 text-center">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-[#4a90e2] font-medium hover:underline"
          >
            Create Account
          </Link>
        </p>

      </div>
    </div>
  );
}