'use strict';

const BookEntity = require('./entity');
const BookDTO = require('./DTO');
const AuthorEntity = require('../author/entity');
const AuthorService = require('../author/authorService');

module.exports = class BooksService {
    constructor(db) {
        this.db = db;
        this.authorService = new AuthorService(db);
    }

    async get(data) {
        const query = QueryBuilder.select(data);
        try {
            const results = await this.db.query(query);
            return results.map(result => new BookDTO(result));
        } catch (e) {
            throw e;
        }
    }

    async create(data) {
        const book = new BookEntity(data);
        const author = new AuthorEntity(data);
        try {
            let result;
            const existsAuthor = await this.authorService.getIfExists(author);
            const queries = existsAuthor
                ? QueryBuilder.insertBook(book, existsAuthor.id)
                : QueryBuilder.insertAuthorAndBook(book, author);

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

    async update(id, params) {
        const queries = QueryBuilder.update(id, params);
        try {
            let result;
            await this._startTransactionQuery();
            for (const query of queries) {
                result = await this.db.query(query);
            }
            await this._finishTransactionQuery();
            return new BookDTO(result[0]);
        } catch (e) {
            throw e;
        }
    }

    async delete(id) {
        const query = `DELETE FROM books WHERE id = ${id}`;
        try {
            await this.db.query(query);
        } catch (e) {
            throw e;
        }
    }

    _startTransactionQuery() {
        return this.db.query('BEGIN;');
    }

    _finishTransactionQuery() {
        return this.db.query('COMMIT;');
    }
};

class QueryBuilder {
    static insertAuthorAndBook(book, author) {
        return [
            `INSERT INTO authors (first_name,last_name) VALUES ('${author.firstName}', '${author.lastName}');`,
            `INSERT INTO books (title,date,author,description,image) VALUES ('${book.title}', '${book.date}', ` +
        `LAST_INSERT_ID(), '${book.description}', '${book.image}');`,
            'SELECT * FROM books INNER JOIN authors on books.author = authors.id WHERE books.id = LAST_INSERT_ID();',
        ];
    }

    static insertBook(book, authorId) {
        return [
            `INSERT INTO books (title,date,author,description,image) VALUES ('${book.title}', '${book.date}', ` +
        `${authorId}, '${book.description}', '${book.image}');`,
            'SELECT * FROM books INNER JOIN authors on books.author = authors.id WHERE books.id = LAST_INSERT_ID();',
        ];
    }

    static select({ limit, offset, fields, sort, title, date, authorFirstName, authorLastName, description, image }) {
        let query = 'SELECT ';

        if (fields) {
            query += QueryBuilder._addFields(fields);
        } else {
            query += '*';
        }

        query += ' FROM books INNER JOIN authors on books.author = authors.id ';

        if (title || date || authorFirstName || authorLastName || description || image) {
            query += QueryBuilder._addFilter(title, date, authorFirstName, authorLastName, description, image);
        }

        if (sort) {
            query += QueryBuilder._addSort(sort);
        }

        query += QueryBuilder._addLimitOffset(limit, offset);

        query += ';';

        return query;
    }

    static update(id, { title, date, authorFirstName, authorLastName, description, image }) {
        let query = 'UPDATE books SET ';

        if (typeof title === 'string') {
            query += `title = '${title}', `;
        }
        if (typeof date === 'string') {
            query += `date = '${date}', `;
        }
        if (typeof authorFirstName === 'string') {
            query += `first_name = '${authorFirstName}', `;
        }
        if (typeof authorLastName === 'string') {
            query += `last_name = '${authorLastName}', `;
        }
        if (typeof description === 'string') {
            query += `description = '${description}', `;
        }
        if (typeof image === 'string') {
            query += `image = '${image}', `;
        }

        query = query.substring(0, query.length - 2);
        query += ` WHERE id = '${id}';`;

        return [query, `SELECT * FROM books INNER JOIN authors on books.author = authors.id WHERE books.id = ${id};`];
    }

    static _addFields(fields) {
        let str = 'books.id, ';
        let index = fields.indexOf('authorFirstName');

        if (index !== -1) {
            fields[index] = 'first_name';
        }

        index = fields.indexOf('authorLastName');
        if (index !== -1) {
            fields[index] = 'last_name';
        }

        str += Array.isArray(fields) ? fields.join(', ') : fields;

        return str;
    }

    static _addFilter(title, date, authorFirstName, authorLastName, description, image) {
        let str = '';

        if (typeof title === 'string') {
            str += `title = '${title}', `;
        }

        if (typeof date === 'string') {
            const ex = date.replace(/[^<>=]+/g, '');

            if (!date.replace(/[0-9,\-\s<>=]+/g, '')) {
                str += `date ${ex.length ? ex : '='} '${date.substring(ex.length).trim()}', `;
            } else {
                throw new Error('wrong date field ');
            }
        }

        if (typeof authorFirstName === 'string') {
            if (!authorFirstName.replace(/[a-zA-Z,\s<>=]+/g, '')) {
                str += `authors.first_name = '${authorFirstName}', `;
            } else {
                throw new Error('wrong authorFirstName field ');
            }
        }

        if (typeof authorLastName === 'string') {
            if (!authorFirstName.replace(/[a-zA-Z,\s<>=]+/g, '')) {
                str += `authors.lsat_name = '${authorLastName}', `;
            } else {
                throw new Error('wrong authorLastName field ');
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
            throw new Error('\'sort\' is not a string\'');
        }

        if (sort[0] === '-') {
            return `ORDER BY ${sort.substring(1)} DESC `;
        }

        return `ORDER BY ${sort} `;
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
