/**
 * Hand-written, not generated. Named `*.handlers.ts` so `orval`'s `clean`
 * step won't delete it, and placed under `src/handlers/**` so it inherits
 * the eslint override permitting type assertions (needed below).
 */
import { z } from 'zod'
import { CreateEntityBody, UpdateEntityByIdBody } from './entities.zod'

type OmitImageTuple<T extends readonly z.ZodObject<z.ZodRawShape>[]> = {
  [K in keyof T]: T[K] extends z.ZodObject<infer Shape>
    ? z.ZodObject<Omit<Shape, 'image'>>
    : T[K]
}

function omitImageFromEntityUnion<
  T extends readonly z.ZodObject<z.ZodRawShape>[],
>(union: z.ZodUnion<T>): z.ZodUnion<OmitImageTuple<T>> {
  // Every entity variant declares `image`, but Shape is generic here, so zod
  // can't statically prove that — cast the single `.omit()` call rather than
  // widening this function's signature.
  const optionsWithoutImage = union.options.map((option) =>
    option.omit({ image: true } as never),
  ) as OmitImageTuple<T>

  return z.union(optionsWithoutImage)
}

export const CreateEntityBodyNoImage =
  omitImageFromEntityUnion(CreateEntityBody)
export const UpdateEntityByIdBodyNoImage =
  omitImageFromEntityUnion(UpdateEntityByIdBody)

type ExtendTuple<
  T extends readonly z.ZodObject<z.ZodRawShape>[],
  E extends z.ZodRawShape,
> = {
  [K in keyof T]: T[K] extends z.ZodObject<infer Shape>
    ? z.ZodObject<Shape & E>
    : T[K]
}

export function extendEntityUnion<
  T extends readonly z.ZodObject<z.ZodRawShape>[],
  E extends z.ZodRawShape,
>(union: z.ZodUnion<T>, extension: E): z.ZodUnion<ExtendTuple<T, E>> {
  const extendedOptions = union.options.map((option) =>
    option.extend(extension),
  ) as unknown as ExtendTuple<T, E>

  return z.union(extendedOptions)
}

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never

export function withoutDraftFlag<T extends { isDraft: boolean }>(
  input: T,
): DistributiveOmit<T, 'isDraft'> {
  const { isDraft: _isDraft, ...entity } = input

  return entity as DistributiveOmit<T, 'isDraft'>
}
