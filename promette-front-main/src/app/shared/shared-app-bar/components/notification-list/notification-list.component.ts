import { Component, Input, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

interface Notification {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  time: string;
  message: string;
  read: boolean;
  attachment?: {
    name: string;
    size: string;
  };
  isOnline?: boolean;
}

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-10px)', opacity: 0 }),
        animate(
          '200ms ease-out',
          style({ transform: 'translateY(0)', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ transform: 'translateY(-10px)', opacity: 0 })
        ),
      ]),
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('150ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('150ms ease-in', style({ opacity: 0 }))]),
    ]),
  ],
})
export class NotificationListComponent {
  notificationCount = 0;
  activeTab = 'inbox';
  searchQuery = '';
  isOpen = false;

  notifications: Notification[] = [];

  displayedNotifications: Notification[] = [];
  readonly PAGE_SIZE = 3;
  currentPage = 1;
  showViewMore = true;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.updateDisplayedNotifications();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside && this.isOpen) {
      this.isOpen = false;
    }
  }

  markAllAsRead(): void {
    this.notificationCount = 0;
    this.notifications.forEach((notification) => {
      notification.read = true;
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  toggleNotifications(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const profileMenu =
      this.elementRef.nativeElement.parentElement?.querySelector(
        '.dropdown-menu'
      );
    if (profileMenu?.classList.contains('show')) {
      profileMenu.classList.remove('show');
    }
    this.isOpen = !this.isOpen;
  }

  downloadAttachment(notificationId: string): void {
    const notification = this.notifications.find(
      (n) => n.id === notificationId
    );
    if (notification?.attachment) {
      // Aquí implementarías la lógica real de descarga
      console.log(`Descargando ${notification.attachment.name}`);

      // Ejemplo de marcado como leído al descargar
      notification.read = true;
      this.notificationCount = Math.max(0, this.notificationCount - 1);
    }
  }

  updateDisplayedNotifications(): void {
    const startIndex = 0;
    const endIndex = this.currentPage * this.PAGE_SIZE;
    this.displayedNotifications = this.notifications.slice(
      startIndex,
      endIndex
    );
    this.showViewMore = endIndex < this.notifications.length;
  }

  loadMore(): void {
    this.currentPage++;
    this.updateDisplayedNotifications();
  }

  handleImageError(event: any): void {
    const img = event.target;
    img.src = 'assets/images/avatar-default.png';
  }
}
