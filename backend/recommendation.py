"""
LaptopMind Recommendation Engine v3
=====================================
Pipeline:
  Step 1 — Hard Filters         (budget, CPU brand, RAM, storage, GPU tier floor)
  Step 2 — Use-case Scoring     (weighted hardware scores per usage profile)
  Step 3 — Price Efficiency     (reward value, penalise overpriced)
  Step 4 — Preference Bonuses   (battery, lightweight, GPU gen bonus)
  Step 5 — Brand Diversification (max 2 per brand in top N)
  Step 6 — Final Ranking        (0-100 normalised score)
"""

from typing import List, Dict, Tuple, Optional
from models import Laptop
from schemas import RecommendationRequest

# ─────────────────────────────────────────────────────────────────────────────
# GPU Generation Rank Table
# ─────────────────────────────────────────────────────────────────────────────
GPU_RANK: Dict[str, int] = {
    # Integrated
    "No preference": 0, "Integrated": 0,
    "Intel Graphics": 1, "Intel Arc": 2, "AMD Radeon": 2,
    # RTX 30-series
    "RTX 30": 3, "RTX 3050": 3, "RTX 3060": 4, "RTX 3070": 5,
    "RTX 3080": 6, "RTX 3090": 7,
    # RTX 40-series
    "RTX 4050": 8, "RTX 4060": 9, "RTX 4070": 10,
    "RTX 4080": 11, "RTX 4090": 12,
    # RTX 50-series
    "RTX 5060": 13, "RTX 5070": 14, "RTX 5080": 15, "RTX 5090": 16,
    # Apple Silicon
    "Apple M1": 5, "Apple M2": 8, "Apple M3": 10, "Apple M4": 12,
}

def get_gpu_rank(gpu_str: str) -> int:
    best = 0
    for key, rank in GPU_RANK.items():
        if key.upper() in gpu_str.upper():
            best = max(best, rank)
    return best


# ─────────────────────────────────────────────────────────────────────────────
# Usage-profile weights  (must sum to 1.0)
# ─────────────────────────────────────────────────────────────────────────────
USAGE_WEIGHTS: Dict[str, Dict[str, float]] = {
    "Gaming": {
        "gpu":     0.40,
        "cpu":     0.25,
        "display": 0.15,   # refresh-rate matters for gaming
        "thermal": 0.10,
        "ram":     0.08,
        "battery": 0.02,
    },
    "AI/ML": {
        "gpu":     0.35,
        "cpu":     0.25,
        "ram":     0.28,   # large RAM essential for ML datasets
        "thermal": 0.08,
        "display": 0.02,
        "battery": 0.02,
    },
    "Video Editing": {
        "gpu":     0.25,
        "cpu":     0.30,
        "ram":     0.22,
        "display": 0.15,   # colour accuracy / panel quality
        "thermal": 0.05,
        "battery": 0.03,
    },
    "Programming": {
        "gpu":     0.05,
        "cpu":     0.30,
        "ram":     0.25,
        "display": 0.10,
        "battery": 0.22,
        "thermal": 0.08,
    },
    "Student": {
        "gpu":     0.04,
        "cpu":     0.22,
        "ram":     0.18,
        "display": 0.08,
        "battery": 0.32,   # all-day classes
        "thermal": 0.06,
        "weight":  0.10,   # portability matters for students
    },
}

DEFAULT_WEIGHTS: Dict[str, float] = {
    "gpu": 0.20, "cpu": 0.25, "ram": 0.20,
    "display": 0.10, "battery": 0.15, "thermal": 0.10,
}


# ─────────────────────────────────────────────────────────────────────────────
# Normalisers → 0-100
# ─────────────────────────────────────────────────────────────────────────────
def norm_ram(ram_gb: int, usage: str) -> float:
    sweet: Dict[str, int] = {
        "Gaming": 16, "AI/ML": 32, "Video Editing": 32,
        "Programming": 16, "Student": 8,
    }
    sp = sweet.get(usage, 16)
    if ram_gb >= sp * 2: return 100.0
    if ram_gb >= sp:     return 85.0
    if ram_gb >= sp // 2: return 60.0
    return 35.0


def norm_display(display_type: str, refresh_rate: int, usage: str) -> float:
    panel = {"OLED": 100, "AMOLED": 100, "IPS": 72, "VA": 62, "TN": 45}.get(display_type, 60)
    # Gamers care about high Hz, creators care about colour panel
    if usage == "Gaming":
        hz_bonus = min((refresh_rate - 60) / 5, 30)
    elif usage in ("Video Editing",):
        hz_bonus = 0  # colour > Hz for editing
    else:
        hz_bonus = min((refresh_rate - 60) / 10, 15)
    return min(panel + hz_bonus, 100)


