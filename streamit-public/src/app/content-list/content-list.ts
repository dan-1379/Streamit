import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ContentData, Content } from '../content-data';

@Component({
  imports: [],
  selector: 'app-content-list',
  styleUrl: './content-list.css',
  templateUrl: './content-list.html',
})

export class ContentList implements OnInit {
  private contentData = inject(ContentData);
  private cdr = inject(ChangeDetectorRef);

  serverUrl = 'http://localhost:3000';
  loading = true;

  contentItems: Content[] = [];
  hero!: Content;
  saved: Content[] = [];
  series: Content[] = [];
  films: Content[] = [];

  private async loadContent(): Promise<void> {
    try {
      this.contentItems = await this.contentData.getContent();

      const heroOptions = this.contentItems.filter(item => item.coverImage);

      this.hero = heroOptions.length
      ? heroOptions[Math.floor(Math.random() * heroOptions.length)]
      : this.contentItems[0];
  
      this.saved = this.contentItems.slice(0, 5);
      this.series = this.contentItems.filter(item => item.type === 'series');
      this.films = this.contentItems.filter(item => item.type === 'film');

      this.loading = false;
      this.cdr.detectChanges();
    } catch(error) {
      console.error('Error fetching content:', error);
      this.loading = false;
    }
  }

  ngOnInit(): void {
    this.loadContent();
  }
}