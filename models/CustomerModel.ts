export class CustomerModel {
    public id: number;
    public name: string;
    public email: string;
    public phone?: string;
    public address: string;

    constructor(data: Partial<CustomerModel> = {}) {
        this.id = data.id || 0;
        this.name = data.name || '';
        this.email = data.email || '';
        this.phone = data.phone;
        this.address = data.address || '';
    }

    public toJSON(): string { return JSON.stringify(this); }

    public static fromJSON(json: any): CustomerModel {
        return new CustomerModel(json);
    }
}