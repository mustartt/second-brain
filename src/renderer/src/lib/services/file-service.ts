import {
    collection,
    doc,
    type DocumentReference,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    type QuerySnapshot,
    runTransaction,
    startAfter,
    Timestamp,
    where,
    writeBatch,
} from "firebase/firestore";
import {firebaseAuth, firestore} from "$lib/services/firebase-service";
import {v4 as uuidv4} from 'uuid';
import 'crypto';

export type DataSource = DocumentsCollection;

interface DocumentsCollection {
    type: 'document';
    owner: UserId;
    name: string;

    root: PageId; // references the root page of the fs
}

type DataSourceId = string;
type PageId = string;
type UserId = string;
type FileId = string;

function computeUniqueID(owner: string, parentID: string, name: string) {
    return window.api.crypto.sha256base64(`${owner}|${parentID}|${name}`);
}

// Primary Key: SHA256(owner, parentID, name)
export interface DirectoryPage {
    id: PageId;
    parent: PageId;
    owner: UserId;

    type: 'dir';
    name: string;       // max 256 char
    revision: number;   // monotonic revision id

    metadata: {
        fileCount: number;
        dirCount: number;
        size: number;
        timeCreated: Timestamp;
        timeUpdated: Timestamp;
    };
}

// Primary Key: SHA256(owner, parentID, name)
export interface FileEntry {
    id: FileId;
    parent: PageId;
    owner: UserId;

    type: 'file';
    name: string;       // max 256 char
    revision: number;   // monotonic revision id
    hash: string;       // md5 digest
    fileHandle: string; // actual file handle to the file service

    metadata: {
        contentType: string;
        size: number;
        timeCreated: Timestamp;
        timeUpdated: Timestamp;
    };
}

type OrderByKey = 'name' | 'metadata.timeUpdated' | 'metadata.timeCreated' | 'metadata.size';
type OrderByOrder = 'asc' | 'desc';

class DirectoryPageIterator {
    private currentSnapshot: QuerySnapshot;

    private readonly uid: string;
    private readonly parent: PageId;
    private readonly pageSize: number;
    private readonly orderByKey: OrderByKey;
    private readonly orderByOrder: OrderByOrder;


    constructor(snapshot: QuerySnapshot, uid: string, parent: PageId, pageSize: number,
                orderByKey: OrderByKey, orderByOrder: OrderByOrder) {
        this.currentSnapshot = snapshot;
        this.uid = uid;
        this.parent = parent;
        this.pageSize = pageSize;
        this.orderByKey = orderByKey;
        this.orderByOrder = orderByOrder;
    }

    getCurrentPage() {
        return this.currentSnapshot.docs.map(
            doc => doc.data() as FileEntry | DirectoryPage
        );
    }

    async nextPage() {
        if (this.currentSnapshot.empty) {
            return false;
        }
        const lastVisible = this.currentSnapshot.docs[this.currentSnapshot.size - 1];
        const nextQuery = query(
            collection(firestore, 'filesystem'),
            where('owner', '==', this.uid),
            where('parent', '==', this.parent),
            orderBy('type', 'asc'),
            orderBy(this.orderByKey, this.orderByOrder),
            limit(this.pageSize),
            startAfter(lastVisible)
        );
        this.currentSnapshot = await getDocs(nextQuery);
        return true;
    }
}

export class PathCursor {
    private readonly currentCollection: DataSource;
    private readonly uid: string;

    private currentPage: DirectoryPage;
    private currentPath: string;

    constructor(col: DataSource, page: DirectoryPage, path: string) {
        this.currentCollection = col;
        this.currentPage = page;
        this.currentPath = path;
        this.uid = col.owner;
    }

    getCurrentPath() {
        return this.currentPath;
    }

    getCurrentPageDetails() {
        return this.currentPage;
    }

    getCurrentCollection() {
        return this.currentCollection;
    }

    async getDirectoryIterator(pageSize: number = 25,
                               orderKey: OrderByKey = 'name',
                               order: OrderByOrder = 'asc') {
        const startQuery = query(
            collection(firestore, 'filesystem'),
            where('owner', '==', this.uid),
            where('parent', '==', this.currentPage.id),
            orderBy('type', 'asc'),
            orderBy(orderKey, order),
            limit(pageSize)
        );
        return new DirectoryPageIterator(
            await getDocs(startQuery),
            this.uid, this.currentPage.id, pageSize, orderKey, order,
        );
    }

