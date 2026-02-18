package com.knoweb.HRM.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.knoweb.HRM.model.Allowance;
import com.knoweb.HRM.model.CompanyLeave;
import com.knoweb.HRM.model.Department;
import com.knoweb.HRM.service.AllowanceService;
import com.knoweb.HRM.service.CompanyLeaveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/company_leave")
public class CompanyLeaveController {

    @Autowired
    private CompanyLeaveService companyLeaveService;


    @PostMapping(value = "/add_leave", produces = {"application/json"})
    public ResponseEntity<?> addLeave(@RequestBody CompanyLeave companyLeave) {
        try {
            CompanyLeave createdCompanyLeave = companyLeaveService.createCompanyLeave(companyLeave);
            if (createdCompanyLeave != null) {
                Map<String, Object> leaveResponse = new HashMap<>();
                leaveResponse.put("resultCode", 100);
                leaveResponse.put("resultDesc", "Successfully Saved");

                Map<String, Object> responseBody = new HashMap<>();
                responseBody.put("Add_CompanyLeave", createdCompanyLeave);
                responseBody.put("response", leaveResponse);

                return new ResponseEntity<>(responseBody, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return handleException(e);
        }
    }

    @GetMapping(value = "/company/{cmpId}", produces = "application/json")
    public ResponseEntity<?> getLeaveByCompanyId(@PathVariable long cmpId) {
        try {
            List<CompanyLeave> companyLeaves = companyLeaveService.getLeaveByCompanyId(cmpId);
            if (companyLeaves.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("message", "No Leave found for this company ID"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Successful");
            response.put("LeavetList", companyLeaves);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "An error occurred while fetching Leaves"));
        }
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception e) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("resultCode", 101);
        errorResponse.put("resultDesc", "ERROR");

        String jsonResponse;
        try {
            jsonResponse = new ObjectMapper().writeValueAsString(errorResponse);
        } catch (Exception ex) {
            jsonResponse = "{\"resultCode\":101,\"resultDesc\":\"ERROR\"}";
        }
        return new ResponseEntity<>(jsonResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
