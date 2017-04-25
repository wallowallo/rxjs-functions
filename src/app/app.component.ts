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
  start$ = new Subject();

  //called by stop$.next() on the button
  stop$ = new Subject();

  reset$ = new Subject();

  half$ = new Subject();

  quarter$ = new Subject();

  input$ = new Subject()
    .map((value) => value);

  //the startWith object
  data: any = {count: 0};

  //used by intervalThatStops$ to increment each second
  inc = (acc) => { return { count: acc.count + 1 } };

  //used by reset$ to reset the value to init value of data
  reset = (acc) => { return this.data };

  //standard interval observable which ticks every 1 second
  interval$ = Observable.interval(1000);

  intervalThatStops$ = this.interval$
    //use takeUntil to make the observable run until the argument has fired
    .takeUntil(this.stop$);

  incOrReset$ = Observable.merge(
    this.intervalThatStops$.mapTo(this.inc),
    this.reset$.mapTo(this.reset)
  );

  //gathering the starters so that our observable trigger reads better
  starters$ = Observable.merge(
    this.start$.mapTo(1000),
    this.half$.mapTo(500),
    this.quarter$.mapTo(250)
  );

  //function that lets us merge interval and reset for us to pass to the switchMap
  intervalActions$ = (time) => Observable.merge(
    Observable.interval(time)
      .takeUntil(this.stop$).mapTo(this.inc),
      this.reset$.mapTo(this.reset)
  );

  //start$ subject to start the interval when it is getting a click
  //switchMap switches to the inner observable after the first observable has fired,
  //and only takes values from the most recently projected inner Observable
  //.switchMap((event) => this.interval$);
  //scan is the proper way to gather data in rxjs
  //scan gets the {count: 0} and it is being passed in as the first value of the scan
  timer$ = this.starters$
      .switchMap(this.intervalActions$) //switchMapTo lets you pass in the observable itself without the arrow function
      .startWith(this.data) //tells the scan what value to start with and fires init at page load
      .scan((acc, curr) => curr(acc))

  constructor() {
    Observable.combineLatest(
      this.timer$,
      this.input$,
      (timer: any, input: string) => ({count: timer.count, text: input})
    )
      .filter((data) => data.count === parseInt(data.text))
      .subscribe((x) => console.log(x));

      //DO NOT do it like this:
      //Do not use nested observables
      // Observable.fromEvent(stopButton, 'click')
      //   .subscribe(() => {
      //     subscription.unsubscribe();
      //   })
  }
}
