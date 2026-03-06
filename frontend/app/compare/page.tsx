"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, X, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { api, Laptop } from "@/lib/api";

interface CompareData {
    id: number;
    name: string;
    brand: string;
    image_url: string;
    specs: Record<string, string>;
    store_prices: any[];
}

function getBestPrice(data: CompareData) {
    if (data.store_prices?.length) return Math.min(...data.store_prices.map((s: any) => s.price));
    return 0;
}

function ComparePageInner() {
    const searchParams = useSearchParams();
    const [allLaptops, setAllLaptops] = useState<Laptop[]>([]);
    const [selected, setSelected] = useState<number[]>([]);
    const [compareData, setCompareData] = useState<CompareData[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.getLaptops().then(setAllLaptops);
        const addId = searchParams.get("add");
        if (addId) setSelected([Number(addId)]);
    }, [searchParams]);

    function addLaptop(id: number) {
        if (selected.includes(id)) return;
        if (selected.length >= 2) {
            setSelected([selected[1], id]);
        } else {
            setSelected([...selected, id]);
        }
    }

    function removeLaptop(id: number) {
        setSelected(selected.filter((s) => s !== id));
        setCompareData([]);
    }

    async function runComparison() {
        if (selected.length < 2) return;
        setLoading(true);
        try {
            const data = await api.compare(selected);
            setCompareData(data);
        } finally {
            setLoading(false);
        }
    }

    const specKeys = compareData.length > 0 ? Object.keys(compareData[0].specs) : [];

    return (
        <div className="min-h-screen pt-24 pb-16 px-4 max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                <h1 className="text-4xl font-black font-outfit mb-2" style={{ color: "var(--text-primary)" }}>
                    Compare Laptops
                </h1>
                <p style={{ color: "var(--text-secondary)" }}>Select 2 laptops to see a side-by-side comparison</p>
            </motion.div>

            {/* Picker */}
            <div className="rounded-2xl p-6 mb-8" style={{ background: "var(--bg-card)", border: "1px solid var(--border-glass)" }}>
                <h2 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>Select Laptops to Compare</h2>

                {/* Selected slots */}
                <div className="flex gap-4 mb-6">
                    {[0, 1].map((slot) => {
                        const laptopId = selected[slot];
                        const laptop = allLaptops.find((l) => l.id === laptopId);
                        return (
                            <div
                                key={slot}
                                className="flex-1 h-24 rounded-2xl flex items-center justify-center relative"
                                style={{ background: "var(--bg-secondary)", border: `2px dashed ${laptop ? "var(--accent-blue)" : "var(--border-glass)"}` }}
                            >
                                {laptop ? (
                                    <div className="flex items-center gap-3 p-4 w-full">
                                        <div className="relative w-16 h-12 rounded-lg overflow-hidden shrink-0">
                                            <Image src={laptop.image_url} alt={laptop.name} fill className="object-cover" sizes="64px" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-semibold" style={{ color: "var(--accent-blue)" }}>{laptop.brand}</div>
                                            <div className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>{laptop.name}</div>
                                        </div>
                                        <button onClick={() => removeLaptop(laptop.id)} className="p-1 rounded-lg" style={{ color: "var(--text-muted)" }} id={`remove-laptop-${laptop.id}`}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-sm" style={{ color: "var(--text-muted)" }}>
                                        <Plus size={20} className="mx-auto mb-1" />
                                        Laptop {slot + 1}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Laptop picker grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                    {allLaptops.map((laptop) => (
                        <button
                            key={laptop.id}
                            onClick={() => addLaptop(laptop.id)}
                            className="p-3 rounded-xl text-left transition-all"
                            style={{
                                background: selected.includes(laptop.id) ? "rgba(79,140,255,0.1)" : "var(--bg-secondary)",
                                border: selected.includes(laptop.id)
                                    ? "2px solid var(--accent-blue)"
                                    : "1px solid var(--border-glass)",
                                outline: "none",
                            }}
                            id={`pick-laptop-${laptop.id}`}
                        >
                            <div className="text-xs font-semibold mb-1" style={{ color: "var(--accent-blue)" }}>{laptop.brand}</div>
                            <div className="text-xs font-medium leading-tight" style={{ color: "var(--text-primary)" }}>{laptop.name.replace(laptop.brand, "").trim()}</div>
                            <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>₹{(laptop.base_price / 1000).toFixed(0)}k</div>
                        </button>
                    ))}
                </div>

                <motion.button
                    onClick={runComparison}
                    disabled={selected.length < 2 || loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-6 w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40"
                    style={{ background: "var(--gradient-accent)" }}
                    id="run-comparison-btn"
                >
                    {loading ? "Comparing..." : "Compare Selected Laptops →"}
                </motion.button>
            </div>

            {/* Comparison table */}
            {compareData.length === 2 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border-glass)" }}>
                    {/* Header */}
                    <div className="grid grid-cols-3" style={{ background: "var(--bg-secondary)" }}>
                        <div className="p-6 border-r" style={{ borderColor: "var(--border-glass)" }}>
                            <span className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>Specification</span>
                        </div>
                        {compareData.map((data, i) => (
                            <div key={data.id} className={`p-6 text-center ${i === 0 ? "border-r" : ""}`} style={{ borderColor: "var(--border-glass)" }}>
                                <div className="relative w-24 h-16 mx-auto mb-3 rounded-xl overflow-hidden">
                                    <Image src={data.image_url} alt={data.name} fill className="object-cover" sizes="96px" />
                                </div>
                                <div className="text-xs font-semibold" style={{ color: "var(--accent-blue)" }}>{data.brand}</div>
                                <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{data.name}</div>
                                <div className="mt-2 text-xl font-black" style={{ color: "var(--accent-blue)" }}>
                                    ₹{getBestPrice(data).toLocaleString("en-IN")}
                                </div>
                                <Link href={`/laptops/${data.id}`}>
                                    <button className="mt-2 px-4 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: "var(--gradient-accent)" }} id={`view-compare-${data.id}`}>
                                        View Details
                                    </button>
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Spec rows */}
                    {specKeys.map((spec, si) => {
                        const vals = compareData.map((d) => d.specs[spec]);
                        const winner = vals[0] !== vals[1] ? 0 : null; // Simple heuristic: first listed
                        return (
                            <div
                                key={spec}
                                className={`grid grid-cols-3 border-t`}
                                style={{
                                    borderColor: "var(--border-glass)",
                                    background: si % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                                }}
                            >
                                <div className="p-4 border-r flex items-center" style={{ borderColor: "var(--border-glass)", color: "var(--text-muted)" }}>
                                    <span className="text-sm font-medium">{spec}</span>
                                </div>
                                {compareData.map((data, i) => (
                                    <div
                                        key={data.id}
                                        className={`p-4 text-center text-sm font-medium ${i === 0 ? "border-r" : ""}`}
                                        style={{ borderColor: "var(--border-glass)", color: "var(--text-primary)" }}
                                    >
                                        {data.specs[spec]}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </motion.div>
            )}
        </div>
    );
}

export default function ComparePage() {
    return (
        <Suspense fallback={<div className="min-h-screen pt-32 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "var(--accent-blue)", borderTopColor: "transparent" }} /></div>}>
            <ComparePageInner />
        </Suspense>
    );
}
