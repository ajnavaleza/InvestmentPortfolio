package com.portfolio.model;

import jakarta.persistence.*;
import lombok.Data;
import io.swagger.v3.oas.annotations.media.Schema;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Data
@Schema(description = "Asset entity representing an investment holding")
public class Asset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Asset ID", example = "")
    private Long id;
    
    @Schema(description = "Name of the asset", example = "")
    private String name;

    @Schema(description = "Trading symbol of the asset", example = "")
    private String symbol;

    @Schema(description = "Quantity of the asset held", example = "0.0")
    private Double quantity;

    @Schema(description = "Current market price of the asset", example = "0.0")
    private Double currentPrice;

    @Schema(description = "Total value of the asset holding (quantity * currentPrice)", example = "0.0")
    private Double value;

    @Schema(description = "Percentage allocation in the portfolio", example = "0.0")
    private Double allocation;

    @ManyToOne
    @JoinColumn(name = "portfolio_id")
    @JsonBackReference
    @Schema(description = "Portfolio containing this asset")
    private Portfolio portfolio;
} 