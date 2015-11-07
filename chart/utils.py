# -*- coding: utf-8 -*-

import datetime
import calendar


class ChartRange(object):
    @classmethod
    def last(cls):
        return cls.this().prev()

    @property
    def start(self):
        return self.range[0]

    @property
    def end(self):
        return self.range[1]


class Month(ChartRange):
    def __init__(self, year, month):
        self.year = year
        self.month = month

    @staticmethod
    def this():
        today = datetime.date.today()
        return Month(today.year, today.month)

    def prev(self):
        if self.month == 1:
            return Month(self.year - 1, 12)
        else:
            return Month(self.year, self.month - 1)

    @property
    def range(self):
        _, ndays = calendar.monthrange(self.year, self.month)
        return (datetime.date(self.year, self.month, 1),
                datetime.date(self.year, self.month, ndays))


class Week(ChartRange):
    def __init__(self, sunday):
        self.sunday = sunday

    @staticmethod
    def this():
        today = datetime.date.today()
        # datetime 모듈은 ISO weekday system을 사용하므로 월요일이 1, 일요일이 7
        # 일요일을 0, 토요일을 6으로 맞추기 위해 변환한다.
        weekday = today.isoweekday()
        if weekday == 7:
            weekday = 0
        sunday = today - datetime.timedelta(days=weekday)
        return Week(sunday)

    def prev(self):
        return Week(self.sunday - datetime.timedelta(days=7))

    @property
    def range(self):
        saturday = self.sunday + datetime.timedelta(days=6)
        return (self.sunday, saturday)
