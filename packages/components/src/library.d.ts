export interface ComponentDefinition {
    id: string;
    name: string;
    category: string;
    component: any;
    tags: string[];
}
export declare class ComponentLibrary {
    private components;
    constructor();
    private registerDefaults;
    register(definition: ComponentDefinition): void;
    unregister(id: string): boolean;
    get(id: string): ComponentDefinition | undefined;
    getByName(name: string): ComponentDefinition | undefined;
    list(): ComponentDefinition[];
    getByCategory(category: string): ComponentDefinition[];
    search(query: string): ComponentDefinition[];
    getCategories(): string[];
}
export default ComponentLibrary;
//# sourceMappingURL=library.d.ts.map