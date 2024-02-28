import {EventContext, storage} from "firebase-functions";
import * as logger from "firebase-functions/logger";
import {Storage} from "@google-cloud/storage";
import {createHash} from "node:crypto";
import {Readable} from "node:stream";
import {z} from "zod";
import {createFileHandler} from "./file-actions";
import {v4 as uuidv4} from "uuid";
import {CreateFileRequest} from "./common";

const DEFAULT_APP_BUCKET = "speedy-atom-413006.appspot.com";

const UploadMetadataSchema = z.object({
    user: z.string(),
    revision: z.string(),
    folderId: z.string().uuid("Expected UUID"),
    filename: z.string(),
    path: z.string(),
    contentType: z.string(),
});

type CustomUploadMetadata = z.infer<typeof UploadMetadataSchema>;

export const ingestFile = storage
    .bucket("speedy-atom-413006-upload")
    .object()
    .onFinalize(ingestFileHandler);

async function computeStreamHash(stream: Readable): Promise<string> {
    const hash = createHash("sha256");
    return new Promise((resolve, reject) => {
        stream
            .on("data", (data) => hash.update(data))
            .on("end", () => {
                resolve(hash.digest("hex"));
            })
            .on("error", (err) => {
                reject(err);
            });
    });
}

function extractObjectMetadata(metadata: unknown) {
    return UploadMetadataSchema.passthrough().parse(metadata);
}

async function ingestFileHandler(object: storage.ObjectMetadata, context: EventContext) {
    const gcs = new Storage();
    if (!object.name) {
        throw new Error("Object missing name " + object.id);
    }
    const sourceFile = gcs.bucket(object.bucket).file(object.name);

    const fileReadStream = sourceFile.createReadStream();
    const sha256 = await computeStreamHash(fileReadStream);

    const objectMetadata = extractObjectMetadata(object.metadata);
    const objectHandle = objectMetadata.user + "-" + sha256;

    const destFile = gcs.bucket(DEFAULT_APP_BUCKET).file(objectHandle);
    logger.info("Computed hash", sourceFile.id, sha256);

    const [exists] = await destFile.exists();
    if (!exists) {
        logger.info("Object does not exists, copying", destFile.id);
        await sourceFile.copy(destFile, {
            metadata: objectMetadata,
        });
        logger.info("Copied object to", destFile.id);
    } else {
        logger.info("Object already exists", destFile.id);
    }

    logger.info(destFile.publicUrl());

    // write to filesystem
    const newFileRequest: CreateFileRequest = {
        user: objectMetadata.user,
        status: "created",
        fileId: uuidv4(),
        parentId: objectMetadata.folderId,
        name: objectMetadata.filename,
        hash: sha256,
        handle: objectHandle,
        metadata: {
            contentType: objectMetadata.contentType,
            size: Number(object.size),
        },
    };
    logger.info(newFileRequest);
    await createFileHandler(newFileRequest);
}
