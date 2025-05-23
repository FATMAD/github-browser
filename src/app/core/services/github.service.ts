import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, switchMap } from 'rxjs';
import {
  GithubRepository,
  GithubSearchRepositoriesResponse,
  GithubSearchIssuesResponse,
  GithubCommit
} from '../models/github.models';

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://api.github.com';

  /**
   * Recherche des dépôts GitHub par nom, avec filtres optionnels.
   * @param query Nom du dépôt à rechercher
   * @param language Langage optionnel (ex: TypeScript)
   * @param minStars Nombre minimum d'étoiles
   * @returns Liste typée des dépôts correspondants
   */
  searchRepositories(query: string, language?: string, minStars?: number): Observable<GithubRepository[]> {
    const terms: string[] = [];

    if (query?.trim()) terms.push(query.trim());
    if (language) terms.push(`language:${language}`);
    if (minStars) terms.push(`stars:>=${minStars}`);

    const q = terms.join(' ');
    const url = `${this.baseUrl}/search/repositories?q=${encodeURIComponent(q)}`;

    return this.http.get<GithubSearchRepositoriesResponse>(url).pipe(
      map(res => res.items)
    );
  }

  /**
   * Recherche des dépôts GitHub via un terme présent dans le titre d'une issue.
   * @param term Terme à rechercher dans les issues
   * @returns Liste typée des dépôts contenant des issues correspondant au terme
   */
  searchReposByIssueTerm(term: string): Observable<GithubRepository[]> {
    const url = `${this.baseUrl}/search/issues?q=${encodeURIComponent(term)}`;
    return this.http.get<GithubSearchIssuesResponse>(url).pipe(
      map(res => res.items.map(issue => issue.repository_url)),
      switchMap((repoUrls: string[]) =>
        forkJoin(repoUrls.map(repoUrl => this.http.get<GithubRepository>(repoUrl)))
      )
    );
  }

  /**
   * Récupère les commits d’un dépôt.
   * @param owner Propriétaire du dépôt
   * @param repo Nom du dépôt
   * @returns Liste typée des commits du dépôt
   */
  getCommits(owner: string, repo: string): Observable<GithubCommit[]> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/commits`;
    return this.http.get<GithubCommit[]>(url);
  }
}
