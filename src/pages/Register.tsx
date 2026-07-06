import { useState, type ChangeEvent } from "react";
import  { type RegisterRequest } from "../models/RegisterModel";
import { register } from "../services/authService";
import { Link } from "react-router-dom";
import Loader from "../components/common/Loader";

export default function Register() {
  const [form, setForm] = useState<RegisterRequest>({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    password: "",
    confirmPassword: ""

  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.firstName) newErrors.firstName = "First name is required";
    if (!form.lastName) newErrors.lastName = "Last name is required";
    if (!form.companyName) newErrors.companyName = "Company name is required";
    if (!form.email) newErrors.email = "Email is required";
    if (!form.password) newErrors.password = "Password is required";
    if (!form.confirmPassword)
      newErrors.confirmPassword = "Confirm password is required";

    if (
      form.password &&
      form.confirmPassword &&
      form.password !== form.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match";
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
    const response = await register(form);

    if (response.success) {
      alert(response.message);

      console.log(response.data);

      setForm({
        firstName: "",
        lastName: "",
        companyName: "",
        email: "",
        password: "",
        confirmPassword: ""
      });
    } else {
      alert(response.message);
    }
  } catch (error: any) {
    console.error(error);

    if (error.response?.data?.message) {
      alert(error.response.data.message);
    } else {
      alert("Something went wrong.");
    }
  } finally {
    setLoading(false);
  }
};

  const inputClass = (field: string) =>
    `w-full px-3 py-2.5 border rounded-md text-sm outline-none placeholder-gray-400 transition-colors
    ${
      errors[field]
        ? "border-red-500"
        : "border-gray-300 focus:border-[#4a90e2]"
    }`;

  return (
    // 🌌 FIXED HEIGHT HANDLING: Added dynamic padding and scroll fallback on the main screen component wrapper
    <div className="min-h-screen bg-[#112240] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans overflow-y-auto">

      {/* MAIN CARD: Added structural max-h constraint and custom scrollbars to accommodate all validation fields seamlessly */}
      <div className="w-full max-w-[580px] my-auto bg-[#f8f9fa] py-8 sm:py-12 px-6 sm:px-10 rounded-sm flex flex-col items-center shadow-2xl border border-gray-200/20">

        <h1 className="text-3xl font-semibold text-[#09132c] mb-6 tracking-tight text-center">
          Create your account
        </h1>

        {/* INNER CARD */}
        <div className="w-full bg-white border border-[#e9ecef] rounded-lg p-5 sm:p-8 shadow-sm">

          <form onSubmit={handleSubmit} className="space-y-[18px]">

            {/* FIRST + LAST NAME */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#333e56] mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className={inputClass("firstName")}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                )}
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#333e56] mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className={inputClass("lastName")}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>

            </div>

            {/* COMPANY */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-[#333e56] mb-2">
                Company name
              </label>
              <input
                type="text"
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                className={inputClass("companyName")}
              />
              {errors.companyName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.companyName}
                </p>
              )}
            </div>

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
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-[#333e56] mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className={inputClass("password")}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-[#333e56] mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className={inputClass("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* TERMS */}
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="agreeToTerms"             
                  onChange={handleChange}
                  className="w-4 h-4 cursor-pointer accent-[#4a90e2]"
                />
                <label className="text-[13px] text-gray-600 select-none">
                  I accept{" "}
                  <a href="#terms" className="text-[#4a90e2] hover:underline">
                    Terms and conditions
                  </a>
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.agreeToTerms}
                </p>
              )}
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#4e91dc] text-white rounded-md text-base font-medium tracking-wide transition-colors hover:bg-[#3b7ec9] active:bg-[#2c6cb3] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader size="sm" />}
              {loading ? "Creating account..." : "Continue"}
            </button>

          </form>
        </div>

        {/* LOGIN */}
        <p className="mt-6 text-sm text-gray-600 text-center">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#4a90e2] font-medium hover:underline"
          >
            Log in
          </Link>
        </p>

      </div>
    </div>
  );
}