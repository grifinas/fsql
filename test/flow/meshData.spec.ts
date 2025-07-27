import { FilterFunction } from "../../src/entities/filterFunction";
import { mesh } from "../../src/data/mesh";
import { MeshedRow } from "../../src/types";
import { mock } from 'jest-mock-extended';

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
        const result = mesh(sources);
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
        const result = mesh(sources);
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
                where: mock<FilterFunction>({
                    resolve: jest.fn().mockReturnValue(false)
                }),
                data: [
                    { id: 1, name: "John" },
                    { id: 2, name: "Jane" },
                ]
            }
        ];
        const result = mesh(sources);
        expect(result).toEqual([]);
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
        const result = mesh(sources);
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
        const result = mesh(sources);
        expect(result).toEqual(expect.arrayContaining([
            { "@m": { id: 1, name: "John" }, "@j": { id: 2, name: "Jane" }, "@k": { id: 2, name: "Mark" } },
            { "@m": { id: 2, name: "Jane" }, "@j": { id: 2, name: "Jane" }, "@k": { id: 2, name: "Mark" } },
        ]));
    });

    it('should work', () => {
        // Minimal mock data with id, pairID, and name
        const mockFile = [
            { id: 1, pairID: 3, name: "First Item" },
            { id: 2, pairID: 5, name: "Second Item" },
            { id: 3, pairID: 1, name: "Third Item" },
            { id: 4, pairID: null, name: "Fourth Item" },
            { id: 5, pairID: 2, name: "Fifth Item" }
        ];

        const sources = [
            {
                source: "@main",
                data: mockFile
            },
            {
                source: "@sub",
                where: mock<FilterFunction>({
                    resolve: jest.fn().mockImplementation((row: MeshedRow) => {
                        //@ts-ignore
                        return row["@main"].pairID === row["@sub"].id;
                    })
                }),
                data: mockFile
            },
        ];

        const result = mesh(sources);
        expect(result.length).toBe(4);
    })
})