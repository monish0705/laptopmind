"use client";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ReferenceLine, Area, AreaChart,
} from "recharts";
import { useMemo } from "react";

interface PricePoint {
    date: string;
    price: number;
    store: string;
}

interface PriceChartProps {
    data: PricePoint[];
    currentPrice?: number;
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload || !payload.length) return null;
    return (
        <div
            className="glass rounded-xl p-3 text-sm"
            style={{ border: "1px solid var(--border-glass)" }}
        >
            <div style={{ color: "var(--text-muted)" }}>{label}</div>
            <div className="font-bold text-lg mt-1" style={{ color: "var(--accent-blue)" }}>
                ₹{payload[0].value?.toLocaleString("en-IN")}
            </div>
        </div>
    );
}

export default function PriceChart({ data, currentPrice }: PriceChartProps) {
    const prices = data.map((d) => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const minDate = data.find((d) => d.price === minPrice)?.date;

    // Show every 15th data point label to avoid clutter
    const formatted = data.map((d, i) => ({
        ...d,
        label: i % 15 === 0 ? d.date.slice(5) : "",
    }));

    const gradientId = "priceGradient";

    return (
        <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border-glass)" }}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
                        Price History
                    </h3>
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                        Last 90 days • Amazon
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-right">
                    <div>
                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>Lowest</div>
                        <div className="font-bold" style={{ color: "var(--accent-green)" }}>
                            ₹{minPrice.toLocaleString("en-IN")}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>Highest</div>
                        <div className="font-bold" style={{ color: "#ef4444" }}>
                            ₹{maxPrice.toLocaleString("en-IN")}
                        </div>
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={formatted} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f8cff" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#4f8cff" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                        dataKey="label"
                        tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                        tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={55}
                        domain={["auto", "auto"]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {minDate && (
                        <ReferenceLine
                            x={minDate.slice(5)}
                            stroke="#22c55e"
                            strokeDasharray="4 4"
                            label={{ value: "Lowest", fill: "#22c55e", fontSize: 11, position: "top" }}
                        />
                    )}
                    <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#4f8cff"
                        strokeWidth={2.5}
                        fill={`url(#${gradientId})`}
                        dot={false}
                        activeDot={{ r: 5, fill: "#4f8cff", stroke: "white", strokeWidth: 2 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
