import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PiSliderComponent } from './pi-slider/pi-slider.component';

const routes: Routes = [{
  path:'slider',
  component:PiSliderComponent
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
