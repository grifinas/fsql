import { sourceData } from "../src/sourceData";
import { fileUtils } from "../src/utils/file";
import { FilterFunction } from "../src/filterFunction";
import { JoinMap } from "../src/ast";
import { FileDataSource } from "../src/dataSource";

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
    const result = await sourceData(new FileDataSource("main.json").setAlias("@m"), {}, {});
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

    const result = await sourceData(new FileDataSource("main.json").setAlias("@m"), joins, {});
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

    const result = await sourceData(new FileDataSource("main.json").setAlias("@m"), joins, {});
    expect(result).toEqual([
      { source: "@m", data: mainData },
      { source: "@j", where: blankFilter, data: mainData }
    ]);

    // Verify readJson was only called once
    expect(fileUtils.readJson).toHaveBeenCalledTimes(1);
  });

  it("should throw error if two aliases are the same", async () => {
    const joins: JoinMap = {
      "@j": { where: blankFilter, source: new FileDataSource("join.json").setAlias("@j") }
    };
    await expect(sourceData(new FileDataSource("main.json").setAlias("@j"), joins, {}))
      .rejects.toThrow("Duplicate alias: @j");
  });



  // it("should join single table with all rows", async () => {
  //   const joinData = {
  //     "join.json": [
  //       { value: 10 },
  //       { value: 20 },
  //     ]
  //   };
  //   const joins: JoinMap = {
  //     "join.json": { where: blankFilter, alias: "@j" }
  //   };

  //   const result = await sourceData({ field: "main.json", alias: "@m" }, joins, {});
  //   expect(result).toEqual([
  //     { id: 1, name: "A", value: 10 },
  //     { id: 2, name: "B", value: 10 },
  //     { id: 1, name: "A", value: 20 },
  //     { id: 2, name: "B", value: 20 },
  //   ]);
  // });

  // it("should join single table with filtered rows", async () => {
  //   const joinData = {
  //     "join.json": [
  //       { value: 10 },
  //       { value: 20 },
  //     ]
  //   };
  //   const joins: JoinMap = {
  //     "join.json": {
  //       where: ((row: object) => (row as { value: number }).value > 15) as FilterFunction,
  //       alias: "@j"
  //     }
  //   };

  //   const result = await sourceData({ fiel d: "main.json", alias: "@m" }, joins, {});
  //   expect(result).toEqual([
  //     { id: 1, name: "A", value: 20 },
  //     { id: 2, name: "B", value: 20 },
  //   ]);
  // });

  // it("should join multiple tables", async () => {
  //   const joins: JoinMap = {
  //     "join1.json": { where: blankFilter, alias: "@j1" },
  //     "join2.json": { where: blankFilter, alias: "@j2" },
  //   };

  //   const result = await sourceData({ file: "main.json", alias: "@m" }, joins, {});
  //   expect(result).toEqual([
  //     { id: 1, a: "A", b: "B" }, 
  //   ]);  
  // });

  // it("should throw error if join data not found", async () => {
  //   const joins: JoinMap = {
  //     "missing.json": { where: blankFilter, alias: "@j" }
  //   };

  //   await expect(sourceData({ file: "main.json", alias: "@m" }, joins))
  //     .toThrow("No data found for join file: missing.json");
  // });
});
