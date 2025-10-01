import { CategoryModel } from "./CategoryModel";

export class ProductModel {
    public id: number;
    public name: string;
    public description: string;
    public price: number;
    public stock: number;
    public category: CategoryModel[];

    constructor(data: Partial<ProductModel> = {}) {
        this.id = data.id || 0;
        this.name = data.name || '';
        this.description = data.description || '';
        this.price = data.price || 0;
        this.stock = data.stock || 0;
        this.category = data.category || [];
    }

    public toJSON(): string { return JSON.stringify(this); }

    public static fromJSON(json: any): ProductModel {
        return new ProductModel(json);
    }
}