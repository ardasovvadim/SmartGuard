import {Component, EventEmitter, Input, Output, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'sg-moveable-card',
  templateUrl: './moveable-card.component.html',
  styleUrls: ['./moveable-card.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MoveableCardComponent {

  @Input() isCardHidden: boolean = false;
  @Input() extraClasses: string;

  @Output() onToggleCardHidden: EventEmitter<boolean> = new EventEmitter<boolean>(this.isCardHidden)

  toggleCardHidden() {
    this.isCardHidden = !this.isCardHidden;
  }


}
