'use strict';

const AuthorEntity = require('./entity');

module.exports = class AuthorService {
    constructor(db) {
        this.db = db;
    }

    async getIfExists({ firstName, lastName }) {
        const result = await this.db.queryBuilder(
            `SELECT * FROM authors WHERE first_name = '${firstName}' AND last_name = '${lastName}';`,
        );
        return result.length ? new AuthorEntity(result[0]) : null;
    }

    async delete(id) {
        const query = `DELETE FROM authors WHERE id = ${id}`;
        try {
            await this.db.queryBuilder(query);
        } catch (e) {
            throw e;
        }
    }
};
