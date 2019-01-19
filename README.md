# puppeteer-request-spy
[![Build Status](https://travis-ci.org/Tabueeee/puppeteer-request-spy.svg?branch=master)](https://travis-ci.org/Tabueeee/puppeteer-request-spy)
[![Coverage Status](https://coveralls.io/repos/github/Tabueeee/puppeteer-request-spy/badge.svg?branch=master)](https://coveralls.io/github/Tabueeee/puppeteer-request-spy?branch=master)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FTabueeee%2Fpuppeteer-request-spy.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FTabueeee%2Fpuppeteer-request-spy?ref=badge_shield)
> With puppeteer-request-spy you can easily watch, fake or block requests from puppeteer matching patterns. 

- allows you to write tests verifying specific resources are loaded as expected
- allows you to exclude unneeded requests from tests, speeding them up significantly
- allows you to alter a request's response with custom content and http status
- avoids conflicts resulting from already aborted / continued or responded requests

## Install

```bash
npm install puppeteer-request-spy --save-dev
```
                                  
## Usage

### Spying on requests with a KeywordMatcher 
First create a new `RequestInterceptor` with a `matcher` function and an optional logger. 
```js
function KeywordMatcher(testee, keyword) {
    return testee.indexOf(keyword) > -1; 
}

let requestInterceptor = new RequestInterceptor(KeywordMatcher, console);
```
Next create a new `RequestSpy` with a `pattern` to be matched against all requests.
```js
let imageSpy = new RequestSpy('/pictures');
```
The `RequestSpy` needs to be registered with the `RequestInterceptor`.
```js
requestInterceptor.addSpy(imageSpy);
```
To use the puppeteer's request event the RequestInterception flag on the page object has to be set to true. 
```js
await page.setRequestInterception(true);
```
The `RequestInterceptor` must be registered with puppeteer.
```js
page.on('request', requestInterceptor.intercept.bind(requestInterceptor));
```
After puppeteer's page object finished navigating to any page, you can query the `RequestSpy`.
 ```js
await page.goto('https://www.example.com');

assert.ok(!imageSpy.getMatchedRequests()[0].failure());
assert.ok(imageSpy.hasMatch() && imageSpy.getMatchCount() > 0);
``` 
When all responses have been loaded you can also query the response of any matched Request. You can ensure all responses have been loaded by using the networkidle0 option. For further information check the official [puppeteer API](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagegotourl-options). 
```js
for (let match of imagesSpy.getMatchedRequests()) {
    assert.ok(match.response().ok());
}
``` 
Note
> Since unhandled Promise rejections causes the node process to keep running after test failure, the `RequestInterceptor` will catch and log puppeteer's exception, if the `requestInterception` flag is not set.

### Altering Responses

#### Faking Responses
The response of intercepted requests can be replaced by adding a ResponseFaker to the RequestInterceptor. The fake response has to match the Response object as specified in the official [puppeteer API](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#requestrespondresponse).
```js
let responseFaker = new ResponseFaker('/ajax/some-request', {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({successful: false, payload: []})
});

requestInterceptor.addFaker(responseFaker);
```
For further details on how to replace different formats of data like images, text or html, please refer to the examples provided in the [github repository](https://github.com/Tabueeee/puppeteer-request-spy/blob/master/examples/fake-test.spec.js).

#### Blocking requests    
Optionally you can add `patterns` to block requests. Blocking requests speeds up page load since no data is loaded. Blocking requests takes precedence over faking responses, so any request blocked will not be replaced even when matching a `ResponseFaker`. Blocked or faked requests will still be counted by a `RequestSpy` with a matching pattern.  

```js
requestInterceptor.block(['scripts', 'track', '.png']);      
```    
### Minimatch
puppeteer-request-spy works great with [minimatch](https://github.com/isaacs/minimatch), it can be passed as the `matcher` function.
```js
const minimatch = require('minimatch');

let cssSpy = new RequestSpy('**/*.css');
let responseFaker = new ResponseFaker('**/*.jpg', someFakeResponse);
                                                        
let requestInterceptor = new RequestInterceptor(minimatch);  
responseFaker.addFaker(responseFaker);
requestInterceptor.addSpy(cssSpy);   
requestInterceptor.block('**/*.js');

await page.setRequestInterception(true);
page.on('request', requestInterceptor.intercept.bind(requestInterceptor));  
await page.goto('https://www.example.com');
                                                 
assert.ok(cssSpy.hasMatch() && cssSpy.getMatchCount() > 0);
for (let matchedRequest of cssSpy.getMatchedRequests()) {
    assert.ok(match.response().status() === 200);
}
```
## API

### class: RequestInterceptor
The `RequestInterceptor` will match any intercepted request against the `matcher` function and notify all spies with a matching pattern and block requests matching any pattern in `urlsToBlock`.
#### RequestInterceptor constructor(matcher, logger?)    
- `matcher`: <(url: string, pattern: string) => boolean>>
- `logger?`: <{log: (text: string) => void}>

The `matcher` will be called for every url, testing the url against patterns of any `RequestSpy` provided and also any url added to `urlsToBlock`.

The `logger` if provided will output any requested url with a 'loaded' or 'aborted' prefix and any exception caused by puppeteer's abort and continue functions.
#### RequestInterceptor.intercept(interceptedRequest)
- interceptedRequest: <Request> interceptedRequest provided by puppeteer's 'request' event

Function to be registered with puppeteer's request event.

#### RequestInterceptor.addSpy(requestSpy)   
- requestSpy: \<RequestSpy> spy to register

Register a spy with the `RequestInterceptor`.
                                            
#### RequestInterceptor.clearSpies()
Clears all registered spies.

#### RequestInterceptor.addFaker(requestFaker)
- responseFaker: \<ResponseFaker> faker to register   

#### RequestInterceptor.clearFakers()    
Clears all registered fakers.

#### RequestInterceptor.block(urlsToBlock)
- urlsToBlock: \<Array\<string\> | \<string\>\> urls to be blocked if matched

`block` will always add urls to the list `urlsToBlock`. Passed arrays will be merged with `urlsToBlock`.

#### RequestInterceptor.setUrlsToBlock(urlsToBlock)
- urlsToBlock: <Array\<string>> setter for `urlsToBlock`

#### RequestInterceptor.clearUrlsToBlock()
Clears all registered patterns in `urlsToBlock`.

### class: RequestSpy
`RequestSpy` is used to count and verify intercepted requests matching a specific pattern.
#### RequestSpy constructor(pattern)
- `pattern`: \<string|Array\<string>>

`pattern` passed to the `matcher` function of the `RequestInterceptor`.

#### RequestSpy.hasMatch()
- returns: \<boolean> returns whether any url matched the `pattern`

#### RequestSpy.getMatchedUrls()
- returns: \<Array\<string\>\> returns a list of urls that matched the `pattern`

#### RequestSpy.getMatchedRequests()
- returns: \<Array\<Request\>\> returns a list of requests that matched the `pattern`

#### RequestSpy.getMatchCount()
- returns: \<number> number of urls that matched the `pattern` 

#### RequestSpy.getPatterns()
- returns: \<Array\<string\>\> return the `pattern` list of the spy
                                          
#### RequestSpy.addMatch(matchedRequest)
- matchedRequest: \<Request> request that was matched

The `RequestInterceptor` calls this method when an interceptedRequest matches the pattern.

### class: RequestFaker   
`RequestFaker` is used to provide a fake response when matched to a specific pattern. 

#### RequestFaker constructor(pattern, responseFake)
- `pattern`: \<string|Array<string>>
- `responseFake`: \<`Response`|(request: `Request`): `Response`> for details refer to [puppeteer API](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#requestrespondresponse)

#### RequestFaker.getPatterns()
- returns: \<Array\<string\>\> return the `pattern` list of the faker

#### RequestFaker.getResponseFake()
- returns: \<Response\> return the fake response
 
The `RequestInterceptor` calls this method when an interceptedUrl matches the pattern.

# Examples

There are some usage examples included in the [github repository](https://github.com/Tabueeee/puppeteer-request-spy/tree/master/examples). Check them out to get started with writing a simple test with puppeteer and puppeteer-request-spy.

# Related
 - [minimatch](https://github.com/isaacs/minimatch) - For easily matching path-like strings to patterns.
 - [puppeteer](https://github.com/GoogleChrome/puppeteer) - Control chrome in headless mode with puppeteer for automated testing.

# License
MIT


[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FTabueeee%2Fpuppeteer-request-spy.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2FTabueeee%2Fpuppeteer-request-spy?ref=badge_large)
