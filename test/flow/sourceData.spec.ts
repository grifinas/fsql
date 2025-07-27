import { source } from "@src/data/source";
import { fileUtils } from "@src/utils/file";
import { FilterFunction } from "@src/entities/filterFunction";
import { AST, JoinMap } from "@src/data/ast";
import { FileDataSource } from "@src/entities/dataSource";
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

  const blankFilter = {
    resolve: () => true
  } as unknown as FilterFunction;

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should return main data when no joins", async () => {
    jest.spyOn(fileUtils, "readJson").mockResolvedValue(mainData);
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
    const joins: JoinMap = {
      "@j": { where: blankFilter, source: new FileDataSource("join.json").setAlias("@j") }
    };
    jest.spyOn(fileUtils, "readJson")
      .mockResolvedValueOnce(mainData)
      .mockResolvedValueOnce(joinData);

    const ast = mock<AST>(
      {
        mainfile: new FileDataSource("main.json").setAlias("@m"),
        joinFiles: {
          "@j": { where: blankFilter, source: new FileDataSource("join.json").setAlias("@j") }
        },
        variables: {}
      }
    );
    const result = await source(ast);
    expect(result).toEqual([
      { source: "@m", data: mainData },
      { source: "@j", where: blankFilter, data: joinData }
    ]);
  });

  it("should not load the same file twice", async () => {
    const joins: JoinMap = {
      "@j": { where: blankFilter, source: new FileDataSource("main.json").setAlias("@j") }
    };

    jest.spyOn(fileUtils, "readJson")
      .mockResolvedValueOnce(mainData);

    const ast = mock<AST>(
      {
        mainfile: new FileDataSource("main.json").setAlias("@m"),
        joinFiles: joins,
        variables: {}
      }
    );
    const result = await source(ast);
    expect(result).toEqual([
      { source: "@m", data: mainData },
      { source: "@j", where: blankFilter, data: mainData }
    ]);

    // Verify readJson was only called once
    expect(fileUtils.readJson).toHaveBeenCalledTimes(1);
  });

  it("should throw error if two aliases are the same", async () => {
    const ast = mock<AST>(
      {
        mainfile: new FileDataSource("main.json").setAlias("@j"),
        joinFiles: {
          "@j": { where: blankFilter, source: new FileDataSource("join.json").setAlias("@j") }
        },
        variables: {}
      }
    );
    await expect(source(ast))
      .rejects.toThrow("Duplicate alias: @j");
  });
});
