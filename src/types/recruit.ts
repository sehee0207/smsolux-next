export type Faq = {
    question: string;
    answer: string;
};

export type RecruitmentNotice = {
    id?: number;
    title: string;
    generation?: number;
    start_date: string;
    end_date: string;
    application_url: string;
    is_active: boolean;
};

export type CoreValue = {
    key: string;
    title: string;
    description: string;
};
