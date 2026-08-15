package com.firstSpringBoot.springweb;

import jakarta.servlet.http.HttpSession;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final ChatClient chatClient;
    private final AssignmentRepository assignmentRepository;
    private final TimetableRepository timetableRepository;
    private final NoteRepository noteRepository;

    public AiController(
            ChatClient.Builder chatClientBuilder,
            AssignmentRepository assignmentRepository,
            TimetableRepository timetableRepository,
            NoteRepository noteRepository) {

        this.chatClient = chatClientBuilder.build();
        this.assignmentRepository = assignmentRepository;
        this.timetableRepository = timetableRepository;
        this.noteRepository = noteRepository;
    }


    // Receives the student's question, pulls in only that student's relevant
    // data (based on simple keyword matching — no RAG/embeddings), and asks
    // Grok to answer using that context.
    @PostMapping("/ask")
    public String ask(@RequestBody AiRequest request, HttpSession session) {

        Object userIdObj = session.getAttribute("userId");
        if (userIdObj == null) {
            return "Error: Please log in to use the AI Assistant.";
        }
        Long userId = (Long) userIdObj;

        String question = request.getQuestion();
        if (question == null || question.isBlank()) {
            return "Error: Please enter a question.";
        }

        String lowerQuestion = question.toLowerCase();
        StringBuilder context = new StringBuilder();

        // Simple keyword-based routing to decide which table(s) to check.
        // No RAG/embeddings — just plain SQL lookups scoped to this student.
        if (containsAny(lowerQuestion, "assignment", "assignments", "homework", "due", "pending")) {
            context.append(buildAssignmentContext(userId));
        }

        if (containsAny(lowerQuestion, "class", "classes", "timetable", "schedule", "period", "next class")) {
            context.append(buildTimetableContext(userId));
        }

        if (containsAny(lowerQuestion, "note", "notes")) {
            context.append(buildNoteContext(userId));
        }

        if (context.length() == 0) {
            // Question didn't match a known category — no database lookup needed.
            context.append("No specific student records were retrieved for this question.");
        }

        String prompt = "You are a helpful student assistant. Answer the student's question "
                + "using ONLY the information provided below. If the information doesn't fully "
                + "answer the question, say so honestly instead of making things up.\n\n"
                + "Student's question: " + question + "\n\n"
                + "Relevant student information:\n" + context;

        try {
            return chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();
        } catch (Exception e) {
            return "Error: Could not get a response from the AI Assistant. Please try again.";
        }
    }


    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }
        return false;
    }


    private String buildAssignmentContext(Long userId) {
        List<Assignment> assignments = assignmentRepository.findByUserId(userId);

        if (assignments.isEmpty()) {
            return "Assignments: No assignments found for this student.\n\n";
        }

        StringBuilder sb = new StringBuilder("Assignments:\n");
        for (Assignment a : assignments) {
            sb.append("- ").append(a.getTitle())
                    .append(" (Subject: ").append(a.getSubject())
                    .append(", Due: ").append(a.getDueDate())
                    .append(", Status: ").append(a.getStatus())
                    .append(")\n");
        }
        sb.append("\n");
        return sb.toString();
    }


    private String buildTimetableContext(Long userId) {
        List<Timetable> entries = timetableRepository.findByUserId(userId);

        if (entries.isEmpty()) {
            return "Timetable: No timetable entries found for this student.\n\n";
        }

        StringBuilder sb = new StringBuilder("Timetable:\n");
        for (Timetable t : entries) {
            sb.append("- ").append(t.getDayOfWeek())
                    .append(": ").append(t.getSubject())
                    .append(" with ").append(t.getTeacher())
                    .append(" (").append(t.getStartTime()).append(" - ").append(t.getEndTime())
                    .append(", Room ").append(t.getRoom())
                    .append(")\n");
        }
        sb.append("\n");
        return sb.toString();
    }


    private String buildNoteContext(Long userId) {
        List<Note> notes = noteRepository.findByUserId(userId);

        if (notes.isEmpty()) {
            return "Notes: No notes found for this student.\n\n";
        }

        StringBuilder sb = new StringBuilder("Notes:\n");
        for (Note n : notes) {
            sb.append("- ").append(n.getTitle())
                    .append(" (Subject: ").append(n.getSubject())
                    .append("): ").append(n.getContent())
                    .append("\n");
        }
        sb.append("\n");
        return sb.toString();
    }
}