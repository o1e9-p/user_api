import Redis from "../adapters/redis";
require('dotenv').config();

export default class Cache extends Redis{
  constructor() {
    super();
  }

  setData(key, data, time) {
    this.updateActualEntity(key, data);
    const value = JSON.stringify(data);
    if (time) {
      super.set(key, value, time);
    } else {
      super.set(key, value);
    }
  }

  async getData(key) {
    try{
      return JSON.parse(await super.get(key));
    } catch (e) {
      console.error(e);
    }
  }

  async updateActualEntity(key, data) {
    const actualQuery = (await this.exists('actual')) ? await this.getData('actual') : {};

    data.data.forEach(el => {
      if (actualQuery[el.id]) actualQuery[el.id].push(key);
      else actualQuery[el.id] = [key]
    });

    super.set('actual', JSON.stringify(actualQuery));
  }

  async removeEntity(id) {
    const actualQuery = await this.getData('actual');

    if (!actualQuery || !actualQuery[id]) return;

    actualQuery[id].forEach(query => {
      this.remove(query);
    });

    delete actualQuery[id];

    super.set('actual', JSON.stringify(actualQuery));
  }

  async getAndIncrActualId() {
    let id = await this.getData('actualId');

    if (id) super.incr('actualId');
    else {
      id = 0;
      super.set('actualId', id);
    }
    return id;
  }

  async flush() {
    const actualID = await this.getData('actualId');
    super.flushall();

    super.set('actualId', actualID);
  }
}