def norm_weight(weight_kg: float) -> float:
    if weight_kg <= 1.2: return 100.0
    if weight_kg <= 1.5: return 88.0
    if weight_kg <= 1.8: return 74.0
    if weight_kg <= 2.2: return 58.0
    if weight_kg <= 2.6: return 40.0
    return 22.0


def price_efficiency(best_price: int, budget: int, gpu_score: int, cpu_score: int) -> float:
    """
    Reward laptops that deliver high hardware performance per rupee.
    Returns 0-100.
    """
    performance_index = (gpu_score * 0.5 + cpu_score * 0.5)  # 0-100
    price_ratio = best_price / budget  # 0.x – 1.0 (capped in filter step)
    # Lower price_ratio with high perf = great value
    efficiency = performance_index / price_ratio
    # normalise: 100 means max performance at budget, 0 = terrible value
    return min(efficiency, 100)


# ─────────────────────────────────────────────────────────────────────────────
# Step 1 — Hard Filters
# Returns True if laptop should be KEPT, False if ELIMINATED.
# ─────────────────────────────────────────────────────────────────────────────
def passes_hard_filters(laptop: Laptop, req: RecommendationRequest,
                        best_price: int) -> Tuple[bool, str]:
    # 1a. Budget: allow up to 15% over (slight stretch), eliminate beyond
    if best_price > req.budget * 1.15:
        return False, f"Over budget (₹{best_price:,} > ₹{int(req.budget*1.15):,})"

    # 1b. CPU brand (only hard-filter if user made an explicit non-neutral choice)
    if req.cpu_pref == "Intel" and "Intel" not in laptop.cpu:
        return False, "CPU brand mismatch (user wants Intel)"
    if req.cpu_pref == "Ryzen" and "Ryzen" not in laptop.cpu:
        return False, "CPU brand mismatch (user wants Ryzen)"
    if req.cpu_pref == "Apple" and "Apple" not in laptop.cpu:
        return False, "CPU brand mismatch (user wants Apple Silicon)"

    # 1c. RAM: must meet at least the required amount
    if laptop.ram_gb < req.ram:
        return False, f"Insufficient RAM ({laptop.ram_gb}GB < {req.ram}GB required)"

    # 1d. Storage
    if laptop.storage_gb < req.storage:
        return False, f"Insufficient storage ({laptop.storage_gb}GB < {req.storage}GB required)"

    # 1e. GPU tier: gpu_mode="minimum" means show >= selected tier
    #               gpu_mode="exact" means show only that generation family
    if req.gpu_pref not in ("No preference", ""):
        laptop_rank = get_gpu_rank(laptop.gpu)
        requested_rank = GPU_RANK.get(req.gpu_pref, 0)

        if req.gpu_mode == "exact":
            # Must match the same generation family (within ±1 tier of the exact value)
            if abs(laptop_rank - requested_rank) > 1:
                return False, f"GPU tier mismatch (exact mode): wanted rank~{requested_rank}, got {laptop_rank}"
        else:
            # Minimum mode: laptop GPU must be AT or ABOVE requested tier
            if laptop_rank < requested_rank:
                return False, f"GPU below minimum (rank {laptop_rank} < {requested_rank})"

    # 1f. Lightweight: if user strictly needs it, eliminate heavy laptops
    if req.lightweight and laptop.weight_kg > 2.0:
        return False, f"Too heavy ({laptop.weight_kg}kg) for lightweight requirement"

    return True, "OK"


# ─────────────────────────────────────────────────────────────────────────────
# Step 2 — Hardware Scoring (use-case weighted)
# ─────────────────────────────────────────────────────────────────────────────
def hardware_score(laptop: Laptop, req: RecommendationRequest) -> float:
    weights = dict(USAGE_WEIGHTS.get(req.usage, DEFAULT_WEIGHTS))

    # Dynamically boost battery weight if user prioritises it
    if req.battery_priority:
        weights["battery"] = weights.get("battery", 0.05) + 0.18
        total = sum(weights.values())
        weights = {k: v / total for k, v in weights.items()}

    # Dynamically boost weight score for Student/portability
    if req.lightweight and "weight" not in weights:
        weights["weight"] = 0.12
        total = sum(weights.values())
        weights = {k: v / total for k, v in weights.items()}

    scores = {
        "gpu":     float(laptop.gpu_score),
        "cpu":     float(laptop.cpu_score),
        "ram":     norm_ram(laptop.ram_gb, req.usage),
        "battery": float(laptop.battery_score),
        "thermal": float(laptop.thermal_score),
        "display": norm_display(laptop.display_type, laptop.refresh_rate, req.usage),
        "weight":  norm_weight(laptop.weight_kg),
    }

    return sum(scores.get(dim, 0) * w for dim, w in weights.items())


