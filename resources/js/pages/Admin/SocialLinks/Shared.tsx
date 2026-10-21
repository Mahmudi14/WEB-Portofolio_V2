import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';

import {
    AtSign,
    Check,
    ChevronDown,
    ExternalLink,
    Facebook,
    Github,
    Globe2,
    Instagram,
    Linkedin,
    Mail,
    MessageCircle,
    Music2,
    Twitter,
    Youtube,
    X,
} from 'lucide-react';

import {
    useState,
} from 'react';

import type {
    ReactNode,
} from 'react';

import type {
    SocialLink,
    SocialLinkForm,
} from './types';

import {
    validSocialUrl,
} from './types';

// ==========================================
// DAFTAR PLATFORM
// ==========================================

export const platformOptions = [
    {
        value: 'GitHub',
        label: 'GitHub',
        icon: Github,
    },
    {
        value: 'LinkedIn',
        label: 'LinkedIn',
        icon: Linkedin,
    },
    {
        value: 'Instagram',
        label: 'Instagram',
        icon: Instagram,
    },
    {
        value: 'YouTube',
        label: 'YouTube',
        icon: Youtube,
    },
    {
        value: 'TikTok',
        label: 'TikTok',
        icon: Music2,
    },
    {
        value: 'Facebook',
        label: 'Facebook',
        icon: Facebook,
    },
    {
        value: 'X / Twitter',
        label: 'X / Twitter',
        icon: Twitter,
    },
    {
        value: 'WhatsApp',
        label: 'WhatsApp',
        icon: MessageCircle,
    },
    {
        value: 'Threads',
        label: 'Threads',
        icon: AtSign,
    },
    {
        value: 'Email',
        label: 'Email',
        icon: Mail,
    },
    {
        value: 'Website',
        label: 'Website',
        icon: Globe2,
    },
] as const;

function findPlatform(value: string) {
    return platformOptions.find(
        (option) =>
            option.value.toLowerCase() ===
            value.toLowerCase()
    );
}

export function PlatformIcon({
    platform,
    size = 18,
}: {
    platform: string;
    size?: number;
}) {
    const option = findPlatform(platform);

    const Icon = option?.icon ?? Globe2;

    return <Icon size={size} />;
}

// ==========================================
// FIELD
// ==========================================

export function SocialField({
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
        <div className="pa-soc2-field">
            <label htmlFor={id}>
                {label}
            </label>

            {children}

            {hint && (
                <small>{hint}</small>
            )}

            {error && (
                <p
                    className="pa-soc2-error"
                    role="alert"
                >
                    {error}
                </p>
            )}
        </div>
    );
}

// ==========================================
// CUSTOM SELECT PLATFORM
// ==========================================

function PlatformSelect({
    id,
    value,
    error,
    onChange,
}: {
    id: string;
    value: string;
    error?: string;
    onChange: (value: string) => void;
}) {
    const [customMode, setCustomMode] =
        useState(
            Boolean(value && !findPlatform(value))
        );

    const known = findPlatform(value);

    const isCustom =
        customMode ||
        Boolean(value && !known);

    const selectedValue = isCustom
        ? 'custom'
        : known?.value ?? '';

    const SelectedIcon = known?.icon;

    function selectPlatform(next: string) {
        if (next === 'custom') {
            setCustomMode(true);
            onChange('');
        } else {
            setCustomMode(false);
            onChange(next);
        }
    }

    return (
        <div className="pa-soc2-platform">
            <Select.Root
                value={selectedValue}
                onValueChange={selectPlatform}
                required
            >
                <Select.Trigger
                    id={id}
                    className="pa-soc2-select"
                    aria-invalid={Boolean(error)}
                >
                    <span className="pa-soc2-select-value">
                        {SelectedIcon && !isCustom && (
                            <SelectedIcon size={16} />
                        )}

                        {isCustom && (
                            <Globe2 size={16} />
                        )}

                        <Select.Value
                            placeholder="Pilih platform media sosial"
                        />
                    </span>

                    <Select.Icon
                        className="pa-soc2-select-arrow"
                    >
                        <ChevronDown size={16} />
                    </Select.Icon>
                </Select.Trigger>

                <Select.Portal>
                    <Select.Content
                        className="pa-soc2-select-content"
                        position="popper"
                        sideOffset={7}
                        collisionPadding={8}
                    >
                        <Select.Viewport
                            className="pa-soc2-select-viewport"
                        >
                            {platformOptions.map((option) => {
                                const Icon = option.icon;

                                return (
                                    <Select.Item
                                        key={option.value}
                                        value={option.value}
                                        className="pa-soc2-select-item"
                                    >
                                        <Icon size={16} />

                                        <Select.ItemText>
                                            {option.label}
                                        </Select.ItemText>

                                        <Select.ItemIndicator
                                            className="pa-soc2-select-check"
                                        >
                                            <Check size={15} />
                                        </Select.ItemIndicator>
                                    </Select.Item>
                                );
                            })}

                            <Select.Separator
                                className="pa-soc2-select-separator"
                            />

                            <Select.Item
                                value="custom"
                                className="pa-soc2-select-item"
                            >
                                <Globe2 size={16} />

                                <Select.ItemText>
                                    Lainnya
                                </Select.ItemText>

                                <Select.ItemIndicator
                                    className="pa-soc2-select-check"
                                >
                                    <Check size={15} />
                                </Select.ItemIndicator>
                            </Select.Item>
                        </Select.Viewport>
                    </Select.Content>
                </Select.Portal>
            </Select.Root>

            {isCustom && (
                <div className="pa-soc2-custom-platform">
                    <label htmlFor={`${id}-other`}>
                        Nama Platform Lainnya
                    </label>

                    <input
                        id={`${id}-other`}
                        required
                        maxLength={100}
                        value={value}
                        placeholder="Contoh: ResearchGate"
                        onChange={(event) =>
                            onChange(event.target.value)
                        }
                    />
                </div>
            )}
        </div>
    );
}

