import unittest

from utils import prev_month, month_range

class ChartPeriodTest(unittest.TestCase):
	def test_prev_month(self):
		self.assertEqual((2010, 7), prev_month(2010, 8))
		self.assertEqual((2009, 12), prev_month(2010, 1))

	def test_month_range(self):
		a, b = month_range(2010, 8)
		self.assertEqual((2010, 8, 1), (a.year, a.month, a.day))
		self.assertEqual((0, 0, 0), (a.hour, a.minute, a.second))
		self.assertEqual((2010, 8, 31), (b.year, b.month, b.day))
		self.assertEqual((23, 59, 59), (b.hour, b.minute, b.second))

if __name__ == '__main__':
	unittest.main()
