import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { GithubService } from '../../core/services/github.service';
import { GithubRepository } from '../../core/models/github.models';
import { Router } from '@angular/router';
import { finalize, take } from 'rxjs/operators'; 
import { SharedImports } from '../../shared/shared-imports';

/**
 * Component that provides a search form to query GitHub repositories
 * 
 * Users can search either by repository name or issue title, and filter by language or number of stars
 * The results are displayed below the form, and the user can navigate to the commits page for each repo
 */
@Component({
  selector: 'app-repos',
   imports: [...SharedImports],
  templateUrl: './repos.component.html',
  styleUrls: ['./repos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReposComponent {
  /**
   * Search form used to query the GitHub API
   */
  form: FormGroup;

  /**
   * Search options: by repository name or by issue title
   */
  searchOptions = [
    { label: 'Repository name', value: 'name' },
    { label: 'Issue title', value: 'issue' }
  ];

  /**
   * Signal that holds the list of GitHub repositories returned by the search
   */
  repos = signal<GithubRepository[]>([]);

  /**
   * Signal indicating whether a search is currently in progress
   */
  loading = signal(false);

  /**
   * Boolean flag that becomes true once the form has been submitted at least once
   */


  submitted = false;

  constructor(
    private fb: FormBuilder,
    private github: GithubService,
    private router: Router
  ) {
    this.form = this.fb.group({
      searchBy: ['name', Validators.required],
      query: ['', Validators.required],
      language: [''],
      stars: [null]
    });
  }

  /**
   * Submits the search form and sends a request to the GitHub API
   * 
   * The search is performed based on the selected type (by name or issue)
   * Results are stored in the `repos` signal.
   */
  onSubmit(): void {
    this.submitted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.repos.set([]);

    const { searchBy, query, language, stars } = this.form.value;

    const search$ = searchBy === 'issue'
      ? this.github.searchReposByIssueTerm(query)
      : this.github.searchRepositories(query, language || undefined, stars ?? undefined);

    search$
      .pipe(
        take(1),
        finalize(() => {
          console.log('fatmaaaaaaaa'); 
          this.loading.set(false);
        })
      )
      .subscribe({
        next: (data) => this.repos.set(data),
        error: (err) => {
          console.error('Error while searching GitHub:', err);
        }
      });
  }

  /**
   * Navigates to the commits page of the selected repository.
   *
   * @param repo - The selected GitHub repository.
   */
  goToCommits(repo: GithubRepository): void {
    this.router.navigate(['/commits'], {
      queryParams: {
        owner: repo.owner.login,
        repo: repo.name
      }
    });
  }

  /**
   * Returns true if there are search results to display
   *
   * @returns `true` if the repository list is not empty
   */
  hasResults(): boolean {
    return this.repos().length > 0;
  }

}

