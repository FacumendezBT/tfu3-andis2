import { CategoryModel } from "../models/CategoryModel";
import { BigPotatoDao } from "../models/types";
import { DatabaseConnection } from "../../config/DatabaseConnection";

export class CategoryDAO implements BigPotatoDao<CategoryModel, number> {
    private dbConnection = DatabaseConnection.getInstance();

    async create(category: CategoryModel): Promise<CategoryModel> {
        try {
            const result = await this.dbConnection.execute(
                `INSERT INTO categories (name, description) VALUES (?, ?)`,
                [category.name, category.description]
            );
            
            const createdCategory = await this.findById(Number(result.insertId));
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
            const rows = await this.dbConnection.query(
                `SELECT * FROM categories WHERE id = ?`,
                [id]
            );
            
            return rows && rows.length > 0 ? CategoryModel.fromJSON(rows[0]) : null;
        } catch (error) {
            throw new Error(`Error finding category by ID: ${error}`);
        }
    }

    async findAll(): Promise<CategoryModel[]> {
        try {
            const rows = await this.dbConnection.query(`SELECT * FROM categories ORDER BY name`);
            return rows.map((row: any) => CategoryModel.fromJSON(row));
        } catch (error) {
            throw new Error(`Error finding all categories: ${error}`);
        }
    }

    async update(id: number, category: CategoryModel): Promise<CategoryModel> {
        try {
            await this.dbConnection.execute(
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
            await this.dbConnection.execute(`DELETE FROM product_categories WHERE category_id = ?`, [id]);
            await this.dbConnection.execute(`DELETE FROM categories WHERE id = ?`, [id]);
        } catch (error) {
            throw new Error(`Error deleting category: ${error}`);
        }
    }

    async findByName(name: string): Promise<CategoryModel | null> {
        try {
            const rows = await this.dbConnection.query(
                `SELECT * FROM categories WHERE name = ?`,
                [name]
            );
            return rows && rows.length > 0 ? CategoryModel.fromJSON(rows[0]) : null;
        } catch (error) {
            throw new Error(`Error finding category by name: ${error}`);
        }
    }
}