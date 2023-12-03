const express = require("express");
const fetchUSer = require("../middleware/fetchUser");
const router = express.Router();
const Notes = require("../models/Notes");

// ROUTE 1: Creating a note using:POST on '/api/notes/createNote' ; Require authentication

router.post("/createNote", fetchUSer, async (req, res) => {
  try {
    let userId = req.user.id;
    const { title, description, tag } = req.body;
    const note = new Notes({ title, description, userId, tag });
    await note.save();
    res.send({ msg: "New note added", note });
  } catch (error) {
    res.status(500).send({ error });
  }
});

// ROUTE 2: Get all notes using:GET on '/api/notes/allNotes' ; Require authentication

router.get("/allNotes", fetchUSer, async (req, res) => {
  try {
    let userId = req.user.id;
    const allNotes = await Notes.find({ userId });
    res.send({allNotes});
  } catch (error) {
    res.status(404).send({ error: "No notes found for this user" });
  }
});

// ROUTE 3: Updating one note using:POST on '/api/notes/editNote' ; Require authentication

router.put("/editNote/:id", fetchUSer, async (req, res) => {
  try {
    const { title, description, tag } = req.body;

    // creating an object for the edited note
    let newNote = {};
    if (title) newNote.title = title;
    if (description) newNote.description = description;
    if (tag) newNote.tag = tag;

    const id = req.params.id;
    let note = await Notes.findById(id);
    if (!note) res.status(404).json({ error: "No notes found" });
    else {
      if (note.userId.toString() !== req.user.id)
        res.status(401).json({ error: "Access Denied" });
      note = await Notes.findByIdAndUpdate(
        id,
        { $set: newNote },
        { new: true }
      );
      res.send({ msg: "Note is updated", note });
    }
  } catch (error) {
    res.status(500).send({ error: "Internal Server error" });
  }
});

// ROUTE 4: Deleting one note using:POST on '/api/notes/deleteNote' ; Require authentication

router.delete("/deleteNote/:id", fetchUSer, async (req, res) => {
  try {
    const id = req.params.id;
    let note = await Notes.findById(id);
    if (!note) res.status(404).json({ error: "No notes found with this id" });
    else {
      if (note.userId.toString() !== req.user.id){
        res.status(401).json({ error: "Access Denied" });
      }
      note = await Notes.findByIdAndDelete(id);
      res.send({ msg: "One note is deleted", note });
    }
  } catch (error) {
    res.status(500).send({ error });
  }
});

module.exports = router;
