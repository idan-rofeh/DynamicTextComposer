import { Component, ElementRef, Input, Renderer2, ViewChild, forwardRef } from '@angular/core';
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
  private caretPos: number = 0;
  private onChange: (value: string) => void = () => {};
  public onTouched: () => void = () => {};
  placeholders = ['Agent Name', 'Company Name', 'First Name', 'Last Name'];

  @ViewChild('messageCmp', { static: false }) messageCmp!: ElementRef;

  @Input() initialVal: string = '';
  constructor(private renderer: Renderer2) {}

  writeValue(value: string): void {}

  ngAfterViewInit(): void {
    if (this.initialVal) {
      this.renderer.setProperty(this.messageCmp.nativeElement, 'innerHTML', this.convertToHtml(this.initialVal));
    };
    document.addEventListener('selectionchange', this.onSelectionChange);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onInput(event: Event): void {
    const target = event.target as any;
    const {childNodes} = target;
    const message = this.getFormValue(childNodes);
    if (this.onChange) {
      this.onChange(message);
    }
    if (this.onTouched) {
      this.onTouched();
    }
    this.caretPos = this.getCaretPos();
  }

  onPlaceholderClick(p: string): void {
    const el = this.messageCmp.nativeElement;
    if (!el.innerHTML) {
      el.innerHTML = '\u200b';
    };
    el.focus();
    this.setCaretPosition();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.className = 'highlight';
    span.contentEditable = 'false';
    span.textContent = p;

    range.deleteContents();
    range.insertNode(span);

    const spaceNode = document.createTextNode(' ');
    span.after(spaceNode);
  
    range.setStartAfter(spaceNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    el.dispatchEvent(new Event('input', { bubbles: false }));
  }

  setCaretPosition(): void {
    const offset = this.caretPos;
    const range = document.createRange();
    const sel = window.getSelection();
    const element = this.messageCmp.nativeElement;
    const nodes = this.getTextNodes(element);
    let currentOffset = 0;

    for (const node of nodes) {
      const nodeLength = node.textContent?.length || 0;

      if (currentOffset + nodeLength >= offset) {
        range.setStart(node, offset - currentOffset);
        range.collapse(true);
        break;
      }

      currentOffset += nodeLength;
    }

    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }

    element.focus();
  }
  
  getTextNodes(node: Node): Node[] {
    const textNodes: Node[] = [];
    if (node.nodeType === Node.TEXT_NODE) {
      textNodes.push(node);
    } else {
      const children = Array.from(node.childNodes);
      for (const child of children) {
        textNodes.push(...this.getTextNodes(child));
      }
    }
    return textNodes;
  }

  getCaretPos(): number {
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    if (!range) return 0;
    const clonedRange = range.cloneRange();
    clonedRange.selectNodeContents(this.messageCmp.nativeElement);
    clonedRange.setEnd(range.endContainer, range.endOffset);
    
    return clonedRange.toString().length;
  }

  getFormValue(nodeList: NodeList): string {
    let val = '';
    nodeList.forEach((n: any) => {
      let text = '';
      switch (n.nodeName) {
        case ('#text'):
          text = n.data;
          break;
        case ('SPAN'):
          text = `[${n.textContent}]`;
          break;
        case ('BR'):
          text = '\n'
          break;
        default:
          text = '';
      }
      val += text;
    })

    return val;
  }

  convertToHtml(value: string): string {
    let html = value.replace(/\n/g, '<br/>');
    html = html.replace(/\[([^\]]+)\]/g, '<span class="highlight" contentEditable="false">$1</span>');

    return html;
  }

  onSelectionChange = (): void => {
    const selection = document.getSelection();
    if (selection && this.messageCmp.nativeElement.contains(selection.anchorNode)) {
      this.caretPos = this.getCaretPos();
    }
  }

  ngOnDestroy(): void {
    document.removeEventListener('selectionchange', this.onSelectionChange);
  }
}