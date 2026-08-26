import type { Entity } from '@/api/models'
import type { termUriRefs, termUris } from '@/api/termUris/termUris'
import type en from '@/i18n/locales/en.json'

type Present<T> = Exclude<T, null | undefined>

type ElementOf<T> =
  Present<T> extends readonly (infer Item)[] ? Present<Item> : Present<T>

type Refs = typeof termUriRefs
type Uris = typeof termUris
type FieldTranslations = (typeof en)['entity']['fields']

type RootClass<TEntity extends Entity> =
  TEntity['type'] extends `idhi:${infer Name}` ? Name : never

type RefClass<TClass, TKey> = TClass extends keyof Refs
  ? TKey extends keyof Refs[TClass]
    ? Refs[TClass][TKey] & string
    : never
  : never

type FieldClassPairs<TModel, TClass extends string> =
  Present<TModel> extends infer Value
    ? Value extends object
      ? {
          [K in keyof Value & string]:
            `${TClass}.${K}` | RefPairs<Value[K], RefClass<TClass, K>>
        }[keyof Value & string]
      : never
    : never

type RefPairs<TValue, TRef> = TRef extends string
  ? FieldClassPairs<ElementOf<TValue>, TRef>
  : never

type EntityFieldClassPairs<TEntity extends Entity = Entity> =
  TEntity extends unknown ? FieldClassPairs<TEntity, RootClass<TEntity>> : never

interface FieldMeta {
  label: string
  description: string
}

type TranslatedFieldsOf<TClass extends keyof FieldTranslations> = {
  [
    K in keyof FieldTranslations[TClass]
  ]: FieldTranslations[TClass][K] extends FieldMeta ? K : never
}[keyof FieldTranslations[TClass]]

type FieldTranslationPairs = {
  [
    C in keyof FieldTranslations & string
  ]: `${C}.${TranslatedFieldsOf<C> & string}`
}[keyof FieldTranslations & string]

type TermUriPairs = {
  [C in keyof Uris & string]: `${C}.${keyof Uris[C] & string}`
}[keyof Uris & string]

type EnumValues<T> =
  Present<T> extends infer V
    ? V extends readonly (infer Item)[]
      ? EnumValues<Item>
      : V extends string
        ? string extends V
          ? never
          : V
        : V extends object
          ? { [K in keyof V]-?: EnumValues<V[K]> }[keyof V]
          : never
    : never

type TranslatedEnumValues = keyof (typeof en)['entity']['enums']

type NoMissing<T extends never> = T

export type EntityFieldTranslationCoverage = NoMissing<
  Exclude<EntityFieldClassPairs, FieldTranslationPairs>
>

export type EntityTermUriCoverage = NoMissing<
  Exclude<EntityFieldClassPairs, TermUriPairs>
>

export type EntityEnumTranslationCoverage = NoMissing<
  Exclude<EnumValues<Entity>, Entity['type'] | TranslatedEnumValues>
>
