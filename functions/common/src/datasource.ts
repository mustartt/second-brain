import {z} from "zod";
import {DataSourceId, UserId, FolderId, FileId, validNameRegex} from "./common";

interface DocumentsDataSource {
    id: DataSourceId;
    type: "document";
    owner: UserId;
    name: string;

    root: FolderId; // references the root page of the fs
}

export type DataSource = DocumentsDataSource;

export const CreateDataSourceRequestSchema = z.object({
    id: z.string().uuid("Invalid UUID"),
    type: z.union([
        z.literal("document"),
        z.literal("google_drive"),
    ]),
    name: z.string()
        .regex(validNameRegex, "Invalid name")
        .min(5, "Name requires minimum of 5 characters")
        .max(256, "Name cannot exceed 256 characters"),
});
export type CreateDataSourceRequest = z.infer<typeof CreateDataSourceRequestSchema>;

export const RenameDataSourceRequestSchema = z.object({
    id: z.string().uuid("Invalid UUID"),
    newName: z.string()
        .regex(validNameRegex, "Invalid name")
        .min(5, "Name requires minimum of 5 characters")
        .max(256, "Name cannot exceed 256 characters"),
});
export type RenameDataSourceRequest = z.infer<typeof RenameDataSourceRequestSchema>;

export const DeleteDataSourceRequestSchema = z.object({
    id: z.string().uuid("Invalid UUID"),
});
export type DeleteDataSourceRequest = z.infer<typeof DeleteDataSourceRequestSchema>;

export type DataSourceResponse = DataSource;


