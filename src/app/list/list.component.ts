import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { debug } from 'util';
import { denodeify, Promise } from 'q';
import * as Rx from 'rxjs/Rx';

@Component({
  selector: 'hn-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  title = 'Hacker News';
  pageNumber: number = 1;
  pageSize: number = 10;
  maxLimit: number = 5;
  newsSLNOStart: number;
  hnIds: any[];
  hackerNews: any[] = [];
  observables: any[] = [];
  loading: boolean = false;
  
  constructor(private http: HttpClient) { }

  ngOnInit() {
    // Make the HTTP request:
    let url = 'https://hacker-news.firebaseio.com/v0/topstories.json';

    fetch(url).then(response => response.json())
    .then(data => {
      this.hnIds = <any>data;
       
      let noOfNews = this.hnIds.length;
      this.maxLimit = noOfNews / this.pageSize + noOfNews % this.pageSize;
      
      console.log(`
        page size = ${this.pageSize}
        total No = ${this.hnIds.length}
        pageNo = ${this.maxLimit}
      `)

      this.fetchHackerNews();
    });
  }

  fetchHackerNews() {
    let page = this.getPageIndex(this.pageNumber);
    
    this.observables.length = 0;
    this.startLoading();

    for(let i = page.startIndex; i <= page.endIndex; i++) {
      let newsId = this.hnIds[i];
      let url = `https://hacker-news.firebaseio.com/v0/item/${newsId}.json`;

      this.observables.push(
        this.http.get(url)
      );
    }

    Rx.Observable
      .forkJoin(this.observables)
      .subscribe(
        data => { 
          this.hackerNews.length = 0;
          this.newsSLNOStart = page.startIndex + 1;
          this.hackerNews = data;

          this.stopLoading();
        },
        error => { 
          throw new Error(error) 
        }
      )
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

  startLoading() {
    this.loading = true;
  }

  stopLoading() {
    this.loading = false;
  }

  pageNumbers(page, maxLimit = 50, pageSize = 10) {
    let startPage = page - Math.floor(pageSize / 2);
    let firstPage = startPage > 0 ? startPage : 1;
    let endPage = firstPage + pageSize - 1;
    let lastPage = endPage < maxLimit ? endPage : maxLimit;
    let currentPage = page;
    let noOfPages = lastPage - firstPage + 1;

    firstPage = (noOfPages > 0 && noOfPages < pageSize) ? 
      lastPage - pageSize : firstPage;

    return { firstPage, currentPage, lastPage};
  }
}
