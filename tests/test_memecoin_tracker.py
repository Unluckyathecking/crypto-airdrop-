import json
import os
import unittest
from unittest.mock import patch, Mock

import memecoin_tracker

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')


def load_json(name):
    with open(os.path.join(DATA_DIR, name), 'r') as f:
        return json.load(f)


class TestMemecoinTracker(unittest.TestCase):
    def setUp(self):
        self.trending = load_json('trending.json')
        self.coin_sol = load_json('coin_sol.json')
        self.coin_non_sol = load_json('coin_non_sol.json')

    def fake_get(self, url, timeout=10):
        mock_resp = Mock()
        if 'search/trending' in url:
            mock_resp.json.return_value = self.trending
        elif 'solana-coin' in url:
            mock_resp.json.return_value = self.coin_sol
        else:
            mock_resp.json.return_value = self.coin_non_sol
        mock_resp.raise_for_status = lambda: None
        return mock_resp

    @patch('requests.get')
    def test_find_potential_memes(self, mock_get):
        mock_get.side_effect = self.fake_get
        result = memecoin_tracker.find_potential_memes(threshold=20, limit=5)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['name'], 'SolanaCoin')
        self.assertIn('solana', result[0]['url'])
        self.assertEqual(result[0]['risk_label'], 'medium')

    @patch('requests.get')
    def test_cli_once(self, mock_get):
        mock_get.side_effect = self.fake_get
        memecoin_tracker.main(['--threshold', '20', '--limit', '5'])

    def test_calculate_risk(self):
        risk, label = memecoin_tracker.calculate_risk(self.coin_sol)
        self.assertTrue(risk > 0)
        self.assertEqual(label, 'medium')


if __name__ == '__main__':
    unittest.main()
