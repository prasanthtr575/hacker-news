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
  hnIds: any[] = [];
  hackerNews: any[] = [];
  observables: any[] = [];
  loading: boolean = false;
  pageButtonNumbers: any[];
  firstPageNumber: number;
  lastPageNumber: number;
  
  constructor(private http: HttpClient) { }

  ngOnInit() {
    // Make the HTTP request:
    let url = 'https://hacker-news.firebaseio.com/v0/topstories.json';

    fetch(url).then(response => response.json())
    .then(data => {
      this.hnIds = <any>data;
       
      let noOfNews = this.hnIds.length;
      this.maxLimit = noOfNews / this.pageSize + noOfNews % this.pageSize;
      
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
          let pageInfo = this.pageNumbers(this.pageNumber);
          this.pageButtonNumbers = pageInfo.pages;
          this.firstPageNumber = pageInfo.firstPage;
          this.lastPageNumber = pageInfo.lastPage;
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

  gotoPage(pageNumber) {
    this.pageNumber = pageNumber;
    this.fetchHackerNews();
  }

  isNotLastPage() {
    return this.lastPageNumber !== this.maxLimit;
  }

  isNotFirstPage() {
    return this.firstPageNumber !== 1;
  }

  isSelectedPage(pageNumber) {
    return pageNumber === this.pageNumber;
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

    let pages = Array(lastPage - firstPage + 1).fill(null).map((_, idx) => firstPage + idx);
    
    return { firstPage, currentPage, lastPage, pages};
  }
}
