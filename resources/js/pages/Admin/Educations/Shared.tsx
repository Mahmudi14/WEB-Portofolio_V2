import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';

import {
    Check,
    ChevronDown,
    GraduationCap,
    X,
} from 'lucide-react';

import type { ReactNode } from 'react';

// ==========================================
// TYPES
// ==========================================

export type Education = {
    id: number;
    personal_information_id: number;
    level: string;
    institution_name: string;
    major: string | null;
    start_year: number;
    end_year: number | null;
    is_current: boolean;
};

export type EducationForm = {
    level: string;
    institution_name: string;
    major: string;
    start_year: number | '';
    end_year: number | '';
    is_current: boolean;
};

export type EducationErrors = Partial<
    Record<keyof EducationForm, string>
>;

export const levels = [
    { value: 'SD', label: 'SD' },
    { value: 'SMP', label: 'SMP' },
    { value: 'SMA', label: 'SMA / SMK' },
    { value: 'D3', label: 'Diploma 3 (D3)' },
    { value: 'D4', label: 'Diploma 4 (D4)' },
    { value: 'S1', label: 'Sarjana (S1)' },
    { value: 'S2', label: 'Magister (S2)' },
    { value: 'S3', label: 'Doktor (S3)' },
];

export function emptyEducation(): EducationForm {
    return {
        level: '',
        institution_name: '',
        major: '',
        start_year: '',
        end_year: '',
        is_current: false,
    };
}

export function educationPeriod(
    education: Education
): string {
    if (education.is_current) {
        return `${education.start_year} – Sekarang`;
    }

    return education.end_year !== null
        ? `${education.start_year} – ${education.end_year}`
        : String(education.start_year);
}

// ==========================================
// FIELD
// ==========================================

