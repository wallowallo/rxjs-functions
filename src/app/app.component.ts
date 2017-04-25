import { Component } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';
import 'rxjs/Rx';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // A subject is an observer and an observable which is called by the start button with start$.next()
  start$ = new Subject()

  //standard interval observable which ticks every 1 second
  interval$ = Observable.interval(1000);

  //startInterval tells the start$ subject to start the interval when it is getting a click
  startInterval$ = this.start$
    //switchMap switches to the inner observable after the first observable has fired,
    //and only takes values from the most recently projected inner Observable
    .switchMap((event) => this.interval$);

  constructor() {
    //subscribing to the startInterval$ to make it fire
    this.startInterval$
      .subscribe((x) => console.log(x));
  }
}
