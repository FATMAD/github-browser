import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReposComponent } from './repos.component';
import { GithubService } from '../../core/services/github.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

/**
 * A mock version of the GithubService with stubbed methods returning observable empty arrays.
 */
const githubServiceMock = {
  searchRepositories: jasmine.createSpy().and.returnValue(of([])),
  searchReposByIssueTerm: jasmine.createSpy().and.returnValue(of([])),
};

/**
 * A simple mock for Angular's Router to test navigation.
 */
const routerMock = {
  navigate: jasmine.createSpy('navigate'),
};

describe('ReposComponent', () => {
  let component: ReposComponent;
  let fixture: ComponentFixture<ReposComponent>;

  /**
   * Setup TestBed and create component instance before each test
   */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReposComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: GithubService, useValue: githubServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReposComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /**
   * Reset all spy call histories before each test to ensure isolation
   */
  beforeEach(() => {
    githubServiceMock.searchRepositories.calls.reset();
    githubServiceMock.searchReposByIssueTerm.calls.reset();
    routerMock.navigate.calls.reset();
  });

  /**
   * Test that the component is created successfully
   */
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Test that the form is initialized with default values
   */
  it('should initialize the form with default values', () => {
    const form = component.form.value;
    expect(form.searchBy).toBe('name');
    expect(form.query).toBe('');
    expect(form.language).toBe('');
    expect(form.stars).toBeNull();
  });

  /**
   * Test that the form is invalid if the "query" field is empty
   */
  it('should be invalid if query is empty', () => {
    component.form.setValue({
      searchBy: 'name',
      query: '',
      language: '',
      stars: null
    });
    expect(component.form.invalid).toBeTrue();
  });

  /**
   * Test that no search is triggered if the form is invalid.
   */
  it('should not trigger a search if form is invalid', () => {
    component.form.setValue({
      searchBy: 'name',
      query: '', // required field is empty
      language: '',
      stars: null
    });

    component.onSubmit();

    expect(githubServiceMock.searchRepositories).not.toHaveBeenCalled();
    expect(githubServiceMock.searchReposByIssueTerm).not.toHaveBeenCalled();
  });

  /**
   * Test that searchRepositories is called when searchBy is set to "name"
   */
  it('should call searchRepositories when searchBy = "name"', () => {
    component.form.setValue({
      searchBy: 'name',
      query: 'angular',
      language: '',
      stars: null
    });

    component.onSubmit();
    expect(githubServiceMock.searchRepositories).toHaveBeenCalledWith('angular', undefined, undefined);
  });

  /**
   * Test that searchReposByIssueTerm is called when searchBy is set to "issue"
   */
  it('should call searchReposByIssueTerm when searchBy = "issue"', () => {
    component.form.setValue({
      searchBy: 'issue',
      query: 'bug',
      language: '',
      stars: null
    });

    component.onSubmit();
    expect(githubServiceMock.searchReposByIssueTerm).toHaveBeenCalledWith('bug');
  });

  /**
   * Test that the router navigates to the commits page when goToCommits is called
   */
  it('should navigate to /commits with queryParams when goToCommits is called', () => {
    const mockRepo = {
      owner: { login: 'octocat' },
      name: 'hello-world'
    } as any;

    component.goToCommits(mockRepo);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/commits'], {
      queryParams: { owner: 'octocat', repo: 'hello-world' }
    });
  });
});
