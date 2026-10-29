package pe.edu.upeu.autoandes.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.autoandes.dto.response.ReporteIngresoServicioProjection;
import pe.edu.upeu.autoandes.service.OrdenServicioService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reportes")
@RequiredArgsConstructor
@Tag(name = "Reportes", description = "Endpoints de reportería agregada empresarial")
public class ReporteController {

    private final OrdenServicioService ordenServicioService;

    @GetMapping("/ingresos-por-servicio")
    @PreAuthorize("hasAuthority('REPORTE_VER')")
    @Operation(summary = "Reporte agregado de ingresos por servicio (JPQL GROUP BY, ordenado por importe descendente, excluyendo órdenes anuladas)")
    public ResponseEntity<List<ReporteIngresoServicioProjection>> reporteIngresosPorServicio(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta) {
        return ResponseEntity.ok(ordenServicioService.reporteIngresosPorServicio(desde, hasta));
    }
}
