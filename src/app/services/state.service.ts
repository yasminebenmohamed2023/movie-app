import { Injectable, signal, computed, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Movie } from '../interfaces/movie';

export interface AppState {
  movies: Movie[];
  wishlist: Movie[];
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedGenre: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private state = signal<AppState>({
    movies: [],
    wishlist: this.loadWishlistFromStorage(),
    currentPage: 1,
    totalPages: 1,
    loading: false,
    error: null,
    searchQuery: '',
    selectedGenre: null
  });

  // Selectors
  movies = computed(() => this.state().movies);
  wishlist = computed(() => this.state().wishlist);
  currentPage = computed(() => this.state().currentPage);
  totalPages = computed(() => this.state().totalPages);
  loading = computed(() => this.state().loading);
  error = computed(() => this.state().error);
  searchQuery = computed(() => this.state().searchQuery);
  searchQuery$ = toObservable(this.searchQuery);
  selectedGenre = computed(() => this.state().selectedGenre);

  // Actions
  setMovies(movies: Movie[]) {
    this.state.update(state => ({ ...state, movies }));
  }

  addToWishlist(movie: Movie) {
    if (!this.isInWishlist(movie.id)) {
      const updatedWishlist = [...this.state().wishlist, movie];
      this.saveWishlistToStorage(updatedWishlist);
      this.state.update(state => ({ ...state, wishlist: updatedWishlist }));
    }
  }

  removeFromWishlist(movieId: number) {
    const updatedWishlist = this.state().wishlist.filter(movie => movie.id !== movieId);
    this.saveWishlistToStorage(updatedWishlist);
    this.state.update(state => ({ ...state, wishlist: updatedWishlist }));
  }

  setPage(page: number) {
    this.state.update(state => ({ ...state, currentPage: page }));
  }

  setTotalPages(totalPages: number) {
    this.state.update(state => ({ ...state, totalPages }));
  }

  setLoading(loading: boolean) {
    this.state.update(state => ({ ...state, loading }));
  }

  setError(error: string | null) {
    this.state.update(state => ({ ...state, error }));
  }

  setSearchQuery(query: string) {
    this.state.update(state => ({ ...state, searchQuery: query }));
  }

  setSelectedGenre(genreId: number | null) {
    this.state.update(state => ({ ...state, selectedGenre: genreId, currentPage: 1 }));
  }

  isInWishlist(movieId: number): boolean {
    return this.state().wishlist.some(movie => movie.id === movieId);
  }

  private saveWishlistToStorage(wishlist: Movie[]) {
    localStorage.setItem('movieWishlist', JSON.stringify(wishlist));
  }

  private loadWishlistFromStorage(): Movie[] {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('movieWishlist');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  }
}
