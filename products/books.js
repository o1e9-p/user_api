import Db from '../models/database';
import Cache from '../models/cache'

const db = new Db();
const cache = new Cache();
const expirationTime = 1000 * 60 * 5;

export default {
  get: async (url, params) => {
    const result = (await cache.exists(url)) ? await cache.getData(url) : await db.getBooks(params);

    if (!result.err) cache.setData(url, result, expirationTime);

    result.timestamp = + Date.now();

    return result;
  },

  create: async (body) => {
    const id = await cache.getAndIncrActualId();
    cache.flush();
    try {
      await db.insert(body, id);
      return {
        message: 'done',
        id,
        timestamp: + Date.now()
      }
    } catch (e) {
      return e
    }
  },

  update: async (id, params) => {
    cache.removeEntity(id);
    return await db.update(id, params);
  }
}