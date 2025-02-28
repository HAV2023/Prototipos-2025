/*******************************************************
 * app.js
 * Versión 2.0
 *  - Autor: Héctor Arciniega.
 *  - Fallback manual si no se clickea sugerencia.
 *  - Umbral de factibilidad (parada muy alejada => descartar ruta).
 *  - Opción de unidireccionalidad (comentada).
 *******************************************************/

/****************************************
 * 1. VARIABLES GLOBALES
 ****************************************/
let map;
let routeLayers = {};   // polilíneas por ruta
let markerLayers = {};  // marcadores (circleMarker) de cada ruta
let currentLayers = []; // referencias a capas/markers visibles actualmente
let selectedDestination = null; // { lat, lon, name }

/****************************************
 * 2. DATOS DE RUTAS (7 rutas)
 ****************************************/
const routesData = {
  amarilla: {
    color: 'yellow',
    stops: (() => {
      const origen = { lat: 20.007300, lon: -102.247342, description: 'Parada 1: Inicio Ruta Amarilla' };
      const destino = { lat: 20.006897, lon: -102.324418, description: 'Parada 12: Fin Ruta Amarilla' };
      const stopNames = [
        'Parada 2: Mercado Central',
        'Parada 3: Plaza Principal',
        'Parada 4: Catedral de Zamora',
        'Parada 5: Parque del Arte',
        'Parada 6: Hospital General',
        'Parada 7: Universidad Autónoma',
        'Parada 8: Centro Cultural',
        'Parada 9: Estadio Municipal',
        'Parada 10: Centro Comercial Las Américas',
        'Parada 11: Terminal de Autobuses'
      ];
      const pts = generateIntermediatePoints(
        origen.lat, origen.lon,
        destino.lat, destino.lon,
        stopNames.length, stopNames
      );
      return [origen, ...pts, destino];
    })(),
  },
  roja: {
    color: 'red',
    stops: (() => {
      const origen = { lat: 19.974258, lon: -102.269408, description: 'Parada 1: Inicio Ruta Roja' };
      const destino = { lat: 20.007937, lon: -102.325578, description: 'Parada 12: Fin Ruta Roja' };
      const stopNames = [
        'Parada 2: Parque La Esperanza',
        'Parada 3: Museo Regional',
        'Parada 4: Biblioteca Pública',
        'Parada 5: Plaza de Toros',
        'Parada 6: Mercado de Artesanías',
        'Parada 7: Colegio Nacional',
        'Parada 8: Teatro Municipal',
        'Parada 9: Estación de Tren',
        'Parada 10: Centro de Convenciones',
        'Parada 11: Alameda Central'
      ];
      const pts = generateIntermediatePoints(
        origen.lat, origen.lon,
        destino.lat, destino.lon,
        stopNames.length, stopNames
      );
      return [origen, ...pts, destino];
    })(),
  },
  morada: {
    color: 'purple',
    stops: (() => {
      const origen = { lat: 19.963363, lon: -102.279635, description: 'Parada 1: Inicio Ruta Morada' };
      const destino = { lat: 20.013412, lon: -102.295445, description: 'Parada 12: Fin Ruta Morada' };
      const stopNames = [
        'Parada 2: Barrio Antiguo',
        'Parada 3: Museo de Historia',
        'Parada 4: Jardín Botánico',
        'Parada 5: Plaza del Sol',
        'Parada 6: Instituto Tecnológico',
        'Parada 7: Centro de Salud',
        'Parada 8: Auditorio Nacional',
        'Parada 9: Estadio Olímpico',
        'Parada 10: Parque Acuático',
        'Parada 11: Zona Industrial'
      ];
      const pts = generateIntermediatePoints(
        origen.lat, origen.lon,
        destino.lat, destino.lon,
        stopNames.length, stopNames
      );
      return [origen, ...pts, destino];
    })(),
  },
  rosa: {
    color: 'pink',
    stops: (() => {
      const origen = { lat: 19.992539, lon: -102.308615, description: 'Parada 1: Inicio Ruta Rosa' };
      const destino = { lat: 19.982692, lon: -102.243608, description: 'Parada 12: Fin Ruta Rosa' };
      const stopNames = [
        'Parada 2: Mirador de la Ciudad',
        'Parada 3: Centro Deportivo',
        'Parada 4: Parque de los Niños',
        'Parada 5: Centro de Negocios',
        'Parada 6: Plaza Las Flores',
        'Parada 7: Universidad Técnica',
        'Parada 8: Museo de Arte Moderno',
        'Parada 9: Terminal Marítima',
        'Parada 10: Centro Financiero',
        'Parada 11: Parque Ecológico'
      ];
      const pts = generateIntermediatePoints(
        origen.lat, origen.lon,
        destino.lat, destino.lon,
        stopNames.length, stopNames
      );
      return [origen, ...pts, destino];
    })(),
  },
  cafe: {
    color: 'brown',
    stops: (() => {
      const origen = { lat: 19.938482, lon: -102.319351, description: 'Parada 1: Inicio Ruta Café' };
      const destino = { lat: 20.006361, lon: -102.275046, description: 'Parada 12: Fin Ruta Café' };
      const stopNames = [
        'Parada 2: Museo del Café',
        'Parada 3: Plaza de La Paz',
        'Parada 4: Catedral Antigua',
        'Parada 5: Teatro Principal',
        'Parada 6: Mercado Nocturno',
        'Parada 7: Facultad de Artes',
        'Parada 8: Centro Gastronómico',
        'Parada 9: Jardines del Río',
        'Parada 10: Zona Hotelera',
        'Parada 11: Centro de Exposiciones'
      ];
      const customPoints = [
        { lat: 19.945000, lon: -102.310000 },
        { lat: 19.955000, lon: -102.300000 },
        { lat: 19.965000, lon: -102.290000 },
        { lat: 19.975000, lon: -102.285000 },
        { lat: 19.985000, lon: -102.280000 },
        { lat: 19.995000, lon: -102.275000 },
        { lat: 20.000000, lon: -102.272000 },
        { lat: 20.005000, lon: -102.272000 },
        { lat: 20.008000, lon: -102.273000 },
        { lat: 20.010000, lon: -102.275000 }
      ];
      const pts = generateIntermediatePoints(
        origen.lat, origen.lon,
        destino.lat, destino.lon,
        stopNames.length, stopNames,
        customPoints,
        false
      );
      return [origen, ...pts, destino];
    })(),
  },
  verde: {
    color: 'green',
    stops: (() => {
      const origen = { lat: 20.007300, lon: -102.247342, description: 'Parada 1: Inicio Ruta Verde' };
      const destino = { lat: 19.995126, lon: -102.263393, description: 'Parada 12: Fin Ruta Verde' };
      const stopNames = [
        'Parada 2: Reserva Ecológica',
        'Parada 3: Parque Nacional',
        'Parada 4: Lago Cristalino',
        'Parada 5: Sendero del Bosque',
        'Parada 6: Granja Educativa',
        'Parada 7: Centro de Investigación',
        'Parada 8: Área de Picnic',
        'Parada 9: Mirador Natural',
        'Parada 10: Zona de Camping',
        'Parada 11: Estación Biológica'
      ];
      const pts = generateIntermediatePoints(
        origen.lat, origen.lon,
        destino.lat, destino.lon,
        stopNames.length, stopNames
      );
      return [origen, ...pts, destino];
    })(),
  },
  gris: {
    color: 'gray',
    stops: (() => {
      const origen = { lat: 19.935388, lon: -102.319419, description: 'Parada 1: Inicio Ruta Gris' };
      const destino = { lat: 20.009011, lon: -102.292882, description: 'Parada 12: Fin Ruta Gris' };
      const stopNames = [
        'Parada 2: Centro Tecnológico',
        'Parada 3: Zona Financiera',
        'Parada 4: Museo de Ciencia',
        'Parada 5: Parque de Innovación',
        'Parada 6: Biblioteca Digital',
        'Parada 7: Laboratorio Central',
        'Parada 8: Centro de Conferencias',
        'Parada 9: Plaza de la Cultura',
        'Parada 10: Área Administrativa',
        'Parada 11: Terminal Aérea'
      ];
      const customPoints = [
        { lat: 19.942000, lon: -102.312000 },
        { lat: 19.952000, lon: -102.305000 },
        { lat: 19.962000, lon: -102.298000 },
        { lat: 19.972000, lon: -102.292000 },
        { lat: 19.982000, lon: -102.290000 },
        { lat: 19.992000, lon: -102.288000 },
        { lat: 20.002000, lon: -102.290000 },
        { lat: 20.006000, lon: -102.292000 },
        { lat: 20.008000, lon: -102.293000 },
        { lat: 20.008500, lon: -102.293500 }
      ];
      const pts = generateIntermediatePoints(
        origen.lat, origen.lon,
        destino.lat, destino.lon,
        stopNames.length, stopNames,
        customPoints,
        false
      );
      return [origen, ...pts, destino];
    })(),
  },
};

