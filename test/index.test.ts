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

  // LIMIT and OFFSET Integration Tests
  it('should limit number of results', async () => {
    const result = await main('SELECT * FROM test-data/shallow.json LIMIT 3');
    expect(result).toHaveLength(3);
    expect(result).toEqual(shallowJson.slice(0, 3));
  });

  it('should handle OFFSET without LIMIT', async () => {
    const result = await main('SELECT * FROM test-data/shallow.json OFFSET 2');
    expect(result).toHaveLength(3); // 5 total - 2 offset = 3
    expect(result).toEqual(shallowJson.slice(2));
  });

  it('should handle LIMIT and OFFSET together', async () => {
    const result = await main('SELECT * FROM test-data/shallow.json LIMIT 2 OFFSET 1');
    expect(result).toHaveLength(2);
    expect(result).toEqual(shallowJson.slice(1, 3));
    expect(result[0]).toEqual(shallowJson[1]);
    expect(result[1]).toEqual(shallowJson[2]);
  });
  it('should handle LIMIT 0', async () => {
    const result = await main('SELECT * FROM test-data/shallow.json LIMIT 0');
    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should handle OFFSET beyond data length', async () => {
    const result = await main('SELECT * FROM test-data/shallow.json OFFSET 10');
    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should handle LIMIT larger than available data', async () => {
    const result = await main('SELECT * FROM test-data/shallow.json LIMIT 100');
    expect(result).toHaveLength(5); // All available data
    expect(result).toEqual(shallowJson);
  });

  it('should work with WHERE clause and LIMIT', async () => {
    const result = await main('SELECT * FROM test-data/shallow.json WHERE is_active=true LIMIT 2');
    expect(result).toHaveLength(2);
    // Should get first 2 active items
    const activeItems = shallowJson.filter(item => item.is_active);
    expect(result).toEqual(activeItems.slice(0, 2));
  });

  it('should work with WHERE clause and OFFSET', async () => {
    const result = await main('SELECT * FROM test-data/shallow.json WHERE is_active=true OFFSET 1');
    const activeItems = shallowJson.filter(item => item.is_active);
    expect(result).toHaveLength(activeItems.length - 1);
    expect(result).toEqual(activeItems.slice(1));
  });

  it('should work with ORDER BY and LIMIT', async () => {
    const result = await main('SELECT * FROM test-data/shallow.json ORDER BY unit-price DESC LIMIT 2');
    expect(result).toHaveLength(2);
    // Should get the 2 most expensive items
    const sortedByPrice = [...shallowJson].sort((a, b) => b['unit-price'] - a['unit-price']);
    expect(result).toEqual(sortedByPrice.slice(0, 2));
    //@ts-ignore
    expect(result[0]['unit-price']).toBeGreaterThanOrEqual(result[1]['unit-price']);
  });

  it('should work with field selection and LIMIT/OFFSET', async () => {
    const result = await main('SELECT productName, unit-price FROM test-data/shallow.json LIMIT 2 OFFSET 1');
    expect(result).toHaveLength(2);
    expect(result.every((item: Record<string, any>) => Object.keys(item).length === 2)).toBe(true);
    expect(result[0]).toEqual({
      productName: shallowJson[1].productName,
      'unit-price': shallowJson[1]['unit-price']
    });
  });

  it('should work with JOINs and LIMIT', async () => {
    const result = await main('SELECT @main.productName as mainProduct, @sub.productName as subProduct FROM test-data/shallow.json as @main JOIN test-data/shallow.json as @sub ON @main.pairID=@sub.id LIMIT 2');
    expect(result).toHaveLength(2);
    expect(result.every((item: Record<string, any>) => Object.keys(item).length === 2)).toBe(true);
  });

  it('should work with complex query combining multiple features', async () => {
    const result = await main('SELECT productName, unit-price FROM test-data/shallow.json WHERE is_active=true ORDER BY unit-price ASC LIMIT 1 OFFSET 1');
    
    // Get active items, sort by price ascending, take 1 item starting from index 1
    const activeItems = shallowJson.filter(item => item.is_active);
    const sortedActive = activeItems.sort((a, b) => a['unit-price'] - b['unit-price']);
    const expected = sortedActive.slice(1, 2).map(item => ({
      productName: item.productName,
      'unit-price': item['unit-price']
    }));
    
    expect(result).toHaveLength(1);
    expect(result).toEqual(expected);
  });

  it('should handle edge case: OFFSET at exact data boundary', async () => {
    const result = await main('SELECT * FROM test-data/shallow.json OFFSET 5'); // Exactly at data length
    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should handle edge case: LIMIT and OFFSET with filtered results', async () => {
    const result = await main('SELECT * FROM test-data/shallow.json WHERE unit-price>20 LIMIT 1 OFFSET 1');
    const expensiveItems = shallowJson.filter(item => item['unit-price'] > 20);
    expect(result).toHaveLength(Math.min(1, Math.max(0, expensiveItems.length - 1)));
    if (expensiveItems.length > 1) {
      expect(result).toEqual(expensiveItems.slice(1, 2));
    }
  });
});
