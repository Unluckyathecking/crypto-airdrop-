# Crypto Airdrop Tools

This repository contains utilities for finding early Solana-based memecoins. The scripts
fetch trending tokens from CoinGecko, apply a heuristic scoring model, and estimate a risk
level based on volume, market cap, price volatility and token age. Results can be logged
continuously or run in parallel for higher coverage.

## Requirements

Install dependencies:

```bash
pip3 install -r requirements.txt
```

## Usage

Run the tracker once to print any promising coins:

```bash
python3 memecoin_tracker.py
```

Each result includes a score and a risk level (``low``, ``medium`` or ``high``)
to assist with basic risk management.

To run continuously, pass an interval in seconds. Results will be appended to
`memecoin_log.txt`:

```bash
python3 memecoin_tracker.py --interval 3600
```

To run several tracker processes simultaneously, use ``tracker_pool.py``:

```bash
python3 tracker_pool.py --workers 4 --interval 3600
```

The legacy helper `run_tracker.py` is kept for compatibility and accepts the
same `--interval` option.

### Docker

Build and run the tracker in a container:

```bash
docker build -t memecoin-tracker .
docker run -it memecoin-tracker
```

## Tests

Run the unit tests with:

```bash
python3 -m unittest
```

The tests use sample historical data stored under `tests/data` to validate the scoring and filtering logic.