/****************************************
 * 3. GENERADOR DE PUNTOS INTERMEDIOS
 ****************************************/
function generateIntermediatePoints(
  startLat, startLon,
  endLat, endLon,
  numPoints,
  stopNames,
  customPoints = [],
  centerAdjustment = true
) {
  const arr = [];
  for (let i = 1; i <= numPoints; i++) {
    let lat, lon;
    if (customPoints.length > 0) {
      lat = customPoints[i - 1].lat;
      lon = customPoints[i - 1].lon;
    } else {
      lat = startLat + ((endLat - startLat) * i) / (numPoints + 1);
      lon = startLon + ((endLon - startLon) * i) / (numPoints + 1);

      if (centerAdjustment) {
        const centerLat = 20.0090;
        const centerLon = -102.2800;
        const weight = Math.sin((Math.PI * i) / (numPoints + 1));
        lat += (centerLat - lat) * 0.3 * weight;
        lon += (centerLon - lon) * 0.3 * weight;
      }
    }
    const placeName = stopNames[i - 1] || `Parada ${i + 1}`;
    arr.push({ lat, lon, description: placeName });
  }
  return arr;
}

/****************************************
 * 4. AUTOCOMPLETADO (Mapbox GL Geocoder) + flyTo: false
 ****************************************/
