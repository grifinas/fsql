import { main } from '../src';
import shallowJson from '../test-data/shallow.json';

describe('SQL Parser Integration Tests', () => {
  it('should select all fields from a file', async () => {
    const result = await main('SELECT * FROM test-data/shallow.json');
    expect(JSON.parse(result)).toEqual(shallowJson);
  });

  it('should select specific fields', async () => {
    const result = await main('SELECT productName, is_active FROM test-data/shallow.json');
    const data = JSON.parse(result);
    expect(data).toHaveLength(5);
    expect(data.every((item: Record<string, any>) => Object.keys(item).length === 2)).toBe(true);
    expect(data[0]).toEqual({ productName: "First Item", is_active: true });
  });

  it('should filter with WHERE clause', async () => {
    const result = await main('SELECT * FROM test-data/shallow.json WHERE is_active=true');
    expect(JSON.parse(result)).toEqual([
      shallowJson[0],
      shallowJson[2],
      shallowJson[3],
    ]);
  });

  it.skip('should handle nested field selection', async () => {
    const result = await main('SELECT ProductMetadata.color_code FROM test-data/shallow.json');
    const data = JSON.parse(result);
    expect(data).toHaveLength(5);
    expect(data.every((item: Record<string, any>) => typeof item.color_code === 'string')).toBe(true);
    expect(data[0]).toEqual({ color_code: "blue" });
  });

  it('should filter by numeric comparison', async () => {
    const result = await main('SELECT productName, unit-price FROM test-data/shallow.json WHERE unit-price>30');
    const data = JSON.parse(result);
    expect(data).toHaveLength(1);
    expect(data[0]).toEqual({
      productName: 'Fourth Item',
      'unit-price': 45.00
    });
  });

  it('should handle variables', async () => {
    const result = await main('SELECT * FROM test-data/shallow.json WHERE is_active=true INTO @active; SELECT * FROM @active WHERE unit-price>30');
    const data = JSON.parse(result);
    expect(data).toHaveLength(1);
    expect(data[0]).toHaveProperty('unit-price', 45.00);
  });

  it('should handle aliasing', async () => {
    const result = await main('SELECT productName as name, unit-price as price FROM test-data/shallow.json');
    const data = JSON.parse(result);
    expect(data).toHaveLength(5);
    expect(data.every((item: Record<string, any>) => Object.keys(item).length === 2)).toBe(true);
    expect(data[0]).toEqual({ name: "First Item", price: 19.99 });
  });

  it('should handle filtering with alias', async () => {
    const result = await main('SELECT productName as name, unit-price as price FROM test-data/shallow.json WHERE price>30');
    const data = JSON.parse(result);
    expect(data).toHaveLength(1);
    expect(data[0]).toEqual({ name: "Fourth Item", price: 45.00 });
  });


  it.skip('should handle JOINs', async () => {
    const result = await main('SELECT main.productName, main.pairID, main.is_active, main.unit_price, main.ProductMetadata FROM test-data/shallow.json as main JOIN test-data/shallow.json as sub ON main.pairID=sub.pairID');
    const data = JSON.parse(result);
    expect(data).toHaveLength(6);
    expect(data).toContainEqual({
      productName: 'First Item',
      pairID: 1,
      is_active: true,
      unit_price: 19.99,
      ProductMetadata: {
        color_code: 'blue',
        size: 'medium'
      }
    });
  });
});
