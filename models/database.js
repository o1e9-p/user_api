import MySql from "../adapters/mySql";

require('dotenv').config();

export default class Database extends MySql{
  constructor() {
    super();
  }

  async getBooks(params) {
    const query = new Query();
    const strQuery = query.createSelect(params);

    if (strQuery.err.length > 0) return this.createResponse(strQuery.err, null);

    try{
      return this.createResponse(null, await super.query(strQuery.str));
    } catch (e) {
      console.error(e);
      return this.createResponse(e.sqlMessage, null)
    }
  }

  async update(id, params) {
    const query = new Query();
    const strQuery = query.createUpdate(id, params);

    if (strQuery.err.length > 0) return this.createResponse(strQuery.err, null);

    try{
      return this.createResponse(null, await super.query(strQuery.str));
    } catch (e) {
      console.error(e);
      return this.createResponse(e.sqlMessage, null)
    }
  }

  async insert({title, date, autor, description, image}, id) {
    const str = `INSERT INTO books VALUES ('${title}', '${date}', '${autor}', '${description}', '${image}', '${id}')`;

    try{
      return this.createResponse(null, await super.query(str));
    } catch (e) {
      console.error(e);
      return this.createResponse(e.sqlMessage, null)
    }
  }

  createResponse(err, data) {
    return {err, data}
  }
}

class Query {
  constructor() {
    this.err = [];
  }

  createSelect({limit, offset, fields, sort, title, date, autor, description, image}) {
    let str = 'SELECT ';

    if (fields){
      str += this._addFields(fields) + ' FROM books ';
    } else {
      str += '* FROM books ';
    }

    if (title || date || autor || description || image) str += this._addFilter(title, date, autor, description, image);

    if (sort) {
      str += this._addSort(sort);
    } else {
      str += 'ORDER BY id ';
    }

    if (limit || offset) {
      str += this._addLimitOffset(limit, offset);
    }

    str += ';';

    return {str, err: this.err}
  }

  createUpdate(id, {title, date, autor, description, image}) {
    let str = 'UPDATE books SET ';

    if (typeof title === 'string') str += `title = '${title}', `;
    if (typeof date === 'string') str += `date = '${date}', `;
    if (typeof autor === 'string') str += `autor = '${autor}', `;
    if (typeof description === 'string') str += `description = '${description}', `;
    if (typeof image === 'string') str += `image = '${image}', `;

    str = str.substring(0, str.length - 2);
    str += ` WHERE id = '${id}'`;

    return {str, err: this.err}
  }

  _addFields(fields) {
    const str = (Array.isArray(fields)) ? fields.join(', ') : fields;

    if (str.replace(/[a-zA-Z,]+|\s+/g, '').length) this.err.push("'fields' must contain only letters and commas");

    return str;
  }

  _addFilter(title, date, autor, description, image) {
    let str = '';

    if (typeof title === 'string') str += `title = '${title}', `;

    if (typeof date === 'string') {
      const ex = date.replace(/[^<>=]+/g, '');

      if (!date.replace(/[0-9,\-\s<>=]+/g, '')) str += `date ${ex.length ? ex : '='} '${date.substring(ex.length).trim()}', `;
      else this.err.push("wrong date field ");
    }

    if (typeof autor === 'string') {
      if (!autor.replace(/[a-zA-Z,\s<>=]+/g, '')) str += `autor = '${autor}', `;
      else this.err.push("wrong autor field ");
    }

    if (typeof description === 'string') str += `description = '${description}', `;
    if (typeof image === 'string') str += `image = '${image}', `;

    str = str.substring(0, str.length - 2) + ' ';

    return str.length > 1 ? 'WHERE ' + str : '';
  }

  _addSort(sort) {
    if (!isNaN(Number(sort))) {
      this.err.push("'sort' is not a string'");
    }

    if (sort[0] === '-') return `ORDER BY ${sort.substring(1)} DESC `;

    return `ORDER BY ${sort} `;
  }

  _addLimitOffset(limit, offset) {
    const defaultLimit = 100;

    if (limit && isNaN(Number(limit))) {
      this.err.push('\'limit\' is not a number');
    }

    if (offset && isNaN(Number(offset))) {
      this.err.push('\'offset\' is not a number');
    }

    if (!offset) return `LIMIT ${limit}`;

    return `LIMIT ${limit || defaultLimit} OFFSET ${offset}`;
  }
}