function setupAutocomplete() {
  const geocoder = new MapboxGeocoder({
    accessToken: 'pk.eyJ1IjoiaGFyY2luaWVnYSIsImEiOiJjbTdsZXprMXAwN3RrMmpva3BhNm4ybGRjIn0.HDOTpVsOSe4bwAFMdGVQXg',
    mapboxgl: mapboxgl,
    placeholder: 'Ingresa tu destino...',
    limit: 5,
    proximity: { longitude: -102.2800, latitude: 20.0090 },
    flyTo: false,
    marker: false
  });

  geocoder.on('result', (ev) => {
    const lugar = ev.result;
    console.log('Elegiste:', lugar.place_name);
    selectedDestination = {
      lat: lugar.center[1],
      lon: lugar.center[0],
      name: lugar.place_name
    };
    // Centrar con Leaflet
    map.setView([selectedDestination.lat, selectedDestination.lon], 14);
  });

  const container = document.getElementById('geocoderContainer');
  if (!container) {
    console.warn('No existe #geocoderContainer en el HTML');
    return;
  }
  // Lo montamos sin pasar "map" para que no use Mapbox GL
  container.appendChild(geocoder.onAdd());
}

/****************************************
 * 5. TRAZAR RUTA (versión antigua)
 ****************************************/
function findBestRoute() {
  // Si no se seleccionó un destino con el geocoder...
  if (!selectedDestination) {
    fallbackGeocodeThen(() => {
      markDestinationAndCalculateBestRoute();
    });
  } else {
    markDestinationAndCalculateBestRoute();
  }
}

function markDestinationAndCalculateBestRoute() {
  const mk = L.marker([selectedDestination.lat, selectedDestination.lon])
    .bindPopup(`<strong>Destino:</strong> ${selectedDestination.name}`)
    .addTo(map)
    .openPopup();
  currentLayers.push(mk);

  calculateBestRoute();
}

/**
 * Fallback: en caso de que el usuario no cliquee una sugerencia,
 * usamos la API de geocodificación con el texto ingresado en la caja.
 */
