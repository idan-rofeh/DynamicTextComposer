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
    if (!this.innerValue) return;
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
    let isHighlightAdded = false;

    this.placeholders.forEach(placeholder => {
      const regex = new RegExp(`\\[${placeholder}\\]`, 'g');
      const hasPlaceholder = content.match(regex);
      if (!isHighlightAdded && hasPlaceholder) isHighlightAdded = true;
      if (hasPlaceholder) content = content.replace(regex, `<span class="highlight" contenteditable="false">${placeholder}</span>`);
    });
    const currCaretPos = this.getCaretPos(this.messageCmp.nativeElement, isHighlightAdded);
    this.renderer.setProperty(this.messageCmp.nativeElement, 'innerHTML', content);
    this.setCaretPosition(currCaretPos);
  }

  setCaretPosition(offset: number): void {
    const range = document.createRange();
    const sel = window.getSelection();
  
    const element = this.messageCmp.nativeElement;
    const nodes = this.getTextNodes(element);
    let currentOffset = 0;
    let totalLength = 0;
  
    // Calculate the total length of all text nodes
    nodes.forEach(node => {
      totalLength += node.textContent?.length ?? 0;
    });
  
    // If the offset is larger than the total length, set the caret at the end
    if (offset > totalLength) {
      offset = totalLength;
    }
  
    for (const node of nodes) {
      const nodeLength = node.textContent?.length ?? 0;
  
      if (currentOffset + nodeLength >= offset) {
        const parentNode = node.parentNode as HTMLElement;
        if (parentNode?.classList.contains('highlight')) {
          range.setStartAfter(parentNode);
        } else {
          range.setStart(node, offset - currentOffset);
        }
        range.collapse(true);
        break;
      }
  
      currentOffset += nodeLength;
    }
  
    if (currentOffset > offset) {
      range.setStart(element, element.childNodes.length || 0);
      range.collapse(true);
    }
  
    sel?.removeAllRanges();
    sel?.addRange(range);
    element.focus();
  }
  
  getTextNodes(node: Node): Node[] {
    const textNodes: Node[] = [];
    if (node.nodeType === Node.TEXT_NODE) {
      textNodes.push(node);
    } else {
      const children = Array.from(node.childNodes); // Convert NodeListOf<ChildNode> to Array
      for (const child of children) {
        textNodes.push(...this.getTextNodes(child));
      }
    }
    return textNodes;
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

  getCaretPos(element: HTMLElement, isHighlightAdded: boolean): number {
    const selection = window.getSelection();
    let caretOffset = 0;

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      caretOffset = preCaretRange.toString().length;
    }

    // account for extra bracket characters
    if (isHighlightAdded) caretOffset -= 2;
    return caretOffset;
  }
}
