export interface createCollectionPayload {
    name: string;
    description?: string
}

export interface EditCollectionPayload {
    name?: string;
    description?: string
}