package com.pirisa.hrm.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pirisa.hrm.model.Unit;
import com.pirisa.hrm.service.UnitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/department")
public class UnitController {

    @Autowired
    private UnitService unitService;


    @PostMapping(value = "/add_department", produces = {"application/json"})
    public ResponseEntity<?> addUnit(@RequestBody Map<String, Object> payload) {
        try {
            String dptName = payload.get("dptName") != null 
                ? payload.get("dptName").toString() 
                : (payload.get("dpt_name") != null ? payload.get("dpt_name").toString() : null);
            String dptCode = payload.get("dptCode") != null 
                ? payload.get("dptCode").toString() 
                : (payload.get("dpt_code") != null ? payload.get("dpt_code").toString() : null);
            String dptDesc = payload.get("dptDesc") != null 
                ? payload.get("dptDesc").toString() 
                : (payload.get("dpt_desc") != null ? payload.get("dpt_desc").toString() : "");
            Object cmpIdObj = payload.get("cmpId") != null ? payload.get("cmpId") : payload.get("cmp_id");

            // Validate required fields
            if (dptName == null || dptName.trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("resultCode", 101);
                errorResponse.put("resultDesc", "Department name is required");
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
            }
            if (dptCode == null || dptCode.trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("resultCode", 101);
                errorResponse.put("resultDesc", "Department code is required");
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
            }
            if (cmpIdObj == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("resultCode", 101);
                errorResponse.put("resultDesc", "Company ID is required");
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
            }

            Long cmpId = Long.valueOf(cmpIdObj.toString());

            // Check duplicate
            List<Unit> existingDepts = unitService.getUnitsByCompanyId(cmpId);
            boolean duplicate = existingDepts.stream().anyMatch(dept ->
                dept.getDptCode() != null && dept.getDptCode().equalsIgnoreCase(dptCode) ||
                dept.getDptName() != null && dept.getDptName().equalsIgnoreCase(dptName)
            );

            if (duplicate) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("resultCode", 102);
                errorResponse.put("resultDesc", "Unit code or name already exists");
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
            }

            Unit unit = new Unit();
            unit.setDptName(dptName.trim());
            unit.setDptCode(dptCode.trim());
            unit.setDptDesc(dptDesc);
            unit.setCmpId(cmpId);

            Unit createdUnit = unitService.createUnit(unit);
            if (createdUnit != null) {
                Map<String, Object> unitResponse = new HashMap<>();
                unitResponse.put("resultCode", 100);
                unitResponse.put("resultDesc", "Successfully Saved");

                Map<String, Object> responseBody = new HashMap<>();
                responseBody.put("Add_Att", createdUnit);
                responseBody.put("response", unitResponse);

                return new ResponseEntity<>(responseBody, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return handleException(e);
        }
    }

    @GetMapping(value = "/company/{cmpId}", produces = "application/json")
    public ResponseEntity<?> getUnitsByCompanyId(@PathVariable long cmpId) {
        try {
            List<Unit> units = unitService.getUnitsByCompanyId(cmpId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Successful");
            response.put("UnitList", units);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "An error occurred while fetching units"));
        }
    }

    @GetMapping(value = "/search/{cmpId}", produces = "application/json")
    public ResponseEntity<?> searchUnits(@PathVariable long cmpId, @RequestParam String query) {
        try {
            List<Unit> units = unitService.searchUnits(cmpId, query);
            
            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Successful");
            response.put("UnitList", units);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "An error occurred while searching units"));
        }
    }

    @PutMapping(value = "/update_department", produces = {"application/json"})
    public ResponseEntity<?> updateUnit(@RequestBody Unit unit) {
        try {
            // Check for duplicate unit code or name (excluding current unit)
            List<Unit> existingDepts = unitService.getUnitsByCompanyId(unit.getCmpId());
            boolean duplicate = existingDepts.stream().anyMatch(dept -> 
                dept.getId() != unit.getId() && (
                    dept.getDptCode().equals(unit.getDptCode()) || 
                    dept.getDptName().equalsIgnoreCase(unit.getDptName())
                )
            );
            
            if (duplicate) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("resultCode", 102);
                errorResponse.put("resultDesc", "Unit code or name already exists");
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
            }
            
            Unit updatedUnit = unitService.updateUnit(unit);
            if (updatedUnit != null) {
                Map<String, Object> unitResponse = new HashMap<>();
                unitResponse.put("resultCode", 100);
                unitResponse.put("resultDesc", "Successfully Updated");

                Map<String, Object> responseBody = new HashMap<>();
                responseBody.put("Unit", updatedUnit);
                responseBody.put("response", unitResponse);

                return new ResponseEntity<>(responseBody, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return handleException(e);
        }
    }


    @DeleteMapping("/delete-unit/{dpt_id}")
    public ResponseEntity<?> deleteUnit(@PathVariable Long dpt_id) {
        try {
            unitService.deleteUnit(dpt_id);

            Map<String, Object> unitResponse = new HashMap<>();
            unitResponse.put("resultCode", 100);
            unitResponse.put("resultDesc", "Successfully Deleted");

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("id", dpt_id);
            responseBody.put("response", unitResponse);

            return new ResponseEntity<>(responseBody, HttpStatus.OK);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("resultCode", 101);
            errorResponse.put("resultDesc", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return handleException(e);
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
