import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Renderer2, OnDestroy, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('map') mapElementRef: ElementRef; // control the local reference element using viewchild
  @Input() center = { lat: -34.398, lng: 150.644 };
  @Input() selectable = true;
  @Input() closeButtonText = 'Cancel';
  @Input() title = 'Pick Location';
  clickListener: any;
  googleMaps: any;

  constructor(
    private modalCtrl: ModalController,
    private renderer: Renderer2
  ) { }

  ngOnInit() {}

  ngAfterViewInit() {
    this.getGoogleMaps().then(googleMaps => {
      this.googleMaps = googleMaps;
      const mapEl = this.mapElementRef.nativeElement;
      // use google map SDK
      const map = new googleMaps.Map(mapEl, {
        center: this.center,
        zoom: 16
      });

      this.googleMaps.event.addListenerOnce(map, 'idle', () => {
        this.renderer.addClass(mapEl, 'visible'); // add css class
      });

      // location is not selectable in place detail page
      if (this.selectable) {
        this.clickListener = map.addListener('click', event => {
          const selectedCoords = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          };
          this.modalCtrl.dismiss(selectedCoords); // pass data to location picker
        });
      } else {
        const marker = new googleMaps.Marker({
          position: this.center,
          map: map,
          title: 'Picked Location'
        });
        marker.setMap(map);
      }
    }).catch(err => {
      console.log(err);
    });
  }

  onCancel() {
    this.modalCtrl.dismiss();
  }

  ngOnDestroy() {
    if (this.selectable) {
      this.googleMaps.event.removeListener(this.clickListener);
    }
  }

  private getGoogleMaps(): Promise<any> {
    const win = window as any; // js assign object as reference
    const googleModule = win.google;
    if (googleModule && googleModule.maps) {
      return Promise.resolve(googleModule.maps);
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=' + environment.googleMapsAPIKey;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        const loadedGoogleModule = win.google;
        if (loadedGoogleModule && loadedGoogleModule.maps) {
          resolve(loadedGoogleModule.maps);
        } else {
          reject('Google maps SDK not available.');
        }
      };
    });
  }
}
