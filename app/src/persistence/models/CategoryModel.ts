export class CategoryModel{
    public id: number;
    public name: string;
    public description?: string;

    constructor(data: Partial<CategoryModel> = {}) {
        this.id = data.id || 0;
        this.name = data.name || '';
        this.description = data.description;
    }

    public toJSON(): string { return JSON.stringify(this); }

    public static fromJSON(json: any): CategoryModel {
        return new CategoryModel(json);
    }
}