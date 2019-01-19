import {Request} from 'puppeteer';
import * as sinon from 'sinon';

export const mockRequest: Request = {
    abort: sinon.spy(),
    continue: sinon.spy(),
    failure: sinon.spy(),
    frame: sinon.spy(),
    headers: sinon.spy(),
    isNavigationRequest: sinon.spy(),
    method: sinon.spy(),
    postData: sinon.spy(),
    redirectChain: sinon.spy(),
    resourceType: sinon.spy(),
    respond: sinon.spy(),
    response: sinon.spy(),
    url: sinon.spy()
};
