package com.firstSpringBoot.springweb;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "index";
    }

    @GetMapping("/dashboard")
    public String dashboard() {
        return "dashboard";
    }

    @GetMapping("/timetable")
    public String timetable() {
        return "timetable";
    }

    @GetMapping("/notes")
    public String notes() {
        return "notes";
    }

    @GetMapping("/ai-assistant")
    public String aiAssistant() {
        return "ai-assistant";
    }

}
