'use strict';

const { stub } = require('sinon');
const MySql = require('../adapters/mySql');

describe('src/middleware/routes', function () {
    beforeEach(function () {
        this.queryStub = stub(MySql, 'query');
    });

    describe('create', function () {
        beforeEach(function () {
            this.queryStub.resolves();
        });
    });
});
