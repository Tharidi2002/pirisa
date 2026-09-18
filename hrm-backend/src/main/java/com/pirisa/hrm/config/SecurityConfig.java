package com.pirisa.hrm.config;

import com.pirisa.hrm.service.JwtAuthenticationEntryPoint;
import com.pirisa.hrm.service.JwtRequestFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174,http://192.168.8.116:5173,http://192.168.8.116:5174,http://localhost:3000}")
    private String allowedOrigins;

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        List<String> origins = List.of(allowedOrigins.split(","));
        origins = origins.stream().map(String::trim).toList();
        config.setAllowedOrigins(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "Accept"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setMaxAge(3600L);
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.cors().and().csrf().disable()
                .headers(headers -> headers
                        .httpStrictTransportSecurity(hsts -> hsts
                                .includeSubDomains(true)
                                .preload(true)
                                .maxAgeInSeconds(31536000))
                        .frameOptions(frame -> frame.deny())
                        .contentTypeOptions(contentTypeOptions -> {})
                        .referrerPolicy(referrer -> referrer.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER))
                        .permissionsPolicy(policy -> policy.policy("geolocation=(), camera=(), microphone=(), payment=()")))
                .authorizeRequests()
                .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .antMatchers(
                        "/login",
                        "/api/login",
                        "/api/company/register",
                        "/api/company/check-username/**",
                        "/api/company/check-email/**",
                        "/company/forgetPassword",
                        "/success",
                        "/cancel",
                        "/api/webhook/stripe",
                        "/password/forgotPassword",
                        "/actuator/health",
                        "/ws/**",
                        "/calendar/**",
                        "/company/all",
                        "/add/unit",
                        "/department/**",
                        "/company_leave/**",
                        "/companyOT/**"
                ).permitAll()
                // Public job application
                .antMatchers(HttpMethod.POST, "/api/recruitment/applicants/apply").permitAll()
                // Self-service
                .antMatchers("/api/self-service/**")
                    .hasAnyAuthority("EMPLOYEE", "CMPNY", "HRM")
                .antMatchers("/api/admin/missing-punch/**")
                    .hasAnyAuthority("CMPNY", "HRM")
                // Recruitment
                .antMatchers("/api/recruitment/**")
                    .hasAnyAuthority("CMPNY", "HRM")
                // ============================================
                // EMPLOYEE MANAGEMENT - FIX (was only HRM)
                // ============================================
                .antMatchers("/employee/**")
                    .hasAnyAuthority("CMPNY", "HRM", "EMPLOYEE")
                .antMatchers("/payrole/**")
                    .hasAnyAuthority("CMPNY", "HRM")
                .antMatchers("/allowance/**")
                    .hasAnyAuthority("CMPNY", "HRM")
                .antMatchers("/bonus/**")
                    .hasAnyAuthority("CMPNY", "HRM")
                .antMatchers("/designation/**")
                    .hasAnyAuthority("CMPNY", "HRM")
                .antMatchers("/leave_balance/**")
                    .hasAnyAuthority("CMPNY", "HRM", "EMPLOYEE")
                .antMatchers("/emp_leave/**")
                    .hasAnyAuthority("CMPNY", "HRM", "EMPLOYEE")
                .antMatchers("/api/attendance/**")
                    .hasAnyAuthority("CMPNY", "HRM")
                .antMatchers("/user/all").hasAnyAuthority("USER")
                .anyRequest().authenticated()
                .and()
                .exceptionHandling().authenticationEntryPoint(jwtAuthenticationEntryPoint)
                .and()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);

        httpSecurity.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return httpSecurity.build();
    }
}