import {stub} from 'sinon';
import chai from 'chai';

import MySql from '../adapters/mySql'

describe('src/middleware/routes', function () {
  beforeEach(function () {
    this.queryStub = stub(MySql, 'query');
  });

  describe('create', function () {
    this.queryStub.resolves()
  })
});
