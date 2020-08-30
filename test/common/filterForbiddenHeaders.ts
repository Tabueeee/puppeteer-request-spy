const FORBIDDEN_STATIC_HEADERS: Array<string> = [
    'Accept-Charset',
    'Accept-Encoding',
    'Access-Control-Request-Headers',
    'Access-Control-Request-Method',
    'Connection',
    'Content-Length',
    'Cookie',
    'Cookie2',
    'Date',
    'DNT',
    'Expect',
    'Feature-Policy',
    'Host',
    'Keep-Alive',
    'Origin',
    'Referer',
    'TE',
    'Trailer',
    'Transfer-Encoding',
    'Upgrade',
    'Via'
];

// Filters user-agent controlled headers for tests
// more information here: https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name
export function filterForbiddenHeaders(headers: { [index: string]: string }): { [index: string]: string } {

    Object.keys(headers)
          .map((header: string) => {
              if (FORBIDDEN_STATIC_HEADERS.indexOf(header) > -1) {
                  delete headers[header];
              }

              if (FORBIDDEN_STATIC_HEADERS.map((item: string) => item.toLowerCase()).indexOf(header.toLowerCase()) > -1) {
                  delete headers[header.toLowerCase()];
              }

              if (header.indexOf('Sec-') === 0 || header.indexOf('sec-') === 0) {
                  delete headers[header];
              }

              if (header.indexOf('Proxy-') === 0 || header.indexOf('proxy-') === 0) {
                  delete headers[header];
              }
          });

    return headers;
}
