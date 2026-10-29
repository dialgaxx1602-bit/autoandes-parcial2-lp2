package pe.edu.upeu.autoandes.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.autoandes.dto.request.AnularOrdenRequestDTO;
import pe.edu.upeu.autoandes.dto.request.DetalleOrdenRequestDTO;
import pe.edu.upeu.autoandes.dto.request.OrdenRequestDTO;
import pe.edu.upeu.autoandes.dto.response.OrdenResponseDTO;
import pe.edu.upeu.autoandes.dto.response.ReporteIngresoServicioProjection;
import pe.edu.upeu.autoandes.entity.DetalleOrden;
import pe.edu.upeu.autoandes.entity.OrdenServicio;
import pe.edu.upeu.autoandes.entity.Servicio;
import pe.edu.upeu.autoandes.entity.Vehiculo;
import pe.edu.upeu.autoandes.exception.BadRequestException;
import pe.edu.upeu.autoandes.exception.BusinessRuleException;
import pe.edu.upeu.autoandes.exception.ResourceNotFoundException;
import pe.edu.upeu.autoandes.mapper.OrdenServicioMapper;
import pe.edu.upeu.autoandes.repository.OrdenServicioRepository;
import pe.edu.upeu.autoandes.repository.ServicioRepository;
import pe.edu.upeu.autoandes.repository.VehiculoRepository;
import pe.edu.upeu.autoandes.service.OrdenServicioService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrdenServicioServiceImpl implements OrdenServicioService {

    private final OrdenServicioRepository ordenServicioRepository;
    private final VehiculoRepository vehiculoRepository;
    private final ServicioRepository servicioRepository;
    private final OrdenServicioMapper ordenServicioMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrdenResponseDTO registrar(OrdenRequestDTO request, String usuarioRegistro) {
        
        Vehiculo vehiculo = vehiculoRepository.findById(request.getVehiculoId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehículo no encontrado con id: " + request.getVehiculoId()));

        
        if (request.getDetalles() == null || request.getDetalles().isEmpty() || request.getDetalles().size() > 10) {
            throw new BadRequestException("Una orden debe tener entre 1 y 10 detalles");
        }

        
        Set<Long> serviciosVistos = new HashSet<>();
        for (DetalleOrdenRequestDTO item : request.getDetalles()) {
            if (!serviciosVistos.add(item.getServicioId())) {
                throw new BadRequestException("No se permite repetir el mismo servicio en la orden (servicioId: " + item.getServicioId() + ")");
            }
            if (item.getCantidad() == null || item.getCantidad() < 1 || item.getCantidad() > 5) {
                throw new BadRequestException("La cantidad de cada servicio debe ser entre 1 y 5");
            }
        }

        
        Optional<OrdenServicio> ultimaOrdenOpt = ordenServicioRepository.findUltimaOrdenRegistradaPorVehiculo(vehiculo.getId());
        if (ultimaOrdenOpt.isPresent()) {
            Integer ultimoKilometraje = ultimaOrdenOpt.get().getKilometraje();
            if (request.getKilometraje() < ultimoKilometraje) {
                throw new BusinessRuleException(String.format(
                        "El kilometraje ingresado (%d km) no puede ser menor al de la última orden registrada (%d km) del vehículo %s",
                        request.getKilometraje(), ultimoKilometraje, vehiculo.getPlaca()
                ));
            }
        }

        
        String numero = generarNumeroCorrelativo();

        
        OrdenServicio orden = OrdenServicio.builder()
                .numero(numero)
                .fecha(LocalDateTime.now())
                .vehiculo(vehiculo)
                .kilometraje(request.getKilometraje())
                .estado("REGISTRADA")
                .usuarioRegistro(usuarioRegistro != null ? usuarioRegistro : "sistema")
                .total(BigDecimal.ZERO)
                .build();

        
        BigDecimal totalCalculado = BigDecimal.ZERO;
        List<DetalleOrden> detalles = new ArrayList<>();

        for (DetalleOrdenRequestDTO item : request.getDetalles()) {
            Servicio servicio = servicioRepository.findById(item.getServicioId())
                    .orElseThrow(() -> new ResourceNotFoundException("Servicio no encontrado con id: " + item.getServicioId()));

            
            if (servicio.getActivo() == null || servicio.getActivo() != 1) {
                throw new BusinessRuleException("El servicio '" + servicio.getCodigo() + " - " + servicio.getNombre() + "' se encuentra inactivo y no puede ser incluido en la orden");
            }

            BigDecimal precioBd = servicio.getPrecio();
            BigDecimal subtotal = precioBd.multiply(BigDecimal.valueOf(item.getCantidad()));
            totalCalculado = totalCalculado.add(subtotal);

            DetalleOrden detalle = DetalleOrden.builder()
                    .servicio(servicio)
                    .cantidad(item.getCantidad())
                    .precioUnitario(precioBd)
                    .subtotal(subtotal)
                    .build();

            orden.agregarDetalle(detalle);
            detalles.add(detalle);
        }

        orden.setTotal(totalCalculado);

        
        OrdenServicio guardada = ordenServicioRepository.save(orden);

        log.info("Orden de servicio registrada exitosamente: {}, vehiculo: {}, total: S/ {}",
                guardada.getNumero(), vehiculo.getPlaca(), guardada.getTotal());

        return ordenServicioMapper.toResponseDTO(guardada);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrdenResponseDTO anular(Long id, AnularOrdenRequestDTO request) {
        OrdenServicio orden = ordenServicioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Orden de servicio no encontrada con id: " + id));

        
        if (!"REGISTRADA".equalsIgnoreCase(orden.getEstado())) {
            throw new BusinessRuleException("Solo se puede anular una orden en estado REGISTRADA. Estado actual: " + orden.getEstado());
        }

        
        LocalDate hoy = LocalDate.now();
        LocalDate fechaRegistro = orden.getFecha().toLocalDate();
        if (!fechaRegistro.isEqual(hoy)) {
            throw new BusinessRuleException(String.format(
                    "Solo se puede anular una orden en el mismo día de su registro (registrada el %s, fecha actual %s)",
                    fechaRegistro, hoy
            ));
        }

        
        if (request.getMotivo() == null || request.getMotivo().trim().length() < 10 || request.getMotivo().trim().length() > 200) {
            throw new BadRequestException("El motivo de anulación es obligatorio y debe contener entre 10 y 200 caracteres");
        }

        orden.setEstado("ANULADA");
        orden.setMotivoAnulacion(request.getMotivo().trim());

        OrdenServicio actualizada = ordenServicioRepository.save(orden);
        log.info("Orden de servicio anulada exitosamente: {}, motivo: {}", actualizada.getNumero(), actualizada.getMotivoAnulacion());

        return ordenServicioMapper.toResponseDTO(actualizada);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrdenResponseDTO> listarConFiltros(String placa, String estado, LocalDateTime desde, LocalDateTime hasta) {
        String placaParam = (placa != null && !placa.trim().isEmpty()) ? placa.trim() : null;
        String estadoParam = (estado != null && !estado.trim().isEmpty()) ? estado.trim() : null;

        List<OrdenServicio> ordenes = ordenServicioRepository.buscarConFiltros(placaParam, estadoParam, desde, hasta);

        return ordenes.stream()
                .map(ordenServicioMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OrdenResponseDTO buscarPorId(Long id) {
        OrdenServicio orden = ordenServicioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Orden de servicio no encontrada con id: " + id));
        return ordenServicioMapper.toResponseDTO(orden);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReporteIngresoServicioProjection> reporteIngresosPorServicio(LocalDateTime desde, LocalDateTime hasta) {
        return ordenServicioRepository.reporteIngresosPorServicio(desde, hasta);
    }

    private synchronized String generarNumeroCorrelativo() {
        long cuenta = ordenServicioRepository.count() + 1;
        String numero = String.format("OS-%06d", cuenta);
        while (ordenServicioRepository.findByNumero(numero).isPresent()) {
            cuenta++;
            numero = String.format("OS-%06d", cuenta);
        }
        return numero;
    }
}
