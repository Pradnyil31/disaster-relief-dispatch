package com.disasterrelief.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/api/v1/sos/webhook/sms").permitAll()
                        .requestMatchers("/api/v1/donations/pledge").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/sos").hasRole("ADMINISTRATOR")
                        .requestMatchers(HttpMethod.POST, "/api/v1/sos").hasAnyRole("CITIZEN", "ADMINISTRATOR")
                        .requestMatchers("/api/v1/sos/my").hasRole("CITIZEN")
                        .requestMatchers("/api/v1/sos/{id}").hasAnyRole("ADMINISTRATOR", "CITIZEN")
                        .requestMatchers("/api/v1/sos/{id}/status").hasRole("ADMINISTRATOR")
                        .requestMatchers("/api/v1/inventory/**").hasRole("ADMINISTRATOR")
                        .requestMatchers(HttpMethod.POST, "/api/v1/dispatch").hasRole("ADMINISTRATOR")
                        .requestMatchers(HttpMethod.GET, "/api/v1/dispatch").hasRole("ADMINISTRATOR")
                        .requestMatchers("/api/v1/dispatch/my").hasRole("VOLUNTEER")
                        .requestMatchers("/api/v1/dispatch/{id}").hasAnyRole("ADMINISTRATOR", "VOLUNTEER")
                        .requestMatchers("/api/v1/dispatch/{id}/status").hasAnyRole("ADMINISTRATOR", "VOLUNTEER")
                        .requestMatchers(HttpMethod.GET, "/api/v1/donations").hasRole("ADMINISTRATOR")
                        .requestMatchers("/api/v1/donations/my").authenticated()
                        .requestMatchers("/api/v1/donations/{id}/approve").hasRole("ADMINISTRATOR")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}