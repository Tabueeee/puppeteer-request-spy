# API

## class: RequestInterceptor
The `RequestInterceptor` will call all spies, fakers and blocker to dertermine if an intercepted request matches. against the `matcher` function and notify all spies with a matching pattern and block requests matching any pattern in `urlsToBlock`.

### RequestInterceptor constructor(matcher, logger?)    
- `matcher`: \<(url: string, pattern: string) =\> boolean\>\>
- `logger?`: \<{log: (text: string) =\> void}\>

The `matcher` will be called for every url, testing the url against patterns of any `RequestSpy` provided and also any url added to `urlsToBlock`.

The `logger` if provided will output any requested url with a 'loaded' or 'aborted' prefix and any exception caused by puppeteer's abort and continue functions.
### RequestInterceptor.intercept(interceptedRequest)
- interceptedRequest: <Request> interceptedRequest provided by puppeteer's 'request' event

Function to be registered with puppeteer's request event.

### RequestInterceptor.addSpy(requestSpy)   
- requestSpy: \<IRequestSpy> spy to register

Register a spy with the `RequestInterceptor`.

### RequestInterceptor.clearSpies()
Clears all registered spies.

### RequestInterceptor.addFaker(requestFaker)
- responseFaker: \<IResponseFaker> faker to register

### RequestInterceptor.clearFakers()
Clears all registered fakers.

### RequestInterceptor.addRequestModifier(requestModifier)
- responseModifier: \<IRequestModifier> modifier to register

### RequestInterceptor.clearFakers()
Clears all registered modifiers.

### RequestInterceptor.block(urlsToBlock)
- urlsToBlock: \<Array\<string\> | \<string\>\> urls to be blocked if matched

`block` will always add urls to the list `urlsToBlock`. Passed arrays will be merged with `urlsToBlock`.

### RequestInterceptor.setUrlsToBlock(urlsToBlock)
- urlsToBlock: <Array\<string>> setter for `urlsToBlock`

### RequestInterceptor.clearUrlsToBlock()
Clears all registered patterns in `urlsToBlock`.

### RequestInterceptor.setRequestBlocker(requestBlocker)
- requestBlocker \<IRequestBlocker\>

Allows you to replace the default RequestBlocker by your own implementation.


## class: RequestSpy implements IRequestSpy
`RequestSpy` is used to count and verify intercepted requests matching a specific pattern.

### RequestSpy constructor(pattern)
- `pattern`: \<string|Array\<string>>

`pattern` passed to the `matcher` function of the `RequestInterceptor`.

### RequestSpy.hasMatch()
- returns: \<boolean> returns whether any url matched the `pattern`

### RequestSpy.getMatchedUrls()
- returns: \<Array\<string\>\> returns a list of urls that matched the `pattern`

### RequestSpy.getMatchedRequests()
- returns: \<Array\<Request\>\> returns a list of requests that matched the `pattern`

### RequestSpy.getMatchCount()
- returns: \<number> number of urls that matched the `pattern` 

### RequestSpy.isMatchingRequest(request, matcher)
- request \<Request\> request object provided by puppeteer
- matcher \<(url: string, pattern: string) =\> boolean\>\> matching function passed to RequestInterceptor's constructor
- returns: \<boolean\> returns true if any pattern provided to the RequestSpy matches the request url  

The `RequestInterceptor` calls this method to determine if an interceptedRequest matches the RequestSpy.

### RequestSpy.addMatch(matchedRequest)
- matchedRequest: \<Request> request that was matched

The `RequestInterceptor` calls this method when an interceptedRequest matches the pattern.


## class: ResponseFaker implements IResponseFaker
`ResponseFaker` is used to provide a fake response when matched to a specific pattern. 

