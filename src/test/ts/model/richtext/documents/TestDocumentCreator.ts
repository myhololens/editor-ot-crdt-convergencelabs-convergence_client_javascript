import {RichTextDocument} from "../../../../../main/ts/model/rt/richtext/model/RichTextDocument";
import {RichTextRootElement} from "../../../../../main/ts/model/rt/richtext/model/RichTextRootElement";
import {RichTextString} from "../../../../../main/ts/model/rt/richtext/model/RichTextString";
import {RichTextElement} from "../../../../../main/ts/model/rt/richtext/model/RichTextElement";
import {RichTextNode} from "../../../../../main/ts/model/rt/richtext/model/RichTextNode";

export class TestDocumentCreator {
  public static createDocument(data: DocumentData): RichTextDocument {
    const doc = new RichTextDocument();
    Object.keys(data).forEach((rootName) => {
      const root = TestDocumentCreator.createRoot(doc, rootName, data[rootName]);
      doc.addRoot(root);
    });

    return doc;
  }

  public static createRoot(doc: RichTextDocument, rootName: string, data: RootElementData): RichTextRootElement {
    const attrs = TestDocumentCreator.createAttributes(data.attributes);
    const root: RichTextRootElement = new RichTextRootElement(doc, rootName, data.name, attrs);
    if (data.children) {
      TestDocumentCreator.processChildren(doc, root, data.children);
    }
    return root;
  }

  public static createAttributes(attrs: { [key: string]: string }): Map<string, any> {
    const a = attrs || {};
    const result = new Map<string, any>();
    Object.keys(a).forEach((key) => result.set(key, a[key]));
    return result;
  }

  public static createNode(doc: RichTextDocument, parent: RichTextElement, data: NodeData): RichTextNode {
    switch (data.type) {
      case "element":
        return TestDocumentCreator.createElement(doc, parent, data as ElementData);
      case "string":
        return TestDocumentCreator.createString(doc, parent, data as StringData);
      default:
        throw new Error(`Invalid type: ${data.type}`);
    }
  }

  public static createElement(doc: RichTextDocument, parent: RichTextElement, data: ElementData): RichTextElement {
    const attrs = TestDocumentCreator.createAttributes(data.attributes);
    const element = new RichTextElement(doc, parent, data.name, attrs);
    if (data.children) {
      TestDocumentCreator.processChildren(doc, element, data.children);
    }
    return element;
  }

  public static createString(doc: RichTextDocument, parent: RichTextElement, data: StringData): RichTextString {
    const attrs = TestDocumentCreator.createAttributes(data.attributes);
    return new RichTextString(doc, parent, data.data, attrs);
  }

  public static processChildren(doc: RichTextDocument, parent: RichTextElement, children: NodeData[]): void {
    children.forEach(childData => {
      const node = TestDocumentCreator.createNode(doc, parent, childData);
      parent.appendChild(node);
    });
  }
}

export interface NodeData {
  type: string;
  attributes?: { [key: string]: any };
}

export interface ElementData extends NodeData {
  type: "element";
  name: string;
  children?: Array<StringData | ElementData>;
}

export interface RootElementData {
  name: string;
  attributes?: { [key: string]: any };
  children: Array<StringData | ElementData>;
}

export interface StringData extends NodeData {
  type: "string";
  data: string;
}

export type DocumentData = { [key: string]: RootElementData };
