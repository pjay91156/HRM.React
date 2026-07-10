import React, { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
    value: number;
    max?: number;
    size?: number;
    interactive?: boolean;
    onChange?: (value: number) => void;
    className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
    value,
    max = 5,
    size = 20,
    interactive = false,
    onChange,
    className = ""
}) => {
    const [hovered, setHovered] = useState<number | null>(null);

    const displayValue = hovered ?? value;

    return (
        <div
            className={`inline-flex items-center gap-0.5 ${className}`}
            onMouseLeave={() => interactive && setHovered(null)}
        >
            {Array.from({ length: max }, (_, i) => i + 1).map((star) => {
                const filled = star <= displayValue;
                return (
                    <button
                        key={star}
                        type="button"
                        disabled={!interactive}
                        onClick={() => interactive && onChange?.(star)}
                        onMouseEnter={() => interactive && setHovered(star)}
                        className={
                            interactive
                                ? "p-0.5 cursor-pointer transition-transform hover:scale-110"
                                : "p-0.5 cursor-default"
                        }
                        tabIndex={interactive ? 0 : -1}
                        aria-label={`${star} star${star > 1 ? "s" : ""}`}
                    >
                        <Star
                            size={size}
                            className={
                                filled
                                    ? "fill-amber-400 text-amber-400 transition-colors"
                                    : "fill-transparent text-slate-300 dark:text-slate-600 transition-colors"
                            }
                        />
                    </button>
                );
            })}
        </div>
    );
};

export default StarRating;
