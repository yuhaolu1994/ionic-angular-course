import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { MapModalComponent } from './map-modal/map-modal.component';
import { LocationPickerComponent } from './pickers/location-picker/location-picker.component';
import { ImagePickerComponent } from './pickers/image-picker/image-picker.component';

@NgModule({
  declarations: [LocationPickerComponent, MapModalComponent, ImagePickerComponent],
  imports: [CommonModule, IonicModule], // import ionic module to unlock ionic component
  exports: [LocationPickerComponent, MapModalComponent, ImagePickerComponent], // use component in shared module
  entryComponents: [MapModalComponent] // modal component only used in location picker component
})
export class SharedModule {}
