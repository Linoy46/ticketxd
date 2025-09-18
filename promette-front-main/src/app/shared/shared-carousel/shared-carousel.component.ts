import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'shared-carousel-component',
  imports: [ CommonModule],
  templateUrl: './shared-carousel.component.html',
  styleUrls: ['./shared-carousel.component.css']
})
export class SharedCarouselComponent implements OnInit {
  advices: any[] = [];

  constructor() {}

  ngOnInit() {

      this.advices = [
		{
		  "title": "Advice 1",
		  "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
		},
		{
		  "title": "Advice 2",
		  "content": "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
		},
		{
		  "title": "Advice 3",
		  "content": "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
		}
	  ]
	  ;

  }
}
