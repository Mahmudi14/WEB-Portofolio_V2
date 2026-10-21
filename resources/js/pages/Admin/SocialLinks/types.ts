export type SocialLink = {
    id: number;
    platform: string;
    name: string;
    url: string;
    sort_order: number;
};

export type SocialLinkForm = {
    platform: string;
    name: string;
    url: string;
    sort_order: number;
};

export function emptySocialLink(): SocialLinkForm {
    return {
        platform: '',
        name: '',
        url: '',
        sort_order: 0,
    };
}

export function sortSocialLinks(
    links: SocialLink[]
): SocialLink[] {
    return [...links].sort(
        (a, b) =>
            a.sort_order - b.sort_order ||
            a.id - b.id
    );
}

export function validSocialUrl(url: string): boolean {
    try {
        const parsed = new URL(url);

        return (
            parsed.protocol === 'https:' &&
            Boolean(parsed.hostname)
        );
    } catch {
        return false;
    }
}