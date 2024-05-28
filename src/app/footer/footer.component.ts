import { Component, OnInit, OnDestroy } from '@angular/core';
import $ from 'jquery';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  generateBalls(){
    
  }



}

function generateBalls():void {
  for (let i = 0; i < Math.floor(window.innerWidth / 20); i++) {
    $(".gooey-animations").append(`<div class="ball"></div>`);
    const colors = ['#000', '#fff'];
    $(".ball").eq(i).css({
      "bottom": "0px",
      "left": Math.random() * (window.innerWidth - 100),
      "animation-delay": Math.random() * 5 + "s",
      "transform": "translateY(" + Math.random() * 10 + "px)",
      "background-color": colors[i % 2]
    });
  }
}

  generateBalls();

    window.addEventListener('resize',function(e) {
  $(".gooey-animations .ball").remove();
  generateBalls();
    });

