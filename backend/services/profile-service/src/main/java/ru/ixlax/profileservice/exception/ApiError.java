package ru.ixlax.profileservice.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Value;

import java.time.OffsetDateTime;
import java.util.Map;

@Value
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiError {
    OffsetDateTime timestamp;
    int status;           
    String error;    
    String message;        
    String path;         
    Map<String, String> validation; 
    String code;          
}
