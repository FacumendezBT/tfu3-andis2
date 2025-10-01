import { CustomerModel } from "../../persistence/models/CustomerModel";

export interface ICustomerRepository {
    create(customer: CustomerModel): Promise<CustomerModel>;
    findById(id: number): Promise<CustomerModel | null>;
    findAll(): Promise<CustomerModel[]>;
    update(id: number, customer: CustomerModel): Promise<CustomerModel>;
    delete(id: number): Promise<void>;
    findByEmail(email: string): Promise<CustomerModel | null>;
    findByName(name: string): Promise<CustomerModel[]>;
    findActiveCustomers(): Promise<CustomerModel[]>;
}