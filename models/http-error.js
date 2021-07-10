//customize native error with message and response code
class HttpError extends Error {
  constructor(message, errorCode) {
    super(message);
    this.code = errorCode;
  }
}

module.exports = HttpError
