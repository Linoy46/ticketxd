import { Component, type OnInit } from "@angular/core"
import { trigger, transition, style, animate, query, stagger, keyframes } from "@angular/animations"
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

const COLOR_VARIANTS = {
  primary: {
    border: ["border-emerald-500-60", "border-cyan-400-50", "border-slate-600-30"],
    gradient: "from-emerald-500-30",
  },
  octonary: {
    border: ["border-red-500-60", "border-rose-400-50", "border-slate-600-30"],
    gradient: "from-red-500-30",
  },
}

interface Project {
  id: number
  title: string
  description: string
  imageUrl: string
  category: string
  externalUrl?: string
}

@Component({
  selector: "app-portfolio-grid",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    CardModule
  ],
  templateUrl: "./portfolio-grid.component.html",
  styleUrls: ["./portfolio-grid.component.scss"],
  animations: [
    trigger("staggerFade", [
      transition("* => *", [
        query(
          ":enter",
          [
            style({ opacity: 0, transform: "translateY(20px)" }),
            stagger(100, [animate("500ms ease-out", style({ opacity: 1, transform: "translateY(0)" }))]),
          ],
          { optional: true },
        ),
      ]),
    ]),
    trigger("rotate", [
      transition(":enter", []),
      transition("* => *", [
        animate(
          "5s ease-in-out infinite",
          keyframes([
            style({ transform: "rotate(0deg) scale(1)", opacity: 0.8, offset: 0 }),
            style({ transform: "rotate(180deg) scale(1.1)", opacity: 1, offset: 0.5 }),
            style({ transform: "rotate(360deg) scale(1)", opacity: 0.8, offset: 1 }),
          ]),
        ),
      ]),
    ]),
  ],
})
export class PortfolioGridComponent implements OnInit {
  projects: Project[] = [
    {
      id: 1,
      title: "RUPEET",
      description: "Accede a tu información y documentacion de la USET.",
      imageUrl: "./../../../../assets/images/RUPEET-imagotipo.png",
      category: "Archivo y Registro",
      externalUrl: "http://localhost:4300/auth/login"
    },
    {
      id: 2,
      title: "SICE",
      description: "Nuestro sistema para el control y gestión escolar",
      imageUrl: "./../../../../assets/images/SICE-imagotipo.png",
      category: "Educación y Administración",
      externalUrl: "http://localhost:4400/auth/login"
    },
    {
      id: 3,
      title: "COSSIES",
      description: "Organización para apoyar a los jovenes en su formación",
      imageUrl: "https://primefaces.org/cdn/primeng/images/usercard.png",
      category: "Servicio social, formacion y educación",
    },
    {
      id: 4,
      title: "Elegant Digital Campaign",
      description: "Sophisticated marketing strategy for a luxury automotive brand",
      imageUrl: "https://primefaces.org/cdn/primeng/images/usercard.png",
      category: "Digital Marketing",
    },
    {
      id: 5,
      title: "Refined UI/UX Design",
      description: "Streamlined user interfaces for a financial services platform",
      imageUrl: "https://primefaces.org/cdn/primeng/images/usercard.png",
      category: "UI/UX",
    },
    {
      id: 6,
      title: "Minimalist Product Design",
      description: "Sleek and functional design for a smart home device",
      imageUrl: "https://primefaces.org/cdn/primeng/images/usercard.png",
      category: "Product Design",
    },
  ]

  categories: string[] = ["Mostrar todo"]
  selectedCategory = "Mostrar todo"
  filteredProjects: Project[] = []

  circles = [0, 1, 2];
  variant = "octonary";
  variantStyles = COLOR_VARIANTS[this.variant as keyof typeof COLOR_VARIANTS];

  ngOnInit() {
    // Extraer por categoria
    const uniqueCategories = [...new Set(this.projects.map((project) => project.category))]
    this.categories = ["Mostrar todo", ...uniqueCategories]
    this.filteredProjects = [...this.projects]
    this.variantStyles = COLOR_VARIANTS[this.variant as keyof typeof COLOR_VARIANTS];

    // Trigger para actualizar animaciones
    setInterval(() => {
      this.circles = [...this.circles];
    }, 5000);
  }

  filterProjects(category: string) {
    this.selectedCategory = category
    this.filteredProjects =
      category === "Mostrar todo" ? [...this.projects] : this.projects.filter((project) => project.category === category)
  }

  getCircleClass(index: number): string {
    const borderClass = this.variantStyles.border[index];
    const gradientClass = this.variantStyles.gradient;
    return `circle-${index} ${borderClass} ${gradientClass}`;
  }

  navigateToProject(url: string | undefined): void {
    if (url) {
      window.open(url, '_blank');
    }
  }
}

