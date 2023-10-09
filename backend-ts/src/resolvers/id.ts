import { GraphQLResolveInfo, print } from "graphql";
import { MercuriusContext } from "mercurius";
import * as Sentry from '@sentry/node';
import { Category } from "src/entities/category.entity";
import { History } from "src/entities/history.entity";
import { Record } from "src/entities/record.entity";
import { User } from "src/entities/user.entity";
import { Work } from "src/entities/work.entity";
import { EntityTarget } from "typeorm";

const enum EntityType {
  Post = 'Post',
  Record = 'Record',
  User = 'User',
  Category = 'Category',
  Work = 'Work',
}

export class NodeId {
  constructor(public readonly __id: string) {}

  toJSON() {
    return this.__id
  }
}

function nodeIdToEntityId({ __id }: NodeId, expectedType: EntityType): number {
  // legacy compatible
  if (/^[0-9]+$/.exec(__id))
    return Number(__id)
  
  const [type, databaseId] = Buffer.from(__id, 'base64').toString().split(':')
  if (type !== expectedType)
    throw new Error(`expected type ${expectedType} but got ${type} (ID: ${__id})`)
  
  return Number(databaseId)
}

function entityIdToNodeId(databaseId: number, type: EntityType): NodeId {
  return new NodeId(Buffer.from(`${type}:${databaseId}`).toString('base64'))
}

function entityIdToLegacyNodeId(databaseId: number): NodeId {
  return new NodeId(databaseId.toString())
}

function createIdUtil<T extends {id: number}>(
  entityClass: EntityTarget<T>,
  entityType: EntityType,
) {
  return {
    resolver(entity: T, _: any, ctx: MercuriusContext, info: GraphQLResolveInfo): NodeId {
      if (ctx.useNewId) {
        return entityIdToNodeId(entity.id, entityType)
      }
      if (!ctx._legacyIdWarned) {
        ctx._legacyIdWarned = true
        Sentry.captureMessage("legacy id access: " + print(info.operation))
      }
      return entityIdToLegacyNodeId(entity.id)
    },

    toDatabaseId(nodeId: NodeId): number {
      return nodeIdToEntityId(nodeId, entityType)
    },

    fromDatabaseId(databaseId: number): NodeId {
      return entityIdToNodeId(databaseId, entityType)
    }
  }
}

export const UserId = createIdUtil(User, EntityType.User)
export const RecordId = createIdUtil(Record, EntityType.Record)
export const PostId = createIdUtil(History, EntityType.Post)
export const CategoryId = createIdUtil(Category, EntityType.Category)
export const WorkId = createIdUtil(Work, EntityType.Work)
