import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { SignInUpService } from '../services/modal.service';


@Component({
  selector: 'app-sign-in-up',
  standalone: true,
  imports: [],
  templateUrl: './sign-in-up.component.html',
  styleUrl: './sign-in-up.component.css'
})


export class SignInUpComponent {
  @Input() size? = 'md';
  @Input() title? = 'Modal title';

  @Output() closeEvent = new EventEmitter();
  @Output() submitEvent = new EventEmitter();

  constructor(private elementRef: ElementRef) {}

  close(): void {
    this.elementRef.nativeElement.remove();
    this.closeEvent.emit();
  }

  submit(): void {
    this.elementRef.nativeElement.remove();
    this.submitEvent.emit();
  }
}