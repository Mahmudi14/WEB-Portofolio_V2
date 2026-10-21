export type SkillItem = {
    id: number;
    skill_category_id: number;
    name: string;
    sort_order: number;
};

export type SkillCategory = {
    id: number;
    name: string;
    description: string;
    sort_order: number;
    items: SkillItem[];
};

export type CategoryForm = {
    name: string;
    description: string;
    sort_order: number;
};

export type ItemForm = {
    name: string;
    sort_order: number;
};

export function byPosition<
    T extends { sort_order: number; id: number }
>(entries: T[]): T[] {
    return [...entries].sort(
        (a, b) =>
            a.sort_order - b.sort_order ||
            a.id - b.id
    );
}