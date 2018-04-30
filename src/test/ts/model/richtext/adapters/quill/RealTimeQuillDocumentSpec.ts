import {expect} from "chai";
import {createDoc, GANDALF} from "./deltas";
import {RealTimeQuillDocument} from "../../../../../../main/ts/model/rt/richtext/adapters/quill";
// import * as Delta from "quill-delta";

describe("RealTimeQuillDocument", () => {
  describe("#getValue", () => {
    it("Returns correct delta.", () => {
      const quillDoc = new RealTimeQuillDocument(createDoc(GANDALF));
      expect(quillDoc.getValue().ops).to.deep.eq(GANDALF.ops);
    });
  });

  // describe("#updateContents", () => {
  //   it("Returns correct delta.", () => {
  //     const quillDoc = new RealTimeQuillDocument(createDoc(GANDALF));
  //     const op: any = {
  //       insert: "foo",
  //       attributes: {}
  //     };
  //     quillDoc.updateContents(new Delta([op]));
  //     expect(quillDoc.getValue().ops).to.deep.eq([op].concat(GANDALF.ops));
  //   });
  // });
});
