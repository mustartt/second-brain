import {
    Timestamp,
    QuerySnapshot,
    doc,
    query,
    getDocs,
    getDoc,
    where,
    collection,
    orderBy,
    limit,
    startAfter,
} from "firebase/firestore";
import {firebaseAuth, firestore} from "./firebase-service";
import type {DataSource, DirectoryEntry, FileEntry, FolderId} from "./types";

type OrderByKey =
    "name"
    | "metadata.timeUpdated"
    | "metadata.timeCreated"
    | "metadata.size";
type OrderByOrder = "asc" | "desc";

class DirectoryPageIterator {
    private currentSnapshot: QuerySnapshot;

    private readonly uid: string;
    private readonly parent: FolderId;
    private readonly pageSize: number;
    private readonly orderByKey: OrderByKey;
    private readonly orderByOrder: OrderByOrder;

    constructor(snapshot: QuerySnapshot, uid: string, parent: FolderId, pageSize: number,
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
            doc => doc.data() as FileEntry | DirectoryEntry,
        );
    }

    getCurrentQuery() {
        return this.currentSnapshot.query;
    }

    async nextPage() {
        if (this.currentSnapshot.empty) {
            return false;
        }
        const lastVisible = this.currentSnapshot.docs[this.currentSnapshot.size - 1];
        const nextQuery = query(
            collection(firestore, "filesystem"),
            where("owner", "==", this.uid),
            where("parent", "==", this.parent),
            orderBy("type", "asc"),
            orderBy(this.orderByKey, this.orderByOrder),
            limit(this.pageSize),
            startAfter(lastVisible),
        );
        this.currentSnapshot = await getDocs(nextQuery);
        return true;
    }
}

export class PathCursor {
    private readonly currentCollection: DataSource;
    private readonly uid: string;

    private currentPage: DirectoryEntry;

    constructor(col: DataSource, page: DirectoryEntry) {
        this.currentCollection = col;
        this.currentPage = page;
        this.uid = col.owner;
    }

    getCurrentPageDetails() {
        return this.currentPage;
    }

    getCurrentCollection() {
        return this.currentCollection;
    }

    async getDirectoryIterator(pageSize: number = 25,
        orderKey: OrderByKey = "name",
        order: OrderByOrder = "asc") {
        const startQuery = query(
            collection(firestore, "filesystem"),
            where("owner", "==", this.uid),
            where("parent", "==", this.currentPage.id),
            orderBy("type", "asc"),
            orderBy(orderKey, order),
            limit(pageSize),
        );
        return new DirectoryPageIterator(
            await getDocs(startQuery),
            this.uid, this.currentPage.id, pageSize, orderKey, order,
        );
    }

    async push(folderId: FolderId) {
        await this.getFolder(folderId);
    }

    async pop() {
        if (this.currentPage.name === "$root") {
            throw new Error("Cannot pop root");
        }
        await this.getFolder(this.currentPage.parent);
    }

    private async getFolder(folderId: FolderId) {
        const newFolderRef = doc(collection(firestore, "filesystem"), folderId);
        const newFolder = await getDoc(newFolderRef);
        if (!newFolder.exists()) {
            throw new Error("folder does not exists");
        }
        this.currentPage = newFolder.data() as DirectoryEntry;
    }
}


export async function getAllCollections() {
    const uid = firebaseAuth.currentUser?.uid;
    if (!uid) {
        throw new Error("Missing UID");
    }

    const cols = await getDocs(query(
        collection(firestore, "datasource"),
        where("owner", "==", uid),
    ));
    return cols.docs.map(col => col.data() as DataSource);
}

export async function getCollectionCursor(dataSource: DataSource) {
    const pageRef = doc(collection(firestore, "filesystem"), dataSource.root);
    const pageResult = await getDoc(pageRef);
    if (!pageResult.exists()) {
        throw new Error("Collection or root page does not exists");
    }
    const pageData = pageResult.data() as DirectoryEntry;
    return new PathCursor(dataSource, pageData);
}
