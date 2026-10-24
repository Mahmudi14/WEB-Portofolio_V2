// Common props matching LandingPageController@index.
export type Profile = {
    full_name: string | null;
    display_name: string | null;
    email: string | null;
    whatsapp: string | null;
    photo_url: string | null;
    logo_url: string | null;
};

export type Hero = {
    headline: string | null;
    description: string | null;
};

export type Social = {
    id: number;
    platform: string;
    name: string;
    url: string;
};

export type Skill = {
    id: number;
    name: string;
    description: string | null;
    items: {
        id: number;
        name: string;
    }[];
};

export type Education = {
    id: number;
    level: string;
    institution_name: string;
    major: string | null;
    start_year: number;
    end_year: number | null;
    is_current: boolean;
};

export type Experience = {
    id: number;
    category: string;
    position: string;
    institution_name: string;
    description: string;
    start_year: number;
    end_year: number | null;
    is_current: boolean;
    logo_url: string | null;
};

export type Achievement = {
    id: number;
    category: string;
    title: string;
    description: string | null;
    year: number;
    institution_name: string | null;
};

export type Project = {
    id: number;
    title: string;
    description: string;
    technologies: string | null;
    category: string;
    images: {
        id: number;
        url: string;
    }[];
};

export type Research = {
    id: number;
    title: string;
    summary: string;
    year: number;
};

export type LandingPageProps = {
    profile: Profile;
    hero: Hero;
    about: {
        description: string | null;
    };
    socials: Social[];
    skills: Skill[];
    educations: Education[];
    experiences: Experience[];
    achievements: Achievement[];
    projects: Project[];
    researches: Research[];
};
