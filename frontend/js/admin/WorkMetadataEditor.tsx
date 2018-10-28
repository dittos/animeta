import * as React from 'react';
import { FormGroup, ControlLabel, Checkbox, FormControl, Radio, HelpBlock } from 'react-bootstrap/lib';
import { SOURCE_TYPE_MAP } from '../util';
import { getCompanies } from './API';
import CreatableSelect from 'react-select/lib/Creatable';
import AsyncCreatableSelect from 'react-select/lib/AsyncCreatable';

type MultiString = string | string[];

function readStringList(itemOrArray?: MultiString): string[] {
    if (!itemOrArray) {
        return [];
    }
    if (itemOrArray instanceof Array) {
        return itemOrArray;
    } else {
        return [itemOrArray];
    }
}

function writeStringList(items: string[]): MultiString {
    if (items.length === 1) {
        return items[0];
    } else {
        return items;
    }
}

interface ScheduleEditorProps {
    name: string;
    value: Schedule;
    onChange(name: string, newSchedule: Schedule): any;
}

interface Schedule {
    date?: string;
    broadcasts: string[];
}

class ScheduleEditor extends React.Component<ScheduleEditorProps> {
    render() {
        const { date, broadcasts } = this.props.value;
        return (
            <FormGroup>
                <FormControl value={date} onChange={this.handleDateChange} />
                <HelpBlock>Date is (YYYY-)MM-DD (HH:MM)</HelpBlock>

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
        this.props.onChange(this.props.name, {
            ...this.props.value,
            date: el.value,
        });
    };

    private handleBroadcastsChange = (newOptions: any) => {
        this.props.onChange(this.props.name, {
            ...this.props.value,
            broadcasts: newOptions.map((it: any) => it.value),
        });
    };
}

type RawSchedule = string | [MultiString] | [string, MultiString];

function parseSchedule(value: RawSchedule): Schedule {
    let date = '', broadcasts: string[] = [];
    if (value) {
        if (value instanceof Array) {
            if (value.length === 1) {
                broadcasts = readStringList(value[0]);
            } else {
                const v = value as [string, MultiString];
                date = v[0];
                broadcasts = readStringList(v[1]);
            }
        } else {
            date = value;
        }
    }
    return { date, broadcasts };
}

interface WorkMetadata {
    periods?: MultiString;
    website?: string;
    namu_ref?: string;
    ann_id?: string;
    source?: string;
    studio?: MultiString;
    duration?: string;
    schedule?: RawSchedule;
    schedule_kr?: RawSchedule;
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
                    <ControlLabel>Periods</ControlLabel>
                    {this.renderPeriodCheckboxes()}
                </FormGroup>
                <FormGroup>
                    <ControlLabel>Schedule (JP)</ControlLabel>
                    <ScheduleEditor
                        name="schedule"
                        value={parseSchedule(metadata.schedule)}
                        onChange={this.handleScheduleChange}
                    />
                </FormGroup>
                <FormGroup>
                    <ControlLabel>Schedule (KR)</ControlLabel>
                    <ScheduleEditor
                        name="schedule_kr"
                        value={parseSchedule(metadata.schedule_kr)}
                        onChange={this.handleScheduleChange}
                    />
                </FormGroup>
                <FormGroup>
                    <ControlLabel>Source</ControlLabel>
                    <div>
                        {Object.keys(SOURCE_TYPE_MAP).map(source => (
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
                        value={readStringList(metadata.studio).map(it => ({ label: it, value: it }))}
                        onChange={this.handleStudiosChange}
                    />
                </FormGroup>
                <FormGroup>
                    <ControlLabel>Duration (minutes)</ControlLabel>
                    <FormControl
                        name="duration"
                        value={metadata.duration || ''}
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
                        name="namu_ref"
                        value={metadata.namu_ref || ''}
                        onChange={this.handleInputChange}
                    />
                </FormGroup>
                <FormGroup>
                    <ControlLabel>AnimeNewsNetwork ID</ControlLabel>
                    <FormControl
                        name="ann_id"
                        value={metadata.ann_id || ''}
                        onChange={this.handleInputChange}
                    />
                    <button onClick={this.handleAnnImport} disabled={!metadata.ann_id}>
                        Import Metadata
                    </button>
                </FormGroup>
                <FormGroup>
                    <ControlLabel>Comment</ControlLabel>
                    <FormControl
                        componentClass="textarea"
                        name="_comment"
                        value={metadata._comment || ''}
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
        let periods = readStringList(this.props.metadata.periods);
        periods = periods.filter(p => p !== period);
        if (el.checked) {
            periods.push(period);
        }
        periods.sort();
        this.props.onChange({ ...this.props.metadata, periods });
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
            studio: writeStringList(newOptions.map((it: any) => it.value)),
        });
    };

    private handleScheduleChange = (name: string, newSchedule: Schedule) => {
        let serialized: RawSchedule;
        if (newSchedule.date && newSchedule.broadcasts.length > 0) {
            serialized = [newSchedule.date, writeStringList(newSchedule.broadcasts)];
        } else if (newSchedule.broadcasts.length > 0) {
            serialized = [writeStringList(newSchedule.broadcasts)];
        } else if (newSchedule.date) {
            serialized = newSchedule.date;
        }
        if (serialized) {
            this.props.onChange({
                ...this.props.metadata,
                [name]: serialized,
            });
        } else {
            const {[name]: _, ...rest} = this.props.metadata as any;
            this.props.onChange(rest);
        }
    };

    private handleAnnImport = () => {
        this.props.onAnnImport(this.props.metadata.ann_id);
    };
}
