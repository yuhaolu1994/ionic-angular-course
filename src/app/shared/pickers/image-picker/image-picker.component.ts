import { Platform } from '@ionic/angular';
import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, Input } from '@angular/core';
import { Plugins, Capacitor, CameraSource, CameraResultType } from '@capacitor/core';

@Component({
  selector: 'app-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrls: ['./image-picker.component.scss'],
})
export class ImagePickerComponent implements OnInit {
  @ViewChild('filePicker') filePickerRef: ElementRef<HTMLInputElement>;
  @Output() imagePick = new EventEmitter<string | File>(); // base64 url
  @Input() showPreview = false;
  selectedImage: string;
  usePicker = false;

  constructor(private platform: Platform) { }

  ngOnInit() {
    // check if run in browser where camera is not available
    if ((this.platform.is('mobile') && !this.platform.is('hybrid')) || this.platform.is('desktop')) {
      this.usePicker = true;
    }
  }

  onPickImage() {
    if (!Capacitor.isPluginAvailable('Camera')) {
      this.filePickerRef.nativeElement.click();
      return;
    }
    Plugins.Camera.getPhoto({
      quality: 50,
      source: CameraSource.Prompt,
      correctOrientation: true,
      height: 320,
      width: 600,
      resultType: CameraResultType.Base64
    }).then(image => {
      this.selectedImage = image.base64Data;
      this.imagePick.emit(image.base64Data);
    }).catch(error => {
      console.log(error);
      if (this.usePicker) {
        this.filePickerRef.nativeElement.click(); // use file picker as a fallback
      }
      return false;
    });
  }

  onFileChosen(event: Event) {
    // HTMLInputElement make sure there is files property
    const pickedFile = (event.target as HTMLInputElement).files[0];
    if (!pickedFile) {
      return;
    }
    const fr = new FileReader(); // FileReader is web api
    // register fileReader
    fr.onload = () => {
      const dataUrl = fr.result.toString();
      this.selectedImage = dataUrl;
      this.imagePick.emit(pickedFile); // emit File
    };
    fr.readAsDataURL(pickedFile); // convert to base64 string
  }
}
