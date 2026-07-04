import React from "react";

interface LoaderProps {
    size?: "sm" | "md" | "lg";
}

const Loader: React.FC<LoaderProps> = ({ size = "lg" }) => {

    const getSize = () => {
        switch (size) {
            case "sm":
                return "w-5 h-5";
            case "md":
                return "w-10 h-10";
            case "lg":
            default:
                return "w-16 h-16";
        }
    };

    const spinnerBorder = () => {
        switch (size) {
            case "sm":
                return "border-2";
            case "md":
                return "border-3";
            case "lg":
            default:
                return "border-4";
        }
    };

    return (
        <div className="flex items-center justify-center">
            <div className={`relative flex items-center justify-center ${getSize()}`}>

                <div className={`absolute ${getSize()} rounded-full border-gray-200 ${spinnerBorder()}`}></div>

                <div className={`absolute ${getSize()} rounded-full border-black border-t-transparent animate-spin ${spinnerBorder()}`}></div>

                {size === "lg" && (
                    <div className="absolute w-8 h-8 rounded-full border-2 border-gray-300 border-b-transparent animate-[spin_0.8s_linear_infinite_reverse]"></div>
                )}

            </div>
        </div>
    );
};

export default Loader;