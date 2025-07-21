"""Run multiple tracker instances in parallel."""

import argparse
from concurrent.futures import ProcessPoolExecutor

from memecoin_tracker import main as tracker_main


def run_parallel(workers: int, interval: int, threshold: float, limit: int) -> None:
    """Launch several tracker processes with the given options."""

    args = ["--interval", str(interval), "--threshold", str(threshold), "--limit", str(limit)]
    with ProcessPoolExecutor(max_workers=workers) as exe:
        for _ in range(workers):
            exe.submit(tracker_main, args)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--workers", type=int, default=2, help="number of parallel trackers")
    parser.add_argument("--interval", type=int, default=3600, help="seconds between checks")
    parser.add_argument("--threshold", type=float, default=25.0, help="score required")
    parser.add_argument("--limit", type=int, default=10, help="max results")
    args = parser.parse_args()
    run_parallel(args.workers, args.interval, args.threshold, args.limit)