function fallbackGeocodeThen(onDone) {
  const geocoderInput = document.querySelector('.mapboxgl-ctrl-geocoder input[type="text"]');
  if (!geocoderInput) {
    alert('No se encontró el input del geocoder.');
    return;
  }
  const query = geocoderInput.value.trim();
  if (!query) {
    alert('Por favor, ingresa o selecciona un destino.');
    return;
  }
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
              `access_token=pk.eyJ1IjoiaGFyY2luaWVnYSIsImEiOiJjbTdsZXprMXAwN3RrMmpva3BhNm4ybGRjIn0.HDOTpVsOSe4bwAFMdGVQXg&limit=1`;

  fetch(url)
    .then(r => r.json())
    .then(data => {
      if (!data.features || data.features.length === 0) {
        alert('Destino no encontrado.');
        return;
      }
      const feat = data.features[0];
      selectedDestination = {
        lat: feat.center[1],
        lon: feat.center[0],
        name: feat.place_name
      };
      console.log('Destino (fallback manual):', selectedDestination);

      if (typeof onDone === 'function') onDone();
    })
    .catch(err => {
      console.error('Error geocodificando manualmente:', err);
    });
}

function calculateBestRoute() {
  if (!selectedDestination) {
    alert('No hay destino seleccionado (fallback falló).');
    return;
  }

  let bestRoute = null;
  let closestStop = null;
  let shortestDistance = Infinity;

  // Umbral de factibilidad (p. ej. 3 km).
  const MAX_DIST = 3;

  for (let routeName in routesData) {
    const { stops } = routesData[routeName];

    // 1) Encuentra la parada más cercana al destino
    let minDistDest = Infinity;
    let stopDest = null;
    stops.forEach((stop) => {
      const d = getDistance(selectedDestination.lat, selectedDestination.lon, stop.lat, stop.lon);
      if (d < minDistDest) {
        minDistDest = d;
        stopDest = stop;
      }
    });

    // Si la parada del destino está MUY lejos, descartamos esta ruta
    if (minDistDest > MAX_DIST) {
      continue;
    }

    // 2) Encuentra la parada más cercana al usuario (aquí no sabemos su lat/lon, pues en esta versión no se pide geoloc).
    //    Suponiendo que TÚ (usuario) eres un “punto de partida” X. (Pero en la versión “antigua” no tenemos user location).
    //    Originalmente tu findBestRoute() NO usaba geolocalización del usuario, solo el destino.
    //    Por lo tanto, lo que hace es: "Solo se fija en la parada más cercana al destino".
    //    Dejamos la lógica tal cual estaba, para no romper:
    //    Aun así, aplicamos la misma idea del umbral de dist para el “destino”.

    // Por compatibilidad, se asume que "closestStop" vendrá de la comparación con el destino:
    // (En tu antigua versión, solo usabas 'closestStop' basándote en dist al DESTINO, no al user).
    // Ajustamos la nomenclatura para no confundir:
    const dist = minDistDest;
    const s = stopDest;

    if (dist < shortestDistance) {
      shortestDistance = dist;
      closestStop = s;
      bestRoute = routeName;
    }
  }

  if (!bestRoute || !closestStop) {
    alert('No se determinó ninguna ruta factible para este destino (umbral).');
    return;
  }

  // Limpiar y mostrar la ruta
  clearMap();
  showRoute(bestRoute);

  const iconCustom = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/64/64113.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
  const mkStop = L.marker([closestStop.lat, closestStop.lon], { icon: iconCustom })
    .bindPopup(`<strong>Parada más cercana al destino:</strong> ${closestStop.description}`)
    .addTo(map)
    .openPopup();
  currentLayers.push(mkStop);
}

/****************************************
 * 6. FUNCIÓN: RUTA DESDE MI UBICACIÓN HASTA DESTINO
 ****************************************/
function findBestRouteFromMyLocationToDestination() {
  if (!navigator.geolocation) {
    alert('Tu navegador no soporta geolocalización.');
    return;
  }

  if (!selectedDestination) {
    fallbackGeocodeThen(() => {
      getUserLocationAndCompute();
    });
  } else {
    getUserLocationAndCompute();
  }
}

