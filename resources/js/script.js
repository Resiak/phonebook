var recent1 = initCookie("recent1");
var recent2 = initCookie("recent2");
var welcome = initCookie("welcome");

function initCookie(cookieName){

    if (document.cookie.indexOf(cookieName + "=") == -1){
        return "";
    }

    else {
        return getCookie(cookieName);
    }

}

function getCookie(cookieName){

    start=document.cookie.indexOf(cookieName + "=") + cookieName.length + 1;
    end=document.cookie.indexOf(";", start);

    if (end == -1){
        end = document.cookie.length;
    }
      
    cookieLength=end-start;
    return(document.cookie.substr(start,cookieLength));

}


function setRecent(mostRecentName){

    if(recent1!=mostRecentName){
        recent2=recent1;
        recent1=mostRecentName;
        document.cookie="recent1="+recent1;

        if (recent2.length >= 1){
            document.cookie="recent2="+recent2;
        }
    }
    document.getElementById("recent").style.display = "inline-block";
}

function getRecent(){

    if(recent2){
        document.getElementById("R1").innerHTML="<a id=\"anch_R1\" href=\"javascript:searchThis('anch_R1')\">"+getCookie("recent1")+"</a>";
        document.getElementById("R2").innerHTML="<a id=\"anch_R2\" href=\"javascript:searchThis('anch_R2')\">"+getCookie("recent2")+"</a>";
    } else if(recent1){
        document.getElementById("R1").innerHTML="<a id=\"anch_R1\" href=\"javascript:searchThis('anch_R1')\">"+getCookie("recent1")+"</a>";
    } else {
        document.getElementById("recent").style.display = "none";
    }
}

function delWelcome(){
    document.cookie="welcome=";
    location.reload();
}

function searchThis(id_value){
    document.getElementById("first").value = document.getElementById(id_value).innerHTML;
    sndReq();
}

var geocoder;
var map;
var marker;

function load() {

    getRecent();

    if(welcome==""){
        var user_name = window.prompt("Enter your name:","");
        document.cookie="welcome=" + user_name;
        document.getElementsByTagName("span")[0].innerHTML = document.getElementsByTagName("span")[2].innerHTML = user_name;
    } else {
        document.getElementsByTagName("span")[0].innerHTML = document.getElementsByTagName("span")[2].innerHTML = welcome;
    }
     
    geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(37.4419, -122.1419);
    var myOptions = {
        zoom: 13,
        center: latlng,
        streetViewControl: true,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP

    }
    map = new google.maps.Map(document.getElementById("mymap"), myOptions);
    checkHash();
    window.setInterval("checkHash()", 1000);
}


function showAddress(theName, theAddress, thePhone) {
    var myaddress = theAddress;
 
    if (geocoder) {
        geocoder.geocode( {
            'address': myaddress
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                map.setCenter(results[0].geometry.location);
          
                var contentString = '<div id="content">'+
                'Name: '+theName+'<br/>'+
                'Address: '+theAddress+'<br/>'+
                'Phone: '+thePhone+
                '</div>';

                var infowindow = new google.maps.InfoWindow({
                    content: contentString
                });

                var marker = new google.maps.Marker({
                    map: map, 
                    position: results[0].geometry.location
                });
          
                google.maps.event.addListener(marker, 'click', function() {
                    infowindow.open(map,marker);
                });
          
                document.getElementById("mymap").style.visibility = "visible";

            } else {
                alert("Geocode was not successful for the following reason: " + status);
            }
        });
    }
}

function createRequestObject() {
    var ro;
    var browser = navigator.appName;
    if(browser == "Microsoft Internet Explorer"){
        ro = new ActiveXObject("Microsoft.XMLHTTP");
    }else{
        ro = new XMLHttpRequest();
    }
    return ro;
}

var http = createRequestObject();

function sndReq() {
    http.open('get', 'data/phone_book.xml', true);
    http.onreadystatechange = handleResponse;
    http.send(null);
}

function handleResponse() {

    if(http.readyState == 4){

        document.getElementById("theName").innerHTML = "";
        document.getElementById("address").innerHTML = "";
        document.getElementById("phone").innerHTML = "";
        document.getElementById("email").innerHTML = "";
        document.getElementById("avatar").src = "";
        document.getElementById("avatar").alt = "";

        var searchLength = document.getElementById("first").value.length;
        var response = http.responseXML.documentElement;
        listings=response.getElementsByTagName("LISTING");
        toFind = document.getElementById("first").value;

        for (i=0;i<listings.length;i++) {

            firstobj = listings[i].getElementsByTagName("FIRST");
            lastobj = listings[i].getElementsByTagName("LAST"); 
            fullName = firstobj[0].firstChild.data + " " + lastobj[0].firstChild.data;         

            if (firstobj[0].firstChild.data.toLowerCase() == toFind.trim().toLowerCase() ||
                lastobj[0].firstChild.data.toLowerCase() == toFind.trim().toLowerCase() ||
                firstobj[0].firstChild.data.toLowerCase()+" "+lastobj[0].firstChild.data.toLowerCase() == toFind.trim().toLowerCase()){
           
                addressobj = listings[i].getElementsByTagName("ADDRESS");
                phoneobj = listings[i].getElementsByTagName("PHONE");
                emailobj = listings[i].getElementsByTagName("EMAIL");
                imageobj = listings[i].getElementsByTagName("IMAGE");
	      
                document.getElementById("theName").innerHTML = "<strong>"+fullName+"</strong>";
                document.getElementById("address").innerHTML = addressobj[0].firstChild.data;
                document.getElementById("phone").innerHTML = phoneobj[0].firstChild.data;
                document.getElementById("email").innerHTML = "<a href=\"mailto:"+emailobj[0].firstChild.data+"\"/>"+emailobj[0].firstChild.data+"</a>";
                document.getElementById("avatar").style.display = "block";
                document.getElementById("avatar").src = imageobj[0].firstChild.data;
                document.getElementById("avatar").alt = fullName;

                theAddress = addressobj[0].firstChild.data
                thePhone = phoneobj[0].firstChild.data
                showAddress(fullName, theAddress, thePhone)
              
                updateHistory(fullName)

                getRecent();
                setRecent(fullName);

            } else if ((firstobj[0].firstChild.data.substr(0, searchLength).toLowerCase() == toFind.toLowerCase() || 
                lastobj[0].firstChild.data.substr(0, searchLength).toLowerCase() == toFind.toLowerCase()) &&
            document.getElementById("first").value != '') {
                document.getElementById("theName").innerHTML  += "<a id=\"list"+i+"\" href=\"javascript:searchThis('list"+i+"')\">"+fullName+"</a><br/>";
                document.getElementById("mymap").style.visibility = "hidden";
                document.getElementById("avatar").style.display = "none";
            }
         
            if (document.getElementById("theName").innerHTML == "" && document.getElementById("first").value != '') {
                getRecent();
                document.getElementById("mymap").style.visibility = "hidden";
                document.getElementById("avatar").style.display = "none";
                document.getElementById("no_result").style.display = "block";
            } else document.getElementById("no_result").style.display = "none";

        }
    }
}

function checkHash () {
    if (window.location.hash) {
        var hashtext = window.location.hash.substring(1);
        if (hashtext != document.getElementById("histHelper").value) {
            document.getElementById("first").value = hashtext;
            document.getElementById("histHelper").value = hashtext;
            sndReq();
        }
    }
}

function updateHistory(newHash) {
    window.location.hash=newHash;
    document.getElementById("histHelper").value = newHash;
}