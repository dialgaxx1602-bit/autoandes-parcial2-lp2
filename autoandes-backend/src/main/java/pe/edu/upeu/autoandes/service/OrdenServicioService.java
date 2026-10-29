package pe.edu.upeu.autoandes.service;

import pe.edu.upeu.autoandes.dto.request.AnularOrdenRequestDTO;
import pe.edu.upeu.autoandes.dto.request.OrdenRequestDTO;
import pe.edu.upeu.autoandes.dto.response.OrdenResponseDTO;
import pe.edu.upeu.autoandes.dto.response.ReporteIngresoServicioProjection;

import java.time.LocalDateTime;
import java.util.List;

public interface OrdenServicioService {
    OrdenResponseDTO registrar(OrdenRequestDTO request, String usuarioRegistro);
    OrdenResponseDTO anular(Long id, AnularOrdenRequestDTO request);
    List<OrdenResponseDTO> listarConFiltros(String placa, String estado, LocalDateTime desde, LocalDateTime hasta);
    OrdenResponseDTO buscarPorId(Long id);
    List<ReporteIngresoServicioProjection> reporteIngresosPorServicio(LocalDateTime desde, LocalDateTime hasta);
}
