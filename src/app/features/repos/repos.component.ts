import { ChangeDetectionStrategy, Component, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GithubService } from '../../core/services/github.service';
import { GithubRepository } from '../../core/models/github.models';
import { Router } from '@angular/router';

import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';      
import { MessagesModule } from 'primeng/messages';
import { CardModule } from 'primeng/card';

  


@Component({
  selector: 'app-repos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropdownModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    TableModule,
    ProgressSpinnerModule,
    MessageModule,        
    MessagesModule,
    CardModule,
  ],
  templateUrl: './repos.component.html',
  styleUrls: ['./repos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class ReposComponent {
  /** Formulaire de recherche de dépôts GitHub */
  form: FormGroup;

  /** Liste des dépôts GitHub */
  repos = signal<GithubRepository[]>([]);

  /** Indique si le formulaire a été soumis */
  submitted = false;

  /** Indique si les données sont en cours de chargement */
  loading = false;

  /** Options du champ "Search by" */
  searchOptions = [
    { label: 'Repository Name', value: 'name' },
    { label: 'Issue Title', value: 'issue' }
  ];

  constructor(
    private fb: FormBuilder,
    private github: GithubService,
    private router: Router
  ) {
    this.form = this.fb.group({
      searchBy: ['name', Validators.required],
      query: ['', Validators.required],
      language: [''],
      stars: ['']
    });
  }

  /**
   * Appelé lors du clic sur le bouton de recherche
   * Déclenche l'appel au service GitHub selon les critères du formulaire
   */
  onSubmit(): void {
    if (this.form.invalid) return;

    this.submitted = true;
    this.loading = true;
    this.repos.set([]);

    const { searchBy, query, language, stars } = this.form.value;

    const obs = searchBy === 'issue'
      ? this.github.searchReposByIssueTerm(query)
      : this.github.searchRepositories(query, language || undefined, stars ? +stars : undefined);

    obs.subscribe({
      next: repos => this.repos.set(repos),
      complete: () => this.loading = false,
      error: () => this.loading = false
    });
  }

  /**
   * Redirige vers les commits d’un dépôt sélectionné
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
   * Optimise *ngFor avec une clé unique
   */
  trackByRepo(index: number, repo: GithubRepository): string {
    return repo.id.toString();
  }

  /** Vérifie s’il y a des résultats à afficher */
  hasResults(): boolean {
    return this.repos().length > 0;
  }
}
