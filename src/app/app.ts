import { Component, signal } from '@angular/core';
import { HeadBar } from './components/head-bar/head-bar';
import { SearchBar } from './components/search-bar/search-bar';
import { Sidebar } from './components/sidebar/sidebar';
import { RouterOutlet } from "@angular/router";



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeadBar, SearchBar, Sidebar, RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('movie-app');
}
