package com.portfolio.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import io.swagger.v3.oas.annotations.media.Schema;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Data
@Schema(description = "Performance metric entity for tracking portfolio performance over time")
public class PerformanceMetric {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Performance metric ID", example = "")
    private Long id;
    
    @Schema(description = "Date of the performance measurement", example = "2024-03-21")
    private LocalDate date;

    @Schema(description = "Portfolio value on the given date", example = "0.0")
    private Double value;

    @Schema(description = "Percentage change from previous measurement", example = "0.0")
    private Double percentageChange;

    @ManyToOne
    @JoinColumn(name = "portfolio_id")
    @JsonBackReference
    @Schema(description = "Portfolio this metric belongs to")
    private Portfolio portfolio;
} 