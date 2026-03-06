"use client";
import { motion } from "framer-motion";
import { ExternalLink, CheckCircle2 } from "lucide-react";

interface StorePrice {
    store_name: string;
    price: number;
    url: string;
    is_lowest: boolean;
}

const storeLogos: Record<string, string> = {
    Amazon: "🛒",
    Flipkart: "🛍️",
    Croma: "🏪",
    "Reliance Digital": "📱",
    "ASUS Store": "🖥️",
    "Lenovo Store": "💻",
    "Apple Store": "🍎",
    "Dell Store": "💠",
    "HP Store": "🖨️",
    "MSI Store": "⚡",
    "Razer Store": "🐍",
    "Microsoft Store": "🪟",
    "Samsung Store": "📱",
    "Acer Store": "💫",
};

const storeColors: Record<string, string> = {
    Amazon: "#ff9900",
    Flipkart: "#2874f0",
    Croma: "#d90429",
    "Reliance Digital": "#1a1a2e",
};

export default function PriceTable({ prices }: { prices: StorePrice[] }) {
    const sorted = [...prices].sort((a, b) => a.price - b.price);
    const lowest = sorted[0]?.price;

    return (
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border-glass)" }}>
            <div className="px-6 py-4" style={{ background: "var(--bg-secondary)" }}>
                <h3 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
                    Price Comparison
                </h3>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                    Compare prices across {prices.length} stores
                </p>
            </div>

            <div>
                {sorted.map((store, i) => (
                    <motion.div
                        key={store.store_name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-center justify-between p-4 transition-all"
                        style={{
                            background: i === 0 ? "rgba(34,197,94,0.05)" : "transparent",
                            borderTop: i > 0 ? "1px solid var(--border-glass)" : "none",
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{storeLogos[store.store_name] ?? "🏬"}</span>
                            <div>
                                <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                                    {store.store_name}
                                </div>
                                {store.is_lowest && (
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <CheckCircle2 size={11} color="#22c55e" />
                                        <span className="badge-best">Best Price</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div
                                    className="text-xl font-bold"
                                    style={{ color: store.is_lowest ? "var(--accent-green)" : "var(--text-primary)" }}
                                >
                                    ₹{store.price.toLocaleString("en-IN")}
                                </div>
                                {!store.is_lowest && (
                                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                                        +₹{(store.price - lowest).toLocaleString("en-IN")} more
                                    </div>
                                )}
                            </div>

                            <a href={store.url} target="_blank" rel="noopener noreferrer" id={`buy-${store.store_name.replace(/\s/g, "-").toLowerCase()}`}>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                                    style={{
                                        background: store.is_lowest
                                            ? "linear-gradient(90deg, #16a34a, #15803d)"
                                            : "var(--gradient-accent)",
                                    }}
                                >
                                    Buy Now <ExternalLink size={13} />
                                </motion.button>
                            </a>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
