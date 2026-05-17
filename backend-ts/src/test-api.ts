import { timingSafeEqual } from 'crypto';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import * as cuid from 'cuid';
import { db } from 'src/database';
import { Category } from 'src/entities/category.entity';
import { History } from 'src/entities/history.entity';
import { Record } from 'src/entities/record.entity';
import { Person } from 'src/entities/person.entity';
import { StatusType } from 'src/entities/status_type';
import { TitleMapping } from 'src/entities/title_mapping.entity';
import { TwitterSetting } from 'src/entities/twitter_setting.entity';
import { User } from 'src/entities/user.entity';
import { Work } from 'src/entities/work.entity';
import { WorkCast } from 'src/entities/work_cast.entity';
import { WorkCompany } from 'src/entities/work_company.entity';
import { WorkIndex } from 'src/entities/work_index.entity';
import { WorkPeriodIndex } from 'src/entities/work_period_index.entity';
import { WorkStaff } from 'src/entities/work_staff.entity';
import { WorkTitleIndex } from 'src/entities/work_title_index.entity';
import { createCategory } from 'src/services/category';
import { addRecordHistory, createRecord } from 'src/services/record';
import { setPassword, createSession } from 'src/services/auth';
import { addTitleMapping, getOrCreateWork } from 'src/services/work';
import { rebuildWorkIndex } from 'src/services/indexer';

function requireTestToken(request: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void) {
  const expected = process.env.ANIMETA_TEST_TOKEN;
  if (!expected) {
    done(new Error('ANIMETA_TEST_TOKEN is not set'));
    return;
  }
  let actual = request.headers['x-animeta-test-token'];
  if (Array.isArray(actual)) actual = actual[0];
  if (
    !actual ||
    actual.length !== expected.length ||
    !timingSafeEqual(Buffer.from(actual), Buffer.from(expected))
  ) {
    reply.status(401).send({ message: 'Invalid test token' });
    return;
  }
  done();
}

function userDto(user: User) {
  return {
    id: user.id.toString(),
    username: user.username,
    sessionKey: createSession(user, false).sessionKey,
    date_joined: user.date_joined.toISOString(),
  };
}

function workDto(work: Work) {
  return {
    id: work.id.toString(),
    title: work.title,
  };
}

function categoryDto(category: Category) {
  return {
    id: category.id.toString(),
    name: category.name,
  };
}

function recordDto(record: Record) {
  return {
    id: record.id.toString(),
    title: record.title,
    work_id: record.work_id.toString(),
    status: record.status,
    status_type: record.status_type,
  };
}

function historyDto(history: History) {
  return {
    id: history.id.toString(),
    status: history.status,
    status_type: history.status_type,
    updated_at: history.updated_at?.toISOString() ?? null,
  };
}

