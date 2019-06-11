export class ResponseError extends Error {
    public response: Response;

    constructor(response: Response) {
        super(response.statusText);
        this.response = response;
    }
}
