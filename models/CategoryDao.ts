import { BigPotatoDao } from './types';
import { DatabaseConnection } from './DatabaseConnection';
import { promisify } from 'util';
import { CategoryModel } from './CategoryModel';

export class CategoryDAO implements BigPotatoDao<CategoryModel, number> {
    private db = DatabaseConnection.getInstance().getDatabase();
    private run = promisify(this.db.run.bind(this.db));
    private get = promisify(this.db.get.bind(this.db));
    private all = promisify(this.db.all.bind(this.db));

    async create(category: CategoryModel): Promise<CategoryModel> {
        try {
            const result = await this.run(
                `INSERT INTO categories (name, description) VALUES (?, ?)`,
                [category.name, category.description]
            );
            
            const createdCategory = await this.findById((result as any).lastID);
            if (!createdCategory) {
                throw new Error('Failed to create category');
            }
            return createdCategory;
        } catch (error) {
            throw new Error(`Error creating category: ${error}`);
        }
    }

    async findById(id: number): Promise<CategoryModel | null> {
        try {
            const row = await this.get(
                `SELECT * FROM categories WHERE id = ?`,
                [id]
            );
            
            return row ? CategoryModel.fromJSON(row) : null;
        } catch (error) {
            throw new Error(`Error finding category by ID: ${error}`);
        }
    }

    async findAll(): Promise<CategoryModel[]> {
        try {
            const rows = await this.all(`SELECT * FROM categories ORDER BY name`);
            return rows.map((row: any) => CategoryModel.fromJSON(row).toJSON());
        } catch (error) {
            throw new Error(`Error finding all categories: ${error}`);
        }
    }

    async update(id: number, category: CategoryModel): Promise<CategoryModel> {
        try {
            await this.run(
                `UPDATE categories SET name = ?, description = ? WHERE id = ?`,
                [category.name, category.description, id]
            );
            
            const updatedCategory = await this.findById(id);
            if (!updatedCategory) {
                throw new Error('CategoryModel not found after update');
            }
            return updatedCategory;
        } catch (error) {
            throw new Error(`Error updating category: ${error}`);
        }
    }

    async delete(id: number): Promise<void> {
        try {
            // Remove from product_categories first (foreign key constraint)
            await this.run(`DELETE FROM product_categories WHERE category_id = ?`, [id]);
            await this.run(`DELETE FROM categories WHERE id = ?`, [id]);
        } catch (error) {
            throw new Error(`Error deleting category: ${error}`);
        }
    }

    async findByName(name: string): Promise<CategoryModel | null> {
        try {
            const row = await this.get(
                `SELECT * FROM categories WHERE name = ?`,
                [name]
            );
            return row ? CategoryModel.fromJSON(row) : null;
        } catch (error) {
            throw new Error(`Error finding category by name: ${error}`);
        }
    }
}