import { Directive } from '@angular/core';

@Directive({
  selector: '[appTouchFeedback]',
  host: {
    class: 'touch-target'
  }
})
export class TouchFeedbackDirective {}
