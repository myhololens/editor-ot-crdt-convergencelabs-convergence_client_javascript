import {RichTextContentTypes} from "../../../../../main/ts/model/rt/richtext/model/RichTextContentType";
import {RichTextString} from "../../../../../main/ts/model/rt/richtext/model/RichTextString";
import {RichTextStringFragment} from "../../../../../main/ts/model/rt/richtext/model/RichTextStringFragment";
import {RichTextIterator} from "../../../../../main/ts/model/rt/richtext/model/RichTextIterator";
import {RichTextContent} from "../../../../../main/ts/model/rt/richtext/model/RichTextContent";
import {RichTextNode} from "../../../../../main/ts/model/rt/richtext/model/RichTextNode";

export class RichTextIterationValidator {
  private _expectations: IterationExpectation[];
  private _iterator: RichTextIterator;

  constructor(iterator: RichTextIterator) {
    this._iterator = iterator;
    this._expectations = [];
  }

  public addNodeExpectation(node: RichTextNode): void {
    this.addExpectation(IterationExpectation.ofNode(node));
  }

  public addStringFragmentExpectation(str: RichTextString, start: number, end?: number): void {
    if (end === undefined) {
      end = str.getData().length - 1;
    }

    this.addExpectation(IterationExpectation.ofStringFragment(str, start, end));
  }

  public addExpectation(expectation: IterationExpectation): void {
    this._expectations.push(expectation);
  }

  public validate(): void {
    for (let content of this._iterator) {
      if (this._expectations.length === 0) {
        throw new Error(`The iterator produced content but none was expected: ${content}`);
      }

      const expectation = this._expectations.shift();
      expectation.assertExpectation(content);
    }
  }
}

export abstract class IterationExpectation {
  public static ofNode(node: RichTextNode): IterationExpectation {
    return new NodeExpectation(node);
  }

  public static ofStringFragment(str: RichTextString, start: number, end: number): IterationExpectation {
    return new StringFragmentExpectation(new RichTextStringFragment(str, start, (end - start) + 1));
  }

  public abstract assertExpectation(content: RichTextContent): void;

  protected _throw(msg: string, expected: any, actual: any): void {
    throw new Error(`${msg}:\n\tExpected: ${expected}\n\t   Found: ${actual}\n`);
  }
}

export class NodeExpectation extends IterationExpectation {
  private _node: RichTextNode;

  constructor(node: RichTextNode) {
    super();
    this._node = node;
  }

  public assertExpectation(content: RichTextContent): void {
    if (content !== this._node) {
      this._throw("The expected node was not found", this._node, content);
    }
  }
}

export class StringFragmentExpectation extends IterationExpectation {
  private _stringFragment: RichTextStringFragment;

  constructor(stringFragment: RichTextStringFragment) {
    super();
    this._stringFragment = stringFragment;
  }

  public assertExpectation(content: RichTextContent): void {
    if (!content.isA(RichTextContentTypes.STRING_FRAGMENT)) {
      this._throw("The content was not a string fragment", this._stringFragment, content);
    }

    const stringFragment = content as RichTextStringFragment;

    if (stringFragment.getString() !== this._stringFragment.getString()) {
      this._throw("The wrong string node was wrapped", this._stringFragment, content);
    }

    if (stringFragment.index() !== this._stringFragment.index() ||
      stringFragment.length() !== this._stringFragment.length()) {
      this._throw("The string indices were not correct", this._stringFragment, content);
    }
  }
}
