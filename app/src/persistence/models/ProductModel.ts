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
        this.category = (data.category ?? []).map((cat) =>
            cat instanceof CategoryModel ? cat : new CategoryModel(cat)
        );
    }

    public toJSON(): Record<string, unknown> {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            price: this.price,
            stock: this.stock,
            category: this.category.map((cat) =>
                cat instanceof CategoryModel ? cat.toJSON() : cat
            )
        };
    }

    public static fromJSON(json: any): ProductModel {
        return new ProductModel({
            ...json,
            category: (json.category ?? []).map((cat: any) =>
                cat instanceof CategoryModel ? cat : new CategoryModel(cat)
            )
        });
    }
}