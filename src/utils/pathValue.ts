

export function pathValue(obj: object, path: string): { value: unknown; result: boolean } {
    const parts = path.split(".");
    let value = obj;
    for (const part of parts) {
        if (part in value) {
            value = value[part as keyof typeof value];
        } else {
            return { value: undefined, result: false };
        }
    }
    return { value, result: true };
}