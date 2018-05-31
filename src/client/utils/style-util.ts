import { render, html } from "lit-html";
import '@polymer/polymer/lib/elements/custom-style';


export const parentSym = Symbol('parent');
export const keySym = Symbol('key');

const valueSupplierSym = Symbol('valueSupplier');
const nameSupplierSym = Symbol('nameSupplier');
const cssSupplierSym = Symbol('cssSupplier');
const childNamePrefixSupplierSym = Symbol('childNamePrefixSupplier');

export const valueSym = Symbol('value');
export const nameSym = Symbol('name');
export const getNameSym = Symbol('getName');
export const cssSym = Symbol('css');
export const getCssSym = Symbol('getCss');
export const childNamePrefixSym = Symbol('childNamePrefix');

export interface StyleParams {
  parent?: Style;
  key?: string;

  valueSupplier?: ValueSupplier;
  nameSupplier?: NameSupplier;
  cssSupplier?: CssSupplier;
  childNamePrefixSupplier?: ChildNamePrefixSupplier;
}

export interface ValueSupplier {
  ($this: Style): any;
}

export interface NameSupplier {
  (parentName: string, style: Style): string;
}

export interface CssSupplier {
  (name: string, style: Style): string;
}

export interface ChildNamePrefixSupplier {
  (style: Style): string;
}

export class Style {

  public static create(params?: StyleParams): Style {
    return new Proxy(new Style(params), {
      get: (target, property) => {
        if (property in target) {
          return target[property];
        } else {
          throw new TypeError(`No key ${property}`);
        }
      }
    });
  }

  private constructor(params: StyleParams = {}) {
    this[parentSym] = params.parent;
    this[keySym] = params.key;

    this[valueSupplierSym] = params.valueSupplier || (() => undefined);
    this[nameSupplierSym] = params.nameSupplier || (() => '');
    this[cssSupplierSym] = params.cssSupplier || ((name, $this) => {
      return Object.keys($this).map(sk => $this[sk][getCssSym](name)).join('\n');
    });
    this[childNamePrefixSupplierSym] = params.childNamePrefixSupplier || (($this) => $this[nameSym]);
  }

  readonly [key: string]: Style;

  public readonly [parentSym]?: Style;
  public readonly [keySym]?: string;

  protected readonly [valueSupplierSym]: ValueSupplier;
  protected readonly [nameSupplierSym]: NameSupplier;
  protected readonly [cssSupplierSym]: CssSupplier;
  protected readonly [childNamePrefixSupplierSym]: ChildNamePrefixSupplier;

  public get [valueSym](): any { return this[valueSupplierSym](this); }

  public get [nameSym](): string { return this[getNameSym](); }
  
  public [getNameSym](parentName?: string): string {
    if (typeof parentName === 'undefined') {
      const parent = this[parentSym];
      parentName = parent ? parent[childNamePrefixSym] : '';
    }
    return this[nameSupplierSym](parentName, this);
  }

  public get [cssSym](): string { return this[getCssSym](); }

  public [getCssSym](parentName?: string): string {
    const name = this[getNameSym](parentName);
    return this[cssSupplierSym](name, this);
  }

  public get [childNamePrefixSym](): string {
    return this[childNamePrefixSupplierSym](this);
  }
}

/***************************************************************/

export const delaySym = Symbol('delay');

export interface DelayableValueSupplier extends ValueSupplier {
  [delaySym]?: boolean;
}

export interface StyleDef {
  [valueSupplierSym]?: DelayableValueSupplier;
  [nameSupplierSym]?: NameSupplier;
  [cssSupplierSym]?: CssSupplier;
  [childNamePrefixSupplierSym]?: ChildNamePrefixSupplier;

  [key: string]: StyleDef;
}

interface DelayedValueSupplierHandler {
  (style: Style, push: (handler: DelayedValueSupplierHandler) => void): void;
}

export function delayValue(supplier: DelayableValueSupplier): DelayableValueSupplier {
  supplier[delaySym] = true;
  return supplier;
}

export function buildStyle(styleDef: StyleDef): Style {
  const delayedValueSuppliers: Array<DelayedValueSupplierHandler> = [];
  const push = (h: DelayedValueSupplierHandler) => delayedValueSuppliers.push(h);

  const style = buildStyleRecurrsive(undefined, undefined, styleDef, push);

  while (delayedValueSuppliers.length > 0) {
    delayedValueSuppliers.shift()!(style, push);
  }

  return style;
}

function buildStyleRecurrsive(parentStyle: Style | undefined, key: string | undefined, styleDef: StyleDef, push: (handler: DelayedValueSupplierHandler) => void): Style {

  let valueSupplier: ValueSupplier;

  function delayValueSupplierHandler(supplier: DelayableValueSupplier): DelayedValueSupplierHandler {
    return function(style: Style, push: (handler: DelayedValueSupplierHandler) => void) {
      const next = supplier(style);
      if (next[delaySym]) {
        push(delayValueSupplierHandler(next));
      } else {
        valueSupplier = next;
      }
    }
  }

  if (styleDef[valueSupplierSym] && styleDef[valueSupplierSym]![delaySym]) {
    push(delayValueSupplierHandler(styleDef[valueSupplierSym]!));
  } else {
    valueSupplier = styleDef[valueSupplierSym] || (() => undefined);
  }

  const style = Style.create({
    parent: parentStyle,
    key,
    nameSupplier: styleDef[nameSupplierSym],
    valueSupplier: (s) => valueSupplier(s),
    cssSupplier: styleDef[cssSupplierSym],
    childNamePrefixSupplier: styleDef[childNamePrefixSupplierSym]
  });

  for (const subKey in styleDef) {
    (<any>style[subKey]) = buildStyleRecurrsive(style, subKey, styleDef[subKey], push);
  }
  
  return style;
}

