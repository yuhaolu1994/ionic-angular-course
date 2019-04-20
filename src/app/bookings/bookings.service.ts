import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Booking } from './bookings.model';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './../auth/auth.service';
import { take, tap, switchMap, map } from 'rxjs/operators';

interface BookingData {
  bookedFrom: string;
  bookedTo: string;
  firstName: string;
  guestNumber: number;
  lastName: string;
  placeId: string;
  placeImage: string;
  placeTitle: string;
  userId: string;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private _bookings = new BehaviorSubject<Booking[]>([]);

  get bookings() {
    return this._bookings.asObservable();
  }

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { }

  addBooking(
    placeId: string,
    placeTitle: string,
    placeImage: string,
    firstName: string,
    lastName: string,
    guestNumber: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    let generatedId: string;
    const newBooking = new Booking(
      Math.random().toString(),
      placeId,
      this.authService.userId,
      placeTitle,
      placeImage,
      firstName,
      lastName,
      guestNumber,
      dateFrom,
      dateTo
    );
    return this.http.post<{ name: string }>(
      'https://ionic-angular-course-6327b.firebaseio.com/bookings.json',
      { ...newBooking, id: null }
    ).pipe(
      switchMap(resData => {
        generatedId = resData.name;
        return this.bookings;
      }),
      take(1), // prevent the ongoing subscription
      tap(bookings => {
        newBooking.id = generatedId;
        this._bookings.next(bookings.concat(newBooking));
      })
    );
  }

  cancelBooking(bookingId: string) {
    return this.http
      .delete(
        `https://ionic-angular-course-6327b.firebaseio.com/bookings/${bookingId}.json`
      )
      .pipe(
        switchMap(() => {
          // this step is to update the bookings in local
          return this.bookings;
        }),
        take(1), // take one snapshot of the object, avoid the subject loop
        tap(bookings => {
          // filter out the booking that meets the requirment
          this._bookings.next(bookings.filter(booking => booking.id !== bookingId));
        })
      );
  }

  fetchBookings() {
    // use generic type from ts, return object which includes dynamic key with unknown name
    return this.http.get<{ [key: string]: BookingData }>(
      `https://ionic-angular-course-6327b.firebaseio.com/bookings.json?orderBy="userId"&equalTo="${this.authService.userId}"`
    ).pipe(
      map( // not return observable so use map here
        bookingData => {
          const bookings = [];
          for (const key in bookingData) {
            if (bookingData.hasOwnProperty(key)) {
              bookings.push(
                new Booking(
                  key,
                  bookingData[key].placeId,
                  bookingData[key].userId,
                  bookingData[key].placeTitle,
                  bookingData[key].placeImage,
                  bookingData[key].firstName,
                  bookingData[key].lastName,
                  bookingData[key].guestNumber,
                  new Date(bookingData[key].bookedFrom),
                  new Date(bookingData[key].bookedTo)
                ));
            }
          }
          return bookings;
        }
      ),
      tap(bookings => {
        this._bookings.next(bookings);
      })
    );
  }
}
