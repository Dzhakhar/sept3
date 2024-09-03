export type Actor = {
  id: number;
  n: string;
  c: string[];
};

export type SortBy = "n" | "c";
export type SortOrder = "asc" | "desc";

const initialData: Actor[] = [
  {
    id: 1,
    n: "Alan Wake",
    c: ["TPS", "Adventure", "Horror"],
  },
  {
    id: 2,
    n: "Jason Bourne",
    c: ["Movie", "Thriller", "Spy"],
  },
  {
    id: 3,
    n: "Bruce Wayne",
    c: ["Batman", "Philanthropist", "Orphan"],
  },
];

const request: IDBOpenDBRequest = indexedDB.open("local", 1);

request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
  const db = (event.target as IDBOpenDBRequest).result;

  if (!db.objectStoreNames.contains("actorsStore")) {
    const objectStore = db.createObjectStore("actorsStore", { keyPath: "id" });
    objectStore.createIndex("nameIndex", "n", { unique: false });
    objectStore.createIndex("categoriesIndex", "c", { unique: false });

    initialData.forEach((actor) => {
      objectStore.add(actor);
    });

    console.log("Initial data inserted during onupgradeneeded.");
  }
};

request.onsuccess = (event: Event) => {
  console.log("Database opened successfully.");
};

request.onerror = (event: Event) => {
  console.error("Database error:", (event.target as IDBOpenDBRequest).error);
};

export function getAllRecordsSorted({
  sortBy,
  order,
}: {
  sortBy?: SortBy;
  order?: SortOrder;
}): Promise<Actor[]> {
  const request = indexedDB.open("local", 1);

  request.onerror = (event: Event) => {
    console.error("Database error:", (event.target as IDBOpenDBRequest).error);
  };

  return new Promise((resolve) => {
    request.onsuccess = (event: Event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction("actorsStore", "readonly");
      const objectStore = transaction.objectStore("actorsStore");

      const records: Actor[] = [];
      const cursorRequest = objectStore.openCursor();

      cursorRequest.onsuccess = (event: Event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          records.push(cursor.value);
          cursor.continue();
        } else {
          records.sort((a, b) => {
            if (sortBy === "c") {
              const aCategories = a.c.join(", ");
              const bCategories = b.c.join(", ");
              return order === "asc"
                ? aCategories.localeCompare(bCategories)
                : bCategories.localeCompare(aCategories);
            } else {
              // sorting by n (name) by dfault.
              return order === "asc"
                ? a.n.localeCompare(b.n)
                : b.n.localeCompare(a.n);
            }
          });

          resolve(records);
        }
      };

      cursorRequest.onerror = () => {
        console.error("Error fetching records:", cursorRequest.error);
      };
    };
  });
}

export function updateActor(newActor: Actor): Promise<void> {
  const request = indexedDB.open("local", 1);

  request.onerror = (event: Event) => {
    console.error("Database error:", (event.target as IDBOpenDBRequest).error);
  };

  return new Promise((resolve) => {
    request.onsuccess = (event: Event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction("actorsStore", "readwrite");
      const objectStore = transaction.objectStore("actorsStore");

      const getRequest = objectStore.get(newActor.id);

      getRequest.onsuccess = () => {
        const actor = getRequest.result;
        actor.n = newActor.n;
        actor.c = newActor.c;

        const updateRequest = objectStore.put(actor);
        updateRequest.onsuccess = () => {
          console.log(`Actor updated successfully for id ${newActor.id}`);
        };
        updateRequest.onerror = () => {
          console.error("Error updating actor:", updateRequest.error);
        };

        resolve();
      };

      getRequest.onerror = () => {
        console.error("Error fetching record:", getRequest.error);
      };
    };
  });
}

export function deleteActor(actorId: number): Promise<void> {
  const request = indexedDB.open("local", 1);

  request.onerror = (event: Event) => {
    console.error("Database error:", (event.target as IDBOpenDBRequest).error);
  };

  return new Promise((resolve) => {
    request.onsuccess = (event: Event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction("actorsStore", "readwrite");
      const objectStore = transaction.objectStore("actorsStore");

      const deleteRequest = objectStore.delete(actorId);

      deleteRequest.onsuccess = () => {
        console.log(`Actor deleted successfully for id ${actorId}`);
        resolve();
      };

      deleteRequest.onerror = () => {
        console.error("Error deleting actor:", deleteRequest.error);
      };
    };
  });
}
