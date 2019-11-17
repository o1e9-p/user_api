# api
http-server на базе фреймворка Koa2 </br>
База данных - MySql</br>
Кэш - Redis</br>


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

    put:
      /{documentId}
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
