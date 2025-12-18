import { Pipe, PipeTransform } from '@angular/core';
import { Genre } from '../interfaces/movie';

@Pipe({
  name: 'genre',
  standalone: true
})
export class GenrePipe implements PipeTransform {
  transform(genreId: number, genres: Genre[]): string {
    if (!genreId || !genres || !genres.length) return '';
    const genre = genres.find(g => g.id === genreId);
    return genre ? genre.name : '';
  }
}
