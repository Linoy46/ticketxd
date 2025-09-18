import { Injectable } from '@angular/core';
import introJs from 'intro.js';

// Tipos de intro.js
interface IntroStep {
  title?: string;
  element?: string;
  intro: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  tooltipClass?: string;
  highlightClass?: string;
}

type IntroJs = ReturnType<typeof introJs>;

export interface TutorialConfig {
  steps: IntroStep[];
  nextLabel?: string;
  prevLabel?: string;
  doneLabel?: string;
  showBullets?: boolean;
  showProgress?: boolean;
  exitOnOverlayClick?: boolean;
  showStepNumbers?: boolean;
  keyboardNavigation?: boolean;
  showButtons?: boolean;
  exitOnEsc?: boolean;
  tooltipClass?: string;
  highlightClass?: string;
  scrollToElement?: boolean;
  onComplete?: () => void;
  onExit?: () => void;
  onBeforeChange?: (targetElement: HTMLElement) => Promise<boolean> | boolean;
  onAfterChange?: (targetElement: HTMLElement) => void;
}

@Injectable({
  providedIn: 'root',
})
export class TutorialService {
  private introJS: IntroJs = introJs();
  private defaultConfig: Partial<TutorialConfig> = {
    nextLabel: 'Siguiente →',
    prevLabel: '← Anterior',
    doneLabel: 'Finalizar',
    showBullets: true,
    showProgress: true,
    exitOnOverlayClick: false,
    showStepNumbers: true,
    keyboardNavigation: true,
    showButtons: true,
    exitOnEsc: true,
    tooltipClass: 'customTooltip',
    highlightClass: 'intro-highlight',
    scrollToElement: true,
  };

  constructor() {
    this.setupDefaultEventHandlers();
  }

  private setupDefaultEventHandlers() {
    this.introJS.onexit(() => {
      console.log('Tutorial finalizado por el usuario');
    });

    this.introJS.oncomplete(() => {
      console.log('Tutorial completado exitosamente');
    });
  }

  initTutorial(config: TutorialConfig) {
    const finalConfig = {
      ...this.defaultConfig,
      ...config,
    };

    this.introJS.setOptions(finalConfig as any);

    if (config.onComplete) {
      this.introJS.oncomplete(config.onComplete);
    }
    if (config.onExit) {
      this.introJS.onexit(config.onExit);
    }
    if (config.onBeforeChange) {
      this.introJS.onbeforechange(config.onBeforeChange);
    }
    if (config.onAfterChange) {
      this.introJS.onafterchange(config.onAfterChange);
    }

    return this.introJS;
  }

  startTutorial() {
    this.introJS.start();
  }

  exitTutorial(force: boolean = true) {
    this.introJS.exit(force);
  }

  filterVisibleSteps(steps: IntroStep[]): IntroStep[] {
    return steps.filter((step) => {
      if (!step.element) return true; // Si no depende de un elemento, lo dejamos
      const el = document.querySelector(step.element);
      return el instanceof HTMLElement && el.offsetParent !== null;
    });
  }
}