function Field({
    id,
    label,
    error,
    children,
}: {
    id: string;
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div className="pa-edu2-field">
            <label htmlFor={id}>{label}</label>

            {children}

            {error && (
                <p className="pa-edu2-error" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

// ==========================================
// CUSTOM SELECT
// ==========================================

function LevelSelect({
    id,
    value,
    onChange,
}: {
    id: string;
    value: string;
    onChange: (level: string) => void;
}) {
    return (
        <Select.Root
            value={value}
            onValueChange={onChange}
            required
        >
            <Select.Trigger
                id={id}
                className="pa-edu2-select"
            >
                <span className="pa-edu2-select-value">
                    <GraduationCap size={17} />

                    <Select.Value
                        placeholder="Pilih jenjang pendidikan"
                    />
                </span>

                <Select.Icon
                    className="pa-edu2-select-arrow"
                >
                    <ChevronDown size={16} />
                </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
                <Select.Content
                    className="pa-edu2-select-content"
                    position="popper"
                    sideOffset={7}
                    collisionPadding={8}
                >
                    <Select.Viewport
                        className="pa-edu2-select-viewport"
                    >
                        {levels.map((level) => (
                            <Select.Item
                                key={level.value}
                                value={level.value}
                                className="pa-edu2-select-item"
                            >
                                <GraduationCap size={16} />

                                <Select.ItemText>
                                    {level.label}
                                </Select.ItemText>

                                <Select.ItemIndicator
                                    className="pa-edu2-select-check"
                                >
                                    <Check size={15} />
                                </Select.ItemIndicator>
                            </Select.Item>
                        ))}
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    );
}

// ==========================================
// FORM FIELDS
// ==========================================

export function EducationFields({
    prefix,
    data,
    errors,
    onChange,
}: {
    prefix: string;
    data: EducationForm;
    errors: EducationErrors;
    onChange: (
        patch: Partial<EducationForm>
    ) => void;
}) {
    const currentYear = new Date().getFullYear();

    return (
        <div className="pa-edu2-fields">
            <Field
                id={`${prefix}-level`}
                label="Jenjang Pendidikan"
                error={errors.level}
            >
                <LevelSelect
                    id={`${prefix}-level`}
                    value={data.level}
                    onChange={(level) =>
                        onChange({ level })
                    }
                />
            </Field>

            <Field
                id={`${prefix}-institution`}
                label="Nama Institusi"
                error={errors.institution_name}
            >
                <input
                    id={`${prefix}-institution`}
                    required
                    maxLength={200}
                    value={data.institution_name}
                    placeholder="Contoh: Universitas Sulawesi Barat"
                    onChange={(event) =>
                        onChange({
                            institution_name:
                                event.target.value,
                        })
                    }
                />
            </Field>

            <Field
                id={`${prefix}-major`}
                label="Jurusan / Program Studi (Opsional)"
                error={errors.major}
            >
                <input
                    id={`${prefix}-major`}
                    maxLength={150}
                    value={data.major}
                    placeholder="Contoh: Teknik Informatika"
                    onChange={(event) =>
                        onChange({
                            major: event.target.value,
                        })
                    }
                />
            </Field>

            <div className="pa-edu2-years">
                <Field
                    id={`${prefix}-start`}
                    label="Tahun Mulai"
                    error={errors.start_year}
                >
                    <input
                        id={`${prefix}-start`}
                        type="number"
                        inputMode="numeric"
                        min={1900}
                        max={currentYear}
                        step={1}
                        required
                        value={data.start_year}
                        placeholder="2022"
                        onChange={(event) =>
                            onChange({
                                start_year:
                                    event.target.value === ''
                                        ? ''
                                        : Number(
                                            event.target.value
                                        ),
                            })
                        }
                    />
                </Field>

                <Field
                    id={`${prefix}-end`}
                    label="Tahun Selesai"
                    error={errors.end_year}
                >
                    <input
                        id={`${prefix}-end`}
                        type="number"
                        inputMode="numeric"
                        min={1900}
                        max={currentYear}
                        step={1}
                        disabled={data.is_current}
                        value={
                            data.is_current
                                ? ''
                                : data.end_year
                        }
                        placeholder={
                            data.is_current
                                ? 'Sekarang'
                                : '2026'
                        }
                        onChange={(event) =>
                            onChange({
                                end_year:
                                    event.target.value === ''
                                        ? ''
                                        : Number(
                                            event.target.value
                                        ),
                            })
                        }
                    />
                </Field>
            </div>

            <label className="pa-edu2-current">
                <input
                    type="checkbox"
                    checked={data.is_current}
                    onChange={(event) =>
                        onChange({
                            is_current: event.target.checked,
                            end_year: event.target.checked
                                ? ''
                                : data.end_year,
                        })
                    }
                />

                <span>
                    <strong>Masih menempuh pendidikan</strong>
                    <small>
                        Tahun selesai otomatis dikosongkan
                        dan ditampilkan sebagai Sekarang.
                    </small>
                </span>
            </label>

            {errors.is_current && (
                <p className="pa-edu2-error">
                    {errors.is_current}
                </p>
            )}
        </div>
    );
}

// ==========================================
// MODAL
// ==========================================

export function EducationModal({
    open,
    onOpenChange,
    title,
    description,
    busy = false,
    children,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    busy?: boolean;
    children: ReactNode;
}) {
    return (
        <Dialog.Root
            open={open}
            onOpenChange={(next) => {
                if (!busy) onOpenChange(next);
            }}
        >
            <Dialog.Portal>
                <Dialog.Overlay
                    className="pa-edu2-overlay"
                />

                <Dialog.Content className="pa-edu2-modal">
                    <div className="pa-edu2-modal-header">
                        <div>
                            <Dialog.Title>
                                {title}
                            </Dialog.Title>

                            <Dialog.Description>
                                {description}
                            </Dialog.Description>
                        </div>

                        <Dialog.Close
                            type="button"
                            disabled={busy}
                            className="pa-edu2-modal-close"
                            aria-label="Tutup"
                        >
                            <X size={18} />
                        </Dialog.Close>
                    </div>

                    <div className="pa-edu2-modal-body">
                        {children}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}