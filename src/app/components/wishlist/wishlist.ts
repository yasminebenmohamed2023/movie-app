import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MovieService } from '../../services/movie-service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css',
})

export class Wishlist {

  router=inject(Router)
  movieService=inject(MovieService)

  get wishlist(){
    return this.movieService.wishlist;
  }

  navigateTo(id: number){
    this.router.navigate(['/movie',id]);
  }
}
