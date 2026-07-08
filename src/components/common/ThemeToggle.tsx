import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="relative flex h-9 w-16 items-center rounded-full border border-gray-200 bg-gray-100 px-1 transition-colors dark:border-slate-700 dark:bg-slate-800"
        >
            <span
                className={`flex h-7 w-7 items-center justify-center rounded-full bg-white text-amber-500 shadow-sm transition-transform duration-200 dark:bg-slate-900 dark:text-indigo-300 ${
                    isDark ? "translate-x-7" : "translate-x-0"
                }`}
            >
                {isDark ? <Moon size={14} /> : <Sun size={14} />}
            </span>
        </button>
    );
};

export default ThemeToggle;
