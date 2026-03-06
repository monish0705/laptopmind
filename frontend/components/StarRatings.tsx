"use client";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface StarRatingsProps {
    ratings: Record<string, number>;
}

const categoryIcons: Record<string, string> = {
    "AI/ML Performance": "🤖",
    "Gaming Performance": "🎮",
    "Video Editing": "🎬",
    "Programming": "💻",
    "Battery Life": "🔋",
};

const categoryColors: Record<string, string> = {
    "AI/ML Performance": "#8b5cf6",
    "Gaming Performance": "#ef4444",
    "Video Editing": "#f59e0b",
    "Programming": "#4f8cff",
    "Battery Life": "#22c55e",
};

function StarRow({ rating, color }: { rating: number; color: string }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => {
                const filled = i <= Math.floor(rating);
                const half = !filled && i - 0.5 <= rating;
                return (
                    <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.07, type: "spring", stiffness: 300 }}
                    >
                        <Star
                            size={16}
                            color={color}
                            fill={filled || half ? color : "transparent"}
                            opacity={half ? 0.6 : 1}
                        />
                    </motion.div>
                );
            })}
            <span className="ml-1 text-sm font-semibold" style={{ color }}>
                {rating.toFixed(1)}
            </span>
        </div>
    );
}

export default function StarRatings({ ratings }: StarRatingsProps) {
    return (
        <div className="space-y-4">
            {Object.entries(ratings).map(([category, rating]) => (
                <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 w-48">
                        <span className="text-lg">{categoryIcons[category] ?? "⚡"}</span>
                        <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                            {category}
                        </span>
                    </div>
                    <div className="flex-1 mx-4">
                        <motion.div
                            className="h-1.5 rounded-full overflow-hidden"
                            style={{ background: "var(--bg-secondary)" }}
                        >
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(rating / 5) * 100}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="h-full rounded-full"
                                style={{ background: categoryColors[category] ?? "var(--accent-blue)" }}
                            />
                        </motion.div>
                    </div>
                    <StarRow rating={rating} color={categoryColors[category] ?? "var(--accent-blue)"} />
                </div>
            ))}
        </div>
    );
}
