package com.sudoku.coop.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    // CORS is now handled in SecurityConfig.java for better integration with Spring Security filters
}