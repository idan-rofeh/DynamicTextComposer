import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {
  name: string = '';
  phone: string = '';
  form!: FormGroup;
  openingSentence: string = "Hi, I'm [Agent Name] from [Company Name]. How can I help you today?";

  constructor(private fb: FormBuilder) {}


  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.name],
      phone: [this.phone],
      openingSentence: [this.openingSentence]
    });
  }
}
