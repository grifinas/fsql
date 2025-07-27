import { limit } from "../../src/data/limit";
import { AST } from "../../src/data/ast";

describe("limit function", () => {
  const testData = [
    { id: 1, name: "Alice", age: 25 },
    { id: 2, name: "Bob", age: 30 },
    { id: 3, name: "Charlie", age: 35 },
    { id: 4, name: "David", age: 40 },
    { id: 5, name: "Eve", age: 45 }
  ];

  test("should return all data when no limit or offset", () => {
    const ast = new AST();
    const result = limit(testData, ast);
    
    expect(result).toEqual(testData);
  });

  test("should limit number of results", () => {
    const ast = new AST();
    ast.setLimit(3);
    const result = limit(testData, ast);
    
    expect(result).toHaveLength(3);
    expect(result).toEqual([
      { id: 1, name: "Alice", age: 25 },
      { id: 2, name: "Bob", age: 30 },
      { id: 3, name: "Charlie", age: 35 }
    ]);
  });

  test("should skip specified number of results with offset", () => {
    const ast = new AST();
    ast.setOffset(2);
    const result = limit(testData, ast);
    
    expect(result).toHaveLength(3);
    expect(result).toEqual([
      { id: 3, name: "Charlie", age: 35 },
      { id: 4, name: "David", age: 40 },
      { id: 5, name: "Eve", age: 45 }
    ]);
  });

  test("should apply both limit and offset", () => {
    const ast = new AST();
    ast.setLimit(2);
    ast.setOffset(1);
    const result = limit(testData, ast);
    
    expect(result).toHaveLength(2);
    expect(result).toEqual([
      { id: 2, name: "Bob", age: 30 },
      { id: 3, name: "Charlie", age: 35 }
    ]);
  });

  test("should return empty array when limit is 0", () => {
    const ast = new AST();
    ast.setLimit(0);
    const result = limit(testData, ast);
    
    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  test("should return empty array when offset is beyond data length", () => {
    const ast = new AST();
    ast.setOffset(10);
    const result = limit(testData, ast);
    
    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  test("should handle offset at exact data length", () => {
    const ast = new AST();
    ast.setOffset(5); // testData has 5 items
    const result = limit(testData, ast);
    
    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  test("should handle limit larger than remaining data", () => {
    const ast = new AST();
    ast.setOffset(3);
    ast.setLimit(10); // Only 2 items remain after offset 3
    const result = limit(testData, ast);
    
    expect(result).toHaveLength(2);
    expect(result).toEqual([
      { id: 4, name: "David", age: 40 },
      { id: 5, name: "Eve", age: 45 }
    ]);
  });
});
