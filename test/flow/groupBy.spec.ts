import { AST } from '@src/data/ast';
import { groupBy } from '@src/data/groupBy';
import { MeshedRow } from '@src/types';
import { mock } from 'jest-mock-extended';
import { FieldProperty } from '@entities';

describe('groupBy', () => {
  it('should return the same rows when groupBy is empty', async () => {
    const rows: MeshedRow[] = [
      { t: { id: 1, is_active: true } },
      { t: { id: 2, is_active: false } },
    ];

    const ast = mock<AST>({
      groupBy: [],
    });

    const result = groupBy(rows, ast);
    expect(result).toEqual([rows]);
  });

  it('should return the last row for each group (single field)', async () => {
    const r1: MeshedRow = { t: { id: 1, is_active: true } };
    const r2: MeshedRow = { t: { id: 2, is_active: false } };
    const r3: MeshedRow = { t: { id: 3, is_active: true } };
    const r4: MeshedRow = { t: { id: 4, is_active: true } };
    const r5: MeshedRow = { t: { id: 5, is_active: false } };

    const rows: MeshedRow[] = [r1, r2, r3, r4, r5];

    const ast = mock<AST>({
      groupBy: [new FieldProperty(null, 'is_active')],
    });

    const result = groupBy(rows, ast);
    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([
        [r1, r3, r4],
        [r2, r5],
      ]),
    );
  });

  it('should select the last subgroup\'s last row when grouping by multiple fields', async () => {
    const t1a1: MeshedRow = { t: { id: 1, is_active: true, category: 'A' } };
    const t1a2: MeshedRow = { t: { id: 2, is_active: true, category: 'A' } };
    const t1b1: MeshedRow = { t: { id: 3, is_active: true, category: 'B' } };
    const t1b2: MeshedRow = { t: { id: 4, is_active: true, category: 'B' } };
    const f2a1: MeshedRow = { t: { id: 5, is_active: false, category: 'A' } };
    const f2b1: MeshedRow = { t: { id: 6, is_active: false, category: 'B' } };
    const f2b2: MeshedRow = { t: { id: 7, is_active: false, category: 'B' } };

    const rows: MeshedRow[] = [t1a1, t1a2, t1b1, t1b2, f2a1, f2b1, f2b2];

    const ast = mock<AST>({
      groupBy: [new FieldProperty(null, 'is_active'), new FieldProperty(null, 'category')],
    });

    const result = groupBy(rows, ast);
    expect(result).toHaveLength(4);
    expect(result).toEqual(
      expect.arrayContaining([
        [t1a1, t1a2],
        [t1b1, t1b2],
        [f2a1],
        [f2b1, f2b2],
      ]),
    );
  });

  it('should group NULL key values together (SQL-like NULL grouping)', async () => {
    const n1: MeshedRow = { t: { id: 1, k: null } };
    const n2: MeshedRow = { t: { id: 2, k: null } };
    const v1: MeshedRow = { t: { id: 3, k: true } };
    const v2: MeshedRow = { t: { id: 4, k: true } };

    const rows: MeshedRow[] = [n1, v1, n2, v2];

    const ast = mock<AST>({
      groupBy: [new FieldProperty(null, 'k')],
    });

    const result = groupBy(rows, ast);
    expect(result).toHaveLength(2);
    expect(result).toEqual(expect.arrayContaining([[n1, n2], [v1, v2]]));
  });

  it('should support grouping by nested paths and quoted identifiers (expected to fail today)', async () => {
    const r1: MeshedRow = { t: { id: 1, ProductMetadata: { color_code: 'blue' }, 'unit-price': 10 } };
    const r2: MeshedRow = { t: { id: 2, ProductMetadata: { color_code: 'blue' }, 'unit-price': 20 } };
    const r3: MeshedRow = { t: { id: 3, ProductMetadata: { color_code: 'red' }, 'unit-price': 30 } };

    const rows: MeshedRow[] = [r1, r2, r3];

    const ast = mock<AST>({
      groupBy: [new FieldProperty(null, 'ProductMetadata.color_code'), new FieldProperty(null, 'unit-price')],
    });

    const result = groupBy(rows, ast);
    expect(result).toHaveLength(3);
    expect(result).toEqual(expect.arrayContaining([
      [r1],
      [r2],
      [r3]
    ]));
  });
});

//TODO projection with GROUP BY: selecting non-aggregate fields that are not in group keys should error
