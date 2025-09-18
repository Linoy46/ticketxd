import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LottieComponent } from 'ngx-lottie';
import { AnimationItem } from 'lottie-web';
import { AnimationOptions } from 'ngx-lottie';

export type LottieAnimationType = 'default' | 'login' | 'loading' | 'success';

@Component({
  selector: 'app-lottie-animation',
  standalone: true,
  imports: [CommonModule, LottieComponent],
  template: `
    <div class="lottie-container" [ngStyle]="containerStyles">
      <ng-lottie
        [options]="options"
        (animationCreated)="onAnimate($event)"
        [height]="height"
        [width]="width"
      ></ng-lottie>
    </div>
  `,
  styles: [`
    .lottie-container {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
    }
  `]
})
export class LottieAnimationComponent implements OnInit, OnChanges {
  @Input() animationType: LottieAnimationType = 'default';
  @Input() width: string = '400px';
  @Input() height: string = '400px';
  @Input() loop: boolean = true;
  @Input() autoplay: boolean = true;

  options!: AnimationOptions;
  containerStyles: { [key: string]: string } = {};

  private readonly animationPaths = {
    default: './assets/animations/Animation1.json',
    login: './assets/animations/Animation-auth.json',
    loading: './assets/animations/loading-animation.json',
    success: './assets/animations/success-animation.json'
  };

  // Como la mayoría de los casos son iguales, definimos un default
  private readonly defaultConfig: Partial<AnimationOptions> = {
    loop: true,
    autoplay: true,
  };

  private readonly animationConfigs: { [key in LottieAnimationType]: Partial<AnimationOptions> } = {
    default: this.defaultConfig,
    login: this.defaultConfig,
    loading: this.defaultConfig,
    success: {
      loop: false,
      autoplay: true,
    }
  };

  ngOnInit(): void {
    this.initializeAnimation();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si alguno de los inputs relevantes cambia, reinicializamos la animación
    if (changes['animationType'] || changes['width'] || changes['height'] || changes['loop'] || changes['autoplay']) {
      this.initializeAnimation();
    }
  }

  private initializeAnimation(): void {
    // Se usa la configuración correspondiente
    const config = this.animationConfigs[this.animationType];
    this.options = {
      path: this.animationPaths[this.animationType],
      loop: this.loop,
      autoplay: this.autoplay,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
      },
      ...config
    };

    this.setContainerStyles();
  }

  private setContainerStyles(): void {
    // Si la animación es de tipo "login" o "loading", asignamos estilos específicos;
    // para otros casos dejamos el contenedor sin estilos especiales.
    if (this.animationType === 'login') {
      this.containerStyles = {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: '0',
        left: '0',
        pointerEvents: 'none',
        zIndex: '1'
      };
    } else if (this.animationType === 'loading') {
      this.containerStyles = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    } else {
      this.containerStyles = {};
    }
  }

  onAnimate(animationItem: AnimationItem): void {
    console.log(`${this.animationType} animation loaded successfully`);
  }
}
