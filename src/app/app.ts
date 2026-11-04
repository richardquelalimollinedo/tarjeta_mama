import { Component, signal } from '@angular/core';
import { TarjetaMemorial } from './tarjeta-memorial/tarjeta-memorial';

@Component({
  imports: [TarjetaMemorial],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  
}
