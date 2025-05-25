import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommitsComponent } from './commits.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { GithubService } from '../../core/services/github.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { GithubCommit } from '../../core/models/github.models';

describe('CommitsComponent', () => {
  let component: CommitsComponent;
  let fixture: ComponentFixture<CommitsComponent>;
  let githubServiceMock: jasmine.SpyObj<GithubService>;
  let windowOpenSpy: jasmine.Spy;

  /**
   * Before each test:
   * - Create a mock GithubService with a spy on the getCommits method
   * - Simulate the activated route with query parameters: owner and repo
   * - Configure the test module and compile the component
   * - Spy on window.open to prevent real navigation during tests
   */
  beforeEach(async () => {
    githubServiceMock = jasmine.createSpyObj('GithubService', ['getCommits']);

    await TestBed.configureTestingModule({
      imports: [CommitsComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ owner: 'octocat', repo: 'hello-world' })
          }
        },
        { provide: GithubService, useValue: githubServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA] 
    }).compileComponents();

    fixture = TestBed.createComponent(CommitsComponent);
    component = fixture.componentInstance;

    // Prevents opening a new tab during the test
    windowOpenSpy = spyOn(window, 'open');
  });

  /**
   * Test: Component should be created successfully without errors
   */
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Test: Should call GithubService.getCommits on init and set component data properly
   * The component should:
   * - Load commits using the correct parameters
   * - Update the list of commits
   * - Set loading to false
   * - Set noResults to false
   */
  it('should load commits from GithubService on init', async () => {
    const fakeCommits: GithubCommit[] = [
      {
        sha: '123abc',
        html_url: 'https://github.com/octocat/hello-world/commit/123abc',
        commit: {
          message: 'Initial commit',
          author: {
            name: 'Octocat',
            date: '2021-01-01T00:00:00Z'
          }
        },
        author: {
          login: 'octocat',
          avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
          html_url: 'https://github.com/octocat'
        }
      }
    ];

    githubServiceMock.getCommits.and.returnValue(of(fakeCommits));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(githubServiceMock.getCommits).toHaveBeenCalledWith('octocat', 'hello-world');
    expect(component.commits()).toEqual(fakeCommits);
    expect(component.loading()).toBeFalse();
    expect(component.noResults()).toBeFalse();
  });

  /**
   * Test: If GithubService returns an empty list, component should show "no results" state
   */
  it('should set noResults to true if empty commits list', async () => {
    githubServiceMock.getCommits.and.returnValue(of([]));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.commits()).toEqual([]);
    expect(component.noResults()).toBeTrue();
  });

  /**
   * Test: openCommit() should open the commit URL in a new browser tab
   */
  it('should open commit link in new tab', () => {
    const testUrl = 'https://github.com/octocat/hello-world/commit/123abc';
    component.openCommit(testUrl);
    expect(windowOpenSpy).toHaveBeenCalledWith(testUrl, '_blank');
  });
});
