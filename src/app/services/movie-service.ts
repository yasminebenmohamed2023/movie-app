import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { Movie, Genre } from '../interfaces/movie';
import { environment } from '../../enviroments/enviroment';
import { StateService } from './state.service';

export interface MovieResponse {
  results: Movie[];
  total_pages: number;
  total_results: number;
  page: number;
}

@Injectable({ providedIn: 'root' })
export class MovieService {
  private readonly baseUrl = 'https://api.themoviedb.org/3';
  private readonly apiKey = environment.apikey;
  private readonly http = inject(HttpClient);
  private readonly stateService = inject(StateService);
  private genres: Genre[] = [];
  private _wishlist: Movie[] = [];

  get wishlist(): Movie[] {
    return this._wishlist;
  }

  addToWishlist(movie: Movie): void {
    if (!this._wishlist.some(m => m.id === movie.id)) {
      this._wishlist = [...this._wishlist, movie];
    }
  }

  removeFromWishlist(id: number): void {
    this._wishlist = this._wishlist.filter(m => m.id !== id);
  }

  isInWishlist(id: number): boolean {
    return this._wishlist.some(m => m.id === id);
  }

  constructor() {
    this.loadGenres().subscribe();
  }

  getMovies(page: number = 1, query: string = '', genreId: number | null = null): Observable<Movie[]> {
    this.stateService.setLoading(true);
    this.stateService.setError(null);

    let params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('page', page.toString())
      .set('language', 'fr-FR')
      .set('region', 'FR');

    if (query) {
      return this.searchMovies(query, page);
    }

    let url = `${this.baseUrl}/movie/now_playing`;
    
    if (genreId) {
      url = `${this.baseUrl}/discover/movie`;
      params = params.set('with_genres', genreId.toString());
    }

    return this.http.get<MovieResponse>(url, { params }).pipe(
      tap(response => {
        this.stateService.setMovies(response.results);
        this.stateService.setTotalPages(Math.min(response.total_pages, 500)); // API limit
        this.stateService.setPage(page);
      }),
      map(response => response.results),
      catchError(error => {
        console.error('Error fetching movies:', error);
        this.stateService.setError('Failed to load movies. Please try again later.');
        return of([]);
      }),
      tap(() => this.stateService.setLoading(false))
    );
  }

  searchMovies(query: string, page: number = 1): Observable<Movie[]> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('query', query)
      .set('page', page.toString())
      .set('language', 'fr-FR')
      .set('include_adult', 'false');

    return this.http.get<MovieResponse>(`${this.baseUrl}/search/movie`, { params }).pipe(
      tap(response => {
        this.stateService.setMovies(response.results);
        this.stateService.setTotalPages(Math.min(response.total_pages, 500));
        this.stateService.setPage(page);
      }),
      map(response => response.results),
      catchError(error => {
        console.error('Error searching movies:', error);
        this.stateService.setError('Failed to search movies. Please try again.');
        return of([]);
      }),
      tap(() => this.stateService.setLoading(false))
    );
  }

  getMovieById(id: number): Observable<Movie> {
    this.stateService.setLoading(true);
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('language', 'fr-FR')
      .set('append_to_response', 'videos,credits,recommendations');

    return this.http.get<Movie>(`${this.baseUrl}/movie/${id}`, { params }).pipe(
      tap(() => this.stateService.setLoading(false)),
      catchError(error => {
        console.error('Error fetching movie details:', error);
        this.stateService.setError('Failed to load movie details.');
        return of({} as Movie);
      })
    );
  }

  getGenres(): Observable<Genre[]> {
    if (this.genres.length > 0) {
      return of(this.genres);
    }
    return this.loadGenres();
  }

  private loadGenres(): Observable<Genre[]> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('language', 'fr-FR');

    return this.http.get<{ genres: Genre[] }>(`${this.baseUrl}/genre/movie/list`, { params }).pipe(
      map(response => {
        this.genres = response.genres;
        return this.genres;
      }),
      catchError(error => {
        console.error('Error loading genres:', error);
        return of([]);
      })
    );
  }

  getGenreName(genreId: number): string {
    const genre = this.genres.find(g => g.id === genreId);
    return genre ? genre.name : '';
  }

  rateMovie(movieId: number, rating: number): Observable<any> {
    // Note: This is a simplified example. In a real app, you would need to handle user authentication
    // and use a session ID or access token for the API request.
    return of({ success: true });
  }
}