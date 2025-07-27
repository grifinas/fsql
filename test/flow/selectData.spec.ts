import { AST } from '../../src/data/ast';
import { FieldProperty, Property } from '../../src/entities/property';
import { select } from '../../src/data/select';
import { MeshedRow } from '../../src/types';
import { mock } from 'jest-mock-extended';

describe('selectData', () => {
  describe('when fields array is empty (SELECT *)', () => {
    const emptyFields = mock<AST>({
      fields: [],
    });

    it('should return an empty array if rows are empty', () => {
      const rows: MeshedRow[] = [];
      expect(select(rows, emptyFields)).toEqual([]);
    });

    it('should collapse a single row with a single source', () => {
      const rows: MeshedRow[] = [
        { '@sourceA': { id: 1, name: 'Alice' } },
      ];
      expect(select(rows, emptyFields)).toEqual([
        { id: 1, name: 'Alice' },
      ]);
    });

    it('should collapse a single row with multiple sources', () => {
      const rows: MeshedRow[] = [
        {
          '@sourceA': { id: 1, name: 'Alice' },
          '@sourceB': { age: 30, city: 'New York' },
        },
      ];
      expect(select(rows, emptyFields)).toEqual([
        { id: 1, name: 'Alice', age: 30, city: 'New York' },
      ]);
    });

    it('should collapse multiple rows with multiple sources', () => {
      const rows: MeshedRow[] = [
        {
          '@sourceA': { id: 1, name: 'Alice' },
          '@sourceB': { age: 30 },
        },
        {
          '@sourceA': { id: 2, name: 'Bob' },
          '@sourceB': { age: 25 },
        },
      ];
      expect(select(rows, emptyFields)).toEqual([
        { id: 1, name: 'Alice', age: 30 },
        { id: 2, name: 'Bob', age: 25 },
      ]);
    });

    it('should handle sources with empty data objects', () => {
      const rows: MeshedRow[] = [
        {
          '@sourceA': { id: 1, name: 'Alice' },
          '@sourceB': {},
        },
      ];
      expect(select(rows, emptyFields)).toEqual([
        { id: 1, name: 'Alice' },
      ]);
    });

    it('should handle field name collisions by last source iterated (implementation detail)', () => {
      // The current implementation iterates sources; if field names collide, the last one wins.
      const rows: MeshedRow[] = [
        {
          '@sourceA': { id: 1, status: 'active' }, // This status will be overwritten
          '@sourceB': { id: 101, status: 'inactive' },
        },
      ];
      // Depending on object key order (not guaranteed) or iteration order in selectData
      // This test assumes sourceB's status will overwrite sourceA's if 'id' is the same
      // Or rather, it just merges all properties. Let's assume simple merge.
      expect(select(rows, emptyFields)).toEqual([
        { id: 101, status: 'inactive' }, // If sourceB properties are processed after sourceA for the same output object
      ]);
    });
  });

  describe('when fields array is NOT empty (specific fields selected)', () => {
    it('should return only aliased fields', () => {
      const rows: MeshedRow[] = [
        { '@sourceA': { id: 1, name: 'Alice' } },
      ];
      const ast = mock<AST>({
        fields: [
          new FieldProperty(null, 'name').setAlias('firstname'),
        ],
      });
      expect(select(rows, ast)).toEqual([
        { firstname: 'Alice' },
      ]);
    });

    it('should take fields from the right source', () => {
      const rows: MeshedRow[] = [
        { '@sourceA': { id: 1, name: 'Alice' }, '@sourceB': { id: 2, name: 'Bob' } },
      ];
      const ast = mock<AST>({
        fields: [
          new FieldProperty('@sourceA', 'name').setAlias('firstname'),
        ],
      });
      expect(select(rows, ast)).toEqual([
        { firstname: 'Alice' },
      ]);
    });

    it('should be able to access deep properties', () => {
      const rows: MeshedRow[] = [
        { '@sourceA': { id: 1, name: 'Alice', address: { city: 'New York' } } },
      ];
      const ast = mock<AST>({
        fields: [
          new FieldProperty('@sourceA', 'address.city').setAlias('city'),
        ],
      });
      expect(select(rows, ast)).toEqual([
        { city: 'New York' },
      ]);
    });
  });
});
