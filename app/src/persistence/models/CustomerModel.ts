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

    public toJSON(): Record<string, unknown> {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            phone: this.phone,
            address: this.address
        };
    }

    public static fromJSON(json: any): CustomerModel {
        return new CustomerModel(json);
    }
}