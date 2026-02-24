package com.knoweb.HRM.config;

import com.knoweb.HRM.security.JwtAuthenticationEntryPoint;
import com.knoweb.HRM.security.JwtRequestFilter;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("*")); // Be more specific in production
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Corrected CORS configuration
                .authorizeHttpRequests(auth -> auth
                    // Permit all OPTIONS requests
                    .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    // --- PUBLIC ENDPOINTS ---
                    .antMatchers("/login").permitAll()
                    .antMatchers("/api/company/register").permitAll()
                    .antMatchers("/api/company/check-username/**").permitAll()
                    .antMatchers("/api/company/check-email/**").permitAll()
                    .antMatchers("/password/forgotPassword").permitAll()
                    .antMatchers("/success", "/cancel", "/api/webhook/stripe").permitAll()

                    // --- COMPANY ADMIN (CMPNY) SPECIFIC ENDPOINTS ---
                    .antMatchers("/company/**", "/department/**", "/designation/**", "/allowance/**", "/bonus/**").hasAuthority("CMPNY")
                    .antMatchers("/employee/add", "/employee/all", "/employee/update/**", "/employee/delete/**").hasAuthority("CMPNY")
                    .antMatchers("/payrole/**", "/emp_leave/all", "/emp_leave/updateStatus/**").hasAuthority("CMPNY")
                    .antMatchers("/attendance/all", "/attendance/company/**").hasAuthority("CMPNY")

                    // --- EMPLOYEE SPECIFIC ENDPOINTS ---
                    .antMatchers(HttpMethod.GET, "/employee/emp/**").hasAnyAuthority("EMPLOYEE", "CMPNY")
                    .antMatchers(HttpMethod.GET, "/employee/payroleListEmp/**").hasAnyAuthority("EMPLOYEE", "CMPNY")
                    .antMatchers(HttpMethod.GET, "/employee/EmpDetailsListByEmp/**").hasAnyAuthority("EMPLOYEE", "CMPNY")
                    .antMatchers(HttpMethod.GET, "/document/view/**").hasAnyAuthority("EMPLOYEE", "CMPNY")
                    .antMatchers("/emp_leave/add_leave").hasAuthority("EMPLOYEE")
                    .antMatchers("/employee/changePassword/**").hasAuthority("EMPLOYEE")
                    .antMatchers("/document/update/**").hasAuthority("EMPLOYEE")

                    // --- OTHER AUTHENTICATED ---
                    .antMatchers("/user/all").hasAuthority("USER") // Example

                    // --- DEFAULT RULE: Any other request must be authenticated ---
                    .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthenticationEntryPoint))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        httpSecurity.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return httpSecurity.build();
    }
}
