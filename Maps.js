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
	
	$scope.markerForm = function(){
		//console.log($scope.markers);
		//console.log($scope.tipos);
		var name = $scope.actual;
		$scope.tipos[name] = $scope.tipo;
		//$scope.infowindows[name].close();
		$scope.infowindow.close();
	};

	$scope.clickTest = function() {
        console.log($scope.markers);
		$scope.infowindows[$scope.actual].close();
    };


	$scope.initMap = function () {
		$scope.map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: 4.637368, lng: -74.082643},
			zoom: 15,
		});
		
		var drawingManager = new google.maps.drawing.DrawingManager({
			drawingMode: google.maps.drawing.OverlayType.CIRCLE,
			drawingControl: true,
			drawingControlOptions: {
				position: google.maps.ControlPosition.TOP_CENTER,
				drawingModes: [
					google.maps.drawing.OverlayType.MARKER			
				]
			},
			markerOptions: { 
				draggable : true,
			}
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
									'</form>'+
									//'<button class="button button-clear button-positive" ng-click="clickTest()">Click Me</button>'+
								'</div>'+
							'</div>';

		var compiledContent = $compile($scope.contentString)($scope);
		
		$scope.infowindow = new google.maps.InfoWindow({
			content: compiledContent[0]
		});
		
		google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {	  
		  if (event.type == google.maps.drawing.OverlayType.MARKER) {
			event.overlay.addListener('click', function(event) {
				var name = JSON.stringify(event.latLng);
				$scope.infowindow.close();
				if( !( name in $scope.markers ) ){
					$scope.markers[name] = event;
					$scope.tipo = null;
					$scope.actual = name;
					var contentString = '<div id="content">'+
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
												'</form>'+
												//'<button class="button button-clear button-positive" ng-click="clickTest()">Click Me</button>'+
											'</div>'+
										'</div>';

					var compiledContent = $compile($scope.contentString)($scope);
					
					$scope.infowindows[name] = new google.maps.InfoWindow({
						content: compiledContent[0]
					});
					//$scope.infowindows[name].open($scope.map, this);
					$scope.infowindow.open($scope.map, this);
				}else{
					$scope.actual = name;
					$scope.tipo = $scope.tipos[name];
					console.log($scope.tipo);
					
					var compiledContent = $compile($scope.contentString)($scope);
		
					$scope.infowindow = new google.maps.InfoWindow({
						content: compiledContent[0]
					});
					
					//$scope.infowindows[name].open($scope.map, this);
					$scope.infowindow.open($scope.map, this);
				}
			});
			
		  }
		});
		drawingManager.setMap($scope.map);
	};
	
	$scope.initMap();
}]);

/*function markerForm( event ){
	console.log(markers);
	console.log(event.target.parentNode.childNodes[0].checked );
	event.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.childNodes[2].click();
}*/