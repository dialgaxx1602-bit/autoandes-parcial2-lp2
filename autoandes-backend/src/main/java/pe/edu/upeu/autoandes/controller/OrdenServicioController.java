package pe.edu.upeu.autoandes.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.autoandes.dto.request.AnularOrdenRequestDTO;
import pe.edu.upeu.autoandes.dto.request.OrdenRequestDTO;
import pe.edu.upeu.autoandes.dto.response.OrdenResponseDTO;
import pe.edu.upeu.autoandes.service.OrdenServicioService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/ordenes")
@RequiredArgsConstructor
@Tag(name = "Órdenes de Servicio", description = "Endpoints para registro transaccional, consulta con filtros y anulación de órdenes de servicio")
public class OrdenServicioController {

    private final OrdenServicioService ordenServicioService;

    @PostMapping
    @Operation(summary = "Registrar orden de servicio con cabecera y detalles en una sola transacción")
    public ResponseEntity<OrdenResponseDTO> registrar(
            @Valid @RequestBody OrdenRequestDTO request,
            Authentication authentication) {
        String usuario = (authentication != null) ? authentication.getName() : "asesor";
        OrdenResponseDTO creada = ordenServicioService.registrar(request, usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    @GetMapping
    @Operation(summary = "Listar órdenes de servicio con filtros opcionales (placa, estado, desde, hasta)")
    public ResponseEntity<List<OrdenResponseDTO>> listar(
            @RequestParam(required = false) String placa,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta) {
        return ResponseEntity.ok(ordenServicioService.listarConFiltros(placa, estado, desde, hasta));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consultar orden de servicio completa por ID")
    public ResponseEntity<OrdenResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ordenServicioService.buscarPorId(id));
    }

    @PatchMapping("/{id}/anular")
    @Operation(summary = "Anular una orden registrada en el mismo día con motivo obligatorio")
    public ResponseEntity<OrdenResponseDTO> anular(
            @PathVariable Long id,
            @Valid @RequestBody AnularOrdenRequestDTO request) {
        return ResponseEntity.ok(ordenServicioService.anular(id, request));
    }
}