export function registerTestApi(server: FastifyInstance) {
  const token = process.env.ANIMETA_TEST_TOKEN;
  if (!token) throw new Error('ANIMETA_TEST_TOKEN is not set');

  server.register(async app => {
    app.addHook('preHandler', requireTestToken);

    app.post('/users', async request => {
      const params = request.body as {
        isStaff?: boolean;
        password?: string;
      };
      const user = db.create(User, {
        username: cuid(),
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        is_staff: params.isStaff ?? false,
        is_active: true,
        is_superuser: false,
        last_login: new Date(),
        date_joined: new Date(),
      });
      if (params.password) {
        await setPassword(user, params.password);
      }
      await db.save(user);
      return userDto(user);
    });

    app.post('/users/:id/password', async request => {
      const user = await db.findOneOrFail(User, (request.params as { id: string }).id);
      const { password } = request.body as { password: string };
      await setPassword(user, password);
      await db.save(user);
      return { ok: true };
    });

    app.post('/users/:id/session', async request => {
      const user = await db.findOneOrFail(User, (request.params as { id: string }).id);
      return { sessionKey: createSession(user, false).sessionKey };
    });

    app.post('/users/:id/twitter-setting', async request => {
      const user = await db.findOneOrFail(User, (request.params as { id: string }).id);
      const params = request.body as { key: string; secret: string };
      await db.save(TwitterSetting, {
        user,
        key: params.key,
        secret: params.secret,
      });
      return { ok: true };
    });

    app.get('/users/:id/twitter-setting', async request => {
      const user = await db.findOneOrFail(User, (request.params as { id: string }).id);
      return await db.findOne(TwitterSetting, { where: { user } }) ?? null;
    });

    app.post('/works', async request => {
      const params = request.body as {
        periods?: string[];
        metadata?: globalThis.Record<string, unknown>;
      };
      const work = await getOrCreateWork(cuid());
      work.metadata = {
        version: 2,
        ...(params.periods ? { periods: params.periods } : {}),
        ...(params.metadata ?? {}),
      };
      if (params.periods?.length) {
        work.first_period = params.periods[0];
      }
      await db.save(work);
      return workDto(work);
    });

    app.post('/works/:id/title-mappings', async request => {
      const work = await db.findOneOrFail(Work, (request.params as { id: string }).id);
      const { title } = request.body as { title: string };
      await addTitleMapping(work, title);
      return { ok: true };
    });

    app.post('/works/:id/staffs', async request => {
      const work = await db.findOneOrFail(Work, (request.params as { id: string }).id);
      const params = request.body as {
        personId?: string;
        personName?: string;
        task: string;
        position?: number;
      };
      const person = params.personId
        ? await db.findOneOrFail(Person, params.personId)
        : await db.save(db.create(Person, {
          name: params.personName ?? cuid(),
          metadata: null,
          ann_id: null,
        }));
      const staff = await db.save(db.create(WorkStaff, {
        work_id: work.id,
        person,
        task: params.task,
        position: params.position ?? 0,
        metadata: null,
      }));
      return {
        id: staff.id.toString(),
        personId: person.id.toString(),
      };
    });

    app.post('/categories', async request => {
      const params = request.body as { userId: string; name?: string };
      const user = await db.findOneOrFail(User, params.userId);
      const category = await createCategory(user, { name: params.name ?? cuid() });
      return categoryDto(category);
    });

    app.post('/records', async request => {
      const params = request.body as {
        userId?: string;
        workId?: string;
        categoryId?: string | null;
        comment?: string;
        status?: string;
        statusType?: StatusType;
      };
      const user = params.userId ? await db.findOneOrFail(User, params.userId) : await createFixtureUser();
      const work = params.workId ? await db.findOneOrFail(Work, params.workId) : await getOrCreateWork(cuid());
      const { record, history } = await createRecord(user, work, {
        title: work.title,
        status: params.status ?? '1',
        statusType: params.statusType ?? StatusType.FINISHED,
        comment: params.comment ?? '',
        categoryId: params.categoryId ? Number(params.categoryId) : null,
        rating: null,
      });
      return { record: recordDto(record), history: historyDto(history) };
    });

    app.post('/histories', async request => {
      const params = request.body as { recordId: string; comment?: string };
      const record = await db.findOneOrFail(Record, params.recordId);
      const history = await addRecordHistory(record, {
        status: record.status,
        statusType: record.status_type,
        comment: params.comment ?? '',
        containsSpoiler: false,
        rating: null,
      });
      return historyDto(history);
    });

    app.post('/work-index/rebuild', async () => {
      await rebuildWorkIndex();
      return { ok: true };
    });

    app.delete('/records', async () => {
      await db.delete(History, {});
      await db.delete(Record, {});
      return { ok: true };
    });

    app.delete('/works', async () => {
      await db.delete(History, {});
      await db.delete(Record, {});
      await db.delete(WorkCast, {});
      await db.delete(WorkStaff, {});
      await db.delete(WorkCompany, {});
      await db.delete(WorkPeriodIndex, {});
      await db.delete(WorkTitleIndex, {});
      await db.delete(TitleMapping, {});
      await db.delete(WorkIndex, {});
      await db.delete(Work, {});
      return { ok: true };
    });
  }, { prefix: '/__test' });
}

async function createFixtureUser(): Promise<User> {
  const user = db.create(User, {
    username: cuid(),
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    is_staff: false,
    is_active: true,
    is_superuser: false,
    last_login: new Date(),
    date_joined: new Date(),
  });
  return db.save(user);
}
