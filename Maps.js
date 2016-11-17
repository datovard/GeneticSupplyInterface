"use strict";
var app = angular.module('GeneticSupplyChain', []);

app.controller('MapNavigator', [ '$scope', '$compile', '$http', function( $scope, $compile, $http ) {
	$scope.map = null;
	$scope.markers = {};
	$scope.infowindows = {};
	$scope.actual = null;
	
	$scope.markerForm = function(){
		console.log($scope.markers);
		$scope.infowindows[$scope.actual].close();
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
		
		google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {	  
		  if (event.type == google.maps.drawing.OverlayType.MARKER) {
			event.overlay.addListener('click', function(event) {
				if( !( event in $scope.markers ) ){
					var name = "marker"+Object.keys($scope.markers).length;
					$scope.markers[event] = name;
					
					var contentString = '<div id="content">'+
											'<div id="siteNotice">'+
											'</div>'+
											'<h1 id="firstHeading" class="firstHeading">Uluru</h1>'+
											'<div id="bodyContent">'+
												'<form onsubmit="return false">'+
													'<input type="radio" name="tipos" id="tipoProveedor" value="tipoProveedor">Proveedor'+
													'<input type="radio" name="tipos" id="tipoPlanta" value="tipoPlanta">Planta<br />'+
													'<input type="radio" name="tipos" id="tipoDC" value="tipoDC">Centro de distribución'+
													'<input type="radio" name="tipos" id="tipoCliente" value="tipoCliente">Cliente<br />'+
													'<button type="submit" ng-click="markerForm()">Guardar</button>'+
												'</form>'+
												//'<button class="button button-clear button-positive" ng-click="clickTest()">Click Me</button>'+
											'</div>'+
										'</div>';

					var compiledContent = $compile(contentString)($scope);
					
					$scope.infowindows[name] = new google.maps.InfoWindow({
						content: compiledContent[0]
					});
					$scope.actual = name;
					$scope.infowindows[name].open($scope.map, this);
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