package com.sudoku.coop.config;

import com.sudoku.coop.auth.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;

import org.springframework.context.annotation.Configuration;

import org.springframework.security.config.Customizer;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;

import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.web.SecurityFilterChain;

import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.security.web.firewall.HttpFirewall;

import org.springframework.security.web.firewall.StrictHttpFirewall;

import org.springframework.web.cors.CorsConfiguration;

import org.springframework.web.cors.CorsConfigurationSource;

import org.springframework.web.cors.UrlBasedCorsConfigurationSource;



import java.util.Arrays;

import java.util.List;



@Configuration

@EnableWebSecurity

public class SecurityConfig {



    private final JwtAuthenticationFilter jwtFilter;



    public SecurityConfig(JwtAuthenticationFilter jwtFilter) {

        this.jwtFilter = jwtFilter;

    }



    @Bean

    public WebSecurityCustomizer webSecurityCustomizer() {

        return (web) -> web.httpFirewall(allowSpecialCharacters());

    }



    @Bean

    public HttpFirewall allowSpecialCharacters() {

        StrictHttpFirewall firewall = new StrictHttpFirewall();

        firewall.setAllowUrlEncodedSlash(true);

        firewall.setAllowBackSlash(true);

        firewall.setAllowUrlEncodedPercent(true);

        firewall.setAllowUrlEncodedPeriod(true);

        return firewall;

    }



    @Bean

    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http

            .cors(Customizer.withDefaults())

            .csrf(csrf -> csrf.disable())

            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests(auth -> auth

                .requestMatchers("/api/auth/**").permitAll()

                .requestMatchers("/ws-sudoku/**").permitAll()

                .anyRequest().authenticated()

            )

            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        

        return http.build();

    }



        @Bean



        public CorsConfigurationSource corsConfigurationSource() {



            CorsConfiguration configuration = new CorsConfiguration();



            



            // Autorise localhost pour le dev et une variable d'env pour la prod



            String prodOrigin = System.getenv("ALLOWED_ORIGIN");



            if (prodOrigin != null && !prodOrigin.isEmpty()) {



                configuration.setAllowedOrigins(List.of("http://localhost:4200", prodOrigin));



            } else {



                configuration.setAllowedOrigins(List.of("http://localhost:4200"));



            }



    



            configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));



    

        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"));

        configuration.setExposedHeaders(List.of("Authorization"));

        configuration.setAllowCredentials(true);

        configuration.setMaxAge(3600L);

        

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;

    }

}
