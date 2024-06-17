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
  openingSentence: string = '';
  form!: FormGroup;

  constructor(private fb: FormBuilder) {}


  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.name],
      phone: [this.phone],
      openingSentence: [this.openingSentence]
    });
  }
}
