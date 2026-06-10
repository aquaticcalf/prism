export class ApiError {
  readonly _tag = "ApiError"
  readonly status: number
  readonly message: string
  constructor(status: number, message: string) {
    this.status = status
    this.message = message
  }
}

export class ParseError {
  readonly _tag = "ParseError"
  readonly message: string
  constructor(message: string) {
    this.message = message
  }
}
