"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Tag, Zap, Star, ShoppingCart } from "lucide-react";

interface StorePrice {
    store_name: string;
    price: number;
    url: string;
    is_lowest: boolean;
}

interface LaptopCardProps {
    laptop: {
        id: number;
        brand: string;
        name: string;
        image_url: string;
        cpu: string;
        gpu: string;
        ram_gb: number;
        storage_gb: number;
        base_price: number;
        store_prices?: StorePrice[];
        battery_score?: number;
        gpu_score?: number;
    };
    score?: number;
    index?: number;
}

function getBestPrice(laptop: LaptopCardProps["laptop"]) {
    if (laptop.store_prices && laptop.store_prices.length > 0) {
        return Math.min(...laptop.store_prices.map((s) => s.price));
    }
    return laptop.base_price;
}

function getScoreColor(score: number) {
    if (score >= 80) return "#22c55e";
    if (score >= 65) return "#4f8cff";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
}

export default function LaptopCard({ laptop, score, index = 0 }: LaptopCardProps) {
    const bestPrice = getBestPrice(laptop);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            whileHover={{ y: -6, boxShadow: "0 24px 60px rgba(79,140,255,0.2)" }}
            className="rounded-2xl overflow-hidden card-hover"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-glass)" }}
        >
            {/* Image */}
            <div className="relative h-48 overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
                <Image
                    src={laptop.image_url}
                    alt={laptop.name}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 400px"
                />
                {/* Score badge */}
                {score !== undefined && (
                    <div
                        className="absolute top-3 right-3 w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm text-white"
                        style={{ background: getScoreColor(score) }}
                    >
                        {Math.round(score)}
                    </div>
                )}
                {/* Brand badge */}
                <div className="absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-semibold glass" style={{ color: "var(--accent-blue)" }}>
                    {laptop.brand}
                </div>
            </div>

            {/* Details */}
            <div className="p-5">
                <h3 className="font-bold text-base mb-3 leading-tight" style={{ color: "var(--text-primary)" }}>
                    {laptop.name}
                </h3>

                {/* Specs chips */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {[
                        laptop.cpu.split(" ").slice(0, 3).join(" "),
                        laptop.gpu.split(" ").slice(0, 3).join(" "),
                        `${laptop.ram_gb}GB RAM`,
                        `${laptop.storage_gb >= 1000 ? laptop.storage_gb / 1000 + "TB" : laptop.storage_gb + "GB"}`,
                    ].map((spec, si) => (
                        <span
                            key={si}
                            className="text-xs px-2 py-1 rounded-lg font-medium"
                            style={{ background: "var(--bg-glass)", color: "var(--text-secondary)", border: "1px solid var(--border-glass)" }}
                        >
                            {spec}
                        </span>
                    ))}
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Best Price</div>
                        <div className="text-2xl font-bold" style={{ color: "var(--accent-blue)" }}>
                            ₹{bestPrice.toLocaleString("en-IN")}
                        </div>
                    </div>
                    {score !== undefined && (
                        <div className="text-right">
                            <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Match Score</div>
                            <div className="flex items-center gap-1">
                                <Star size={14} fill="#fbbf24" color="#fbbf24" />
                                <span className="font-bold text-lg" style={{ color: "#fbbf24" }}>{score.toFixed(1)}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Link href={`/laptops/${laptop.id}`} className="flex-1">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
                            style={{ background: "var(--gradient-accent)" }}
                            id={`view-laptop-${laptop.id}`}
                        >
                            View Details
                        </motion.button>
                    </Link>
                    <Link href={`/compare?add=${laptop.id}`}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2.5 rounded-xl glass"
                            style={{ color: "var(--text-secondary)" }}
                            title="Add to compare"
                            id={`compare-laptop-${laptop.id}`}
                        >
                            <Tag size={16} />
                        </motion.button>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
