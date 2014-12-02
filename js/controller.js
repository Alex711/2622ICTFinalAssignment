var controller = {};
var facebook = {};
var view = {};

/*
 * Everything in here gets called when document is ready - enter key function, hiding of the specific divs, call the getAlbums / getPageDescription
 * button clicks etc
 * */
$(document).ready(function() {

    $('#searchText').keydown(function(event) {
        if (event.keyCode == 13) {
            facebook.searchObject();
            return false;
        }
    });
    $(".imagesArea").hide();
    $(".sortButtons").hide();
    $("#goBackButton").hide();
    $("#sideBarMenu").hide();
    $(".searchGroup").hide();
    facebook.getPageDescription(controller.displayDescriptioncallBack);
    facebook.getAlbums(controller.displayCallback);
});

/*
 * When the unlike button is clicked, it gets the image by its ID and then passes that to facebook.likePhoto method. w
 * */
$(document).on('click', '.btnDeleteID', function() {
    var photoID = $(this).closest(".images").find("img").attr("id");
    facebook.id = photoID;
    facebook.likePhoto(controller.displayLikesCallBack);

});

/*
 * This takes you back to the initial splash screen, hides all the necessary stuff; refreshes the photo array
 * (as in reloads it) the search would cull it)
 * */
$(document).on('click', '#btnGoBackID', function() {

    facebook.refreshPhotoCallback();
    facebook.sortSearchArray = false;
    $(".imagesArea").hide();
    $(".sortButtons").hide();
    $(".introPage").fadeIn();
    $(".searchGroup").hide();
    $("#airplaneCSS").show();
    $(".jumbotron").show();
    $("#searchText").val("");

});
/*
 *gets called when the user hits the view photos button. hides / fadesin/Out the necessary stuff
 * */
controller.fnReady = function() {
    $(".imagesArea").fadeIn();
    $(".sortButtons").fadeIn();
    $(".introPage").fadeOut();
    $(".searchGroup").fadeIn();
    $("#airplaneCSS").hide();
    $(".jumbotron").hide();

}

/*
 * This callback function relates to displaying all of the photos.
 * */
controller.displayCallback = function(displayPhotos) {
    view.displayPhotos(displayPhotos);

}

controller.displayUserName = function(username) {
    console.log("test");
    view.displayUserName(username);
}

/*
 * This callback relates to displaying the CSS Like animation
 * */
controller.displayLikesCallBack = function(id) {
    view.displayLiked(id);
}

/*
 * This callback displays the description when the page has loaded
 * */
controller.displayDescriptioncallBack = function(description) {
    view.displayDescription(description);
}

/*
 * Placed in a separate doc.ready down the bottom so it was easy to find and change
 * */
$(document).ready(function() {
    facebook.textInput = document.getElementById('#searchText');
    document.getElementById("btnView").onclick = controller.fnReady;
    document.getElementById("searchButton").onclick = facebook.searchObject;
    document.getElementById("btnSortDescID").onclick = facebook.sortArrayDescending;
    document.getElementById("fbLogoutID").onclick = facebook.logout;

});
