# api
http-server на базе фреймворка Koa2 </br>
База данных - MySql</br>
Кэш - Redis</br>

    CREATE TABLE books (
        `id` MEDIUMINT AUTO_INCREMENT PRIMARY KEY,
        `title` VARCHAR(100),
        `date` DATE,
        `author` VARCHAR(30),
        `description` VARCHAR(255),
        `image` VARCHAR(255)
        `date_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `date_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE authors (
        `id` MEDIUMINT AUTO_INCREMENT PRIMARY KEY,
        `first_name` VARCHAR(30),
        `last_name` VARCHAR(30),
        `date_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `date_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );


    /books
    get:
        uriParameters:
            sort:
                description: Only one parameter.
                type: string
                pattern: ^-?(title|autor|date|desrition|image)
            fields:
                description: multiple parameters allowed
                type: string
                pattern: ^(title|autor|date|desrition|image)
            limit:
                type: number
            offset:
                type: number
            title
                description: Only one parameter.
                type: string
            autor
                description: Only one parameter.
                 type: string
            date
                description: Only one parameter.
                type: string
            desrition
                description: Only one parameter.
                type: string
            image
                description: Only one parameter.
                type: string


    /books
    post:
        description: Add a new document
        body:
            application/x-www-form-urlencoded
            formParameters:
                title:
                    description: The name of the book
                    type: string
                    required: true
                autor:
                    description: The name of the author
                    type: string
                    required: true
                description:
                    type: string
                    required: true
                date:
                    type: date
                    example: 2018-12-30
                    required: true
                image:
                    type: string
                    required: true

    /books/{bookId}
    post:
        description: Update a document
        body:
            formParameters:
                title:
                    description: The name of the book
                    type: string
                    required: false
                autor:
                    description: The name of the author
                    type: string
                    required: false
                description:
                    type: string
                    required: false
                date:
                    type: date
                    example: 2018-12-30
                    required: false
                image:
                    type: string
                    required: false

    /books/{bookId}
    delete

    /books/{bookId}
    delete
