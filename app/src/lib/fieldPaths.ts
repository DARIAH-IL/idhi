type Primitive = string | number | boolean | null | undefined

export type FieldPaths<T> = T extends Primitive
  ? never
  : T extends readonly (infer Item)[]
    ? FieldPaths<Item>
    : {
        [K in keyof T & string]: K | `${K}.${FieldPaths<NonNullable<T[K]>>}`
      }[keyof T & string]