    async push(name: string) {
        const page = await getDirectoryEntry(this.uid, this.currentPage.id, name);
        if (!page.exists()) {
            throw new Error('Directory does not exists ' + name);
        }
        const pageData = page.data() as DirectoryPage | FileEntry;
        if (pageData.type !== 'dir') {
            throw new Error('Cannot push file onto path ' + name);
        }

        const sep = this.currentPath === '/' ? '' : '/';
        this.currentPath += sep + name;
        this.currentPage = pageData;
    }

    async pop() {
        if (this.currentPath === '/') {
            return false;
        }

        const docRef = doc(collection(firestore, 'filesystem'), this.currentPage.parent);
        const docData = await getDoc(docRef);
        if (!docData.exists()) {
            throw new Error('Parent document does not exists');
        }
        this.currentPage = docData.data() as DirectoryPage;

        let parts = this.currentPath.split('/');
        parts.shift();
        parts.pop();
        this.currentPath = '/' + parts.join('/');
        return true;
    }
}

const validNameRegex = /^[\w\-. ]{1,255}$/;


export async function createNewCollection(name: string) {
    const collectionId = uuidv4();
    const uid = firebaseAuth.currentUser?.uid;
    if (!uid) {
        throw new Error('Missing UID');
    }
    if (!validNameRegex.test(name)) {
        throw new Error('Invalid collection name');
    }
    const rootPageId = computeUniqueID(uid, collectionId, '$root');
    const newCollection: DocumentsCollection = {
        name: name,
        owner: uid,
        root: rootPageId,
        type: "document"
    };
    const newRootPage: DirectoryPage = {
        id: rootPageId,
        type: 'dir',
        name: "$root",
        owner: uid,
        parent: collectionId,
        revision: 0,
        metadata: {
            dirCount: 0, fileCount: 0, size: 0,
            timeCreated: Timestamp.now(),
            timeUpdated: Timestamp.now()
        },
    };

    const docsRef = doc(collection(firestore, 'datasource'), collectionId);
    const pageRef = doc(collection(firestore, 'filesystem'), rootPageId);

    const batch = writeBatch(firestore);
    batch.set(pageRef, newRootPage);
    batch.set(docsRef, newCollection);

    await batch.commit();

    return new PathCursor(newCollection, newRootPage, '/');
}

export async function getAllCollections(uid: string) {
    const cols = await getDocs(query(
        collection(firestore, 'datasource'),
        where('owner', '==', uid),
    ));
    return cols.docs.map(col => col.data() as DataSource);
}

export async function getCollectionCursor(uid: string, collectionId: DataSourceId) {
    const rootPageId = computeUniqueID(uid, collectionId, '$root');
    const colRef = doc(collection(firestore, 'datasource'), collectionId);
    const pageRef = doc(collection(firestore, 'filesystem'), rootPageId);

    const [colResult, pageResult] = await Promise.all([
        await getDoc(colRef),
        await getDoc(pageRef)
    ]);

    if (!colResult.exists() || !pageResult.exists()) {
        throw new Error('Collection or root page does not exists');
    }

    return new PathCursor(colResult.data() as DataSource, pageResult.data() as DirectoryPage, '/');
}

type DirectoryPath = string[];

async function getDirectoryEntry(uid: string, parent: PageId, name: string) {
    const expectedID = computeUniqueID(uid, parent, name);
    const docRef = doc(
        collection(firestore, 'filesystem'),
        expectedID
    );
    return await getDoc(docRef);
}

async function resolveDirectoryPathToRefs(uid: string, collectionId: string, path: DirectoryPath) {
    const targetCollection = await getDoc(doc(collection(firestore, 'datasource'), collectionId));
    if (!targetCollection.exists()) {
        throw new Error('Collection does not exist ' + collectionId);
    }
    const targetCollectionData = targetCollection.data() as DataSource;
    let currPageId = targetCollectionData.root;

    let visitedRef: DocumentReference[] = [doc(collection(firestore, 'filesystem'), currPageId)];

    for (const dir of path) {
        const result = await getDirectoryEntry(uid, currPageId, dir);
        if (!result.exists()) {
            throw new Error('Directory does not exists');
        }
        const resultData = result.data() as DirectoryPage | FileEntry;
        if (resultData.type !== 'dir') {
            throw new Error('Expected directory on path');
        }
        visitedRef.push(result.ref);
        currPageId = resultData.id;
    }

    return visitedRef;
}

