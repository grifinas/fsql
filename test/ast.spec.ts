import { AST } from "../src/ast";
import { fileUtils } from "../src/utils/file";

describe("AST", () => {
  const mainData = [
    { foo: 1, bar: "bar1" },
    { foo: 2, bar: "bar2" },
    { foo: 3, bar: "bar3" },
    { foo: 4, bar: "bar4" },
    { foo: 5, bar: "bar5" },
    { foo: 6, bar: "bar6" },
  ];

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should parse the mainFile", async () => {
    jest.spyOn(fileUtils, "readJson").mockResolvedValue(mainData);

    const ast = new AST();
    ast.mainfile = "foo/bar.txt";
    ast.all = true;
    const result = await ast.execute();

    expect(result).toEqual(mainData);
  });

  it("should parse the mainFile and return what is selected", async () => {
    jest.spyOn(fileUtils, "readJson").mockResolvedValue(mainData);
    const ast = new AST();
    ast.mainfile = "foo/bar.txt";
    ast.addField("foo");
    const result = await ast.execute();

    expect(result).toEqual([
      { foo: 1 },
      { foo: 2 },
      { foo: 3 },
      { foo: 4 },
      { foo: 5 },
      { foo: 6 },
    ]);
  });

  it("should parse all of the join files", async () => {
    const mainData = [
      { foo: 1, bar: "bar1" },
      { foo: 2, bar: "bar2" },
    ];
    const joinData = [{ baz: "bazA" }, { baz: "bazB" }, { baz: "bazC" }];

    jest
      .spyOn(fileUtils, "readJson")
      .mockImplementationOnce(async () => mainData)
      .mockImplementationOnce(async () => joinData);

    const ast = new AST();
    ast.mainfile = "foo/bar.txt";
    ast.joinFiles = {
      "a/b/c.txt": () => true,
    };
    ast.all = true;
    const result = await ast.execute();

    expect(result).toEqual([
      { foo: 1, bar: "bar1", baz: "bazA" },
      { foo: 2, bar: "bar2", baz: "bazA" },
      { foo: 1, bar: "bar1", baz: "bazB" },
      { foo: 2, bar: "bar2", baz: "bazB" },
      { foo: 1, bar: "bar1", baz: "bazC" },
      { foo: 2, bar: "bar2", baz: "bazC" },
    ]);
  });

  it("should multiply all join responses", async () => {
    const mainData = [
      { foo: 1, bar: "bar1" },
      { foo: 2, bar: "bar2" },
    ];
    const joinData1 = [{ baz: "bazA" }, { baz: "bazB" }];
    const joinData2 = [{ foz: "fozQ" }, { foz: "fozW" }];

    jest
      .spyOn(fileUtils, "readJson")
      .mockImplementationOnce(async () => mainData)
      .mockImplementationOnce(async () => joinData1)
      .mockImplementationOnce(async () => joinData2);

    const ast = new AST();
    ast.mainfile = "foo/bar.txt";
    ast.joinFiles = {
      "a/b/c.txt": () => true,
      "d/e/f.txt": () => true,
    };
    ast.all = true;
    const result = await ast.execute();

    expect(result).toEqual(expect.arrayContaining([
      { foo: 1, bar: "bar1", baz: "bazA", foz: "fozQ" },
      { foo: 2, bar: "bar2", baz: "bazA", foz: "fozQ" },
      { foo: 1, bar: "bar1", baz: "bazA", foz: "fozW" },
      { foo: 2, bar: "bar2", baz: "bazA", foz: "fozW" },
      { foo: 1, bar: "bar1", baz: "bazB", foz: "fozQ" },
      { foo: 2, bar: "bar2", baz: "bazB", foz: "fozQ" },
      { foo: 1, bar: "bar1", baz: "bazB", foz: "fozW" },
      { foo: 2, bar: "bar2", baz: "bazB", foz: "fozW" },
    ]));
  });

  it("should allow selecting from variables", async () => {
    const ast = new AST();
    const input = [
      { foo: 1, bar: "bar1" },
      { foo: 2, bar: "bar2" },
    ];

    ast.all = true;
    ast.mainfile = "@var";
    ast.assignVariable('var', input);
    const result = await ast.execute();
    expect(result).toEqual(input);
  });

  it("should allow to join with variables", async () => {
    const ast = new AST();
    const mainData = [
      { foo: 1, bar: "bar1" },
      { foo: 2, bar: "bar2" },
    ];
    const joinData1 = [{ baz: "bazA" }, { baz: "bazB" }];

    jest.spyOn(fileUtils, "readJson").mockResolvedValueOnce(mainData);

    ast.all = true;
    ast.mainfile = "foo/bar.txt";
    ast.assignVariable('var', joinData1);
    ast.joinFiles = {
      "@var": () => true,
    };
    const result = await ast.execute();
    expect(result).toEqual(expect.arrayContaining([
      { foo: 1, bar: "bar1", baz: "bazA" },
      { foo: 2, bar: "bar2", baz: "bazA" },
      { foo: 1, bar: "bar1", baz: "bazB" },
      { foo: 2, bar: "bar2", baz: "bazB" },
    ]));
  });
});
