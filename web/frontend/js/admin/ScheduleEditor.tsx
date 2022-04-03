import * as React from 'react';
import { FormGroup, FormControl, FormText } from 'react-bootstrap';
import CreatableSelect from 'react-select/lib/Creatable';
import dateFormat from 'date-fns/format';
import dateAddDays from 'date-fns/add_days';
import { DatePrecision, isEmptySchedule, Schedule } from './WorkMetadata';

interface ScheduleEditorProps {
  country: string;
  value: Schedule | null | undefined;
  broadcastOptions: string[];
  onChange(country: string, newSchedule: Schedule | null): any;
}

function toDateString(schedule: Schedule): string {
  if (!schedule.date) {
    return '';
  }
  switch (schedule.datePrecision) {
    case 'YEAR_MONTH':
      return /^\d{4}-\d{2}/.exec(schedule.date)![0];
    case 'DATE':
      return /^\d{4}-\d{2}-\d{2}/.exec(schedule.date)![0];
    case 'DATE_TIME':
      return schedule.date;
    default:
      return schedule.date;
  }
}

interface ParsedDateTime {
  date: string | null;
  datePrecision: DatePrecision | null;
}

function normalizeParsedDateTime(parsed: ParsedDateTime) {
  if (!parsed.date) {
    return parsed;
  }
  const match = parsed.date.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/);
  if (!match) {
    return parsed;
  }
  const [, year, month, day, hour, minute, second] = match;
  const hourNumber = Number(hour);
  if (hourNumber < 24) {
    return parsed;
  }
  const normalizedHour = hourNumber % 24;
  const normalizedHourString = normalizedHour < 10 ? `0${normalizedHour}` : `${normalizedHour}`;
  const date = dateAddDays(`${year}-${month}-${day}T${normalizedHourString}:${minute}:${second}`, Math.floor(hourNumber / 24));
  const normalizedDate = dateFormat(date, 'YYYY-MM-DD[T]HH:mm:ss');
  return { ...parsed, date: normalizedDate };
}

function parseDateString(dateString: string): ParsedDateTime {
  if (/^\d{4}-\d{2}$/.test(dateString)) {
    return {
      date: dateString + "-01T00:00:00",
      datePrecision: 'YEAR_MONTH',
    };
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return {
      date: dateString + "T00:00:00",
      datePrecision: 'DATE',
    };
  } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dateString)) {
    return {
      date: dateString + ":00",
      datePrecision: 'DATE_TIME',
    };
  } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(dateString)) {
    return {
      date: dateString,
      datePrecision: 'DATE_TIME',
    };
  } else if (dateString === '') {
    return {
      date: null,
      datePrecision: null,
    };
  } else {
    return {
      date: dateString,
      datePrecision: null,
    };
  }
}

export class ScheduleEditor extends React.Component<ScheduleEditorProps> {
  render() {
    let { broadcasts = [] } = this.props.value || {};
    if (!broadcasts) broadcasts = [];
    const invalidDate = this.props.value &&
      this.props.value.date != null &&
      this.props.value.datePrecision == null;
    return (
      <FormGroup>
        <div className={invalidDate ? 'has-error' : ''}>
          <FormControl
            value={this.props.value ? toDateString(this.props.value) : ''}
            onChange={this.handleDateChange}
          />
          <FormText>Date is YYYY-MM(-DD(THH:MM:SS))</FormText>
        </div>

        {/* TODO: autocomplete */}
        <CreatableSelect
          isMulti
          options={this.props.broadcastOptions.map(it => ({ label: it, value: it }))}
          value={broadcasts.map(it => ({ label: it, value: it }))}
          onChange={this.handleBroadcastsChange}
          placeholder="Select broadcasts..."
        />
      </FormGroup>
    );
  }

  private handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = e.target;
    const parsed = normalizeParsedDateTime(parseDateString(el.value));
    this.emitValue({
      ...this.props.value,
      date: parsed.date,
      datePrecision: parsed.datePrecision,
    });
  };

  private handleBroadcastsChange = (newOptions: any) => {
    this.emitValue({
      ...this.props.value,
      broadcasts: newOptions.map((it: any) => it.value),
    });
  };

  private emitValue = (schedule: Schedule) => {
    this.props.onChange(this.props.country, isEmptySchedule(schedule) ? null : schedule);
  };
}