/**************************************************************/

export interface StyleStructDef {
  [k: string]: StyleDef;
}

export function root(styleStructDef: StyleStructDef): StyleDef {
  return {
    ...styleStructDef
  };
}

export function selector(styleStructDef: StyleStructDef): StyleDef {
  return {
    [nameSupplierSym]: (parentName, style) => style[keySym] || '',
    [cssSupplierSym]: (name, style) => {
      return [
        `${name} {`,
        Object.keys(style).map(sk => style[sk][getCssSym]('')).join('\n'),
        `}`
      ].join('\n');
    },
    [childNamePrefixSupplierSym]: () => '',
    ...styleStructDef
  }
}

export function namespace(styleStructDef: StyleStructDef): StyleDef {
  return {
    [nameSupplierSym]: (parentName, style) => `${parentName}--${style[keySym]}`,
    [cssSupplierSym]: (name, style) => {
      return Object.keys(style).map(sk => style[sk][getCssSym](name)).join('\n');
    },
    ...styleStructDef
  };
}

function parseArgs(a: DelayableValueSupplier | StyleStructDef, b?: StyleStructDef): {
  valueSupplier: DelayableValueSupplier,
  styleStructDef: StyleStructDef
} {
  if (typeof a === 'function') {
    return {
      valueSupplier: a,
      styleStructDef: b || {}
    };
  } else {
    return {
      valueSupplier: (() => undefined),
      styleStructDef: a
    };
  }
}

export function component(valueSupplier: DelayableValueSupplier, styleStructDef?: StyleStructDef): StyleDef;
export function component(styleStructDef: StyleStructDef): StyleDef;
export function component(a: DelayableValueSupplier | StyleStructDef, b?: StyleStructDef): StyleDef {
  const { valueSupplier, styleStructDef } = parseArgs(a, b);

  return {
    [valueSupplierSym]: valueSupplier,
    [nameSupplierSym]: (parentName, style) => `${parentName}-${style[keySym]}`,
    [cssSupplierSym]: (name, style) => {
      const value = style[valueSym];
      const lines: Array<string> = [];
      if (typeof value !== 'undefined') {
        lines.push(`${name}: ${style[valueSym]};`);
      }
      lines.push(...Object.keys(style).map(sk => style[sk][getCssSym](name)));
      return lines.join('\n');
    },
    ...styleStructDef
  };
}

export function option(valueSupplier: DelayableValueSupplier, styleStructDef?: StyleStructDef): StyleDef;
export function option(styleStructDef: StyleStructDef): StyleDef;
export function option(a: DelayableValueSupplier | StyleStructDef, b?: StyleStructDef): StyleDef {
  const { valueSupplier, styleStructDef } = parseArgs(a, b);

  return {
    [valueSupplierSym]: valueSupplier,
    [nameSupplierSym]: (parentName, style) => `${parentName}--${style[keySym]}`,
    [cssSupplierSym]: (name, style) => {
      const value = style[valueSym];
      const lines: Array<string> = [];
      if (typeof value !== 'undefined') {
        lines.push(`${name}: ${style[valueSym]};`);
      }
      lines.push(...Object.keys(style).map(sk => style[sk][getCssSym](name)));
      return lines.join('\n');
    },
    ...styleStructDef
  };
}

export function property(valueSupplier: DelayableValueSupplier, styleStructDef: StyleStructDef = {}): StyleDef {
  return {
    [valueSupplierSym]: valueSupplier,
    [nameSupplierSym]: (parentName, style) => `${parentName}__${style[keySym]}`,
    [cssSupplierSym]: (name, style) => {
      return [
        `${name}: ${style[valueSym]};`,
        ...Object.keys(style).map(sk => style[sk][getCssSym](name))
      ].join('\n');
    },
    ...styleStructDef
  };
}

export function subProperty(valueSupplier: DelayableValueSupplier, styleStructDef: StyleStructDef = {}): StyleDef {
  return {
    [valueSupplierSym]: valueSupplier,
    [nameSupplierSym]: (parentName, style) => `${parentName}_${style[keySym]}`,
    [cssSupplierSym]: (name, style) => {
      return [
        `${name}: ${style[valueSym]};`,
        ...Object.keys(style).map(sk => style[sk][getCssSym](name))
      ].join('\n');
    },
    ...styleStructDef
  };
}

export function value(value: any): ValueSupplier {
  return () => value;
}

export function cssVar(style: Style): string {
  return `var(${style[nameSym]})`;
}

/***********************************************************/

/**********************************************/

export function addCustomStyle(style: Style, container: Element | DocumentFragment, id?: string) {
  const fragment = document.createDocumentFragment();
  render(html`<custom-style id="${id}"><style>${style[cssSym]}</style></custom-style>`, fragment);
  container.appendChild(fragment);
}
