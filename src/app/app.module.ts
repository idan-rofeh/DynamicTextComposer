import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { FormComponent } from './components/form/form.component';
import { SideTextComponent } from './components/side-text/side-text.component';
import { ReactiveFormsModule } from '@angular/forms';
import { OpeningSentenceComponent } from './components/opening-sentence/opening-sentence.component';

@NgModule({
  declarations: [
    AppComponent,
    FormComponent,
    SideTextComponent,
    OpeningSentenceComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
