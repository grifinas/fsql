import { IAlias, IRef, Scalar } from "@types";

export abstract class Property implements IAlias, IRef {
  public __type: string = "property";
  protected alias: string | null = null;

  setAlias(alias: string): this {
    this.alias = alias;
    return this;
  }

  getAlias(): string | null {
    return this.alias;
  }

  abstract ref(): string;
}

export class FieldProperty extends Property {
  constructor(
    public source: string | null,
    public field: string,
  ) {
    super();
  }

  ref(): string {
    if (this.alias) return this.alias;

    return this.field.split(".").pop()!;
  }
}

export class FunctionProperty extends Property {
  constructor(
    public name: string,
    public args: Property[],
  ) {
    super();
  }

  ref(): string {
    return this.alias || this.name;
  }
}

export class ResolvedProperty extends Property {
  constructor(public value: Scalar) {
    super();
  }

  ref(): string {
    return this.alias || this.value.toString();
  }
}

/**
 * Represents the entire row. Parsed when parseField parses `*`
 */
export class IdentityProperty extends Property {
  constructor(public source: string | null) {
    super();
  }

  ref(): string {
    return this.alias || "all";
  }
}
