package com.knoweb.HRM.service;

import com.knoweb.HRM.utility.JwtTokenUtil;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUserDetailsService jwtUserDetailsService;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getServletPath();
        List<String> pathsToSkip = Arrays.asList(
            "/login",
            "/api/company/register",
            "/company/forgetPassword",
            "/success",
            "/cancel",
            "/api/webhook/stripe",
            "/password/forgotPassword",
            "/actuator/health"
        );
        
        List<String> prefixesToSkip = Arrays.asList(
            "/api/company/check-username/",
            "/api/company/check-email/",
            "/ws/",
            "/calendar/"
        );

        boolean shouldNotFilter = pathsToSkip.stream().anyMatch(p -> path.equals(p)) ||
                                  prefixesToSkip.stream().anyMatch(p -> path.startsWith(p));

        return shouldNotFilter;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String requestTokenHeader = request.getHeader("Authorization");

        String username = null;
        String jwtToken = null;
        if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
            jwtToken = requestTokenHeader.substring(7);
            try {
                username = jwtTokenUtil.extractUsername(jwtToken);
            } catch (IllegalArgumentException e) {
                System.err.println("Unable to get JWT Token");
            } catch (ExpiredJwtException e) {
                System.err.println("JWT Token has expired");
            } catch (MalformedJwtException e) {
                System.err.println("JWT token is malformed");
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = this.jwtUserDetailsService.loadUserByUsername(username);

            if (jwtTokenUtil.validateToken(jwtToken, userDetails)) {
                if (hasRequiredRole(userDetails)) {
                    UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    usernamePasswordAuthenticationToken
                            .setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
                } else {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    return;
                }
            }
        }
        chain.doFilter(request, response);
    }

    private boolean hasRequiredRole(UserDetails userDetails) {
        System.out.println(userDetails.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("HRM") || grantedAuthority.getAuthority().equals("USER") || grantedAuthority.getAuthority().equals("EMPLOYEE") ||
                        grantedAuthority.getAuthority().equals("CMPNY")));
        return userDetails.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("HRM") || grantedAuthority.getAuthority().equals("USER") || grantedAuthority.getAuthority().equals("EMPLOYEE") ||
                        grantedAuthority.getAuthority().equals("CMPNY"));
    }
}
