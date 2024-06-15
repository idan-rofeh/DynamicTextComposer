import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { FormComponent } from './components/form/form.component';
import { SideTextComponent } from './components/side-text/side-text.component';

@NgModule({
  declarations: [
    AppComponent,
    FormComponent,
    SideTextComponent,
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
