import { Component, inject, OnInit, OnDestroy, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { animate, style, transition, trigger, stagger, query } from '@angular/animations';
import { toObservable } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute, Params } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { MovieService } from '../../services/movie-service';
import { StateService } from '../../services/state.service';
import { Movie, Genre } from '../../interfaces/movie';
import { GenrePipe } from '../../pipes/genre.pipe';
import { ImageUrlPipe } from '../../pipes/image-url.pipe';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, GenrePipe, ImageUrlPipe],
  templateUrl: './movie-list.html',
  styleUrls: ['./movie-list.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, height: 0, overflow: 'hidden' }),
        animate('200ms ease-out', style({ opacity: 1, height: '*' }))
      ]),
      transition(':leave', [
        style({ overflow: 'hidden' }),
        animate('200ms ease-in', style({ opacity: 0, height: 0 }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('stagger', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(10px)' }),
          stagger('50ms', [
            animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class MovieList implements OnInit, OnDestroy {
  private movieService = inject(MovieService);
  private stateService = inject(StateService);
  public router = inject(Router);
  private route = inject(ActivatedRoute);
  private subscriptions = new Subscription();

  // State
  movies = this.stateService.movies;
  wishlist = this.stateService.wishlist;
  loading = this.stateService.loading;
  error = this.stateService.error;
  currentPage = this.stateService.currentPage;
  totalPages = this.stateService.totalPages;
  searchQuery = this.stateService.searchQuery;
  selectedGenre = this.stateService.selectedGenre;
  
  // Local state
  searchInput = signal('');
  genres: Genre[] = [];
  @ViewChild('searchInputElement') searchInputElement!: ElementRef<HTMLInputElement>;
  
  showFilters = false;
  searchFocused = false;
  sortBy = 'popularity.desc';
  yearFilter = '';

  // Computed properties
  paginationRange = computed(() => {
    const current = this.currentPage();
    const total = this.totalPages();
    const range = [];
    
    // Always show first page
    if (current > 2) range.push(1);
    if (current > 3) range.push('...');
    
    // Show current page and adjacent pages
    for (let i = Math.max(1, current - 1); i <= Math.min(total, current + 1); i++) {
      range.push(i);
    }
    
    // Show last page if not already included
    if (current < total - 1) range.push('...');
    if (current < total) range.push(total);
    
    return range;
  });

  ngOnInit(): void {
    // Load initial data
    this.loadMovies();
    this.loadGenres();

    // Subscribe to route params for pagination
    this.subscriptions.add(
      this.route.queryParams.subscribe(params => {
        const page = params['page'] ? +params['page'] : 1;
        const query = params['query'] || '';
        const genre = params['genre'] ? +params['genre'] : null;
        
        this.stateService.setPage(page);
        this.stateService.setSearchQuery(query);
        this.stateService.setSelectedGenre(genre);
        this.searchInput.set(query);
        
        this.loadMovies(page, query, genre);
      })
    );

    // Setup search debounce
    this.subscriptions.add(
      this.stateService.searchQuery$
        .pipe(
          debounceTime(500),
          distinctUntilChanged()
        )
        .subscribe((query: string) => {
          if (query !== this.searchInput()) {
            this.updateQueryParams({ query, page: 1 });
          }
        })
    );
  }

  // Gestion des erreurs d'images
  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    
    // Utiliser une image de remplacement via un service de placeholder
    imgElement.src = 'https://via.placeholder.com/300x450?text=Image+Non+Disponible';
    
    // Réinitialiser l'erreur pour éviter les boucles infinies
    imgElement.onerror = null;
    
    // Afficher le conteneur de remplacement s'il existe
    const parent = imgElement.parentElement;
    if (parent) {
      const noPoster = parent.querySelector('.no-poster') as HTMLElement;
      if (noPoster) {
        noPoster.style.display = 'flex';
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public loadMovies(page: number = 1, query: string = '', genreId: number | null = null): void {
    if (query) {
      this.movieService.searchMovies(query, page).subscribe();
    } else {
      this.movieService.getMovies(page, '', genreId).subscribe();
    }
  }

  private loadGenres(): void {
    this.movieService.getGenres().subscribe(genres => {
      this.genres = genres;
    });
  }

  onSearch(query: string): void {
    this.stateService.setSearchQuery(query);
  }

  onPageChange(page: number | string): void {
    if (typeof page === 'number' && page !== this.currentPage()) {
      this.updateQueryParams({ page });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onGenreChange(genreId: number | null): void {
    this.stateService.setSelectedGenre(genreId);
    this.updateQueryParams({ genre: genreId, page: 1 });
  }

  // Gestion des filtres
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  // Gestion de la recherche
  onSearchFocus(): void {
    this.searchFocused = true;
  }

  onSearchBlur(): void {
    this.searchFocused = false;
  }

  // Gestion du tri
  onSortChange(value: string): void {
    if (value) {
      this.sortBy = value;
      this.updateQueryParams({ sort_by: this.sortBy, page: 1 });
    }
  }

  // Gestion du filtre par année
  onYearFilterChange(year: string): void {
    this.yearFilter = year;
    this.updateQueryParams({ year: year || null, page: 1 });
  }

  // Réinitialisation des filtres
  resetFilters(): void {
    this.searchInput.set('');
    this.stateService.setSelectedGenre(null);
    this.sortBy = 'popularity.desc';
    this.yearFilter = '';
    this.updateQueryParams({
      query: null,
      genre: null,
      sort_by: null,
      year: null,
      page: 1
    });
  }

  // Vérifie si des filtres sont actifs
  hasActiveFilters(): boolean {
    return (
      this.searchInput() !== '' ||
      this.selectedGenre() !== null ||
      this.sortBy !== 'popularity.desc' ||
      this.yearFilter !== ''
    );
  }

  toggleWishlist(movie: Movie): void {
    if (this.isInWishlist(movie.id)) {
      this.movieService.removeFromWishlist(movie.id);
    } else {
      this.movieService.addToWishlist(movie);
    }
  }

  isInWishlist(id: number): boolean {
    return this.movieService.isInWishlist(id);
  }

  private updateQueryParams(params: { [key: string]: any }): void {
    const queryParams: Params = { ...this.route.snapshot.queryParams };
    
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === '' || value === undefined) {
        delete queryParams[key];
      } else {
        queryParams[key] = value;
      }
    });

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }
}