### ResponseFaker constructor(pattern, responseFake)
- `pattern`: \<string|Array<string>>
- `responseFake`: \<((request: Request) => RespondOptions | Promise<RespondOptions>) | RespondOptions> for details refer to [puppeteer API](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#requestrespondresponse)

### ResponseFaker.getPatterns()
- returns: \<Array\<string\>\> return the `pattern` list of the faker

### ResponseFaker.getResponseFake()
- returns: \<Promise<RespondOptions>\> return the fake response
 
The `RequestInterceptor` calls this method when an interceptedUrl matches the pattern.

### ResponseFaker.isMatchingRequest(request, matcher)
- request \<Request\> request object provided by puppeteer
- matcher \<(url: string, pattern: string) =\> boolean\>\> matching function passed to RequestInterceptor's constructor
- returns: \<boolean\> returns true if any pattern provided to the ResponseFaker matches the request url  

The `RequestInterceptor` calls this method to determine if an interceptedRequest matches.


## class: ResponseModifier implements IResponseFaker
`ResponseModifier` is used to load the original response and modify it on the fly as a fake response when matched to a specific pattern. 

### ResponseModifier constructor(pattern, responseModifierCallback)
- `pattern`: \<string|Array<string>>
- `responseModifierCallback`: \<(response: string, request: Request) => string | Promise<string>>

### ResponseModifier.getPatterns()
- returns: \<Array\<string\>\> return the `pattern` list of the faker

### ResponseModifier.getResponseFake(request)
- `request`: \<Request>
- returns: \<Promise<RespondOptions>\> return the fake response
 
The `RequestInterceptor` calls this method when an interceptedUrl matches the pattern.

### ResponseModifier.isMatchingRequest(request, matcher)
- request \<Request\> request object provided by puppeteer
- matcher \<(url: string, pattern: string) =\> boolean\>\> matching function passed to RequestInterceptor's constructor
- returns: \<boolean\> returns true if any pattern provided to the ResponseModifier matches the request url  

The `RequestInterceptor` calls this method to determine if an interceptedRequest matches.


## class: RequestModifier implements IRequestModifier
`RequestModifier` is used to change the matched request to a different request. 

### RequestModifier constructor(pattern, responseModifierCallback)
- `pattern`: \<string|Array\<string\>\>
- `requestOverride`: \<((request: Request) => Promise<Overrides> | Overrides) | Overrides\>

### RequestModifier.getPatterns()
- returns: \<Array\<string\>\> return the `pattern` list of the modifier

### RequestModifier.getOverride(request)
- `request`: \<Request>
- returns: \<Promise<Overrides>\> return the request overrides
 
The `RequestInterceptor` calls this method when an interceptedUrl matches the pattern.

### RequestModifier.isMatchingRequest(request, matcher)
- request \<Request\> request object provided by puppeteer
- matcher \<(url: string, pattern: string) =\> boolean\>\> matching function passed to RequestInterceptor's constructor
- returns: \<boolean\> returns true if any pattern provided to the RequestModifier matches the request url  

The `RequestInterceptor` calls this method to determine if an interceptedRequest matches.


## class: RequestRedirector implements IRequestModifier
`RequestRedirector` is used to change the matched request to a different url. 

### RequestRedirector constructor(pattern, redirectionUrl)
- `pattern`: \<string|Array\<string\>\>
- `requestOverride`: \<((request: Request) => string) | string\>

### RequestRedirector.getPatterns()
- returns: \<Array\<string\>\> return the `pattern` list of the modifier

### RequestRedirector.getOverride(request)
- `request`: \<Request>
- returns: \<Promise<Overrides>\> return the request overrides
 
The `RequestInterceptor` calls this method when an interceptedUrl matches the pattern.

### RequestRedirector.isMatchingRequest(request, matcher)
- request \<Request\> request object provided by puppeteer
- matcher \<(url: string, pattern: string) =\> boolean\>\> matching function passed to RequestInterceptor's constructor
- returns: \<boolean\> returns true if any pattern provided to the RequestRedirector matches the request url  

The `RequestInterceptor` calls this method to determine if an interceptedRequest matches.


## class: RequestBlocker implements IResponseBlocker 
`RequestBlocker` is used to by the RequestInterceptor to match requests to block. 

### RequestBlocker.shouldBlockRequest(request, matcher)
- request \<Request\> request object provided by puppeteer
- matcher \<(url: string, pattern: string) =\> boolean\>\> matching function passed to RequestInterceptor's constructor

The `RequestInterceptor` calls this method to determine if an interceptedRequest matches.

### RequestBlocker.addUrlsToBlock(urls)
- urls \<Array<string> | string\>

Adds new urls to the block list.

### RequestBlocker.clearUrlsToBlock()

Removes all entries of the block list.
