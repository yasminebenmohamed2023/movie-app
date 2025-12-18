import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../services/movie-service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FaIconComponent],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  movieService = inject(MovieService);
  faTimes = faTimes;
  isOpen = false;

  get wishlist() {
    return this.movieService.wishlist;
  }

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }

  closeSidebar() {
    this.isOpen = false;
  }

  removeFromWishlist(id: number) {
    this.movieService.removeFromWishlist(id);
  }

  getImageUrl(posterPath: string): string {
    if (!posterPath) return '';
    return `https://image.tmdb.org/t/p/w200${posterPath}`;
  }
}
