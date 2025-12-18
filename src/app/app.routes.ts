import { Routes } from '@angular/router';
import { MovieList } from './components/movie-list/movie-list';
import { MovieCard } from './components/movie-card/movie-card';
import { Wishlist } from './components/wishlist/wishlist';

export const routes: Routes = [
    { path: '', component: MovieList },
    { path: 'movie/:id', component: MovieCard },
    { path: 'wishlist', component: Wishlist },
    { path: '**', redirectTo: '' },
];
