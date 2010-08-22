import datetime
import calendar

def prev_month(y, m):
	if m == 1:
		return (y - 1, 12)
	else:
		return (y, m - 1)

def month_range(y, m):
	_, ndays = calendar.monthrange(y, m)
	return (datetime.datetime(y, m, 1),
			datetime.datetime(y, m, ndays, 23, 59, 59))
