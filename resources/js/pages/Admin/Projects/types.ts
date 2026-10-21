export type ProjectCategory = {
    id: number;
    name: string;
    sort_order: number;
    projects_count: number;
};

export type ProjectImage = {
    id: number;
    sort_order: number;
    url: string;
};

export type Project = {
    id: number;
    project_category_id: number;
    title: string;
    description: string;
    technologies: string | null;
    sort_order: number;
    category: {
        id: number;
        name: string;
    };
    images: ProjectImage[];
};

export type ProjectForm = {
    project_category_id: number | '';
    title: string;
    description: string;
    technologies: string;
    sort_order: number;
    images: File[];
    existing_image_ids: number[];
};

export type ProjectErrors = Partial<
    Record<keyof ProjectForm, string>
>;

export function emptyProject(): ProjectForm {
    return {
        project_category_id: '',
        title: '',
        description: '',
        technologies: '',
        sort_order: 0,
        images: [],
        existing_image_ids: [],
    };
}

export function projectToForm(
    project: Project
): ProjectForm {
    return {
        project_category_id: project.project_category_id,
        title: project.title,
        description: project.description,
        technologies: project.technologies ?? '',
        sort_order: project.sort_order,
        images: [],
        existing_image_ids: project.images.map(
            (image) => image.id
        ),
    };
}

export function sortProjects(
    projects: Project[]
): Project[] {
    return [...projects].sort(
        (a, b) =>
            a.sort_order - b.sort_order ||
            b.id - a.id
    );
}