"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Weight, Monitor, Cpu, HardDrive, BatteryFull, Tag } from "lucide-react";
import PriceTable from "@/components/PriceTable";
import PriceChart from "@/components/PriceChart";
import StarRatings from "@/components/StarRatings";
import LaptopCard from "@/components/LaptopCard";
import { api, LaptopDetail, PricePoint } from "@/lib/api";

function SpecItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--bg-secondary)" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--bg-glass)", color: "var(--accent-blue)" }}>
                {icon}
            </div>
            <div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</div>
                <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{value}</div>
            </div>
        </div>
    );
}

export default function LaptopDetailPage() {
    const { id } = useParams();
    const [laptop, setLaptop] = useState<LaptopDetail | null>(null);
    const [history, setHistory] = useState<PricePoint[]>([]);
    const [ratings, setRatings] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const lid = Number(id);
        Promise.all([
            api.getLaptop(lid),
            api.getPriceHistory(lid),
            api.getRatings(lid),
        ]).then(([lap, hist, rat]) => {
            setLaptop(lap);
            setHistory(hist);
            setRatings(rat);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen pt-32 flex items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 rounded-full border-4 border-t-transparent"
                    style={{ borderColor: "var(--accent-blue)", borderTopColor: "transparent" }} />
            </div>
        );
    }

    if (!laptop) return <div className="min-h-screen pt-32 text-center"><p style={{ color: "var(--text-muted)" }}>Laptop not found.</p></div>;

    const bestPrice = laptop.store_prices?.length
        ? Math.min(...laptop.store_prices.map((s) => s.price))
        : laptop.base_price;

    return (
        <div className="min-h-screen pt-24 pb-16 px-4 max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <div className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
                <a href="/laptops" className="hover:text-white transition-colors">Browse</a>
                <span className="mx-2">/</span>
                <span style={{ color: "var(--text-primary)" }}>{laptop.name}</span>
            </div>

            {/* Hero */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
                {/* Image */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative rounded-3xl overflow-hidden aspect-video"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border-glass)" }}
                >
                    <Image src={laptop.image_url} alt={laptop.name} fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" />
                </motion.div>

                {/* Info */}
                <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="text-sm font-semibold mb-2" style={{ color: "var(--accent-blue)" }}>{laptop.brand}</div>
                    <h1 className="text-3xl font-black font-outfit mb-3" style={{ color: "var(--text-primary)" }}>{laptop.name}</h1>
                    <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>{laptop.description}</p>

                    {/* Best price */}
                    <div className="rounded-2xl p-5 mb-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border-glass)" }}>
                        <div className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>Best Price Found</div>
                        <div className="text-4xl font-black" style={{ color: "var(--accent-blue)" }}>₹{bestPrice.toLocaleString("en-IN")}</div>
                        <div className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>From {laptop.store_prices?.length} stores</div>
                    </div>

                    {/* Quick specs */}
                    <div className="grid grid-cols-2 gap-3">
                        <SpecItem label="Processor" value={laptop.cpu} icon={<Cpu size={14} />} />
                        <SpecItem label="Graphics" value={laptop.gpu} icon={<Monitor size={14} />} />
                        <SpecItem label="RAM · Storage" value={`${laptop.ram_gb}GB · ${laptop.storage_gb >= 1000 ? laptop.storage_gb / 1000 + "TB" : laptop.storage_gb + "GB"}`} icon={<HardDrive size={14} />} />
                        <SpecItem label="Display" value={`${laptop.display_inch}" ${laptop.display_type} ${laptop.refresh_rate}Hz`} icon={<Monitor size={14} />} />
                        <SpecItem label="Weight" value={`${laptop.weight_kg} kg`} icon={<Weight size={14} />} />
                        <SpecItem label="Battery" value={`${laptop.battery_wh} Wh`} icon={<BatteryFull size={14} />} />
                    </div>

                    {/* Compare link */}
                    <a href={`/compare?add=${laptop.id}`} className="mt-4 flex items-center gap-2 text-sm glass px-4 py-2 rounded-xl inline-flex" style={{ color: "var(--text-secondary)" }}>
                        <Tag size={14} /> Add to Compare
                    </a>
                </motion.div>
            </div>

            {/* Price Table */}
            {laptop.store_prices && laptop.store_prices.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
                    <PriceTable prices={laptop.store_prices} />
                </motion.div>
            )}

            {/* Price History Chart */}
            {history.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
                    <PriceChart data={history} currentPrice={bestPrice} />
                </motion.div>
            )}

            {/* Performance Ratings */}
            {Object.keys(ratings).length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-2xl p-6 mb-8"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border-glass)" }}
                >
                    <h2 className="text-xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>Performance Ratings</h2>
                    <StarRatings ratings={ratings} />
                </motion.div>
            )}
        </div>
    );
}
