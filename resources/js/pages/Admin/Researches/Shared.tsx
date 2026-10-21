import * as Dialog from '@radix-ui/react-dialog';

import { X } from 'lucide-react';

import type { ReactNode } from 'react';

// ==========================================
// TYPES
// ==========================================

export type Research = {
    id: number;
    title: string;
    summary: string;
    year: number;
    sort_order: number;
};

export type ResearchForm = {
    title: string;
    summary: string;
    year: number | '';
};

export type ResearchErrors = Partial<
    Record<keyof ResearchForm, string>
>;

export function emptyResearch(): ResearchForm {
    return {
        title: '',
        summary: '',
        year: '',
    };
}

export function sortResearches(
    researches: Research[]
): Research[] {
    return [...researches].sort(
        (a, b) =>
            a.sort_order - b.sort_order ||
            b.year - a.year ||
            b.id - a.id
    );
}

// ==========================================
// REUSABLE FIELD
// ==========================================

export function ResearchField({
    id,
    label,
    error,
    hint,
    children,
}: {
    id: string;
    label: string;
    error?: string;
    hint?: string;
    children: ReactNode;
}) {
    return (
        <div className="pa-res2-field">
            <label htmlFor={id}>
                {label}
            </label>

            {children}

            {hint && (
                <small>{hint}</small>
            )}

            {error && (
                <p
                    className="pa-res2-error"
                    role="alert"
                    id={`${id}-error`}
                >
                    {error}
                </p>
            )}
        </div>
    );
}

// ==========================================
// REUSABLE FORM FIELDS
// ==========================================

export function ResearchFields({
    prefix,
    data,
    errors,
    onChange,
}: {
    prefix: string;
    data: ResearchForm;
    errors: ResearchErrors;
    onChange: (
        patch: Partial<ResearchForm>
    ) => void;
}) {
    const currentYear = new Date().getFullYear();

    return (
        <div className="pa-res2-fields">
            <ResearchField
                id={`${prefix}-title`}
                label="Judul Penelitian"
                error={errors.title}
            >
                <input
                    id={`${prefix}-title`}
                    type="text"
                    required
                    maxLength={255}
                    value={data.title}
                    aria-invalid={Boolean(errors.title)}
                    placeholder="Contoh: Analisis Sentimen Menggunakan Deep Learning"
                    onChange={(event) =>
                        onChange({
                            title: event.target.value,
                        })
                    }
                />

                <span className="pa-res2-character-count">
                    {data.title.length} / 255 karakter
                </span>
            </ResearchField>

            <ResearchField
                id={`${prefix}-summary`}
                label="Ringkasan Penelitian"
                hint="Tuliskan latar belakang, tujuan, metode, serta hasil penelitian."
                error={errors.summary}
            >
                <textarea
                    id={`${prefix}-summary`}
                    rows={7}
                    required
                    maxLength={15000}
                    value={data.summary}
                    aria-invalid={Boolean(errors.summary)}
                    placeholder="Jelaskan permasalahan yang diteliti, metodologi, hasil, dan kontribusi penelitian..."
                    onChange={(event) =>
                        onChange({
                            summary: event.target.value,
                        })
                    }
                />

                <span className="pa-res2-character-count">
                    {data.summary.length} / 15000 karakter
                </span>
            </ResearchField>

            <ResearchField
                id={`${prefix}-year`}
                label="Tahun Penelitian"
                hint="Gunakan tahun pelaksanaan penelitian."
                error={errors.year}
            >
                <input
                    id={`${prefix}-year`}
                    type="number"
                    inputMode="numeric"
                    required
                    min={1900}
                    max={currentYear}
                    step={1}
                    value={data.year}
                    placeholder={String(currentYear)}
                    aria-invalid={Boolean(errors.year)}
                    onChange={(event) =>
                        onChange({
                            year:
                                event.target.value === ''
                                    ? ''
                                    : Number(
                                        event.target.value
                                    ),
                        })
                    }
                />
            </ResearchField>
        </div>
    );
}

// ==========================================
// MODAL
// ==========================================

export function ResearchModal({
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
                    className="pa-res2-overlay"
                />

                <Dialog.Content
                    className="pa-res2-modal"
                >
                    <div className="pa-res2-modal-header">
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
                            className="pa-res2-modal-close"
                            aria-label="Tutup modal"
                        >
                            <X size={18} />
                        </Dialog.Close>
                    </div>

                    <div className="pa-res2-modal-body">
                        {children}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

// ==========================================
// FLASH MESSAGE
// ==========================================

export function ResearchFlash({
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