import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'imageUrl',
  standalone: true
})
export class ImageUrlPipe implements PipeTransform {
  // URL d'image de remplacement
  private readonly defaultImage = 'https://via.placeholder.com/300x450?text=No+Image';

  transform(posterPath: string | null | undefined): string {
    if (!posterPath) {
      return this.defaultImage;
    }
    
    try {
      // Essayer d'abord avec l'URL directe
      return `https://image.tmdb.org/t/p/w500${posterPath}`;
    } catch (error) {
      console.error('Error loading image:', error);
      return this.defaultImage;
    }
  }
}
