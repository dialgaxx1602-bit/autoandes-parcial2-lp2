package pe.edu.upeu.autoandes.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.edu.upeu.autoandes.dto.response.ReporteIngresoServicioProjection;
import pe.edu.upeu.autoandes.entity.OrdenServicio;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrdenServicioRepository extends JpaRepository<OrdenServicio, Long> {

    Optional<OrdenServicio> findByNumero(String numero);

    boolean existsByVehiculoId(Long vehiculoId);

    @Query("SELECT COUNT(d) > 0 FROM DetalleOrden d WHERE d.servicio.id = :servicioId")
    boolean existeEnDetallePorServicioId(@Param("servicioId") Long servicioId);

    
    @Query("SELECT o FROM OrdenServicio o WHERE o.vehiculo.id = :vehiculoId AND o.estado = 'REGISTRADA' ORDER BY o.id DESC LIMIT 1")
    Optional<OrdenServicio> findUltimaOrdenRegistradaPorVehiculo(@Param("vehiculoId") Long vehiculoId);

    
    @Query("SELECT o FROM OrdenServicio o " +
           "WHERE (:placa IS NULL OR UPPER(o.vehiculo.placa) LIKE UPPER(CONCAT('%', :placa, '%'))) " +
           "AND (:estado IS NULL OR UPPER(o.estado) = UPPER(:estado)) " +
           "AND (:desde IS NULL OR o.fecha >= :desde) " +
           "AND (:hasta IS NULL OR o.fecha <= :hasta) " +
           "ORDER BY o.fecha DESC, o.id DESC")
    List<OrdenServicio> buscarConFiltros(
            @Param("placa") String placa,
            @Param("estado") String estado,
            @Param("desde") LocalDateTime desde,
            @Param("hasta") LocalDateTime hasta
    );

    
    @Query("SELECT d.servicio.codigo AS codigo, d.servicio.nombre AS servicio, " +
           "SUM(d.cantidad) AS cantidadTotal, SUM(d.subtotal) AS importeTotal " +
           "FROM DetalleOrden d " +
           "WHERE d.orden.estado <> 'ANULADA' " +
           "AND (:desde IS NULL OR d.orden.fecha >= :desde) " +
           "AND (:hasta IS NULL OR d.orden.fecha <= :hasta) " +
           "GROUP BY d.servicio.codigo, d.servicio.nombre " +
           "ORDER BY SUM(d.subtotal) DESC")
    List<ReporteIngresoServicioProjection> reporteIngresosPorServicio(
            @Param("desde") LocalDateTime desde,
            @Param("hasta") LocalDateTime hasta
    );

    Optional<OrdenServicio> findTopByOrderByIdDesc();
}
