package com.knoweb.HRM.config;

import com.knoweb.HRM.service.JwtAuthenticationEntryPoint;
import com.knoweb.HRM.service.JwtRequestFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

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
        config.addAllowedOriginPattern("*"); // Allow all origins
        config.addAllowedMethod("*");
        config.addAllowedHeader("*");
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.cors().and().csrf().disable()
                .authorizeRequests()
                .antMatchers(
                        "/login",
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
                        "/department/**"
                ).permitAll()
                .antMatchers("/user/all").hasAnyAuthority("USER")
                .antMatchers("/employee/all").hasAnyAuthority("HRM")
                .antMatchers("/employee/emp/**", "/employee/payroleListEmp/**", "/employee/EmpDetailsListByEmp/**", "/emp_leave/add_leave", "/document/view/**", "/company_leave/company/**", "/employee/changePassword/**", "/document/update/**", "/employee/EmpDetailsList/**", "/logo/view/**", "/document/upload-all").hasAnyAuthority("EMPLOYEE", "CMPNY")
                .anyRequest().authenticated()
                .and()
                .exceptionHandling().authenticationEntryPoint(jwtAuthenticationEntryPoint)
                .and()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);
        httpSecurity.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return httpSecurity.build();
    }
}
