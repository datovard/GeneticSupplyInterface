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
	
	$scope.first = null;
	$scope.second = null;
	
	$scope.markerForm = function(){
		var name = $scope.actual;
		$scope.tipos[name] = $scope.tipo;
		console.log($scope.markers[name]);
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
		
		$scope.directionsDisplay.setMap(map);
		
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
				alert('llega');
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
					console.log($scope.tipo);
					
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