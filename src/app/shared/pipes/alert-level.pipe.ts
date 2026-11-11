import { Pipe, PipeTransform } from '@angular/core';
import { AlertLevel } from '../../core/models';

const LABELS: Record<AlertLevel, string> = {
  ATTENTION: 'Atención',
  ALERT: 'Alerta',
  RISK: 'Riesgo'
};

@Pipe({ name: 'alertLevel' })
export class AlertLevelPipe implements PipeTransform {
  transform(value: AlertLevel | null | undefined): string {
    if (!value) {
      return '';
    }
    return LABELS[value];
  }
}
