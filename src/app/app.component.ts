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

  score: any = "";

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
    this.timer$
      .do((x) => console.log(x)) //Do operator allows us to do a side effect
      .takeWhile((data) => data.count <= 4) //stops the timer stream at count 4
    //   .combineLatest(  //combine latest is waiting for both streams to send values before sending it down the stream
    //     this.input$.do((x) => console.log(x)),
    //     (timer: any, input: string) => ({count: timer.count, text: input})
    //   )
      .withLatestFrom( //withLatestFrom completes the stream when timer is finished and takes the latest value from the input before sending it down the stream
        this.input$.do((x) => console.log(x)),
        (timer: any, input: string) => ({count: timer.count, text: input})
      )
        .filter((data) => data.count === parseInt(data.text)) //filters away all other keyups other than the one that matches the timer
        .reduce((acc, curr) => acc + 1, 0) //reducer is starting with 0 and doing +1 when the reducer runs, which is every element passed down from filter
        //Put repeat usually before subscribe. Nothing under repeat will fire.
        .repeat() //repeat is resubscribing to the stream. This stream is never completing. Careful where you put repeat.
        .subscribe(
          (x) => {this.score = x},
          err => console.log(err),
          () => console.log('complete')
        );

      //DO NOT do it like this:
      //Do not use nested observables
      // Observable.fromEvent(stopButton, 'click')
      //   .subscribe(() => {
      //     subscription.unsubscribe();
      //   })
  }
}
