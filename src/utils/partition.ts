export function partition<A, B>(
  data: unknown[],
  predicate: (item: unknown) => boolean,
): [A[], B[]] {
  const trueItems: A[] = [];
  const falseItems: B[] = [];
  for (const item of data) {
    if (predicate(item)) {
      trueItems.push(item as A);
    } else {
      falseItems.push(item as B);
    }
  }
  return [trueItems, falseItems];
}
