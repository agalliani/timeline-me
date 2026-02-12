import { Component } from '@angular/core';
import { SeoService } from './services/seo.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-timeline';

  constructor(private seoService: SeoService) {
    this.seoService.generateTags({
      title: 'TiMe! - Timeline Me!',
      description: 'TiMe! Is a simple tool to make a timeline of your most important life events: job career, books you\'ve read, series you\'ve watched, university exams and so on.',
      image: 'assets/timeline-preview.png', // Placeholder, need to ensure this image exists or use a default one
      slug: ''
    });
  }
}