# ─────────────────────────────────────────────────────────────────────────────
# Step 3 — Budget Fit (smooth curve)
# ─────────────────────────────────────────────────────────────────────────────
def budget_multiplier(best_price: int, budget: int) -> Tuple[float, str]:
    ratio = best_price / budget
    if ratio <= 0.80: return 1.08, "Excellent Value 🏷️"
    if ratio <= 0.90: return 1.04, "Great Value ✅"
    if ratio <= 1.00: return 1.00, "Within Budget"
    if ratio <= 1.08: return 0.90, "Slight Stretch"
    return 0.75, "Over Budget"


# ─────────────────────────────────────────────────────────────────────────────
# Step 4 — Soft Preference Bonuses / Penalties  (additive, –15 to +20)
# ─────────────────────────────────────────────────────────────────────────────
def soft_bonuses(laptop: Laptop, req: RecommendationRequest) -> Tuple[float, Dict]:
    bd: Dict[str, float] = {}

    # GPU tier bonus: reward laptops that exceed the requested tier
    if req.gpu_pref not in ("No preference", ""):
        laptop_rank = get_gpu_rank(laptop.gpu)
        req_rank = GPU_RANK.get(req.gpu_pref, 0)
        diff = laptop_rank - req_rank
        if diff == 0:   bd["gpu_tier"] = 10.0   # exact match
        elif diff == 1: bd["gpu_tier"] = 7.0    # one tier above (premium bonus)
        elif diff >= 2: bd["gpu_tier"] = 4.0    # much better (might be overkill)
        else:           bd["gpu_tier"] = 0.0    # below — already filtered, but just in case
    else:
        bd["gpu_tier"] = 3.0  # no preference → neutral bonus

    # Battery priority bonus
    if req.battery_priority:
        if laptop.battery_score >= 85:   bd["battery"] = 12.0
        elif laptop.battery_score >= 70: bd["battery"] = 5.0
        else:                            bd["battery"] = -3.0
    else:
        bd["battery"] = 0.0

    # Lightweight bonus
    if req.lightweight:
        if laptop.weight_kg <= 1.5:   bd["weight"] = 10.0
        elif laptop.weight_kg <= 1.8: bd["weight"] = 5.0
        else:                         bd["weight"] = 0.0
    else:
        bd["weight"] = 0.0

    return sum(bd.values()), bd


# ─────────────────────────────────────────────────────────────────────────────
# Main score_laptop → returns None if filtered out
# ─────────────────────────────────────────────────────────────────────────────
def score_laptop(laptop: Laptop, req: RecommendationRequest) -> Optional[Dict]:
    best_price = laptop.base_price
    if laptop.store_prices:
        best_price = min(sp.price for sp in laptop.store_prices)

    # Step 1: Hard filter
    ok, reason = passes_hard_filters(laptop, req, best_price)
    if not ok:
        return None

    # Step 2: Hardware score (0-100)
    hw = hardware_score(laptop, req)

    # Step 3: Price efficiency (0-100)
    pe = price_efficiency(best_price, req.budget, laptop.gpu_score, laptop.cpu_score)

    # Step 4: Soft bonuses/penalties
    bonus, bonus_bd = soft_bonuses(laptop, req)

    # Step 5: Budget multiplier
    b_mult, b_label = budget_multiplier(best_price, req.budget)

    # Final weighted formula (user-spec inspired):
    # 40% performance + 20% price-efficiency + 10% soft bonuses → all * budget_mult
    combined = (hw * 0.60 + pe * 0.25 + bonus * 0.55)
    final = combined * b_mult

    # Normalise to 0-100
    # Theoretical max: hw=100, pe=100, bonus=42 → combined≈102, *1.08 → 110 → /110*100
    normalised = min(final / 1.10, 100)

    return {
        "score": round(normalised, 1),
        "best_price": best_price,
        "budget_label": b_label,
        "breakdown": {
            "Hardware Score":    round(hw, 1),
            "Price Efficiency":  round(pe, 1),
            "Budget Fit":        b_label,
            "GPU Score":         laptop.gpu_score,
            "CPU Score":         laptop.cpu_score,
            "RAM Score":         round(norm_ram(laptop.ram_gb, req.usage), 1),
            "Battery Score":     laptop.battery_score,
            "Thermal Score":     laptop.thermal_score,
            "Soft Bonus":        round(bonus, 1),
            **{f"  · {k}": round(v, 1) for k, v in bonus_bd.items()},
        },
    }


