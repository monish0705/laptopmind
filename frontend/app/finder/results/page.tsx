"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight, ChevronDown, RotateCcw } from "lucide-react";
import LaptopCard from "@/components/LaptopCard";

interface RecommendationResult {
    laptop: any;
    score: number;
    score_breakdown: Record<string, number>;
}

function getBestPrice(laptop: any): number {
    if (laptop.store_prices?.length) return Math.min(...laptop.store_prices.map((s: any) => s.price));
    return laptop.base_price;
}

function ScoreBar({ label, value, max = 100, color }: { label: string; value: number; max?: number; color: string }) {
    return (
        <div className="mb-2">
            <div className="flex justify-between text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                <span>{label}</span>
                <span style={{ color }}>{value.toFixed(0)}</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: "var(--bg-secondary)" }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(value / max) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: color }}
                />
            </div>
        </div>
    );
}

export default function ResultsPage() {
    const [results, setResults] = useState<RecommendationResult[]>([]);
    const [req, setReq] = useState<any>(null);
    const [expanded, setExpanded] = useState<number | null>(null);

    useEffect(() => {
        const r = localStorage.getItem("recommendation_results");
        const q = localStorage.getItem("recommendation_req");
        if (r) setResults(JSON.parse(r));
        if (q) setReq(JSON.parse(q));
    }, []);

    if (!results.length) {
        return (
            <div className="min-h-screen pt-32 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>No results found</h2>
                <Link href="/finder">
                    <button className="px-6 py-3 rounded-xl font-semibold text-white" style={{ background: "var(--gradient-accent)" }}>
                        Go to Laptop Finder
                    </button>
                </Link>
            </div>
        );
    }

    const colors = ["#fbbf24", "#c0c0c0", "#cd7f32", "#4f8cff", "#22c55e"];
    const medals = ["🥇", "🥈", "🥉", "4th", "5th"];

    return (
        <div className="min-h-screen pt-24 pb-16 px-4 max-w-5xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm font-medium mb-4" style={{ color: "var(--accent-blue)" }}>
                    ✨ AI Recommendation Results
                </div>
                <h1 className="text-4xl font-black font-outfit mb-3" style={{ color: "var(--text-primary)" }}>
                    Your Top 5 Matches
                </h1>
                {req && (
                    <p style={{ color: "var(--text-secondary)" }}>
                        For <strong>{req.usage}</strong> · Budget ₹{(req.budget / 1000).toFixed(0)}k · {req.ram}GB RAM
                    </p>
                )}
                <Link href="/finder">
                    <button className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 rounded-xl text-sm glass" style={{ color: "var(--text-secondary)" }} id="redo-finder-btn">
                        <RotateCcw size={14} /> Redo Questionnaire
                    </button>
                </Link>
            </motion.div>

            {/* Results */}
            <div className="space-y-6">
                {results.map((result, i) => {
                    const laptop = result.laptop;
                    const isOpen = expanded === i;
                    const bestPrice = getBestPrice(laptop);

                    return (
                        <motion.div
                            key={laptop.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="rounded-2xl overflow-hidden"
                            style={{ background: "var(--bg-card)", border: `1px solid ${i === 0 ? "rgba(79,140,255,0.4)" : "var(--border-glass)"}` }}
                        >
                            {/* Main row */}
                            <div className="flex flex-col md:flex-row gap-4 p-6">
                                {/* Rank */}
                                <div className="flex items-center justify-center w-12 text-2xl shrink-0">{medals[i]}</div>

                                {/* Image */}
                                <div className="relative w-full md:w-32 h-24 shrink-0 rounded-xl overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
                                    <Image src={laptop.image_url} alt={laptop.name} fill className="object-cover" sizes="128px" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div>
                                            <span className="text-xs font-semibold" style={{ color: colors[i] }}>{laptop.brand}</span>
                                            <h3 className="font-bold text-lg leading-tight" style={{ color: "var(--text-primary)" }}>{laptop.name}</h3>
                                        </div>
                                        <div
                                            className="shrink-0 w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black text-white text-xl"
                                            style={{ background: `${colors[i]}20`, color: colors[i], border: `2px solid ${colors[i]}` }}
                                        >
                                            {Math.round(result.score)}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {[laptop.cpu.split(" ").slice(0, 3).join(" "), laptop.gpu, `${laptop.ram_gb}GB RAM`].map((spec) => (
                                            <span key={spec} className="text-xs px-2 py-1 rounded-lg" style={{ background: "var(--bg-glass)", color: "var(--text-secondary)", border: "1px solid var(--border-glass)" }}>
                                                {spec}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div>
                                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>Best Price</span>
                                            <div className="text-2xl font-bold" style={{ color: "var(--accent-blue)" }}>
                                                ₹{bestPrice.toLocaleString("en-IN")}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setExpanded(isOpen ? null : i)}
                                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm glass"
                                                style={{ color: "var(--text-secondary)" }}
                                                id={`expand-score-${laptop.id}`}
                                            >
                                                Score Details <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                                            </button>
                                            <Link href={`/laptops/${laptop.id}`}>
                                                <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--gradient-accent)" }} id={`view-result-${laptop.id}`}>
                                                    View <ArrowRight size={14} />
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded score breakdown */}
                            {isOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-6 pb-6 border-t"
                                    style={{ borderColor: "var(--border-glass)" }}
                                >
                                    <p className="text-sm font-semibold mt-4 mb-4" style={{ color: "var(--text-muted)" }}>Score Breakdown</p>
                                    <div className="grid grid-cols-2 gap-x-8">
                                        <ScoreBar label="GPU Score" value={result.score_breakdown.gpu} color="#8b5cf6" />
                                        <ScoreBar label="CPU Score" value={result.score_breakdown.cpu} color="#4f8cff" />
                                        <ScoreBar label="RAM Score" value={result.score_breakdown.ram} color="#22d3ee" />
                                        <ScoreBar label="Battery Score" value={result.score_breakdown.battery} color="#22c55e" />
                                        <ScoreBar label="Thermal Score" value={result.score_breakdown.thermal} color="#f59e0b" />
                                        <ScoreBar label="Display Score" value={result.score_breakdown.display} color="#ec4899" />
                                    </div>
                                    <div className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
                                        Budget fit: <span className="font-semibold" style={{ color: "var(--accent-green)" }}>{(result.score_breakdown.budget_fit * 100).toFixed(0)}%</span>
                                        &nbsp;·&nbsp; Preference bonus: <span className="font-semibold" style={{ color: "var(--accent-blue)" }}>+{result.score_breakdown.preference_bonus}</span>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
