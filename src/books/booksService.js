'use strict';

const BookEntity = require('./entity');
const BookDTO = require('./DTO');
const AuthorEntity = require('../author/entity');
const AuthorService = require('../author/authorService');

module.exports = class BooksService {
    constructor(db) {
        this.db = db;
        this.authorService = new AuthorService(db);
        this.queryBuilder = new QueryBuilder({
            escape: db.escape,
            escapeId: db.escapeId,
        });
    }

    async get(data) {
        const query = this.queryBuilder.select(data);
        try {
            const results = await this.db.query(query);
            return results.map(result => new BookDTO(result));
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async create(data) {
        const book = new BookEntity(data);
        const author = new AuthorEntity(data);
        const transaction = new Transaction(this.db);

        try {
            let result;
            const existsAuthor = await this.authorService.getIfExists(author);
            const queries = existsAuthor
                ? this.queryBuilder.insertBook(book, existsAuthor.id)
                : this.queryBuilder.insertAuthorAndBook(book, author);

            await transaction.start();

            for (const str of queries) {
                result = await this.db.query(str);
            }

            await transaction.stop();
            console.log(result[0]);
            return new BookDTO(result[0]);
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async update(id, params) {
        const queries = this.queryBuilder.update(id, params);
        const transaction = new Transaction(this.db);

        try {
            let result;

            await transaction.start();
            for (const query of queries) {
                result = await this.db.query(query);
            }
            await transaction.stop();

            return result.length ? new BookDTO(result[0]) : null;
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async delete(id) {
        const query = `DELETE FROM books WHERE id = ${id}`;
        try {
            await this.db.query(query);
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
};

class Transaction {
    constructor(db) {
        this.db = db;
    }

    async start() {
        return this.db.query('BEGIN;');
    }

    async stop() {
        return this.db.query('COMMIT;');
    }
}

class QueryBuilder {
    constructor({ escape, escapeId }) {
        this.escape = escape;
        this.escapeId = escapeId;
    }
    insertAuthorAndBook(book, { firstName, lastName }) {
        const lastInsertId = 'LAST_INSERT_ID()';
        return [
            `INSERT INTO authors SET first_name = ${this.escape(firstName)}, last_name = ${this.escape(lastName)};`,
            this._buildBookInsert(book, lastInsertId),
            QueryBuilder._buildBookSelect(),
        ];
    }

    insertBook(book, authorId) {
        return [this._buildBookInsert(book, authorId), QueryBuilder._buildBookSelect()];
    }

    _buildBookInsert({ title, date, description, image }, author) {
        return (
            `INSERT INTO books SET title = ${this.escape(title)}, date = ${this.escape(date)}, ` +
      `author = ${author}, description = ${this.escape(description)}, image = ${this.escape(image)};`
        );
    }

    static _buildBookSelect() {
        return (
            'SELECT b.id, title, date, author, description, image, first_name, last_name ' +
      'FROM books as b INNER JOIN authors as a on b.author = a.id WHERE b.id = LAST_INSERT_ID();'
        );
    }

    select({ limit, offset, fields, sort, title, date, authorFirstName, authorLastName, description, image }) {
        let query = 'SELECT ';

        if (fields) {
            query += this._addFields(fields);
        } else {
            query += '*';
        }

        query += ' FROM books INNER JOIN authors on books.author = authors.id ';

        if (title || date || authorFirstName || authorLastName || description || image) {
            query += this._addFilter(title, date, authorFirstName, authorLastName, description, image);
        }

        if (sort) {
            query += this._addSort(sort);
        }

        query += QueryBuilder._addLimitOffset(limit, offset);
        query += ';';

        return query;
    }

    update(id, { title, date, authorFirstName, authorLastName, description, image }) {
        let query = 'UPDATE books SET ';

        if (typeof title === 'string') {
            query += `title = ${this.escape(title)}, `;
        }
        if (typeof date === 'string') {
            query += `date = ${this.escape(date)}, `;
        }
        if (typeof authorFirstName === 'string') {
            query += `first_name = ${this.escape(authorFirstName)}, `;
        }
        if (typeof authorLastName === 'string') {
            query += `last_name = ${this.escape(authorLastName)}, `;
        }
        if (typeof description === 'string') {
            query += `description = ${this.escape(description)}, `;
        }
        if (typeof image === 'string') {
            query += `image = ${this.escape(image)}, `;
        }

        query = query.substring(0, query.length - 2);
        query += ` WHERE id = ${this.escape(id)};`;

        return [
            query,
            'SELECT b.id, title, date, author, description, image, first_name, last_name ' +
        `FROM books as b INNER JOIN authors as a on b.author = a.id WHERE b.id = ${this.escape(id)};`,
        ];
    }

    _addFields(fields) {
        let str = 'books.id, ';
        let index = fields.indexOf('authorFirstName');

        if (index !== -1) {
            fields[index] = 'first_name';
        }

        index = fields.indexOf('authorLastName');
        if (index !== -1) {
            fields[index] = 'last_name';
        }

        const escapedFields = fields.map(field => this.escapeId(field));
        console.log(escapedFields);
        str += Array.isArray(escapedFields) ? escapedFields.join(', ') : escapedFields;

        return str;
    }

    _addFilter(title, date, authorFirstName, authorLastName, description, image) {
        let str = '';

        if (typeof title === 'string') {
            str += `title = ${this.escape(title)}, `;
        }

        if (typeof date === 'string') {
            const ex = date.replace(/[^<>=]+/g, '');

            if (!date.replace(/[0-9,\-\s<>=]+/g, '')) {
                str += `date ${ex.length ? ex : '='} ${this.escape(date.substring(ex.length).trim())}, `;
            } else {
                throw new Error('wrong date field ');
            }
        }

        if (typeof authorFirstName === 'string') {
            if (!authorFirstName.replace(/[a-zA-Z,\s<>=]+/g, '')) {
                str += `authors.first_name = ${this.escape(authorFirstName)}, `;
            } else {
                throw new Error('wrong authorFirstName field ');
            }
        }

        if (typeof authorLastName === 'string') {
            if (!authorFirstName.replace(/[a-zA-Z,\s<>=]+/g, '')) {
                str += `authors.lsat_name = ${this.escape(authorLastName)}, `;
            } else {
                throw new Error('wrong authorLastName field ');
            }
        }

        if (typeof description === 'string') {
            str += `description = ${this.escape(description)}, `;
        }

        if (typeof image === 'string') {
            str += `image = ${this.escape(image)}, `;
        }

        str = str.substring(0, str.length - 2) + ' ';

        return str.length > 1 ? 'WHERE ' + str : '';
    }

    _addSort(sort) {
        if (sort[0] === '-') {
            return `ORDER BY ${this.escapeId(sort.substring(1))} DESC `;
        }

        return `ORDER BY ${this.escapeId(sort)} `;
    }

    static _addLimitOffset(limit = '100', offset = '0') {
        if (limit && isNaN(Number(limit))) {
            throw new Error('\'limit\' is not a number');
        }

        if (offset && isNaN(Number(offset))) {
            throw new Error('\'offset\' is not a number');
        }

        if (!offset) {
            return `LIMIT ${limit}`;
        }

        return `LIMIT ${limit} OFFSET ${offset}`;
    }
}
