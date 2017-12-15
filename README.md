# puppeteer-request-spy

> With puppeteer-request-spy you can easily watch or block requests from puppeteer matching patterns. 

- allows you to write tests verifying specific resources getting requested as expected
- allows you to exclude unneeded requests from tests, speeding them up significantly
- avoids conflicts resulting from already aborted / continued requests

## Install

```bash
npm install puppeteer-request-spy
```
                                  
## Usage

### KeywordMatcher 
        
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
The `RequestInterceptor` must be registered with puppeteer.

```js
page.on('request', requestInterceptor.intercept.bind(requestInterceptor));
```
After puppeteer's page object finished navigating to any page, you can query the `RequestSpy`.
 ```js
await page.goto('https://www.example.com');
assert.ok(imageSpy.hasMatch() && imageSpy.getMatchCount() > 0);
``` 
### blocking requests    
Optionally you can add `patterns` to block requests. When blocking requests puppeteer's requestInterception flag must be set to true or puppeteer will throw an exception. For further information check the official [puppeteer API](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagesetrequestinterceptionvalue). Blocked requests will still be counted by a `RequestSpy` with a matching pattern. 
```js
requestInterceptor.block(['scripts', 'track', '.png']);      
await page.setRequestInterception(true);
```                    
Note
> Since unhandled Promise rejections causes the node process to keep running after test failure, the `RequestInterceptor` will catch and log puppeteer's exception.

### minimatch
puppeteer-request-spy works great with [minimatch](https://github.com/isaacs/minimatch), it can be passed as the `matcher` function.
```js
const minimatch = require('minimatch');

let pngSpy = new RequestSpy('**/*.png');    

let requestInterceptor = new RequestInterceptor(minimatch);  
requestInterceptor.addSpy(pngSpy);   
requestInterceptor.block('!https://www.example.com');

await page.setRequestInterception(true);
page.on('request', requestInterceptor.intercept.bind(requestInterceptor));  
await page.goto('https://www.example.com');

assert.ok(pngSpy.hasMatch() && pngSpy.getMatchCount() > 0);
```
## API


### class: RequestInterceptor
The `RequestInterceptor` will match any intercepted request against the `matcher` function and notify all spies with a matching pattern and block requests matching any pattern in `urlsToBlock`.
#### RequestInterceptor constructor(matcher, logger?)    
- `matcher`: <(url: string, pattern: string) => boolean>>
- `logger?`: <{log: (text: string) => void}>

The `matcher` will be called for every url, testing the url against patterns of any `RequestSpy` provided and also any url added to `urlsToBlock`.

The `logger` if provided will output any requested url with a 'loaded' or 'aborted' prefix and any exception caused by puppeteer's abort and continue functions.
#### RequestInterceptor.intercept(interceptedUrl)
- interceptedUrl: <Request> interceptedUrl provided by puppeteer's 'request' event

Function to be registered with puppeteer's request event.

#### RequestInterceptor.addSpy(requestSpy)   
- requestSpy: \<RequestSpy> spy to register

Register a spy with the `RequestInterceptor`.
                                            
#### RequestInterceptor.clearSpies()
Clears all registered spies.

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
- pattern: \<string|Array<string>>

`pattern` passed to the `matcher` function of the `RequestInterceptor`.

#### RequestSpy.hasMatch()
- returns: \<boolean> returns whether any url matched the `pattern`

#### RequestSpy.getMatchedUrls()
- returns: \<Array\<string\>\> returns a list of urls that matched the `pattern`

#### RequestSpy.getMatchCount()
- returns: \<number> number of urls that matched the `pattern` 

#### RequestSpy.getPatterns()
- returns: \<Array\<string\>\> return the pattern list of the spy
                                          
#### RequestSpy.addMatchedUrl(matchedUrl)
- matchedUrl: \<string> url that was matched   

The `RequestInterceptor` calls this method when an interceptedUrl matches the pattern.

# Examples

There are some simple usage examples included in the [github repository](https://github.com/Tabueeee/puppeteer-request-spy/tree/master/examples). Check them out to get started with writing a simple test with puppeteer and puppeteer-request-spy.

# Related
 - [minimatch](https://github.com/isaacs/minimatch) - For easily matching path-like strings to patterns.
 - [puppeteer](https://github.com/GoogleChrome/puppeteer) - Control chrome in headless mode with puppeteer for automated testing.

# License
MIT
