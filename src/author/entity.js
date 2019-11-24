'use strict';

module.exports = class AuthorEntity {
    constructor({ id, authorFirstName, authorLastName, date_created }) {
        this.firstName = authorFirstName;
        this.lastName = authorLastName;
        this.date_created = date_created;
        if (id) {
            this.id = id;
        }
    }
};