// ==========================================
// FORM FIELDS
// ==========================================

export function SocialFields({
    prefix,
    data,
    errors,
    onChange,
}: {
    prefix: string;
    data: SocialLinkForm;
    errors: Partial<
        Record<keyof SocialLinkForm, string>
    >;
    onChange: (
        patch: Partial<SocialLinkForm>
    ) => void;
}) {
    return (
        <div className="pa-soc2-fields">
            <SocialField
                id={`${prefix}-platform`}
                label="Platform Media Sosial"
                error={errors.platform}
            >
                <PlatformSelect
                    id={`${prefix}-platform`}
                    value={data.platform}
                    error={errors.platform}
                    onChange={(platform) =>
                        onChange({ platform })
                    }
                />
            </SocialField>

            <SocialField
                id={`${prefix}-name`}
                label="Nama / Label"
                error={errors.name}
            >
                <input
                    id={`${prefix}-name`}
                    required
                    maxLength={100}
                    placeholder="Contoh: Profil GitHub Saya"
                    value={data.name}
                    onChange={(event) =>
                        onChange({
                            name: event.target.value,
                        })
                    }
                />
            </SocialField>

            <SocialField
                id={`${prefix}-url`}
                label="URL Media Sosial"
                hint="Gunakan tautan lengkap yang diawali https://."
                error={errors.url}
            >
                <input
                    id={`${prefix}-url`}
                    type="url"
                    required
                    maxLength={2048}
                    pattern="https://.*"
                    placeholder="https://github.com/username"
                    value={data.url}
                    onChange={(event) =>
                        onChange({
                            url: event.target.value,
                        })
                    }
                />
            </SocialField>

            {validSocialUrl(data.url) && (
                <div className="pa-soc2-url-preview">
                    <span>
                        <Globe2 size={15} />
                        Preview Tautan
                    </span>

                    <a
                        href={data.url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Buka tautan
                        <ExternalLink size={14} />
                    </a>
                </div>
            )}
        </div>
    );
}

// ==========================================
// MODAL
// ==========================================

export function SocialModal({
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
                if (!busy) {
                    onOpenChange(next);
                }
            }}
        >
            <Dialog.Portal>
                <Dialog.Overlay
                    className="pa-soc2-overlay"
                />

                <Dialog.Content
                    className="pa-soc2-modal"
                >
                    <div className="pa-soc2-modal-header">
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
                            className="pa-soc2-modal-close"
                            aria-label="Tutup modal"
                        >
                            <X size={18} />
                        </Dialog.Close>
                    </div>

                    <div className="pa-soc2-modal-body">
                        {children}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

export function SocialFlash({
    message,
}: {
    message?: string | null;
}) {
    if (!message) {
        return null;
    }

    return (
        <div
            className="pa-editor-success"
            role="status"
        >
            {message}
        </div>
    );
}

export function SocialIdentity({
    link,
}: {
    link: SocialLink;
}) {
    return (
        <div className="pa-soc2-identity">
            <span className="pa-soc2-platform-icon">
                <PlatformIcon
                    platform={link.platform}
                    size={18}
                />
            </span>

            <div>
                <strong>{link.platform}</strong>
                <small>{link.name}</small>
            </div>
        </div>
    );
}