function getUserLocationAndCompute() {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      computeRoute(pos.coords.latitude, pos.coords.longitude);
    },
    (err) => {
      console.error('Error geoloc:', err);
      alert('No se pudo obtener tu ubicación.');
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

function computeRoute(userLat, userLon) {
  if (!selectedDestination) {
    alert('No hay destino.');
    return;
  }

  const MAX_DIST = 3; // km, umbral de paradas

  let best = {
    routeName: null,
    distanceSum: Infinity,
    userStop: null,
    destStop: null
  };

  for (let routeName in routesData) {
    const stops = routesData[routeName].stops;

    // A) Parada más cercana al usuario
    let closestStopUser = null;
    let minDistUser = Infinity;
    let indexUserStop = 0;

    // B) Parada más cercana al destino
    let closestStopDest = null;
    let minDistDest = Infinity;
    let indexDestStop = 0;

    stops.forEach((stop, idx) => {
      // Dist al user
      const dU = getDistance(userLat, userLon, stop.lat, stop.lon);
      if (dU < minDistUser) {
        minDistUser = dU;
        closestStopUser = stop;
        indexUserStop = idx;
      }
      // Dist al destino
      const dD = getDistance(selectedDestination.lat, selectedDestination.lon, stop.lat, stop.lon);
      if (dD < minDistDest) {
        minDistDest = dD;
        closestStopDest = stop;
        indexDestStop = idx;
      }
    });

    // Umbral: si cualquiera de estas paradas está muy lejos, saltamos
    if (minDistUser > MAX_DIST || minDistDest > MAX_DIST) {
      continue;
    }

    // Distancia interna A->B
    const distRoute = getRouteDistanceBetweenStops(stops, indexUserStop, indexDestStop);

    const totalDist = minDistUser + distRoute + minDistDest;

    // OPCIONAL: Si las rutas son unidireccionales y no podemos ir “hacia atrás”:
    // if (indexUserStop > indexDestStop) {
    //   continue; // descartamos esta ruta
    // }

    if (totalDist < best.distanceSum) {
      best.distanceSum = totalDist;
      best.routeName = routeName;
      best.userStop = { stop: closestStopUser, index: indexUserStop };
      best.destStop = { stop: closestStopDest, index: indexDestStop };
    }
  }

  if (!best.routeName) {
    alert('No se encontró una ruta que pase cerca de tu ubicación y del destino (umbral).');
    return;
  }

  clearMap();

  // Marcador de la ubicación de usuario
  const userIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2200/2200326.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [1, -34]
  });
  const mkUser = L.marker([userLat, userLon], { icon: userIcon })
    .bindPopup('<strong>Tu Ubicación</strong>')
    .addTo(map)
    .openPopup();
  currentLayers.push(mkUser);

  // Mostramos la ruta ganadora
  showRoute(best.routeName);

  // Parada de abordaje
  const userStopIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/64/64113.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
  const mkUserStop = L.marker([best.userStop.stop.lat, best.userStop.stop.lon], { icon: userStopIcon })
    .bindPopup(`<strong>Parada más cercana para abordar:</strong> ${best.userStop.stop.description}`)
    .addTo(map)
    .openPopup();
  currentLayers.push(mkUserStop);

  // Parada cercana al destino
  const mkDestStop = L.marker([best.destStop.stop.lat, best.destStop.stop.lon], { icon: userStopIcon })
    .bindPopup(`<strong>Parada más cercana al destino:</strong> ${best.destStop.stop.description}`)
    .addTo(map)
    .openPopup();
  currentLayers.push(mkDestStop);

  // Marcamos el destino
  const mkDestination = L.marker([selectedDestination.lat, selectedDestination.lon])
    .bindPopup(`<strong>Destino:</strong> ${selectedDestination.name}`)
    .addTo(map)
    .openPopup();
  currentLayers.push(mkDestination);

  // (Opcional) ETA en auto con tráfico
  getDrivingTimeWithTraffic(userLat, userLon, selectedDestination.lat, selectedDestination.lon)
    .then(minutes => {
      alert(`ETA aproximado en coche (con tráfico): ~${minutes} minutos`);
    })
    .catch(e => console.error('Error ETA:', e));
}

/****************************************
 * 7. CÁLCULO DISTANCIA ENTRE PARADAS (INDICES)
 ****************************************/
function getRouteDistanceBetweenStops(stops, idxA, idxB) {
  if (idxA === idxB) return 0;
  let distanceSum = 0;
  let start = Math.min(idxA, idxB);
  let end = Math.max(idxA, idxB);

  for (let i = start; i < end; i++) {
    const s1 = stops[i];
    const s2 = stops[i + 1];
    distanceSum += getDistance(s1.lat, s1.lon, s2.lat, s2.lon);
  }
  return distanceSum;
}

