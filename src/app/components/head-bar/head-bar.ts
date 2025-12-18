import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { NgStyle } from "@angular/common";
import { MovieService } from '../../services/movie-service';


@Component({
  selector: 'app-head-bar',
  standalone: true,
  imports: [FaIconComponent, NgStyle, RouterLink],
  templateUrl: './head-bar.html',
  styleUrls: ['./head-bar.css'],
})
export class HeadBar {
  faHeart = faHeart;
  router=inject(Router)
  movieService=inject(MovieService)


  navigateTo(){
    this.router.navigate(['/wishlist']);
  }
  setheartstyle(){
    if(this.movieService.wishlist.length)
      return {'color':'red'};
    else
      return {'color':'grey'};  
}
}