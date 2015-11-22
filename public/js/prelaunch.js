
//sorry for the mess
var current_index = 0, 
    index, 
    menu, 
    menu_items_count, 
    mouse_down, 
    mouse_start_y, 
    pull_step, 
    total_pull = 80, 
    release = 40,
    pull_release = total_pull + release;

$(document).on('selectstart', false);

$(document).ready(function(){
  $("#menu li").each(function(i,e){
    $(this).attr("data-index",i) 
  });
  
  //
  menu = $("#menu").html();
  menu_items_count = $("#menu li").length;
  pull_step = total_pull/(menu_items_count-1);
  //
  

  $("#menu").css("transform","translate3d("+getItemX(0)+"px,0,0)");
  $("#menu li").removeClass("show");
  $("#menu li").eq(0).addClass("show");
});

$("#header").mousedown(function(e){
  
  //
  mouse_down = true;
  mouse_start_y = e.pageY;
  //
  
  if(index == menu_items_count-1) {
    index = 0;
  } else {
    var $item = $("#menu li").eq(index);
    $("#menu").html(menu);
    $("#menu li").eq($item.attr("data-index")).remove();
    $item.prependTo($("#menu"));
    $("#menu li").eq(0).addClass("show");
    $("#menu").addClass("notrans");
    $("#menu").css("transform","translate3d("+getItemX(0)+"px,0,0)");
    }
});

$(document).mouseup(function(e){
  if(mouse_down) {
  //
  mouse_down = false;
  $("#header").animate({height: 46},300);
  $("#menu").removeClass("show");
  $(".pullmenu-icon").removeClass("hide");
  //
  
  
  
  if(index>0) {

    if(index==menu_items_count-1) {
      
        $(".reload i").addClass("anim");
      
        setTimeout(function(){
        $("#menu li").removeClass("show");
        $("#menu").css("transform","translate3d("+getItemX(0)+"px,0,0)");
        $(".reload i").removeClass("anim");
        
        setTimeout(function(){
          
          $("#menu li").eq(0).addClass("show");
        },500);
      },1000);
    
      } else {

        current_index = index;

        $(".pages").addClass("hide");

        setTimeout(function(){


          $(".pages").removeClass("hide");
          $(".page").removeClass("show");
          $(".page").addClass("hide");

          switch($("#menu li").eq(index).attr("data-index")) {
            case '0': 
              console.log("latest");
              $("#latest").removeClass("hide");
              $("#latest").addClass("show"); 
              break;
            case '1': 
              console.log("best");
              $("#best").removeClass("hide");
              $("#best").addClass("show"); 
              break;
            case '2': 
              console.log("archive");
              $("#archive").removeClass("hide");
              $("#archive").addClass("show"); 
              break;
            case '3': 
              console.log("about");
              $("#about").removeClass("hide");
              $("#about").addClass("show"); 
              break;
            }
        },1000);
    }
  }
  }
});

$(document).mousemove(function(e){
  
  $("#menu").removeClass("notrans");
  
  if(mouse_down) {
    
    var diff = Math.max(0, e.pageY - mouse_start_y);
    if(diff>pull_release) diff = pull_release + (diff-pull_release)/(diff*0.01);
  
    $("#header").height(46+diff);

    index = Math.max(0,Math.min(menu_items_count-2, Math.floor((diff-release)/pull_step)));
    if(diff>pull_release+pull_step*2) index = menu_items_count-1;
    
    if(diff>release) {
      $("#menu").addClass("show");
      $(".pullmenu-icon").addClass("hide");
    } else {
        $("#menu").removeClass("show");
      $(".pullmenu-icon").removeClass("hide");
    }
    
    $("#menu").css("transform","translate3d("+getItemX(index)+"px,0,0)");
    $("#menu li").removeClass("show");
    $("#menu li").eq(index).addClass("show");
    
    $(".loader-icon").css("transform", "rotate("+(diff*20)+"deg)");
  }
});

var getItemX = function(index){
  var $item = $("#menu li").eq(index);
  var item_offset = $item.offset().left;
  var item_width = $item.outerWidth();
  var menu_offset = $("#menu").offset().left;
  var screen_width = $("#mobile-screen").width();
  return (menu_offset-item_offset)+(screen_width-item_width)/2;
};
