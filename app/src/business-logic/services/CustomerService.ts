import { CustomerDAO } from '../persistence/models/CustomerDao';
import { CustomerModel } from '../../persistence/models/CustomerModel';

export class CustomerService {
    private customerDAO: CustomerDAO;

    constructor() {
        this.customerDAO = new CustomerDAO();
    }

    /**
     * Obtiene todos los clientes.
     */
    public async getAllCustomers(): Promise<CustomerModel[]> {
        return this.customerDAO.findAll();
    }

    /**
     * Obtiene un cliente por su ID.
     * @param id El ID del cliente.
     */
    public async getCustomerById(id: number): Promise<CustomerModel | null> {
        return this.customerDAO.findById(id);
    }

    /**
     * Obtiene un cliente por su email.
     * @param email El email del cliente.
     */
    public async getCustomerByEmail(email: string): Promise<CustomerModel | null> {
        return this.customerDAO.findByEmail(email);
    }

    /**
     * Crea un nuevo cliente.
     * @param customerData Datos parciales del cliente.
     */
    public async createCustomer(customerData: Partial<CustomerModel>): Promise<CustomerModel> {
        const newCustomer = new CustomerModel(customerData);
        return this.customerDAO.create(newCustomer);
    }

    /**
     * Actualiza un cliente existente.
     * @param id El ID del cliente a actualizar.
     * @param customerData Datos parciales para actualizar.
     */
    public async updateCustomer(id: number, customerData: Partial<CustomerModel>): Promise<CustomerModel | null> {
        const existingCustomer = await this.customerDAO.findById(id);
        if (!existingCustomer) {
            return null; // O lanzar un error
        }

        // Fusiona los datos existentes con los nuevos
        const updatedCustomerData = new CustomerModel({
            ...existingCustomer,
            ...customerData,
            id: id // Asegura que el ID no cambie
        });

        return this.customerDAO.update(id, updatedCustomerData);
    }

    /**
     * Elimina un cliente por su ID.
     * @param id El ID del cliente a eliminar.
     */
    public async deleteCustomer(id: number): Promise<void> {
        return this.customerDAO.delete(id);
    }
}