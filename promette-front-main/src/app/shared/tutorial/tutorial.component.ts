import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TutorialService,
  TutorialConfig,
} from '../../core/services/tutorial.service';
import interact from 'interactjs';

@Component({
  selector: 'app-tutorial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.scss'],
})
export class TutorialComponent implements OnInit, AfterViewInit {
  ngAfterViewInit() {
    // Solo habilitar el botón móvil en dispositivos móviles
    if (this.isMobileDevice()) {
      interact('.tutorial-btn').draggable({
        inertia: true,
        listeners: {
          move(event) {
            const target = event.target as HTMLElement;
            const x =
              parseFloat(target.getAttribute('data-x') || '0') + event.dx;
            const y =
              parseFloat(target.getAttribute('data-y') || '0') + event.dy;
            target.style.transform = `translate(${x}px, ${y}px)`;
            target.setAttribute('data-x', x.toString());
            target.setAttribute('data-y', y.toString());
          },
        },
      });
    }
  }

  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  @Input() config!: TutorialConfig;
  @Input() buttonText: string = 'Iniciar Tutorial';
  @Input() showButton: boolean = true;
  @Input() startOnInit: boolean = false;

  constructor(private tutorialService: TutorialService) {}

  ngOnInit() {
    this.tutorialService.initTutorial(this.config);
    if (this.startOnInit) {
      this.startTutorial();
    }
  }

  startTutorial() {
    const visibleSteps = this.tutorialService.filterVisibleSteps(
      this.config.steps
    );

    if (visibleSteps.length === 0) {
      console.warn('No hay pasos visibles para mostrar en el tutorial.');
      return;
    }

    const configToUse = {
      ...this.config,
      steps: visibleSteps,
    };

    this.tutorialService.initTutorial(configToUse).start();
  }
}
