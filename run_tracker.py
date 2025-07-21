"""Legacy runner that periodically invokes :mod:`memecoin_tracker`."""

import argparse
import time
from memecoin_tracker import main as tracker_main


def run(interval: int = 3600) -> None:
    """Run ``memecoin_tracker`` continuously at the given interval."""

    args = ["--interval", str(interval)]
    tracker_main(args)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--interval", type=int, default=3600,
                        help="seconds between checks")
    args = parser.parse_args()
    run(args.interval)
