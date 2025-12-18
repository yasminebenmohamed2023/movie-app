import { Component, inject } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { MovieService } from '../../services/movie-service';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './search-bar.html',
  styleUrls: ['./search-bar.css'],
})
export class SearchBar {
  faMagnifyingGlass = faMagnifyingGlass;
  private movieService = inject(MovieService);
  private stateService = inject(StateService);

  updateMovieList(title: string): void {
    if (title.trim()) {
      this.movieService.searchMovies(title, 1).subscribe();
    } else {
      this.movieService.getMovies().subscribe();
    }
  }
}
