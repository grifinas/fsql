import { AST } from "../../src/entities/ast";
import { FieldProperty } from "../../src/entities/property";

describe("AST", () => {
  describe("addField", () => {
    it('should allow to add field with implicit alias', () => {
      const ast = new AST();
      const field = new FieldProperty(null, "bar")
      ast.addField(field);
      expect(ast.fields).toEqual([field]);
    });

    it("should not allow to add the same alias twice", () => {
      const ast = new AST();
      ast.addField(new FieldProperty(null, "real1").setAlias("alias1"));
      expect(() => ast.addField(new FieldProperty(null, "real2").setAlias("alias1"))).toThrow();
    });

    it("should not allow adding the same field twice", () => {
      const ast = new AST();
      const field = new FieldProperty(null, "bar")
      ast.addField(field);
      expect(() => ast.addField(field)).toThrow();
    });

    it("should allow to add the same field twice if one is aliased and the other is not", () => {
      const ast = new AST();
      ast.addField(new FieldProperty(null, "bar"));
      ast.addField(new FieldProperty(null, "baz").setAlias("different"));
      expect(ast.fields).toEqual([
        new FieldProperty(null, "bar"),
        new FieldProperty(null, "baz").setAlias("different")
      ]);
    });

    it("should set all to false when adding fields", () => {
      const ast = new AST();
      expect(ast.all).toBe(true);
      ast.addField(new FieldProperty(null, "bar"));
      expect(ast.all).toBe(false);
    });
  });
});
