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
	$scope.contentString = "";
	$scope.directionsDisplay = null;
	$scope.directionsService = new google.maps.DirectionsService();
	$scope.routes = {};
	
	$scope.primero = null;	
	
	$scope.markerForm = function(){
		var name = $scope.actual;
		$scope.tipos[name] = $scope.tipo;
		$scope.markers[name].setIcon('Icons/'+$scope.tipo+'.png');
		$scope.infowindow.close();
	};
	
	$scope.borrarMarker = function(){
		var name = $scope.actual;
		$scope.markers[name].setMap(null);
		delete $scope.markers[name];
	};

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
			markerOptions: { icon: 'Icons/marker.png' }
		});
		
		$scope.contentString = '<div id="content">'+
								'<div id="siteNotice">'+
								'</div>'+
								'<h1 id="firstHeading" class="firstHeading">Uluru</h1>'+
								'<div id="bodyContent">'+
									'<form onsubmit="return false">'+
										'<input type="radio" ng-model="tipo" value="tipoProveedor">Proveedor'+
										'<input type="radio" ng-model="tipo" value="tipoPlanta">Planta<br />'+
										'<input type="radio" ng-model="tipo" value="tipoDC">Centro de distribución'+
										'<input type="radio" ng-model="tipo" value="tipoCliente">Cliente<br />'+
										'<button type="submit" ng-click="markerForm()">Guardar</button>'+
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
				if( $scope.tipos[name] != null ){
					if( $scope.primero == null ){
						$scope.primero = name;
						$scope.markers[$scope.primero].setIcon( "Icons/"+$scope.tipos[$scope.primero]+"Red.png" );
					}else if( name != $scope.primero ){
						var puede= true;
						puede = ( ($scope.tipos[$scope.primero] == 'tipoProveedor' && $scope.tipos[name] == 'tipoPlanta') || ($scope.tipos[$scope.primero] == 'tipoPlanta' && $scope.tipos[name] == 'tipoProveedor')
									|| ($scope.tipos[$scope.primero] == 'tipoPlanta' && $scope.tipos[name] == 'tipoDC') || ($scope.tipos[$scope.primero] == 'tipoDC' && $scope.tipos[name] == 'tipoPlanta')	
									|| ($scope.tipos[$scope.primero] == 'tipoDC' && $scope.tipos[name] == 'tipoCliente') || ($scope.tipos[$scope.primero] == 'tipoCliente' && $scope.tipos[name] == 'tipoDC'))? true: false;
						
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
										$scope.routes[ $scope.primero ].push([ name, response, totalDistance ]);
										if( $scope.routes[name] == null ) $scope.routes[name] = [];
										$scope.routes[ name ].push([ $scope.primero, response, totalDistance ]);
										$scope.directionsDisplay.setMap($scope.map);
										$scope.markers[$scope.primero].setIcon( "Icons/"+$scope.tipos[$scope.primero]+".png" );
										$scope.primero = null;
									} else {
										alert("Directions Request from " + start.toUrlValue(6) + " to " + end.toUrlValue(6) + " failed: " + status);
									}
								});
								console.log($scope.routes);
							}else{
								alert( "Esa ruta ya existe" );
								$scope.markers[$scope.primero].setIcon( "Icons/"+$scope.tipos[$scope.primero]+".png" );
								$scope.primero = null;
							}
						}else{
							alert( "No es posible unir "+$scope.tipos[$scope.primero]+" con "+$scope.tipos[name] );
							$scope.markers[$scope.primero].setIcon( "Icons/"+$scope.tipos[$scope.primero]+".png" );
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
				if( !( name in $scope.markers ) ){
					$scope.markers[name] = marker;
					$scope.tipo = null;
					$scope.actual = name;

					var compiledContent = $compile($scope.contentString)($scope);
					
					$scope.infowindows[name] = new google.maps.InfoWindow({
						content: compiledContent[0]
					});
					
					$scope.infowindow.open($scope.map, this);
				}else{
					$scope.actual = name;
					$scope.tipo = $scope.tipos[name];
					
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