import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {

  name: string;
  phone: string;
  openingSentence: string;

  constructor() {
    this.name = '';
    this.phone = '';
    this.openingSentence = '';
  }

  ngOnInit(): void {
  }

}
