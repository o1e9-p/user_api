import {BookEntity} from "./entity";
import BookDTO from "./DTO";
import AuthorEntity from "../author/entity";

export default class BooksService {
  constructor(db) {
    this.db = db;
  }

  async get(data) {
    const query = QueryBuilder.select(data);
    const queryString = 'SELECT * FROM books WHERE id';
    this.db.query();
  }

  async create(data) {
    const queries = QueryBuilder.insert(data);

    try{
      let result;

      await this._startTransactionQuery();
      for (const str of queries) {
        result = await this.db.query(str);
      }
      await this._finishTransactionQuery();

      return new BookDTO(result[0]);
    } catch (e) {
      throw e;
    }
  }

  _startTransactionQuery() {
    return this.db.query('BEGIN;')
  }

  _finishTransactionQuery() {
    return this.db.query('COMMIT;')
  }
}

class QueryBuilder {
  static insert(data) {
    const book = new BookEntity(data);
    const author = new AuthorEntity(data);

    return [
      `INSERT INTO authors (first_name,last_name) VALUES ('${author.firstName}', '${author.lastName}');`,
      `INSERT INTO books (title,date,author,description,image) VALUES ('${book.title}', '${book.date}', ` +
      `LAST_INSERT_ID(), '${book.description}', '${book.image}');`,
      'SELECT * FROM books INNER JOIN authors on books.author = authors.id WHERE books.id = LAST_INSERT_ID();',
    ];
  }

  static select({ limit, offset, fields, sort, ...data }) {
    const { title, date, authorFirstName, authorLastName, description, image } = data;
    let str = 'SELECT ';

    if (fields){
      str += QueryBuilder._addFields(fields);
    } else {
      str += '*';
    }

    str += ' FROM books INNER JOIN authors on books.author = authors.id ';

    if (title || date || authorFirstName || authorLastName || description || image) {
      str += QueryBuilder._addFilter(data);
    }

    if (sort) {
      str += QueryBuilder._addSort(sort);
    } else {
      str += 'ORDER BY id ';
    }

    if (limit || offset) {
      str += QueryBuilder._addLimitOffset(limit, offset);
    }

    str += ';';

    return str
  }

  static update(id, {title, date, author, description, image}) {
    let str = 'UPDATE books SET ';

    if (typeof title === 'string') {
      str += `title = '${title}', `;
    }
    if (typeof date === 'string') {
      str += `date = '${date}', `;
    }
    if (typeof author === 'string') {
      str += `author = '${author}', `;
    }
    if (typeof description === 'string') {
      str += `description = '${description}', `;
    }
    if (typeof image === 'string') {
      str += `image = '${image}', `;
    }

    str = str.substring(0, str.length - 2);
    str += ` WHERE id = '${id}'`;

    return str
  }

  static _addFields(fields) {
    const str = (Array.isArray(fields)) ? fields.join(', ') : fields;

    if (str.replace(/[a-zA-Z,]+|\s+/g, '').length) {
      throw new Error("'fields' must contain only letters and commas");
    }

    return str;
  }

  static _addFilter(title, date, author, description, image) {
    let str = '';

    if (typeof title === 'string'){
      str += `title = '${title}', `;
    }

    if (typeof date === 'string') {
      const ex = date.replace(/[^<>=]+/g, '');

      if (!date.replace(/[0-9,\-\s<>=]+/g, '')) {
        str += `date ${ex.length ? ex : '='} '${date.substring(ex.length).trim()}', `;
      } else {
        throw new Error("wrong date field ");
      }
    }

    if (typeof author === 'string') {
      if (!author.replace(/[a-zA-Z,\s<>=]+/g, '')) {
        str += `author = '${author}', `;
      } else {
        throw new Error("wrong author field ");
      }
    }

    if (typeof description === 'string') {
      str += `description = '${description}', `;
    }

    if (typeof image === 'string') {
      str += `image = '${image}', `;
    }

    str = str.substring(0, str.length - 2) + ' ';

    return str.length > 1 ? 'WHERE ' + str : '';
  }

  static _addSort(sort) {
    if (!isNaN(Number(sort))) {
      throw new Error("'sort' is not a string'");
    }

    if (sort[0] === '-') {
      return `ORDER BY ${sort.substring(1)} DESC `;
    }

    return `ORDER BY ${sort} `;
  }

  static _addLimitOffset(limit, offset) {
    const defaultLimit = 100;

    if (limit && isNaN(Number(limit))) {
      throw new Error('\'limit\' is not a number');
    }

    if (offset && isNaN(Number(offset))) {
      throw new Error('\'offset\' is not a number');
    }

    if (!offset) {
      return `LIMIT ${limit}`;
    }

    return `LIMIT ${limit || defaultLimit} OFFSET ${offset}`;
  }
}
