const Y = require("yjs");
const debounce = require("lodash.debounce");
const db = require("../db");

const docs = {};

function handleSocket(socket, io) {
    socket.on("join-doc", async ({ docId, userId }) => {
        socket.join(docId);
        console.log(`User ${userId} joined doc ${docId}`);

        //* Loading Yjs Doc
        if (!docs[docId]) {
            const result = await db.query(
                "SELECT content FROM doucments WHERE id = $1",
                [docId]
            );
            const ydoc = new Y.Doc();
            Y.applyUpdate(ydoc, result.rows[0].content);
            docs[docId] = ydoc;
        }
        //* send Initial Doc
        socket.emit("doc-init", Y.encodeStateAsUpdate(docs[docId]));
        //* For Receiving Updates
        socket.on("doc-update", (update) => {
            Y.applyUpdate(docs[docId], update);
            socket.to(docId).emit("doc-update", update);
        });
        //* Save on Disconnect
        socket.on(
            "disconnect",
            debounce(async () => {
                if (docs[docId]) {
                    const content = Y.encodeStateAsUpdate(docs[docId]);
                    await db.query(
                        "UPDATE documents SET content = $1, updated_at = NOW() WHERE if = $2",
                        [content, docId]
                    ),
                        console.log(`Saved document ${docId}`);
                }
            }, 1000)
        );
    });
}

module.exports = handleSocket;
