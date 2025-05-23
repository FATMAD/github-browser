import {
  Component,
  inject,
  ChangeDetectionStrategy,
  signal,
  computed,
  Signal
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, tap } from 'rxjs';
import { GithubService } from '../../core/services/github.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';

/**
 * Composant affichant la liste des commits d'un dépôt GitHub donné.
 * Il récupère les paramètres de l'URL (owner et repo) et appelle l'API via GithubService.
 */
@Component({
  selector: 'app-commits',
  imports: [CommonModule, TableModule, ProgressSpinnerModule],
  templateUrl: './commits.component.html',
  styleUrl: './commits.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommitsComponent {
  /** Service GitHub injecté pour récupérer les commits */
  private github = inject(GithubService);
  
  /** ActivatedRoute injecté pour accéder aux paramètres de la query */
  private route = inject(ActivatedRoute);

  /** Indique si le chargement est en cours */
  readonly loading = signal<boolean>(true);

  /**
   * Liste des commits obtenue en fonction des paramètres de la route.
   * La valeur est automatiquement mise à jour à chaque changement de paramètres.
   */
  readonly commits$ = toSignal(
    this.route.queryParams.pipe(
      tap(() => this.loading.set(true)),
      switchMap(params => this.github.getCommits(params['owner'], params['repo'])),
      tap(() => this.loading.set(false))
    ),
    { initialValue: [] }
  );

  /**
   * Indique s'il n'y a aucun résultat à afficher après chargement.
   * @returns true si les commits sont chargés et la liste est vide.
   */
  readonly noResults = computed(() => {
    const commits = this.commits$();
    return !this.loading() && Array.isArray(commits) && commits.length === 0;
  });
}
