export function period(start: number, end: number | null, current: boolean) {
    if (current) return `${start} — Sekarang`;
    return end ? `${start} — ${end}` : String(start);
}

export function safeUrl(url: string): string | null {
    try {
        const parsed = new URL(url);

        return ["https:", "http:"].includes(parsed.protocol)
            ? parsed.href
            : null;
    } catch {
        return null;
    }
}
