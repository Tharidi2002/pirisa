package com.knoweb.HRM.config;

import com.knoweb.HRM.service.JwtAuthenticationEntryPoint;
import com.knoweb.HRM.service.JwtRequestFilter;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Autowired
    private UserDetailsService jwtUserDetailsService;

    @Autowired
    public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(jwtUserDetailsService).passwordEncoder(passwordEncoder());
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }

    @Override
    @Bean
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("*"); // In production, you should restrict this to your frontend's domain
        config.addAllowedMethod("*");
        config.addAllowedHeader("*");
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    @Override
    protected void configure(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.csrf().disable()
                .authorizeRequests()
                // --- PUBLIC ENDPOINTS ---
                .antMatchers("/login").permitAll()
                .antMatchers("/api/company/register").permitAll()
                .antMatchers("/api/company/check-username/**").permitAll()
                .antMatchers("/api/company/check-email/**").permitAll()
                .antMatchers("/password/forgotPassword").permitAll()
                // Stripe webhooks and payment redirection
                .antMatchers("/success", "/cancel", "/api/webhook/stripe").permitAll()

                // --- COMPANY ADMIN (CMPNY) SPECIFIC ENDPOINTS ---
                // Company profile, settings, and management
                .antMatchers("/company/**", "/department/**", "/designation/**", "/allowance/**", "/bonus/**").hasAuthority("CMPNY")
                // Employee management
                .antMatchers("/employee/add", "/employee/all", "/employee/update/**", "/employee/delete/**").hasAuthority("CMPNY")
                 // Payroll and leave management for the whole company
                .antMatchers("/payrole/**", "/emp_leave/all", "/emp_leave/updateStatus/**").hasAuthority("CMPNY")
                .antMatchers("/attendance/all", "/attendance/company/**").hasAuthority("CMPNY")


                // --- EMPLOYEE SPECIFIC ENDPOINTS ---
                // Employee can view their own details
                .antMatchers(HttpMethod.GET, "/employee/emp/**").hasAnyAuthority("EMPLOYEE", "CMPNY")
                .antMatchers(HttpMethod.GET, "/employee/payroleListEmp/**").hasAnyAuthority("EMPLOYEE", "CMPNY")
                .antMatchers(HttpMethod.GET, "/employee/EmpDetailsListByEmp/**").hasAnyAuthority("EMPLOYEE", "CMPNY")
                .antMatchers(HttpMethod.GET, "/document/view/**").hasAnyAuthority("EMPLOYEE", "CMPNY")
                // Employee can request leave and change their password
                .antMatchers("/emp_leave/add_leave").hasAuthority("EMPLOYEE")
                .antMatchers("/employee/changePassword/**").hasAuthority("EMPLOYEE")
                .antMatchers("/document/update/**").hasAuthority("EMPLOYEE")


                // --- OTHER AUTHENTICATED ---
                .antMatchers("/user/all").hasAnyAuthority("USER") // Example, might need adjustment

                // --- DEFAULT RULE: Any other request must be authenticated ---
                .anyRequest().authenticated()

                .and()
                .exceptionHandling().authenticationEntryPoint(jwtAuthenticationEntryPoint)
                .and()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);

        httpSecurity.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
        // Note: The CorsFilter is often added earlier in the filter chain. 
        // Adding it before UsernamePasswordAuthenticationFilter is also a common practice.
        // For Spring Security, it's generally best to configure CORS at the top level as done with .cors()
    }
}
