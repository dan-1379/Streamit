import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export class Episode {
  image!: string;
  title!: string;
  description!: string;
  time!: string;
}

export class CastMember {
  image!: string;
  name!: string;
  character!: string;
}

export class Content {
  _id!: string;
  title!: string;
  year!: string;
  seasons!: string;
  rating!: string;
  description!: string;
  image!: string;
  coverImage?: string;
  type!: 'series' | 'film';
  episodes?: Episode[];
  trailers?: string;
  cast!: CastMember[];
}

@Injectable({
    providedIn: "root"
})
export class ContentData {
    private http = inject(HttpClient);
    private apiBaseUrl = 'http://localhost:3000/api';
    
    public async getContent(): Promise<Content[]> {
        const url = `${this.apiBaseUrl}/content`;
        return firstValueFrom(this.http.get<Content[]>(url));
    }
}
