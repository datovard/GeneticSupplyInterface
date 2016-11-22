"use strict";
var app = angular.module('GeneticSupplyChain', []);

app.controller('MapNavigator', [ '$scope', '$compile', '$http', function( $scope, $compile, $http ) {
	$scope.map = null;
	$scope.markers = {};
	$scope.infowindows = {};
	$scope.infowindow = null;
	$scope.actual = null;
	$scope.tipos = {};
	$scope.tipo = null;
	
	$scope.nombre = null;
	$scope.oferta = null;
	$scope.costo = null;
	$scope.demanda = null;
	
	$scope.contentString = "";
	$scope.directionsDisplay = null;
	$scope.directionsService = new google.maps.DirectionsService();
	$scope.routes = {};
	$scope.area = "";
	
	
	$scope.primero = null;	
	
	$scope.markerTypeForm = function(){
		var name = $scope.actual;
		if( $scope.tipos[name] == null ) $scope.tipos[name] = [];
		$scope.tipos[name] = [$scope.tipo, $scope.oferta, $scope.costo, $scope.demanda, $scope.nombre];
		$scope.markers[name].setIcon('icons/'+$scope.tipo+'.png');
		$scope.infowindow.close();
	};
	
	$scope.borrarMarker = function(){
		var name = $scope.actual;
		$scope.markers[name].setMap(null);
		delete $scope.markers[name];
	};
	
	$scope.send = function(){
		console.log(JSON.stringify( $scope.routes ));
		var tipoProveedor = 0;
		var tipoPlanta = 0;
		var tipoDC = 0;
		var tipoCliente = 0;
		var resp = {};
		if( Object.keys($scope.tipos).length == 0 ){
			alert( "No hay nodos definidos" );
			return ;
		}
		for( var key in $scope.tipos ){
			if( $scope.tipos[key][0] == 'tipoCliente' && $scope.tipos[key][3] == null  ){
				alert( "Un nodo tipoCliente no posee demanda" );
				return ;
			}else if( $scope.tipos[key][0] != 'tipoCliente' && $scope.tipos[key][1] == null ){
				alert( "Un nodo "+$scope.tipos[key][0]+" no posee oferta" );
				return ;
			}else if( $scope.tipos[key][0] != 'tipoCliente' && $scope.tipos[key][2] == null  ){
				alert( "Un nodo "+$scope.tipos[key][0]+" no posee costo" );
				return ;
			}
		}
		
		if( Object.keys($scope.routes).length == 0 ){
			alert( "No hay rutas definidas" );
			return ;
		}
		resp["nodos"] = {};
		var names = {};
		for( var key in $scope.tipos ){
			var name = "";
			name = $scope.tipos[key][4];
			if( $scope.tipos[key][0] == 'tipoCliente' ){
				//name = 'tipoCliente'+(tipoCliente+1);
				tipoCliente++;
				resp["nodos"][name] = [ 'tipoCliente', { "demanda": $scope.tipos[key][3] } ];
			}else{
				if( $scope.tipos[key][0] == 'tipoProveedor' ){
					//name = $scope.tipos[key][0]+(tipoProveedor+1);
					tipoProveedor++;
				}else if( $scope.tipos[key][0] == 'tipoPlanta' ){
					//name = $scope.tipos[key][0]+(tipoPlanta+1);
					tipoPlanta++;
				}else if( $scope.tipos[key][0] == 'tipoDC' ){
					//name = $scope.tipos[key][0]+(tipoDC+1);
					tipoDC++;
				}
				resp["nodos"][name] = [ $scope.tipos[key][0], { "oferta": $scope.tipos[key][1], "costo": $scope.tipos[key][2] } ];
			}
			name = $scope.tipos[key][4];
			names[key] = name;
		}
		
		resp["rutas"] = {};
		for( var key in $scope.routes ){
			if( resp["rutas"][ names[key] ] == null ) resp["rutas"][ names[key] ] = {};
			for( var i = 0; i < $scope.routes[key].length; i++ ){
				
				if( !( names[$scope.routes[key][i][0]] in resp["rutas"][ names[key] ] )) 
					resp["rutas"][ names[key] ][ names[$scope.routes[key][i][0]] ] = 1;
				
				if( resp["rutas"][ names[$scope.routes[key][i][0]] ] == null ) resp["rutas"][ names[$scope.routes[key][i][0]] ] = {};
				
				if( !( names[ key ] in resp["rutas"][ names[$scope.routes[key][i][0]] ] )) 
					resp["rutas"][ names[$scope.routes[key][i][0]] ][ names[key] ] = 1;
			}
		}
		$scope.area = JSON.stringify( resp );
	}
	
	$scope.addNode = function(){
		alert("entar");
	}

	$scope.initMap = function () {
		$scope.directionsDisplay = new google.maps.DirectionsRenderer();
		
		$scope.map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: 4.637368, lng: -74.082643},
			zoom: 15,
		});
		
		$scope.directionsDisplay.setMap($scope.map);
		
		var drawingManager = new google.maps.drawing.DrawingManager({
			drawingMode: google.maps.drawing.OverlayType.CIRCLE,
			drawingControl: true,
			drawingControlOptions: {
				position: google.maps.ControlPosition.TOP_CENTER,
				drawingModes: [
					google.maps.drawing.OverlayType.MARKER			
				]
			},
			markerOptions: { icon: 'icons/marker.png' }
		});
		
		$scope.contentString = '<div id="content">'+
								'<div id="siteNotice">'+
								'</div>'+
								'<div id="bodyContent" class="form-group">'+
									'<form onsubmit="return false">'+
										'<div class="form-group bottom"><label for="nombre">Nombre:</label> <input type="text" class="form-control" ng-model="nombre" id="nombre"></div>'+
										'<div class="bottom"><div class="radio"><label class="radio-inline"><input type="radio" ng-model="tipo" ng-disabled="nombre==null" name="tipo" value="tipoProveedor">Proveedor</label></div>'+
										'<div class="radio"><label class="radio-inline"><input type="radio" ng-model="tipo" name="tipo" ng-disabled="nombre==null" value="tipoPlanta">Planta</label></div>'+
										'<div class="radio"><label class="radio-inline"><input type="radio" ng-model="tipo" name="tipo" ng-disabled="nombre==null" value="tipoDC">Centro de distribución</label></div>'+
										'<div class="radio"><label class="radio-inline"><input type="radio" ng-model="tipo" name="tipo" ng-disabled="nombre==null" value="tipoCliente">Cliente</label></div></div>'+
										'<div class="bottom"><div class="input-group">'+
											'<span class="input-group-addon"><i class="glyphicon glyphicon-usd"></i></span>'+
											'<input id="oferta" type="text" class="form-control" ng-model="oferta" ng-disabled="tipo==null || tipo==\'tipoCliente\'" name="oferta" placeholder="Oferta">'+
										'</div>'+
										'<div class="input-group">'+
											'<span class="input-group-addon"><i class="glyphicon glyphicon-usd"></i></span>'+
											'<input id="costo" type="text" class="form-control" ng-model="costo" ng-disabled="tipo==null || tipo==\'tipoCliente\'" name="costo" placeholder="Costo">'+
										'</div>'+
										'<div class="input-group">'+
											'<span class="input-group-addon"><i class="glyphicon glyphicon-usd"></i></span>'+
											'<input id="demanda" type="text" class="form-control" ng-model="demanda" ng-disabled="tipo==null || tipo!=\'tipoCliente\'" name="demanda" placeholder="Demanda">'+
										'</div></div>'+
										'<button type="submit" ng-click="markerTypeForm()">Guardar</button>'+
										'<button type="submit" ng-click="borrarMarker()">Borrar este punto</button>'+
									'</form>'+
								'</div>'+
							'</div>';

		var compiledContent = $compile($scope.contentString)($scope);
		
		$scope.infowindow = new google.maps.InfoWindow({
			content: compiledContent[0]
		});
		
		google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
		  if (event.type == google.maps.drawing.OverlayType.MARKER) {
			var marker = event.overlay;
			
			event.overlay.addListener('dblclick', function(event) {
				$scope.infowindow.close();
				var name = JSON.stringify(marker.position);
				if( $scope.tipos[name][0] != null ){
					if( $scope.primero == null ){
						$scope.primero = name;
						$scope.markers[$scope.primero].setIcon( "icons/"+$scope.tipos[$scope.primero][0]+"Red.png" );
					}else if( name != $scope.primero ){
						var puede= true;
						puede = ( ($scope.tipos[$scope.primero][0] == 'tipoProveedor' && $scope.tipos[name][0] == 'tipoPlanta') || ($scope.tipos[$scope.primero][0] == 'tipoPlanta' && $scope.tipos[name][0] == 'tipoProveedor')
									|| ($scope.tipos[$scope.primero][0] == 'tipoPlanta' && $scope.tipos[name][0] == 'tipoDC') || ($scope.tipos[$scope.primero][0] == 'tipoDC' && $scope.tipos[name][0] == 'tipoPlanta')	
									|| ($scope.tipos[$scope.primero][0] == 'tipoDC' && $scope.tipos[name][0] == 'tipoCliente') || ($scope.tipos[$scope.primero][0] == 'tipoCliente' && $scope.tipos[name][0] == 'tipoDC'))? true: false;
						
						if( puede ){
							if( $scope.routes[$scope.primero+"to"+name] == null && $scope.routes[name+"to"+$scope.primero] == null  ){
								var bounds = new google.maps.LatLngBounds();
								bounds.extend($scope.markers[$scope.primero].position);
								bounds.extend($scope.markers[name].position);
								$scope.map.fitBounds(bounds);
								var request = {
									origin: $scope.markers[$scope.primero].position,
									destination: $scope.markers[name].position,
									travelMode: google.maps.TravelMode.DRIVING,
									optimizeWaypoints: true,
									unitSystem: google.maps.UnitSystem.METRIC
								};
								$scope.directionsService.route(request, function (response, status) {
									if (status == google.maps.DirectionsStatus.OK) {
										var totalDistance = 0;
										var legs = response.routes[0].legs;
										for(var i=0; i< legs.length; ++i) {
											totalDistance += legs[i].distance.value;
										}
										$scope.directionsDisplay = new google.maps.DirectionsRenderer();
										$scope.directionsDisplay.setDirections(response);
										if( $scope.routes[$scope.primero] == null ) $scope.routes[$scope.primero] = [];
										//$scope.routes[ $scope.primero ].push([ name, response, totalDistance ]);
										$scope.routes[ $scope.primero ].push([ name, totalDistance ]);
										if( $scope.routes[name] == null ) $scope.routes[name] = [];
										//$scope.routes[ name ].push([ $scope.primero, response, totalDistance ]);
										$scope.routes[ name ].push([ $scope.primero, totalDistance ]);
										$scope.directionsDisplay.setMap($scope.map);
										$scope.markers[$scope.primero].setIcon( "icons/"+$scope.tipos[$scope.primero][0]+".png" );
										$scope.primero = null;
									} else {
										alert("Directions Request from " + start.toUrlValue(6) + " to " + end.toUrlValue(6) + " failed: " + status);
									}
								});
							}else{
								alert( "Esa ruta ya existe" );
								$scope.markers[$scope.primero].setIcon( "icons/"+$scope.tipos[$scope.primero][0]+".png" );
								$scope.primero = null;
							}
						}else{
							alert( "No es posible unir "+$scope.tipos[$scope.primero][0]+" con "+$scope.tipos[name][0] );
							$scope.markers[$scope.primero].setIcon( "icons/"+$scope.tipos[$scope.primero][0]+".png" );
							$scope.primero = null;
						}
					}
				}else{
					alert("No se ha definido la clase del sitio");
				}
			});
			
			event.overlay.addListener('click', function(event) {
				var name = JSON.stringify(marker.position);
				$scope.infowindow.close();
				console.log($scope.markers);
				if( !( name in $scope.markers ) ){
					$scope.markers[name] = marker;
					$scope.tipo = null;
					$scope.oferta = null;
					$scope.costo = null;
					$scope.demanda = null;
					$scope.nombre = null;
					$scope.actual = name;

					var compiledContent = $compile($scope.contentString)($scope);
					
					$scope.infowindows[name] = new google.maps.InfoWindow({
						content: compiledContent[0]
					});
					
					$scope.infowindow.open($scope.map, this);
				}else{
					$scope.actual = name;
					if( $scope.tipos[name] != null ){
						$scope.tipo = $scope.tipos[name][0];
						$scope.oferta = $scope.tipos[name][1];
						$scope.costo = $scope.tipos[name][2];
						$scope.demanda = $scope.tipos[name][3];
						$scope.nombre = $scope.tipos[name][4];
					}else{
						$scope.tipo = null;
						$scope.oferta = null;
						$scope.costo = null;
						$scope.demanda = null;
						$scope.nombre = null;
					}
					var compiledContent = $compile($scope.contentString)($scope);
		
					$scope.infowindow = new google.maps.InfoWindow({
						content: compiledContent[0]
					});
					
					$scope.infowindow.open($scope.map, this);
				}
			});
		  }
		});
		drawingManager.setMap($scope.map);
	};
	
	$scope.initMap();
}]);