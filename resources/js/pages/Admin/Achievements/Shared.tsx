import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';

import {
    Award,
    BadgeCheck,
    Check,
    ChevronDown,
    Layers3,
    Medal,
    X,
} from 'lucide-react';

import type { ReactNode } from 'react';

// ==========================================
// TYPES
// ==========================================

export type AchievementCategory =
    | 'prestasi'
    | 'penghargaan'
    | 'sertifikasi'
    | 'lainnya';

export type Achievement = {
    id: number;
    category: AchievementCategory;
    title: string;
    description: string | null;
    year: number;
    institution_name: string | null;
    sort_order: number;
};

export type AchievementForm = {
    category: AchievementCategory | '';
    title: string;
    description: string;
    year: number | '';
    institution_name: string;
    sort_order: number;
};

export type AchievementErrors = Partial<
    Record<keyof AchievementForm, string>
>;

export const categoryNames: Record<
    AchievementCategory,
    string
> = {
    prestasi: 'Prestasi',
    penghargaan: 'Penghargaan',
    sertifikasi: 'Sertifikasi',
    lainnya: 'Lainnya',
};

export const categoryOptions = [
    { value: 'prestasi', label: 'Prestasi', icon: Medal },
    { value: 'penghargaan', label: 'Penghargaan', icon: Award },
    { value: 'sertifikasi', label: 'Sertifikasi', icon: BadgeCheck },
    { value: 'lainnya', label: 'Lainnya', icon: Layers3 },
] as const;

export function emptyAchievement(): AchievementForm {
    return {
        category: '',
        title: '',
        description: '',
        year: '',
        institution_name: '',
        sort_order: 0,
    };
}

export function sortAchievements(
    achievements: Achievement[]
): Achievement[] {
    return [...achievements].sort(
        (a, b) =>
            a.sort_order - b.sort_order ||
            b.year - a.year ||
            b.id - a.id
    );
}

// ==========================================
// FIELD
// ==========================================

export function AchievementField({
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
        <div className="pa-ach2-field">
            <label htmlFor={id}>
                {label}
            </label>

            {children}

            {error && (
                <p
                    className="pa-ach2-error"
                    role="alert"
                >
                    {error}
                </p>
            )}
        </div>
    );
}

// ==========================================
// CUSTOM DROPDOWN
// ==========================================

function AchievementCategorySelect({
    id,
    value,
    onChange,
}: {
    id: string;
    value: AchievementForm['category'];
    onChange: (
        value: AchievementCategory
    ) => void;
}) {
    const selected = categoryOptions.find(
        (option) => option.value === value
    );

    const SelectedIcon = selected?.icon;

    return (
        <Select.Root
            value={value}
            onValueChange={(next) =>
                onChange(
                    next as AchievementCategory
                )
            }
            required
        >
            <Select.Trigger
                id={id}
                className="pa-ach2-select"
            >
                <span className="pa-ach2-select-value">
                    {SelectedIcon && (
                        <SelectedIcon size={16} />
                    )}

                    <Select.Value
                        placeholder="Pilih kategori pencapaian"
                    />
                </span>

                <Select.Icon
                    className="pa-ach2-select-arrow"
                >
                    <ChevronDown size={16} />
                </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
                <Select.Content
                    className="pa-ach2-select-content"
                    position="popper"
                    sideOffset={6}
                    collisionPadding={10}
                >
                    <Select.Viewport
                        className="pa-ach2-select-viewport"
                    >
                        {categoryOptions.map(
                            (option) => {
                                const Icon = option.icon;

                                return (
                                    <Select.Item
                                        key={option.value}
                                        value={option.value}
                                        className="pa-ach2-select-item"
                                    >
                                        <Icon
                                            size={16}
                                            className="pa-ach2-option-icon"
                                        />

                                        <Select.ItemText>
                                            {option.label}
                                        </Select.ItemText>

                                        <Select.ItemIndicator
                                            className="pa-ach2-option-check"
                                        >
                                            <Check size={15} />
                                        </Select.ItemIndicator>
                                    </Select.Item>
                                );
                            }
                        )}
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    );
}

// ==========================================
// REUSABLE FORM FIELDS
// ==========================================

export function AchievementFields({
    prefix,
    data,
    errors,
    onChange,
}: {
    prefix: string;
    data: AchievementForm;
    errors: AchievementErrors;
    onChange: (
        values: Partial<AchievementForm>
    ) => void;
}) {
    const currentYear = new Date().getFullYear();

    return (
        <div className="pa-ach2-fields">
            <AchievementField
                id={`${prefix}-category`}
                label="Kategori Pencapaian"
                error={errors.category}
            >
                <AchievementCategorySelect
                    id={`${prefix}-category`}
                    value={data.category}
                    onChange={(category) =>
                        onChange({ category })
                    }
                />
            </AchievementField>

            <AchievementField
                id={`${prefix}-title`}
                label="Judul Pencapaian"
                error={errors.title}
            >
                <input
                    id={`${prefix}-title`}
                    required
                    maxLength={200}
                    value={data.title}
                    placeholder="Contoh: Juara 1 Kompetisi Web Design"
                    onChange={(e) =>
                        onChange({
                            title: e.target.value,
                        })
                    }
                />
            </AchievementField>

            <AchievementField
                id={`${prefix}-institution`}
                label="Penyelenggara / Institusi (Opsional)"
                error={errors.institution_name}
            >
                <input
                    id={`${prefix}-institution`}
                    maxLength={200}
                    value={data.institution_name}
                    placeholder="Nama lembaga atau penyelenggara"
                    onChange={(e) =>
                        onChange({
                            institution_name:
                                e.target.value,
                        })
                    }
                />
            </AchievementField>

            <AchievementField
                id={`${prefix}-year`}
                label="Tahun Pencapaian"
                error={errors.year}
            >
                <input
                    id={`${prefix}-year`}
                    type="number"
                    inputMode="numeric"
                    min={1900}
                    max={currentYear}
                    step={1}
                    required
                    placeholder={String(currentYear)}
                    value={data.year}
                    onChange={(e) =>
                        onChange({
                            year:
                                e.target.value === ''
                                    ? ''
                                    : Number(e.target.value),
                        })
                    }
                />
            </AchievementField>

            <AchievementField
                id={`${prefix}-description`}
                label="Deskripsi Pencapaian (Opsional)"
                error={errors.description}
            >
                <textarea
                    id={`${prefix}-description`}
                    rows={5}
                    maxLength={10000}
                    value={data.description}
                    placeholder="Jelaskan pencapaian dan hasil yang diraih..."
                    onChange={(e) =>
                        onChange({
                            description: e.target.value,
                        })
                    }
                />

                <small className="pa-ach2-counter">
                    {data.description.length} / 10000 karakter
                </small>
            </AchievementField>
        </div>
    );
}

// ==========================================
// MODAL
// ==========================================

export function AchievementModal({
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
                    className="pa-ach2-overlay"
                />

                <Dialog.Content
                    className="pa-ach2-modal"
                >
                    <div className="pa-ach2-modal-header">
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
                            className="pa-ach2-close"
                            aria-label="Tutup modal"
                        >
                            <X size={18} />
                        </Dialog.Close>
                    </div>

                    <div className="pa-ach2-modal-body">
                        {children}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

// ==========================================
// SUCCESS MESSAGE
// ==========================================

export function AchievementFlash({
    message,
}: {
    message?: string | null;
}) {
    if (!message) return null;

    return (
        <div
            className="pa-editor-success"
            role="status"
        >
            {message}
        </div>
    );
}