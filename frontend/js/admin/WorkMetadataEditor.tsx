import * as React from 'react';
import { FormGroup, ControlLabel, Checkbox, FormControl, Radio, HelpBlock } from 'react-bootstrap/lib';
import { getCompanies } from './API';
import CreatableSelect from 'react-select/lib/Creatable';
import AsyncCreatableSelect from 'react-select/lib/AsyncCreatable';

const sourceTypesV2 = [
    'MANGA',
    'ORIGINAL',
    'LIGHT_NOVEL',
    'GAME',
    'FOUR_KOMA',
    'VISUAL_NOVEL',
    'NOVEL',
];

interface ScheduleEditorProps {
    country: string;
    value: Schedule;
    onChange(country: string, newSchedule: Schedule): any;
}

type DatePrecision = 'YEAR_MONTH' | 'DATE' | 'DATE_TIME';

interface Schedule {
    date: string | null;
    datePrecision: DatePrecision | null;
    broadcasts: string[] | null;
}

function toDateString(schedule: Schedule): string {
    switch (schedule.datePrecision) {
        case 'YEAR_MONTH':
            return /^\d{4}-\d{2}/.exec(schedule.date)[0];
        case 'DATE':
            return /^\d{4}-\d{2}-\d{2}/.exec(schedule.date)[0];
        case 'DATE_TIME':
            return schedule.date;
    }
}

interface ParsedDateTime {
    date: string | null;
    datePrecision: DatePrecision | null;
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

class ScheduleEditor extends React.Component<ScheduleEditorProps> {
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
                    <HelpBlock>Date is YYYY-MM(-DD(THH:MM:SS))</HelpBlock>
                </div>

                {/* TODO: autocomplete */}
                <CreatableSelect
                    isMulti
                    options={broadcasts.map(it => ({ label: it, value: it }))}
                    value={broadcasts.map(it => ({ label: it, value: it }))}
                    onChange={this.handleBroadcastsChange}
                    placeholder="Select broadcasts..."
                />
            </FormGroup>
        );
    }

    private handleDateChange = (e: React.FormEvent<FormControl>) => {
        const el = e.target as HTMLInputElement;
        const parsed = parseDateString(el.value);
        this.props.onChange(this.props.country, {
            ...this.props.value,
            date: parsed.date,
            datePrecision: parsed.datePrecision,
        });
    };

    private handleBroadcastsChange = (newOptions: any) => {
        this.props.onChange(this.props.country, {
            ...this.props.value,
            broadcasts: newOptions.map((it: any) => it.value),
        });
    };
}

interface WorkMetadata {
    periods?: string[];
    website?: string;
    namuRef?: string;
    annId?: string;
    source?: string;
    studios?: string[];
    durationMinutes?: number;
    schedules?: {[country: string]: Schedule};
    _comment?: string;
}

interface Props {
    metadata: WorkMetadata;
    onChange(newMetadata: WorkMetadata): any;
    onAnnImport(annId: string): any;
}

