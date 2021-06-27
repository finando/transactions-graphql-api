import type { GraphQLFieldResolver, GraphQLTypeResolver } from 'graphql';

const resolve =
  (
    resolver: any
  ): GraphQLFieldResolver<any, any, any> | GraphQLTypeResolver<any, any> =>
  (...args: any[]) => {
    if (args.length === 4) {
      const [root, input, context, info] = args;

      return resolver.call(null, { root, input, value: {}, context, info });
    }
    if (args.length === 3) {
      const [value, context, info] = args;

      return resolver.call(null, { root: {}, input: {}, value, context, info });
    }

    throw new Error(
      'Unexpected number of resolver function arguments, expected 3 or 4'
    );
  };

export const createResolver = (operations: Record<string, unknown>) =>
  Object.entries(operations).reduce(
    (previous, [operation, resolver]) => ({
      ...previous,
      [operation]: resolve(resolver)
    }),
    {}
  );

export const createRootResolver = (
  queries: Record<string, unknown>,
  mutations: Record<string, unknown>
) => ({
  Query: createResolver(queries),
  Mutation: createResolver(mutations)
});

function assertIsDefined<T>(
  key: string,
  value: T
): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new Error(`Expected ${key} to be defined, but received ${value}`);
  }
}

export const validateEnv = <T>(env: T): T => {
  Object.entries(env).forEach(([key, value]) => assertIsDefined(key, value));

  return env;
};
