package com.firstSpringBoot.springweb;

import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteRepository noteRepository;

    public NoteController(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }


    // 1. Show All Notes (only the logged-in student's own)
    @GetMapping("/all")
    public List<Note> getAllNotes(HttpSession session) {

        Object userId = session.getAttribute("userId");
        if (userId == null) {
            return List.of();
        }

        return noteRepository.findByUserId((Long) userId);
    }


    // 2. Show One Note
    @GetMapping("/get/{id}")
    public Note getNote(@PathVariable Long id) {

        return noteRepository.findById(id).orElse(null);
    }


    // 3. Add Note
    @PostMapping("/create")
    public Note addNote(@RequestBody Note note, HttpSession session) {

        note.setCreatedDate(LocalDate.now());

        Object userId = session.getAttribute("userId");
        if (userId != null) {
            note.setUserId((Long) userId);
        }

        return noteRepository.save(note);
    }


    // 4. Update Note
    @PutMapping("/update/{id}")
    public Note updateNote(
            @PathVariable Long id,
            @RequestBody Note updatedNote) {

        Note existing = noteRepository.findById(id).orElse(null);

        if (existing == null) {
            return null;
        }

        existing.setTitle(updatedNote.getTitle());
        existing.setSubject(updatedNote.getSubject());
        existing.setContent(updatedNote.getContent());

        return noteRepository.save(existing);
    }


    // 5. Delete Note
    @DeleteMapping("/delete/{id}")
    public String deleteNote(@PathVariable Long id) {

        if (noteRepository.existsById(id)) {
            noteRepository.deleteById(id);
            return "Note Deleted Successfully";
        }

        return "Note Not Found";
    }


    // 6. Search Notes By Title
    @GetMapping("/search/{title}")
    public List<Note> searchNotesByTitle(@PathVariable String title) {

        return noteRepository.findByTitleContainingIgnoreCase(title);
    }
}