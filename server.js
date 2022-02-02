const express = require('express');
const path = require('path');
const fs = require('fs');
const notesData = require('./db/db.json');
const uuid = require('./helpers/uuid');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.static('public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/notes', (req, res) => res.sendFile(path.join(__dirname, 'public/notes.html')));

app.get('/api/notes', (req, res) => res.json(notesData));

const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );

const readAndAppend = (content, file) => {
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
        } else {
            const parsedData = JSON.parse(data);
            parsedData.push(content);
            writeToFile(file, parsedData);
        }
    });
};

const removeIdAndWriteFile = (deleteId, file) => {
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
        } else {
            const parsedData = JSON.parse(data);
            let newParsedData = [];
            for (let i=0; i<parsedData.length; i++) {
                if (parsedData[i].id !== deleteId) {
                    newParsedData.push(parsedData[i]);
                }
            }
            writeToFile(file, newParsedData);
        }
    });
};

app.post('/api/notes', (req, res) => {
    const {text, title} = req.body;

    if (req.body) {
        const newNote = {
            title,
            text,
            id: uuid()
        };

        readAndAppend(newNote, './db/db.json');

        const response = {
            status: 'success',
            body: newNote
        };

        res.status(200).send(response);
    } else {
        res.status(400).send({error: 'Error in adding note'});
    }
});

app.delete('/api/notes/:id', (req, res) => {
    const {id} = req.params;

    if (id) {
        removeIdAndWriteFile(id, './db/db.json');

        res.status(200).send(`Removed note id: ${id}`);
    } else {
        res.status(400).send({error: 'Error in deleting note'});
    }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
