import * as Dialog from '@radix-ui/react-dialog';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import type { ReactNode } from 'react';

export function Field({
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
        <div className="pa-editor-field">
            <label
                className="pa-editor-label"
                htmlFor={id}
            >
                {label}
            </label>

            {children}

            {error && (
                <p
                    id={`${id}-error`}
                    className="pa-editor-error"
                    role="alert"
                >
                    {error}
                </p>
            )}
        </div>
    );
}

export function SkillModal({
    open,
    onOpenChange,
    title,
    description,
    children,
    busy = false,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: ReactNode;
    busy?: boolean;
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
                    className="pa-sk-modal-overlay"
                />

                <Dialog.Content
                    className="pa-sk-modal"
                    aria-describedby={
                        description
                            ? 'pa-sk-modal-description'
                            : undefined
                    }
                >
                    <div className="pa-sk-modal__header">
                        <div>
                            <Dialog.Title
                                className="pa-sk-modal__title"
                            >
                                {title}
                            </Dialog.Title>

                            {description && (
                                <Dialog.Description
                                    id="pa-sk-modal-description"
                                    className="pa-sk-muted"
                                >
                                    {description}
                                </Dialog.Description>
                            )}
                        </div>

                        <Dialog.Close
                            className="pa-sk-icon-button"
                            disabled={busy}
                            aria-label="Tutup modal"
                        >
                            <X size={18} />
                        </Dialog.Close>
                    </div>

                    <div className="pa-sk-modal__body">
                        {children}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

export function SortableRow({
    id,
    label,
    children,
}: {
    id: number;
    label: string;
    children: ReactNode;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    return (
        <div
            ref={setNodeRef}
            className={
                `pa-sk-row${
                    isDragging
                        ? ' pa-sk-row--dragging'
                        : ''
                }`
            }
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
        >
            <button
                type="button"
                className="pa-sk-drag-handle"
                aria-label={`Geser urutan ${label}`}
                title="Geser untuk mengubah urutan"
                {...attributes}
                {...listeners}
            >
                <GripVertical size={18} />
            </button>

            {children}
        </div>
    );
}

export function Flash({
    message,
}: {
    message?: string | null;
}) {
    if (!message) return null;

    return (
        <div
            role="status"
            className="pa-editor-success"
        >
            {message}
        </div>
    );
}