import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, shareReplay, switchMap } from 'rxjs';
import {
  GithubRepository,
  GithubSearchRepositoriesResponse,
  GithubSearchIssuesResponse,
  GithubCommit
} from '../models/github.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://api.github.com';
  private readonly githubToken = '';


  /**
   * Authorization headers used for authenticated GitHub API requests.
   * Only added if a GitHub token is provided in the environment.
   */
  private readonly headers =this.githubToken
    ? new HttpHeaders({ Authorization: `Bearer ${this.githubToken}` })
    : undefined;

  /**
   * Caches repository search results to avoid redundant network requests.
   */
  private readonly reposCache = new Map<string, Observable<GithubRepository[]>>();

  /**
   * Caches commit history requests for specific repositories.
   */
  private readonly commitsCache = new Map<string, Observable<GithubCommit[]>>();

  /**
   * Searches GitHub repositories based on a text query, language, and minimum number of stars.
   * 
   * @param query - Main search keywords.
   * @param language - (Optional) Filter repositories by programming language.
   * @param minStars - (Optional) Minimum number of stars required.
   * @returns An observable emitting a list of matching repositories.
   */
  searchRepositories(query: string, language?: string, minStars?: number): Observable<GithubRepository[]> {
    const terms: string[] = [];

    if (query?.trim()) terms.push(query.trim());
    if (language) terms.push(`language:${language}`);
    if (minStars) terms.push(`stars:>=${minStars}`);

    const q = terms.join(' ');
    const url = `${this.baseUrl}/search/repositories?q=${encodeURIComponent(q)}`;

    if (this.reposCache.has(q)) {
      return this.reposCache.get(q)!;
    }

    const response$ = this.http.get<GithubSearchRepositoriesResponse>(url, {
      headers: this.headers
    }).pipe(
      map(res => res.items),
      shareReplay(1)
    );

    this.reposCache.set(q, response$);
    return response$;
  }

  /**
   * Searches repositories that mention a specific issue-related term.
   * This method first searches issues by term, then retrieves the repositories associated with those issues.
   * 
   * @param term - A keyword or phrase to search within issue discussions.
   * @returns An observable emitting a list of repositories related to the search term.
   */
  searchReposByIssueTerm(term: string): Observable<GithubRepository[]> {
    const q = `issue-term:${term}`;
    if (this.reposCache.has(q)) {
      return this.reposCache.get(q)!;
    }

    const url = `${this.baseUrl}/search/issues?q=${encodeURIComponent(term)}`;

    const response$ = this.http.get<GithubSearchIssuesResponse>(url, {
      headers: this.headers
    }).pipe(
      map(res => res.items.map(issue => issue.repository_url)),
      switchMap((repoUrls: string[]) =>
        forkJoin(
          repoUrls.map(repoUrl =>
            this.http.get<GithubRepository>(repoUrl, {
              headers: this.headers
            })
          )
        )
      ),
      shareReplay(1)
    );

    this.reposCache.set(q, response$);
    return response$;
  }

  /**
   * Retrieves the latest commits for a given GitHub repository.
   * 
   * @param owner - The owner of the repository (user or organization).
   * @param repo - The name of the repository.
   * @returns An observable emitting a list of recent commits.
   */
  getCommits(owner: string, repo: string): Observable<GithubCommit[]> {
    const key = `${owner}/${repo}`;

    if (this.commitsCache.has(key)) {
      return this.commitsCache.get(key)!;
    }

    const url = `${this.baseUrl}/repos/${owner}/${repo}/commits`;

    const response$ = this.http.get<GithubCommit[]>(url, {
      headers: this.headers
    }).pipe(
      shareReplay(1)
    );

    this.commitsCache.set(key, response$);
    return response$;
  }
}
