"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import LaptopCard from "@/components/LaptopCard";
import { api, Laptop } from "@/lib/api";

const brands = ["All", "ASUS", "Lenovo", "Apple", "Dell", "HP", "MSI", "Acer", "Razer", "Samsung", "Microsoft"];

export default function LaptopsPage() {
    const [laptops, setLaptops] = useState<Laptop[]>([]);
    const [filtered, setFiltered] = useState<Laptop[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [brand, setBrand] = useState("All");
    const [maxBudget, setMaxBudget] = useState(500000);

    useEffect(() => {
        api.getLaptops()
            .then((data) => {
                setLaptops(data);
                setFiltered(data);
                setLoading(false);
            })
            .catch(() => {
                setError("Could not connect to the LaptopMind backend. Please try again in a moment.");
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        let result = laptops;
        if (brand !== "All") result = result.filter((l) => l.brand === brand);
        if (search) result = result.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()) || l.cpu.toLowerCase().includes(search.toLowerCase()));
        result = result.filter((l) => l.base_price <= maxBudget);
        setFiltered(result);
    }, [search, brand, maxBudget, laptops]);

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                <h1 className="text-4xl font-black font-outfit mb-2" style={{ color: "var(--text-primary)" }}>
                    Browse Laptops
                </h1>
                <p style={{ color: "var(--text-secondary)" }}>{filtered.length} laptops found</p>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl p-6 mb-8 space-y-4"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-glass)" }}
            >
                {/* Search */}
                <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                    <input
                        type="text"
                        placeholder="Search by name, CPU, GPU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                        style={{
                            background: "var(--bg-secondary)",
                            border: "1px solid var(--border-glass)",
                            color: "var(--text-primary)",
                        }}
                        id="laptop-search-input"
                    />
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                    {/* Brand filter */}
                    <div className="flex flex-wrap gap-2">
                        {brands.map((b) => (
                            <button
                                key={b}
                                onClick={() => setBrand(b)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                style={{
                                    background: brand === b ? "var(--accent-blue)" : "var(--bg-secondary)",
                                    color: brand === b ? "white" : "var(--text-secondary)",
                                    border: "1px solid var(--border-glass)",
                                }}
                                id={`brand-filter-${b.toLowerCase()}`}
                            >
                                {b}
                            </button>
                        ))}
                    </div>

                    {/* Budget slider */}
                    <div className="flex items-center gap-3 ml-auto">
                        <span className="text-sm" style={{ color: "var(--text-muted)" }}>Max Budget:</span>
                        <input
                            type="range"
                            min={50000}
                            max={500000}
                            step={5000}
                            value={maxBudget}
                            onChange={(e) => setMaxBudget(Number(e.target.value))}
                            className="w-40"
                            id="budget-slider"
                        />
                        <span className="text-sm font-semibold" style={{ color: "var(--accent-blue)" }}>
                            ₹{(maxBudget / 1000).toFixed(0)}k
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Error state */}
            {error && (
                <div className="text-center py-20">
                    <div className="text-5xl mb-4">⚠️</div>
                    <p className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Backend not reachable</p>
                    <p className="mb-4 max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 rounded-xl font-semibold text-white"
                        style={{ background: "var(--gradient-accent)" }}
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Grid */}
            {!error && loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="rounded-2xl h-80 shimmer" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>No laptops found</p>
                    <p style={{ color: "var(--text-muted)" }}>Try adjusting your filters</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filtered.map((laptop, i) => (
                        <LaptopCard key={laptop.id} laptop={laptop} index={i} />
                    ))}
                </div>
            )}
        </div>
    );
}
