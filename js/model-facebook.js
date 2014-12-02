facebook.dmsTravelID = 815157038515764;
facebook.photos = new Array(); //photos array
facebook.usertoken; //facebook auth token
facebook.username; //username
facebook.heronAlbumID; //heronAlbumID
facebook.albumIDArray = new Array(); //array of album ID's
facebook.displayCallback; //main displaycallback
facebook.displayLikesCallBack; //callback for displaying CSS lieks
facebook.id; // facebook app_scope id
facebook.foundPhotoArray; //search results array
facebook.displayDescriptioncallBack; //display page description on load
facebook.description; //actual facebook description
facebook.getPhotosCount = 0; //counter
facebook.likeSuccess = false; //whether liked/not
facebook.sortSearchArray;
facebook.displayUserName;

/*This sets the data for the typeahead textbox and updates it etc.
 * source : source data
 * updater is the selected data
 * matcher - gets the selected data from updater and matches it to the initial data
 * highlighter - highlights.
 * */
$(document).ready(function() {

    $('#searchText').typeahead({
        source: function (query, process) {

            descriptions = [];
            map = {};
            var data = facebook.photos;
            //facebook.photos = facebook.entirePhotoArray;
            $.each(data, function (i, state) {
                map[state.description] = state;
                descriptions.push(state.description);

            });
            process(descriptions);
        },
        updater: function (item) {
            var selectedDescription = map[item].description;

            return item;
        },
        matcher: function (item) {
            if (item.toLowerCase().indexOf(this.query.trim().toLowerCase()) != -1) {
                return true;

            }
        },
        sorter: function (items) {
            console.log(items.sort());
            return items.sort();
        },
        highlighter: function (item) {
            var regex = new RegExp('(' + this.query + ')', 'gi');
            return item.replace(regex, "<strong>$1</strong>");
        }
    });
});

//This gets the page description. and sets it to the callback which in turn updates the view.
facebook.getPageDescription = function (displayDescriptioncallBack) {

    facebook.displayDescriptioncallBack = displayDescriptioncallBack;
    var descriptionURL = "https://graph.facebook.com/815157038515764";
    $.get(descriptionURL, function (data) {
        facebook.description = data.description;
        facebook.displayDescriptioncallBack(data.description);

    });
}

/*This the first important photo function #1
 * Gets the DMS Travel album object via its ID.
 * Then iterates over the object and retrieves every photo album that is not a profile picture album or Cover Photo
 * and assigns the ID and name of album to an albumsObject, which then gets pushed into an albumIDArray
 * */

facebook.getAlbums = function (displayCallback) {
    facebook.displayCallback = displayCallback;
    var albumsURL = "https://graph.facebook.com/v1.0/815157038515764/albums";

    $.get(albumsURL, function (data) {
        var albumsObject = {id: "", name:""};
        var arrayLength = data.data.length;

        for (var i = 0; i < arrayLength; i++) {
            if (data.data[i].name === 'Profile Pictures' || data.data[i].name === 'Cover Photos') {
                albumsObject = {id:null, name:"Do Not Want"};

            } else {
                albumsObject = {id:data.data[i].id, name:data.data[i].name};
            }

            if (albumsObject.id != null) {
                facebook.albumIDArray.push(albumsObject);
            }

        }
        facebook.getAlbumPhotos();
    });
}

/* This is the second function in the process.
 * This iterates over all of the album ID's in the albumIDArray, (using the ID in the URL)
 * and retrieves all of the photos from each album with height/witdh of 320x320.
 * IMPORTANT:IF THE PROPERTY ACTUALLY HAS LIKES, IT GETS ADDED. SINCE FACEBOOK CUTS DATA BY NOT SENDING EMPTY STUFF.
 *
 * IMPORTANT: If the description = null; no description.
 * Then pushes the albumPhotoObject (all of the photo details as well as the largeURL into facebook.photos
 * */

//Gets the photos from requested albums.
facebook.getAlbumPhotos = function () {

    for (var num = 0; num < facebook.albumIDArray.length; num++) {
        var albumPhotosURL = "https://graph.facebook.com/v1.0/" + facebook.albumIDArray[num].id + "/photos";

        $.get(albumPhotosURL, function (data) {
            var albumPhotoObject = {thumbnail: "", description: "", likes: "", id:"", largeURL: ""};

            for (var x = 0; x < data.data.length; x++) {

                for (var j = 0; j < data.data[x].images.length; j++) {

                    if (data.data[x].images[j].source.indexOf("320x320") > -1) {

                        if (data.data[x].hasOwnProperty("likes")) {

                            albumPhotoObject = {thumbnail: data.data[x].images[j].source, description: data.data[x].name,likes: data.data[x].likes.data.length, id: data.data[x].id, largeURL:data.data[x].images[0].source};
                        } else {

                            albumPhotoObject = {thumbnail: data.data[x].images[j].source, description: data.data[x].name,likes: 0, id: data.data[x].id, largeURL:data.data[x].images[0].source};
                        }
                        if (albumPhotoObject.description == null) {
                            albumPhotoObject.description = "No Description";
                        } else {
                        }

                        facebook.photos.push(albumPhotoObject);
                    }
                }
            }
            //view gets updated with facebook.photos array
            facebook.displayCallback(facebook.photos);
        });
    }
}

