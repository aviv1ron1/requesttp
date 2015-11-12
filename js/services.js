'use strict';

app.service('responseService', function(statusService) {
    this.data = {};
    this.status = "";
    this.headers = "";
    this.dataObj = {};
    this.headersObj = {};
    this.statusObj = {};
    this.statuscolor = "";
    this.inprog = false;
    this.error = false;
    this.errorMsg = "";
    this.canceller = undefined;

    this.gotError = function(err) {
        console.log(err);
        this.error = true;
        this.errorMsg = err.message;
        this.inprog = false;
    }

    this.setHeaders = function(hdrs) {
        this.headers = "";
        for (var key in hdrs) {
            this.headers += key + ": " + hdrs[key] + "\n";
        }
        this.headersObj = hdrs;
    }
    this.setStatus = function(status) {
        this.inprog = false;
        this.error = false;
        this.statuscolor = "status-red";
        if (status) {
            this.statusObj = statusService.getStatus(status);
            this.status = this.statusObj.code + " " + this.statusObj.status;
            if (status < 200) {
                this.statuscolor = "status-white";
                return;
            }
            if (status < 300) {
                this.statuscolor = "status-green";
                return;
            }
            if (status < 400) {
                this.statuscolor = "status-orange";
                return;
            }
        } else {
            this.gotError({
                message: "canceled"
            });
        }
    }

    this.formatAs = function(format) {
        switch (format) {
            case "html":
                this.data = html_beautify(this.dataObj);
                break;
            case "xml":
                this.data = vkbeautify.xml(this.dataObj);
                break;
            case "css":
                this.data = vkbeautify.css(this.dataObj);
                break;
            case "json":
                var j = JSON.parse(this.dataObj);
                this.data = JSON.stringify(j, undefined, 2);
                break;
            default:
                this.data = this.dataObj;
        }
    }

    this.setData = function(data, hdrs) {
        this.dataObj = data;
        try {
            console.log(typeof(data));
            switch (typeof(data)) {
                case "object":
                    try {
                        this.data = JSON.stringify(data, undefined, 2);
                    }catch(err) {
                        this.data = data;
                    }
                    break;
                default:
                    var ct = hdrs['content-type'];
                    if (!ct) {
                        ct = "text/plain";
                    }
                    var mime = ct.split(";")[0];
                    switch (mime) {
                        case "text/html":
                            this.formatAs('html');
                            break;
                        case "text/xml":
                            this.formatAs('xml');
                            break;
                        case "text/css":
                            this.formatAs('css');
                            break;
                        case "application/json":
                            this.formatAs('json');
                            break;
                        default:
                            this.data = data;
                    }
            }
        } catch(err) {
            this.getError(err);
        }
    }
});

app.service('contentTypeService', function() {
    this.contentTypes = [{
        title: "html",
        value: "text/html"
    }, {
        title: "json",
        value: "application/json"
    }, {
        title: "xml",
        value: "text/xml"
    }, {
        title: "url encoded",
        value: "application/x-www-form-urlencoded"
    }];
    //http://en.wikipedia.org/wiki/Internet_media_type
});

app.service('headerService', function() {
    this.headers = [
        "Content-Type: ",
        "Content-Length: ",
        "Accept: ",
        "Accept-Charset: ",
        "Accept-Encoding: ",
        "Connection: ",
        //"Cookie: ",
        "Referer: ",
        "User-Agent: ",
        "Origin: ",
        "Host: ",
        "Cache-Control: "
    ];
    //http://en.wikipedia.org/wiki/List_of_HTTP_header_fields
});

app.service('statusService', function() {
    this.getStatus = function(code) {
        for (var i = 0; i < this.statuses.length; i++) {
            if (this.statuses[i].code == code) {
                return this.statuses[i];
            }
        }

    }
    this.statuses = [{
        code: 100,
        status: 'Continue'
    }, {
        code: 101,
        status: 'Switching Protocols'
    }, {
        code: 102,
        status: 'Processing'
    }, {
        code: 200,
        status: 'OK'
    }, {
        code: 201,
        status: 'Created'
    }, {
        code: 202,
        status: 'Accepted'
    }, {
        code: 203,
        status: 'Non-Authoritative Information'
    }, {
        code: 204,
        status: 'No Content'
    }, {
        code: 205,
        status: 'Reset Content'
    }, {
        code: 206,
        status: 'Partial Content'
    }, {
        code: 207,
        status: 'Multi-Status'
    }, {
        code: 300,
        status: 'Multiple Choices'
    }, {
        code: 301,
        status: 'Moved Permanently'
    }, {
        code: 302,
        status: 'Found'
    }, {
        code: 303,
        status: 'See Other'
    }, {
        code: 304,
        status: 'Not Modified'
    }, {
        code: 305,
        status: 'Use Proxy'
    }, {
        code: 306,
        status: 'Switch Proxy'
    }, {
        code: 307,
        status: 'Temporary Redirect'
    }, {
        code: 400,
        status: 'Bad Request'
    }, {
        code: 401,
        status: 'Unauthorized'
    }, {
        code: 402,
        status: 'Payment Required'
    }, {
        code: 403,
        status: 'Forbidden'
    }, {
        code: 404,
        status: 'Not Found'
    }, {
        code: 405,
        status: 'Method Not Allowed'
    }, {
        code: 406,
        status: 'Not Acceptable'
    }, {
        code: 407,
        status: 'Proxy Authentication Required'
    }, {
        code: 408,
        status: 'Request Timeout'
    }, {
        code: 409,
        status: 'Conflict'
    }, {
        code: 410,
        status: 'Gone'
    }, {
        code: 411,
        status: 'Length Required'
    }, {
        code: 412,
        status: 'Precondition Failed'
    }, {
        code: 413,
        status: 'Request Entity Too Large'
    }, {
        code: 414,
        status: 'Request-URI Too Long'
    }, {
        code: 415,
        status: 'Unsupported Media Type'
    }, {
        code: 416,
        status: 'Requested Range Not Satisfiable'
    }, {
        code: 417,
        status: 'Expectation Failed'
    }, {
        code: 418,
        status: 'I\'m a teapot'
    }, {
        code: 422,
        status: 'Unprocessable Entity'
    }, {
        code: 423,
        status: 'Locked'
    }, {
        code: 424,
        status: 'Failed Dependency'
    }, {
        code: 425,
        status: 'Unordered Collection'
    }, {
        code: 426,
        status: 'Upgrade Required'
    }, {
        code: 449,
        status: 'Retry With'
    }, {
        code: 450,
        status: 'Blocked by Windows Parental Controls'
    }, {
        code: 500,
        status: 'Internal Server Error'
    }, {
        code: 501,
        status: 'Not Implemented'
    }, {
        code: 502,
        status: 'Bad Gateway'
    }, {
        code: 503,
        status: 'Service Unavailable'
    }, {
        code: 504,
        status: 'Gateway Timeout'
    }, {
        code: 505,
        status: 'HTTP Version Not Supported'
    }, {
        code: 506,
        status: 'Variant Also Negotiates'
    }, {
        code: 507,
        status: 'Insufficient Storage'
    }, {
        code: 509,
        status: 'Bandwidth Limit Exceeded'
    }, {
        code: 510,
        status: 'Not Extended'
    }];
})