# ─────────────────────────────────────────────────────────────────────────────
# Step 5 — Brand Diversification (max 2 per brand)
# ─────────────────────────────────────────────────────────────────────────────
def diversify_brands(scored: List[Tuple[Laptop, float, Dict]], top_n: int) -> List[Tuple[Laptop, float, Dict]]:
    """Ensure max 2 laptops per brand in top-N results."""
    brand_count: Dict[str, int] = {}
    primary: List[Tuple[Laptop, float, Dict]] = []
    overflow: List[Tuple[Laptop, float, Dict]] = []

    for item in scored:
        laptop = item[0]
        brand = laptop.brand
        if brand_count.get(brand, 0) < 2:
            primary.append(item)
            brand_count[brand] = brand_count.get(brand, 0) + 1
        else:
            overflow.append(item)

        if len(primary) == top_n:
            break

    # If not enough after diversity, fill from overflow
    if len(primary) < top_n:
        remaining = top_n - len(primary)
        primary.extend(overflow[:remaining])

    return primary[:top_n]


# ─────────────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────────────
def _run_pass(laptops, req) -> List[Tuple[Laptop, float, Dict]]:
    """Score all laptops against req, return scored list (filtered + sorted)."""
    scored = []
    for laptop in laptops:
        result = score_laptop(laptop, req)
        if result is None:
            continue
        scored.append((laptop, result["score"], result["breakdown"]))
    scored.sort(key=lambda x: x[1], reverse=True)
    return scored


def get_recommendations(
    laptops: List[Laptop],
    req: RecommendationRequest,
    top_n: int = 5,
) -> List[Tuple[Laptop, float, Dict]]:
    """
    Full pipeline with progressive fallback:
      Pass A: Strict (exact CPU brand + GPU tier filter)
      Pass B: Relax CPU brand restriction only
      Pass C: Relax GPU tier restriction (keep budget + RAM hard cap)
      Pass D: Raise budget cap to 130% (last resort)
    Each fallback appends a note so the results page can indicate alternatives.
    """
    from copy import copy as _copy
    import dataclasses

    # Pass A — strict
    scored = _run_pass(laptops, req)
    fallback_label = None

    if len(scored) < top_n and req.cpu_pref not in ("No preference", ""):
        # Pass B — relax CPU brand
        relaxed = _copy(req)
        relaxed = RecommendationRequest(
            **{**req.model_dump(), "cpu_pref": "No preference"}
        )
        scored = _run_pass(laptops, relaxed)
        fallback_label = "CPU brand relaxed — showing best matches regardless of CPU brand"

    if len(scored) < top_n and req.gpu_pref not in ("No preference", ""):
        # Pass C — relax GPU tier too
        relaxed = RecommendationRequest(
            **{**req.model_dump(), "cpu_pref": "No preference", "gpu_pref": "No preference"}
        )
        scored = _run_pass(laptops, relaxed)
        fallback_label = "No exact GPU match found — showing best available laptops"

    if len(scored) < top_n:
        # Pass D — raise budget cap by 30%
        relaxed = RecommendationRequest(
            **{**req.model_dump(), "budget": int(req.budget * 1.30),
               "cpu_pref": "No preference", "gpu_pref": "No preference"}
        )
        scored = _run_pass(laptops, relaxed)
        fallback_label = "Budget slightly exceeded — showing nearest alternatives"

    # Attach fallback note
    if fallback_label:
        for i, (lap, score, bd) in enumerate(scored):
            bd["⚠ Note"] = fallback_label

    # Brand diversification
    diversified = diversify_brands(scored, top_n)
    return diversified



# ─────────────────────────────────────────────────────────────────────────────
# Performance star ratings (used on detail page)
# ─────────────────────────────────────────────────────────────────────────────
def compute_performance_ratings(laptop: Laptop) -> Dict[str, float]:
    g = laptop.gpu_score
    c = laptop.cpu_score
    r = norm_ram(laptop.ram_gb, "AI/ML")
    b = float(laptop.battery_score)
    t = float(laptop.thermal_score)
    panel = {"OLED": 100, "AMOLED": 100, "IPS": 72, "VA": 62, "TN": 45}.get(laptop.display_type, 60)

    def stars(raw: float) -> float:
        return round(min(raw / 100 * 5, 5), 1)

    return {
        "AI/ML Performance":  stars(g * 0.40 + c * 0.25 + r * 0.35),
        "Gaming Performance": stars(g * 0.45 + c * 0.30 + t * 0.25),
        "Video Editing":      stars(g * 0.25 + c * 0.35 + r * 0.25 + panel * 0.15),
        "Programming":        stars(c * 0.40 + r * 0.30 + b * 0.30),
        "Battery Life":       stars(b),
    }
