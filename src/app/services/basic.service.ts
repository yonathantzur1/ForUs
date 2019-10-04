import { HttpClient, HttpHeaders } from '@angular/common/http';

export class BasicService {

    constructor(public http: HttpClient, public prefix?: string) {
        this.prefix = this.prefix || "";
    }

    private getUrl(url: string): string {
        return this.prefix + url;
    }

    get(url: string): Promise<any> {
        return this.http.get(this.getUrl(url)).toPromise();
    }

    post(url: string, data?: any): Promise<any> {
        if (data != null && typeof data == "object") {
            data = JSON.stringify(data);
        }

        return this.http.post(this.getUrl(url), data, this.getRequestOptions()).toPromise();
    }

    put(url: string, data?: any): Promise<any> {
        if (data != null && typeof data == "object") {
            data = JSON.stringify(data);
        }

        return this.http.put(this.getUrl(url), data, this.getRequestOptions()).toPromise();
    }

    delete(url: string): Promise<any> {
        return this.http.delete(this.getUrl(url)).toPromise();
    }

    private getRequestOptions() {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        return { headers };
    }
}