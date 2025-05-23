export interface GithubRepository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  created_at: string;
  stargazers_count: number;
  language: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
}

export interface GithubSearchRepositoriesResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GithubRepository[];
}

export interface GithubSearchIssuesResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GithubIssue[];
}

export interface GithubIssue {
  id: number;
  title: string;
  repository_url: string;
}

export interface GithubCommit {
  sha: string;
  html_url: string;
  commit: {
    author: {
      name: string;
      date: string;
    };
    message: string;
  };
  author: {
    login: string;
    avatar_url: string;
    html_url: string;
  } | null;
}
