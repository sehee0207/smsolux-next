export type HomeActivity = {
    key: string;
    title: string;
    description: string;
};

export type Review = {
    id: string;
    name: string;
    gen: string;
    part: string;
    content: string;
    created_at?: string;
};

export type HomeStat = {
    key: string;
    label: string;
    value: string;
};
