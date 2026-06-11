export class ApiError extends Error {
  readonly _tag = "ApiError"
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export class ParseError extends Error {
  readonly _tag = "ParseError"
  constructor(message: string) {
    super(message)
  }
}
