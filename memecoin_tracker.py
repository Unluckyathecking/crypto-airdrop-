"""Utilities to track promising Solana memecoins using CoinGecko data."""

import argparse
import requests
import time
from typing import List, Dict, Tuple

COINGECKO_API = "https://api.coingecko.com/api/v3"


def get_trending_coins() -> List[Dict]:
    """Return the list of trending coins from CoinGecko."""

    url = f"{COINGECKO_API}/search/trending"
    resp = requests.get(url, timeout=10)
    resp.raise_for_status()
    data = resp.json()
    return [coin["item"] for coin in data.get("coins", [])]


def get_coin_details(coin_id: str) -> Dict:
    """Retrieve metadata for a coin by id."""

    url = f"{COINGECKO_API}/coins/{coin_id}"
    resp = requests.get(url, timeout=10)
    resp.raise_for_status()
    return resp.json()


def score_token(details: Dict) -> float:
    """Compute a simple heuristic score for a coin."""

    market_data = details.get("market_data", {})
    price_change = market_data.get("price_change_percentage_24h", 0)
    market_cap = market_data.get("market_cap", {}).get("usd", 0)
    supply = market_data.get("circulating_supply", 0)

    score = 0.0
    if price_change is not None:
        score += max(0.0, float(price_change))
    if market_cap and market_cap < 50_000_000:
        score += 20
    if supply and supply < 1_000_000_000:
        score += 10
    return score


def calculate_risk(details: Dict) -> Tuple[float, str]:
    """Return a risk score and label for a coin."""

    market_data = details.get("market_data", {})
    volume = market_data.get("total_volume", {}).get("usd", 0)
    market_cap = market_data.get("market_cap", {}).get("usd", 0)
    price_change = market_data.get("price_change_percentage_24h", 0) or 0
    genesis = details.get("genesis_date")

    risk = 0.0
    if volume < 1_000_000:
        risk += 20
    if volume < 100_000:
        risk += 20
    if market_cap < 10_000_000:
        risk += 20
    if market_cap < 1_000_000:
        risk += 20
    if abs(float(price_change)) > 50:
        risk += 20
    if genesis:
        try:
            coin_ts = time.strptime(genesis, "%Y-%m-%d")
            age_days = (time.time() - time.mktime(coin_ts)) / 86400
            if age_days < 30:
                risk += 20
        except ValueError:
            pass

    if risk < 40:
        label = "low"
    elif risk < 80:
        label = "medium"
    else:
        label = "high"
    return risk, label


def find_potential_memes(threshold: float = 25.0, limit: int = 10) -> List[Dict]:
    """Return a list of Solana tokens whose score exceeds the threshold."""

    trending = get_trending_coins()
    results = []
    for item in trending:
        coin_id = item.get("id")
        details = get_coin_details(coin_id)
        platforms = details.get("platforms", {})
        if "solana" not in platforms:
            continue
        score = score_token(details)
        risk, label = calculate_risk(details)
        if score >= threshold:
            results.append({
                "name": item.get("name"),
                "symbol": item.get("symbol"),
                "score": score,
                "risk": risk,
                "risk_label": label,
                "url": f"https://www.coingecko.com/en/coins/{coin_id}"
            })
        if len(results) >= limit:
            break
        time.sleep(1)  # avoid spamming the API
    return results


def _print_candidates(candidates: List[Dict], ts: str | None = None, log=None) -> None:
    """Helper to print and optionally log the list of candidates."""

    if not candidates:
        prefix = f"[{ts}] " if ts else ""
        print(f"{prefix}No high-potential Solana memecoins found in trending list.")
        return

    header = f"[{ts}] Potential Solana Memecoins:" if ts else "Potential Solana Memecoins:" 
    print(header)
    for c in candidates:
        line = (
            f"{c['name']} ({c['symbol']}): score {c['score']:.2f}"
            f" - risk {c['risk_label']}\n{c['url']}"
        )
        print(line)
        if log:
            log.write(
                f"{ts} - {c['name']} ({c['symbol']}): {c['risk_label']} risk - {c['url']}\n"
            )


def main(argv: List[str] | None = None) -> None:
    """Entry point for the command line interface."""

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--threshold", type=float, default=25.0, help="score required to report a coin")
    parser.add_argument("--limit", type=int, default=10, help="maximum number of results")
    parser.add_argument("--interval", type=int, help="run continuously with this interval in seconds")
    args = parser.parse_args(argv)

    def run_once(timestamp: str | None = None, log=None):
        candidates = find_potential_memes(threshold=args.threshold, limit=args.limit)
        _print_candidates(candidates, ts=timestamp, log=log)

    if args.interval:
        while True:
            ts = time.strftime("%Y-%m-%d %H:%M:%S")
            with open("memecoin_log.txt", "a") as log:
                run_once(timestamp=ts, log=log)
            time.sleep(args.interval)
    else:
        run_once()


if __name__ == "__main__":
    main()
