'use strict';

module.exports = class BookEntity {
    constructor({ id, title, date, description, image }) {
        this.title = title;
        this.date = date;
        this.description = description;
        this.image = image;

        if (id) {
            this.id = id;
        }
    }
};
