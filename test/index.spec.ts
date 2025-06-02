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

  it('should handle JOINs', async () => {
    const result = await main('SELECT * FROM test-data/shallow.json JOIN test-data/shallow.json ON is_active=true');
    const data = JSON.parse(result);
    expect(data).toHaveLength(6);
    expect(data.every((item: Record<string, any>) => item.is_active)).toBe(true);
    expect(data.every((item: Record<string, any>) => item.productName)).toBe(true);
    expect(data.every((item: Record<string, any>) => item.unit_price)).toBe(true);
  });
});