function normalizePath(path: string) {
    const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    const normalizedPathEnd = normalizedPath.endsWith('/') ? normalizedPath.slice(0, -1) : normalizedPath;
    return normalizedPathEnd.split('/');
}

export async function createNewDirectory(uid: string, collectionId: string, path: string) {
    const dirs = normalizePath(path);

    const invalidDirs = dirs.filter(name => !validNameRegex.test(name));
    if (dirs.length === 0 || invalidDirs.length > 0) {
        throw new Error('Invalid path: ' + path);
    }

    const newDirName = dirs[dirs.length - 1];
    const parentPaths = dirs.slice(0, -1);
    const ancestors = await resolveDirectoryPathToRefs(uid, collectionId, parentPaths);

    await runTransaction(firestore, async (transaction) => {
        // read phase
        const needUpdates = await Promise.all(ancestors.map(
            docSnapshot => transaction.get(docSnapshot)
        ));
        const directParent = needUpdates[needUpdates.length - 1];
        const parentID = (directParent.data() as DirectoryPage | FileEntry).id;

        const newDirID = computeUniqueID(uid, parentID, newDirName);
        const newDirRef = await transaction.get(
            doc(collection(firestore, 'filesystem'), newDirID)
        );
        if (newDirRef.exists()) {
            throw new Error('Directory or file already exists ' + newDirName);
        }

        // write phase
        const newDirObject: DirectoryPage = {
            id: newDirID,
            type: 'dir',
            name: newDirName,
            owner: uid,
            parent: directParent.id,
            revision: 0,
            metadata: {
                dirCount: 0, fileCount: 0, size: 0,
                timeCreated: Timestamp.now(),
                timeUpdated: Timestamp.now()
            },
        };
        transaction.set(newDirRef.ref, newDirObject);
        for (const dir of needUpdates) {
            const oldRevision = (dir.data() as DirectoryPage).revision;
            transaction.update(dir.ref, {revision: oldRevision + 1});
        }
        const oldMetadata = (directParent.data() as DirectoryPage).metadata;
        transaction.update(directParent.ref, {
            metadata: Object.assign(oldMetadata, {
                dirCount: oldMetadata.dirCount + 1,
                timeUpdated: Timestamp.now()
            })
        });
    });
}

export async function createNewFile(uid: string, collectionId: string, path: string) {
    const parentPaths = normalizePath(path);
    const invalidDirs = parentPaths.filter(name => !validNameRegex.test(name));
    if (parentPaths.length === 0 || invalidDirs.length > 0) {
        throw new Error('Invalid path: ' + path);
    }

    const fileName = parentPaths.pop()!;
    const ancestors = await resolveDirectoryPathToRefs(uid, collectionId, parentPaths);

    await runTransaction(firestore, async (transaction) => {
        // read phase
        const needUpdates = await Promise.all(ancestors.map(
            docSnapshot => transaction.get(docSnapshot)
        ));
        const directParent = needUpdates[needUpdates.length - 1];
        const parentID = (directParent.data() as DirectoryPage | FileEntry).id;

        const newFileId = computeUniqueID(uid, parentID, fileName);
        const newFileRef = await transaction.get(
            doc(collection(firestore, 'filesystem'), newFileId)
        );
        if (newFileRef.exists()) {
            throw new Error('Directory or file already exists ' + fileName);
        }

        // write phase
        const fileSize = 0;
        const newFileObject: FileEntry = {
            id: newFileId,
            parent: parentID,
            owner: uid,
            type: 'file',
            name: fileName,
            revision: 0,
            hash: '', // Generate or define the hash for the file content
            fileHandle: '',
            metadata: {
                contentType: '', // Define the content type of the file
                size: fileSize, // Specify the size of the file
                timeCreated: Timestamp.now(),
                timeUpdated: Timestamp.now(),
            },
        };
        transaction.set(newFileRef.ref, newFileObject);
        for (const dir of needUpdates) {
            const oldData = dir.data() as DirectoryPage;
            transaction.update(dir.ref, {
                    revision: oldData.revision + 1,
                    metadata: Object.assign(oldData.metadata, {
                        fileCount: oldData.metadata.fileCount + 1,
                        size: oldData.metadata.size + fileSize,
                    })
                }
            );
        }
        const oldMetadata = (directParent.data() as DirectoryPage).metadata;
        transaction.update(directParent.ref, {
            metadata: Object.assign(oldMetadata, {
                fileCount: oldMetadata.fileCount + 1,
                timeUpdated: Timestamp.now()
            })
        });
    });
}
