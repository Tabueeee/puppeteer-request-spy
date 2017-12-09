# puppeteer-request-spy

The RequestInterceptor was build and tested with minimatch but minimatch is not included in the package. This allows the matching function to be replaced with custom matchers.

## Install

```bash
npm install puppeteer-request-spy
```
                                  
## Usage

create a new RequestInterceptor with a matching function and an optional logger. 
```js
requestInterceptor = new RequestInterceptor(minimatch, console);
```
create a new RequestSpy with a pattern to be matched agains all requests.
```js
pngSpy = new RequestSpy('**/*.png');
```
The Spy needs to be registered with the RequestInterceptor.
```js
requestInterceptor.addSpy(pngSpy);
```
optionally you can add patterns to block requests. 
```js
requestInterceptor.block('!https://www.example.com');
```                    
The RequestInterceptor must be registered with puppeteer and requestInterception must be set to true.
```js
 page.setRequestInterception(true);
 page.on('request', requestInterceptor.intercept.bind(requestInterceptor));
```
after puppeteers page navigates to any page, you can query the requestSpy.
 ```js
assert.ok(pngSpy.hasMatch() && pngSpy.getMatchCount() > 0);
```
## API

### class: RequestInterceptor

#### RequestInterceptor constructor(matcher, logger?)    
- matcher: <(url: string, pattern: string) => boolean>>
- logger?: <{log: (text: string) => void}> optional logger

The matcher will be called on any requested url and has to return either true or false. The matcher will be used for testing urls agains patterns of any spies provided and also any url set to be blocked.

The Logger if provided will output any all requested urls with a 'loaded' or 'aborted' prefix.
#### RequestInterceptor.intercept(interceptedUrl)
- interceptedUrl: <Request> interceptedUrl provided by puppeteer's on 'request' event

function to register with puppeteer.

#### RequestInterceptor.addSpy(requestSpy)   
- requestSpy: \<RequestSpy> spy to register.

register a spy with the RequestInterceptor
                                            
#### RequestInterceptor.clearSpies()
clears all registered spies.

#### RequestInterceptor.block(urlsToBlock)
- urlsToBlock: <Array<[string]> | <[string]>> urls to be blocked if matched

block will always add urls to the list of urls to be blocked. Passed arrays will be merged with the list.

#### RequestInterceptor.clearUrlsToBlock()
clears all registered urls to be blocked.

#### RequestInterceptor.setUrlsToBlock(urlsToBlock)
- urlsToBlock: <Array\<string>> setter for urlsToBlock

### class: RequestSpy

#### RequestSpy constructor(pattern)
- pattern: \<string|Array<string>> returns whether any url matched the pattern

#### RequestSpy.hasMatch()
- returns: \<boolean> returns whether any url matched the pattern

#### RequestSpy.getMatchedUrls()
- returns: \<Array\<string\>\> returns a list of urls that matched the pattern

#### RequestSpy.getMatchCount()
- returns: \<number> number of urls that matched the pattern 

#### RequestSpy.getPatterns()
- returns: \<Array\<string\>\> return the pattern list of the spy
                                          
#### RequestSpy.addMatchedUrl(matchedUrl)
- matchedUrl: \<string> url that was matched   

The RequestInterceptor calls this method when an interceptedUrl matches the pattern.
