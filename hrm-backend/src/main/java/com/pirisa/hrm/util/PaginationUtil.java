package com.pirisa.hrm.util;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public class PaginationUtil {

    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_SIZE = 20;
    private static final int MAX_SIZE = 100;

    public static Pageable createPageable(Integer page, Integer size, String sortBy, String sortDirection) {
        int pageNumber = (page != null && page >= 0) ? page : DEFAULT_PAGE;
        int pageSize = (size != null && size > 0) ? Math.min(size, MAX_SIZE) : DEFAULT_SIZE;

        if (sortBy != null && !sortBy.isEmpty()) {
            Sort.Direction direction = "desc".equalsIgnoreCase(sortDirection)
                    ? Sort.Direction.DESC
                    : Sort.Direction.ASC;
            return PageRequest.of(pageNumber, pageSize, Sort.by(direction, sortBy));
        }

        return PageRequest.of(pageNumber, pageSize);
    }

    public static Pageable createPageable(Integer page, Integer size) {
        return createPageable(page, size, "id", "desc");
    }
}