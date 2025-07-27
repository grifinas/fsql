import { main } from '@src/index';
import shallowJson from '../test-data/shallow.json';

describe('SQL Parser Integration Tests', () => {
  it('should select all fields from a file', async () => {
    const result = await main('SELECT * FROM test-data/shallow.json');
    expect(result).toEqual(shallowJson);
  });

  it('should select specific fields', async () => {
    const result = await main('SELECT productName, is_active FROM test-data/shallow.json');
    expect(result).toHaveLength(5);
    expect(result.every((item: Record<string, any>) => Object.keys(item).length === 2)).toBe(true);
    expect(result[0]).toEqual({ productName: "First Item", is_active: true });
  });

  it('should select specific fields', async () => {
    const result = await main('SELECT productName, is_active FROM test-data/shallow.json');
    expect(result).toHaveLength(5);
    expect(result.every((item: Record<string, any>) => Object.keys(item).length === 2)).toBe(true);
    expect(result[0]).toEqual({ productName: "First Item", is_active: true });
  });

  it('should filter with WHERE clause', async () => {
    const result = await main('SELECT * FROM test-data/shallow.json WHERE is_active=true');
    expect(result).toEqual([
      shallowJson[0],
      shallowJson[2],
      shallowJson[3],
    ]);
  });

  it('should handle nested field selection', async () => {
    const result = await main('SELECT ProductMetadata.color_code FROM test-data/shallow.json');
    expect(result).toHaveLength(5);
    expect(result.every((item: Record<string, any>) => typeof item.color_code === 'string')).toBe(true);
    expect(result[0]).toEqual({ color_code: "blue" });
  });

  it('should filter by numeric comparison', async () => {
    const result = await main('SELECT productName, unit-price FROM test-data/shallow.json WHERE unit-price>30');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      productName: 'Fourth Item',
      'unit-price': 45.00
    });
  });

  it('should handle variables', async () => {
    const result = await main('SELECT * FROM test-data/shallow.json WHERE is_active=true INTO @active; SELECT * FROM @active WHERE unit-price>30');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expect.objectContaining({ id: 4, 'unit-price': 45.00 }));
  });

  it('should handle aliasing', async () => {
    const result = await main('SELECT productName as name, unit-price as price FROM test-data/shallow.json');
    expect(result).toHaveLength(5);
    expect(result.every((item: Record<string, any>) => Object.keys(item).length === 2)).toBe(true);
    expect(result[0]).toEqual({ name: "First Item", price: 19.99 });
  });

  it('should handle JOINs', async () => {
    const result = await main('SELECT @main.productName, @main.pairID, @main.is_active, @main.unit-price, @main.ProductMetadata FROM test-data/shallow.json as @main JOIN test-data/shallow.json as @sub ON @main.pairID=@sub.id');
    expect(result).toHaveLength(4);
    expect(result).toContainEqual(expect.objectContaining({
      productName: 'First Item',
      pairID: 3,
      is_active: true,
      'unit-price': 19.99,
      ProductMetadata: expect.objectContaining({
        color_code: 'blue',
        itemSize: 'medium'
      })
    }));
  });

  it('should support functions in WHERE', async () => {
    const result = await main('SELECT * FROM test-data/shallow.json WHERE UPPER(productName) = "FIRST ITEM"');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(shallowJson[0]);
  });

  it("should support LIKE as a function", async () => {
    const result = await main("SELECT * from test-data/shallow.json WHERE LIKE(productName, '%Item')");
    expect(result).toHaveLength(5);
    expect(result[0]).toEqual(shallowJson[0]);
  });
});
