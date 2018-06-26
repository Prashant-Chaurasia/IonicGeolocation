// Ionic Starter App

var app = angular.module('starter', ['ionic','ngCordova']);

app.controller('MapCtrl',MapCtrl);

function MapCtrl ($rootScope, $scope, $state,$interval, $cordovaGeolocation,$cordovaLocalNotification, $ionicLoading,$ionicPlatform) {

  var vm = this;
  var start_coordinate = [];
  var end_coordinate = [];
  var lat = 27 ,lng = 70;
  var options = {timeout: 10000, enableHighAccuracy: true};
  var latLng = new google.maps.LatLng(lat, lng );
  vm.mapOptions = {
    center: latLng,
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  vm.startJourney = function () {
    getLocation("start");
    sendNotifications();
  };

  vm.endJourney = function () {
    getLocation("end");
  };

  var setStartLocation = function (state) {
    lat = localStorage.getItem('start_coord_lat');
    lng = localStorage.getItem('start_coord_lng');
    latLng = new google.maps.LatLng(lat ,lng);
    vm.mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    vm.map = new google.maps.Map(document.getElementById("map"), vm.mapOptions);
    google.maps.event.addListenerOnce(vm.map, 'idle', function() {
      var marker = new google.maps.Marker({
        map: vm.map,
        animation: google.maps.Animation.DROP,
        position: latLng
      });
      var geocoder = new google.maps.Geocoder;
      var infoWindow = new google.maps.InfoWindow;
      geocodeLatLng($scope, geocoder, lat, lng, infoWindow, marker, start);
    });
  };
  var getLocation = function(state){
    $cordovaGeolocation.getCurrentPosition(options).then(function(position){

      if(state === 'start') {
        start_coordinate = position;
        console.log(position.coords.latitude);
        localStorage.setItem("start_coord_lat",position.coords.latitude);
        localStorage.setItem("start_coord_lng",position.coords.longitude);
      } else {
        end_coordinate = position;
      }

      lat =  position.coords.latitude;
      lng = position.coords.longitude;
      latLng = new google.maps.LatLng(lat, lng );

      vm.mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      vm.map = new google.maps.Map(document.getElementById("map"), vm.mapOptions);
      google.maps.event.addListenerOnce(vm.map, 'idle', function(){
        var marker = new google.maps.Marker({
          map: vm.map,
          animation: google.maps.Animation.DROP,
          position: latLng
        });
        var geocoder = new google.maps.Geocoder;
        var infoWindow = new google.maps.InfoWindow;
        geocodeLatLng($scope,geocoder,lat,lng, infoWindow, marker,state);
      });

    }, function(error){
      console.log("Could not get location");
    });
  };


  function geocodeLatLng($scope, geocoder, latitude, longitude, infoWindow, marker, state) {
    var latlng = {lat: latitude, lng: longitude};
    geocoder.geocode({'location': latlng}, function(results, status) {
      if (status === 'OK') {

        if (results[0]) {
          infoWindow.setContent(results[0].formatted_address);
          infoWindow.open(map, marker);
          var distance = -1;

          if (state === 'start') {
            vm.st_journey = results[0].formatted_address;
            $scope.$apply();
          } else if (state === 'end') {
            vm.en_journey = results[0].formatted_address;
            $scope.$apply();
            console.log(start_coordinate);
            console.log(end_coordinate);
            if(start_coordinate !== null) {
              var s_latLng = new google.maps.LatLng(start_coordinate.coords.latitude,start_coordinate.coords.longitude );
            } else {
              var s_latLng = new google.maps.LatLng
            }

            var e_latLng = new google.maps.LatLng(end_coordinate.coords.latitude,end_coordinate.coords.longitude );
            getDistance(s_latLng,e_latLng);
          }

        } else {
          window.alert('No results found');
        }

      } else {
        window.alert('Geocoder failed due to: ' + status);
      }
    });
  }


  var sendNotifications = function(){
    $cordovaLocalNotification.schedule({
      id: 1,
      title: "Fyle - You're on your way",
      text: 'Touch here to end your journey',
      data: {
        customProperty: 'custom value'
      }
    }).then(function (result) {
      console.log(result);
    });
  };


  //Code to calculate the distance between two points ---------------------------
  var rad = function(x) {
    return x * Math.PI / 180;
  };

  var getDistance = function(p1, p2) {
    var R = 6378137; // Earth’s mean radius in meter
    var dLat = rad(p2.lat() - p1.lat());
    var dLong = rad(p2.lng() - p1.lng());
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
      Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    vm.distance = d;
    console.log(vm.distance);
    $scope.$apply();
  };
  // ------------------------------------------------------------------------------

  $rootScope.$on('$cordovaLocalNotification:click',
    function (event, notification, state) {
      vm.endJourney();
  });

  var init = function() {
    vm.lat = 0;
    vm.lng = 0;
    vm.distance = -1;

    if(localStorage.getItem("start_coord_lat") !== null && localStorage.getItem("start_coord_lat") !== ""){
     setStartLocation();
    }
    else{
      vm.map = new google.maps.Map(document.getElementById("map"), vm.mapOptions);
    }

  };
  init();
}

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});
