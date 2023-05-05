import { AsyncLocalStorage } from "async_hooks";
import { EntityManager, getManager } from "typeorm";

const transactionalEntityManager = new AsyncLocalStorage<EntityManager>()

export const db = new Proxy<EntityManager>({} as any, {
  get(_, p: keyof EntityManager) {
    const manager = transactionalEntityManager.getStore() ?? getManager()
    if (p === 'transaction') {
      return (fn: (em: EntityManager) => Promise<any>) =>
        manager.transaction(em =>
          transactionalEntityManager.run(em, fn, em))
    }
    const prop = Reflect.get(manager, p)
    if (typeof prop === 'function') {
      return prop.bind(manager)
    } else {
      return prop
    }
  }
})

export function runWithDb<T>(em: EntityManager, fn: () => Promise<T>) {
  return transactionalEntityManager.run(em, fn)
}
