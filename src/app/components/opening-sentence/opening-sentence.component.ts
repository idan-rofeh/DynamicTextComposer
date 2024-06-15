import { Component, ElementRef, Renderer2, ViewChild, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-opening-sentence',
  templateUrl: './opening-sentence.component.html',
  styleUrls: ['./opening-sentence.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OpeningSentenceComponent),
      multi: true
    }
  ]
})
export class OpeningSentenceComponent implements ControlValueAccessor {
  private innerValue: string = '';
  private text: string = ''
  private onChange: (value: string) => void = () => {};
  public onTouched: () => void = () => {};
  placeholders = ['Agent Name', 'Company Name', 'First Name', 'Last Name'];

  @ViewChild('messageCmp', { static: false }) messageCmp!: ElementRef;

  constructor(private renderer: Renderer2) {}

  writeValue(value: string): void {
    this.innerValue = value || '';
    this.updateHighlightedText();
  }

  // Register the function to call when the value changes
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  // Register the function to call when the control is touched
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onInput(event: Event): void {
    const input = event.target as HTMLDivElement;
    this.innerValue = input.innerText;
    this.updateHighlightedText();
    if (this.onChange) {
      this.onChange(this.innerValue);
    }
    if (this.onTouched) {
      this.onTouched();
    }
  }

  updateHighlightedText(): void {
    let content = this.messageCmp.nativeElement?.innerHTML || '';

    this.placeholders.forEach(placeholder => {
      const regex = new RegExp(`\\[${placeholder}\\]`, 'g');
      content = content.replace(regex, `<span class="highlight" contenteditable="false">${placeholder}</span>`);
    });
    const currCaretPos = this.getCaretPos(this.messageCmp.nativeElement);
    this.renderer.setProperty(this.messageCmp.nativeElement, 'innerHTML', content);
    this.setCaretPosition(currCaretPos);
  }

  setCaretPosition(currCaretPos: number): void {
    const range = document.createRange();
    const sel = window.getSelection();
    const {lastChild} =this.messageCmp.nativeElement;
    if (lastChild) {
      range.setStartAfter(lastChild);
      range.collapse(true);
    }
    sel?.removeAllRanges();
    sel?.addRange(range);
  }

  createRange(targetPosition: number):any {
    const node = this.messageCmp.nativeElement;
    let range = document.createRange();
    range.selectNode(node);
    range.setStart(node, 0);

    let pos = 0;
    const stack = [node];
    while (stack.length > 0) {
        const current = stack.pop();

        if (current.nodeType === Node.TEXT_NODE) {
            const len = current.textContent.length;
            if (pos + len >= targetPosition) {
                range.setEnd(current, targetPosition - pos);
                return range;
            }
            pos += len;
        } else if (current.childNodes && current.childNodes.length > 0) {
            for (let i = current.childNodes.length - 1; i >= 0; i--) {
                stack.push(current.childNodes[i]);
            }
        }
    }

    range.setEnd(node, node.childNodes.length);
    return range;
};

  getCaretPos(element: HTMLElement): number {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return 0;
    }
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    return preCaretRange.toString().length;
  }
}
