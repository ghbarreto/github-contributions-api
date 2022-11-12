export type Contributions = Array<{ [T: string]: number }>;

export type GitInfo = {
    last_year_contribution: number;
    contributions: Contributions;
};
