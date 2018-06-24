// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic','ngCordova']);

app.controller('MapCtrl',MapCtrl);

function MapCtrl ($scope, $state, $cordovaGeolocation,$ionicLoading,$ionicPlatform) {

  var vm = this;
  var options = {timeout: 10000, enableHighAccuracy: true};
  vm.lat = 0;
  vm.lng = 0;
  var latLng = new google.maps.LatLng(vm.lat, vm.lng );
  var mapOptions = {
    center: latLng,
    zoom: 20,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  vm.map = new google.maps.Map(document.getElementById("map"), mapOptions);

  vm.getLocation = function(){
    $cordovaGeolocation.getCurrentPosition(options).then(function(position){
      console.log(position);

      vm.lat =  position.coords.latitude;
      vm.lng = position.coords.longitude;
      latLng = new google.maps.LatLng(vm.lat, vm.lng );
      mapOptions = {
        center: latLng,
        zoom: 20,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      vm.map = new google.maps.Map(document.getElementById("map"), mapOptions);

      google.maps.event.addListenerOnce(vm.map, 'idle', function(){

        var marker = new google.maps.Marker({
          map: vm.map,
          animation: google.maps.Animation.DROP,
          position: latLng
        });

        var geocoder = new google.maps.Geocoder;
        var infoWindow = new google.maps.InfoWindow;
        geocodeLatLng(geocoder,vm.lat,vm.lng, infoWindow, marker);

      });
    }, function(error){
      console.log("Could not get location");
    });
  };
  function geocodeLatLng(geocoder, latitude, longitude,infoWindow,marker) {
    var latlng = {lat: latitude, lng: longitude};
    geocoder.geocode({'location': latlng}, function(results, status) {
      if (status === 'OK') {
        if (results[0]) {
          infoWindow.setContent(results[0].formatted_address);
          infoWindow.open(map, marker);
          var address = document.getElementById("address");
          address.innerText = results[0].formatted_address;
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }
    });
  }

  var init = function() {
    vm.map = new google.maps.Map(document.getElementById("map"), mapOptions);
  };
  init();
}


app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});
