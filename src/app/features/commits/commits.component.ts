import {
  Component,
  inject,
  ChangeDetectionStrategy,
  signal,
  computed,
  Signal
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, tap } from 'rxjs';
import { GithubService } from '../../core/services/github.service';
import { GithubCommit } from '../../core/models/github.models';
import { SharedImports } from '../../shared/shared-imports'; 


/**
 * Component that displays the list of commits for a GitHub repo
 * 
 */
@Component({
  selector: 'app-commits',
  imports: [...SharedImports],
  templateUrl: './commits.component.html',
  styleUrls: ['./commits.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommitsComponent {
 /** Injected GitHub service used to fetch commits */
  private readonly github = inject(GithubService);

  /** Injected route service to access query string param */
    private readonly route = inject(ActivatedRoute);

 /**
   * Signal that indicates whether commits are currently being loaded
   */

  readonly loading = signal<boolean>(true);

 /**
   * Signal that holds the list of commits fetched based on
   * query parameters (`owner` and `repo`)
   * 
   * Initially, it's an empty array
   */
  readonly commits: Signal<GithubCommit[]> = toSignal(
    this.route.queryParams.pipe(
      tap(() => this.loading.set(true)),
      switchMap(params => this.github.getCommits(params['owner'], params['repo'])),
      tap(() => this.loading.set(false))
    ),
    { initialValue: [] }
  );


  /**
   * Computed signal that returns true when loading is done
   * and no commits were found
   */
  readonly noResults = computed(() => !this.loading() && this.commits().length === 0);

/**
   * Opens the given commit URL in a new browser tab
   *
   * @param url - The URL of the commit (usually a GitHub link)
   */
openCommit(url: string): void {
  if (url?.startsWith('http')) {
    window.open(url, '_blank');
  }
}

}
