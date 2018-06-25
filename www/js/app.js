// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic','ngCordova']);

app.controller('MapCtrl',MapCtrl);

function MapCtrl ($rootScope, $scope, $state, $cordovaGeolocation,$cordovaLocalNotification, $ionicLoading,$ionicPlatform) {

  var vm = this;
  var start_coordinate = [];
  var end_coordinate = [];
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
  var markers = [];
  vm.startJourney = function () {
    getLocation("start");
    sendNotifications();
  };

  vm.endJourney = function () {
    getLocation("end");
  };

  var getLocation = function(state){
    $cordovaGeolocation.getCurrentPosition(options).then(function(position){
      if(state === 'start'){
        start_coordinate = position;
        console.log(start_coordinate);
      }else{
        end_coordinate = position;
      }
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
        geocodeLatLng($scope,geocoder,vm.lat,vm.lng, infoWindow, marker,state);
      });
    }, function(error){
      console.log("Could not get location");
    });
  };
  function geocodeLatLng($scope, geocoder, latitude, longitude,infoWindow,marker, state) {
    var latlng = {lat: latitude, lng: longitude};
    geocoder.geocode({'location': latlng}, function(results, status) {
      if (status === 'OK') {
        if (results[0]) {
          infoWindow.setContent(results[0].formatted_address);
          infoWindow.open(map, marker);
          var distance = -1;
          if(state === 'start'){
            var address1 = document.getElementById("st_address");
            address1.innerText = results[0].formatted_address;
          }
          else{
            var address2 = document.getElementById("en_address");
            address2.innerText = results[0].formatted_address;
            console.log(start_coordinate);
            console.log(end_coordinate);
            var s_latLng = new google.maps.LatLng(start_coordinate.coords.latitude,start_coordinate.coords.longitude );
            var e_latLng = new google.maps.LatLng(end_coordinate.coords.latitude,end_coordinate.coords.longitude );
            console.log(distance = getDistance(s_latLng,e_latLng));
          }
          vm.distance = "To be calculated";
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
    return d; // returns the distance in meter
  };

  $rootScope.$on('$cordovaLocalNotification:click',
    function (event, notification, state) {
      // ...
      // console.log(event);
      // console.log(notification);
      // console.log(state);
      // console.log("hello world");
      vm.endJourney();
    });

  var init = function() {
    vm.distance = 0.0;
    vm.map = new google.maps.Map(document.getElementById("map"), mapOptions);
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
    // window.plugin.notification.local.onadd = function (id, state, json) {
    //   var notification = {
    //     id: id,
    //     state: state,
    //     json: json
    //   };
    //   $timeout(function() {
    //     $rootScope.$broadcast("$cordovaLocalNotification:added", notification);
    //   });
    // };
  });
});
