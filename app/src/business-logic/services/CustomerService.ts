import { CustomerRepository } from '../../persistence/repositories/CustomerRepository';
import { CustomerModel } from '../../persistence/models/CustomerModel';
import { ICustomerRepository } from '../repositories/ICustomerRepository';

export class CustomerService {
    private customerRepository: ICustomerRepository;

    constructor() {
        this.customerRepository = new CustomerRepository();
    }

    /**
     * Obtiene todos los clientes.
     */
    public async getAllCustomers(): Promise<CustomerModel[]> {
        return this.customerRepository.findAll();
    }

    /**
     * Obtiene un cliente por su ID.
     * @param id El ID del cliente.
     */
    public async getCustomerById(id: number): Promise<CustomerModel | null> {
        return this.customerRepository.findById(id);
    }

    /**
     * Obtiene un cliente por su email.
     * @param email El email del cliente.
     */
    public async getCustomerByEmail(email: string): Promise<CustomerModel | null> {
        return this.customerRepository.findByEmail(email);
    }

    /**
     * Crea un nuevo cliente.
     * @param customerData Datos parciales del cliente.
     */
    public async createCustomer(customerData: Partial<CustomerModel>): Promise<CustomerModel> {
        const newCustomer = new CustomerModel(customerData);
        return this.customerRepository.create(newCustomer);
    }

    /**
     * Actualiza un cliente existente.
     * @param id El ID del cliente a actualizar.
     * @param customerData Datos parciales para actualizar.
     */
    public async updateCustomer(id: number, customerData: Partial<CustomerModel>): Promise<CustomerModel | null> {
        const existingCustomer = await this.customerRepository.findById(id);
        if (!existingCustomer) {
            return null; // O lanzar un error
        }

        // Fusiona los datos existentes con los nuevos
        const updatedCustomerData = new CustomerModel({
            ...existingCustomer,
            ...customerData,
            id: id // Asegura que el ID no cambie
        });

        return this.customerRepository.update(id, updatedCustomerData);
    }

    /**
     * Elimina un cliente por su ID.
     * @param id El ID del cliente a eliminar.
     */
    public async deleteCustomer(id: number): Promise<void> {
        return this.customerRepository.delete(id);
    }

    /**
     * Busca clientes por nombre.
     * @param name El nombre o parte del nombre a buscar.
     */
    public async searchCustomersByName(name: string): Promise<CustomerModel[]> {
        return this.customerRepository.findByName(name);
    }

    /**
     * Obtiene todos los clientes activos.
     */
    public async getActiveCustomers(): Promise<CustomerModel[]> {
        return this.customerRepository.findActiveCustomers();
    }
}