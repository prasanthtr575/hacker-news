import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { debug } from 'util';

@Component({
  selector: 'hn-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
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
    this.hnIds.map((id, index) => {
      //Fetch News
      let url = 'https://hacker-news.firebaseio.com/v0/item/' + id + '.json';

      this.http.get(url).subscribe(data => {
        // Read the result field from the JSON response.
        this.hackerNews.push(data);
      });
    });
  }
}
