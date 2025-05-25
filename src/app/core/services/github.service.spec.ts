

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GithubService } from './github.service';
import { environment } from '../../../environments/environment';
import { GithubRepository, GithubSearchRepositoriesResponse, GithubSearchIssuesResponse, GithubCommit } from '../models/github.models';

describe('GithubService', () => {
  let service: GithubService;
  let httpMock: HttpTestingController;

  /**
   * Sets up the test module and injects the GithubService and HttpTestingController before each test.
   */
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GithubService]
    });

    service = TestBed.inject(GithubService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  /**
   * Ensures there are no outstanding HTTP requests after each test.
   */
  afterEach(() => {
    httpMock.verify();
  });

  /**
   * Should fetch repositories that match the given search term and language.
   * Verifies that the correct URL is called and the Authorization header is present.
   */
  it('should search repositories', () => {
    const mockResponse: GithubSearchRepositoriesResponse = {
      total_count: 1,
      incomplete_results: false,
      items: [
        {
          id: 1,
          name: 'repo1',
          full_name: 'user/repo1',
          html_url: 'https://github.com/user/repo1',
          created_at: '2023-01-01T00:00:00Z',
          stargazers_count: 100,
          language: 'TypeScript',
          owner: {
            login: 'user',
            avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
            html_url: 'https://github.com/user'
          }
        }
      ]
    };

    service.searchRepositories('repo1', 'TypeScript', 50).subscribe(repos => {
      expect(repos.length).toBe(1);
      expect(repos[0].name).toBe('repo1');
    });

    const req = httpMock.expectOne(req =>
      req.method === 'GET' &&
      req.url.includes('/search/repositories')
    );
    expect(req.request.headers.get('Authorization')).toContain(environment.githubToken);
    req.flush(mockResponse);
  });

  /**
   * Should fetch repositories based on matching issues that contain a specific term.
   * Verifies that both the issues API and repository details API are called.
   */
  it('should search repositories by issue term', () => {
    const mockIssuesResponse: GithubSearchIssuesResponse = {
      total_count: 1,
      incomplete_results: false,
      items: [
        {
          id: 101,
          title: 'bug in repo',
          repository_url: 'https://api.github.com/repos/user/repo1'
        }
      ]
    };

    const mockRepo: GithubRepository = {
      id: 1,
      name: 'repo1',
      full_name: 'user/repo1',
      html_url: 'https://github.com/user/repo1',
      created_at: '2023-01-01T00:00:00Z',
      stargazers_count: 120,
      language: 'JavaScript',
      owner: {
        login: 'user',
        avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
        html_url: 'https://github.com/user'
      }
    };

    service.searchReposByIssueTerm('bug').subscribe(repos => {
      expect(repos.length).toBe(1);
      expect(repos[0].name).toBe('repo1');
    });

    const req1 = httpMock.expectOne(req =>
      req.method === 'GET' &&
      req.url.includes('/search/issues')
    );
    req1.flush(mockIssuesResponse);

    const req2 = httpMock.expectOne('https://api.github.com/repos/user/repo1');
    req2.flush(mockRepo);
  });

  /**
   * Should retrieve the list of commits for a specific repository.
   * Verifies that the correct commits endpoint is called.
   */
  it('should get commits', () => {
    const mockCommits: GithubCommit[] = [
      {
        sha: 'abc123',
        html_url: 'https://github.com/user/repo1/commit/abc123',
        commit: {
          author: {
            name: 'Jane Doe',
            date: '2023-01-01T12:00:00Z'
          },
          message: 'Initial commit'
        },
        author: {
          login: 'janedoe',
          avatar_url: 'https://avatars.githubusercontent.com/u/2?v=4',
          html_url: 'https://github.com/janedoe'
        }
      }
    ];

    service.getCommits('user', 'repo1').subscribe(commits => {
      expect(commits.length).toBe(1);
      expect(commits[0].sha).toBe('abc123');
    });

    const req = httpMock.expectOne('https://api.github.com/repos/user/repo1/commits');
    req.flush(mockCommits);
  });
});