/*              This is the big like function:
 * facebook.id is the ID of the photo that gets selected (gets the closest image attribute on click (image has id)
 * and then gets the object that contains who has liked the image, if anyone.
 * IMPORTANT: IF THE IMAGE HAS NO LIKES... LENGTH OF RETURNED OBJECT =0; THEREFORE AUTO LIKE.
 * After that; sets dataEmpty to true/false; if false - checks:
 * IF THE USERNAME === name in array; unlike; calls unlikePhoto
 * ELSE calls incrementLikeCounter; (increments likeCounter )
 *
 * */
facebook.likePhoto = function (displayLikesCallBack) {
    facebook.displayLikesCallBack = displayLikesCallBack;
    id = facebook.id; //id = id of the photo that we're checking / going to like/unlike

    var likesURL = "http://graph.facebook.com/" + facebook.id + "/likes";
    var dataEmpty = false;
    $.get(likesURL, function (photoLikes) {
        //checks how many likes / who has liked the photo by the ID, and then if the length of photo is = 0
        //it automatically likes it.. since if its 0.. hasnt been liked before and sets dataEmpty to true,
        //Letting me know that the data was empty and to stop executing the rest of the like stuff.
        //The var position stuff does the css like stuff by the div ID. (double check position in array = id etc

        if (photoLikes.data.length == 0) {
            console.log("incremenenting data due to data.data.length == 0");
            facebook.incrementLikeCounter(id);
            var testGetDiv = document.getElementById(facebook.id);
            /*should probably just put all this code in the incrementLikeCounter you boffin*/
            if (id === testGetDiv.id) {
                var position = facebook.getPosition(facebook.id);
                console.log("position variable " + position);
                facebook.displayLikesCallBack(position);
            }
            dataEmpty = true;
        }

        if (dataEmpty === true) {
        } else {

            var foundInArray = false;
            //Iterates through the photo like data, and if the users name = name in the like, then
            for (var i = 0; i < photoLikes.data.length; i++) {
                if (photoLikes.data[i].name === facebook.username) {
                    alert("You have already liked this photo. Unliked");
                    foundInArray = true;
                    facebook.unlikePhoto(id);

                    break;
                }
            }

            if (foundInArray === false) {

                facebook.incrementLikeCounter(facebook.id);

            }
        }
    });
}

/*
 * Likes Photo with a ajax request (better control over success/fail etc.
 * if success - like the photo; then displaycallBack for the css like on the position
 * On Error: call the fb.login function and get the user to login, updating the facebook.usertoken.
 * */
facebook.incrementLikeCounter = function (objectID) {
    var likeURL = "https://graph.facebook.com/" + objectID + "/likes?access_token=" + facebook.usertoken;
    $.ajax({
        url: likeURL,
        type: 'POST',
        statusCode: {
            400:function(response) {
                console.log("test");
            }
        },
        success: function (result) {
            console.log("liked");
            for (var i = 0; i < facebook.photos.length; i++) {
                if (facebook.photos[i].id == objectID) {

                    facebook.photos[i].likes = facebook.photos[i].likes + 1;
                    facebook.displayCallback(facebook.photos);

                    var testGetDiv = document.getElementById(facebook.id);
                    if (facebook.id === testGetDiv.id) {
                        var position = facebook.getPosition(facebook.id);
                        console.log("position variable " + position);
                        facebook.displayLikesCallBack(position);
                    }
                }
            }
        },
        //call fb.login - update usertoken -
        error: function(result) {
            console.log("failed");
            alert("you need to be logged in. If the popup is blocked, please unblock it and login");
//            FB.login(function(response) {
//                console.log(response);
//            }, {scope: 'public_profile,email, publish_actions' });

            FB.login(function (response) {
                if (response.authResponse) {
                    console.log('Welcome!  Fetching your information.... ');
                    FB.api('/me', function (response) {
                        console.log('Good to see you, ' + response.name + '.');
                        facebook.username = response.name;
                        checkLoginState();
                    });
                } else {
                    console.log('User cancelled login or did not fully authorize.');
                }
            });
        }
    });
}

/*Unlikes photo using DELETE - gets id and -1 from the like to update counter as its local.
 *
 * */

facebook.unlikePhoto = function (objectID) {
    var likeURL = "https://graph.facebook.com/" + objectID + "/likes?access_token=" + facebook.usertoken;

    $.ajax({
        url: likeURL,
        type: 'DELETE',
        success: function(result) {
            console.log("unliked");
            if (facebook.username != undefined) {
                for (var i = 0; i < facebook.photos.length; i++) {
                    if (facebook.photos[i].id == objectID) {

                        facebook.photos[i].likes = facebook.photos[i].likes - 1;
                        facebook.displayCallback(facebook.photos);
                    }
                }
            }
        }
    });
}

