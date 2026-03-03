// firebase-to-supabase-adapter.js
// Adaptador para migrar de Firebase a Supabase

class FieldValue {
    static serverTimestamp() {
        return new Date().toISOString();
    }

    static increment(n) {
        return n;
    }

    static arrayUnion(...elements) {
        return elements;
    }

    static arrayRemove(...elements) {
        return elements;
    }
}

class FirestoreAdapter {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
        this._batchOps = [];
    }

    collection(collectionName) {
        return new CollectionReference(this.supabase, collectionName);
    }
    
    batch() {
        return {
            _ops: [],
            set: (docRef, data) => {
                this._ops.push({ type: 'upsert', docRef, data });
                return this;
            },
            update: (docRef, data) => {
                this._ops.push({ type: 'update', docRef, data });
                return this;
            },
            delete: (docRef) => {
                this._ops.push({ type: 'delete', docRef });
                return this;
            },
            commit: async () => {
                for (const op of this._ops) {
                    if (op.type === 'upsert') {
                        await op.docRef.set(op.data);
                    } else if (op.type === 'update') {
                        await op.docRef.update(op.data);
                    } else if (op.type === 'delete') {
                        await op.docRef.delete();
                    }
                }
                this._ops = [];
            }
        };
    }
}

class CollectionReference {
    constructor(supabase, collectionName) {
        this.supabase = supabase;
        this.collectionName = collectionName;
        this._query = {};
    }

    doc(docId) {
        return new DocumentReference(this.supabase, this.collectionName, docId);
    }

    where(field, operator, value) {
        this._query.where = { field, operator, value };
        return this;
    }

    orderBy(field, direction = 'asc') {
        this._query.order = { field, direction };
        return this;
    }

    limit(count) {
        this._query.limit = count;
        return this;
    }

    async get() {
        let query = this.supabase.from(this.collectionName).select('*');

        if (this._query.where) {
            const { field, operator, value } = this._query.where;
            if (operator === '==') {
                query = query.eq(field, value);
            } else if (operator === '>=') {
                query = query.gte(field, value);
            } else if (operator === '>') {
                query = query.gt(field, value);
            } else if (operator === '<=') {
                query = query.lte(field, value);
            }
        }

        if (this._query.order) {
            query = query.order(this._query.order.field, { 
                ascending: this._query.order.direction === 'asc' 
            });
        }

        if (this._query.limit) {
            query = query.limit(this._query.limit);
        }

        const { data, error } = await query;

        if (error) throw error;

        const docs = data.map(item => ({
            id: item.id,
            data: () => item,
            exists: true
        }));

        return {
            docs,
            forEach: (callback) => docs.forEach(callback),
            map: (callback) => docs.map(callback),
            empty: docs.length === 0,
            size: docs.length
        };
    }

    onSnapshot(callback, errorCallback) {
        const channel = this.supabase
            .channel(`${this.collectionName}-changes`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: this.collectionName },
                (payload) => {
                    callback({
                        docChanges: () => [
                            {
                                type: payload.eventType === 'INSERT' ? 'added' : 
                                      payload.eventType === 'UPDATE' ? 'modified' : 'removed',
                                doc: {
                                    id: payload.new?.id || payload.old?.id,
                                    data: () => payload.new || payload.old,
                                    exists: payload.eventType !== 'DELETE'
                                }
                            }
                        ]
                    });
                }
            )
            .subscribe();

        return () => this.supabase.removeChannel(channel);
    }

    async add(data) {
        const id = data.id || crypto.randomUUID();
        const { data: result, error } = await this.supabase
            .from(this.collectionName)
            .insert({ ...data, id })
            .select()
            .single();

        if (error) throw error;
        return { id: result.id, data: () => result, ref: { id: result.id } };
    }
}

class DocumentReference {
    constructor(supabase, collectionName, docId) {
        this.supabase = supabase;
        this.collectionName = collectionName;
        this.docId = docId;
    }

    async get() {
        const { data, error } = await this.supabase
            .from(this.collectionName)
            .select('*')
            .eq('id', this.docId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return { exists: false, data: () => null };
            }
            throw error;
        }

        return {
            exists: true,
            data: () => data,
            id: data.id,
            ref: this
        };
    }

    async set(data, options = {}) {
        const { data: result, error } = await this.supabase
            .from(this.collectionName)
            .upsert({ id: this.docId, ...data })
            .select()
            .single();

        if (error) throw error;
        return { id: result.id, data: () => result, ref: this };
    }

    async update(data) {
        const { data: result, error } = await this.supabase
            .from(this.collectionName)
            .update(data)
            .eq('id', this.docId)
            .select()
            .single();

        if (error) throw error;
        return { id: result.id, data: () => result, ref: this };
    }

    async delete() {
        const { error } = await this.supabase
            .from(this.collectionName)
            .delete()
            .eq('id', this.docId);

        if (error) throw error;
    }

    onSnapshot(callback) {
        const channel = this.supabase
            .channel(`${this.collectionName}-${this.docId}`)
            .on(
                'postgres_changes',
                { 
                    event: '*', 
                    schema: 'public', 
                    table: this.collectionName,
                    filter: `id=eq.${this.docId}`
                },
                (payload) => {
                    callback({
                        exists: payload.eventType !== 'DELETE',
                        data: () => payload.new || payload.old,
                        id: this.docId
                    });
                }
            )
            .subscribe();

        return () => this.supabase.removeChannel(channel);
    }
}

class AuthAdapter {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
        this._currentUser = null;
        this.listeners = [];
        
        this.supabase.auth.onAuthStateChange((event, session) => {
            this._currentUser = session?.user || null;
            this.listeners.forEach(cb => cb(this._currentUser));
        });
    }

    get currentUser() {
        return this._currentUser;
    }

    set currentUser(user) {
        this._currentUser = user;
    }

    async signInWithPopup(provider) {
        const { data, error } = await this.supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: window.location.origin
            }
        });

        if (error) throw error;
        return {
            user: data?.user
        };
    }

    async signOut() {
        const { error } = await this.supabase.auth.signOut();
        if (error) throw error;
    }

    async signInWithEmailAndPassword(email, password) {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        return { user: data.user };
    }

    onAuthStateChanged(callback) {
        this.listeners.push(callback);
        callback(this._currentUser);
    }
}

function createFirebaseAdapter(supabaseClient) {
    const db = new FirestoreAdapter(supabaseClient);
    const auth = new AuthAdapter(supabaseClient);
    
    return {
        FirestoreAdapter,
        FieldValue,
        collection: (name) => db.collection(name),
        db: db,
        auth: auth
    };
}

window.createFirebaseAdapter = createFirebaseAdapter;
window.FirestoreAdapter = FirestoreAdapter;
window.DocumentReference = DocumentReference;
window.FieldValue = FieldValue;
