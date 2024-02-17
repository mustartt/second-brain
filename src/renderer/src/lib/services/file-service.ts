import {
    collection,
    doc,
    query,
    Timestamp,
    where,
    writeBatch,
    orderBy,
    getDocs,
    limit,
    startAfter,
    runTransaction,
    type QuerySnapshot,
    type DocumentReference,
    getDoc,
} from "firebase/firestore";
import {firebaseAuth, firestore} from "$lib/services/firebase-service";
import {v4 as uuidv4} from 'uuid';

type Collection = DocumentsCollection;

interface DocumentsCollection {
    type: 'document';
    owner: UserId;
    name: string;

    root: PageId; // references the root page of the fs
}

type CollectionId = string;
type PageId = string;
type UserId = string;
type FileId = string;


interface DirectoryPage {
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

interface FileEntry {
    id: FileId;
    parent: PageId;
    owner: UserId;

    type: 'file';
    name: string;       // max 256 char
    revision: number;   // monotonic revision id
    hash: string;

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
    private readonly pageSize: number;
    private readonly orderByKey: OrderByKey;
    private readonly orderByOrder: OrderByOrder;

    constructor(snapshot: QuerySnapshot, uid: string, pageSize: number,
                orderByKey: OrderByKey, orderByOrder: OrderByOrder) {
        this.currentSnapshot = snapshot;
        this.uid = uid;
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
            orderBy('type', 'asc'),
            orderBy(this.orderByKey, this.orderByOrder),
            limit(this.pageSize),
            startAfter(lastVisible)
        );
        this.currentSnapshot = await getDocs(nextQuery);
        return true;
    }
}

class PathCursor {
    private currentCollection: Collection;
    private currentPage: DirectoryPage;
    private currentPath: string;
    private readonly uid: string;

    constructor(col: Collection, page: DirectoryPage, path: string) {
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

    async getDirectoryIterator(pageSize: number = 100,
                               orderKey: OrderByKey = 'name',
                               order: OrderByOrder = 'asc') {
        const startQuery = query(
            collection(firestore, 'filesystem'),
            where('owner', '==', this.uid),
            orderBy('type', 'asc'),
            orderBy(orderKey, order),
            limit(pageSize)
        );
        return new DirectoryPageIterator(
            await getDocs(startQuery),
            this.uid, pageSize, orderKey, order,
        );
    }
}

const validNameRegex = /^[\w\-. ]{1,255}$/;


export async function createNewCollection(name: string) {
    const rootPageId = uuidv4();
    const collectionId = uuidv4();
    const uid = firebaseAuth.currentUser?.uid;
    if (!uid) {
        throw new Error('Missing UID');
    }
    if (!validNameRegex.test(name)) {
        throw new Error('Invalid collection name');
    }
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
        parent: "null",
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

type DirectoryPath = string[];

async function getDirectoryEntry(uid: string, parent: PageId, name: string) {
    const docQuery = query(
        collection(firestore, 'filesystem'),
        where('owner', '==', uid),
        where('parent', '==', parent),
        where('name', '==', name)
    );
    const result = await getDocs(docQuery);
    return result.docs;
}

async function resolveDirectoryPathToRefs(uid: string, collectionId: string, path: DirectoryPath) {
    const targetCollection = await getDoc(doc(collection(firestore, 'datasource'), collectionId));
    if (!targetCollection.exists()) {
        throw new Error('Collection does not exist ' + collectionId);
    }
    const targetCollectionData = targetCollection.data() as Collection;
    let currPageId = targetCollectionData.root;

    let visitedRef: DocumentReference[] = [doc(collection(firestore, 'filesystem'), currPageId)];

    for (const dir of path) {
        const result = await getDirectoryEntry(uid, currPageId, dir);
        if (result.length === 0) {
            throw new Error('Directory does not exists');
        }
        if (result.length > 1) {
            throw new Error('Violated invariance duplicate file entry');
        }
        const resultData = result[0].data() as DirectoryPage | FileEntry;
        if (resultData.type !== 'dir') {
            throw new Error('Expected directory on path');
        }
        visitedRef.push(result[0].ref);
        currPageId = resultData.id;
    }

    return visitedRef;
}

export async function createNewDirectory(uid: string, collectionId: string, path: string) {
    const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    const normalizedPathEnd = normalizedPath.endsWith('/') ? normalizedPath.slice(0, -1) : normalizedPath;
    const dirs = normalizedPathEnd.split('/');

    const invalidDirs = dirs.filter(name => !validNameRegex.test(name));
    if (dirs.length === 0 || invalidDirs.length > 0) {
        throw new Error('Invalid path: ' + path);
    }

    const newDirUUID = uuidv4();
    const newDirName = dirs[dirs.length - 1];
    const parentPaths = dirs.slice(0, -1);
    const ancestors = await resolveDirectoryPathToRefs(uid, collectionId, parentPaths);

    await runTransaction(firestore, async (transaction) => {
        // read phase
        const lastRef = ancestors[ancestors.length - 1];
        const testNewDirQuery = await getDirectoryEntry(uid, lastRef.id, newDirName);
        if (testNewDirQuery.length !== 0) {
            throw new Error('Directory or file already exists ' + newDirName);
        }
        const needUpdates = await Promise.all(ancestors.map(
            docSnapshot => transaction.get(docSnapshot)
        ));

        // write phase
        const newDirRef = doc(collection(firestore, 'filesystem'), newDirUUID);
        const newDirObject: DirectoryPage = {
            id: newDirUUID,
            type: 'dir',
            name: newDirName,
            owner: uid,
            parent: lastRef.id,
            revision: 0,
            metadata: {
                dirCount: 0, fileCount: 0, size: 0,
                timeCreated: Timestamp.now(),
                timeUpdated: Timestamp.now()
            },
        };
        transaction.set(newDirRef, newDirObject);
        for (const dir of needUpdates) {
            const oldRevision = (dir.data() as DirectoryPage).revision;
            transaction.update(dir.ref, {revision: oldRevision + 1});
        }
        const oldMetadata = (needUpdates[needUpdates.length - 1].data() as DirectoryPage).metadata;
        transaction.update(lastRef, {
            metadata: Object.assign(oldMetadata, {
                dirCount: oldMetadata.dirCount + 1,
                timeUpdated: Timestamp.now()
            })
        });
    });
}
