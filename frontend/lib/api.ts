const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface Laptop {
    id: number;
    brand: string;
    name: string;
    image_url: string;
    cpu: string;
    cpu_score: number;
    gpu: string;
    gpu_score: number;
    ram_gb: number;
    storage_gb: number;
    display_inch: number;
    display_type: string;
    refresh_rate: number;
    weight_kg: number;
    battery_wh: number;
    battery_score: number;
    thermal_score: number;
    base_price: number;
    description: string;
    store_prices: StorePrice[];
}

export interface LaptopDetail extends Laptop {
    price_history: PricePoint[];
}

export interface StorePrice {
    store_name: string;
    price: number;
    url: string;
    is_lowest: boolean;
}

export interface PricePoint {
    date: string;
    price: number;
    store: string;
}

export interface RecommendationRequest {
    budget: number;
    usage: string;
    cpu_pref: string;
    gpu_pref: string;
    gpu_mode: string;   // "minimum" | "exact"
    ram: number;
    storage: number;
    battery_priority: boolean;
    lightweight: boolean;
}

export interface RecommendationResult {
    laptop: Laptop;
    score: number;
    score_breakdown: Record<string, number>;
}

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, { ...options, cache: "no-store" });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
}

export const api = {
    getLaptops: (params?: string) =>
        fetchJSON<Laptop[]>(`${API_BASE}/laptops${params ? "?" + params : ""}`),

    getLaptop: (id: number) =>
        fetchJSON<LaptopDetail>(`${API_BASE}/laptops/${id}`),

    getPriceHistory: (id: number) =>
        fetchJSON<PricePoint[]>(`${API_BASE}/laptops/${id}/price-history`),

    getRatings: (id: number) =>
        fetchJSON<Record<string, number>>(`${API_BASE}/laptops/${id}/ratings`),

    recommend: (req: RecommendationRequest) =>
        fetchJSON<RecommendationResult[]>(`${API_BASE}/recommendation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req),
        }),

    compare: (ids: number[]) =>
        fetchJSON<any[]>(`${API_BASE}/comparison?ids=${ids.join(",")}`),
};
