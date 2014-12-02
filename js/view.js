/**
 * Created by Alex on 13/10/2014.
 */

/*
 * This callback displays all of the photos with the url's etc.
 * */
view.displayPhotos = function (displayPhotos) {

    var thumbElement = document.getElementsByTagName('figure');

    var htmlStr = "";
    for (var i = 0; i < displayPhotos.length; i++) {

        htmlStr += '<div class="images"><div class="grow"><div id=' + displayPhotos[i].id + '<figure> <a href="' + displayPhotos[i].largeURL +
            '" data-lightbox="images" data-title=' + displayPhotos[i].description + '><img src=' + displayPhotos[i].thumbnail + ' ' +
            'alt=”Photo” id=' + displayPhotos[i].id + ' width=150 height=150></a><figcaption>' + displayPhotos[i].description +
            "<br> total likes " + displayPhotos[i].likes +
            "<div class='btnDelete'><input type='image' src='logos/LikeButton.png' class='btnDeleteID'></div>" + ' </figcaption></figure></div></div></div>';

    }
    var images = document.getElementsByClassName("imagesArea")[0];//classname returns multiple values; therefore need to
    //get at the index desired.
    images.innerHTML = htmlStr;

}

/*
 * This displays the CSS Like animation; when liked etc as well as the logo.
 * */
view.displayLiked = function (position) {

    var element =  document.getElementsByClassName("images");
    element[position].innerHTML += '<div class="img2"><img src="logos/facebook-like-button.jpg" height="100" width="100"/></div>';
    var elementstyle = document.getElementsByClassName("images");
    elementstyle[position].style.borderStyle = "solid";
    elementstyle[position].style.borderColor = "#0099FF";

}
/*
 * this displays the page description on load.
 * */
view.displayDescription = function (description) {
    $(".dmsDescription").html(description);
    $("#aboutDescription").html(description);


}

//displays the username (from the testAPI() response
view.displayUserName = function (username) {
    document.getElementById('loginName').innerHTML = "Logged in as " + username;

}



