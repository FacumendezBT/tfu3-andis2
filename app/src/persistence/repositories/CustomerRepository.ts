import { CustomerModel } from '../models/CustomerModel';
import { CustomerDAO } from '../daos/CustomerDao';
import { ICustomerRepository } from '../../business-logic/repositories/ICustomerRepository';

export class CustomerRepository implements ICustomerRepository {
    private customerDAO: CustomerDAO;

    constructor() {
        this.customerDAO = new CustomerDAO();
    }

    async create(customer: CustomerModel): Promise<CustomerModel> {
        try {
            this.validarHumano(customer);
            
            const createdCustomer = await this.customerDAO.create(customer);
            return this.mapToModel(createdCustomer);
        } catch (error) {
            throw new Error(`Error del repo creando cliente: ${error}`);
        }
    }

    async findById(id: number): Promise<CustomerModel | null> {
        try {
            if (id <= 0) {
                throw new Error('El ID del cliente debe ser un número positivo');
            }

            const customer = await this.customerDAO.findById(id);
            return customer ? this.mapToModel(customer) : null;
        } catch (error) {
            throw new Error(`Error del repo buscando cliente por ID: ${error}`);
        }
    }

    async findAll(): Promise<CustomerModel[]> {
        try {
            const customers = await this.customerDAO.findAll();
            return customers.map(customer => this.mapToModel(customer));
        } catch (error) {
            throw new Error(`Error del repo buscando todos los clientes: ${error}`);
        }
    }

    async update(id: number, customer: CustomerModel): Promise<CustomerModel> {
        try {
            if (id <= 0) {
                throw new Error('El ID del cliente debe ser un número positivo');
            }

            this.validarHumano(customer);

            const updatedCustomer = await this.customerDAO.update(id, customer);
            return this.mapToModel(updatedCustomer);
        } catch (error) {
            throw new Error(`Error del repo actualizando cliente: ${error}`);
        }
    }

    async delete(id: number): Promise<void> {
        try {
            if (id <= 0) {
                throw new Error('El ID del cliente debe ser un número positivo');
            }

            await this.customerDAO.delete(id);
        } catch (error) {
            throw new Error(`Error del repo eliminando cliente: ${error}`);
        }
    }

    async findByEmail(email: string): Promise<CustomerModel | null> {
        try {
            if (!email || !this.isValidEmail(email)) {
                throw new Error('Formato de correo electrónico inválido');
            }

            const customer = await this.customerDAO.findByEmail(email);
            return customer ? this.mapToModel(customer) : null;
        } catch (error) {
            throw new Error(`Error del repo buscando cliente por correo: ${error}`);
        }
    }

    async findByName(name: string): Promise<CustomerModel[]> {
        try {
            if (!name || name.trim().length === 0) {
                throw new Error('El nombre no puede estar vacío');
            }

            const allCustomers = await this.customerDAO.findAll();
            const filteredCustomers = allCustomers.filter(customer => 
                customer.name.toLowerCase().includes(name.toLowerCase())
            );
            return filteredCustomers.map(customer => this.mapToModel(customer));
        } catch (error) {
            throw new Error(`Error del repo buscando clientes por nombre: ${error}`);
        }
    }

    async findActiveCustomers(): Promise<CustomerModel[]> {
        try {
            const customers = await this.customerDAO.findAll();
            return customers.map(customer => this.mapToModel(customer));
        } catch (error) {
            throw new Error(`Error del repo buscando clientes activos: ${error}`);
        }
    }

    private mapToModel(daoResult: CustomerModel): CustomerModel {
        if (!daoResult) {
            throw new Error('No se pueden mapear datos de cliente nulos o indefinidos');
        }

        const customer = new CustomerModel({
            id: daoResult.id,
            name: daoResult.name,
            email: daoResult.email,
            phone: daoResult.phone,
            address: daoResult.address
        });

        this.validarHumano(customer);

        return customer;
    }

    private validarHumano(customer: CustomerModel): void {
        if (!customer.name || customer.name.trim().length === 0) {
            throw new Error('El nombre del cliente no puede estar vacío');
        }

        if (!customer.email || !this.isValidEmail(customer.email)) {
            throw new Error('El cliente debe tener una dirección de correo válida');
        }

        if (!customer.address || customer.address.trim().length === 0) {
            throw new Error('La dirección del cliente no puede estar vacía');
        }

        if (customer.phone && customer.phone.length < 8) {
            throw new Error('El número de teléfono debe tener al menos 8 caracteres');
        }
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}