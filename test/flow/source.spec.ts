import { source } from "@src/data/source";
import { fileUtils } from "@src/utils/file";
import { AST } from "@src/data/ast";
import { DataSource, FileDataSource } from "@src/entities/dataSource";
import { mock } from 'jest-mock-extended';

describe("sourceData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mainData = [
    { foo: 1, bar: "bar1" },
    { foo: 2, bar: "bar2" },
    { foo: 3, bar: "bar3" },
    { foo: 4, bar: "bar4" },
    { foo: 5, bar: "bar5" },
    { foo: 6, bar: "bar6" },
  ];

  it("should return main data when no joins", async () => {
    jest.spyOn(fileUtils, "readData").mockResolvedValue(mainData);
    const ast = mock<AST>(
      {
        mainfile: new FileDataSource("main.json").setAlias("@m"),
        joinFiles: {},
        variables: {}
      }
    );
    const result = await source(ast);
    expect(result).toEqual([
      { source: '@m', data: mainData }
    ]);
  });

  it("should also load join data", async () => {
    const joinData = [
      { value: 10 },
      { value: 20 },
    ];
    jest.spyOn(fileUtils, "readData")
      .mockResolvedValueOnce(mainData)
      .mockResolvedValueOnce(joinData);

    const ast = mock<AST>(
      {
        mainfile: new FileDataSource("main.json").setAlias("@m"),
        joinFiles: {
          "@j": new FileDataSource("join.json").setAlias("@j")
        },
        variables: {}
      }
    );
    const result = await source(ast);
    expect(result).toEqual([
      { source: "@m", data: mainData },
      { source: "@j", data: joinData, where: ast.joinFiles["@j"].filter }
    ]);
  });

  it("should not load the same file twice", async () => {
    const joins: Record<string, DataSource> = {
      "@j": new FileDataSource("main.json").setAlias("@j")
    };

    jest.spyOn(fileUtils, "readData")
      .mockResolvedValueOnce(mainData);

    const ast = mock<AST>(
      {
        mainfile: new FileDataSource("main.json").setAlias("@m"),
        joinFiles: joins,
        variables: {}
      }
    );
    const [main, join] = await source(ast);
    expect(main).toEqual({ source: "@m", data: mainData });
    expect(join).toEqual({ source: "@j", data: mainData, where: joins["@j"].filter });

    // Verify readData was only called once
    expect(fileUtils.readData).toHaveBeenCalledTimes(1);
  });

  it("should throw error if two aliases are the same", async () => {
    const ast = mock<AST>(
      {
        mainfile: new FileDataSource("main.json").setAlias("@j"),
        joinFiles: {
          "@j": new FileDataSource("join.json").setAlias("@j")
        },
        variables: {}
      }
    );
    await expect(source(ast))
      .rejects.toThrow("Duplicate alias: @j");
  });
});
