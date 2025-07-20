export type Scalar = string | number | boolean;

export class Property {
    private __property: string = 'property';
}

export class FieldProperty extends Property {
    constructor(public source: string | null, public field: string) {
        super();
    }
}

export class FunctionProperty extends Property {
    constructor(public name: string, public args: Property[]) {
        super();
    }
}

export class ResolvedProperty extends Property {
    constructor(public value: Scalar) {
        super();
    }
}