/****************************************
 * 8. FÓRMULA HAVERSINE (km)
 ****************************************/
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/****************************************
 * 9. ETA CON TRÁFICO (MAPBOX DIRECTIONS)
 ****************************************/
function getDrivingTimeWithTraffic(originLat, originLon, destLat, destLon) {
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/` +
              `${originLon},${originLat};${destLon},${destLat}` +
              `?geometries=geojson&overview=full&access_token=pk.eyJ1IjoiaGFyY2luaWVnYSIsImEiOiJjbTdsZXprMXAwN3RrMmpva3BhNm4ybGRjIn0.HDOTpVsOSe4bwAFMdGVQXg`;

  return fetch(url)
    .then(r => r.json())
    .then(data => {
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const durationInSeconds = route.duration;
        return Math.round(durationInSeconds / 60);
      } else {
        throw new Error('No se encontraron rutas driving-traffic');
      }
    });
}

/****************************************
 * 10. INICIALIZAR RUTAS
 ****************************************/
function initRoutes() {
  for (let routeName in routesData) {
    const { color, stops } = routesData[routeName];
    const latLngs = stops.map((s) => [s.lat, s.lon]);
    const polyline = L.polyline(latLngs, { color, weight: 4, opacity: 0.7 });

    // Marcadores (circleMarkers) de las paradas
    const markers = L.layerGroup();
    stops.forEach((stop) => {
      const m = L.circleMarker([stop.lat, stop.lon], {
        radius: 5,
        color,
        fillColor: color,
        fillOpacity: 0.9
      }).bindPopup(`<strong>${stop.description}</strong>`);
      markers.addLayer(m);
    });

    routeLayers[routeName] = polyline;
    markerLayers[routeName] = markers;
  }
}

/****************************************
 * 11. MOSTRAR RUTA(S)
 ****************************************/
function showAllRoutes() {
  clearMap();
  let group = L.featureGroup();

  for (let routeName in routeLayers) {
    routeLayers[routeName].addTo(map);
    markerLayers[routeName].addTo(map);
    group.addLayer(routeLayers[routeName]);
    currentLayers.push(routeLayers[routeName], markerLayers[routeName]);
  }

  if (group.getLayers().length > 0) {
    map.fitBounds(group.getBounds());
  }
}

function showRoute(routeName) {
  clearMap();
  const polyline = routeLayers[routeName];
  const markers = markerLayers[routeName];
  if (!polyline || !markers) {
    console.warn('No existe la ruta:', routeName);
    return;
  }
  polyline.addTo(map);
  markers.addTo(map);
  currentLayers.push(polyline, markers);
  map.fitBounds(polyline.getBounds());
}

function clearMap() {
  currentLayers.forEach((ly) => {
    map.removeLayer(ly);
  });
  currentLayers = [];
}

/****************************************
 * 12. DROPDOWN DE RUTAS
 ****************************************/
function setupDropdown() {
  const dd = document.getElementById('routeDropdown');
  if (!dd) return;
  dd.addEventListener('change', () => {
    const val = dd.value;
    if (val === 'all') showAllRoutes();
    else showRoute(val);
  });
}

/****************************************
 * 13. INICIALIZACIÓN DEL MAPA
 ****************************************/
function initMap() {
  map = L.map('map').setView([20.0090, -102.2800], 13);

  L.tileLayer(
    'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
    {
      attribution: '© Mapbox',
      id: 'mapbox/streets-v11',
      accessToken: 'pk.eyJ1IjoiaGFyY2luaWVnYSIsImEiOiJjbTdsZXprMXAwN3RrMmpva3BhNm4ybGRjIn0.HDOTpVsOSe4bwAFMdGVQXg'
    }
  ).addTo(map);

  initRoutes();
  setupDropdown();
  setupAutocomplete();

  // Botones
  const btnTrace = document.getElementById('btnTrace');
  if (btnTrace) {
    btnTrace.addEventListener('click', findBestRoute);
  }

  const btnUserToDest = document.getElementById('btnUserToDest');
  if (btnUserToDest) {
    btnUserToDest.addEventListener('click', findBestRouteFromMyLocationToDestination);
  }
}

/****************************************
 * 14. DOMContentLoaded
 ****************************************/
document.addEventListener('DOMContentLoaded', () => {
  initMap();
});
