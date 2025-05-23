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
      schemas: [NO_ERRORS_SCHEMA] // Ignore les erreurs liées à PrimeNG
    }).compileComponents();

    fixture = TestBed.createComponent(CommitsComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load commits from GithubService on init', () => {

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
      html_url:'https://avatars.githubusercontent.com/u/583231?v=4',
    }
  }
];

githubServiceMock.getCommits.and.returnValue(of(fakeCommits));

    githubServiceMock.getCommits.and.returnValue(of(fakeCommits));

    fixture.detectChanges(); 

    expect(githubServiceMock.getCommits).toHaveBeenCalledWith('octocat', 'hello-world');
    expect(component.commits$()).toEqual(fakeCommits);
    expect(component.loading()).toBeFalse();
    expect(component.noResults()).toBeFalse();
  });

  it('should set noResults to true if empty commits list', () => {
    githubServiceMock.getCommits.and.returnValue(of([]));
    fixture.detectChanges();

    expect(component.commits$()).toEqual([]);
    expect(component.noResults()).toBeTrue();
  });
});