/*gets the position of the actual element (the div id for the css) just to double check we're updating the correct one.*/
facebook.getPosition = function(elementFind) {
    var element = elementFind;

    for (var x = 0; x < facebook.photos.length; x++) {
        if (facebook.photos[x].id === element) {
            return x;
        }
    }
}

/*Search function: removes white space, converts to lower case etc. if -1 = not found
 else : Pushes whatever photos are found into the foundPhotos and then displays that. through the callback (passes a different array
 to display)
 * */
facebook.searchObject = function () {

    var str = $("#searchText").val();
    var strTrim = str.trim().toLowerCase();
    var foundPhotos = [];
    for (var i = 0; i < facebook.photos.length; i++) {

        //-1 means not found.
        //gets the description and converts to lowercase, and then checks it compared to the user input.
        if (facebook.photos[i].description.toLowerCase().indexOf(strTrim) != -1) {
            foundPhotos.push(facebook.photos[i]);

        }
    }
    facebook.foundPhotoArray = foundPhotos;
    facebook.sortSearchArray = true;
    facebook.displayCallback(facebook.foundPhotoArray);

}
/*Sorts array descending - if a-likes is less than -b likes then sort. higher less than lower. 1-10
 * */
facebook.sortArrayAscending = function () {
    var byLikes = facebook.photos.slice(0);
    byLikes.sort(function(a,b) {
        return a.likes - b.likes;
    });
    console.log('by likes asc:');
    console.log(byLikes);
    facebook.photos = byLikes;
    facebook.displayCallback(byLikes);

}
/*Sorts descending - 10 down to 1. if -b less than a etc.
 if true - that means search has been conducted therefore only takes the search array.
 * */
facebook.sortArrayDescending = function () {
    if (facebook.sortSearchArray === true) {
        var byLikes = facebook.foundPhotoArray.slice(0);

    }  else {
        var byLikes = facebook.photos.slice(0);
    }
    byLikes.sort(function(a,b) {
        return b.likes - a.likes;
    });
    console.log('by likes desc:');
    facebook.sortSearchArray = false;
    facebook.displayCallback(byLikes);
}

//resends the entire facebook.photos array - i.e. in case of user search; array gets cut down; re-sends ENTIRE array
facebook.refreshPhotoCallback = function () {
    facebook.displayCallback(facebook.photos);

}

/*logout function - logs the user out and hides the logout button and shows login etc.
 * */
facebook.logout = function(){
    console.log("test");
    FB.logout(function (response) {
        console.log("user has been logged out");
        document.getElementById('status').innerHTML =
            'You have been logged out,  ';
        $("#btnLogin").show();
        $("#fbLogout").hide();
        $("#loginName").hide();
    });
}

// This is called with the results from from FB.getLoginStatus().
function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
        facebook.usertoken = response.authResponse.accessToken;
        console.log(facebook.usertoken);
        // Logged into your app and Facebook.
        testAPI();
    } else if (response.status === 'not_authorized') {
        // The person is logged into Facebook, but not your app.
        document.getElementById('status').innerHTML = 'Please log ' +
            'into this app.';
    } else if (response.status === "unknown") {
        $("#fbLogout").hide();

    } else {
        // The person is not logged into Facebook, so we're not sure if
        // they are logged into this app or not.
        document.getElementById('status').innerHTML = 'Please log ' +
            'into Facebook.';
        console.log("test");
    }
}

// This function is called when someone finishes with the Login
// Button.  See the onlogin handler attached to it in the sample
// code below.
function checkLoginState() {
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
}

window.fbAsyncInit = function() {
    FB.init({
        appId      : 796115627101259,
        cookie     : true,  // enable cookies to allow the server to access
        // the session
        xfbml      : true,  // parse social plugins on this page
        version    : 'v2.1' // use version 2.1
    });

    // Now that we've initialized the JavaScript SDK, we call
    // FB.getLoginStatus().  This function gets the state of the
    // person visiting this page and can return one of three states to
    // the callback you provide.  They can be:
    //
    // 1. Logged into your app ('connected')
    // 2. Logged into Facebook, but not your app ('not_authorized')
    // 3. Not logged into Facebook and can't tell if they are logged into
    //    your app or not.
    //
    // These three cases are handled in the callback function.

    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });

};
// Load the SDK asynchronously
(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// Here we run a very simple test of the Graph API after login is
// successful.  See statusChangeCallback() for when this call is made.
function testAPI() {

    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
        console.log('Successful login for: ' + response.name);
        document.getElementById('loginName').innerHTML = "Logged in as " + response.name;
        facebook.username = response.name;

        $("#btnLogin").hide();
        $("#fbLogout").show();
    });
}
//set up / call the displayUsername callback
facebook.displayUserNameView = function(displayUserName) {
    facebook.displayUserName = displayUserName;
    facebook.displayUserName(facebook.username);
}


