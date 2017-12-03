import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { debug } from 'util';
import { denodeify } from 'q';

@Component({
  selector: 'hn-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  pageNumber: number = 1;
  pageSize: number = 10;
  maxLimit: number = 5;
  hnIds: any[];
  hackerNews: any[] = [];
  url = 'https://hacker-news.firebaseio.com/v0/topstories.json'

  constructor(private http: HttpClient) { }

  ngOnInit() {
    // Make the HTTP request:
    this.http.get(this.url).subscribe(data => {
      // Read the result field from the JSON response.
      this.hnIds = <any>data;

      this.fetchHackerNews();
    });
  }

  fetchHackerNews() {
    let page = this.getPageIndex(this.pageNumber);

    this.hackerNews.length = 0;

    for(let i = page.startIndex; i <= page.endIndex; i++) {
      let newsId = this.hnIds[i];
      let url = 'https://hacker-news.firebaseio.com/v0/item/' + newsId + '.json';

      this.http.get(url).subscribe(data => {
        // Read the result field from the JSON response.
        this.hackerNews.push(data);

        window.scrollTo(0, document.body.clientHeight);
      });
    }
  }

  getPageIndex(pageNumber) {
    let startIndex = (this.pageNumber - 1) * 10; 
    let endIndex = startIndex + this.pageSize - 1;

    return {
      startIndex,
      endIndex
    };
  }

  goToPreviousPage() {
    if(this.pageNumber > 1) {
      this.pageNumber--;
      this.fetchHackerNews();
    }
  }

  goToNextPage() {
    if(this.pageNumber <= this.maxLimit) {
      this.pageNumber++;
      this.fetchHackerNews();
    }
  }
}
