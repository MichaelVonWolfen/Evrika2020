$(window).resize(function() {
    if($(window).width() <= 1200)
    {
        $("#design_image").addClass("hide");
        // $("#logoID").addClass("hide");
    }
    else 
    {
        $("#design_image").removeClass("hide");
        // $("#logoID").removeClass("hide");
    }
});

$(document).ready(function(){
    $('.sidenav').sidenav();
});
