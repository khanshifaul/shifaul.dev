export interface IBlogPost {
    id: string;
    title: string;
    slug: string;
    thumbnail?: string;
    content: string;
    reactions?: number;
    views?: number;
    authorId: string;
    authorName: string;
    author?: IAuthor;
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
    tags?: ITag[] | string[];
    excerpt?: string;
    publishedAt?: Date | null;
}

export interface ITag {
    id?: string;
    name: string;
    slug?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IAuthor {
    name: string;
    avatar?: string;
}

export interface IProject {
    id: string;
    title: string;
    slug: string;
    thumbnail?: string;
    description?: string;
    content?: string;
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
    tags?: ITag[];
    link?: string;
    github?: string;
    technologies?: string[];
    client?: string;
    logo?: string;
    subtitle?: string;
    services?: string[];
    website?: string;
    about?: string;
    goal?: string;
    goalImages?: string[];
    execution?: string;
    results?: string;
    resultImages?: string[];
    _count?: {
        tags: number;
    };
}