export default class WorkMetadataEditor extends React.Component<Props> {
    render() {
        const { metadata } = this.props;
        return (
            <>
                <FormGroup>
                    <ControlLabel>AnimeNewsNetwork ID</ControlLabel>
                    <FormControl
                        name="annId"
                        value={metadata.annId || ''}
                        onChange={this.handleAnnIdChange}
                    />
                    <button onClick={this.handleAnnImport} disabled={!metadata.annId}>
                        Import Metadata
                    </button>
                </FormGroup>
                <FormGroup>
                    <ControlLabel>Periods</ControlLabel>
                    {this.renderPeriodCheckboxes()}
                </FormGroup>
                <FormGroup>
                    <ControlLabel>Schedule (JP)</ControlLabel>
                    <ScheduleEditor
                        country="jp"
                        value={metadata.schedules && metadata.schedules['jp']}
                        onChange={this.handleScheduleChange}
                    />
                </FormGroup>
                <FormGroup>
                    <ControlLabel>Schedule (KR)</ControlLabel>
                    <ScheduleEditor
                        country="kr"
                        value={metadata.schedules && metadata.schedules['kr']}
                        onChange={this.handleScheduleChange}
                    />
                </FormGroup>
                <FormGroup>
                    <ControlLabel>Source</ControlLabel>
                    <div>
                        {sourceTypesV2.map(source => (
                            <Radio inline name="source" value={source} checked={metadata.source === source}
                                onChange={this.handleInputChange}>
                                {source}
                            </Radio>
                        ))}
                    </div>
                </FormGroup>
                <FormGroup>
                    <ControlLabel>Studios</ControlLabel>
                    <AsyncCreatableSelect
                        isMulti
                        loadOptions={(q: string) => getCompanies()
                            .then((data: any) => data.filter((it: any) => it.name.toLowerCase().indexOf(q.toLowerCase()) == 0)
                                .map((it: any) => ({ label: it.name, value: it.name })))}
                        defaultOptions
                        cacheOptions
                        filterOption={null}
                        value={(metadata.studios || []).map(it => ({ label: it, value: it }))}
                        onChange={this.handleStudiosChange}
                    />
                </FormGroup>
                <FormGroup>
                    <ControlLabel>Duration (minutes)</ControlLabel>
                    <FormControl
                        name="durationMinutes"
                        value={metadata.durationMinutes || ''}
                        onChange={this.handleInputChange}
                    />
                </FormGroup>
                <FormGroup>
                    <ControlLabel>Website URL</ControlLabel>
                    <FormControl
                        name="website"
                        value={metadata.website || ''}
                        onChange={this.handleInputChange}
                    />
                </FormGroup>
                <FormGroup>
                    <ControlLabel>Namuwiki Reference</ControlLabel>
                    <FormControl
                        name="namuRef"
                        value={metadata.namuRef || ''}
                        onChange={this.handleInputChange}
                    />
                </FormGroup>
            </>
        );
    }

    private renderPeriodCheckboxes() {
        const periods = this.props.metadata.periods || [];
        const currentYear = new Date().getFullYear();
        const lines = [];
        for (var y = 2014; y <= currentYear + 1; y++) {
            const items = [];
            const maxQuarter = y <= currentYear ? 4 : 1;
            for (var q = 1; q <= maxQuarter; q++) {
                const period = `${y}Q${q}`;
                items.push(
                    <Checkbox
                        inline
                        checked={periods.indexOf(period) !== -1}
                        onChange={this.handlePeriodCheckboxChange}
                        value={period}
                    >
                        Q{q}
                    </Checkbox>
                );
            }
            lines.unshift(
                <div key={'y' + y}>
                    <ControlLabel>{y}</ControlLabel>
                    {items}
                </div>
            );
        }
        return lines;
    }

    private handlePeriodCheckboxChange = (e: React.FormEvent<Checkbox>) => {
        const el = e.target as HTMLInputElement;
        const period = el.value;
        let periods = this.props.metadata.periods || [];
        periods = periods.filter(p => p !== period);
        if (el.checked) {
            periods.push(period);
        }
        periods.sort();
        this.props.onChange({ ...this.props.metadata, periods });
    };

    private handleAnnIdChange = (e: React.FormEvent<FormControl>) => {
        const el = e.target as HTMLInputElement;
        const value = el.value.replace(/^https?:\/\/(?:www\.)?animenewsnetwork\.com\/encyclopedia\/anime\.php\?id=([0-9]+)$/, '$1');
        if (value) {
            this.props.onChange({
                ...this.props.metadata,
                annId: value,
            });
        } else {
            const {annId: _, ...rest} = this.props.metadata as any;
            this.props.onChange(rest);
        }
    };

    private handleInputChange = (e: React.FormEvent<FormControl>) => {
        const el = e.target as HTMLInputElement;
        if (el.value) {
            this.props.onChange({
                ...this.props.metadata,
                [el.name]: el.value,
            });
        } else {
            const {[el.name]: _, ...rest} = this.props.metadata as any;
            this.props.onChange(rest);
        }
    };

    private handleStudiosChange = (newOptions: any) => {
        this.props.onChange({
            ...this.props.metadata,
            studios: newOptions.map((it: any) => it.value),
        });
    };

    private handleScheduleChange = (country: string, newSchedule: Schedule) => {
        this.props.onChange({
            ...this.props.metadata,
            schedules: {
                ...this.props.metadata.schedules,
                [country]: newSchedule
            }
        });
    };

    private handleAnnImport = () => {
        this.props.onAnnImport(this.props.metadata.annId);
    };
}
