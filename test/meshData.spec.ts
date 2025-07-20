import { FilterFunction } from '../src/filterFunction';
import { meshData, MeshedRow } from '../src/meshData';
describe("meshData", () => {
    it("should return the rows in source data if only one source is provided", () => {
        const sources = [
            {
                source: "@m",
                data: [
                    { id: 1, name: "John" },
                    { id: 2, name: "Jane" },
                ]
            }
        ];
        const result = meshData(sources);
        expect(result).toEqual([
            { "@m": { id: 1, name: "John" } },
            { "@m": { id: 2, name: "Jane" } },
        ]);
    });

    it("should perform cartesian multiplication if multiple sources are provided", () => {
        const sources = [
            {
                source: "@m",
                data: [
                    { id: 1, name: "John" },
                    { id: 2, name: "Jane" },
                ]
            },
            {
                source: "@j",
                data: [
                    { id: 1, name: "John" },
                    { id: 2, name: "Jane" },
                ]
            }
        ];
        const result = meshData(sources);
        expect(result).toEqual(expect.arrayContaining([
            { "@m": { id: 1, name: "John" }, "@j": { id: 1, name: "John" } },
            { "@m": { id: 1, name: "John" }, "@j": { id: 2, name: "Jane" } },
            { "@m": { id: 2, name: "Jane" }, "@j": { id: 1, name: "John" } },
            { "@m": { id: 2, name: "Jane" }, "@j": { id: 2, name: "Jane" } },
        ]));
    });

    it("should exclude rows that do not pass the where function", () => {
        const sources = [
            {
                source: "@m",
                data: [
                    { id: 1, name: "John" },
                    { id: 2, name: "Jane" },
                ]
            },
            {
                source: "@j",
                where: {
                    resolve: jest.fn().mockReturnValue(false)
                } as unknown as FilterFunction,
                data: [
                    { id: 1, name: "John" },
                    { id: 2, name: "Jane" },
                ]
            }
        ];
        const result = meshData(sources);
        expect(result).toEqual([
            { "@m": { id: 1, name: "John" } },
            { "@m": { id: 2, name: "Jane" } },
        ]);
    });

    it("should perform cartesian multiplication with more than two sources", () => {
        const sources = [
            {
                source: "@m",
                data: [
                    { id: 1, name: "John" },
                    { id: 2, name: "Jane" },
                ]
            },
            {
                source: "@j",
                data: [
                    { id: 1, name: "John" },
                    { id: 2, name: "Jane" },
                ]
            },
            {
                source: "@k",
                data: [
                    { id: 1, name: "Steve" },
                    { id: 2, name: "Mark" },
                ]
            }
        ];
        const result = meshData(sources);
        expect(result).toEqual(expect.arrayContaining([
            { "@m": { id: 1, name: "John" }, "@j": { id: 1, name: "John" }, "@k": { id: 1, name: "Steve" } },
            { "@m": { id: 1, name: "John" }, "@j": { id: 2, name: "Jane" }, "@k": { id: 1, name: "Steve" } },
            { "@m": { id: 2, name: "Jane" }, "@j": { id: 1, name: "John" }, "@k": { id: 1, name: "Steve" } },
            { "@m": { id: 2, name: "Jane" }, "@j": { id: 2, name: "Jane" }, "@k": { id: 1, name: "Steve" } },
            { "@m": { id: 1, name: "John" }, "@j": { id: 1, name: "John" }, "@k": { id: 2, name: "Mark" } },
            { "@m": { id: 1, name: "John" }, "@j": { id: 2, name: "Jane" }, "@k": { id: 2, name: "Mark" } },
            { "@m": { id: 2, name: "Jane" }, "@j": { id: 1, name: "John" }, "@k": { id: 2, name: "Mark" } },
            { "@m": { id: 2, name: "Jane" }, "@j": { id: 2, name: "Jane" }, "@k": { id: 2, name: "Mark" } },
        ]));
    });

    it("should perform cartesian multiplication with rows that pass WHERE clause", () => {
        const sources = [
            {
                source: "@m",
                data: [
                    { id: 1, name: "John" },
                    { id: 2, name: "Jane" },
                ]
            },
            {
                source: "@j",
                where: {
                    resolve: jest.fn().mockImplementation((row: MeshedRow) => {
                        //@ts-ignore
                        return row["@j"].id === 2;
                    })
                } as unknown as FilterFunction,
                data: [
                    { id: 1, name: "John" },
                    { id: 2, name: "Jane" },
                ]
            },
            {
                source: "@k",
                where: {
                    resolve: jest.fn().mockImplementation((row: MeshedRow) => {
                        //@ts-ignore
                        return row["@k"].id === 2;
                    })
                } as unknown as FilterFunction,
                data: [
                    { id: 1, name: "Steve" },
                    { id: 2, name: "Mark" },
                ]
            }
        ];
        const result = meshData(sources);
        expect(result).toEqual(expect.arrayContaining([
            { "@m": { id: 1, name: "John" }, "@j": { id: 2, name: "Jane" }, "@k": { id: 2, name: "Mark" } },
            { "@m": { id: 2, name: "Jane" }, "@j": { id: 2, name: "Jane" }, "@k": { id: 2, name: "Mark" } },
        ]));
    });
})